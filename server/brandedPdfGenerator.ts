/**
 * VENTURR VALDT - Branded Legal PDF Generator
 * 
 * Generates professionally formatted, legally binding PDF reports with:
 * - Official VENTURR VALDT branding
 * - Legal disclaimer and terms
 * - Digital verification seal
 * - Proper document structure for legal use
 * - Clear contractor identification
 */

import { exec } from "child_process";
import { promisify } from "util";
import { writeFile, unlink, readFile } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { randomBytes, createHash } from "crypto";

const execAsync = promisify(exec);

interface ValidtReportData {
  coverPage: {
    reportId: string;
    dateGenerated: string;
    contractorName: string;
    clientName: string;
    siteAddress: string;
    quoteTotalIncGst: number;
    quoteDate: string;
    quoteVersion?: string;
    tradeCategory: string;
    engineVersion: string;
    confidenceLabel: string;
  };
  executiveSummary: {
    overallStatus: string;
    consistentItemsCount: number;
    clarificationItemsCount: number;
    keyDrivers: Record<string, string | undefined>;
    whatThisReportIs: string;
    whatThisReportIsNot: string;
  };
  evidenceRegister: {
    suppliedByUser: Array<{
      id: string;
      type: string;
      source: string;
      filename?: string;
      description: string;
    }>;
    extractedByValidt: Array<{
      id: string;
      type: string;
      source: string;
      description: string;
    }>;
    evidenceGaps: Array<{
      id: string;
      description: string;
      impact: string;
      severity: string;
    }>;
  };
  pillars: {
    pricing: { status: string; findings: any[]; clarifyingQuestions: any[] };
    materials: { status: string; findings: any[]; clarifyingQuestions: any[] };
    compliance: { status: string; findings: any[]; clarifyingQuestions: any[] };
    terms: { status: string; findings: any[]; clarifyingQuestions: any[] };
  };
  scoringLogic: {
    pillarStatuses: Record<string, string>;
    overallStatusRule: string;
    reasonForStatus: string;
  };
  actionableNextSteps: {
    topItems: string[];
    potentialStatusImprovement?: string;
  };
  assumptionsAndLimitations: {
    assumptions: Array<{ id: string; description: string }>;
    limitations: string[];
  };
  disclaimer: string;
}

/**
 * Generate a branded, legally-formatted PDF report
 */
export async function generateBrandedPdf(data: ValidtReportData): Promise<Buffer> {
  const htmlContent = generateBrandedHTML(data);
  
  // Create temporary files
  const tempId = randomBytes(16).toString("hex");
  const htmlPath = join(tmpdir(), `branded-report-${tempId}.html`);
  const pdfPath = join(tmpdir(), `branded-report-${tempId}.pdf`);

  try {
    // Write HTML to temp file
    await writeFile(htmlPath, htmlContent, "utf-8");

    // Generate PDF using weasyprint with high quality settings
    await execAsync(`weasyprint "${htmlPath}" "${pdfPath}" --optimize-images`);

    // Read PDF buffer
    const pdfBuffer = await readFile(pdfPath);
    return pdfBuffer;
  } finally {
    // Cleanup temp files
    try {
      await unlink(htmlPath);
      await unlink(pdfPath);
    } catch (error) {
      console.error("Failed to cleanup temp files:", error);
    }
  }
}

/**
 * Generate document hash for verification seal
 */
function generateDocumentHash(data: ValidtReportData): string {
  const content = JSON.stringify({
    reportId: data.coverPage.reportId,
    contractor: data.coverPage.contractorName,
    total: data.coverPage.quoteTotalIncGst,
    generated: data.coverPage.dateGenerated,
  });
  return createHash('sha256').update(content).digest('hex').substring(0, 16).toUpperCase();
}

