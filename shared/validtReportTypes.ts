/**
 * VENTURR VALIDT - Court-Defensible Report Types
 * 
 * Design goal: Every statement is either (a) directly evidenced, 
 * (b) clearly labelled as an assumption, or (c) a recommendation 
 * phrased as a question to clarify.
 */

// Status types for pillars and overall report
export type PillarStatus = 'Green' | 'Amber' | 'Red';
export type ConfidenceLevel = 'Low' | 'Medium' | 'High';

// Evidence types
export type EvidenceType = 'supplied' | 'extracted' | 'gap';
export type EvidenceSource = 'quote_pdf' | 'quote_image' | 'plans' | 'specs' | 'photos' | 'ocr' | 'analysis';

export interface EvidenceItem {
  id: string; // E1, E2, X1, G1, etc.
  type: EvidenceType;
  source: EvidenceSource;
  filename?: string;
  pageRange?: string;
  timestamp?: string;
  description: string;
  count?: number; // For photos
}

export interface EvidenceGap {
  id: string; // G1, G2, etc.
  description: string;
  impact: 'pricing' | 'materials' | 'compliance' | 'terms';
  severity: 'critical' | 'moderate' | 'minor';
}

// Finding structure (used across all pillars)
export interface Finding {
  id: string; // A1, B1, C1, D1, etc.
  fact: string; // The factual statement
  evidence: string; // Reference to evidence (e.g., "E1 p3, line 12")
  benchmark?: string; // Reference to benchmark used
  interpretation: string; // Within range, Above range, etc.
  riskStatement: string; // Non-defamatory risk statement
}

export interface ClarifyingQuestion {
  id: number;
  question: string;
  pillar: 'pricing' | 'materials' | 'compliance' | 'terms';
}

// Pillar structures
export interface PricingPillar {
  status: PillarStatus;
  method: string;
  findings: Finding[];
  clarifyingQuestions: ClarifyingQuestion[];
  benchmarkSetName?: string;
  region?: string;
  tradeCategory?: string;
}

export interface MaterialsPillar {
  status: PillarStatus;
  method: string;
  findings: Finding[];
  clarifyingQuestions: ClarifyingQuestion[];
}

export interface CompliancePillar {
  status: PillarStatus;
  method: string;
  findings: Finding[];
  clarifyingQuestions: ClarifyingQuestion[];
  standardsReferenced: string[];
}

export interface TermsPillar {
  status: PillarStatus;
  method: string;
  findings: Finding[];
  clarifyingQuestions: ClarifyingQuestion[];
}

// Cover page data
export interface CoverPage {
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
  confidenceLabel: ConfidenceLevel;
}

// Executive summary
export interface ExecutiveSummary {
  overallStatus: PillarStatus;
  consistentItemsCount: number;
  clarificationItemsCount: number;
  keyDrivers: {
    pricing?: string;
    materials?: string;
    compliance?: string;
    terms?: string;
    evidenceQuality?: string;
  };
  whatThisReportIs: string;
  whatThisReportIsNot: string;
}

// Evidence register
export interface EvidenceRegister {
  suppliedByUser: EvidenceItem[];
  extractedByValidt: EvidenceItem[];
  evidenceGaps: EvidenceGap[];
}

// Scoring logic
export interface ScoringLogic {
  pillarStatuses: {
    pricing: PillarStatus;
    materials: PillarStatus;
    compliance: PillarStatus;
    terms: PillarStatus;
  };
  overallStatusRule: string;
  reasonForStatus: string;
}

// Actionable next steps
export interface ActionableNextSteps {
  topItems: string[];
  potentialStatusImprovement?: string;
}

// Assumptions and limitations
export interface AssumptionsAndLimitations {
  assumptions: Array<{ id: string; description: string }>;
  limitations: string[];
}

// Appendix items
export interface AppendixItem {
  id: string; // A, B, C
  title: string;
  content: string | object;
}

// Complete VALIDT Report
export interface ValidtReport {
  coverPage: CoverPage;
  executiveSummary: ExecutiveSummary;
  evidenceRegister: EvidenceRegister;
  pillars: {
    pricing: PricingPillar;
    materials: MaterialsPillar;
    compliance: CompliancePillar;
    terms: TermsPillar;
  };
  scoringLogic: ScoringLogic;
  actionableNextSteps: ActionableNextSteps;
  assumptionsAndLimitations: AssumptionsAndLimitations;
  disclaimer: string;
  appendices: AppendixItem[];
}

// Default disclaimer text
export const VALIDT_DISCLAIMER = 
  "VENTURR VALIDT provides an information service to assist decision-making. " +
  "It does not provide legal advice, engineering certification, or building approval. " +
  "Users should obtain independent professional advice appropriate to the project.";

// Default "what this report is/is not" text
export const WHAT_THIS_REPORT_IS = 
  "This report is an evidence-based review of the quoted scope, line items, and stated standards " +
  "against reference benchmarks and compliance requirements.";

export const WHAT_THIS_REPORT_IS_NOT = 
  "This report is not engineering certification, a building approval, or legal advice.";

// Standard limitations
export const STANDARD_LIMITATIONS = [
  "This assessment is limited to the documents provided (Evidence Register).",
  "VALIDT does not inspect the site and does not verify hidden conditions.",
  "Where legislation/approvals apply, the quote must specify inclusions/exclusions."
];

// Compliance standards reference (NSW/AU)
export const COMPLIANCE_STANDARDS = {
  NCC: "NCC (Australia) – performance/deemed-to-satisfy framework",
  HB39: "HB 39 – installation guidance for metal roofing/walling",
  AS1562: "AS/NZS 1562.1 – metal roof and wall cladding installation",
  AS4055: "AS 4055 – wind classification",
  AS3500: "AS/NZS 3500.3 – roof drainage (gutters/downpipes)",
  SAFEWORK_NSW: "SafeWork NSW – working at heights / fall prevention expectations"
};

// Pillar methods (standard wording)
export const PILLAR_METHODS = {
  pricing: (benchmarkSetName: string, region: string, tradeCategory: string) =>
    `We compared the quote's line items to ${benchmarkSetName} and historical range bands for ${region} and ${tradeCategory}.`,
  
  materials: 
    "We checked whether specified materials are stated clearly (brand/profile/BMT/coating), " +
    "fit-for-purpose for the stated environment, and consistent with typical practice.",
  
  compliance: 
    "We reviewed whether the quote explicitly addresses common compliance obligations for the trade scope. " +
    "Where standards are not cited, we flag as 'not evidenced in quote', not 'non-compliant'.",
  
  terms: 
    "We checked whether warranty terms, exclusions, and payment staging are clear, internally consistent, and customary."
};
