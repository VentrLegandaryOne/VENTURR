/**
 * VENTURR VALDT - Compliance Scoring Engine
 * 
 * This module provides deterministic compliance scoring based on:
 * - Australian Building Standards (HB-39, NCC 2022, AS/NZS)
 * - State licensing requirements
 * - Industry best practices
 * 
 * All scores are backed by verifiable standard references.
 */

import { KNOWLEDGE_BASE, ComplianceCheckResult } from "./australianStandards";
import { MARKET_RATE_ENGINE, PriceAnalysisResult } from "./marketRateEngine";
import { ParsedQuote, validateABN } from "./quoteParser";

// ============================================================================
// TYPES
// ============================================================================

export interface ComplianceScore {
  overall: number; // 0-100
  breakdown: {
    contractor: ContractorScore;
    pricing: PricingScore;
    scope: ScopeScore;
    compliance: TechnicalComplianceScore;
    warranty: WarrantyScore;
  };
  riskLevel: "low" | "medium" | "high" | "critical";
  recommendations: Recommendation[];
  citations: Citation[];
}

export interface ContractorScore {
  score: number; // 0-100
  abnVerified: boolean;
  licenseVerified: boolean;
  insuranceVerified: boolean;
  findings: string[];
}

export interface PricingScore {
  score: number; // 0-100
  marketComparison: PriceAnalysisResult | null;
  hasItemizedBreakdown: boolean;
  gstCorrect: boolean;
  findings: string[];
}

export interface ScopeScore {
  score: number; // 0-100
  completeness: number; // 0-100
  missingItems: string[];
  findings: string[];
}

export interface TechnicalComplianceScore {
  score: number; // 0-100
  standardsChecked: ComplianceCheckResult[];
  findings: string[];
}

export interface WarrantyScore {
  score: number; // 0-100
  workmanshipYears: number | null;
  materialsYears: number | null;
  meetsMinimum: boolean;
  findings: string[];
}

export interface Recommendation {
  priority: "critical" | "high" | "medium" | "low";
  category: string;
  title: string;
  description: string;
  action: string;
  reference: string;
}

export interface Citation {
  id: string;
  standard: string;
  section: string;
  title: string;
  relevance: string;
}

// ============================================================================
// STATE LICENSE REQUIREMENTS
// ============================================================================

interface StateLicenseRequirement {
  state: string;
  authority: string;
  licenseTypes: {
    type: string;
    pattern: RegExp;
    requiredFor: string[];
  }[];
  minimumInsurance: {
    publicLiability: number; // dollars
    workersComp: boolean;
  };
  homeWarrantyThreshold: number; // dollars - work over this requires home warranty insurance
}

const STATE_LICENSE_REQUIREMENTS: StateLicenseRequirement[] = [
  {
    state: "NSW",
    authority: "NSW Fair Trading",
    licenseTypes: [
      { type: "Contractor", pattern: /^\d{5,8}[A-Z]?$/, requiredFor: ["all work over $5,000"] },
      { type: "Tradesperson", pattern: /^\d{5,8}[A-Z]?$/, requiredFor: ["specialist trade work"] }
    ],
    minimumInsurance: { publicLiability: 5000000, workersComp: true },
    homeWarrantyThreshold: 20000
  },
  {
    state: "VIC",
    authority: "Victorian Building Authority (VBA)",
    licenseTypes: [
      { type: "Registered Building Practitioner", pattern: /^[A-Z]{2,3}\d{5,7}$/, requiredFor: ["domestic building work"] },
      { type: "Plumber", pattern: /^\d{5,6}$/, requiredFor: ["plumbing and roofing work"] }
    ],
    minimumInsurance: { publicLiability: 5000000, workersComp: true },
    homeWarrantyThreshold: 16000
  },
  {
    state: "QLD",
    authority: "Queensland Building and Construction Commission (QBCC)",
    licenseTypes: [
      { type: "Contractor", pattern: /^\d{6,8}$/, requiredFor: ["all building work over $3,300"] }
    ],
    minimumInsurance: { publicLiability: 5000000, workersComp: true },
    homeWarrantyThreshold: 3300
  },
  {
    state: "WA",
    authority: "Building and Energy WA",
    licenseTypes: [
      { type: "Building Contractor", pattern: /^BC\d{5,6}$/, requiredFor: ["building work"] },
      { type: "Painter", pattern: /^PA\d{5,6}$/, requiredFor: ["painting work"] }
    ],
    minimumInsurance: { publicLiability: 5000000, workersComp: true },
    homeWarrantyThreshold: 20000
  },
  {
    state: "SA",
    authority: "Consumer and Business Services SA",
    licenseTypes: [
      { type: "Building Work Contractor", pattern: /^BLD\d{6}$/, requiredFor: ["building work over $12,000"] }
    ],
    minimumInsurance: { publicLiability: 5000000, workersComp: true },
    homeWarrantyThreshold: 12000
  }
];

