/**
 * VENTURR VALDT - Verification Report Generator
 * 
 * This module generates comprehensive verification reports with:
 * - Executive summary
 * - Detailed scoring breakdown
 * - Market analysis
 * - Compliance findings
 * - Actionable recommendations
 * - Proper citations to Australian standards
 */

import { ComplianceScore, Recommendation, Citation } from "./complianceEngine";
import { ParsedQuote } from "./quoteParser";
import { PriceAnalysisResult } from "./marketRateEngine";

// ============================================================================
// TYPES
// ============================================================================

export interface VerificationReport {
  id: string;
  generatedAt: string;
  version: string;
  
  // Executive Summary
  summary: {
    overallScore: number;
    riskLevel: string;
    riskColor: string;
    verdict: string;
    keyFindings: string[];
    topRecommendations: string[];
  };
  
  // Contractor Assessment
  contractor: {
    name: string | null;
    abn: string | null;
    abnStatus: "verified" | "invalid" | "not_provided";
    license: string | null;
    licenseStatus: "verified" | "unverified" | "not_provided";
    contactInfo: {
      phone: string | null;
      email: string | null;
      address: string | null;
    };
    score: number;
    findings: string[];
  };
  
  // Pricing Analysis
  pricing: {
    quotedAmount: number | null;
    marketRate: number | null;
    variance: number | null;
    varianceAssessment: string;
    gstAmount: number | null;
    hasItemizedBreakdown: boolean;
    score: number;
    findings: string[];
    marketData: {
      source: string;
      sampleSize: number;
      region: string;
      confidence: number;
    } | null;
  };
  
  // Scope Assessment
  scope: {
    projectType: string;
    completeness: number;
    missingItems: string[];
    lineItemCount: number;
    score: number;
    findings: string[];
  };
  
  // Technical Compliance
  compliance: {
    standardsChecked: {
      standard: string;
      status: string;
      finding: string;
    }[];
    score: number;
    findings: string[];
  };
  
  // Warranty Assessment
  warranty: {
    workmanship: string | null;
    materials: string | null;
    meetsMinimum: boolean;
    score: number;
    findings: string[];
  };
  
  // Recommendations
  recommendations: {
    critical: Recommendation[];
    high: Recommendation[];
    medium: Recommendation[];
    low: Recommendation[];
  };
  
  // Citations
  citations: Citation[];
  
  // Metadata
  metadata: {
    quoteId: number;
    fileName: string;
    projectAddress: string | null;
    projectArea: number | null;
    state: string;
    parsingConfidence: number;
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateReportId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `VR-${timestamp}-${random}`.toUpperCase();
}

function getRiskColor(riskLevel: string): string {
  switch (riskLevel) {
    case "low": return "#22c55e"; // green
    case "medium": return "#f59e0b"; // amber
    case "high": return "#ef4444"; // red
    case "critical": return "#7f1d1d"; // dark red
    default: return "#6b7280"; // gray
  }
}

function generateVerdict(score: number, riskLevel: string): string {
  if (score >= 85) {
    return "This quote meets high standards for contractor credentials, pricing, scope completeness, and technical compliance. Recommended to proceed with standard due diligence.";
  } else if (score >= 70) {
    return "This quote is generally acceptable but has some areas requiring attention. Review the recommendations before proceeding.";
  } else if (score >= 50) {
    return "This quote has significant concerns that should be addressed. Consider requesting clarifications or obtaining additional quotes.";
  } else {
    return "This quote has critical issues that present substantial risk. Strongly recommend obtaining alternative quotes and addressing concerns before proceeding.";
  }
}

function extractKeyFindings(complianceScore: ComplianceScore): string[] {
  const findings: string[] = [];
  
  // Add most important findings from each category
  if (complianceScore.breakdown.contractor.score < 70) {
    findings.push(`Contractor credentials concern: ${complianceScore.breakdown.contractor.findings[0]}`);
  }
  
  if (complianceScore.breakdown.pricing.marketComparison) {
    const mc = complianceScore.breakdown.pricing.marketComparison;
    if (mc.assessment !== "fair") {
      findings.push(`Pricing: Quote is ${Math.abs(mc.variance)}% ${mc.variance > 0 ? "above" : "below"} market rate`);
    } else {
      findings.push("Pricing is within fair market range");
    }
  }
  
  if (complianceScore.breakdown.scope.missingItems.length > 0) {
    findings.push(`Scope: ${complianceScore.breakdown.scope.missingItems.length} expected items not found in quote`);
  }
  
  if (complianceScore.breakdown.compliance.score < 80) {
    const nonCompliant = complianceScore.breakdown.compliance.standardsChecked.filter(s => s.status !== "compliant");
    if (nonCompliant.length > 0) {
      findings.push(`Technical: ${nonCompliant.length} compliance items need attention`);
    }
  }
  
  if (!complianceScore.breakdown.warranty.meetsMinimum) {
    findings.push("Warranty terms below industry minimum standards");
  }
  
  return findings.slice(0, 5);
}

function formatCurrency(cents: number | null): string {
  if (cents === null) return "N/A";
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD"
  }).format(cents / 100);
}

