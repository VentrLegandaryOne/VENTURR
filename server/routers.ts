import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { quoteUploadSchema, contractorRatingSchema, formatZodError } from "./validation";
import { 
  createQuote, 
  getQuoteById, 
  getQuotesByUserId, 
  updateQuoteStatus,
  createVerification,
  getVerificationByQuoteId,
  createReport,
  getReportByVerificationId,
  incrementReportDownloadCount,
  deleteQuoteWithCascade,
  verifyReportOwnership
} from "./db";
import { storagePut } from "./storage";
import { calculateUserAnalytics, getGlobalStats, getSavingsTrendData, getQuoteStatusDistribution } from "./analytics";
import { getOrSetCached, CacheKeys, CacheTTL, invalidateCache } from "./_core/redis";
import {
  createNotification,
  markNotificationRead,
  markAllNotificationsRead,
  getNotificationsByUserId,
  getUnreadNotificationCount,
  getNotificationPreferences,
  updateNotificationPreferences,
} from "./notificationDb";
import {
  createContractor,
  getContractorById,
  searchContractors,
  listContractors,
  createContractorReview,
  getContractorReviews,
  addContractorProject,
  getContractorProjects,
  hasUserReviewedContractor,
} from "./contractorDb";
import { startQuoteProcessingV2 as startQuoteProcessing, getProcessingStatusV2 as getQuoteProcessingStatus } from "./processingServiceV2";
import { createShareLink, getQuoteShares, revokeShareLink, getSharedReport, addComment, getQuoteComments, resolveComment, createNegotiation, getQuoteNegotiations, updateNegotiationStatus } from "./collaboration";
import { createComparisonGroup, addQuoteToComparison, getComparisonGroupById, getComparisonGroupsByUserId, updateComparisonRecommendation, deleteComparisonGroup } from "./comparisonDb";
import { analyzeQuoteComparison } from "./comparisonAnalysis";
import { sendComparisonCompleteEmail } from "./emailNotification";
import { createReview, getReviewsByContractor, getReviewStats, addReviewPhotos, markReviewHelpful, deleteReview, addContractorResponse, updateContractorResponse, deleteContractorResponse, getReviewsPendingResponse } from "./reviewDb";
import { rateLimiters, checkRateLimit } from "./rateLimit";
import { createFeedback, getAllFeedback, getFeedbackById, getFeedbackByUserId, updateFeedbackStatus, getFeedbackStats, deleteFeedback } from "./feedbackDb";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  quotes: router({
    // Free quote check - no signup required
    uploadForFreeCheck: publicProcedure
      .input(z.object({
        fileName: z.string(),
        fileData: z.string(), // Base64 encoded file data
        fileType: z.string(),
      }))
      .mutation(async ({ input }) => {
        // Generate a temporary session ID for anonymous users
        const sessionId = `anon_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        
        // Decode base64 file data
        const base64Data = input.fileData.includes(',') 
          ? input.fileData.split(',')[1] 
          : input.fileData;
        const fileBuffer = Buffer.from(base64Data, 'base64');
        
        // Generate unique file key for anonymous upload
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(7);
        const fileKey = `free-checks/${sessionId}/${timestamp}-${randomSuffix}-${input.fileName}`;
        
        // Upload to S3
        const { url: fileUrl } = await storagePut(fileKey, fileBuffer, input.fileType);
        
        // Create quote record with anonymous user
        const quote = await createQuote({
          userId: sessionId,
          fileName: input.fileName,
          fileKey,
          fileUrl,
          fileType: input.fileType,
          fileSize: fileBuffer.length,
          status: "processing",
          progressPercentage: 0,
          isFreeCheck: 1,
        });
        
        // Process the quote and get basic analysis
        // For free check, we do a simplified analysis
        const { analyzeQuoteForFreeCheck } = await import("./freeCheckAnalysis");
        const analysis = await analyzeQuoteForFreeCheck(quote.id, fileUrl, input.fileType);
        
        return {
          quoteId: String(quote.id),
          trafficLight: analysis.trafficLight,
          insight: analysis.insight,
          contractorName: analysis.contractorName || "Unknown Contractor",
          totalAmount: analysis.totalAmount || 0,
          workType: analysis.workType || "General",
        };
      }),

    // Upload a new quote
    upload: protectedProcedure
      .input(z.object({
        fileName: z.string(),
        fileType: z.string(),
        fileSize: z.number(),
        fileData: z.string(), // Base64 encoded file data
      }))
      .mutation(async ({ ctx, input }) => {
        // Rate limiting: 10 uploads per minute per user
        await rateLimiters.quoteUpload(ctx.user.id);

        // Validate file type and size
        const validationResult = quoteUploadSchema.safeParse({
          fileName: input.fileName,
          fileSize: input.fileSize,
          mimeType: input.fileType,
        });

        if (!validationResult.success) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: formatZodError(validationResult.error),
          });
        }
        // Generate unique file key
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(7);
        const fileKey = `quotes/${ctx.user.id}/${timestamp}-${randomSuffix}-${input.fileName}`;

        // Upload to S3
        const fileBuffer = Buffer.from(input.fileData, 'base64');
        const { url: fileUrl } = await storagePut(fileKey, fileBuffer, input.fileType);

        // Create quote record
        const quote = await createQuote({
          userId: ctx.user.id,
          fileName: input.fileName,
          fileKey,
          fileUrl,
          fileType: input.fileType,
          fileSize: input.fileSize,
          status: "uploaded",
          progressPercentage: 0,
        });

        // Invalidate user analytics cache
        await invalidateCache(CacheKeys.USER_ANALYTICS(ctx.user.id));
        await invalidateCache("global:stats");

        // Start background processing
        console.log(`[Upload] Starting background processing for quote ${quote.id}`);
        startQuoteProcessing(quote.id);

        // Send owner notification for new quote upload
        try {
          const { notifyOwner } = await import("./_core/notification");
          await notifyOwner({
            title: "📄 New Quote Uploaded",
            content: `User ${ctx.user.name || ctx.user.openId} uploaded a new quote:\n\nFile: ${input.fileName}\nSize: ${(input.fileSize / 1024).toFixed(2)} KB\nType: ${input.fileType}\n\nProcessing has started automatically.`,
          });
        } catch (notifError) {
          console.error('[Upload] Failed to send owner notification:', notifError);
        }

        return quote;
      }),

    // Get quote by ID
    getById: protectedProcedure
      .input(z.object({ quoteId: z.number() }))
      .query(async ({ ctx, input }) => {
        const quote = await getQuoteById(input.quoteId);
        
        // Ensure user owns this quote
        if (!quote || quote.userId !== ctx.user.id) {
          throw new Error("Quote not found or access denied");
        }

        return quote;
      }),

    // Get all quotes for current user
    list: protectedProcedure
      .query(async ({ ctx }) => {
        return await getQuotesByUserId(ctx.user.id);
      }),

    // Save quote as draft
    saveDraft: protectedProcedure
      .input(z.object({
        fileName: z.string(),
        fileType: z.string(),
        fileSize: z.number(),
        fileData: z.string(), // Base64 encoded file data
      }))
      .mutation(async ({ ctx, input }) => {
        // Decode base64 file data
        const fileBuffer = Buffer.from(input.fileData, 'base64');
        
        // Generate unique file key
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 9);
        const fileExtension = input.fileName.split('.').pop();
        const fileKey = `${ctx.user.id}/drafts/${timestamp}-${randomSuffix}.${fileExtension}`;
        
        // Upload to S3
        const { url: fileUrl } = await storagePut(fileKey, fileBuffer, input.fileType);
        
        // Create draft quote record
        const quote = await createQuote({
          userId: ctx.user.id,
          fileName: input.fileName,
          fileKey,
          fileUrl,
          fileType: input.fileType,
          fileSize: input.fileSize,
          status: "draft",
          isDraft: 1,
        });
        
        return quote;
      }),

    // Edit existing quote
    edit: protectedProcedure
      .input(z.object({
        quoteId: z.number(),
        fileName: z.string().optional(),
        fileType: z.string().optional(),
        fileSize: z.number().optional(),
        fileData: z.string().optional(), // Base64 encoded file data
      }))
      .mutation(async ({ ctx, input }) => {
        const quote = await getQuoteById(input.quoteId);
        
        // Ensure user owns this quote
        if (!quote || quote.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Quote not found or access denied",
          });
        }

        // Only allow editing drafts or uploaded quotes (not processing/completed)
        if (quote.status !== "draft" && quote.status !== "uploaded") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Can only edit draft or uploaded quotes",
          });
        }

        let fileKey = quote.fileKey;
        let fileUrl = quote.fileUrl;
        
        // If new file data provided, upload to S3
        if (input.fileData && input.fileType) {
          const fileBuffer = Buffer.from(input.fileData, 'base64');
          const timestamp = Date.now();
          const randomSuffix = Math.random().toString(36).substring(2, 9);
          const fileExtension = (input.fileName || quote.fileName).split('.').pop();
          fileKey = `${ctx.user.id}/quotes/${timestamp}-${randomSuffix}.${fileExtension}`;
          
          const uploadResult = await storagePut(fileKey, fileBuffer, input.fileType);
          fileUrl = uploadResult.url;
        }
        
        // Update quote in database
        await updateQuoteStatus(
          input.quoteId,
          quote.status,
          quote.progressPercentage || 0,
          quote.errorMessage || undefined
        );
        
        return { success: true, quoteId: input.quoteId };
      }),

    // Submit draft for processing
    submitDraft: protectedProcedure
      .input(z.object({ quoteId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const quote = await getQuoteById(input.quoteId);
        
        // Ensure user owns this quote
        if (!quote || quote.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Quote not found or access denied",
          });
        }

        // Only allow submitting drafts
        if (quote.status !== "draft") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Can only submit draft quotes",
          });
        }

        // Update status to uploaded and start processing
        await updateQuoteStatus(input.quoteId, "uploaded", 0);
        
        // Start background processing
        startQuoteProcessing(input.quoteId);
        
        return { success: true, quoteId: input.quoteId };
      }),

    // Update quote status (for processing simulation)
    updateStatus: protectedProcedure
      .input(z.object({
        quoteId: z.number(),
        status: z.enum(["draft", "uploaded", "processing", "completed", "failed"]),
        progressPercentage: z.number().optional(),
        errorMessage: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const quote = await getQuoteById(input.quoteId);
        
        // Ensure user owns this quote
        if (!quote || quote.userId !== ctx.user.id) {
          throw new Error("Quote not found or access denied");
        }

        await updateQuoteStatus(
          input.quoteId,
          input.status,
          input.progressPercentage,
          input.errorMessage
        );

        return { success: true };
      }),

    // Get processing status
    getProcessingStatus: protectedProcedure
      .input(z.object({ quoteId: z.number() }))
      .query(async ({ ctx, input }) => {
        const quote = await getQuoteById(input.quoteId);
        
        // Ensure user owns this quote
        if (!quote || quote.userId !== ctx.user.id) {
          throw new Error("Quote not found or access denied");
        }

        return await getQuoteProcessingStatus(input.quoteId);
      }),

    // Retry failed processing
    retry: protectedProcedure
      .input(z.object({ quoteId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const quote = await getQuoteById(input.quoteId);
        
        // Ensure user owns this quote
        if (!quote || quote.userId !== ctx.user.id) {
          throw new Error("Quote not found or access denied");
        }

        // Only retry if failed
        if (quote.status !== "failed") {
          throw new Error("Can only retry failed quotes");
        }

        // Reset status and restart processing
        await updateQuoteStatus(input.quoteId, "uploaded", 0);
        startQuoteProcessing(input.quoteId);

        return { success: true, message: "Processing restarted" };
      }),

    // Delete quote - full cascade deletion with S3 cleanup
    delete: protectedProcedure
      .input(z.object({ quoteId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const quote = await getQuoteById(input.quoteId);
        
        // Ensure user owns this quote
        if (!quote || quote.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Quote not found or access denied" });
        }

        // Perform cascade deletion of all related records
        const { deletedRecords } = await deleteQuoteWithCascade(input.quoteId);

        // Log the deletion for audit trail
        console.log(`[QuoteDelete] User ${ctx.user.id} deleted quote ${input.quoteId}. Records removed:`, deletedRecords);

        return { success: true, deletedRecords };
      }),

    // Share quote - generate shareable link
    share: protectedProcedure
      .input(z.object({ 
        quoteId: z.number(),
        accessLevel: z.enum(["view", "comment", "negotiate"]).optional().default("view"),
        expiresInDays: z.number().optional().default(7),
      }))
      .mutation(async ({ ctx, input }) => {
        const quote = await getQuoteById(input.quoteId);
        
        // Ensure user owns this quote
        if (!quote || quote.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Quote not found or access denied" });
        }

        // Generate share link using existing collaboration system
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + input.expiresInDays);

        const shareLink = await createShareLink({
          quoteId: input.quoteId,
          sharedBy: ctx.user.id,
          accessLevel: input.accessLevel,
          expiresAt,
        });

        return { 
          success: true, 
          shareToken: shareLink.shareToken,
          shareUrl: `${process.env.VITE_APP_URL || 'https://venturr-valdt.manus.space'}/shared/${shareLink.shareToken}`,
          expiresAt: expiresAt,
        };
      }),

    // Export quote as PDF
    exportPDF: protectedProcedure
      .input(z.object({ quoteId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const quote = await getQuoteById(input.quoteId);
        
        // Ensure user owns this quote
        if (!quote || quote.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Quote not found or access denied" });
        }

        // Get verification data
        const verification = await getVerificationByQuoteId(input.quoteId);
        
        // Generate PDF
        const { generateVerificationPDF } = await import("./pdfGenerator");
        const pdfBuffer = await generateVerificationPDF({
          quoteId: quote.id,
          fileName: quote.fileName,
          uploadedAt: quote.createdAt,
          status: quote.status,
          verificationScore: verification?.overallScore,
          pricingAnalysis: verification?.pricingDetails,
          complianceIssues: verification?.complianceDetails?.findings,
          materialVerification: verification?.materialsDetails,
          recommendations: verification?.recommendations?.map(r => r.title + ': ' + r.description),
          userName: ctx.user.name ?? undefined,
          userEmail: ctx.user.email ?? undefined,
        });

        // Upload PDF to S3
        const { storagePut } = await import("./storage");
        const pdfKey = `reports/${ctx.user.id}/${quote.id}/verification-report-${Date.now()}.pdf`;
        const { url: pdfUrl } = await storagePut(pdfKey, pdfBuffer, "application/pdf");

        return {
          success: true,
          pdfUrl,
          fileName: `VENTURR-VALDT-Report-${quote.id}.pdf`,
        };
      }),

    // Export quotes as CSV
    exportCSV: protectedProcedure
      .input(z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        status: z.enum(['pending', 'processing', 'completed', 'failed']).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const quotes = await getQuotesByUserId(ctx.user.id);
        
        // Filter by date and status if provided
        let filteredQuotes = quotes;
        if (input.startDate) {
          filteredQuotes = filteredQuotes.filter(q => new Date(q.createdAt) >= new Date(input.startDate!));
        }
        if (input.endDate) {
          filteredQuotes = filteredQuotes.filter(q => new Date(q.createdAt) <= new Date(input.endDate!));
        }
        if (input.status) {
          filteredQuotes = filteredQuotes.filter(q => q.status === input.status);
        }

        // Get verifications for each quote
        const quotesWithVerifications = await Promise.all(
          filteredQuotes.map(async (quote) => {
            const verification = await getVerificationByQuoteId(quote.id);
            return { quote, verification };
          })
        );

        // Generate CSV content
        const headers = [
          'Quote ID',
          'File Name',
          'Status',
          'Upload Date',
          'Trade Type',
          'Total Amount',
          'Overall Score',
          'Pricing Score',
          'Compliance Score',
          'Materials Score',
          'Recommendations Count',
        ];

        const rows = quotesWithVerifications.map(({ quote, verification }) => {
          const extractedData = quote.extractedData as { contractor?: string; totalAmount?: number; } | null;
          return [
          quote.id,
          quote.fileName,
          quote.status,
          new Date(quote.createdAt).toISOString(),
          extractedData?.contractor || 'N/A',
          extractedData?.totalAmount || 'N/A',
          verification?.overallScore || 'N/A',
          verification?.pricingScore || 'N/A',
          verification?.complianceScore || 'N/A',
          verification?.materialsScore || 'N/A',
          verification?.recommendations?.length || 0,
        ]});

        const csvContent = [
          headers.join(','),
          ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        // Upload CSV to S3
        const csvKey = `exports/${ctx.user.id}/quotes-export-${Date.now()}.csv`;
        const { url: csvUrl } = await storagePut(csvKey, Buffer.from(csvContent), 'text/csv');

        return {
          success: true,
          csvUrl,
          fileName: `VENTURR-Quotes-Export-${new Date().toISOString().split('T')[0]}.csv`,
          recordCount: filteredQuotes.length,
        };
      }),

    // Export quotes as JSON
    exportJSON: protectedProcedure
      .input(z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        status: z.enum(['pending', 'processing', 'completed', 'failed']).optional(),
        includeVerifications: z.boolean().default(true),
      }))
      .mutation(async ({ ctx, input }) => {
        const quotes = await getQuotesByUserId(ctx.user.id);
        
        // Filter by date and status if provided
        let filteredQuotes = quotes;
        if (input.startDate) {
          filteredQuotes = filteredQuotes.filter(q => new Date(q.createdAt) >= new Date(input.startDate!));
        }
        if (input.endDate) {
          filteredQuotes = filteredQuotes.filter(q => new Date(q.createdAt) <= new Date(input.endDate!));
        }
        if (input.status) {
          filteredQuotes = filteredQuotes.filter(q => q.status === input.status);
        }

        // Build export data
        const exportData = await Promise.all(
          filteredQuotes.map(async (quote) => {
            const extractedData = quote.extractedData as { contractor?: string; totalAmount?: number; lineItems?: Array<{ description: string; quantity: number; unitPrice: number; total: number }>; projectAddress?: string; quoteDate?: string; validUntil?: string; } | null;
            const baseData = {
              id: quote.id,
              fileName: quote.fileName,
              status: quote.status,
              uploadDate: quote.createdAt,
              contractorName: extractedData?.contractor || null,
              totalAmount: extractedData?.totalAmount || null,
              projectAddress: extractedData?.projectAddress || null,
              quoteDate: extractedData?.quoteDate || null,
            };

            if (input.includeVerifications) {
              const verification = await getVerificationByQuoteId(quote.id);
              return {
                ...baseData,
                verification: verification ? {
                  overallScore: verification.overallScore,
                  pricingScore: verification.pricingScore,
                  complianceScore: verification.complianceScore,
                  materialsScore: verification.materialsScore,
                  recommendations: verification.recommendations,
                  pricingDetails: verification.pricingDetails,
                  complianceDetails: verification.complianceDetails,
                  materialsDetails: verification.materialsDetails,
                } : null,
              };
            }

            return baseData;
          })
        );

        const jsonContent = JSON.stringify({
          exportDate: new Date().toISOString(),
          exportedBy: ctx.user.email,
          recordCount: exportData.length,
          quotes: exportData,
        }, null, 2);

        // Upload JSON to S3
        const jsonKey = `exports/${ctx.user.id}/quotes-export-${Date.now()}.json`;
        const { url: jsonUrl } = await storagePut(jsonKey, Buffer.from(jsonContent), 'application/json');

        return {
          success: true,
          jsonUrl,
          fileName: `VENTURR-Quotes-Export-${new Date().toISOString().split('T')[0]}.json`,
          recordCount: filteredQuotes.length,
        };
      }),
  }),

  verifications: router({
    // Get verification by quote ID
    getByQuoteId: protectedProcedure
      .input(z.object({ quoteId: z.number() }))
      .query(async ({ ctx, input }) => {
        const quote = await getQuoteById(input.quoteId);
        
        // Ensure user owns this quote
        if (!quote || quote.userId !== ctx.user.id) {
          throw new Error("Quote not found or access denied");
        }

        const verification = await getVerificationByQuoteId(input.quoteId);
        return verification;
      }),

    // Create verification (simulated - in production this would be triggered by background job)
    create: protectedProcedure
      .input(z.object({
        quoteId: z.number(),
        overallScore: z.number(),
        pricingScore: z.number(),
        materialsScore: z.number(),
        complianceScore: z.number(),
        warrantyScore: z.number(),
        statusBadge: z.enum(["green", "amber", "red"]),
        pricingDetails: z.any().optional(),
        materialsDetails: z.any().optional(),
        complianceDetails: z.any().optional(),
        warrantyDetails: z.any().optional(),
        flags: z.any().optional(),
        recommendations: z.any().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const quote = await getQuoteById(input.quoteId);
        
        // Ensure user owns this quote
        if (!quote || quote.userId !== ctx.user.id) {
          throw new Error("Quote not found or access denied");
        }

        const verification = await createVerification(input);
        return verification;
      }),
  }),

  reports: router({
    // Download PDF report
    downloadPDF: protectedProcedure
      .input(z.object({ verificationId: z.number() }))
      .query(async ({ ctx, input }) => {
        const report = await getReportByVerificationId(input.verificationId);
        
        if (!report) {
          throw new Error("Report not found");
        }

        // Get verification to check ownership
        const verification = await getVerificationByQuoteId(report.verificationId);
        if (!verification) {
          throw new Error("Verification not found");
        }

        // Get quote to verify ownership
        const quote = await getQuoteById(verification.quoteId);
        if (!quote || quote.userId !== ctx.user.id) {
          throw new Error("Access denied");
        }

        // Increment download count
        await incrementReportDownloadCount(report.id);

        return {
          pdfUrl: report.pdfUrl,
          fileName: `VENTURR-Report-${report.id}.pdf`,
        };
      }),

    // Get report by verification ID
    getByVerificationId: protectedProcedure
      .input(z.object({ verificationId: z.number() }))
      .query(async ({ ctx, input }) => {
        // Verify ownership through the chain: quote -> verification -> report
        const ownership = await verifyReportOwnership(input.verificationId, ctx.user.id);
        if (!ownership.owned) {
          throw new TRPCError({ 
            code: "FORBIDDEN", 
            message: "You do not have access to this report" 
          });
        }

        const report = await getReportByVerificationId(input.verificationId);
        return report;
      }),

    // Generate court-defensible VALIDT report
    generateValidtReport: protectedProcedure
      .input(z.object({ quoteId: z.number() }))
      .query(async ({ ctx, input }) => {
        const { generateValidtReport } = await import('./validtReportService');
        const { getDb } = await import('./db');
        const { sql } = await import('drizzle-orm');
        
        try {
          // Find verification by quoteId
          const db = await getDb();
          if (!db) throw new Error('Database connection failed');
          const verificationResult = await db.execute(
            sql`SELECT id FROM verifications WHERE quoteId = ${input.quoteId} LIMIT 1`
          );
          const rows = verificationResult[0] as unknown as any[];
          const verificationRow = rows?.[0];
          
          if (!verificationRow) {
            throw new Error('Verification not found for this quote');
          }
          
          const report = await generateValidtReport(verificationRow.id);
          return report;
        } catch (error) {
          console.error('[generateValidtReport] Error:', error);
          throw new Error('Failed to generate VALIDT report');
        }
      }),

    // Create report (simulated - in production this would be generated as PDF)
    create: protectedProcedure
      .input(z.object({
        verificationId: z.number(),
        pdfKey: z.string(),
        pdfUrl: z.string(),
        pdfSize: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const report = await createReport(input);
        return report;
      }),

    // Increment download count
    incrementDownload: protectedProcedure
      .input(z.object({ reportId: z.number() }))
      .mutation(async ({ input }) => {
        await incrementReportDownloadCount(input.reportId);
        return { success: true };
      }),

    // Generate branded legal PDF
    downloadBrandedPdf: protectedProcedure
      .input(z.object({ quoteId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { generateValidtReport } = await import('./validtReportService');
        const { generateBrandedPdf } = await import('./brandedPdfGenerator');
        const { storagePut } = await import('./storage');
        const { getDb } = await import('./db');
        const { sql } = await import('drizzle-orm');
        
        // Verify quote ownership
        const quote = await getQuoteById(input.quoteId);
        if (!quote || quote.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to access this quote" });
        }

        // Find verification
        const db = await getDb();
        if (!db) throw new Error('Database connection failed');
        const verificationResult = await db.execute(
          sql`SELECT id FROM verifications WHERE quoteId = ${input.quoteId} LIMIT 1`
        );
        const rows = verificationResult[0] as unknown as any[];
        const verificationRow = rows?.[0];
        
        if (!verificationRow) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Verification not found for this quote" });
        }

        // Generate VALIDT report data
        const reportData = await generateValidtReport(verificationRow.id);
        
        // Generate branded PDF
        const pdfBuffer = await generateBrandedPdf(reportData);
        
        // Upload to S3
        const timestamp = Date.now();
        const pdfKey = `reports/${ctx.user.id}/${quote.id}/branded-legal-report-${timestamp}.pdf`;
        const { url: pdfUrl } = await storagePut(pdfKey, pdfBuffer, 'application/pdf');
        
        // Extract contractor name for filename
        const contractorName = reportData.coverPage.contractorName
          .replace(/[^a-zA-Z0-9]/g, '-')
          .substring(0, 30);
        
        return {
          success: true,
          pdfUrl,
          fileName: `VENTURR-VALDT-${contractorName}-${reportData.coverPage.reportId}.pdf`,
          reportId: reportData.coverPage.reportId,
        };
      }),
  }),

  // Sharing and collaboration
  sharing: router({
    createLink: protectedProcedure
      .input(z.object({
        quoteId: z.number(),
        sharedWith: z.string().email().optional(),
        accessLevel: z.enum(["view", "comment", "negotiate"]),
        expiresInDays: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Verify quote ownership
        const quote = await getQuoteById(input.quoteId);
        if (!quote || quote.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" });
        }

        const expiresAt = input.expiresInDays
          ? new Date(Date.now() + input.expiresInDays * 24 * 60 * 60 * 1000)
          : undefined;

        return await createShareLink({
          quoteId: input.quoteId,
          sharedBy: ctx.user.id,
          sharedWith: input.sharedWith,
          accessLevel: input.accessLevel,
          expiresAt,
        });
      }),

    listShares: protectedProcedure
      .input(z.object({ quoteId: z.number() }))
      .query(async ({ ctx, input }) => {
        // Verify quote ownership
        const quote = await getQuoteById(input.quoteId);
        if (!quote || quote.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" });
        }

        return await getQuoteShares(input.quoteId);
      }),

    revokeLink: protectedProcedure
      .input(z.object({ shareId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await revokeShareLink(input.shareId, ctx.user.id);
        return { success: true };
      }),

    getShared: publicProcedure
      .input(z.object({ shareToken: z.string() }))
      .query(async ({ input }) => {
        const share = await getSharedReport(input.shareToken);
        if (!share) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Share link not found or expired" });
        }
        return share;
      }),
  }),

  // Comments
  comments: router({
    add: protectedProcedure
      .input(z.object({
        quoteId: z.number(),
        section: z.string(),
        content: z.string(),
        parentId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await addComment({
          quoteId: input.quoteId,
          userId: ctx.user.id,
          section: input.section,
          content: input.content,
          parentId: input.parentId,
        });
      }),

    list: protectedProcedure
      .input(z.object({
        quoteId: z.number(),
        section: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await getQuoteComments(input.quoteId, input.section);
      }),

    resolve: protectedProcedure
      .input(z.object({ commentId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await resolveComment(input.commentId, ctx.user.id);
        return { success: true };
      }),
  }),

  // Negotiations
  negotiations: router({
    create: protectedProcedure
      .input(z.object({
        quoteId: z.number(),
        originalPrice: z.number(),
        proposedPrice: z.number(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await createNegotiation({
          quoteId: input.quoteId,
          proposedBy: ctx.user.id,
          originalPrice: input.originalPrice,
          proposedPrice: input.proposedPrice,
          notes: input.notes,
        });
      }),

    list: protectedProcedure
      .input(z.object({ quoteId: z.number() }))
      .query(async ({ input }) => {
        return await getQuoteNegotiations(input.quoteId);
      }),

    updateStatus: protectedProcedure
      .input(z.object({
        negotiationId: z.number(),
        status: z.enum(["pending", "accepted", "rejected", "countered"]),
      }))
      .mutation(async ({ ctx, input }) => {
        await updateNegotiationStatus(input.negotiationId, input.status, ctx.user.id);
        return { success: true };
      }),
  }),

  // Comparison router
  comparisons: router({
    // Create a new comparison group
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        quoteIds: z.array(z.number()).min(2).max(5),
      }))
      .mutation(async ({ ctx, input }) => {
        // Create comparison group
        const group = await createComparisonGroup({
          userId: ctx.user.id,
          name: input.name,
          description: input.description,
          status: "draft",
        });

        // Add quotes to comparison
        for (let i = 0; i < input.quoteIds.length; i++) {
          await addQuoteToComparison({
            groupId: group.insertId,
            quoteId: input.quoteIds[i],
            position: i + 1,
            label: `Option ${String.fromCharCode(65 + i)}`, // A, B, C
          });
        }

        // Start analysis in background
        setTimeout(async () => {
          try {
            const fullGroup = await getComparisonGroupById(group.insertId);
            if (!fullGroup) return;

            const quotesWithVerifications = fullGroup.quotes.map(q => ({
              ...q,
              verification: fullGroup.verifications.find(v => v.quoteId === q.id),
            }));

            const analysis = await analyzeQuoteComparison(quotesWithVerifications);
            
            await updateComparisonRecommendation(
              group.insertId,
              analysis,
              "completed"
            );

            // Send email notification
            try {
              const bestQuote = quotesWithVerifications.find(q => q.id === analysis.bestQuoteId);
              await sendComparisonCompleteEmail(
                ctx.user.name || "User",
                ctx.user.openId,
                input.name,
                input.quoteIds.length,
                bestQuote?.extractedData?.contractor || null,
                (analysis as any).potentialSavings || 0,
                `/comparison/${group.insertId}`,
                group.insertId
              );
            } catch (emailError) {
              console.error("[Comparison] Email notification failed:", emailError);
            }
          } catch (error) {
            console.error("[Comparison] Analysis failed:", error);
          }
        }, 100);

        return { id: group.insertId, status: "analyzing" };
      }),

    // Get comparison by ID
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const group = await getComparisonGroupById(input.id);
        if (!group || group.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        return group;
      }),

    // List all comparisons for user
    list: protectedProcedure
      .query(async ({ ctx }) => {
        return await getComparisonGroupsByUserId(ctx.user.id);
      }),

    // Delete comparison
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const group = await getComparisonGroupById(input.id);
        if (!group || group.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        await deleteComparisonGroup(input.id);
        return { success: true };
      }),

    // Generate PDF comparison report
    exportPdf: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const group = await getComparisonGroupById(input.id);
        if (!group || group.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Comparison not found" });
        }
        const { generateComparisonPdf, prepareQuoteDataForPdf } = await import("./comparisonPdfGenerator");
        const quotesData = prepareQuoteDataForPdf(group.quotes, group.verifications);
        const analysis = group.recommendation ? (group.recommendation as any) : null;
        const pdfBuffer = generateComparisonPdf(
          group.name,
          quotesData,
          analysis,
          new Date()
        );
        // Upload to S3
        const { storagePut } = await import("./storage");
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const fileKey = `comparison-reports/${ctx.user.id}-${input.id}-${timestamp}-${randomSuffix}.pdf`;
        const { url } = await storagePut(fileKey, pdfBuffer, "application/pdf");
        return { url, fileName: `VENTURR-VALDT-Comparison-${group.name.replace(/[^a-zA-Z0-9]/g, "-")}.pdf` };
      }),
  }),

  // Analytics router
  analytics: router({
    getUserAnalytics: protectedProcedure.query(async ({ ctx }) => {
      return await getOrSetCached(
        CacheKeys.USER_ANALYTICS(ctx.user.id),
        CacheTTL.USER_ANALYTICS,
        () => calculateUserAnalytics(ctx.user.id)
      );
    }),
    getGlobalStats: publicProcedure.query(async () => {
      return await getOrSetCached(
        "global:stats",
        CacheTTL.USER_STATS,
        () => getGlobalStats()
      );
    }),
    getSavingsTrend: protectedProcedure.query(async ({ ctx }) => {
      return await getSavingsTrendData(ctx.user.id);
    }),
    getStatusDistribution: protectedProcedure.query(async ({ ctx }) => {
      return await getQuoteStatusDistribution(ctx.user.id);
    }),

    // Get cost trends
    getCostTrends: protectedProcedure
      .input(z.object({
        days: z.number().optional().default(30),
      }))
      .query(async ({ ctx, input }) => {
        const { getCostTrends } = await import("./analyticsDb");
        return await getCostTrends(ctx.user.id, input.days);
      }),

    // Get savings breakdown
    getSavingsBreakdown: protectedProcedure
      .query(async ({ ctx }) => {
        const { getSavingsBreakdown } = await import("./analyticsDb");
        return await getSavingsBreakdown(ctx.user.id);
      }),

    // Get top contractors
    getTopContractors: publicProcedure
      .input(z.object({
        limit: z.number().optional().default(10),
      }))
      .query(async ({ input }) => {
        const { getTopContractors } = await import("./analyticsDb");
        return await getTopContractors(input.limit);
      }),

    // Get key metrics
    getKeyMetrics: protectedProcedure
      .query(async ({ ctx }) => {
        const { getKeyMetrics } = await import("./analyticsDb");
        return await getKeyMetrics(ctx.user.id);
      }),
  }),

  // Notification router
  notifications: router({
    // Get all notifications
    list: protectedProcedure
      .input(z.object({ limit: z.number().optional().default(50) }).optional())
      .query(async ({ ctx, input }) => {
        return await getNotificationsByUserId(ctx.user.id, input?.limit);
      }),

    // Get unread count
    getUnreadCount: protectedProcedure
      .query(async ({ ctx }) => {
        return await getUnreadNotificationCount(ctx.user.id);
      }),

    // Mark as read
    markRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return await markNotificationRead(input.id, ctx.user.id);
      }),

    // Mark all as read
    markAllRead: protectedProcedure
      .mutation(async ({ ctx }) => {
        return await markAllNotificationsRead(ctx.user.id);
      }),

    // Get preferences
    getPreferences: protectedProcedure
      .query(async ({ ctx }) => {
        return await getNotificationPreferences(ctx.user.id);
      }),

    // Update preferences
    updatePreferences: protectedProcedure
      .input(z.object({
        emailEnabled: z.boolean().optional(),
        emailDigestFrequency: z.enum(["instant", "daily", "weekly", "never"]).optional(),
        pushEnabled: z.boolean().optional(),
        categories: z.object({
          verification_complete: z.boolean().optional(),
          unusual_pricing: z.boolean().optional(),
          compliance_warning: z.boolean().optional(),
          comparison_ready: z.boolean().optional(),
          contractor_review: z.boolean().optional(),
          system_alert: z.boolean().optional(),
        }).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await updateNotificationPreferences(ctx.user.id, input);
      }),

    // Subscribe to push notifications
    subscribePush: protectedProcedure
      .input(z.object({
        endpoint: z.string().url(),
        keys: z.object({
          p256dh: z.string(),
          auth: z.string(),
        }),
      }))
      .mutation(async ({ ctx, input }) => {
        const { savePushSubscription } = await import("./pushNotificationService");
        return await savePushSubscription(ctx.user.id, input);
      }),

    // Unsubscribe from push notifications
    unsubscribePush: protectedProcedure
      .mutation(async ({ ctx }) => {
        const { removePushSubscription } = await import("./pushNotificationService");
        return await removePushSubscription(ctx.user.id);
      }),
  }),

  // Quote annotations router
  annotations: router({
    // List annotations for a quote
    list: protectedProcedure
      .input(z.object({ quoteId: z.number() }))
      .query(async ({ ctx, input }) => {
        const { getDb } = await import("./db");
        const db = await getDb();
        if (!db) return [];
        const { quoteAnnotations } = await import("../drizzle/schema");
        const { eq, and, desc } = await import("drizzle-orm");
        return await db
          .select()
          .from(quoteAnnotations)
          .where(and(
            eq(quoteAnnotations.quoteId, input.quoteId),
            eq(quoteAnnotations.userId, ctx.user.id)
          ))
          .orderBy(desc(quoteAnnotations.isPinned), desc(quoteAnnotations.createdAt));
      }),

    // Create annotation
    create: protectedProcedure
      .input(z.object({
        quoteId: z.number(),
        content: z.string().min(1).max(2000),
        section: z.string().optional(),
        color: z.enum(["yellow", "blue", "green", "red", "purple"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { getDb } = await import("./db");
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { quoteAnnotations } = await import("../drizzle/schema");
        const [result] = await db.insert(quoteAnnotations).values({
          quoteId: input.quoteId,
          userId: ctx.user.id,
          content: input.content,
          section: input.section || null,
          color: input.color || "yellow",
          isPinned: false,
        });
        return { id: result.insertId, success: true };
      }),

    // Update annotation
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        content: z.string().min(1).max(2000).optional(),
        color: z.enum(["yellow", "blue", "green", "red", "purple"]).optional(),
        isPinned: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { getDb } = await import("./db");
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { quoteAnnotations } = await import("../drizzle/schema");
        const { eq, and } = await import("drizzle-orm");
        const updateData: any = {};
        if (input.content !== undefined) updateData.content = input.content;
        if (input.color !== undefined) updateData.color = input.color;
        if (input.isPinned !== undefined) updateData.isPinned = input.isPinned;
        await db
          .update(quoteAnnotations)
          .set(updateData)
          .where(and(
            eq(quoteAnnotations.id, input.id),
            eq(quoteAnnotations.userId, ctx.user.id)
          ));
        return { success: true };
      }),

    // Delete annotation
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { getDb } = await import("./db");
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { quoteAnnotations } = await import("../drizzle/schema");
        const { eq, and } = await import("drizzle-orm");
        await db
          .delete(quoteAnnotations)
          .where(and(
            eq(quoteAnnotations.id, input.id),
            eq(quoteAnnotations.userId, ctx.user.id)
          ));
        return { success: true };
      }),
  }),

  // Contractor router
  contractors: router({
    // Create contractor
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        website: z.string().url().optional(),
        businessAddress: z.string().optional(),
        licenseNumber: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await createContractor(input);
      }),

    // Get contractor by ID
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const contractor = await getContractorById(input.id);
        if (!contractor) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Contractor not found" });
        }
        return contractor;
      }),

    // Search contractors
    search: publicProcedure
      .input(z.object({
        query: z.string(),
        limit: z.number().optional().default(20),
      }))
      .query(async ({ input }) => {
        return await searchContractors(input.query, input.limit);
      }),

    // List contractors
    list: publicProcedure
      .input(z.object({
        limit: z.number().optional().default(20),
        offset: z.number().optional().default(0),
        verified: z.boolean().optional(),
        minRating: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        const params = input || {};
        const cacheKey = `${CacheKeys.CONTRACTOR_LEADERBOARD()}:${JSON.stringify(params)}`;
        return await getOrSetCached(
          cacheKey,
          CacheTTL.CONTRACTOR_LEADERBOARD,
          () => listContractors(params)
        );
      }),

    // Create review with multi-dimensional ratings
    createReview: protectedProcedure
      .input(z.object({
        contractorId: z.number(),
        quoteId: z.number().optional(),
        rating: z.number().min(1).max(5),
        qualityScore: z.number().min(0).max(100),
        valueScore: z.number().min(0).max(100),
        communicationScore: z.number().min(0).max(100),
        timelinessScore: z.number().min(0).max(100),
        comment: z.string(),
        photoUrls: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check if user already reviewed
        const hasReviewed = await hasUserReviewedContractor(ctx.user.id, input.contractorId);
        if (hasReviewed) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "You have already reviewed this contractor" });
        }

        const review = await createReview({
          contractorId: input.contractorId,
          userId: ctx.user.id,
          quoteId: input.quoteId || null,
          rating: input.rating,
          qualityScore: input.qualityScore,
          valueScore: input.valueScore,
          communicationScore: input.communicationScore,
          timelinessScore: input.timelinessScore,
          comment: input.comment,
          isVerified: !!input.quoteId,
        });

        // Add photos if provided
        if (input.photoUrls && input.photoUrls.length > 0 && review) {
          // @ts-ignore - review might not have id property from insert result
          const reviewId = review.id || review.insertId;
          if (reviewId) {
            await addReviewPhotos(Number(reviewId), input.photoUrls);
          }
        }

        // Send owner notification for new review
        try {
          const { notifyOwner } = await import("./_core/notification");
          const contractor = await getContractorById(input.contractorId);
          const stars = "⭐".repeat(input.rating);
          const verifiedBadge = input.quoteId ? " ✅ Verified" : "";
          await notifyOwner({
            title: `${stars} New Contractor Review${verifiedBadge}`,
            content: `New review for ${contractor?.name || "contractor"}\n\nRating: ${input.rating}/5 stars\n\nScores:\n• Quality: ${input.qualityScore}/100\n• Value: ${input.valueScore}/100\n• Communication: ${input.communicationScore}/100\n• Timeliness: ${input.timelinessScore}/100\n\nComment: "${input.comment.substring(0, 200)}${input.comment.length > 200 ? "..." : ""}"`,
          });
        } catch (notifError) {
          console.error('[Review] Failed to send owner notification:', notifError);
        }

        return review;
      }),

    // Legacy rate procedure (kept for backward compatibility)
    rate: protectedProcedure
      .input(z.object({
        contractorId: z.number(),
        quoteId: z.number().optional(),
        rating: z.number().min(1).max(5),
        comment: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check if user already reviewed
        const hasReviewed = await hasUserReviewedContractor(ctx.user.id, input.contractorId);
        if (hasReviewed) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "You have already reviewed this contractor" });
        }

        return await createContractorReview({
          contractorId: input.contractorId,
          userId: ctx.user.id,
          quoteId: input.quoteId,
          rating: input.rating,
          comment: input.comment,
          verified: !!input.quoteId,
        });
      }),

    // Get contractor reviews
    getReviews: publicProcedure
      .input(z.object({
        contractorId: z.number(),
        limit: z.number().optional().default(20),
      }))
      .query(async ({ input }) => {
        return await getContractorReviews(input.contractorId, input.limit);
      }),

    // Get review statistics
    getReviewStats: publicProcedure
      .input(z.object({ contractorId: z.number() }))
      .query(async ({ input }) => {
        return await getReviewStats(input.contractorId);
      }),

    // Mark review as helpful
    markHelpful: protectedProcedure
      .input(z.object({ reviewId: z.number() }))
      .mutation(async ({ input }) => {
        await markReviewHelpful(input.reviewId);
        return { success: true };
      }),

    // Delete review
    deleteReview: protectedProcedure
      .input(z.object({ reviewId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await deleteReview(input.reviewId, ctx.user.id);
        return { success: true };
      }),

    // Add contractor response to a review
    addResponse: protectedProcedure
      .input(z.object({
        reviewId: z.number(),
        contractorId: z.number(),
        response: z.string().min(10).max(2000),
      }))
      .mutation(async ({ input }) => {
        return await addContractorResponse(input.reviewId, input.contractorId, input.response);
      }),

    // Update contractor response
    updateResponse: protectedProcedure
      .input(z.object({
        reviewId: z.number(),
        contractorId: z.number(),
        response: z.string().min(10).max(2000),
      }))
      .mutation(async ({ input }) => {
        return await updateContractorResponse(input.reviewId, input.contractorId, input.response);
      }),

    // Delete contractor response
    deleteResponse: protectedProcedure
      .input(z.object({
        reviewId: z.number(),
        contractorId: z.number(),
      }))
      .mutation(async ({ input }) => {
        return await deleteContractorResponse(input.reviewId, input.contractorId);
      }),

    // Get reviews pending response for a contractor
    getPendingResponses: protectedProcedure
      .input(z.object({ contractorId: z.number() }))
      .query(async ({ input }) => {
        return await getReviewsPendingResponse(input.contractorId);
      }),

    // Get contractor projects
    getProjects: publicProcedure
      .input(z.object({ contractorId: z.number() }))
      .query(async ({ input }) => {
        return await getContractorProjects(input.contractorId);
      }),

    // Check if user has reviewed
    hasReviewed: protectedProcedure
      .input(z.object({ contractorId: z.number() }))
      .query(async ({ ctx, input }) => {
        return await hasUserReviewedContractor(ctx.user.id, input.contractorId);
      }),

    // Portfolio Projects
    getPortfolioProjects: publicProcedure
      .input(z.object({ contractorId: z.number() }))
      .query(async ({ input }) => {
        const { getContractorProjects: getPortfolio } = await import("./portfolioDb");
        return await getPortfolio(input.contractorId);
      }),

    // Certifications
    getCertifications: publicProcedure
      .input(z.object({ contractorId: z.number() }))
      .query(async ({ input }) => {
        const { getActiveCertifications } = await import("./portfolioDb");
        return await getActiveCertifications(input.contractorId);
      }),

    // Contractor Comparison
    addToComparison: protectedProcedure
      .input(z.object({ contractorId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { addToComparison } = await import("./contractorComparisonDb");
        return await addToComparison(ctx.user.id, input.contractorId);
      }),

    removeFromComparison: protectedProcedure
      .input(z.object({ contractorId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { removeFromComparison } = await import("./contractorComparisonDb");
        return await removeFromComparison(ctx.user.id, input.contractorId);
      }),

    getComparisonList: protectedProcedure
      .query(async ({ ctx }) => {
        const { getComparisonList } = await import("./contractorComparisonDb");
        return await getComparisonList(ctx.user.id);
      }),

    getDetailedComparison: protectedProcedure
      .query(async ({ ctx }) => {
        const { getDetailedComparison } = await import("./contractorComparisonDb");
        return await getDetailedComparison(ctx.user.id);
      }),

    clearComparison: protectedProcedure
      .mutation(async ({ ctx }) => {
        const { clearComparison } = await import("./contractorComparisonDb");
        return await clearComparison(ctx.user.id);
      }),

    isInComparison: protectedProcedure
      .input(z.object({ contractorId: z.number() }))
      .query(async ({ ctx, input }) => {
        const { isInComparison } = await import("./contractorComparisonDb");
        return await isInComparison(ctx.user.id, input.contractorId);
      }),

    // Get contractor recommendations based on criteria
    getRecommendations: protectedProcedure
      .input(z.object({
        projectType: z.string().optional(),
        location: z.string().optional(),
        budget: z.number().optional(),
        limit: z.number().min(1).max(10).default(5),
      }))
      .query(async ({ ctx, input }) => {
        const { getContractorRecommendations } = await import("./recommendationDb");
        return await getContractorRecommendations({
          projectType: input.projectType,
          location: input.location,
          budget: input.budget,
          userId: ctx.user.id,
        }, input.limit);
      }),

    // Get recommendations for a specific quote
    getRecommendationsForQuote: protectedProcedure
      .input(z.object({
        quoteId: z.number(),
        limit: z.number().min(1).max(10).default(5),
      }))
      .query(async ({ ctx, input }) => {
        const { getRecommendationsForQuote } = await import("./recommendationDb");
        return await getRecommendationsForQuote(input.quoteId, ctx.user.id, input.limit);
      }),

    // Get top contractors by category
    getTopByCategory: publicProcedure
      .input(z.object({
        category: z.string(),
        limit: z.number().min(1).max(10).default(3),
      }))
      .query(async ({ input }) => {
        const { getTopContractorsByCategory } = await import("./recommendationDb");
        return await getTopContractorsByCategory(input.category, input.limit);
      }),

    // Create a shareable link for comparison
    createComparisonShare: protectedProcedure
      .input(z.object({
        contractorIds: z.array(z.number()).min(2).max(4),
        title: z.string().optional(),
        notes: z.string().optional(),
        expiresInDays: z.number().min(1).max(90).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { createComparisonShare } = await import("./comparisonShareDb");
        return await createComparisonShare({
          userId: ctx.user.id,
          contractorIds: input.contractorIds,
          title: input.title,
          notes: input.notes,
          expiresInDays: input.expiresInDays,
        });
      }),

    // Get shared comparison by token (public)
    getSharedComparison: publicProcedure
      .input(z.object({ shareToken: z.string() }))
      .query(async ({ input }) => {
        console.log("[getSharedComparison] Token received:", input.shareToken);
        try {
          const { getSharedComparisonDetails } = await import("./comparisonShareDb");
          const result = await getSharedComparisonDetails(input.shareToken);
          console.log("[getSharedComparison] Result:", result ? "Found" : "Not found", result?.contractors?.length || 0, "contractors");
          return result;
        } catch (error) {
          console.error("[getSharedComparison] Error:", error);
          throw error;
        }
      }),

    // Get user's shared comparisons
    getMyShares: protectedProcedure
      .query(async ({ ctx }) => {
        const { getUserShares } = await import("./comparisonShareDb");
        return await getUserShares(ctx.user.id);
      }),

    // Delete a shared comparison
    deleteShare: protectedProcedure
      .input(z.object({ shareToken: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const { deleteComparisonShare } = await import("./comparisonShareDb");
        return await deleteComparisonShare(ctx.user.id, input.shareToken);
      }),

    // Performance analytics
    getPerformance: publicProcedure
      .input(z.object({
        contractorId: z.number(),
        periodStart: z.date().optional(),
        periodEnd: z.date().optional(),
      }))
      .query(async ({ input }) => {
        const { getContractorPerformance } = await import("./contractorPerformanceDb");
        return await getContractorPerformance(input.contractorId, input.periodStart, input.periodEnd);
      }),

    getPerformanceTrends: publicProcedure
      .input(z.object({
        contractorId: z.number(),
        months: z.number().optional().default(6),
      }))
      .query(async ({ input }) => {
        const { getContractorPerformanceTrends } = await import("./contractorPerformanceDb");
        return await getContractorPerformanceTrends(input.contractorId, input.months);
      }),

    comparePerformance: publicProcedure
      .input(z.object({
        contractorIds: z.array(z.number()).min(2).max(10),
      }))
      .query(async ({ input }) => {
        const { compareContractorsPerformance } = await import("./contractorPerformanceDb");
        return await compareContractorsPerformance(input.contractorIds);
      }),

    getTopPerformers: publicProcedure
      .input(z.object({
        metric: z.enum(["complianceScore", "quoteAccuracyScore", "completionRate", "averageRating"]),
        limit: z.number().optional().default(10),
      }))
      .query(async ({ input }) => {
        const { getTopContractorsByMetric } = await import("./contractorPerformanceDb");
        return await getTopContractorsByMetric(input.metric, input.limit);
      }),
  }),

  // Templates router
  templates: router({
    // List all templates with optional category filter
    list: publicProcedure
      .input(z.object({
        category: z.string().optional(),
      }).optional())
      .query(async ({ input }) => {
        const { listTemplates } = await import("./templateDb");
        return await listTemplates(input?.category);
      }),

    // Get template by ID
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const { getTemplateById } = await import("./templateDb");
        return await getTemplateById(input.id);
      }),

    // Get all unique categories
    getCategories: publicProcedure
      .query(async () => {
        const { getTemplateCategories } = await import("./templateDb");
        return await getTemplateCategories();
      }),

    // Create new template (admin only)
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        category: z.string(),
        description: z.string(),
        specifications: z.object({
          materials: z.array(z.string()),
          dimensions: z.string(),
          workmanship: z.string(),
          duration: z.string(),
          standards: z.array(z.string()),
        }),
        complianceRequirements: z.object({
          buildingCode: z.string(),
          standards: z.array(z.string()),
          permits: z.string(),
          insurance: z.string(),
          licensing: z.string(),
        }),
        estimatedCost: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const { createTemplate } = await import("./templateDb");
        return await createTemplate(input);
      }),

    // Delete template (admin only)
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const { deleteTemplate } = await import("./templateDb");
        return await deleteTemplate(input.id);
      }),

    // Record template usage
    use: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const { incrementTemplateUsage } = await import("./templateDb");
        return await incrementTemplateUsage(input.id);
      }),
  }),

  // Market Rates Router
  marketRates: router({
    // Get rates by city and trade
    getRates: publicProcedure
      .input(z.object({
        city: z.enum(['sydney', 'melbourne', 'brisbane', 'adelaide', 'perth']),
        trade: z.enum(['electrician', 'plumber', 'roofer', 'builder', 'landscaper']),
      }))
      .query(async ({ input }) => {
        const { getMarketRates } = await import('./marketRatesService');
        return await getMarketRates(input.city, input.trade);
      }),

    // Get regional adjustment for postcode
    getRegionalAdjustment: publicProcedure
      .input(z.object({ postcode: z.string() }))
      .query(async ({ input }) => {
        const { getRegionalAdjustment } = await import('./marketRatesService');
        return await getRegionalAdjustment(input.postcode);
      }),

    // Compare price against market
    comparePrice: publicProcedure
      .input(z.object({
        itemCode: z.string(),
        quotedPrice: z.number(),
        city: z.enum(['sydney', 'melbourne', 'brisbane', 'adelaide', 'perth']),
        trade: z.enum(['electrician', 'plumber', 'roofer', 'builder', 'landscaper']),
        postcode: z.string().optional(),
      }))
      .query(async ({ input }) => {
        const { comparePrice } = await import('./marketRatesService');
        return await comparePrice(input.itemCode, input.quotedPrice, input.city, input.trade, input.postcode);
      }),

    // Get available cities
    getAvailableCities: publicProcedure
      .query(async () => {
        const { getAvailableCities } = await import('./marketRatesService');
        return await getAvailableCities();
      }),

    // Get summary for dashboard
    getSummary: publicProcedure
      .query(async () => {
        const { getMarketRateSummary } = await import('./marketRatesService');
        return await getMarketRateSummary();
      }),
  }),

  // Credential Verification Router
  credentials: router({
    // Verify ABN
    verifyABN: publicProcedure
      .input(z.object({ abn: z.string() }))
      .query(async ({ input }) => {
        const { verifyABN } = await import('./credentialService');
        return await verifyABN(input.abn);
      }),

    // Verify license
    verifyLicense: publicProcedure
      .input(z.object({
        licenseNumber: z.string(),
        state: z.enum(['nsw', 'vic', 'qld', 'sa', 'wa', 'tas', 'nt', 'act']),
      }))
      .query(async ({ input }) => {
        const { verifyLicense } = await import('./credentialService');
        return await verifyLicense(input.licenseNumber, input.state);
      }),

    // Get insurance requirements
    getInsuranceRequirements: publicProcedure
      .input(z.object({
        trade: z.string(),
        state: z.enum(['nsw', 'vic', 'qld', 'sa', 'wa', 'tas', 'nt', 'act']),
      }))
      .query(async ({ input }) => {
        const { getInsuranceRequirements } = await import('./credentialService');
        return await getInsuranceRequirements(input.trade, input.state);
      }),

    // Get licensing authorities
    getLicensingAuthorities: publicProcedure
      .query(async () => {
        const { getAllLicensingAuthorities } = await import('./credentialService');
        return await getAllLicensingAuthorities();
      }),

    // Store contractor credential (protected)
    storeCredential: protectedProcedure
      .input(z.object({
        contractorName: z.string(),
        abn: z.string(),
        licenseNumber: z.string().optional(),
        licenseState: z.enum(['nsw', 'vic', 'qld', 'sa', 'wa', 'tas', 'nt', 'act']).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { storeContractorCredential } = await import('./credentialService');
        const id = await storeContractorCredential({
          contractorName: input.contractorName,
          abn: input.abn,
          licenseNumber: input.licenseNumber || null,
          licenseState: input.licenseState || null,
          insuranceExpiry: null,
          verificationStatus: 'pending',
          lastVerified: null
        });
        return { success: !!id, id };
      }),

    // Get user's stored credentials
    getUserCredentials: protectedProcedure
      .query(async ({ ctx }) => {
        const { getContractorByABN } = await import('./credentialService');
        // Return empty array for now - user credentials would need a user_id field
        return [];
      }),
  }),

  // Australian Standards Router
  standards: router({
    // Get all standards
    getAll: publicProcedure
      .input(z.object({
        category: z.string().optional(),
        trade: z.string().optional(),
      }).optional())
      .query(async ({ input }) => {
        const { getDb } = await import('./db');
        const { sql } = await import('drizzle-orm');
        const db = await getDb();
        if (!db) return [];
        
        let query = 'SELECT * FROM australian_standards WHERE 1=1';
        const params: string[] = [];
        
        if (input?.category) {
          query += ' AND category = ?';
          params.push(input.category);
        }
        if (input?.trade) {
          query += ' AND trade = ?';
          params.push(input.trade);
        }
        query += ' ORDER BY standard_code';
        
        const result = await db.execute(sql.raw(query));
        return (result as any)[0] || [];
      }),

    // Get standard by code
    getByCode: publicProcedure
      .input(z.object({ code: z.string() }))
      .query(async ({ input }) => {
        const { getDb } = await import('./db');
        const { sql } = await import('drizzle-orm');
        const db = await getDb();
        if (!db) return null;
        
        const result = await db.execute(sql`
          SELECT * FROM australian_standards WHERE standard_code = ${input.code} LIMIT 1
        `);
        const rows = (result as any)[0] as any[];
        return rows.length > 0 ? rows[0] : null;
      }),
  }),

  // Contractor Rating Router
  ratings: router({
    // Get contractor rating
    getContractorRating: publicProcedure
      .input(z.object({ contractorAbn: z.string() }))
      .query(async ({ input }) => {
        const { getContractorRating } = await import('./contractorRating');
        return await getContractorRating(input.contractorAbn);
      }),

    // Get contractor reviews
    getContractorReviews: publicProcedure
      .input(z.object({
        contractorAbn: z.string(),
        limit: z.number().optional(),
        offset: z.number().optional()
      }))
      .query(async ({ input }) => {
        const { getContractorReviews } = await import('./contractorRating');
        return await getContractorReviews(input.contractorAbn, input.limit || 10, input.offset || 0);
      }),

    // Submit review
    submitReview: protectedProcedure
      .input(z.object({
        contractorAbn: z.string(),
        contractorName: z.string(),
        quoteId: z.number().optional(),
        rating: z.number().min(1).max(5),
        accuracyRating: z.number().min(1).max(5).optional(),
        complianceRating: z.number().min(1).max(5).optional(),
        communicationRating: z.number().min(1).max(5).optional(),
        reviewText: z.string().optional(),
        verifiedQuote: z.boolean().optional()
      }))
      .mutation(async ({ ctx, input }) => {
        const { submitReview } = await import('./contractorRating');
        return await submitReview({
          ...input,
          userId: String(ctx.user.id)
        });
      }),

    // Get top rated contractors
    getTopRated: publicProcedure
      .input(z.object({
        limit: z.number().optional(),
        minReviews: z.number().optional()
      }).optional())
      .query(async ({ input }) => {
        const { getTopRatedContractors } = await import('./contractorRating');
        return await getTopRatedContractors(input?.limit || 10, input?.minReviews || 1);
      }),
  }),

  // Rate Update Router (Admin)
  rateUpdates: router({
    // Get update history
    getHistory: publicProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ input }) => {
        const { getRateUpdateHistory } = await import('./rateUpdateAutomation');
        return await getRateUpdateHistory(input?.limit || 10);
      }),

    // Get next scheduled update
    getNextScheduled: publicProcedure
      .query(async () => {
        const { getNextScheduledUpdate, isQuarterlyUpdateDue } = await import('./rateUpdateAutomation');
        return {
          nextUpdate: getNextScheduledUpdate(),
          isDue: isQuarterlyUpdateDue()
        };
      }),

    // Apply quarterly update (admin only)
    applyQuarterlyUpdate: protectedProcedure
      .input(z.object({ notes: z.string().optional() }).optional())
      .mutation(async ({ ctx, input }) => {
        const { applyQuarterlyRateUpdate } = await import('./rateUpdateAutomation');
        return await applyQuarterlyRateUpdate(String(ctx.user.id), input?.notes);
      }),

    // Reset rates to base (admin only)
    resetToBase: protectedProcedure
      .mutation(async ({ ctx }) => {
        const { resetRatesToBase } = await import('./rateUpdateAutomation');
        return await resetRatesToBase(String(ctx.user.id));
      }),
  }),

  // Feedback collection for beta testing
  feedback: router({
    // Submit feedback (authenticated users)
    submit: protectedProcedure
      .input(z.object({
        type: z.enum(["bug", "feature", "improvement", "general", "praise"]),
        category: z.enum(["quote_upload", "verification", "comparison", "market_rates", "credentials", "reports", "dashboard", "mobile", "performance", "other"]),
        title: z.string().min(1).max(256),
        description: z.string().min(1).max(5000),
        rating: z.number().min(1).max(5).optional(),
        pageUrl: z.string().optional(),
        screenSize: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await createFeedback({
          userId: ctx.user.id,
          type: input.type,
          category: input.category,
          title: input.title,
          description: input.description,
          rating: input.rating,
          pageUrl: input.pageUrl,
          userAgent: ctx.req.headers["user-agent"] || undefined,
          screenSize: input.screenSize,
        });
      }),

    // Get user's own feedback
    myFeedback: protectedProcedure
      .query(async ({ ctx }) => {
        return await getFeedbackByUserId(ctx.user.id);
      }),

    // Admin: Get all feedback
    list: protectedProcedure
      .input(z.object({
        status: z.enum(["new", "reviewing", "in_progress", "resolved", "wont_fix"]).optional(),
        type: z.enum(["bug", "feature", "improvement", "general", "praise"]).optional(),
        category: z.enum(["quote_upload", "verification", "comparison", "market_rates", "credentials", "reports", "dashboard", "mobile", "performance", "other"]).optional(),
        limit: z.number().min(1).max(100).optional(),
        offset: z.number().min(0).optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        return await getAllFeedback(input);
      }),

    // Admin: Get feedback stats
    stats: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        return await getFeedbackStats();
      }),

    // Admin: Update feedback status
    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["new", "reviewing", "in_progress", "resolved", "wont_fix"]),
        adminNotes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        return await updateFeedbackStatus(input.id, input.status, input.adminNotes, ctx.user.id);
      }),

    // Admin: Delete feedback
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        return await deleteFeedback(input.id);
      }),
  }),

  // Trade Knowledge Base Router
  tradeKnowledge: router({
    // Get best practices for a trade
    getBestPractices: publicProcedure
      .input(z.object({
        trade: z.enum(["electrical", "plumbing", "roofing", "building", "carpentry", "hvac", "painting", "tiling", "concreting", "landscaping", "glazing", "fencing"]),
      }))
      .query(async ({ input }) => {
        const { getBestPracticesForTrade } = await import('./tradeKnowledgeBase');
        return getBestPracticesForTrade(input.trade);
      }),

    // Get SOPs for a trade
    getSOPs: publicProcedure
      .input(z.object({
        trade: z.enum(["electrical", "plumbing", "roofing", "building", "carpentry", "hvac", "painting", "tiling", "concreting", "landscaping", "glazing", "fencing"]),
      }))
      .query(async ({ input }) => {
        const { getSOPsForTrade } = await import('./tradeKnowledgeBase');
        return getSOPsForTrade(input.trade);
      }),

    // Get common defects for a trade
    getCommonDefects: publicProcedure
      .input(z.object({
        trade: z.enum(["electrical", "plumbing", "roofing", "building", "carpentry", "hvac", "painting", "tiling", "concreting", "landscaping", "glazing", "fencing"]),
      }))
      .query(async ({ input }) => {
        const { getCommonDefectsForTrade } = await import('./tradeKnowledgeBase');
        return getCommonDefectsForTrade(input.trade);
      }),

    // Get quality benchmarks for a trade
    getQualityBenchmarks: publicProcedure
      .input(z.object({
        trade: z.enum(["electrical", "plumbing", "roofing", "building", "carpentry", "hvac", "painting", "tiling", "concreting", "landscaping", "glazing", "fencing"]),
      }))
      .query(async ({ input }) => {
        const { getQualityBenchmarksForTrade } = await import('./tradeKnowledgeBase');
        return getQualityBenchmarksForTrade(input.trade);
      }),

    // Search best practices by keyword
    search: publicProcedure
      .input(z.object({
        keyword: z.string().min(2),
      }))
      .query(async ({ input }) => {
        const { searchBestPractices } = await import('./tradeKnowledgeBase');
        return searchBestPractices(input.keyword);
      }),

    // Get warranty info for a trade
    getWarrantyInfo: publicProcedure
      .input(z.object({
        trade: z.enum(["electrical", "plumbing", "roofing", "building", "carpentry", "hvac", "painting", "tiling", "concreting", "landscaping", "glazing", "fencing"]),
      }))
      .query(async ({ input }) => {
        const { getWarrantyInfoForTrade } = await import('./tradeKnowledgeBase');
        return getWarrantyInfoForTrade(input.trade);
      }),

    // Get all trades with their knowledge summary
    getAllTrades: publicProcedure
      .query(async () => {
        const { TRADE_KNOWLEDGE_BASE } = await import('./tradeKnowledgeBase');
        return Object.entries(TRADE_KNOWLEDGE_BASE).map(([trade, data]) => ({
          trade,
          bestPracticesCount: data.bestPractices.length,
          sopsCount: data.sops.length,
        }));
      }),

    // Seed knowledge base (admin only)
    seedKnowledgeBase: protectedProcedure
      .mutation(async ({ ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const { seedTradeKnowledgeBase } = await import('./seedTradeKnowledgeBase');
        return await seedTradeKnowledgeBase();
      }),

    // Get database stats (admin only)
    getDbStats: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const { getDb } = await import('./db');
        const { sql } = await import('drizzle-orm');
        const db = await getDb();
        if (!db) return { error: "Database not available" };

        try {
          const [bestPractices] = await db.execute(sql`SELECT COUNT(*) as count FROM trade_best_practices`);
          const [sops] = await db.execute(sql`SELECT COUNT(*) as count FROM industry_sops`);
          const [safety] = await db.execute(sql`SELECT COUNT(*) as count FROM safety_requirements`);
          const [materials] = await db.execute(sql`SELECT COUNT(*) as count FROM material_specifications`);
          const [warranties] = await db.execute(sql`SELECT COUNT(*) as count FROM warranty_benchmarks`);

          return {
            bestPractices: (bestPractices as any)[0]?.count || 0,
            sops: (sops as any)[0]?.count || 0,
            safetyRequirements: (safety as any)[0]?.count || 0,
            materialSpecifications: (materials as any)[0]?.count || 0,
            warrantyBenchmarks: (warranties as any)[0]?.count || 0,
          };
        } catch (error) {
          return { error: "Tables not yet created. Run seedKnowledgeBase first." };
        }
      }),
  }),

  // Admin dashboard metrics (admin only)
  metrics: router({
    snapshot: protectedProcedure
      .query(async ({ ctx }) => {
        const { getMetricsSnapshot, verifyAdminAccess } = await import('./adminMetrics');
        verifyAdminAccess(ctx.user.role);
        return getMetricsSnapshot();
      }),

    performance: protectedProcedure
      .query(async ({ ctx }) => {
        const { getPerformanceMetrics, verifyAdminAccess } = await import('./adminMetrics');
        verifyAdminAccess(ctx.user.role);
        return getPerformanceMetrics();
      }),

    health: protectedProcedure
      .query(async ({ ctx }) => {
        const { getHealthScore, verifyAdminAccess } = await import('./adminMetrics');
        verifyAdminAccess(ctx.user.role);
        return getHealthScore();
      }),

    s3Stats: protectedProcedure
      .query(async ({ ctx }) => {
        const { getS3Stats, verifyAdminAccess } = await import('./adminMetrics');
        verifyAdminAccess(ctx.user.role);
        return getS3Stats();
      }),

    rateLimitStats: protectedProcedure
      .query(async ({ ctx }) => {
        const { getRateLimitStats, verifyAdminAccess } = await import('./adminMetrics');
        verifyAdminAccess(ctx.user.role);
        return getRateLimitStats();
      }),

    requestLogs: protectedProcedure
      .input(z.object({ limit: z.number().min(1).max(1000).optional() }))
      .query(async ({ ctx, input }) => {
        const { getAllLogs } = await import('./requestLogging');
        const { verifyAdminAccess } = await import('./adminMetrics');
        verifyAdminAccess(ctx.user.role);
        return getAllLogs(input.limit || 100);
      }),

    errorLogs: protectedProcedure
      .input(z.object({ limit: z.number().min(1).max(1000).optional() }))
      .query(async ({ ctx, input }) => {
        const { getErrorLogs } = await import('./requestLogging');
        const { verifyAdminAccess } = await import('./adminMetrics');
        verifyAdminAccess(ctx.user.role);
        return getErrorLogs(input.limit || 100);
      }),

    webhookStats: protectedProcedure
      .query(async ({ ctx }) => {
        const { getWebhookStats } = await import('./webhookNotifications');
        const { verifyAdminAccess } = await import('./adminMetrics');
        verifyAdminAccess(ctx.user.role);
        return getWebhookStats();
      }),

    // Filtered request logs by path
    requestLogsByPath: protectedProcedure
      .input(z.object({ path: z.string(), limit: z.number().min(1).max(1000).optional() }))
      .query(async ({ ctx, input }) => {
        const { getLogsForPath } = await import('./requestLogging');
        const { verifyAdminAccess } = await import('./adminMetrics');
        verifyAdminAccess(ctx.user.role);
        return getLogsForPath(input.path, input.limit || 100);
      }),

    // Filtered request logs by user
    requestLogsByUser: protectedProcedure
      .input(z.object({ userId: z.number(), limit: z.number().min(1).max(1000).optional() }))
      .query(async ({ ctx, input }) => {
        const { getLogsForUser } = await import('./requestLogging');
        const { verifyAdminAccess } = await import('./adminMetrics');
        verifyAdminAccess(ctx.user.role);
        return getLogsForUser(input.userId, input.limit || 100);
      }),

    // Export logs as CSV
    exportLogsCsv: protectedProcedure
      .input(z.object({ limit: z.number().min(1).max(10000).optional() }))
      .query(async ({ ctx, input }) => {
        const { exportLogsAsCsv } = await import('./requestLogging');
        const { verifyAdminAccess } = await import('./adminMetrics');
        verifyAdminAccess(ctx.user.role);
        return exportLogsAsCsv(input.limit || 1000);
      }),

    // Export logs as JSON
    exportLogsJson: protectedProcedure
      .input(z.object({ limit: z.number().min(1).max(10000).optional() }))
      .query(async ({ ctx, input }) => {
        const { exportLogsAsJson } = await import('./requestLogging');
        const { verifyAdminAccess } = await import('./adminMetrics');
        verifyAdminAccess(ctx.user.role);
        return exportLogsAsJson(input.limit || 1000);
      }),

    // List all webhooks
    webhookList: protectedProcedure
      .query(async ({ ctx }) => {
        const { getWebhooks } = await import('./webhookNotifications');
        const { verifyAdminAccess } = await import('./adminMetrics');
        verifyAdminAccess(ctx.user.role);
        const webhooksMap = getWebhooks();
        return Array.from(webhooksMap.entries()).map(([id, config]) => ({ id, ...config }));
      }),

    // Register a webhook
    webhookRegister: protectedProcedure
      .input(z.object({
        id: z.string().min(1).max(100),
        type: z.enum(['slack', 'discord']),
        url: z.string().url(),
        enabled: z.boolean().default(true),
        alertOnDegraded: z.boolean().default(true),
        alertOnCritical: z.boolean().default(true),
      }))
      .mutation(async ({ ctx, input }) => {
        const { registerWebhook } = await import('./webhookNotifications');
        const { verifyAdminAccess } = await import('./adminMetrics');
        verifyAdminAccess(ctx.user.role);
        registerWebhook(input.id, {
          type: input.type,
          url: input.url,
          enabled: input.enabled,
          alertOnDegraded: input.alertOnDegraded,
          alertOnCritical: input.alertOnCritical,
        });
        return { success: true, id: input.id };
      }),

    // Unregister a webhook
    webhookUnregister: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const { unregisterWebhook } = await import('./webhookNotifications');
        const { verifyAdminAccess } = await import('./adminMetrics');
        verifyAdminAccess(ctx.user.role);
        unregisterWebhook(input.id);
        return { success: true };
      }),

    // Test a webhook
    webhookTest: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const { testWebhook } = await import('./webhookNotifications');
        const { verifyAdminAccess } = await import('./adminMetrics');
        verifyAdminAccess(ctx.user.role);
        return await testWebhook(input.id);
      }),
  }),

  // Health check endpoint for monitoring
  health: router({
    check: publicProcedure
      .query(async () => {
        const { testDatabaseHealth } = await import('./db');
        const { testRedisHealth } = await import('./_core/redis');
        const { testStorageConnection } = await import('./storage');

        const startTime = Date.now();

        // Run all health checks in parallel
        const [database, redis, storage] = await Promise.all([
          testDatabaseHealth(),
          testRedisHealth(),
          testStorageConnection(),
        ]);

        const totalLatencyMs = Date.now() - startTime;

        // Determine overall status
        const allHealthy = database.connected && storage.connected;
        // Redis is optional, so we don't fail if it's not connected
        const status = allHealthy ? 'healthy' : 'degraded';

        return {
          status,
          timestamp: new Date().toISOString(),
          totalLatencyMs,
          services: {
            database: {
              status: database.connected ? 'up' : 'down',
              latencyMs: database.latencyMs,
              error: database.error,
            },
            redis: {
              status: redis.connected ? 'up' : 'down',
              latencyMs: redis.latencyMs,
              error: redis.error,
              optional: true, // Redis is optional for basic functionality
            },
            storage: {
              status: storage.connected ? 'up' : 'down',
              latencyMs: storage.latencyMs,
              error: storage.error,
            },
          },
          version: process.env.npm_package_version || '1.0.0',
        };
      }),

    // Simple ping endpoint for basic availability check
    ping: publicProcedure
      .query(() => {
        return {
          status: 'ok',
          timestamp: new Date().toISOString(),
        };
      }),
  }),

});

export type AppRouter = typeof appRouter;
