/**
 * VENTURR VALIDT - Citation Schema
 * Every claim requires a citation object - no citation = block persistence/export
 */

export interface Citation {
  authority: string;           // e.g., "National Construction Code"
  document: string;            // e.g., "NCC 2022 Volume Two"
  edition_or_version: string;  // e.g., "2022 Amendment 1"
  clause_or_page: string;      // e.g., "Section 3.5.2.1"
  url_or_identifier: string;   // e.g., "https://ncc.abcb.gov.au/..."
  retrieved_at: string;        // ISO timestamp
  confidence: "high" | "medium" | "low";
}

export interface Finding {
  id: string;
  category: "pricing" | "materials" | "compliance" | "warranty";
  claim: string;
  status: "assessed" | "flagged" | "insufficient-evidence";
  message: string;
  citations: Citation[];
  confidence: "high" | "medium" | "low";
  evidence_required?: string[];  // What evidence is still needed
}

export interface AuditLogEntry {
  timestamp: string;
  action: string;
  inputs: {
    fileUrl?: string;
    fileSize?: number;
    fileType?: string;
  };
  extraction: {
    method: "pdf-parse" | "ocr" | "failed";
    textLength: number;
    confidence: "high" | "medium" | "low";
    pageCount?: number;
  };
  sources: {
    standardsQueried: string[];
    sourcesRetrieved: string[];
  };
  model: {
    name: string;
    version: string;
    temperature: number;
  };
  prompts: {
    category: string;
    promptVersion: string;
    promptHash: string;
  }[];
  outputs: {
    overallScore: number;
    findingsCount: number;
    citationsCount: number;
    warningsCount: number;
  };
}

/**
 * Validate that a finding has at least one valid citation
 * Returns true if valid, throws error if not
 */
export function validateFindingCitations(finding: Finding): boolean {
  if (!finding.citations || finding.citations.length === 0) {
    // If no citations, status must be "insufficient-evidence"
    if (finding.status !== "insufficient-evidence") {
      throw new Error(
        `Finding "${finding.claim}" has no citations but status is "${finding.status}". ` +
        `Findings without citations must have status "insufficient-evidence".`
      );
    }
    return true;
  }

  // Validate each citation has required fields
  for (const citation of finding.citations) {
    if (!citation.authority || !citation.document || !citation.clause_or_page) {
      throw new Error(
        `Citation for finding "${finding.claim}" is incomplete. ` +
        `Required: authority, document, clause_or_page.`
      );
    }
    if (!citation.retrieved_at) {
      throw new Error(
        `Citation for finding "${finding.claim}" missing retrieved_at timestamp.`
      );
    }
  }

  return true;
}

/**
 * Validate all findings in a verification result
 * Throws error if any finding fails validation
 */
export function validateAllFindings(findings: Finding[]): boolean {
  for (const finding of findings) {
    validateFindingCitations(finding);
  }
  return true;
}

/**
 * Check if a report can be exported (all findings must have valid citations)
 */
export function canExportReport(findings: Finding[]): { 
  canExport: boolean; 
  blockedFindings: string[];
  reason?: string;
} {
  const blockedFindings: string[] = [];
  
  for (const finding of findings) {
    try {
      validateFindingCitations(finding);
    } catch (error) {
      blockedFindings.push(finding.id);
    }
  }

  if (blockedFindings.length > 0) {
    return {
      canExport: false,
      blockedFindings,
      reason: `${blockedFindings.length} finding(s) have invalid or missing citations`
    };
  }

  return { canExport: true, blockedFindings: [] };
}

/**
 * Create an "insufficient evidence" finding
 */
export function createInsufficientEvidenceFinding(
  category: Finding["category"],
  claim: string,
  reason: string,
  evidenceRequired: string[]
): Finding {
  return {
    id: `${category}-${Date.now()}`,
    category,
    claim,
    status: "insufficient-evidence",
    message: `Insufficient evidence to substantiate this finding. Reason: ${reason}`,
    citations: [],
    confidence: "low",
    evidence_required: evidenceRequired
  };
}

/**
 * Blocked language that must never appear in reports
 */
export const BLOCKED_LANGUAGE = [
  "certified",
  "approved", 
  "guaranteed",
  "certifies",
  "approves",
  "guarantees",
  "certification",
  "approval",
  "guarantee"
];

/**
 * Approved language for assessments
 */
export const APPROVED_LANGUAGE = {
  assessed: "assessed against referenced standards and evidence provided",
  analyzed: "analyzed based on available documentation",
  referenced: "referenced against applicable standards",
  reviewed: "reviewed for consistency with industry guidelines"
};

/**
 * Check text for blocked language
 */
export function containsBlockedLanguage(text: string): { 
  blocked: boolean; 
  terms: string[] 
} {
  const lowerText = text.toLowerCase();
  const foundTerms = BLOCKED_LANGUAGE.filter(term => 
    lowerText.includes(term)
  );
  
  return {
    blocked: foundTerms.length > 0,
    terms: foundTerms
  };
}
