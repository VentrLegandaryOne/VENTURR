/**
 * VENTURR VALDT - Quote Processing Service V2
 * 
 * This version uses the deterministic knowledge base for verification
 * instead of relying on external AI services.
 */

import {
  updateQuoteStatus, 
  createVerification, 
  createReport,
  getQuoteById,
  getUserByOpenId,
  updateQuoteExtractedData
} from "./db";
import { sendVerificationCompleteEmail, sendProcessingFailedEmail } from "./emailNotification";
import { generatePDFReport } from "./pdfGeneration";
import { createNotification } from "./notificationDb";
import { VERIFICATION_SERVICE, processQuote as processQuoteWithKB } from "./knowledgeBase/verificationService";
import { extractQuoteText } from "./aiVerification";

interface ProcessingStep {
  label: string;
  progress: number;
  duration: number; // milliseconds
}

const PROCESSING_STEPS: ProcessingStep[] = [
  { label: "Uploading quote...", progress: 10, duration: 1000 },
  { label: "Extracting text...", progress: 25, duration: 2000 },
  { label: "Parsing quote data...", progress: 40, duration: 1500 },
  { label: "Checking market rates...", progress: 55, duration: 2000 },
  { label: "Verifying compliance...", progress: 70, duration: 2000 },
  { label: "Scoring credentials...", progress: 85, duration: 1500 },
  { label: "Generating report...", progress: 95, duration: 1500 },
  { label: "Complete!", progress: 100, duration: 500 },
];

/**
 * Simulate processing delay
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Process a quote through the knowledge-base verification pipeline
 */
