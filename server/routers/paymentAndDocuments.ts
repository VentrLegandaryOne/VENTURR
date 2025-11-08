/**
 * tRPC Routers for Payment Processing, Reporting, and Document Generation
 */

import { z } from 'zod';
import { publicProcedure, protectedProcedure, router } from '../_core/trpc';
import { stripePaymentManager } from '../_core/stripePayments';
import { advancedReportingSystem } from '../_core/advancedReporting';
import { aiDocumentGenerationManager } from '../_core/aiDocumentGeneration';

export const paymentAndDocumentsRouter = router({
  // ============ STRIPE PAYMENT ROUTERS ============

  // Get all subscription plans
  subscriptions: router({
    getPlans: publicProcedure.query(() => {
      return stripePaymentManager.getAllSubscriptionPlans();
    }),

    // Create subscription
    create: protectedProcedure
      .input(
        z.object({
          planId: z.enum(['starter', 'pro', 'enterprise']),
          customerId: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        return stripePaymentManager.createSubscription(input.customerId, input.planId);
      }),

    // Get user subscriptions
    getActive: protectedProcedure.query(({ ctx }) => {
      // In production, fetch from database
      return stripePaymentManager.getCustomerSubscriptions(ctx.user.id);
    }),

    // Cancel subscription
    cancel: protectedProcedure
      .input(z.object({ subscriptionId: z.string() }))
      .mutation(async ({ input }) => {
        await stripePaymentManager.cancelSubscription(input.subscriptionId);
        return { success: true };
      }),
  }),

  // Payment processing
  payments: router({
    // Create payment intent for one-time payment
    createIntent: protectedProcedure
      .input(
        z.object({
          amount: z.number(),
          description: z.string(),
          customerId: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const clientSecret = await stripePaymentManager.createPaymentIntent(
          input.customerId,
          input.amount,
          input.description
        );
        return { clientSecret };
      }),

    // Get payment history
    getHistory: protectedProcedure.query(({ ctx }) => {
      return stripePaymentManager.getCustomerPayments(ctx.user.id);
    }),

    // Get revenue metrics
    getMetrics: protectedProcedure.query(() => {
      return stripePaymentManager.getRevenueMetrics();
    }),
  }),

  // Invoice management
  invoices: router({
    // Create invoice
    create: protectedProcedure
      .input(
        z.object({
          customerId: z.string(),
          items: z.array(
            z.object({
              description: z.string(),
              amount: z.number(),
              quantity: z.number(),
            })
          ),
          dueDate: z.date().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return stripePaymentManager.createInvoice(
          input.customerId,
          input.items,
          input.dueDate
        );
      }),

    // Send invoice
    send: protectedProcedure
      .input(z.object({ invoiceId: z.string() }))
      .mutation(async ({ input }) => {
        await stripePaymentManager.sendInvoice(input.invoiceId);
        return { success: true };
      }),

    // Get invoices
    getList: protectedProcedure.query(({ ctx }) => {
      return stripePaymentManager.getCustomerInvoices(ctx.user.id);
    }),
  }),

  // ============ REPORTING ROUTERS ============

  reports: router({
    // Create custom dashboard
    createDashboard: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          description: z.string(),
        })
      )
      .mutation(({ input, ctx }) => {
        return advancedReportingSystem.createCustomDashboard(
          ctx.user.id,
          input.name,
          input.description
        );
      }),

    // Get user dashboards
    getDashboards: protectedProcedure.query(({ ctx }) => {
      return advancedReportingSystem.getUserDashboards(ctx.user.id);
    }),

    // Add widget to dashboard
    addWidget: protectedProcedure
      .input(
        z.object({
          dashboardId: z.string(),
          widgetId: z.string(),
        })
      )
      .mutation(({ input }) => {
        return advancedReportingSystem.addWidgetToDashboard(
          input.dashboardId,
          input.widgetId
        );
      }),

    // Create scheduled report
    scheduleReport: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          dashboardId: z.string(),
          frequency: z.enum(['daily', 'weekly', 'monthly']),
          recipients: z.array(z.string().email()),
          format: z.enum(['pdf', 'csv', 'json']),
        })
      )
      .mutation(({ input, ctx }) => {
        return advancedReportingSystem.createScheduledReport(
          ctx.user.id,
          input.name,
          input.dashboardId,
          input.frequency,
          input.recipients,
          input.format
        );
      }),

    // Get scheduled reports
    getScheduledReports: protectedProcedure.query(({ ctx }) => {
      return advancedReportingSystem.getUserScheduledReports(ctx.user.id);
    }),

    // Export dashboard
    export: protectedProcedure
      .input(
        z.object({
          dashboardId: z.string(),
          format: z.enum(['pdf', 'csv', 'json']),
        })
      )
      .query(({ input }) => {
        return advancedReportingSystem.exportDashboard(input.dashboardId, input.format);
      }),

    // Get widget templates
    getWidgetTemplates: publicProcedure.query(() => {
      return advancedReportingSystem.getWidgetTemplates();
    }),
  }),

  // ============ DOCUMENT GENERATION ROUTERS ============

  documents: router({
    // Get all templates
    getTemplates: publicProcedure.query(() => {
      return aiDocumentGenerationManager.getAllTemplates();
    }),

    // Get templates by type
    getTemplatesByType: publicProcedure
      .input(z.object({ type: z.string() }))
      .query(({ input }) => {
        return aiDocumentGenerationManager.getTemplatesByType(input.type);
      }),

    // Get template variables
    getTemplateVariables: publicProcedure
      .input(z.object({ templateId: z.string() }))
      .query(({ input }) => {
        return aiDocumentGenerationManager.getTemplateVariables(input.templateId);
      }),

    // Generate document
    generate: protectedProcedure
      .input(
        z.object({
          templateId: z.string(),
          variables: z.record(z.union([z.string(), z.number()])),
          title: z.string(),
        })
      )
      .mutation(({ input }) => {
        return aiDocumentGenerationManager.generateDocument(
          input.templateId,
          input.variables,
          input.title
        );
      }),

    // Send for signature
    sendForSignature: protectedProcedure
      .input(
        z.object({
          documentId: z.string(),
          signerEmail: z.string().email(),
          signerName: z.string(),
        })
      )
      .mutation(({ input }) => {
        return aiDocumentGenerationManager.sendDocumentForSignature(
          input.documentId,
          input.signerEmail,
          input.signerName
        );
      }),

    // Sign document
    sign: publicProcedure
      .input(
        z.object({
          documentId: z.string(),
          signatureId: z.string(),
          signatureUrl: z.string(),
        })
      )
      .mutation(({ input }) => {
        const success = aiDocumentGenerationManager.signDocument(
          input.documentId,
          input.signatureId,
          input.signatureUrl
        );
        return { success };
      }),

    // Get document
    get: protectedProcedure
      .input(z.object({ documentId: z.string() }))
      .query(({ input }) => {
        return aiDocumentGenerationManager.getDocument(input.documentId);
      }),

    // Get document signatures
    getSignatures: protectedProcedure
      .input(z.object({ documentId: z.string() }))
      .query(({ input }) => {
        return aiDocumentGenerationManager.getDocumentSignatures(input.documentId);
      }),

    // Export as PDF
    exportPDF: protectedProcedure
      .input(z.object({ documentId: z.string() }))
      .mutation(async ({ input }) => {
        const buffer = await aiDocumentGenerationManager.exportDocumentAsPDF(
          input.documentId
        );
        return { success: !!buffer, size: buffer?.length || 0 };
      }),

    // Export as Word
    exportWord: protectedProcedure
      .input(z.object({ documentId: z.string() }))
      .mutation(async ({ input }) => {
        const buffer = await aiDocumentGenerationManager.exportDocumentAsWord(
          input.documentId
        );
        return { success: !!buffer, size: buffer?.length || 0 };
      }),

    // Get document statistics
    getStatistics: protectedProcedure.query(() => {
      return aiDocumentGenerationManager.getDocumentStatistics();
    }),
  }),
});

