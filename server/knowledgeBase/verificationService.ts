/**
 * VENTURR VALDT - Main Verification Service
 * 
 * This is the core service that orchestrates the entire verification process:
 * 1. Parse quote document
 * 2. Extract and validate data
 * 3. Calculate compliance scores
 * 4. Generate verification report
 * 5. Store results for self-improvement
 * 
 * This service operates WITHOUT AI dependency for core functionality,
 * using deterministic algorithms backed by Australian standards.
 */

import { QUOTE_PARSER, ParsedQuote, parseQuoteText } from "./quoteParser";
import { COMPLIANCE_ENGINE, calculateComplianceScore, ComplianceScore } from "./complianceEngine";
import { MARKET_RATE_ENGINE } from "./marketRateEngine";
import { REPORT_GENERATOR, generateVerificationReport, VerificationReport } from "./reportGenerator";
import { KNOWLEDGE_BASE } from "./australianStandards";
import { getDb } from "../db";
import { quotes, verifications, reports } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

// ============================================================================
// TYPES
// ============================================================================

export interface VerificationInput {
  quoteId: number;
  rawText: string;
  fileName: string;
  projectArea?: number; // sqm
  state?: string;
  isMetro?: boolean;
  projectType?: string;
}

export interface VerificationResult {
  success: boolean;
  quoteId: number;
  parsedQuote: ParsedQuote;
  complianceScore: ComplianceScore;
  report: VerificationReport;
  processingTime: number; // ms
  error?: string;
}

// ============================================================================
// STATE DETECTION
// ============================================================================

function detectState(text: string, address: string | null): string {
  const combined = `${text} ${address || ""}`.toUpperCase();
  
  const statePatterns = [
    { state: "NSW", patterns: ["NSW", "NEW SOUTH WALES", "SYDNEY", "NEWCASTLE", "WOLLONGONG"] },
    { state: "VIC", patterns: ["VIC", "VICTORIA", "MELBOURNE", "GEELONG"] },
    { state: "QLD", patterns: ["QLD", "QUEENSLAND", "BRISBANE", "GOLD COAST", "SUNSHINE COAST"] },
    { state: "WA", patterns: ["WA", "WESTERN AUSTRALIA", "PERTH"] },
    { state: "SA", patterns: ["SA", "SOUTH AUSTRALIA", "ADELAIDE"] },
    { state: "TAS", patterns: ["TAS", "TASMANIA", "HOBART"] },
    { state: "NT", patterns: ["NT", "NORTHERN TERRITORY", "DARWIN"] },
    { state: "ACT", patterns: ["ACT", "AUSTRALIAN CAPITAL TERRITORY", "CANBERRA"] }
  ];
  
  for (const { state, patterns } of statePatterns) {
    if (patterns.some(p => combined.includes(p))) {
      return state;
    }
  }
  
  return "NSW"; // Default to NSW
}

function detectMetro(text: string, address: string | null): boolean {
  const combined = `${text} ${address || ""}`.toUpperCase();
  
  const metroAreas = [
    "SYDNEY", "MELBOURNE", "BRISBANE", "PERTH", "ADELAIDE", "HOBART", "DARWIN", "CANBERRA",
    "NEWCASTLE", "WOLLONGONG", "GEELONG", "GOLD COAST", "SUNSHINE COAST", "CENTRAL COAST"
  ];
  
  return metroAreas.some(area => combined.includes(area));
}

function estimateProjectArea(parsedQuote: ParsedQuote): number {
  // Try to extract area from line items
  for (const item of parsedQuote.lineItems) {
    const desc = item.description.toLowerCase();
    if (desc.includes("sqm") || desc.includes("m2") || desc.includes("square metre")) {
      if (item.quantity && item.quantity > 10 && item.quantity < 1000) {
        return item.quantity;
      }
    }
  }
  
  // Try to extract from raw text
  const areaMatch = parsedQuote.rawText.match(/(\d{2,3})\s*(?:sqm|m2|square\s*metres?)/i);
  if (areaMatch) {
    const area = parseInt(areaMatch[1]);
    if (area > 10 && area < 1000) {
      return area;
    }
  }
  
  // Default estimate based on typical residential roof
  return 150;
}

