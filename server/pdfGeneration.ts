import { storagePut } from "./storage";
import { getVerificationByQuoteId, getQuoteById } from "./db";

interface PDFGenerationOptions {
  verificationId: number;
  quoteId: number;
  userId: number;
}

/**
 * Generate a markdown report that will be converted to PDF
 */
function generateMarkdownReport(
  quote: any,
  verification: any
): string {
  const statusColor = {
    green: "✅",
    amber: "⚠️",
    red: "❌",
  }[verification.statusBadge as "green" | "amber" | "red"];

  // Safely parse JSON fields with null checks
  const pricingDetails = verification.pricingDetails 
    ? (typeof verification.pricingDetails === 'string' 
        ? JSON.parse(verification.pricingDetails) 
        : verification.pricingDetails)
    : { marketRate: null, quotedRate: null, variance: 0, findings: [] };
  
  const materialsDetails = verification.materialsDetails
    ? (typeof verification.materialsDetails === 'string'
        ? JSON.parse(verification.materialsDetails)
        : verification.materialsDetails)
    : { findings: [] };
  
  const complianceDetails = verification.complianceDetails
    ? (typeof verification.complianceDetails === 'string'
        ? JSON.parse(verification.complianceDetails)
        : verification.complianceDetails)
    : { findings: [] };
  
  const warrantyDetails = verification.warrantyDetails
    ? (typeof verification.warrantyDetails === 'string'
        ? JSON.parse(verification.warrantyDetails)
        : verification.warrantyDetails)
    : { findings: [] };
  
  const flags = verification.flags
    ? (typeof verification.flags === 'string'
        ? JSON.parse(verification.flags)
        : verification.flags)
    : [];
  
  const recommendations = verification.recommendations
    ? (typeof verification.recommendations === 'string'
        ? JSON.parse(verification.recommendations)
        : verification.recommendations)
    : [];

  return `
# VENTURR VALDT - Quote Analysis Report

> **⚠️ IMPORTANT NOTICE:** This report is AI-generated for informational purposes only. It does not constitute professional, legal, or engineering advice. Consult qualified professionals before making decisions.

---

## Overall Assessment

**Status:** ${statusColor} **${verification.statusBadge.toUpperCase()}**

**Overall Score:** ${verification.overallScore}/100

**Quote File:** ${quote.fileName}

**Verification Date:** ${new Date().toLocaleDateString('en-AU', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}

---

## Score Breakdown

| Category | Score | Status |
|----------|-------|--------|
| **Pricing Analysis** | ${verification.pricingScore}/100 | ${verification.pricingScore >= 85 ? '✅ Excellent' : verification.pricingScore >= 70 ? '⚠️ Fair' : '❌ Needs Review'} |
| **Materials Verification** | ${verification.materialsScore}/100 | ${verification.materialsScore >= 85 ? '✅ Excellent' : verification.materialsScore >= 70 ? '⚠️ Fair' : '❌ Needs Review'} |
| **Compliance Intelligence** | ${verification.complianceScore}/100 | ${verification.complianceScore >= 85 ? '✅ Excellent' : verification.complianceScore >= 70 ? '⚠️ Fair' : '❌ Needs Review'} |
| **Warranty Analysis** | ${verification.warrantyScore}/100 | ${verification.warrantyScore >= 85 ? '✅ Excellent' : verification.warrantyScore >= 70 ? '⚠️ Fair' : '❌ Needs Review'} |

---

## Pricing Analysis

**Market Rate:** $${pricingDetails.marketRate?.toLocaleString() || 'N/A'}

**Quoted Rate:** $${pricingDetails.quotedRate?.toLocaleString() || 'N/A'}

**Variance:** ${pricingDetails.variance?.toFixed(1) || '0'}%

### Findings

${pricingDetails.findings?.map((f: any) => `
- **${f.item}** - ${f.status === 'verified' ? '✅' : '⚠️'} ${f.message}
`).join('') || 'No findings available'}

---

## Materials Verification

${materialsDetails.findings?.map((f: any) => `
### ${f.material}

- **Specification:** ${f.specified}
- **Supplier:** ${f.supplier || 'Not specified'}
- **Status:** ${f.status === 'verified' ? '✅ Verified' : '⚠️ Flagged'}
- **Assessment:** ${f.message}
`).join('\n') || 'No materials findings available'}

---

## Compliance Intelligence

${complianceDetails.findings?.map((f: any) => `
### ${f.requirement}

- **Status:** ${f.status === 'compliant' ? '✅ Compliant' : f.status === 'non-compliant' ? '❌ Non-Compliant' : '⚠️ Needs Review'}
- **Reference:** ${f.reference || 'N/A'}
- **Assessment:** ${f.message}
`).join('\n') || 'No compliance findings available'}

---

## Warranty Analysis

${warrantyDetails.findings?.map((f: any) => `
### ${f.item}

- **Term:** ${f.warrantyTerm}
- **Status:** ${f.status === 'verified' ? '✅ Verified' : '⚠️ Flagged'}
- **Assessment:** ${f.message}
`).join('\n') || 'No warranty findings available'}

---

## Flags & Issues

${flags && flags.length > 0 ? flags.map((flag: any) => `
- **[${flag.severity.toUpperCase()}]** ${flag.category.toUpperCase()}: ${flag.message}
`).join('') : 'No flags detected'}

---

## Recommendations

${recommendations && recommendations.length > 0 ? recommendations.map((rec: any, index: number) => `
### ${index + 1}. ${rec.title} (Priority: ${rec.priority.toUpperCase()})

${rec.description}
`).join('\n') : 'No recommendations at this time'}

---

## About This Report

This report was generated by VENTURR VALDT, an AI-powered quote verification and compliance intelligence platform. Our analysis is based on:

- Australian building codes (HB-39, NCC 2022)
- SafeWork NSW safety standards
- Industry pricing benchmarks
- Manufacturer specifications
- Best practice guidelines

---

## Important Disclaimer

**THIS REPORT IS AI-GENERATED AND PROVIDED FOR INFORMATIONAL PURPOSES ONLY.**

### Limitations

- VENTURR VALIDT does not verify or attest to compliance with any building code, standard, or regulation
- Scores and assessments are estimates based on available information and may not reflect actual quote quality or market conditions
- Market rates and compliance requirements vary by location, project scope, and time

### Recommendations

- Users should engage qualified professionals (licensed builders, engineers, or legal advisors) for compliance verification
- This analysis should not be relied upon as a substitute for professional advice
- Always verify findings with appropriate industry experts before making decisions

### Liability

VENTURR accepts no liability for decisions made based on this analysis. References to building codes (HB-39, NCC, AS/NZS standards) are for informational purposes only. Only qualified professionals can verify compliance with building regulations.

---

**VENTURR VALIDT** | AI-Powered Quote Analysis Platform

Generated on ${new Date().toLocaleString('en-AU')}
  `.trim();
}