function generateBrandedHTML(data: ValidtReportData): string {
  const documentHash = generateDocumentHash(data);
  const generatedDate = new Date(data.coverPage.dateGenerated);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Green': return '#10b981';
      case 'Amber': return '#f59e0b';
      case 'Red': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Green': return 'CONSISTENT';
      case 'Amber': return 'CLARIFICATION NEEDED';
      case 'Red': return 'CONCERNS IDENTIFIED';
      default: return 'PENDING';
    }
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VENTURR VALDT - Quote Verification Report - ${data.coverPage.reportId}</title>
  <style>
    @page {
      size: A4;
      margin: 1.5cm 2cm;
      @top-center {
        content: "VENTURR VALDT - CONFIDENTIAL";
        font-size: 8pt;
        color: #9ca3af;
        font-family: 'Segoe UI', sans-serif;
      }
      @bottom-left {
        content: "Report ID: ${data.coverPage.reportId}";
        font-size: 8pt;
        color: #6b7280;
        font-family: 'Segoe UI', sans-serif;
      }
      @bottom-center {
        content: "Page " counter(page) " of " counter(pages);
        font-size: 8pt;
        color: #6b7280;
        font-family: 'Segoe UI', sans-serif;
      }
      @bottom-right {
        content: "Generated: ${formatDate(data.coverPage.dateGenerated)}";
        font-size: 8pt;
        color: #6b7280;
        font-family: 'Segoe UI', sans-serif;
      }
    }

    @page :first {
      @top-center { content: none; }
      @bottom-left { content: none; }
      @bottom-center { content: none; }
      @bottom-right { content: none; }
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 10pt;
      line-height: 1.5;
      color: #1f2937;
    }

    /* Cover Page */
    .cover-page {
      page-break-after: always;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 2cm 0;
    }

    .cover-header {
      text-align: center;
      margin-bottom: 3cm;
    }

    .logo-container {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 15px;
      margin-bottom: 20px;
    }

    .logo-diamond {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%);
      clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
    }

    .logo-text {
      font-size: 36pt;
      font-weight: 700;
      color: #0891b2;
      letter-spacing: 2px;
    }

    .logo-subtext {
      font-size: 14pt;
      color: #6b7280;
      letter-spacing: 8px;
      margin-top: 5px;
    }

    .cover-title {
      font-size: 28pt;
      font-weight: 700;
      color: #111827;
      margin: 2cm 0 1cm;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .cover-subtitle {
      font-size: 14pt;
      color: #6b7280;
      margin-bottom: 2cm;
    }

    .cover-details {
      background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%);
      border-left: 4px solid #0891b2;
      padding: 25px 30px;
      margin: 0 auto;
      max-width: 500px;
      text-align: left;
    }

    .cover-detail-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid rgba(8, 145, 178, 0.1);
    }

    .cover-detail-row:last-child {
      border-bottom: none;
    }

    .cover-detail-label {
      font-weight: 500;
      color: #6b7280;
      font-size: 10pt;
    }

    .cover-detail-value {
      font-weight: 600;
      color: #111827;
      font-size: 10pt;
      text-align: right;
    }

    .contractor-highlight {
      background: #0891b2;
      color: white;
      padding: 3px 10px;
      border-radius: 4px;
      font-weight: 700;
    }

    .cover-footer {
      text-align: center;
      margin-top: auto;
    }

    .verification-seal {
      display: inline-block;
      border: 2px solid #0891b2;
      border-radius: 8px;
      padding: 15px 25px;
      margin-bottom: 20px;
    }

    .seal-title {
      font-size: 9pt;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 2px;
    }

    .seal-hash {
      font-family: 'Courier New', monospace;
      font-size: 12pt;
      font-weight: 700;
      color: #0891b2;
      margin-top: 5px;
    }

    .cover-legal {
      font-size: 8pt;
      color: #9ca3af;
      max-width: 400px;
      margin: 0 auto;
    }

    /* Content Pages */
    .section {
      margin-bottom: 25px;
      page-break-inside: avoid;
    }

    .section-title {
      font-size: 14pt;
      font-weight: 700;
      color: #0891b2;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e5e7eb;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .subsection-title {
      font-size: 11pt;
      font-weight: 600;
      color: #374151;
      margin: 15px 0 10px;
    }

    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 9pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .status-green { background: #d1fae5; color: #065f46; }
    .status-amber { background: #fef3c7; color: #92400e; }
    .status-red { background: #fee2e2; color: #991b1b; }

    .info-box {
      background: #f9fafb;
      border-left: 3px solid #0891b2;
      padding: 15px 20px;
      margin: 15px 0;
    }

    .warning-box {
      background: #fef3c7;
      border-left: 3px solid #f59e0b;
      padding: 15px 20px;
      margin: 15px 0;
    }

    .alert-box {
      background: #fee2e2;
      border-left: 3px solid #ef4444;
      padding: 15px 20px;
      margin: 15px 0;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
      font-size: 9pt;
    }

    th, td {
      padding: 10px 12px;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }

    th {
      background: #f3f4f6;
      font-weight: 600;
      color: #374151;
      text-transform: uppercase;
      font-size: 8pt;
      letter-spacing: 0.5px;
    }

    tr:nth-child(even) {
      background: #f9fafb;
    }

    .pillar-card {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 15px;
      margin: 10px 0;
      page-break-inside: avoid;
    }

    .pillar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .pillar-name {
      font-weight: 600;
      font-size: 11pt;
      color: #111827;
    }

    .finding-item {
      background: #f9fafb;
      border-radius: 6px;
      padding: 12px;
      margin: 8px 0;
    }

    .finding-fact {
      font-weight: 600;
      color: #111827;
      margin-bottom: 5px;
    }

    .finding-evidence {
      font-size: 9pt;
      color: #6b7280;
      font-style: italic;
    }

    .question-item {
      background: #fffbeb;
      border-left: 3px solid #f59e0b;
      padding: 10px 15px;
      margin: 8px 0;
    }

    .next-step-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 10px 0;
      border-bottom: 1px solid #f3f4f6;
    }

    .step-number {
      background: #0891b2;
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10pt;
      font-weight: 700;
      flex-shrink: 0;
    }

    .disclaimer-section {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
      margin-top: 30px;
      page-break-inside: avoid;
    }

    .disclaimer-title {
      font-size: 10pt;
      font-weight: 700;
      color: #374151;
      margin-bottom: 10px;
      text-transform: uppercase;
    }

    .disclaimer-text {
      font-size: 8pt;
      color: #6b7280;
      line-height: 1.6;
    }

    .signature-section {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
    }

    .signature-box {
      display: inline-block;
      border: 1px dashed #d1d5db;
      padding: 30px 50px;
      margin-top: 15px;
    }

    .signature-label {
      font-size: 9pt;
      color: #6b7280;
      margin-top: 10px;
    }

    .executive-summary-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin: 15px 0;
    }

    .summary-card {
      background: #f9fafb;
      border-radius: 8px;
      padding: 15px;
    }

    .summary-label {
      font-size: 9pt;
      color: #6b7280;
      margin-bottom: 5px;
    }

    .summary-value {
      font-size: 18pt;
      font-weight: 700;
      color: #111827;
    }

    .overall-status-banner {
      background: linear-gradient(135deg, ${getStatusColor(data.executiveSummary.overallStatus)}22 0%, ${getStatusColor(data.executiveSummary.overallStatus)}11 100%);
      border-left: 4px solid ${getStatusColor(data.executiveSummary.overallStatus)};
      padding: 20px;
      margin: 15px 0;
      text-align: center;
    }

    .overall-status-label {
      font-size: 10pt;
      color: #6b7280;
      margin-bottom: 5px;
    }

    .overall-status-value {
      font-size: 24pt;
      font-weight: 700;
      color: ${getStatusColor(data.executiveSummary.overallStatus)};
    }
  </style>
</head>
<body>
  <!-- COVER PAGE -->
  <div class="cover-page">
    <div class="cover-header">
      <div class="logo-container">
        <div class="logo-diamond"></div>
        <div>
          <div class="logo-text">VENTURR</div>
          <div class="logo-subtext">VALDT</div>
        </div>
      </div>
      
      <div class="cover-title">Quote Verification Report</div>
      <div class="cover-subtitle">AI-Powered Analysis for Australian Construction</div>
    </div>

    <div class="cover-details">
      <div class="cover-detail-row">
        <span class="cover-detail-label">Report ID</span>
        <span class="cover-detail-value" style="font-family: 'Courier New', monospace;">${data.coverPage.reportId}</span>
      </div>
      <div class="cover-detail-row">
        <span class="cover-detail-label">Contractor</span>
        <span class="cover-detail-value"><span class="contractor-highlight">${data.coverPage.contractorName}</span></span>
      </div>
      <div class="cover-detail-row">
        <span class="cover-detail-label">Client / Property</span>
        <span class="cover-detail-value">${data.coverPage.clientName}</span>
      </div>
      <div class="cover-detail-row">
        <span class="cover-detail-label">Site Address</span>
        <span class="cover-detail-value">${data.coverPage.siteAddress}</span>
      </div>
      <div class="cover-detail-row">
        <span class="cover-detail-label">Quote Total (inc. GST)</span>
        <span class="cover-detail-value" style="font-size: 12pt; color: #0891b2;">${formatCurrency(data.coverPage.quoteTotalIncGst)}</span>
      </div>
      <div class="cover-detail-row">
        <span class="cover-detail-label">Quote Date</span>
        <span class="cover-detail-value">${formatDate(data.coverPage.quoteDate)}</span>
      </div>
      <div class="cover-detail-row">
        <span class="cover-detail-label">Trade Category</span>
        <span class="cover-detail-value">${data.coverPage.tradeCategory}</span>
      </div>
      <div class="cover-detail-row">
        <span class="cover-detail-label">Confidence Level</span>
        <span class="cover-detail-value">${data.coverPage.confidenceLabel}</span>
      </div>
    </div>

    <div class="cover-footer">
      <div class="verification-seal">
        <div class="seal-title">Document Verification Hash</div>
        <div class="seal-hash">${documentHash}</div>
      </div>
      <div class="cover-legal">
        This document is generated by VENTURR VALDT for informational purposes only. 
        It does not constitute professional, legal, or engineering advice. 
        See full disclaimer on final page.
      </div>
    </div>
  </div>

  <!-- EXECUTIVE SUMMARY -->
  <div class="section">
    <h2 class="section-title">Executive Summary</h2>
    
    <div class="overall-status-banner">
      <div class="overall-status-label">Overall Verification Status</div>
      <div class="overall-status-value">${getStatusLabel(data.executiveSummary.overallStatus)}</div>
    </div>

    <div class="executive-summary-grid">
      <div class="summary-card">
        <div class="summary-label">Consistent Items</div>
        <div class="summary-value" style="color: #10b981;">${data.executiveSummary.consistentItemsCount}</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">Items Needing Clarification</div>
        <div class="summary-value" style="color: #f59e0b;">${data.executiveSummary.clarificationItemsCount}</div>
      </div>
    </div>

    <div class="info-box">
      <h4 class="subsection-title">What This Report Is</h4>
      <p>${data.executiveSummary.whatThisReportIs}</p>
    </div>

    <div class="warning-box">
      <h4 class="subsection-title">What This Report Is NOT</h4>
      <p>${data.executiveSummary.whatThisReportIsNot}</p>
    </div>
  </div>

  <!-- PILLAR ANALYSIS -->
  <div class="section">
    <h2 class="section-title">Verification Pillars</h2>
    
    ${['pricing', 'materials', 'compliance', 'terms'].map(pillar => {
      const pillarData = data.pillars[pillar as keyof typeof data.pillars];
      const pillarNames: Record<string, string> = {
        pricing: 'Pricing Analysis',
        materials: 'Materials Verification',
        compliance: 'Compliance Check',
        terms: 'Terms & Conditions'
      };
      return `
        <div class="pillar-card">
          <div class="pillar-header">
            <span class="pillar-name">${pillarNames[pillar]}</span>
            <span class="status-badge status-${pillarData.status.toLowerCase()}">${getStatusLabel(pillarData.status)}</span>
          </div>
          
          ${pillarData.findings.length > 0 ? `
            <h4 class="subsection-title">Findings</h4>
            ${pillarData.findings.map((finding: any) => `
              <div class="finding-item">
                <div class="finding-fact">${finding.fact}</div>
                <div class="finding-evidence">Evidence: ${finding.evidence}</div>
              </div>
            `).join('')}
          ` : '<p style="color: #6b7280; font-style: italic;">No specific findings for this pillar.</p>'}
          
          ${pillarData.clarifyingQuestions.length > 0 ? `
            <h4 class="subsection-title">Clarifying Questions</h4>
            ${pillarData.clarifyingQuestions.map((q: any) => `
              <div class="question-item">${q.question}</div>
            `).join('')}
          ` : ''}
        </div>
      `;
    }).join('')}
  </div>

  <!-- EVIDENCE REGISTER -->
  <div class="section">
    <h2 class="section-title">Evidence Register</h2>
    
    <h4 class="subsection-title">Documents Supplied</h4>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Source</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        ${data.evidenceRegister.suppliedByUser.map(item => `
          <tr>
            <td><strong>${item.id}</strong></td>
            <td>${item.source}</td>
            <td>${item.description}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    ${data.evidenceRegister.evidenceGaps.length > 0 ? `
      <h4 class="subsection-title">Evidence Gaps</h4>
      <div class="alert-box">
        ${data.evidenceRegister.evidenceGaps.map(gap => `
          <p><strong>${gap.id}:</strong> ${gap.description} (Impact: ${gap.impact}, Severity: ${gap.severity})</p>
        `).join('')}
      </div>
    ` : ''}
  </div>

  <!-- ACTIONABLE NEXT STEPS -->
  <div class="section">
    <h2 class="section-title">Recommended Next Steps</h2>
    
    ${data.actionableNextSteps.topItems.map((step, index) => `
      <div class="next-step-item">
        <div class="step-number">${index + 1}</div>
        <div>${step}</div>
      </div>
    `).join('')}

    ${data.actionableNextSteps.potentialStatusImprovement ? `
      <div class="info-box" style="margin-top: 20px;">
        <strong>Potential Improvement:</strong> ${data.actionableNextSteps.potentialStatusImprovement}
      </div>
    ` : ''}
  </div>

  <!-- ASSUMPTIONS AND LIMITATIONS -->
  <div class="section">
    <h2 class="section-title">Assumptions & Limitations</h2>
    
    <h4 class="subsection-title">Assumptions Made</h4>
    <ul>
      ${data.assumptionsAndLimitations.assumptions.map(a => `
        <li><strong>${a.id}:</strong> ${a.description}</li>
      `).join('')}
    </ul>

    <h4 class="subsection-title">Limitations</h4>
    <ul>
      ${data.assumptionsAndLimitations.limitations.map(l => `
        <li>${l}</li>
      `).join('')}
    </ul>
  </div>

  <!-- LEGAL DISCLAIMER -->
  <div class="disclaimer-section">
    <div class="disclaimer-title">Important Legal Disclaimer</div>
    <div class="disclaimer-text">
      ${data.disclaimer}
      <br><br>
      <strong>Document Verification:</strong> This document was generated by VENTURR VALDT on ${formatDate(data.coverPage.dateGenerated)}. 
      The document verification hash (${documentHash}) can be used to verify the authenticity of this report.
      <br><br>
      <strong>Governing Law:</strong> This report is prepared in accordance with Australian consumer protection laws and 
      is intended for use within Australia. Any disputes arising from the use of this report shall be governed by the 
      laws of the relevant Australian state or territory.
      <br><br>
      <strong>Copyright:</strong> © ${generatedDate.getFullYear()} VENTURR PTY LTD. All rights reserved. This report may not be 
      reproduced, distributed, or transmitted in any form without prior written permission.
    </div>
  </div>

  <!-- SIGNATURE SECTION -->
  <div class="signature-section">
    <h4 class="subsection-title">Acknowledgment of Receipt</h4>
    <p style="font-size: 9pt; color: #6b7280; margin-bottom: 15px;">
      By signing below, I acknowledge that I have received and reviewed this verification report.
    </p>
    
    <div style="display: flex; gap: 50px;">
      <div>
        <div class="signature-box"></div>
        <div class="signature-label">Signature</div>
      </div>
      <div>
        <div class="signature-box" style="padding: 30px 80px;"></div>
        <div class="signature-label">Date</div>
      </div>
    </div>
  </div>

</body>
</html>
`;
}

export { ValidtReportData };