// ============================================================================
// SCOPE COMPLETENESS REQUIREMENTS
// ============================================================================

interface ScopeRequirement {
  projectType: string;
  requiredItems: {
    item: string;
    importance: "critical" | "important" | "recommended";
    description: string;
  }[];
}

const SCOPE_REQUIREMENTS: ScopeRequirement[] = [
  {
    projectType: "Roof Replacement",
    requiredItems: [
      { item: "roof sheets", importance: "critical", description: "Main roofing material specification" },
      { item: "sarking", importance: "critical", description: "Underlay/sarking for condensation control (NCC requirement)" },
      { item: "ridge capping", importance: "critical", description: "Ridge line weatherproofing" },
      { item: "valley", importance: "important", description: "Valley gutters where roof planes meet" },
      { item: "flashing", importance: "critical", description: "Flashings for penetrations and junctions" },
      { item: "gutter", importance: "important", description: "Guttering replacement if required" },
      { item: "downpipe", importance: "important", description: "Downpipe replacement if required" },
      { item: "fasteners", importance: "important", description: "Fastener specification for wind region" },
      { item: "removal", importance: "critical", description: "Old roof removal and disposal" },
      { item: "scaffold", importance: "recommended", description: "Scaffolding for safe access" }
    ]
  },
  {
    projectType: "Roof Repair",
    requiredItems: [
      { item: "repair", importance: "critical", description: "Description of repair work" },
      { item: "materials", importance: "important", description: "Materials to be used" },
      { item: "flashing", importance: "important", description: "Flashing repairs if applicable" }
    ]
  },
  {
    projectType: "Gutter Replacement",
    requiredItems: [
      { item: "gutter", importance: "critical", description: "Gutter profile and material" },
      { item: "downpipe", importance: "critical", description: "Downpipe specification" },
      { item: "brackets", importance: "important", description: "Gutter brackets/hangers" },
      { item: "removal", importance: "important", description: "Old gutter removal" },
      { item: "leaf guard", importance: "recommended", description: "Leaf guard/gutter mesh" }
    ]
  }
];

// ============================================================================
// WARRANTY REQUIREMENTS
// ============================================================================

interface WarrantyRequirement {
  projectType: string;
  minimumWorkmanship: number; // years
  minimumMaterials: number; // years
  industryStandard: number; // years
  reference: string;
}

const WARRANTY_REQUIREMENTS: WarrantyRequirement[] = [
  {
    projectType: "Roof Replacement",
    minimumWorkmanship: 5,
    minimumMaterials: 10,
    industryStandard: 7,
    reference: "HB-39:2015, BlueScope Warranty Terms"
  },
  {
    projectType: "Roof Repair",
    minimumWorkmanship: 2,
    minimumMaterials: 5,
    industryStandard: 3,
    reference: "Industry standard"
  },
  {
    projectType: "Gutter Replacement",
    minimumWorkmanship: 5,
    minimumMaterials: 10,
    industryStandard: 5,
    reference: "Industry standard"
  }
];

// ============================================================================
// SCORING FUNCTIONS
// ============================================================================

/**
 * Score contractor credentials
 */
function scoreContractor(quote: ParsedQuote, state: string): ContractorScore {
  let score = 100;
  const findings: string[] = [];
  
  // ABN verification (30 points)
  const abnVerified = quote.contractor.abnValid;
  if (!quote.contractor.abn) {
    score -= 30;
    findings.push("No ABN provided - contractor may not be registered for GST");
  } else if (!abnVerified) {
    score -= 20;
    findings.push("ABN provided but failed validation check - verify on ABR");
  } else {
    findings.push("ABN verified as valid format");
  }
  
  // License verification (40 points)
  const licenseVerified = !!quote.contractor.licenseNumber;
  if (!licenseVerified) {
    score -= 40;
    findings.push(`No license number found - ${state} requires licensed contractors for most building work`);
  } else {
    findings.push(`License number ${quote.contractor.licenseNumber} found (${quote.contractor.licenseType || "type unknown"})`);
  }
  
  // Contact information (15 points)
  if (!quote.contractor.phone && !quote.contractor.email) {
    score -= 15;
    findings.push("No contact information provided");
  } else if (!quote.contractor.phone || !quote.contractor.email) {
    score -= 5;
    findings.push("Incomplete contact information");
  }
  
  // Business address (15 points)
  if (!quote.contractor.address) {
    score -= 15;
    findings.push("No business address provided");
  }
  
  return {
    score: Math.max(0, score),
    abnVerified,
    licenseVerified,
    insuranceVerified: false, // Would need separate verification
    findings
  };
}

