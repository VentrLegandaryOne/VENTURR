/**
 * QUALITY ASSURANCE ROUTER
 * 
 * tRPC procedures for output quality assurance
 */

import { protectedProcedure, router } from '../_core/trpc';
import { z } from 'zod';
import { outputQualityAssurance, OutputType } from '../outputQualityAssurance';

export const qaRouter = router({
  /**
   * Check quality of output
   */
  checkQuality: protectedProcedure
    .input(
      z.object({
        outputType: z.enum([
          'quote',
          'invoice',
          'compliance_doc',
          'schedule',
          'report',
          'communication',
          'contract',
          'estimate',
        ]),
        content: z.string(),
        metadata: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await outputQualityAssurance.checkQuality(
        input.outputType as OutputType,
        input.content,
        input.metadata
      );

      return {
        checkId: result.checkId,
        outputType: result.outputType,
        timestamp: result.timestamp,
        passed: result.passed,
        overallScore: result.overallScore.toFixed(2),
        checks: result.checks.map((c) => ({
          name: c.name,
          category: c.category,
          passed: c.passed,
          score: c.score.toFixed(1),
          feedback: c.feedback,
        })),
        issues: result.issues.map((i) => ({
          severity: i.severity,
          category: i.category,
          description: i.description,
          suggestion: i.suggestion,
        })),
        recommendations: result.recommendations,
      };
    }),

  /**
   * Get check history
   */
  getCheckHistory: protectedProcedure.query(() => {
    const history = outputQualityAssurance.getCheckHistory();

    return history.map((r) => ({
      checkId: r.checkId,
      outputType: r.outputType,
      timestamp: r.timestamp,
      passed: r.passed,
      overallScore: r.overallScore.toFixed(2),
      issuesCount: r.issues.length,
      criticalIssues: r.issues.filter((i) => i.severity === 'critical').length,
    }));
  }),

  /**
   * Get QA statistics
   */
  getStatistics: protectedProcedure.query(() => {
    const stats = outputQualityAssurance.getStatistics();

    return {
      totalChecks: stats.totalChecks,
      passed: stats.passed,
      failed: stats.failed,
      passRate: stats.passRate.toFixed(1),
      averageScore: stats.averageScore.toFixed(2),
    };
  }),
});

