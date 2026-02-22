import { exec } from "child_process";
import { promisify } from "util";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { randomBytes } from "crypto";

const execAsync = promisify(exec);

interface VerificationReportData {
  quoteId: number;
  fileName: string;
  uploadedAt: Date;
  status: string;
  verificationScore?: number;
  pricingAnalysis?: any;
  complianceIssues?: any[];
  materialVerification?: any;
  recommendations?: string[];
  userName?: string;
  userEmail?: string;
  australianStandardsCompliance?: {
    overallCompliance: "compliant" | "non-compliant" | "partial";
    confidenceScore: number;
    verifiedStandards: Array<{
      standardId: string;
      title: string;
      status: "compliant" | "non-compliant" | "not-applicable";
      findings: string[];
    }>;
    findings: Array<{
      category: string;
      severity: "high" | "medium" | "low";
      message: string;
      standardReference: string;
    }>;
  };
}

export async function generateVerificationPDF(data: VerificationReportData): Promise<Buffer> {
  const htmlContent = generateHTMLReport(data);
  
  // Create temporary files
  const tempId = randomBytes(16).toString("hex");
  const htmlPath = join(tmpdir(), `report-${tempId}.html`);
  const pdfPath = join(tmpdir(), `report-${tempId}.pdf`);

  try {
    // Write HTML to temp file
    await writeFile(htmlPath, htmlContent, "utf-8");

    // Generate PDF using weasyprint
    await execAsync(`weasyprint "${htmlPath}" "${pdfPath}"`);

    // Read PDF buffer
    const { readFile } = await import("fs/promises");
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

function generateHTMLReport(data: VerificationReportData): string {
  const {
    quoteId,
    fileName,
    uploadedAt,
    status,
    verificationScore,
    pricingAnalysis,
    complianceIssues,
    materialVerification,
    recommendations,
    userName,
    userEmail,
  } = data;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-AU", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "#10b981";
      case "pending":
        return "#f59e0b";
      case "failed":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getScoreColor = (score?: number) => {
    if (!score) return "#6b7280";
    if (score >= 80) return "#10b981";
    if (score >= 60) return "#f59e0b";
    return "#ef4444";
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VENTURR VALDT - Verification Report #${quoteId}</title>
  <style>
    @page {
      size: A4;
      margin: 2cm;
      @top-right {
        content: "Page " counter(page) " of " counter(pages);
        font-size: 10px;
        color: #6b7280;
      }
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #1f2937;
    }

    .header {
      border-bottom: 3px solid #0891b2;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 10px;
    }

    .logo-icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%);
      clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
    }

    .logo-text {
      font-size: 24px;
      font-weight: 700;
      color: #0891b2;
    }

    .report-title {
      font-size: 20px;
      font-weight: 600;
      color: #111827;
      margin-top: 10px;
    }

    .report-meta {
      display: flex;
      justify-content: space-between;
      margin-top: 15px;
      padding: 15px;
      background: #f9fafb;
      border-radius: 8px;
    }

    .meta-item {
      font-size: 10pt;
    }

    .meta-label {
      color: #6b7280;
      font-weight: 500;
    }

    .meta-value {
      color: #111827;
      font-weight: 600;
    }

    .section {
      margin-bottom: 30px;
      page-break-inside: avoid;
    }

    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #111827;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e5e7eb;
    }

    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 10pt;
      font-weight: 600;
      text-transform: uppercase;
      color: white;
    }

    .score-card {
      background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%);
      border-left: 4px solid ${getScoreColor(verificationScore)};
      padding: 20px;
      border-radius: 8px;
      margin: 15px 0;
    }

    .score-value {
      font-size: 48px;
      font-weight: 700;
      color: ${getScoreColor(verificationScore)};
      line-height: 1;
    }

    .score-label {
      font-size: 12pt;
      color: #6b7280;
      margin-top: 5px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin: 15px 0;
    }

    .info-card {
      background: #f9fafb;
      padding: 15px;
      border-radius: 8px;
      border-left: 3px solid #0891b2;
    }

    .info-label {
      font-size: 10pt;
      color: #6b7280;
      font-weight: 500;
      margin-bottom: 5px;
    }

    .info-value {
      font-size: 12pt;
      color: #111827;
      font-weight: 600;
    }

    .issue-list {
      list-style: none;
    }

    .issue-item {
      padding: 12px;
      margin-bottom: 10px;
      border-left: 3px solid #ef4444;
      background: #fef2f2;
      border-radius: 4px;
    }

    .issue-severity {
      font-weight: 600;
      color: #dc2626;
      text-transform: uppercase;
      font-size: 9pt;
    }

    .issue-description {
      margin-top: 5px;
      color: #7f1d1d;
    }

    .recommendation-list {
      list-style: none;
    }

    .recommendation-item {
      padding: 12px;
      margin-bottom: 10px;
      border-left: 3px solid #10b981;
      background: #f0fdf4;
      border-radius: 4px;
    }

    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      font-size: 9pt;
      color: #6b7280;
    }

    .footer-logo {
      margin-bottom: 10px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }

    th, td {
      padding: 10px;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }

    th {
      background: #f9fafb;
      font-weight: 600;
      color: #374151;
      font-size: 10pt;
    }

    td {
      font-size: 10pt;
      color: #1f2937;
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="header">
    <div class="logo">
      <div class="logo-icon"></div>
      <div class="logo-text">VENTURR VALDT</div>
    </div>
    <div class="report-title">Quote Verification Report</div>
    <div class="report-meta">
      <div class="meta-item">
        <div class="meta-label">Report ID</div>
        <div class="meta-value">#${quoteId}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Generated</div>
        <div class="meta-value">${formatDate(new Date())}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Status</div>
        <div class="meta-value">
          <span class="status-badge" style="background-color: ${getStatusColor(status)}">
            ${status}
          </span>
        </div>
      </div>
    </div>
  </div>

  <!-- Quote Information -->
  <div class="section">
    <h2 class="section-title">Quote Information</h2>
    <div class="info-grid">
      <div class="info-card">
        <div class="info-label">File Name</div>
        <div class="info-value">${fileName}</div>
      </div>
      <div class="info-card">
        <div class="info-label">Upload Date</div>
        <div class="info-value">${formatDate(uploadedAt)}</div>
      </div>
      ${userName ? `
      <div class="info-card">
        <div class="info-label">Submitted By</div>
        <div class="info-value">${userName}</div>
      </div>
      ` : ''}
      ${userEmail ? `
      <div class="info-card">
        <div class="info-label">Contact Email</div>
        <div class="info-value">${userEmail}</div>
      </div>
      ` : ''}
    </div>
  </div>

  <!-- Verification Score -->
  ${verificationScore !== undefined ? `
  <div class="section">
    <h2 class="section-title">Verification Score</h2>
    <div class="score-card">
      <div class="score-value">${verificationScore}/100</div>
      <div class="score-label">Overall Verification Score</div>
    </div>
  </div>
  ` : ''}

  <!-- Pricing Analysis -->
  ${pricingAnalysis ? `
  <div class="section">
    <h2 class="section-title">Pricing Analysis</h2>
    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th>Quoted Price</th>
          <th>Market Average</th>
          <th>Variance</th>
        </tr>
      </thead>
      <tbody>
        ${pricingAnalysis.items?.map((item: any) => `
          <tr>
            <td>${item.description || 'N/A'}</td>
            <td>$${item.quotedPrice?.toFixed(2) || '0.00'}</td>
            <td>$${item.marketAverage?.toFixed(2) || '0.00'}</td>
            <td style="color: ${item.variance > 0 ? '#ef4444' : '#10b981'}">
              ${item.variance > 0 ? '+' : ''}${item.variance?.toFixed(1) || '0'}%
            </td>
          </tr>
        `).join('') || '<tr><td colspan="4">No pricing data available</td></tr>'}
      </tbody>
    </table>
  </div>
  ` : ''}

  <!-- Compliance Issues -->
  ${complianceIssues && complianceIssues.length > 0 ? `
  <div class="section">
    <h2 class="section-title">Compliance Issues</h2>
    <ul class="issue-list">
      ${complianceIssues.map((issue: any) => `
        <li class="issue-item">
          <div class="issue-severity">${issue.severity || 'Medium'} Severity</div>
          <div class="issue-description">${issue.description || 'No description provided'}</div>
        </li>
      `).join('')}
    </ul>
  </div>
  ` : ''}

  <!-- Material Verification -->
  ${materialVerification ? `
  <div class="section">
    <h2 class="section-title">Material Verification</h2>
    <table>
      <thead>
        <tr>
          <th>Material</th>
          <th>Specified</th>
          <th>Verified</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${materialVerification.materials?.map((material: any) => `
          <tr>
            <td>${material.name || 'N/A'}</td>
            <td>${material.specified || 'N/A'}</td>
            <td>${material.verified || 'N/A'}</td>
            <td style="color: ${material.status === 'pass' ? '#10b981' : '#ef4444'}">
              ${material.status || 'Unknown'}
            </td>
          </tr>
        `).join('') || '<tr><td colspan="4">No material data available</td></tr>'}
      </tbody>
    </table>
  </div>
  ` : ''}

  <!-- Australian Standards Compliance -->
  ${data.australianStandardsCompliance ? `
  <div class="section">
    <h2 class="section-title">Australian Standards Compliance</h2>
    <div class="compliance-header">
      <div class="compliance-badge" style="background-color: ${
        data.australianStandardsCompliance.overallCompliance === 'compliant' ? '#10b981' :
        data.australianStandardsCompliance.overallCompliance === 'partial' ? '#f59e0b' : '#ef4444'
      }; color: white; padding: 8px 16px; border-radius: 8px; display: inline-block; font-weight: 600;">
        ${data.australianStandardsCompliance.overallCompliance.toUpperCase()}
      </div>
      <div style="margin-top: 8px; color: #6b7280; font-size: 10pt;">
        Confidence Score: ${data.australianStandardsCompliance.confidenceScore}%
      </div>
      <div style="margin-top: 4px; color: #6b7280; font-size: 9pt; font-style: italic;">
        Verified against NCC 2022, HB-39, AS/NZS, and WHS Act 2011
      </div>
    </div>
    
    <h3 style="font-size: 13px; font-weight: 600; margin-top: 20px; margin-bottom: 10px; color: #374151;">Verified Standards</h3>
    <table>
      <thead>
        <tr>
          <th>Standard</th>
          <th>Title</th>
          <th>Status</th>
          <th>Findings</th>
        </tr>
      </thead>
      <tbody>
        ${data.australianStandardsCompliance.verifiedStandards.map((standard) => `
          <tr>
            <td style="font-family: monospace; font-size: 9pt;">${standard.standardId}</td>
            <td>${standard.title}</td>
            <td style="color: ${
              standard.status === 'compliant' ? '#10b981' :
              standard.status === 'non-compliant' ? '#ef4444' : '#6b7280'
            }; font-weight: 600;">
              ${standard.status === 'compliant' ? '✓ Compliant' :
                standard.status === 'non-compliant' ? '✗ Non-Compliant' : '- Not Applicable'}
            </td>
            <td style="font-size: 9pt;">
              ${standard.findings.length > 0 ? 
                standard.findings.map(f => `• ${f}`).join('<br>') : 
                'No findings'
              }
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    
    ${data.australianStandardsCompliance.findings.length > 0 ? `
    <h3 style="font-size: 13px; font-weight: 600; margin-top: 20px; margin-bottom: 10px; color: #374151;">Compliance Issues</h3>
    <ul class="issue-list">
      ${data.australianStandardsCompliance.findings.map((finding) => `
        <li class="issue-item">
          <div class="issue-severity" style="color: ${
            finding.severity === 'high' ? '#ef4444' :
            finding.severity === 'medium' ? '#f59e0b' : '#6b7280'
          }; font-weight: 600;">
            ${finding.severity.toUpperCase()} SEVERITY
          </div>
          <div class="issue-description">${finding.message}</div>
          <div style="font-size: 9pt; color: #6b7280; margin-top: 4px; font-family: monospace;">
            ${finding.standardReference}
          </div>
        </li>
      `).join('')}
    </ul>
    ` : ''}
  </div>
  ` : ''}

  <!-- Recommendations -->
  ${recommendations && recommendations.length > 0 ? `
  <div class="section">
    <h2 class="section-title">Recommendations</h2>
    <ul class="recommendation-list">
      ${recommendations.map((rec: string) => `
        <li class="recommendation-item">${rec}</li>
      `).join('')}
    </ul>
  </div>
  ` : ''}

  <!-- Footer -->
  <div class="footer">
    <div class="footer-logo">
      <strong>VENTURR VALDT</strong> - AI-Powered Quote Verification
    </div>
    <p>This report was generated automatically by VENTURR VALDT's AI verification system.</p>
    <p>For questions or support, contact support@venturr.com</p>
    <p style="margin-top: 10px;">© 2025 VENTURR. All rights reserved.</p>
  </div>
</body>
</html>
  `.trim();
}
