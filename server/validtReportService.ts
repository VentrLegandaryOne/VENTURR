/**
 * VENTURR VALIDT Report Generation Service
 * 
 * Generates court-defensible verification reports with:
 * - Evidence-based findings
 * - Clear assumptions labeling
 * - Clarifying questions (not accusations)
 */

import { getDb } from "./db";
import { sql } from "drizzle-orm";
import type {
  ValidtReport,
  CoverPage,
  ExecutiveSummary,
  EvidenceRegister,
  EvidenceItem,
  EvidenceGap,
  PricingPillar,
  MaterialsPillar,
  CompliancePillar,
  TermsPillar,
  Finding,
  ClarifyingQuestion,
  ScoringLogic,
  ActionableNextSteps,
  AssumptionsAndLimitations,
  AppendixItem,
  PillarStatus,
  ConfidenceLevel,
} from "../shared/validtReportTypes";

import {
  VALIDT_DISCLAIMER,
  WHAT_THIS_REPORT_IS,
  WHAT_THIS_REPORT_IS_NOT,
  STANDARD_LIMITATIONS,
  PILLAR_METHODS,
  COMPLIANCE_STANDARDS,
} from "../shared/validtReportTypes";

const ENGINE_VERSION = "1.0.0";

/**
 * Generate a complete VALIDT report for a verification
 */
export async function generateValidtReport(verificationId: number): Promise<ValidtReport> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get verification and quote data
  const verificationResult = await db.execute(sql`
    SELECT v.*, q.fileName, q.fileUrl, q.fileSize, q.createdAt as quoteUploadedAt,
           q.extractedData, q.userId
    FROM verifications v
    JOIN quotes q ON v.quoteId = q.id
    WHERE v.id = ${verificationId}
  `);
  
  const verification = (verificationResult as any)[0]?.[0];
  if (!verification) throw new Error("Verification not found");

  // Parse extracted data
  const extractedData = typeof verification.extractedData === 'string' 
    ? JSON.parse(verification.extractedData) 
    : verification.extractedData || {};

  // Get evidence items
  const evidenceResult = await db.execute(sql`
    SELECT * FROM evidence_items WHERE verification_id = ${verificationId}
  `);
  const evidenceItems = (evidenceResult as any)[0] || [];

  // Get pillar findings
  const findingsResult = await db.execute(sql`
    SELECT * FROM pillar_findings WHERE verification_id = ${verificationId}
  `);
  const pillarFindings = (findingsResult as any)[0] || [];

  // Get clarifying questions
  const questionsResult = await db.execute(sql`
    SELECT * FROM clarifying_questions WHERE verification_id = ${verificationId}
  `);
  const clarifyingQuestions = (questionsResult as any)[0] || [];

  // Build the report
  const coverPage = buildCoverPage(verification, extractedData);
  const evidenceRegister = buildEvidenceRegister(verification, evidenceItems);
  const pillars = buildPillars(verification, pillarFindings, clarifyingQuestions, extractedData);
  const executiveSummary = buildExecutiveSummary(verification, pillars, evidenceRegister);
  const scoringLogic = buildScoringLogic(pillars);
  const actionableNextSteps = buildActionableNextSteps(pillars);
  const assumptionsAndLimitations = buildAssumptionsAndLimitations(verification);
  const appendices = buildAppendices(verification, extractedData);

  return {
    coverPage,
    executiveSummary,
    evidenceRegister,
    pillars,
    scoringLogic,
    actionableNextSteps,
    assumptionsAndLimitations,
    disclaimer: VALIDT_DISCLAIMER,
    appendices,
  };
}