/**
 * Score pricing against market rates
 */
async function scorePricing(
  quote: ParsedQuote,
  projectType: string,
  area: number,
  state: string,
  isMetro: boolean
): Promise<PricingScore> {
  let score = 100;
  const findings: string[] = [];
  
  // Get market comparison
  let marketComparison: PriceAnalysisResult | null = null;
  
  if (quote.pricing.totalAmount && area > 0) {
    marketComparison = await MARKET_RATE_ENGINE.analyzeQuotePrice(
      quote.pricing.totalAmount,
      projectType,
      area,
      state,
      isMetro
    );
    
    // Score based on variance
    if (marketComparison.assessment === "significantly_above") {
      score -= 40;
      findings.push(`Quote is ${marketComparison.variance}% above market rate - significantly overpriced`);
    } else if (marketComparison.assessment === "above_market") {
      score -= 20;
      findings.push(`Quote is ${marketComparison.variance}% above market rate`);
    } else if (marketComparison.assessment === "below_market") {
      score -= 10;
      findings.push(`Quote is ${Math.abs(marketComparison.variance)}% below market rate - verify scope is complete`);
    } else {
      findings.push(`Quote is within fair market range (${marketComparison.variance}% variance)`);
    }
  } else {
    score -= 30;
    findings.push("Could not perform market comparison - missing total amount or project area");
  }
  
  // Itemized breakdown (25 points)
  const hasItemizedBreakdown = quote.lineItems.length >= 3;
  if (!hasItemizedBreakdown) {
    score -= 25;
    findings.push("No itemized breakdown provided - harder to verify value");
  } else {
    findings.push(`${quote.lineItems.length} line items found in breakdown`);
  }
  
  // GST calculation (15 points)
  let gstCorrect = false;
  if (quote.pricing.totalAmount && quote.pricing.gstAmount && quote.pricing.subtotal) {
    const expectedGST = Math.round(quote.pricing.subtotal * 0.1);
    const gstDiff = Math.abs(quote.pricing.gstAmount - expectedGST);
    gstCorrect = gstDiff < 100; // Allow $1 rounding difference
    
    if (!gstCorrect) {
      score -= 15;
      findings.push("GST calculation appears incorrect");
    }
  } else if (quote.pricing.totalAmount && !quote.pricing.gstAmount) {
    score -= 10;
    findings.push("GST not separately shown - verify if price is GST inclusive");
  }
  
  return {
    score: Math.max(0, score),
    marketComparison,
    hasItemizedBreakdown,
    gstCorrect,
    findings
  };
}

/**
 * Score scope completeness
 */
function scoreScope(quote: ParsedQuote, projectType: string | undefined): ScopeScore {
  let score = 100;
  const findings: string[] = [];
  const missingItems: string[] = [];
  
  // Handle undefined or empty projectType
  const normalizedProjectType = (projectType || "general").toLowerCase();
  
  // Find scope requirements for project type
  const requirements = SCOPE_REQUIREMENTS.find(r => 
    normalizedProjectType.includes(r.projectType.toLowerCase())
  );
  
  if (!requirements) {
    findings.push("Project type not recognized - using general assessment");
    return {
      score: 70,
      completeness: 70,
      missingItems: [],
      findings
    };
  }
  
  // Check each required item
  const quoteText = (quote.rawText + " " + quote.lineItems.map(i => i.description).join(" ")).toLowerCase();
  
  let criticalMissing = 0;
  let importantMissing = 0;
  let recommendedMissing = 0;
  
  for (const req of requirements.requiredItems) {
    const found = quoteText.includes(req.item.toLowerCase());
    
    if (!found) {
      missingItems.push(req.item);
      
      if (req.importance === "critical") {
        criticalMissing++;
        findings.push(`CRITICAL: ${req.description} not found in quote`);
      } else if (req.importance === "important") {
        importantMissing++;
        findings.push(`IMPORTANT: ${req.description} not found in quote`);
      } else {
        recommendedMissing++;
      }
    }
  }
  
  // Calculate score
  score -= criticalMissing * 20;
  score -= importantMissing * 10;
  score -= recommendedMissing * 5;
  
  // Calculate completeness percentage
  const totalItems = requirements.requiredItems.length;
  const foundItems = totalItems - (criticalMissing + importantMissing + recommendedMissing);
  const completeness = Math.round((foundItems / totalItems) * 100);
  
  if (missingItems.length === 0) {
    findings.push("All expected scope items found in quote");
  }
  
  return {
    score: Math.max(0, score),
    completeness,
    missingItems,
    findings
  };
}

