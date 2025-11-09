/**
 * REFINEMENT ROUTER
 * 
 * tRPC procedures for output refinement and auto-improvement
 */

import { protectedProcedure, router } from '../_core/trpc';
import { z } from 'zod';
import { outputRefinementEngine } from '../outputRefinementEngine';

export const refinementRouter = router({
  /**
   * Refine output automatically
   */
  refineOutput: protectedProcedure
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
      })
    )
    .mutation(async ({ input }) => {
      const result = await outputRefinementEngine.refineOutput(
        input.outputType as any,
        input.content
      );

      return {
        id: result.id,
        timestamp: result.timestamp,
        outputType: result.outputType,
        success: result.success,
        beforeScore: result.beforeScore.toFixed(2),
        afterScore: result.afterScore.toFixed(2),
        scoreImprovement: (result.afterScore - result.beforeScore).toFixed(2),
        iterations: result.iterations,
        appliedSuggestions: result.appliedSuggestions.length,
        refinedContent: result.refinedContent,
        suggestions: result.suggestions.map((s) => ({
          id: s.id,
          category: s.category,
          issue: s.issue,
          suggestion: s.suggestion,
          priority: s.priority,
          estimatedImpact: s.estimatedImpact.toFixed(1),
        })),
      };
    }),

  /**
   * Get refinement history
   */
  getRefinementHistory: protectedProcedure.query(() => {
    const history = outputRefinementEngine.getHistory();

    return history.map((r) => ({
      id: r.id,
      timestamp: r.timestamp,
      outputType: r.outputType,
      success: r.success,
      beforeScore: r.beforeScore.toFixed(2),
      afterScore: r.afterScore.toFixed(2),
      scoreImprovement: (r.afterScore - r.beforeScore).toFixed(2),
      iterations: r.iterations,
      appliedSuggestions: r.appliedSuggestions.length,
    }));
  }),

  /**
   * Get refinement statistics
   */
  getRefinementStatistics: protectedProcedure.query(() => {
    const stats = outputRefinementEngine.getStatistics();

    return {
      totalRefinements: stats.totalRefinements,
      successful: stats.successful,
      failed: stats.failed,
      successRate: stats.successRate.toFixed(1),
      averageIterations: stats.averageIterations.toFixed(1),
      averageScoreImprovement: stats.averageScoreImprovement.toFixed(2),
    };
  }),
});

