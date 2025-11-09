/**
 * DECISION PATH LOGGING & TRANSPARENCY SYSTEM
 * 
 * Records complete decision paths for transparency and auditability
 * Enables understanding of AI reasoning and decision-making process
 */

import { z } from 'zod';

// ============================================================================
// TYPES
// ============================================================================

export interface DecisionPathLog {
  id: string;
  timestamp: Date;
  decisionId: string;
  context: string;
  phase: 'evaluation' | 'selection' | 'execution' | 'outcome';
  step: number;
  action: string;
  reasoning: string;
  metrics: Record<string, number>;
  alternatives: string[];
  selectedAlternative: string;
  confidence: number; // 0-1
  riskLevel: 'low' | 'medium' | 'high';
}

export interface TransparencyReport {
  id: string;
  timestamp: Date;
  decisionId: string;
  title: string;
  summary: string;
  decisionPath: DecisionPathLog[];
  objectiveWeights: Record<string, number>;
  selectedOption: string;
  reasoning: string;
  alternatives: Array<{ name: string; score: number; reason: string }>;
  outcome: {
    success: boolean;
    metrics: Record<string, number>;
    reward: number;
  } | null;
}

export interface AuditTrail {
  id: string;
  timestamp: Date;
  decisionId: string;
  beforeState: Record<string, any>;
  action: string;
  afterState: Record<string, any>;
  impact: {
    functionalStability: number;
    integrationCohesion: number;
    perceptionAcceptance: number;
    performanceLatency: number;
    uxClarity: number;
  };
  verified: boolean;
  verificationNotes: string;
}

// ============================================================================
// DECISION PATH LOGGING & TRANSPARENCY
// ============================================================================

export class DecisionPathLogging {
  private decisionPathLogs: DecisionPathLog[] = [];
  private transparencyReports: TransparencyReport[] = [];
  private auditTrails: AuditTrail[] = [];
  private currentDecisionPath: DecisionPathLog[] = [];

  /**
   * Log decision step
   */
  logDecisionStep(
    decisionId: string,
    context: string,
    phase: 'evaluation' | 'selection' | 'execution' | 'outcome',
    action: string,
    reasoning: string,
    metrics: Record<string, number> = {},
    alternatives: string[] = [],
    selectedAlternative: string = '',
    confidence: number = 0.5,
    riskLevel: 'low' | 'medium' | 'high' = 'medium'
  ): DecisionPathLog {
    const logId = `log-${Date.now()}-${Math.random()}`;
    const step = this.currentDecisionPath.length + 1;

    const log: DecisionPathLog = {
      id: logId,
      timestamp: new Date(),
      decisionId,
      context,
      phase,
      step,
      action,
      reasoning,
      metrics,
      alternatives,
      selectedAlternative,
      confidence,
      riskLevel,
    };

    this.currentDecisionPath.push(log);
    this.decisionPathLogs.push(log);

    // Enforce retention
    if (this.decisionPathLogs.length > 50000) {
      this.decisionPathLogs = this.decisionPathLogs.slice(-25000);
    }

    console.log(
      `[DPL] Decision step logged - Phase: ${phase}, Step: ${step}, Action: ${action}, Confidence: ${(confidence * 100).toFixed(0)}%`
    );

    return log;
  }

  /**
   * Create transparency report
   */
  createTransparencyReport(
    decisionId: string,
    title: string,
    summary: string,
    objectiveWeights: Record<string, number>,
    selectedOption: string,
    reasoning: string,
    alternatives: Array<{ name: string; score: number; reason: string }>
  ): TransparencyReport {
    const reportId = `report-${Date.now()}-${Math.random()}`;

    const report: TransparencyReport = {
      id: reportId,
      timestamp: new Date(),
      decisionId,
      title,
      summary,
      decisionPath: this.currentDecisionPath,
      objectiveWeights,
      selectedOption,
      reasoning,
      alternatives,
      outcome: null,
    };

    this.transparencyReports.push(report);

    // Enforce retention
    if (this.transparencyReports.length > 10000) {
      this.transparencyReports = this.transparencyReports.slice(-5000);
    }

    // Reset current path
    this.currentDecisionPath = [];

    console.log(`[DPL] Transparency report created: ${reportId}`);

    return report;
  }

  /**
   * Record decision outcome in report
   */
  recordDecisionOutcome(
    reportId: string,
    success: boolean,
    metrics: Record<string, number>,
    reward: number
  ): void {
    const report = this.transparencyReports.find((r) => r.id === reportId);
    if (!report) {
      console.warn(`[DPL] Report not found: ${reportId}`);
      return;
    }

    report.outcome = {
      success,
      metrics,
      reward,
    };

    console.log(`[DPL] Decision outcome recorded - Success: ${success}, Reward: ${reward.toFixed(2)}`);
  }

  /**
   * Create audit trail
   */
  createAuditTrail(
    decisionId: string,
    beforeState: Record<string, any>,
    action: string,
    afterState: Record<string, any>,
    impact: {
      functionalStability: number;
      integrationCohesion: number;
      perceptionAcceptance: number;
      performanceLatency: number;
      uxClarity: number;
    }
  ): AuditTrail {
    const trailId = `trail-${Date.now()}-${Math.random()}`;

    const trail: AuditTrail = {
      id: trailId,
      timestamp: new Date(),
      decisionId,
      beforeState,
      action,
      afterState,
      impact,
      verified: false,
      verificationNotes: '',
    };

    this.auditTrails.push(trail);

    // Enforce retention
    if (this.auditTrails.length > 50000) {
      this.auditTrails = this.auditTrails.slice(-25000);
    }

    console.log(`[DPL] Audit trail created: ${trailId}`);

    return trail;
  }