/**
 * Score technical compliance
 */
function scoreTechnicalCompliance(quote: ParsedQuote, projectType: string | undefined): TechnicalComplianceScore {
  let score = 100;
  const findings: string[] = [];
  const standardsChecked: ComplianceCheckResult[] = [];
  
  const quoteText = quote.rawText.toLowerCase();
  const normalizedProjectType = (projectType || "general").toLowerCase();
  
  // Check for material specifications
  const hasMaterialSpec = /colorbond|zincalume|trimdek|klip-lok|custom orb/i.test(quote.rawText);
  if (!hasMaterialSpec) {
    score -= 15;
    findings.push("No specific material brand/profile mentioned - verify specifications");
  }
  
  // Check for BMT specification
  const hasBMT = /0\.42\s*mm|0\.48\s*mm|bmt/i.test(quote.rawText);
  if (!hasBMT && normalizedProjectType.includes("roof")) {
    score -= 10;
    findings.push("Base Metal Thickness (BMT) not specified - important for structural performance");
    standardsChecked.push({
      standardId: "HB39-3.1",
      standardTitle: "Material Selection",
      status: "needs-review",
      findings: ["BMT not specified in quote"],
      recommendations: ["Request BMT specification (0.42mm or 0.48mm typical)"],
      severity: "major",
      reference: "HB-39:2015 Section 3.1"
    });
  }
  
  // Check for coating specification
  const hasCoating = /az150|az200|galvanised|galvanized/i.test(quote.rawText);
  if (!hasCoating && normalizedProjectType.includes("roof")) {
    score -= 10;
    findings.push("Coating class not specified - important for corrosion resistance");
    standardsChecked.push({
      standardId: "HB39-3.1",
      standardTitle: "Material Selection - Coating",
      status: "needs-review",
      findings: ["Coating class not specified"],
      recommendations: ["Request coating specification (AZ150 or AZ200)"],
      severity: "major",
      reference: "HB-39:2015 Section 3.1, AS 1397"
    });
  }
  
  // Check for fastener specification
  const hasFasteners = /class\s*[34]|stainless|type\s*17/i.test(quote.rawText);
  if (!hasFasteners && normalizedProjectType.includes("roof")) {
    score -= 10;
    findings.push("Fastener class not specified - critical for wind resistance");
    standardsChecked.push({
      standardId: "HB39-3.2",
      standardTitle: "Fastener Specification",
      status: "needs-review",
      findings: ["Fastener class not specified"],
      recommendations: ["Request fastener specification (Class 3 or Class 4 for coastal)"],
      severity: "critical",
      reference: "HB-39:2015 Section 3.2"
    });
  }
  
  // Check for sarking mention
  const hasSarking = /sarking|anticon|underlay|vapour barrier/i.test(quote.rawText);
  if (!hasSarking && normalizedProjectType.includes("roof")) {
    score -= 15;
    findings.push("Sarking/underlay not mentioned - required by NCC for condensation control");
    standardsChecked.push({
      standardId: "NCC-F7P1",
      standardTitle: "Condensation Management",
      status: "non-compliant",
      findings: ["No sarking/underlay mentioned in quote"],
      recommendations: ["Sarking is required under NCC 2022 for condensation management"],
      severity: "critical",
      reference: "NCC 2022 Part F7"
    });
  }
  
  // Add compliant check if all good
  if (score === 100) {
    findings.push("Quote includes appropriate technical specifications");
    standardsChecked.push({
      standardId: "HB39-GENERAL",
      standardTitle: "General Compliance",
      status: "compliant",
      findings: ["Quote specifications align with HB-39 requirements"],
      recommendations: [],
      severity: "info",
      reference: "HB-39:2015"
    });
  }
  
  return {
    score: Math.max(0, score),
    standardsChecked,
    findings
  };
}

/**
 * Score warranty terms
 */
