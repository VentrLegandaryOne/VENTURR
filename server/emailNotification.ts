import { notifyOwner } from "./_core/notification";

interface VerificationEmailData {
  userName: string;
  userEmail: string;
  quoteFileName: string;
  overallScore: number;
  statusBadge: "green" | "amber" | "red";
  potentialSavings: number;
  pricingScore: number;
  materialsScore: number;
  complianceScore: number;
  warrantyScore: number;
  reportUrl: string;
  verificationId: number;
}

/**
 * Send email notification when quote verification is completed
 */
export async function sendVerificationCompleteEmail(data: VerificationEmailData): Promise<boolean> {
  try {
    const {
      userName,
      userEmail,
      quoteFileName,
      overallScore,
      statusBadge,
      potentialSavings,
      pricingScore,
      materialsScore,
      complianceScore,
      warrantyScore,
      reportUrl,
      verificationId,
    } = data;

    // Determine status message
    const statusMessages = {
      green: "✅ APPROVED - Your quote looks excellent!",
      amber: "⚠️ REVIEW RECOMMENDED - Some items need attention",
      red: "🚨 CAUTION - Significant issues found",
    };

    const statusMessage = statusMessages[statusBadge];

    // Build email content
    const emailTitle = `Quote Verification Complete: ${quoteFileName}`;
    
    const emailContent = `
**${statusMessage}**

Your quote verification for "${quoteFileName}" is complete!

**Overall Score: ${overallScore}/100**

**Score Breakdown:**
- Pricing: ${pricingScore}/100
- Materials: ${materialsScore}/100
- Compliance: ${complianceScore}/100
- Warranty: ${warrantyScore}/100

${potentialSavings > 0 ? `**💰 Potential Savings: $${potentialSavings.toLocaleString()}**\n\n` : ""}

**View Your Full Report:**
${reportUrl}

**Key Actions:**
${statusBadge === "green" ? "- Your quote is in excellent shape! Proceed with confidence." : ""}
${statusBadge === "amber" ? "- Review the flagged items in your report\n- Consider negotiating on highlighted areas\n- Check warranty terms" : ""}
${statusBadge === "red" ? "- Review all flagged issues carefully\n- Request clarification from contractor\n- Consider getting alternative quotes\n- Consult with our experts" : ""}

Need help understanding your report? Reply to this email or visit your dashboard.

---
VENTURR VALDT - Quote Verification & Compliance Intelligence
`.trim();

    // Send notification to owner (which will forward to user)
    const success = await notifyOwner({
      title: emailTitle,
      content: emailContent,
    });

    if (success) {
      console.log(`[Email] Verification complete notification sent for verification ${verificationId}`);
    } else {
      console.error(`[Email] Failed to send notification for verification ${verificationId}`);
    }

    return success;
  } catch (error) {
    console.error("[Email] Error sending verification complete email:", error);
    return false;
  }
}

/**
 * Send email notification when quote processing fails
 */
export async function sendProcessingFailedEmail(
  userName: string,
  userEmail: string,
  quoteFileName: string,
  errorMessage: string
): Promise<boolean> {
  try {
    const emailTitle = `Quote Processing Failed: ${quoteFileName}`;
    
    const emailContent = `
**Quote Processing Error**

We encountered an issue while processing your quote "${quoteFileName}".

**Error Details:**
${errorMessage}

**What to do next:**
1. Try uploading the quote again
2. Ensure the file is a clear PDF or image (under 16MB)
3. If the problem persists, contact our support team

**Need Help?**
Reply to this email or visit your dashboard for assistance.

---
VENTURR VALDT - Quote Verification & Compliance Intelligence
`.trim();

    const success = await notifyOwner({
      title: emailTitle,
      content: emailContent,
    });

    if (success) {
      console.log(`[Email] Processing failed notification sent for ${quoteFileName}`);
    } else {
      console.error(`[Email] Failed to send processing failed notification for ${quoteFileName}`);
    }

    return success;
  } catch (error) {
    console.error("[Email] Error sending processing failed email:", error);
    return false;
  }
}

/**
 * Send weekly summary email with all completed verifications
 */
export async function sendWeeklySummaryEmail(
  userName: string,
  userEmail: string,
  verifications: Array<{
    quoteFileName: string;
    overallScore: number;
    potentialSavings: number;
    completedAt: Date;
  }>
): Promise<boolean> {
  try {
    const totalSavings = verifications.reduce((sum, v) => sum + v.potentialSavings, 0);
    const avgScore = Math.round(
      verifications.reduce((sum, v) => sum + v.overallScore, 0) / verifications.length
    );

    const emailTitle = `Weekly Summary: ${verifications.length} Quotes Verified`;
    
    const emailContent = `
**Your Weekly VENTURR Summary**

Hi ${userName},

Here's your quote verification summary for this week:

**Overview:**
- Quotes Verified: ${verifications.length}
- Average Score: ${avgScore}/100
- Total Potential Savings: $${totalSavings.toLocaleString()}

**Recent Verifications:**
${verifications.map((v, i) => `${i + 1}. ${v.quoteFileName} - Score: ${v.overallScore}/100 (Savings: $${v.potentialSavings.toLocaleString()})`).join("\n")}

**Keep Up the Good Work!**
You're making informed decisions and potentially saving thousands on your construction projects.

View all your reports in your dashboard.

---
VENTURR VALDT - Quote Verification & Compliance Intelligence
`.trim();

    const success = await notifyOwner({
      title: emailTitle,
      content: emailContent,
    });

    if (success) {
      console.log(`[Email] Weekly summary sent to ${userEmail}`);
    } else {
      console.error(`[Email] Failed to send weekly summary to ${userEmail}`);
    }

    return success;
  } catch (error) {
    console.error("[Email] Error sending weekly summary email:", error);
    return false;
  }
}

/**
 * Send email notification when multi-quote comparison is complete
 */
export async function sendComparisonCompleteEmail(
  userName: string,
  userEmail: string,
  comparisonName: string,
  quoteCount: number,
  bestQuoteContractor: string | null,
  potentialSavings: number,
  comparisonUrl: string,
  comparisonId: number
): Promise<boolean> {
  try {
    const emailTitle = `Quote Comparison Complete: ${comparisonName}`;
    
    const emailContent = `
**Your Quote Comparison is Ready!**

Hi ${userName},

Great news! We've finished analyzing your ${quoteCount} quotes and identified the best value offer.

${bestQuoteContractor ? `**🏆 Recommended Quote: ${bestQuoteContractor}**\n` : ""}
${potentialSavings > 0 ? `**💰 Potential Savings: $${potentialSavings.toLocaleString()}**\n` : ""}

**What We Analyzed:**
- Pricing fairness against market rates
- Material quality and specifications
- Compliance with Australian building codes
- Warranty terms and coverage

**View Your Full Comparison:**
${comparisonUrl}

**What's Next?**
1. Review the detailed comparison in your dashboard
2. Check the category-by-category breakdown
3. Download the comparison report for your records
4. Contact your preferred contractor with confidence

---
VENTURR VALDT - Quote Verification & Compliance Intelligence
`.trim();

    const success = await notifyOwner({
      title: emailTitle,
      content: emailContent,
    });

    if (success) {
      console.log(`[Email] Comparison complete notification sent for comparison ${comparisonId}`);
    } else {
      console.error(`[Email] Failed to send comparison complete notification for comparison ${comparisonId}`);
    }

    return success;
  } catch (error) {
    console.error("[Email] Error sending comparison complete email:", error);
    return false;
  }
}