export async function processQuoteV2(quoteId: number): Promise<void> {
  try {
    console.log(`[ProcessingV2] Starting verification for quote ${quoteId}`);

    // Get quote details
    const quote = await getQuoteById(quoteId);
    if (!quote) {
      throw new Error(`Quote ${quoteId} not found`);
    }

    // Update status to processing
    await updateQuoteStatus(quoteId, "processing", 0);

    // Step 1: Upload acknowledgment
    console.log(`[ProcessingV2] ${PROCESSING_STEPS[0].label}`);
    await updateQuoteStatus(quoteId, "processing", PROCESSING_STEPS[0].progress);
    await delay(PROCESSING_STEPS[0].duration);

    // Step 2: Extract text from PDF
    console.log(`[ProcessingV2] ${PROCESSING_STEPS[1].label}`);
    await updateQuoteStatus(quoteId, "processing", PROCESSING_STEPS[1].progress);
    
    let quoteText: string;
    try {
      quoteText = await extractQuoteText(quote.fileUrl);
    } catch (extractError) {
      console.error(`[ProcessingV2] Text extraction failed:`, extractError);
      // Try to continue with empty text - the parser will handle it
      quoteText = "";
    }
    await delay(PROCESSING_STEPS[1].duration);

    // Step 3-6: Run knowledge-base verification
    console.log(`[ProcessingV2] Running knowledge-base verification...`);
    
    for (let i = 2; i < PROCESSING_STEPS.length - 2; i++) {
      console.log(`[ProcessingV2] ${PROCESSING_STEPS[i].label}`);
      await updateQuoteStatus(quoteId, "processing", PROCESSING_STEPS[i].progress);
      await delay(PROCESSING_STEPS[i].duration);
    }

    // Process with knowledge base
    const result = await processQuoteWithKB({
      quoteId,
      rawText: quoteText,
      fileName: quote.fileName,
      projectArea: undefined, // Will be estimated
      state: undefined, // Will be detected
      isMetro: undefined, // Will be detected
      projectType: undefined // Will be detected
    });

    if (!result.success) {
      throw new Error(result.error || "Verification failed");
    }

    // Step 7: Generate PDF report
    console.log(`[ProcessingV2] ${PROCESSING_STEPS[6].label}`);
    await updateQuoteStatus(quoteId, "processing", PROCESSING_STEPS[6].progress);

    // Get the verification record that was created by processQuoteWithKB
    const { getDb } = await import("./db");
    const { verifications } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    const db = await getDb();
    
    const verificationRecord = await db?.select()
      .from(verifications)
      .where(eq(verifications.quoteId, quoteId))
      .limit(1);

    if (!verificationRecord || verificationRecord.length === 0) {
      throw new Error("Verification record not found after processing");
    }

    const verification = verificationRecord[0];

    // Generate PDF report
    try {
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

      console.log(`[ProcessingV2] Report created for verification ${verification.id}`);
    } catch (pdfError) {
      console.warn(`[ProcessingV2] PDF generation failed (non-critical):`, pdfError);
      // Continue without PDF - verification is still valid
    }

    await delay(PROCESSING_STEPS[6].duration);

    // Step 8: Complete
    console.log(`[ProcessingV2] ${PROCESSING_STEPS[7].label}`);
    await updateQuoteStatus(quoteId, "completed", 100);
    console.log(`[ProcessingV2] Quote ${quoteId} verification completed successfully`);
    console.log(`[ProcessingV2] Overall score: ${result.complianceScore.overall}/100`);
    console.log(`[ProcessingV2] Risk level: ${result.complianceScore.riskLevel}`);

    // Create in-app notification for verification complete
    try {
      await createNotification({
        userId: quote.userId,
        type: "verification_complete",
        title: "Quote Verification Complete",
        message: `Your quote "${quote.fileName}" has been verified with an overall score of ${verification.overallScore}/100.`,
        link: `/quote/${quoteId}`,
      });
      console.log(`[ProcessingV2] In-app notification created for user ${quote.userId}`);
    } catch (notifError) {
      console.error('[ProcessingV2] Failed to create notification:', notifError);
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
      } catch (notifError) {
        console.error('[ProcessingV2] Failed to create pricing notification:', notifError);
      }
    }

    // Send email notification
    try {
      const user = await getUserByOpenId(quote.userId.toString());
      if (user?.email) {
        await sendVerificationCompleteEmail({
          userName: user.name || "User",
          userEmail: user.email,
          quoteFileName: quote.fileName,
          overallScore: verification.overallScore,
          statusBadge: verification.statusBadge,
          potentialSavings: verification.potentialSavings || 0,
          pricingScore: verification.pricingScore,
          materialsScore: verification.materialsScore,
          complianceScore: verification.complianceScore,
          warrantyScore: verification.warrantyScore,
          reportUrl: `/quote/${quoteId}`,
          verificationId: verification.id
        });
        console.log(`[ProcessingV2] Email notification sent to ${user.email}`);
      }
    } catch (emailError) {
      console.error('[ProcessingV2] Failed to send email notification:', emailError);
    }

    // Send push notification
    try {
      const { notifyVerificationComplete } = await import("./pushNotificationService");
      await notifyVerificationComplete(
        quote.userId,
        quoteId,
        "completed",
        verification.overallScore
      );
      console.log(`[ProcessingV2] Push notification sent for user ${quote.userId}`);
    } catch (pushError) {
      console.error('[ProcessingV2] Failed to send push notification:', pushError);
    }

  } catch (error) {
    console.error(`[ProcessingV2] Failed to process quote ${quoteId}:`, error);
    
    // Update status to failed
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    await updateQuoteStatus(quoteId, "failed", 0, errorMessage);

    // Try to send failure notification
    try {
      const quote = await getQuoteById(quoteId);
      if (quote) {
        await createNotification({
          userId: quote.userId,
          type: "system_alert",
          title: "Quote Verification Failed",
          message: `We couldn't verify your quote "${quote.fileName}". Please try uploading again or contact support.`,
          link: `/quote/${quoteId}`,
        });
      }
    } catch (notifError) {
      console.error('[ProcessingV2] Failed to create failure notification:', notifError);
    }

    throw error;
  }
}

/**
 * Start quote processing in background
 */
export function startQuoteProcessingV2(quoteId: number): void {
  // Run processing in background
  processQuoteV2(quoteId).catch(error => {
    console.error(`[ProcessingV2] Background processing failed for quote ${quoteId}:`, error);
  });
}

/**
 * Get processing status for a quote
 */
export async function getProcessingStatusV2(quoteId: number): Promise<{
  status: string;
  progress: number;
  currentStep: string;
  error?: string;
}> {
  const quote = await getQuoteById(quoteId);
  if (!quote) {
    return {
      status: "not_found",
      progress: 0,
      currentStep: "Quote not found"
    };
  }

  // Find current step based on progress
  const currentStep = PROCESSING_STEPS.find(step => step.progress >= (quote.progressPercentage || 0))
    || PROCESSING_STEPS[PROCESSING_STEPS.length - 1];

  return {
    status: quote.status,
    progress: quote.progressPercentage || 0,
    currentStep: currentStep.label,
    error: quote.errorMessage || undefined
  };
}

export { PROCESSING_STEPS };