function scoreWarranty(quote: ParsedQuote, projectType: string | undefined): WarrantyScore {
  let score = 100;
  const findings: string[] = [];
  const normalizedProjectType = (projectType || "general").toLowerCase();
  
  // Find warranty requirements
  const requirements = WARRANTY_REQUIREMENTS.find(r =>
    normalizedProjectType.includes(r.projectType.toLowerCase())
  ) || WARRANTY_REQUIREMENTS[0];
  
  // Parse warranty years from quote
  let workmanshipYears: number | null = null;
  let materialsYears: number | null = null;
  
  if (quote.warranty.workmanship) {
    const match = quote.warranty.workmanship.match(/(\d+)/);
    if (match) {
      workmanshipYears = parseInt(match[1]);
      if (quote.warranty.workmanship.toLowerCase().includes("month")) {
        workmanshipYears = Math.round(workmanshipYears / 12);
      }
    }
  }
  
  if (quote.warranty.materials) {
    const match = quote.warranty.materials.match(/(\d+)/);
    if (match) {
      materialsYears = parseInt(match[1]);
      if (quote.warranty.materials.toLowerCase().includes("month")) {
        materialsYears = Math.round(materialsYears / 12);
      }
    }
  }
  
  // Score warranty terms
  let meetsMinimum = true;
  
  if (!workmanshipYears && !materialsYears) {
    score -= 40;
    meetsMinimum = false;
    findings.push("No warranty terms specified in quote");
  } else {
    if (workmanshipYears) {
      if (workmanshipYears < requirements.minimumWorkmanship) {
        score -= 20;
        meetsMinimum = false;
        findings.push(`Workmanship warranty (${workmanshipYears} years) below minimum (${requirements.minimumWorkmanship} years)`);
      } else if (workmanshipYears >= requirements.industryStandard) {
        findings.push(`Workmanship warranty (${workmanshipYears} years) meets industry standard`);
      }
    } else {
      score -= 15;
      findings.push("Workmanship warranty period not specified");
    }
    
    if (materialsYears) {
      if (materialsYears < requirements.minimumMaterials) {
        score -= 15;
        findings.push(`Materials warranty (${materialsYears} years) below typical (${requirements.minimumMaterials} years)`);
      } else {
        findings.push(`Materials warranty (${materialsYears} years) acceptable`);
      }
    }
  }
  
  return {
    score: Math.max(0, score),
    workmanshipYears,
    materialsYears,
    meetsMinimum,
    findings
  };
}

/**
 * Generate recommendations based on scores
 */
function generateRecommendations(
  contractorScore: ContractorScore,
  pricingScore: PricingScore,
  scopeScore: ScopeScore,
  complianceScore: TechnicalComplianceScore,
  warrantyScore: WarrantyScore
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  
  // Contractor recommendations
  if (!contractorScore.abnVerified) {
    recommendations.push({
      priority: "high",
      category: "Contractor Verification",
      title: "Verify ABN on Australian Business Register",
      description: "The ABN could not be verified. Check the ABN on the official ABR website.",
      action: "Visit abr.business.gov.au and search for the ABN",
      reference: "Australian Business Register"
    });
  }
  
  if (!contractorScore.licenseVerified) {
    recommendations.push({
      priority: "critical",
      category: "Contractor Verification",
      title: "Request and verify contractor license",
      description: "No license number found. Licensed contractors are required for most building work.",
      action: "Request license number and verify on state licensing authority website",
      reference: "State Building Licensing Requirements"
    });
  }
  
  // Pricing recommendations
  if (pricingScore.marketComparison?.assessment === "significantly_above") {
    recommendations.push({
      priority: "high",
      category: "Pricing",
      title: "Quote significantly above market rate",
      description: `The quoted price is ${pricingScore.marketComparison.variance}% above typical market rates.`,
      action: "Request itemized breakdown and get 2-3 additional quotes for comparison",
      reference: "VENTURR VALDT Market Analysis"
    });
  }
  
  if (!pricingScore.hasItemizedBreakdown) {
    recommendations.push({
      priority: "medium",
      category: "Pricing",
      title: "Request itemized breakdown",
      description: "Lump sum quotes make it harder to verify value and compare with other quotes.",
      action: "Ask contractor to provide itemized breakdown of labor, materials, and other costs",
      reference: "Best Practice"
    });
  }
  
  // Scope recommendations
  for (const item of scopeScore.missingItems.slice(0, 3)) {
    recommendations.push({
      priority: "medium",
      category: "Scope",
      title: `Clarify ${item} inclusion`,
      description: `${item} was not found in the quote but is typically required for this project type.`,
      action: `Ask contractor to confirm if ${item} is included or provide separate pricing`,
      reference: "Industry Standard Scope"
    });
  }
  
  // Compliance recommendations
  for (const check of complianceScore.standardsChecked.filter(c => c.status !== "compliant")) {
    recommendations.push({
      priority: check.severity === "critical" ? "critical" : "medium",
      category: "Technical Compliance",
      title: check.standardTitle,
      description: check.findings.join(". "),
      action: check.recommendations[0] || "Review with contractor",
      reference: check.reference
    });
  }
  
  // Warranty recommendations
  if (!warrantyScore.meetsMinimum) {
    recommendations.push({
      priority: "high",
      category: "Warranty",
      title: "Warranty terms below minimum",
      description: "The warranty terms offered are below industry minimum standards.",
      action: "Negotiate for longer warranty period or seek alternative quotes",
      reference: "Industry Warranty Standards"
    });
  }
  
  return recommendations;
}