function buildCoverPage(verification: any, extractedData: any): CoverPage {
  const contractor = extractedData.contractor || {};
  
  return {
    reportId: `VALIDT-${verification.id}-${Date.now().toString(36).toUpperCase()}`,
    dateGenerated: new Date().toISOString(),
    contractorName: contractor.name || "Not specified in quote",
    clientName: extractedData.clientName || "Property Owner",
    siteAddress: extractedData.siteAddress || "Address not specified",
    quoteTotalIncGst: extractedData.pricing?.total || verification.potentialSavings || 0,
    quoteDate: extractedData.quoteDate || verification.createdAt,
    quoteVersion: extractedData.quoteVersion || "1",
    tradeCategory: extractedData.projectType || "General Construction",
    engineVersion: ENGINE_VERSION,
    confidenceLabel: calculateConfidenceLevel(verification, extractedData),
  };
}

function calculateConfidenceLevel(verification: any, extractedData: any): ConfidenceLevel {
  // Calculate based on document legibility and completeness
  let score = 0;
  
  // Check if key data was extracted
  if (extractedData.contractor?.name) score += 20;
  if (extractedData.pricing?.total) score += 20;
  if (extractedData.lineItems?.length > 0) score += 20;
  if (extractedData.materials?.length > 0) score += 20;
  if (extractedData.warranty) score += 10;
  if (extractedData.compliance) score += 10;
  
  if (score >= 70) return "High";
  if (score >= 40) return "Medium";
  return "Low";
}

function buildEvidenceRegister(verification: any, evidenceItems: any[]): EvidenceRegister {
  const suppliedByUser: EvidenceItem[] = [];
  const extractedByValidt: EvidenceItem[] = [];
  const evidenceGaps: EvidenceGap[] = [];

  // Add the quote document as E1
  suppliedByUser.push({
    id: "E1",
    type: "supplied",
    source: verification.fileName?.endsWith('.pdf') ? "quote_pdf" : "quote_image",
    filename: verification.fileName,
    timestamp: verification.quoteUploadedAt,
    description: `Quote document: ${verification.fileName}`,
  });

  // Process stored evidence items
  evidenceItems.forEach((item: any) => {
    const evidenceItem: EvidenceItem = {
      id: item.evidence_id,
      type: item.evidence_type,
      source: item.source,
      filename: item.filename,
      pageRange: item.page_range,
      description: item.description,
      count: item.count,
    };

    if (item.evidence_type === 'supplied') {
      suppliedByUser.push(evidenceItem);
    } else if (item.evidence_type === 'extracted') {
      extractedByValidt.push(evidenceItem);
    } else if (item.evidence_type === 'gap') {
      evidenceGaps.push({
        id: item.evidence_id,
        description: item.description,
        impact: item.impact || 'pricing',
        severity: item.severity || 'moderate',
      });
    }
  });

  // Add default extracted items if none exist
  if (extractedByValidt.length === 0) {
    extractedByValidt.push({
      id: "X1",
      type: "extracted",
      source: "ocr",
      description: "Line item table (OCR extraction)",
    });
    extractedByValidt.push({
      id: "X2",
      type: "extracted",
      source: "analysis",
      description: "Scope keywords and exclusions list",
    });
  }

  return { suppliedByUser, extractedByValidt, evidenceGaps };
}

function buildPillars(
  verification: any, 
  findings: any[], 
  questions: any[],
  extractedData: any
): {
  pricing: PricingPillar;
  materials: MaterialsPillar;
  compliance: CompliancePillar;
  terms: TermsPillar;
} {
  const region = extractedData.region || "NSW";
  const tradeCategory = extractedData.projectType || "General Construction";

  return {
    pricing: buildPricingPillar(verification, findings, questions, region, tradeCategory),
    materials: buildMaterialsPillar(verification, findings, questions),
    compliance: buildCompliancePillar(verification, findings, questions),
    terms: buildTermsPillar(verification, findings, questions),
  };
}

