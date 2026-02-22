/**
 * VENTURR VALIDT - Deterministic Audit Trail
 * Every verification run logs: inputs, extracted text, sources, model/version, prompts, outputs
 */

import crypto from 'crypto';
import { AuditLogEntry } from '../shared/citations';

// In-memory audit log (in production, this would be persisted to database)
const auditLogs: Map<string, AuditLogEntry[]> = new Map();

/**
 * Generate a hash for prompt versioning
 */
export function hashPrompt(prompt: string): string {
  return crypto.createHash('sha256').update(prompt).digest('hex').substring(0, 16);
}

/**
 * Current prompt versions for each analysis category
 */
export const PROMPT_VERSIONS = {
  pricing: "v1.0.0",
  materials: "v1.0.0", 
  compliance: "v1.0.0",
  warranty: "v1.0.0",
  extraction: "v1.0.0"
};

/**
 * Model configuration
 */
export const MODEL_CONFIG = {
  name: "sonar-pro",
  version: "2024-12",
  temperature: 0.2,
  maxTokens: 2000
};

/**
 * Create a new audit log entry
 */
export function createAuditEntry(
  quoteId: number,
  inputs: AuditLogEntry["inputs"]
): string {
  const entryId = `audit-${quoteId}-${Date.now()}`;
  
  const entry: AuditLogEntry = {
    timestamp: new Date().toISOString(),
    action: "verification_started",
    inputs,
    extraction: {
      method: "failed",
      textLength: 0,
      confidence: "low"
    },
    sources: {
      standardsQueried: [],
      sourcesRetrieved: []
    },
    model: MODEL_CONFIG,
    prompts: [],
    outputs: {
      overallScore: 0,
      findingsCount: 0,
      citationsCount: 0,
      warningsCount: 0
    }
  };

  const quoteKey = `quote-${quoteId}`;
  const existing = auditLogs.get(quoteKey) || [];
  existing.push(entry);
  auditLogs.set(quoteKey, existing);

  console.log(`[Audit] Created entry ${entryId} for quote ${quoteId}`);
  return entryId;
}

/**
 * Update extraction results in audit log
 */
export function logExtraction(
  quoteId: number,
  method: "pdf-parse" | "ocr" | "failed",
  textLength: number,
  confidence: "high" | "medium" | "low",
  pageCount?: number
): void {
  const quoteKey = `quote-${quoteId}`;
  const entries = auditLogs.get(quoteKey);
  
  if (entries && entries.length > 0) {
    const latest = entries[entries.length - 1];
    latest.extraction = {
      method,
      textLength,
      confidence,
      pageCount
    };
    console.log(`[Audit] Logged extraction for quote ${quoteId}: ${method}, ${textLength} chars, ${confidence} confidence`);
  }
}

/**
 * Log a prompt execution
 */
export function logPrompt(
  quoteId: number,
  category: string,
  prompt: string
): void {
  const quoteKey = `quote-${quoteId}`;
  const entries = auditLogs.get(quoteKey);
  
  if (entries && entries.length > 0) {
    const latest = entries[entries.length - 1];
    latest.prompts.push({
      category,
      promptVersion: PROMPT_VERSIONS[category as keyof typeof PROMPT_VERSIONS] || "v1.0.0",
      promptHash: hashPrompt(prompt)
    });
    console.log(`[Audit] Logged prompt for quote ${quoteId}: ${category}`);
  }
}

/**
 * Log sources retrieved
 */
export function logSources(
  quoteId: number,
  standardsQueried: string[],
  sourcesRetrieved: string[]
): void {
  const quoteKey = `quote-${quoteId}`;
  const entries = auditLogs.get(quoteKey);
  
  if (entries && entries.length > 0) {
    const latest = entries[entries.length - 1];
    latest.sources = {
      standardsQueried,
      sourcesRetrieved
    };
    console.log(`[Audit] Logged sources for quote ${quoteId}: ${sourcesRetrieved.length} retrieved`);
  }
}

/**
 * Log final outputs
 */
export function logOutputs(
  quoteId: number,
  overallScore: number,
  findingsCount: number,
  citationsCount: number,
  warningsCount: number
): void {
  const quoteKey = `quote-${quoteId}`;
  const entries = auditLogs.get(quoteKey);
  
  if (entries && entries.length > 0) {
    const latest = entries[entries.length - 1];
    latest.action = "verification_completed";
    latest.outputs = {
      overallScore,
      findingsCount,
      citationsCount,
      warningsCount
    };
    console.log(`[Audit] Logged outputs for quote ${quoteId}: score=${overallScore}, findings=${findingsCount}`);
  }
}

/**
 * Log verification failure
 */
export function logFailure(
  quoteId: number,
  error: string
): void {
  const quoteKey = `quote-${quoteId}`;
  const entries = auditLogs.get(quoteKey);
  
  if (entries && entries.length > 0) {
    const latest = entries[entries.length - 1];
    latest.action = `verification_failed: ${error}`;
    console.log(`[Audit] Logged failure for quote ${quoteId}: ${error}`);
  }
}

/**
 * Get audit trail for a quote
 */
export function getAuditTrail(quoteId: number): AuditLogEntry[] {
  const quoteKey = `quote-${quoteId}`;
  return auditLogs.get(quoteKey) || [];
}

/**
 * Get full audit log (for admin/debugging)
 */
export function getAllAuditLogs(): Map<string, AuditLogEntry[]> {
  return auditLogs;
}

/**
 * Export audit trail as JSON for compliance reporting
 */
export function exportAuditTrail(quoteId: number): string {
  const trail = getAuditTrail(quoteId);
  return JSON.stringify(trail, null, 2);
}