// ============================================================================
// MAIN VERIFICATION FUNCTION
// ============================================================================

/**
 * Process a quote through the complete verification pipeline
 */
export async function verifyQuote(input: VerificationInput): Promise<VerificationResult> {
  const startTime = Date.now();
  
  try {
    // Step 1: Parse the quote text
    console.log(`[Verification] Parsing quote ${input.quoteId}...`);
    const parsedQuote = parseQuoteText(input.rawText);
    
    // Step 2: Detect/determine parameters
    const state = input.state || detectState(input.rawText, parsedQuote.project.address);
    const isMetro = input.isMetro ?? detectMetro(input.rawText, parsedQuote.project.address);
    const projectArea = input.projectArea || estimateProjectArea(parsedQuote);
    const projectType = input.projectType || parsedQuote.project.type || "Roof Replacement";
    
    console.log(`[Verification] Parameters: state=${state}, metro=${isMetro}, area=${projectArea}sqm, type=${projectType}`);
    
    // Step 3: Calculate compliance score
    console.log(`[Verification] Calculating compliance score...`);
    const complianceScore = await calculateComplianceScore(
      parsedQuote,
      projectType,
      projectArea,
      state,
      isMetro
    );
    
    // Step 4: Generate verification report
    console.log(`[Verification] Generating report...`);
    const report = generateVerificationReport(
      parsedQuote,
      complianceScore,
      input.quoteId,
      input.fileName,
      projectArea,
      state
    );
    
    const processingTime = Date.now() - startTime;
    console.log(`[Verification] Complete in ${processingTime}ms. Score: ${complianceScore.overall}/100`);
    
    return {
      success: true,
      quoteId: input.quoteId,
      parsedQuote,
      complianceScore,
      report,
      processingTime
    };
    
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`[Verification] Error processing quote ${input.quoteId}:`, error);
    
    // Return a minimal result with error
    const emptyParsedQuote: ParsedQuote = {
      contractor: { name: null, abn: null, abnValid: false, licenseNumber: null, licenseType: null, phone: null, email: null, address: null },
      project: { address: null, description: null, type: null },
      pricing: { totalAmount: null, gstAmount: null, subtotal: null, depositRequired: null, paymentTerms: null },
      dates: { quoteDate: null, validUntil: null, estimatedStart: null, estimatedDuration: null },
      lineItems: [],
      warranty: { workmanship: null, materials: null, manufacturer: null },
      rawText: input.rawText,
      confidence: 0,
      parsingNotes: [`Error during processing: ${error instanceof Error ? error.message : "Unknown error"}`]
    };
    
    return {
      success: false,
      quoteId: input.quoteId,
      parsedQuote: emptyParsedQuote,
      complianceScore: {
        overall: 0,
        breakdown: {
          contractor: { score: 0, abnVerified: false, licenseVerified: false, insuranceVerified: false, findings: [] },
          pricing: { score: 0, marketComparison: null, hasItemizedBreakdown: false, gstCorrect: false, findings: [] },
          scope: { score: 0, completeness: 0, missingItems: [], findings: [] },
          compliance: { score: 0, standardsChecked: [], findings: [] },
          warranty: { score: 0, workmanshipYears: null, materialsYears: null, meetsMinimum: false, findings: [] }
        },
        riskLevel: "critical",
        recommendations: [],
        citations: []
      },
      report: {} as VerificationReport,
      processingTime,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

/**
 * Save verification results to database
 */
export async function saveVerificationResults(result: VerificationResult): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Verification] Database not available, skipping save");
    return;
  }
  
  try {
    // Update quote with extracted data
    await db.update(quotes)
      .set({
        extractedData: {
          contractor: result.parsedQuote.contractor.name || undefined,
          totalAmount: result.parsedQuote.pricing.totalAmount ? result.parsedQuote.pricing.totalAmount / 100 : undefined,
          lineItems: result.parsedQuote.lineItems.map(item => ({
            description: item.description,
            quantity: item.quantity || 1,
            unitPrice: item.unitPrice ? item.unitPrice / 100 : 0,
            total: item.total ? item.total / 100 : 0
          })),
          projectAddress: result.parsedQuote.project.address || undefined,
          quoteDate: result.parsedQuote.dates.quoteDate || undefined,
          validUntil: result.parsedQuote.dates.validUntil || undefined,
          abn: result.parsedQuote.contractor.abn || undefined,
          phone: result.parsedQuote.contractor.phone || undefined,
          email: result.parsedQuote.contractor.email || undefined,
          licenseNumber: result.parsedQuote.contractor.licenseNumber || undefined
        },
        status: result.success ? "completed" : "failed",
        progressPercentage: 100,
        errorMessage: result.error || null
      })
      .where(eq(quotes.id, result.quoteId));
    
    // Insert or update verification record
    const existingVerification = await db.select()
      .from(verifications)
      .where(eq(verifications.quoteId, result.quoteId))
      .limit(1);
    
    // Map risk level to status badge
    const statusBadge = result.complianceScore.riskLevel === "low" ? "green" as const
      : result.complianceScore.riskLevel === "medium" ? "amber" as const
      : "red" as const;
    
    const verificationData = {
      quoteId: result.quoteId,
      overallScore: result.complianceScore.overall,
      pricingScore: result.complianceScore.breakdown.pricing.score,
      materialsScore: result.complianceScore.breakdown.scope.score, // Use scope score for materials
      complianceScore: result.complianceScore.breakdown.compliance.score,
      warrantyScore: result.complianceScore.breakdown.warranty.score,
      statusBadge,
      pricingDetails: result.complianceScore.breakdown.pricing.marketComparison ? {
        marketRate: result.complianceScore.breakdown.pricing.marketComparison.marketPrice / 100,
        quotedRate: result.complianceScore.breakdown.pricing.marketComparison.quotedPrice / 100,
        variance: result.complianceScore.breakdown.pricing.marketComparison.variance,
        findings: result.complianceScore.breakdown.pricing.findings.map(f => ({
          item: "Pricing Analysis",
          status: f.includes("above") || f.includes("below") ? "flagged" as const : "verified" as const,
          message: f
        }))
      } : undefined,
      materialsDetails: {
        findings: result.complianceScore.breakdown.scope.missingItems.map(item => ({
          material: item,
          specified: "Not found",
          status: "flagged" as const,
          message: `${item} not found in quote`
        }))
      },
      complianceDetails: {
        findings: result.complianceScore.breakdown.compliance.standardsChecked.map(s => ({
          requirement: s.standardTitle,
          status: s.status as "compliant" | "non-compliant" | "needs-review",
          message: s.findings[0] || "",
          reference: s.reference
        }))
      },
      warrantyDetails: {
        findings: result.complianceScore.breakdown.warranty.findings.map(f => ({
          item: "Warranty",
          warrantyTerm: result.complianceScore.breakdown.warranty.workmanshipYears 
            ? `${result.complianceScore.breakdown.warranty.workmanshipYears} years` 
            : "Not specified",
          status: result.complianceScore.breakdown.warranty.meetsMinimum ? "verified" as const : "flagged" as const,
          message: f
        }))
      },
      flags: result.complianceScore.recommendations
        .filter(r => r.priority === "critical" || r.priority === "high")
        .map(r => ({
          category: r.category.toLowerCase().includes("pricing") ? "pricing" as const
            : r.category.toLowerCase().includes("compliance") ? "compliance" as const
            : r.category.toLowerCase().includes("warranty") ? "warranty" as const
            : "materials" as const,
          severity: r.priority === "critical" ? "high" as const : r.priority as "high" | "medium" | "low",
          message: r.title
        })),
      recommendations: result.complianceScore.recommendations.map(r => ({
        title: r.title,
        description: r.description,
        priority: r.priority === "critical" ? "high" as const : r.priority as "high" | "medium" | "low"
      })),
      potentialSavings: (result.complianceScore.breakdown.pricing.marketComparison?.variance ?? 0) > 0
        ? Math.round(((result.complianceScore.breakdown.pricing.marketComparison?.quotedPrice ?? 0) - 
            (result.complianceScore.breakdown.pricing.marketComparison?.marketPrice ?? 0)) / 100)
        : 0
    };
    
    if (existingVerification.length > 0) {
      await db.update(verifications)
        .set(verificationData)
        .where(eq(verifications.quoteId, result.quoteId));
    } else {
      await db.insert(verifications).values(verificationData);
    }
    
    // Note: Reports table is for PDF generation, not verification data
    // Verification report data is stored in the verifications table above
    console.log(`[Verification] Report data stored in verification record for quote ${result.quoteId}`);
    
    console.log(`[Verification] Results saved for quote ${result.quoteId}`);
    
  } catch (error) {
    console.error(`[Verification] Error saving results:`, error);
  }
}