  /**
   * Verify audit trail
   */
  verifyAuditTrail(trailId: string, verified: boolean, notes: string = ''): void {
    const trail = this.auditTrails.find((t) => t.id === trailId);
    if (!trail) {
      console.warn(`[DPL] Trail not found: ${trailId}`);
      return;
    }

    trail.verified = verified;
    trail.verificationNotes = notes;

    console.log(`[DPL] Audit trail verified: ${trailId}, Verified: ${verified}`);
  }

  /**
   * Get decision path for decision
   */
  getDecisionPath(decisionId: string): DecisionPathLog[] {
    return this.decisionPathLogs.filter((log) => log.decisionId === decisionId);
  }

  /**
   * Get transparency report
   */
  getTransparencyReport(reportId: string): TransparencyReport | null {
    return this.transparencyReports.find((r) => r.id === reportId) || null;
  }

  /**
   * Get transparency reports
   */
  getTransparencyReports(limit: number = 50): TransparencyReport[] {
    return this.transparencyReports.slice(-limit);
  }

  /**
   * Get audit trail
   */
  getAuditTrail(trailId: string): AuditTrail | null {
    return this.auditTrails.find((t) => t.id === trailId) || null;
  }

  /**
   * Get audit trails
   */
  getAuditTrails(limit: number = 50): AuditTrail[] {
    return this.auditTrails.slice(-limit);
  }

  /**
   * Get audit trails for decision
   */
  getAuditTrailsForDecision(decisionId: string): AuditTrail[] {
    return this.auditTrails.filter((t) => t.decisionId === decisionId);
  }

  /**
   * Generate transparency summary
   */
  generateTransparencySummary(reportId: string): string {
    const report = this.transparencyReports.find((r) => r.id === reportId);
    if (!report) return 'Report not found';

    let summary = `# Decision Transparency Report\n\n`;
    summary += `**Title:** ${report.title}\n`;
    summary += `**Decision ID:** ${report.decisionId}\n`;
    summary += `**Timestamp:** ${report.timestamp.toISOString()}\n\n`;

    summary += `## Summary\n${report.summary}\n\n`;

    summary += `## Objective Weights\n`;
    for (const [key, value] of Object.entries(report.objectiveWeights)) {
      summary += `- ${key}: ${(value * 100).toFixed(1)}%\n`;
    }
    summary += '\n';

    summary += `## Decision Path\n`;
    for (const step of report.decisionPath) {
      summary += `### Step ${step.step}: ${step.action}\n`;
      summary += `- Phase: ${step.phase}\n`;
      summary += `- Reasoning: ${step.reasoning}\n`;
      summary += `- Confidence: ${(step.confidence * 100).toFixed(0)}%\n`;
      summary += `- Risk Level: ${step.riskLevel}\n`;
      if (step.selectedAlternative) {
        summary += `- Selected: ${step.selectedAlternative}\n`;
      }
      summary += '\n';
    }

    summary += `## Selected Option\n${report.selectedOption}\n\n`;

    summary += `## Reasoning\n${report.reasoning}\n\n`;

    summary += `## Alternatives Considered\n`;
    for (const alt of report.alternatives) {
      summary += `- **${alt.name}** (Score: ${alt.score.toFixed(1)}/10): ${alt.reason}\n`;
    }
    summary += '\n';

    if (report.outcome) {
      summary += `## Outcome\n`;
      summary += `- Success: ${report.outcome.success ? 'Yes' : 'No'}\n`;
      summary += `- Reward: ${report.outcome.reward.toFixed(2)}\n`;
      summary += `- Metrics:\n`;
      for (const [key, value] of Object.entries(report.outcome.metrics)) {
        summary += `  - ${key}: ${typeof value === 'number' ? value.toFixed(1) : value}\n`;
      }
    }

    return summary;
  }

  /**
   * Get logging statistics
   */
  getLoggingStatistics(): {
    totalDecisionPaths: number;
    totalReports: number;
    totalAuditTrails: number;
    verifiedTrails: number;
    unverifiedTrails: number;
    averagePathLength: number;
    averageConfidence: number;
  } {
    const uniqueDecisions = new Set(this.decisionPathLogs.map((log) => log.decisionId)).size;
    const verifiedTrails = this.auditTrails.filter((t) => t.verified).length;
    const unverifiedTrails = this.auditTrails.filter((t) => !t.verified).length;
    const avgPathLength =
      this.transparencyReports.length > 0
        ? this.transparencyReports.reduce((sum, r) => sum + r.decisionPath.length, 0) /
          this.transparencyReports.length
        : 0;
    const avgConfidence =
      this.decisionPathLogs.length > 0
        ? this.decisionPathLogs.reduce((sum, log) => sum + log.confidence, 0) / this.decisionPathLogs.length
        : 0;

    return {
      totalDecisionPaths: uniqueDecisions,
      totalReports: this.transparencyReports.length,
      totalAuditTrails: this.auditTrails.length,
      verifiedTrails,
      unverifiedTrails,
      averagePathLength: Math.round(avgPathLength * 10) / 10,
      averageConfidence: Math.round(avgConfidence * 100) / 100,
    };
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export const decisionPathLogging = new DecisionPathLogging();

