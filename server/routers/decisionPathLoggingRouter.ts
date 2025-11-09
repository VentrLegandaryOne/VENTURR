/**
 * DECISION PATH LOGGING ROUTER
 * 
 * tRPC procedures for transparency and audit logging
 */

import { protectedProcedure, router } from '../_core/trpc';
import { z } from 'zod';
import { decisionPathLogging } from '../decisionPathLogging';

export const decisionPathLoggingRouter = router({
  /**
   * Get decision path for decision
   */
  getDecisionPath: protectedProcedure
    .input(z.object({ decisionId: z.string() }))
    .query(({ input }) => {
      const path = decisionPathLogging.getDecisionPath(input.decisionId);

      return path.map((log) => ({
        id: log.id,
        timestamp: log.timestamp,
        step: log.step,
        phase: log.phase,
        action: log.action,
        reasoning: log.reasoning,
        confidence: (log.confidence * 100).toFixed(0),
        riskLevel: log.riskLevel,
      }));
    }),

  /**
   * Get transparency report
   */
  getTransparencyReport: protectedProcedure
    .input(z.object({ reportId: z.string() }))
    .query(({ input }) => {
      const report = decisionPathLogging.getTransparencyReport(input.reportId);

      if (!report) return null;

      return {
        id: report.id,
        timestamp: report.timestamp,
        title: report.title,
        summary: report.summary,
        selectedOption: report.selectedOption,
        reasoning: report.reasoning,
        pathLength: report.decisionPath.length,
        alternatives: report.alternatives.map((a) => ({
          name: a.name,
          score: a.score.toFixed(1),
          reason: a.reason,
        })),
        outcome: report.outcome
          ? {
              success: report.outcome.success,
              reward: report.outcome.reward.toFixed(2),
            }
          : null,
      };
    }),

  /**
   * Get transparency reports
   */
  getTransparencyReports: protectedProcedure
    .input(z.object({ limit: z.number().optional() }).optional())
    .query(({ input }) => {
      const reports = decisionPathLogging.getTransparencyReports(input?.limit || 50);

      return reports.map((r) => ({
        id: r.id,
        timestamp: r.timestamp,
        title: r.title,
        selectedOption: r.selectedOption,
        pathLength: r.decisionPath.length,
        success: r.outcome?.success,
      }));
    }),

  /**
   * Get audit trails for decision
   */
  getAuditTrailsForDecision: protectedProcedure
    .input(z.object({ decisionId: z.string() }))
    .query(({ input }) => {
      const trails = decisionPathLogging.getAuditTrailsForDecision(input.decisionId);

      return trails.map((t) => ({
        id: t.id,
        timestamp: t.timestamp,
        action: t.action,
        verified: t.verified,
        verificationNotes: t.verificationNotes,
        impact: {
          functionalStability: t.impact.functionalStability.toFixed(1),
          integrationCohesion: t.impact.integrationCohesion.toFixed(1),
          perceptionAcceptance: t.impact.perceptionAcceptance.toFixed(1),
        },
      }));
    }),

  /**
   * Get audit trails
   */
  getAuditTrails: protectedProcedure
    .input(z.object({ limit: z.number().optional() }).optional())
    .query(({ input }) => {
      const trails = decisionPathLogging.getAuditTrails(input?.limit || 50);

      return trails.map((t) => ({
        id: t.id,
        timestamp: t.timestamp,
        action: t.action,
        verified: t.verified,
      }));
    }),

  /**
   * Get logging statistics
   */
  getLoggingStatistics: protectedProcedure.query(() => {
    const stats = decisionPathLogging.getLoggingStatistics();

    return {
      totalDecisionPaths: stats.totalDecisionPaths,
      totalReports: stats.totalReports,
      totalAuditTrails: stats.totalAuditTrails,
      verifiedTrails: stats.verifiedTrails,
      unverifiedTrails: stats.unverifiedTrails,
      averagePathLength: stats.averagePathLength.toFixed(1),
      averageConfidence: (stats.averageConfidence * 100).toFixed(0),
    };
  }),

  /**
   * Generate transparency summary
   */
  generateTransparencySummary: protectedProcedure
    .input(z.object({ reportId: z.string() }))
    .query(({ input }) => {
      const summary = decisionPathLogging.generateTransparencySummary(input.reportId);
      return { summary };
    }),
});