/**
 * Generate PDF report for a verification
 */
export async function generatePDFReport(options: PDFGenerationOptions): Promise<{
  pdfKey: string;
  pdfUrl: string;
  pdfSize: number;
}> {
  try {
    console.log(`[PDF] Generating report for verification ${options.verificationId}`);

    // Get verification and quote data
    const verification = await getVerificationByQuoteId(options.quoteId);
    if (!verification) {
      throw new Error("Verification not found");
    }

    const quote = await getQuoteById(options.quoteId);
    if (!quote) {
      throw new Error("Quote not found");
    }

    // Generate markdown content
    const markdownContent = generateMarkdownReport(quote, verification);

    // Save markdown to temporary file
    const fs = await import('fs/promises');
    const path = await import('path');
    const os = await import('os');
    
    const tempDir = os.tmpdir();
    const mdPath = path.join(tempDir, `report-${verification.id}.md`);
    const pdfPath = path.join(tempDir, `report-${verification.id}.pdf`);

    await fs.writeFile(mdPath, markdownContent, 'utf-8');

    // Convert markdown to PDF using built-in utility
    const { execSync } = await import('child_process');
    execSync(`manus-md-to-pdf ${mdPath} ${pdfPath}`, {
      stdio: 'inherit',
    });

    console.log(`[PDF] PDF generated at ${pdfPath}`);

    // Read PDF file
    const pdfBuffer = await fs.readFile(pdfPath);
    const pdfSize = pdfBuffer.length;

    // Upload to S3
    const pdfKey = `reports/${options.userId}/${Date.now()}-report-${verification.id}.pdf`;
    const { url: pdfUrl } = await storagePut(pdfKey, pdfBuffer, 'application/pdf');

    console.log(`[PDF] PDF uploaded to S3: ${pdfUrl}`);

    // Clean up temporary files
    await fs.unlink(mdPath).catch(() => {});
    await fs.unlink(pdfPath).catch(() => {});

    return {
      pdfKey,
      pdfUrl,
      pdfSize,
    };
  } catch (error) {
    console.error(`[PDF] Failed to generate PDF report:`, error);
    throw error;
  }
}
