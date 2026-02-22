import { 
  updateQuoteStatus, 
  createVerification, 
  createReport,
  getQuoteById,
  getUserByOpenId,
  updateQuoteExtractedData
} from "./db";
import { sendVerificationCompleteEmail, sendProcessingFailedEmail } from "./emailNotification";
import { verifyQuote, extractQuoteText, extractQuoteMetadata } from "./aiVerification";
import { generatePDFReport } from "./pdfGeneration";
import { createNotification } from "./notificationDb";

interface ProcessingStep {
  label: string;
  progress: number;
  duration: number; // milliseconds
}

/**
 * Calculate potential savings based on pricing analysis.
 * Uses the pricing score to estimate how much the user could save
 * by negotiating or seeking alternative quotes.
 */
function calculatePotentialSavings(verification: any): number {
  try {
    const pricingDetails = verification.pricingDetails;
    if (!pricingDetails) return 0;
    
    // If pricing details contain a totalAmount and market comparison
    const totalAmount = pricingDetails.totalAmount || pricingDetails.quotedPrice || 0;
    if (totalAmount <= 0) return 0;
    
    // Estimate savings based on pricing score
    // Score < 50: likely overpriced by 15-25%
    // Score 50-70: potentially overpriced by 5-15%
    // Score > 70: fair pricing, minimal savings
    const pricingScore = verification.pricingScore || 0;
    if (pricingScore >= 80) return 0;
    if (pricingScore >= 70) return Math.round(totalAmount * 0.03);
    if (pricingScore >= 50) return Math.round(totalAmount * 0.10);
    return Math.round(totalAmount * 0.20);
  } catch {
    return 0;
  }
}

const PROCESSING_STEPS: ProcessingStep[] = [
  { label: "Uploading quote...", progress: 10, duration: 2000 },
  { label: "Extracting data...", progress: 25, duration: 5000 },
  { label: "Analyzing pricing...", progress: 40, duration: 8000 },
  { label: "Checking materials...", progress: 60, duration: 8000 },
  { label: "Verifying compliance...", progress: 80, duration: 8000 },
  { label: "Generating report...", progress: 95, duration: 5000 },
  { label: "Complete!", progress: 100, duration: 1000 },
];

/**
 * Simulate processing delay
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Process a quote through the verification pipeline
 */