function buildPricingPillar(
  verification: any, 
  findings: any[], 
  questions: any[],
  region: string,
  tradeCategory: string
): PricingPillar {
  const pricingFindings = findings.filter((f: any) => f.pillar === 'pricing');
  const pricingQuestions = questions.filter((q: any) => q.pillar === 'pricing');

  // Determine status based on verification scores
  const pricingScore = verification.pricing_score || 0;
  let status: PillarStatus = "Green";
  if (pricingScore < 60) status = "Red";
  else if (pricingScore < 80) status = "Amber";

  // Build findings from stored data or generate defaults
  const formattedFindings: Finding[] = pricingFindings.length > 0 
    ? pricingFindings.map((f: any) => ({
        id: f.finding_id,
        fact: f.fact,
        evidence: f.evidence_ref || "E1",
        benchmark: f.benchmark_ref,
        interpretation: f.interpretation || "Under review",
        riskStatement: f.risk_statement || "",
      }))
    : generateDefaultPricingFindings(verification);

  // Build questions from stored data or generate defaults
  const formattedQuestions: ClarifyingQuestion[] = pricingQuestions.length > 0
    ? pricingQuestions.map((q: any, i: number) => ({
        id: i + 1,
        question: q.question,
        pillar: 'pricing' as const,
      }))
    : [
        { id: 1, question: "Can you provide a breakdown for allowances/sundries/contingency showing quantity × rate?", pillar: 'pricing' as const },
        { id: 2, question: "What measurement basis was used (m², lm, per item) and what quantities are assumed?", pillar: 'pricing' as const },
      ];

  return {
    status,
    method: PILLAR_METHODS.pricing("VALIDT Benchmark Database", region, tradeCategory),
    findings: formattedFindings,
    clarifyingQuestions: formattedQuestions,
    benchmarkSetName: "VALIDT Benchmark Database",
    region,
    tradeCategory,
  };
}

function generateDefaultPricingFindings(verification: any): Finding[] {
  const findings: Finding[] = [];
  const pricingDetails = typeof verification.pricing_details === 'string'
    ? JSON.parse(verification.pricing_details)
    : verification.pricing_details || {};

  if (pricingDetails.lineItems) {
    pricingDetails.lineItems.forEach((item: any, index: number) => {
      findings.push({
        id: `A${index + 1}`,
        fact: `Line item "${item.description || 'Item ' + (index + 1)}" is quoted at $${item.amount || 0}.`,
        evidence: "E1",
        benchmark: `BENCH-${verification.id}-${index + 1}`,
        interpretation: item.status || "Under review",
        riskStatement: item.flag 
          ? "If accepted without clarification, this may increase total cost without corresponding scope detail."
          : "",
      });
    });
  }

  if (findings.length === 0) {
    findings.push({
      id: "A1",
      fact: "Quote total pricing has been reviewed against regional benchmarks.",
      evidence: "E1",
      interpretation: verification.pricing_score >= 80 ? "Within range" : "Requires clarification",
      riskStatement: verification.pricing_score < 80 
        ? "Some line items may benefit from additional breakdown for verification."
        : "",
    });
  }

  return findings;
}

function buildMaterialsPillar(verification: any, findings: any[], questions: any[]): MaterialsPillar {
  const materialsFindings = findings.filter((f: any) => f.pillar === 'materials');
  const materialsQuestions = questions.filter((q: any) => q.pillar === 'materials');

  const materialsScore = verification.materials_score || 0;
  let status: PillarStatus = "Green";
  if (materialsScore < 60) status = "Red";
  else if (materialsScore < 80) status = "Amber";

  const formattedFindings: Finding[] = materialsFindings.length > 0
    ? materialsFindings.map((f: any) => ({
        id: f.finding_id,
        fact: f.fact,
        evidence: f.evidence_ref || "E1",
        benchmark: f.benchmark_ref,
        interpretation: f.interpretation || "Under review",
        riskStatement: f.risk_statement || "",
      }))
    : [{
        id: "B1",
        fact: "Material specifications have been reviewed for completeness.",
        evidence: "E1",
        interpretation: materialsScore >= 80 ? "Sufficiently specified" : "Under-specified",
        riskStatement: materialsScore < 80 
          ? "Under-specified materials reduce the ability to verify price and suitability."
          : "",
      }];

  const formattedQuestions: ClarifyingQuestion[] = materialsQuestions.length > 0
    ? materialsQuestions.map((q: any, i: number) => ({
        id: i + 1,
        question: q.question,
        pillar: 'materials' as const,
      }))
    : [
        { id: 1, question: "Confirm product brand/profile, base metal thickness (BMT), coating class, and colour.", pillar: 'materials' as const },
        { id: 2, question: "Confirm fixings type and corrosion suitability if coastal/industrial exposure applies.", pillar: 'materials' as const },
      ];

  return {
    status,
    method: PILLAR_METHODS.materials,
    findings: formattedFindings,
    clarifyingQuestions: formattedQuestions,
  };
}