/**
 * Process a quote end-to-end: verify and save results
 */
export async function processQuote(input: VerificationInput): Promise<VerificationResult> {
  const result = await verifyQuote(input);
  await saveVerificationResults(result);
  return result;
}

// ============================================================================
// SELF-IMPROVEMENT: DATA COLLECTION
// ============================================================================

/**
 * Record verification outcome for model improvement
 * This collects data to improve future predictions
 */
export async function recordVerificationOutcome(
  quoteId: number,
  actualOutcome: {
    projectCompleted: boolean;
    finalCost: number; // cents
    issuesEncountered: string[];
    customerSatisfaction: number; // 1-5
    wouldRecommend: boolean;
  }
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  try {
    // Get the original verification
    const verification = await db.select()
      .from(verifications)
      .where(eq(verifications.quoteId, quoteId))
      .limit(1);
    
    if (verification.length === 0) return;
    
    // Calculate prediction accuracy
    const originalScore = verification[0].overallScore;
    const actualScore = calculateActualScore(actualOutcome);
    const predictionAccuracy = 100 - Math.abs(originalScore - actualScore);
    
    // Log for analysis (in production, this would go to an analytics table)
    console.log(`[Self-Improvement] Quote ${quoteId}:`);
    console.log(`  Predicted score: ${originalScore}`);
    console.log(`  Actual score: ${actualScore}`);
    console.log(`  Prediction accuracy: ${predictionAccuracy}%`);
    
    // This data can be used to:
    // 1. Adjust scoring weights
    // 2. Identify patterns in problematic quotes
    // 3. Improve market rate accuracy
    // 4. Refine compliance checks
    
  } catch (error) {
    console.error("[Self-Improvement] Error recording outcome:", error);
  }
}

function calculateActualScore(outcome: {
  projectCompleted: boolean;
  finalCost: number;
  issuesEncountered: string[];
  customerSatisfaction: number;
  wouldRecommend: boolean;
}): number {
  let score = 100;
  
  if (!outcome.projectCompleted) score -= 50;
  if (outcome.issuesEncountered.length > 0) score -= outcome.issuesEncountered.length * 10;
  score -= (5 - outcome.customerSatisfaction) * 10;
  if (!outcome.wouldRecommend) score -= 20;
  
  return Math.max(0, Math.min(100, score));
}

// ============================================================================
// EXPORT
// ============================================================================

export const VERIFICATION_SERVICE = {
  name: "VENTURR VALDT Knowledge Base",
  version: "1.0.0",
  verifyQuote,
  saveVerificationResults,
  processQuote,
  recordVerificationOutcome,
  detectState,
  detectMetro,
  estimateProjectArea
};