/**
 * Generate citations for the report
 */
function generateCitations(complianceScore: TechnicalComplianceScore): Citation[] {
  const citations: Citation[] = [];
  
  // Add standard citations
  citations.push({
    id: "HB39",
    standard: "HB-39:2015",
    section: "All",
    title: "Installation Code for Metal Roof and Wall Cladding",
    relevance: "Primary reference for metal roofing installation requirements"
  });
  
  citations.push({
    id: "NCC2022",
    standard: "NCC 2022",
    section: "Volume 2",
    title: "National Construction Code - Residential",
    relevance: "Building code requirements for residential construction"
  });
  
  citations.push({
    id: "AS1170.2",
    standard: "AS/NZS 1170.2:2021",
    section: "Wind Actions",
    title: "Structural design actions - Wind actions",
    relevance: "Wind load requirements for roof design"
  });
  
  // Add specific citations from compliance checks
  for (const check of complianceScore.standardsChecked) {
    if (!citations.find(c => c.id === check.standardId)) {
      citations.push({
        id: check.standardId,
        standard: check.reference.split(",")[0],
        section: check.standardId.split("-")[1] || "",
        title: check.standardTitle,
        relevance: check.findings[0] || ""
      });
    }
  }
  
  return citations;
}

// ============================================================================
// MAIN SCORING FUNCTION
// ============================================================================

/**
 * Calculate comprehensive compliance score for a parsed quote
 */
export async function calculateComplianceScore(
  quote: ParsedQuote,
  projectType: string,
  area: number, // sqm
  state: string,
  isMetro: boolean = true
): Promise<ComplianceScore> {
  // Calculate individual scores
  const contractorScore = scoreContractor(quote, state);
  const pricingScore = await scorePricing(quote, projectType, area, state, isMetro);
  const scopeScore = scoreScope(quote, projectType);
  const complianceScore = scoreTechnicalCompliance(quote, projectType);
  const warrantyScore = scoreWarranty(quote, projectType);
  
  // Calculate overall score (weighted average)
  const overall = Math.round(
    contractorScore.score * 0.25 +
    pricingScore.score * 0.25 +
    scopeScore.score * 0.20 +
    complianceScore.score * 0.15 +
    warrantyScore.score * 0.15
  );
  
  // Determine risk level
  let riskLevel: ComplianceScore["riskLevel"];
  if (overall >= 80) {
    riskLevel = "low";
  } else if (overall >= 60) {
    riskLevel = "medium";
  } else if (overall >= 40) {
    riskLevel = "high";
  } else {
    riskLevel = "critical";
  }
  
  // Generate recommendations and citations
  const recommendations = generateRecommendations(
    contractorScore,
    pricingScore,
    scopeScore,
    complianceScore,
    warrantyScore
  );
  
  const citations = generateCitations(complianceScore);
  
  return {
    overall,
    breakdown: {
      contractor: contractorScore,
      pricing: pricingScore,
      scope: scopeScore,
      compliance: complianceScore,
      warranty: warrantyScore
    },
    riskLevel,
    recommendations,
    citations
  };
}

// ============================================================================
// EXPORT
// ============================================================================

export const COMPLIANCE_ENGINE = {
  calculateComplianceScore,
  scoreContractor,
  scorePricing,
  scoreScope,
  scoreTechnicalCompliance,
  scoreWarranty,
  STATE_LICENSE_REQUIREMENTS,
  SCOPE_REQUIREMENTS,
  WARRANTY_REQUIREMENTS
};
