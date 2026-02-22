/**
 * VENTURR VALIDT - Cite-or-Block Rule Engine
 * No finding can exist without at least one valid citation
 * Conflicting sources must be surfaced, not resolved silently
 */

import { 
  Citation, 
  Finding, 
  validateFindingCitations, 
  canExportReport,
  containsBlockedLanguage,
  createInsufficientEvidenceFinding,
  BLOCKED_LANGUAGE
} from '../shared/citations';
import { searchRules, ruleToCitation, ComplianceRule } from './complianceKnowledgeBase';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  blockedFindings: string[];
}

export interface ConflictingSource {
  ruleA: ComplianceRule;
  ruleB: ComplianceRule;
  conflictType: "edition" | "interpretation" | "applicability";
  description: string;
}

/**
 * Validate a single finding before persistence
 */
export function validateFinding(finding: Finding): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for blocked language
  const languageCheck = containsBlockedLanguage(finding.claim + " " + finding.message);
  if (languageCheck.blocked) {
    errors.push(
      `Finding contains blocked language: "${languageCheck.terms.join('", "')}". ` +
      `Use approved language: "assessed against referenced standards and evidence provided".`
    );
  }

  // Validate citations
  try {
    validateFindingCitations(finding);
  } catch (error) {
    errors.push(error instanceof Error ? error.message : "Citation validation failed");
  }

  // Check citation quality
  for (const citation of finding.citations) {
    if (citation.confidence === "low") {
      warnings.push(
        `Citation from "${citation.authority}" has low confidence. Consider adding additional sources.`
      );
    }
    if (!citation.url_or_identifier) {
      warnings.push(
        `Citation from "${citation.authority}" missing URL/identifier for verification.`
      );
    }
  }

  // Check for insufficient evidence status without proper handling
  if (finding.status === "insufficient-evidence" && !finding.evidence_required?.length) {
    warnings.push(
      `Finding marked as insufficient evidence but no evidence_required list provided.`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    blockedFindings: errors.length > 0 ? [finding.id] : []
  };
}

/**
 * Validate all findings before report generation
 */
export function validateAllFindingsForReport(findings: Finding[]): ValidationResult {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];
  const blockedFindings: string[] = [];

  for (const finding of findings) {
    const result = validateFinding(finding);
    allErrors.push(...result.errors);
    allWarnings.push(...result.warnings);
    blockedFindings.push(...result.blockedFindings);
  }

  // Check overall report validity
  const exportCheck = canExportReport(findings);
  if (!exportCheck.canExport) {
    allErrors.push(exportCheck.reason || "Report cannot be exported due to citation issues");
  }

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
    blockedFindings
  };
}

/**
 * Check for conflicting sources in citations
 */
export function detectConflictingSources(findings: Finding[]): ConflictingSource[] {
  const conflicts: ConflictingSource[] = [];
  const citedRules: Map<string, { finding: Finding; rule: ComplianceRule }[]> = new Map();

  // Group findings by standard
  for (const finding of findings) {
    for (const citation of finding.citations) {
      const rules = searchRules({ standard: citation.authority });
      for (const rule of rules) {
        if (rule.clause === citation.clause_or_page) {
          const key = rule.standard;
          const existing = citedRules.get(key) || [];
          existing.push({ finding, rule });
          citedRules.set(key, existing);
        }
      }
    }
  }

  // Check for edition conflicts
  citedRules.forEach((entries, standard) => {
    const editions = new Set(entries.map((e: { finding: Finding; rule: ComplianceRule }) => e.rule.edition));
    if (editions.size > 1) {
      const editionList = Array.from(editions);
      conflicts.push({
        ruleA: entries[0].rule,
        ruleB: entries[1].rule,
        conflictType: "edition",
        description: `Multiple editions of ${standard} cited: ${editionList.join(", ")}. Ensure consistency.`
      });
    }
  });

  return conflicts;
}

/**
 * Block saving if validation fails
 */