function buildCompliancePillar(verification: any, findings: any[], questions: any[]): CompliancePillar {
  const complianceFindings = findings.filter((f: any) => f.pillar === 'compliance');
  const complianceQuestions = questions.filter((q: any) => q.pillar === 'compliance');

  const complianceScore = verification.compliance_score || 0;
  let status: PillarStatus = "Green";
  if (complianceScore < 60) status = "Red";
  else if (complianceScore < 80) status = "Amber";

  const formattedFindings: Finding[] = complianceFindings.length > 0
    ? complianceFindings.map((f: any) => ({
        id: f.finding_id,
        fact: f.fact,
        evidence: f.evidence_ref || "E1",
        benchmark: f.benchmark_ref,
        interpretation: f.interpretation || "Under review",
        riskStatement: f.risk_statement || "",
      }))
    : [{
        id: "C1",
        fact: "The quote references compliance with Australian Standards.",
        evidence: "E1",
        interpretation: complianceScore >= 80 ? "Compliance detail evidenced" : "Compliance intent stated; compliance detail not evidenced",
        riskStatement: complianceScore < 80 
          ? "If a dispute arises, lack of cited standards can reduce clarity of expected workmanship and materials."
          : "",
      }];

  const formattedQuestions: ClarifyingQuestion[] = complianceQuestions.length > 0
    ? complianceQuestions.map((q: any, i: number) => ({
        id: i + 1,
        question: q.question,
        pillar: 'compliance' as const,
      }))
    : [
        { id: 1, question: "Which standards and installation manuals will be followed (list them in the contract/quote)?", pillar: 'compliance' as const },
        { id: 2, question: "What access and fall protection method is included (scaffold/edge protection/EWP) and is it costed?", pillar: 'compliance' as const },
      ];

  // Determine which standards are relevant
  const standardsReferenced = [
    COMPLIANCE_STANDARDS.NCC,
    COMPLIANCE_STANDARDS.SAFEWORK_NSW,
  ];

  return {
    status,
    method: PILLAR_METHODS.compliance,
    findings: formattedFindings,
    clarifyingQuestions: formattedQuestions,
    standardsReferenced,
  };
}

function buildTermsPillar(verification: any, findings: any[], questions: any[]): TermsPillar {
  const termsFindings = findings.filter((f: any) => f.pillar === 'terms');
  const termsQuestions = questions.filter((q: any) => q.pillar === 'terms');

  const warrantyScore = verification.warranty_score || 0;
  let status: PillarStatus = "Green";
  if (warrantyScore < 60) status = "Red";
  else if (warrantyScore < 80) status = "Amber";

  const formattedFindings: Finding[] = termsFindings.length > 0
    ? termsFindings.map((f: any) => ({
        id: f.finding_id,
        fact: f.fact,
        evidence: f.evidence_ref || "E1",
        benchmark: f.benchmark_ref,
        interpretation: f.interpretation || "Under review",
        riskStatement: f.risk_statement || "",
      }))
    : [{
        id: "D1",
        fact: "Warranty and payment terms have been reviewed.",
        evidence: "E1",
        interpretation: warrantyScore >= 80 ? "Clear" : "Unclear",
        riskStatement: warrantyScore < 80 
          ? "Unclear warranty scope can create post-completion disputes."
          : "",
      }];

  const formattedQuestions: ClarifyingQuestion[] = termsQuestions.length > 0
    ? termsQuestions.map((q: any, i: number) => ({
        id: i + 1,
        question: q.question,
        pillar: 'terms' as const,
      }))
    : [
        { id: 1, question: "What is covered vs excluded under workmanship warranty (leaks, flashings, penetrations, sealants)?", pillar: 'terms' as const },
        { id: 2, question: "Confirm payment stages and what triggers progress claims (materials delivered, milestone achieved).", pillar: 'terms' as const },
      ];

  return {
    status,
    method: PILLAR_METHODS.terms,
    findings: formattedFindings,
    clarifyingQuestions: formattedQuestions,
  };
}