// ============================================================================
// MAIN REPORT GENERATOR
// ============================================================================

export function generateVerificationReport(
  quote: ParsedQuote,
  complianceScore: ComplianceScore,
  quoteId: number,
  fileName: string,
  projectArea: number | null,
  state: string
): VerificationReport {
  const reportId = generateReportId();
  const now = new Date().toISOString();
  
  // Group recommendations by priority
  const recommendations = complianceScore.recommendations || [];
  const recommendationsByPriority = {
    critical: recommendations.filter(r => r.priority === "critical"),
    high: recommendations.filter(r => r.priority === "high"),
    medium: recommendations.filter(r => r.priority === "medium"),
    low: recommendations.filter(r => r.priority === "low")
  };
  
  // Get top recommendations for summary
  const topRecommendations = [
    ...recommendationsByPriority.critical,
    ...recommendationsByPriority.high
  ].slice(0, 3).map(r => r.title);
  
  return {
    id: reportId,
    generatedAt: now,
    version: "2.0.0",
    
    summary: {
      overallScore: complianceScore.overall,
      riskLevel: complianceScore.riskLevel,
      riskColor: getRiskColor(complianceScore.riskLevel),
      verdict: generateVerdict(complianceScore.overall, complianceScore.riskLevel),
      keyFindings: extractKeyFindings(complianceScore),
      topRecommendations
    },
    
    contractor: {
      name: quote.contractor.name,
      abn: quote.contractor.abn,
      abnStatus: quote.contractor.abn 
        ? (quote.contractor.abnValid ? "verified" : "invalid")
        : "not_provided",
      license: quote.contractor.licenseNumber,
      licenseStatus: quote.contractor.licenseNumber ? "unverified" : "not_provided",
      contactInfo: {
        phone: quote.contractor.phone,
        email: quote.contractor.email,
        address: quote.contractor.address
      },
      score: complianceScore.breakdown.contractor.score,
      findings: complianceScore.breakdown.contractor.findings
    },
    
    pricing: {
      quotedAmount: quote.pricing.totalAmount,
      marketRate: complianceScore.breakdown.pricing.marketComparison?.marketPrice || null,
      variance: complianceScore.breakdown.pricing.marketComparison?.variance || null,
      varianceAssessment: complianceScore.breakdown.pricing.marketComparison?.assessment || "unknown",
      gstAmount: quote.pricing.gstAmount,
      hasItemizedBreakdown: complianceScore.breakdown.pricing.hasItemizedBreakdown,
      score: complianceScore.breakdown.pricing.score,
      findings: complianceScore.breakdown.pricing.findings,
      marketData: complianceScore.breakdown.pricing.marketComparison ? {
        source: complianceScore.breakdown.pricing.marketComparison.marketData.source,
        sampleSize: complianceScore.breakdown.pricing.marketComparison.marketData.sampleSize,
        region: complianceScore.breakdown.pricing.marketComparison.marketData.region,
        confidence: complianceScore.breakdown.pricing.marketComparison.confidence
      } : null
    },
    
    scope: {
      projectType: quote.project.type || "Unknown",
      completeness: complianceScore.breakdown.scope.completeness,
      missingItems: complianceScore.breakdown.scope.missingItems,
      lineItemCount: quote.lineItems.length,
      score: complianceScore.breakdown.scope.score,
      findings: complianceScore.breakdown.scope.findings
    },
    
    compliance: {
      standardsChecked: complianceScore.breakdown.compliance.standardsChecked.map(s => ({
        standard: s.standardId,
        status: s.status,
        finding: s.findings[0] || ""
      })),
      score: complianceScore.breakdown.compliance.score,
      findings: complianceScore.breakdown.compliance.findings
    },
    
    warranty: {
      workmanship: complianceScore.breakdown.warranty.workmanshipYears 
        ? `${complianceScore.breakdown.warranty.workmanshipYears} years`
        : null,
      materials: complianceScore.breakdown.warranty.materialsYears
        ? `${complianceScore.breakdown.warranty.materialsYears} years`
        : null,
      meetsMinimum: complianceScore.breakdown.warranty.meetsMinimum,
      score: complianceScore.breakdown.warranty.score,
      findings: complianceScore.breakdown.warranty.findings
    },
    
    recommendations: recommendationsByPriority,
    
    citations: complianceScore.citations,
    
    metadata: {
      quoteId,
      fileName,
      projectAddress: quote.project.address,
      projectArea,
      state,
      parsingConfidence: quote.confidence
    }
  };
}