export function blockSaveIfInvalid(findings: Finding[]): {
  canSave: boolean;
  reason?: string;
  blockedFindings: string[];
} {
  const validation = validateAllFindingsForReport(findings);
  
  if (!validation.valid) {
    return {
      canSave: false,
      reason: `Cannot save report: ${validation.errors.join("; ")}`,
      blockedFindings: validation.blockedFindings
    };
  }

  return {
    canSave: true,
    blockedFindings: []
  };
}

/**
 * Block export if validation fails
 */
export function blockExportIfInvalid(findings: Finding[]): {
  canExport: boolean;
  reason?: string;
  blockedFindings: string[];
  conflicts: ConflictingSource[];
} {
  const validation = validateAllFindingsForReport(findings);
  const conflicts = detectConflictingSources(findings);

  if (!validation.valid) {
    return {
      canExport: false,
      reason: `Cannot export report: ${validation.errors.join("; ")}`,
      blockedFindings: validation.blockedFindings,
      conflicts
    };
  }

  // Surface conflicts as warnings but don't block
  if (conflicts.length > 0) {
    console.warn(`[CiteOrBlock] ${conflicts.length} conflicting sources detected:`, 
      conflicts.map(c => c.description)
    );
  }

  return {
    canExport: true,
    blockedFindings: [],
    conflicts
  };
}

/**
 * Block sharing if validation fails
 */
export function blockShareIfInvalid(findings: Finding[]): {
  canShare: boolean;
  reason?: string;
  blockedFindings: string[];
} {
  // Same validation as export
  const exportResult = blockExportIfInvalid(findings);
  return {
    canShare: exportResult.canExport,
    reason: exportResult.reason,
    blockedFindings: exportResult.blockedFindings
  };
}

/**
 * Sanitize text to remove blocked language
 */
export function sanitizeText(text: string): string {
  let sanitized = text;
  
  // Replace blocked terms with approved alternatives
  const replacements: Record<string, string> = {
    "certified": "assessed",
    "certifies": "assesses",
    "certification": "assessment",
    "approved": "reviewed",
    "approves": "reviews",
    "approval": "review",
    "guaranteed": "assessed",
    "guarantees": "assesses",
    "guarantee": "assessment"
  };

  for (const [blocked, replacement] of Object.entries(replacements)) {
    const regex = new RegExp(blocked, "gi");
    sanitized = sanitized.replace(regex, replacement);
  }

  return sanitized;
}

/**
 * Create a finding with automatic citation lookup
 */
export function createFindingWithCitation(
  category: Finding["category"],
  claim: string,
  status: Finding["status"],
  message: string,
  standardKeywords: string[]
): Finding {
  // Search for relevant rules
  const citations: Citation[] = [];
  const evidenceRequired: string[] = [];

  for (const keyword of standardKeywords) {
    const rules = searchRules({ keyword, category: category as any });
    if (rules.length > 0) {
      citations.push(ruleToCitation(rules[0]));
    } else {
      evidenceRequired.push(`Reference to ${keyword} standard`);
    }
  }

  // If no citations found, mark as insufficient evidence
  if (citations.length === 0) {
    return createInsufficientEvidenceFinding(
      category,
      claim,
      "No applicable standards found in knowledge base",
      evidenceRequired
    );
  }

  return {
    id: `${category}-${Date.now()}`,
    category,
    claim: sanitizeText(claim),
    status,
    message: sanitizeText(message),
    citations,
    confidence: citations.length >= 2 ? "high" : "medium",
    evidence_required: evidenceRequired.length > 0 ? evidenceRequired : undefined
  };
}

/**
 * Middleware to enforce cite-or-block on all report operations
 */
export const citeOrBlockMiddleware = {
  beforeSave: blockSaveIfInvalid,
  beforeExport: blockExportIfInvalid,
  beforeShare: blockShareIfInvalid,
  validateFinding,
  validateAll: validateAllFindingsForReport,
  detectConflicts: detectConflictingSources,
  sanitize: sanitizeText,
  createFinding: createFindingWithCitation
};