export async function processQuote(quoteId: number): Promise<void> {
  try {
    console.log(`[Processing] Starting verification for quote ${quoteId}`);

    // Get quote details
    const quote = await getQuoteById(quoteId);
    if (!quote) {
      throw new Error(`Quote ${quoteId} not found`);
    }

    // Update status to processing
    await updateQuoteStatus(quoteId, "processing", 0);

    // Simulate processing steps with progress updates
    for (const step of PROCESSING_STEPS.slice(0, -1)) {
      console.log(`[Processing] ${step.label} (${step.progress}%)`);
      await updateQuoteStatus(quoteId, "processing", step.progress);
      await delay(step.duration);
    }

    // Extract quote text first
    console.log(`[Processing] Extracting quote text...`);
    const { extractQuoteText: extractText } = await import("./aiVerification");
    let quoteText: string;
    try {
      quoteText = await extractText(quote.fileUrl);
    } catch (extractError) {
      console.error(`[Processing] Text extraction failed:`, extractError);
      throw extractError;
    }

    // Extract and save quote metadata (contractor name, total, etc.)
    console.log(`[Processing] Extracting quote metadata...`);
    try {
      const metadata = await extractQuoteMetadata(quoteText);
      if (metadata.contractor || metadata.totalAmount) {
        await updateQuoteExtractedData(quoteId, metadata);
        console.log(`[Processing] Saved metadata: contractor="${metadata.contractor}", total=${metadata.totalAmount}`);
      }
    } catch (metadataError) {
      console.warn(`[Processing] Metadata extraction failed (non-critical):`, metadataError);
      // Continue with verification even if metadata extraction fails
    }

    // Run AI verification
    console.log(`[Processing] Running AI verification...`);
    const verificationResult = await verifyQuote(quote.fileUrl);

    // Create verification record
    const verification = await createVerification({
      quoteId,
      overallScore: verificationResult.overallScore,
      pricingScore: verificationResult.pricingScore,
      materialsScore: verificationResult.materialsScore,
      complianceScore: verificationResult.complianceScore,
      warrantyScore: verificationResult.warrantyScore,
      statusBadge: verificationResult.statusBadge,
      pricingDetails: verificationResult.pricingDetails as any,
      materialsDetails: verificationResult.materialsDetails as any,
      complianceDetails: verificationResult.complianceDetails as any,
      warrantyDetails: verificationResult.warrantyDetails as any,
      flags: verificationResult.flags as any,
      recommendations: verificationResult.recommendations as any,
    });

    console.log(`[Processing] Verification created with ID ${verification.id}`);

    // Generate PDF report
    const { pdfKey, pdfUrl, pdfSize } = await generatePDFReport({
      verificationId: verification.id,
      quoteId,
      userId: quote.userId,
    });
    
    // Create report record
    await createReport({
      verificationId: verification.id,
      pdfKey,
      pdfUrl,
      pdfSize,
    });

    console.log(`[Processing] Report created for verification ${verification.id}`);

    // Mark as completed
    await updateQuoteStatus(quoteId, "completed", 100);
    console.log(`[Processing] Quote ${quoteId} verification completed successfully`);

    // Create in-app notification for verification complete
    try {
      await createNotification({
        userId: quote.userId,
        type: "verification_complete",
        title: "Quote Verification Complete",
        message: `Your quote "${quote.fileName}" has been verified with an overall score of ${verification.overallScore}/100.`,
        link: `/quote/${quoteId}`,
      });
      console.log(`[Processing] In-app notification created for user ${quote.userId}`);
    } catch (notifError) {
      console.error('[Processing] Failed to create notification:', notifError);
    }

    // Create notification for unusual pricing (if detected)
    if (verification.pricingScore < 60) {
      try {
        await createNotification({
          userId: quote.userId,
          type: "unusual_pricing",
          title: "Unusual Pricing Detected",
          message: `Your quote "${quote.fileName}" has pricing concerns (score: ${verification.pricingScore}/100). Review the detailed analysis.`,
          link: `/quote/${quoteId}`,
        });
        console.log(`[Processing] Unusual pricing notification created`);
      } catch (notifError) {
        console.error('[Processing] Failed to create pricing notification:', notifError);
      }
    }

    // Create notification for compliance warnings (if detected)
    if (verification.complianceScore < 70) {
      try {
        await createNotification({
          userId: quote.userId,
          type: "compliance_warning",
          title: "Compliance Warning",
          message: `Your quote "${quote.fileName}" has compliance concerns (score: ${verification.complianceScore}/100). Check the compliance details.`,
          link: `/quote/${quoteId}`,
        });
        console.log(`[Processing] Compliance warning notification created`);
      } catch (notifError) {
        console.error('[Processing] Failed to create compliance notification:', notifError);
      }
    }

    // Send email notification
    try {
      const user = await getUserByOpenId(quote.userId.toString());
      if (user) {
        const reportUrl = `${process.env.VITE_FRONTEND_FORGE_API_URL || 'https://app.manus.space'}/report/${verification.id}`;
        await sendVerificationCompleteEmail({
          userName: user.name || 'User',
          userEmail: user.email || '',
          quoteFileName: quote.fileName,
          overallScore: verification.overallScore,
          statusBadge: verification.statusBadge as any,
          potentialSavings: calculatePotentialSavings(verification),
          pricingScore: verification.pricingScore,
          materialsScore: verification.materialsScore,
          complianceScore: verification.complianceScore,
          warrantyScore: verification.warrantyScore,
          reportUrl,
          verificationId: verification.id,
        });
        console.log(`[Processing] Email notification sent to ${user.email}`);
      }
    } catch (emailError) {
      console.error('[Processing] Failed to send completion email:', emailError);
      // Don't fail the entire process if email fails
    }

    // Send owner notification for verification completion
    try {
      const { notifyOwner } = await import("./_core/notification");
      const statusEmoji = verification.overallScore >= 80 ? "✅" : verification.overallScore >= 60 ? "⚠️" : "❌";
      await notifyOwner({
        title: `${statusEmoji} Quote Verification Complete`,
        content: `Quote "${quote.fileName}" (ID: ${quoteId}) has been verified.\n\nOverall Score: ${verification.overallScore}/100\nStatus: ${verification.statusBadge}\n\nBreakdown:\n• Pricing: ${verification.pricingScore}/100\n• Materials: ${verification.materialsScore}/100\n• Compliance: ${verification.complianceScore}/100\n• Warranty: ${verification.warrantyScore}/100`,
      });
      console.log(`[Processing] Owner notification sent for quote ${quoteId}`);
    } catch (ownerNotifError) {
      console.error('[Processing] Failed to send owner notification:', ownerNotifError);
    }

  } catch (error) {
    console.error(`[Processing] Failed to process quote ${quoteId}:`, error);
    
    // Mark as failed
    await updateQuoteStatus(
      quoteId, 
      "failed", 
      0, 
      error instanceof Error ? error.message : "Unknown error"
    );
    
    // Send failure email notification
    try {
      const failedQuote = await getQuoteById(quoteId);
      if (failedQuote) {
        const user = await getUserByOpenId(failedQuote.userId.toString());
        if (user) {
          await sendProcessingFailedEmail(
            user.name || 'User',
            user.email || '',
            failedQuote.fileName,
            error instanceof Error ? error.message : "Unknown error"
          );
        }
      }
    } catch (emailError) {
      console.error('[Processing] Failed to send failure email:', emailError);
    }
    
    throw error;
  }
}

/**
 * Start processing a quote asynchronously
 * Returns immediately, processing continues in background
 */
export function startQuoteProcessing(quoteId: number): void {
  // Start processing in background (non-blocking)
  processQuote(quoteId).catch(error => {
    console.error(`[Processing] Background processing failed for quote ${quoteId}:`, error);
  });
}

/**
 * Get current processing status for a quote
 */
export async function getProcessingStatus(quoteId: number): Promise<{
  status: string;
  progress: number;
  currentStep: string;
  errorMessage?: string;
}> {
  const quote = await getQuoteById(quoteId);
  
  if (!quote) {
    throw new Error("Quote not found");
  }

  // Determine current step based on progress
  let currentStep = "Initializing...";
  for (const step of PROCESSING_STEPS) {
    if (quote.progressPercentage !== null && quote.progressPercentage >= step.progress) {
      currentStep = step.label;
    }
  }

  return {
    status: quote.status,
    progress: quote.progressPercentage || 0,
    currentStep,
    errorMessage: quote.errorMessage || undefined,
  };
}