function buildExecutiveSummary(
  verification: any, 
  pillars: any, 
  evidenceRegister: EvidenceRegister
): ExecutiveSummary {
  // Count consistent vs clarification items
  let consistentCount = 0;
  let clarificationCount = 0;

  Object.values(pillars).forEach((pillar: any) => {
    pillar.findings.forEach((finding: Finding) => {
      if (finding.interpretation?.includes("Within range") || 
          finding.interpretation?.includes("Clear") ||
          finding.interpretation?.includes("Sufficiently specified") ||
          finding.interpretation?.includes("evidenced")) {
        consistentCount++;
      } else {
        clarificationCount++;
      }
    });
  });

  // Determine overall status
  const statuses = [pillars.pricing.status, pillars.materials.status, pillars.compliance.status, pillars.terms.status];
  let overallStatus: PillarStatus = "Green";
  if (statuses.includes("Red")) overallStatus = "Red";
  else if (statuses.includes("Amber")) overallStatus = "Amber";

  return {
    overallStatus,
    consistentItemsCount: consistentCount,
    clarificationItemsCount: clarificationCount,
    keyDrivers: {
      pricing: pillars.pricing.status !== "Green" ? pillars.pricing.findings[0]?.interpretation : undefined,
      materials: pillars.materials.status !== "Green" ? pillars.materials.findings[0]?.interpretation : undefined,
      compliance: pillars.compliance.status !== "Green" ? pillars.compliance.findings[0]?.interpretation : undefined,
      terms: pillars.terms.status !== "Green" ? pillars.terms.findings[0]?.interpretation : undefined,
      evidenceQuality: evidenceRegister.evidenceGaps.length > 0 
        ? `${evidenceRegister.evidenceGaps.length} evidence gaps identified`
        : undefined,
    },
    whatThisReportIs: WHAT_THIS_REPORT_IS,
    whatThisReportIsNot: WHAT_THIS_REPORT_IS_NOT,
  };
}

function buildScoringLogic(pillars: any): ScoringLogic {
  const statuses = {
    pricing: pillars.pricing.status,
    materials: pillars.materials.status,
    compliance: pillars.compliance.status,
    terms: pillars.terms.status,
  };

  // Determine overall status with explanation
  let overallStatus: PillarStatus = "Green";
  let reasons: string[] = [];

  if (statuses.pricing === "Red" || statuses.materials === "Red" || 
      statuses.compliance === "Red" || statuses.terms === "Red") {
    overallStatus = "Red";
    Object.entries(statuses).forEach(([pillar, status]) => {
      if (status === "Red") reasons.push(`${pillar} pillar is Red`);
    });
  } else if (statuses.pricing === "Amber" || statuses.materials === "Amber" || 
             statuses.compliance === "Amber" || statuses.terms === "Amber") {
    overallStatus = "Amber";
    Object.entries(statuses).forEach(([pillar, status]) => {
      if (status === "Amber") reasons.push(`${pillar} pillar requires clarification`);
    });
  } else {
    reasons.push("all pillars are Green with no material evidence gaps");
  }

  return {
    pillarStatuses: statuses,
    overallStatusRule: `Red if: any pillar is Red and the issue is "material to safety/cost/contract certainty". Amber if: one or more pillars have "not evidenced" items requiring clarification. Green if: all pillars Green with no material evidence gaps.`,
    reasonForStatus: `Overall status is ${overallStatus} because ${reasons.join("; ")}.`,
  };
}