// ============================================================================
// REPORT FORMATTING
// ============================================================================

/**
 * Generate a text summary of the report for display
 */
export function generateReportSummaryText(report: VerificationReport): string {
  const lines: string[] = [];
  
  lines.push(`VENTURR VALDT VERIFICATION REPORT`);
  lines.push(`Report ID: ${report.id}`);
  lines.push(`Generated: ${new Date(report.generatedAt).toLocaleString("en-AU")}`);
  lines.push(``);
  lines.push(`═══════════════════════════════════════════════════════════════`);
  lines.push(`EXECUTIVE SUMMARY`);
  lines.push(`═══════════════════════════════════════════════════════════════`);
  lines.push(``);
  lines.push(`Overall Score: ${report.summary.overallScore}/100`);
  lines.push(`Risk Level: ${report.summary.riskLevel.toUpperCase()}`);
  lines.push(``);
  lines.push(`Verdict:`);
  lines.push(report.summary.verdict);
  lines.push(``);
  lines.push(`Key Findings:`);
  report.summary.keyFindings.forEach((f, i) => {
    lines.push(`  ${i + 1}. ${f}`);
  });
  lines.push(``);
  lines.push(`═══════════════════════════════════════════════════════════════`);
  lines.push(`SCORE BREAKDOWN`);
  lines.push(`═══════════════════════════════════════════════════════════════`);
  lines.push(``);
  lines.push(`Contractor Credentials: ${report.contractor.score}/100`);
  lines.push(`Pricing Analysis:       ${report.pricing.score}/100`);
  lines.push(`Scope Completeness:     ${report.scope.score}/100`);
  lines.push(`Technical Compliance:   ${report.compliance.score}/100`);
  lines.push(`Warranty Terms:         ${report.warranty.score}/100`);
  lines.push(``);
  
  if (report.pricing.quotedAmount) {
    lines.push(`═══════════════════════════════════════════════════════════════`);
    lines.push(`PRICING ANALYSIS`);
    lines.push(`═══════════════════════════════════════════════════════════════`);
    lines.push(``);
    lines.push(`Quoted Amount: ${formatCurrency(report.pricing.quotedAmount)}`);
    if (report.pricing.marketRate) {
      lines.push(`Market Rate:   ${formatCurrency(report.pricing.marketRate)}`);
      lines.push(`Variance:      ${report.pricing.variance}% (${report.pricing.varianceAssessment.replace("_", " ")})`);
    }
    if (report.pricing.marketData) {
      lines.push(``);
      lines.push(`Market Data Source: ${report.pricing.marketData.source}`);
      lines.push(`Confidence: ${report.pricing.marketData.confidence}%`);
    }
    lines.push(``);
  }
  
  if (report.recommendations.critical.length > 0 || report.recommendations.high.length > 0) {
    lines.push(`═══════════════════════════════════════════════════════════════`);
    lines.push(`PRIORITY RECOMMENDATIONS`);
    lines.push(`═══════════════════════════════════════════════════════════════`);
    lines.push(``);
    
    [...report.recommendations.critical, ...report.recommendations.high].forEach((r, i) => {
      lines.push(`${i + 1}. [${r.priority.toUpperCase()}] ${r.title}`);
      lines.push(`   ${r.description}`);
      lines.push(`   Action: ${r.action}`);
      lines.push(`   Reference: ${r.reference}`);
      lines.push(``);
    });
  }
  
  lines.push(`═══════════════════════════════════════════════════════════════`);
  lines.push(`REFERENCES`);
  lines.push(`═══════════════════════════════════════════════════════════════`);
  lines.push(``);
  report.citations.forEach(c => {
    lines.push(`• ${c.standard} - ${c.title}`);
  });
  lines.push(``);
  lines.push(`───────────────────────────────────────────────────────────────`);
  lines.push(`This report is generated by VENTURR VALDT using Australian`);
  lines.push(`construction standards and market data. Always verify critical`);
  lines.push(`information independently before making decisions.`);
  lines.push(`───────────────────────────────────────────────────────────────`);
  
  return lines.join("\n");
}

// ============================================================================
// EXPORT
// ============================================================================

export const REPORT_GENERATOR = {
  generateVerificationReport,
  generateReportSummaryText,
  generateReportId,
  formatCurrency
};