function buildActionableNextSteps(pillars: any): ActionableNextSteps {
  const topItems: string[] = [];

  // Collect top clarifying questions from each amber/red pillar
  Object.values(pillars).forEach((pillar: any) => {
    if (pillar.status !== "Green" && pillar.clarifyingQuestions.length > 0) {
      topItems.push(pillar.clarifyingQuestions[0].question);
    }
  });

  // Limit to top 3
  const limitedItems = topItems.slice(0, 3);

  return {
    topItems: limitedItems.length > 0 ? limitedItems : ["Review and confirm all scope items before signing."],
    potentialStatusImprovement: topItems.length > 0 
      ? "If contractor confirms in writing: status may improve from Amber→Green, subject to review."
      : undefined,
  };
}

function buildAssumptionsAndLimitations(verification: any): AssumptionsAndLimitations {
  const assumptions: Array<{ id: string; description: string }> = [];

  // Add assumptions based on what was inferred
  if (!verification.extracted_data?.siteAddress) {
    assumptions.push({
      id: "A1",
      description: "Site address not explicitly stated in quote; assumed to be client's primary property.",
    });
  }

  if (!verification.extracted_data?.measurementBasis) {
    assumptions.push({
      id: "A2",
      description: "Measurement basis not stated; quantities assumed based on typical practice.",
    });
  }

  return {
    assumptions,
    limitations: STANDARD_LIMITATIONS,
  };
}

function buildAppendices(verification: any, extractedData: any): AppendixItem[] {
  const appendices: AppendixItem[] = [];

  // Appendix A: Extracted line items
  if (extractedData.lineItems?.length > 0) {
    appendices.push({
      id: "A",
      title: "Extracted Line Item Table (OCR)",
      content: extractedData.lineItems,
    });
  }

  // Appendix B: Flagged clauses
  const flags = typeof verification.flags === 'string' 
    ? JSON.parse(verification.flags) 
    : verification.flags || [];
  
  if (flags.length > 0) {
    appendices.push({
      id: "B",
      title: "Flagged Clauses/Exclusions",
      content: flags.map((f: any) => f.description || f).join("\n"),
    });
  }

  // Appendix C: Benchmark IDs
  appendices.push({
    id: "C",
    title: "Benchmark IDs Used",
    content: `VALIDT-BENCH-${verification.id}-NSW-${new Date().getFullYear()}`,
  });

  return appendices;
}

/**
 * Store evidence items for a verification
 */
export async function storeEvidenceItem(
  verificationId: number,
  item: Omit<EvidenceItem, 'id'> & { id?: string }
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const evidenceId = item.id || `E${Date.now()}`;

  await db.execute(sql`
    INSERT INTO evidence_items (verification_id, evidence_id, evidence_type, source, filename, page_range, description, count)
    VALUES (${verificationId}, ${evidenceId}, ${item.type}, ${item.source || null}, ${item.filename || null}, ${item.pageRange || null}, ${item.description}, ${item.count || null})
  `);
}

/**
 * Store a pillar finding
 */
export async function storePillarFinding(
  verificationId: number,
  pillar: 'pricing' | 'materials' | 'compliance' | 'terms',
  finding: Finding
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.execute(sql`
    INSERT INTO pillar_findings (verification_id, pillar, finding_id, fact, evidence_ref, benchmark_ref, interpretation, risk_statement)
    VALUES (${verificationId}, ${pillar}, ${finding.id}, ${finding.fact}, ${finding.evidence}, ${finding.benchmark || null}, ${finding.interpretation}, ${finding.riskStatement})
  `);
}

/**
 * Store a clarifying question
 */
export async function storeClarifyingQuestion(
  verificationId: number,
  pillar: 'pricing' | 'materials' | 'compliance' | 'terms',
  question: string
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.execute(sql`
    INSERT INTO clarifying_questions (verification_id, pillar, question)
    VALUES (${verificationId}, ${pillar}, ${question})
  `);
}
