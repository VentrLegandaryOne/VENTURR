/**
 * INTELLIGENT OUTPUT FIXER ROUTER
 * 
 * tRPC procedures for output fixing and improvement
 */

import { protectedProcedure, router } from '../_core/trpc';
import { z } from 'zod';
import { intelligentOutputFixer } from '../intelligentOutputFixer';

export const intelligentOutputFixerRouter = router({
  /**
   * Fix output based on detected gaps
   */
  fixOutput: protectedProcedure
    .input(
      z.object({
        content: z.string(),
        gapType: z.string(),
        category: z.enum(['technical', 'social', 'legal', 'commercial']),
      })
    )
    .mutation(async ({ input }) => {
      const result = await intelligentOutputFixer.fixOutput(input.content, input.gapType, input.category);

      return {
        id: result.id,
        originalLength: result.originalContent.length,
        fixedLength: result.fixedContent.length,
        appliedRules: result.appliedRules.length,
        appliedLLMFixes: result.appliedLLMFixes.length,
        improvementScore: result.improvementScore.toFixed(1),
        changesSummary: result.changesSummary,
        fixedContent: result.fixedContent,
      };
    }),

  /**
   * Get fixing history
   */
  getFixingHistory: protectedProcedure
    .input(z.object({ limit: z.number().optional() }).optional())
    .query(({ input }) => {
      const results = intelligentOutputFixer.getFixingHistory(input?.limit || 50);

      return results.map((r) => ({
        id: r.id,
        timestamp: r.timestamp,
        originalLength: r.originalContent.length,
        fixedLength: r.fixedContent.length,
        appliedRules: r.appliedRules.length,
        appliedLLMFixes: r.appliedLLMFixes.length,
        improvementScore: r.improvementScore.toFixed(1),
      }));
    }),

  /**
   * Get fixing statistics
   */
  getFixingStatistics: protectedProcedure.query(() => {
    const stats = intelligentOutputFixer.getFixingStatistics();

    return {
      totalFixes: stats.totalFixes,
      averageRulesApplied: stats.averageRulesApplied.toFixed(1),
      averageLLMFixesApplied: stats.averageLLMFixesApplied.toFixed(1),
      averageImprovementScore: stats.averageImprovementScore.toFixed(1),
    };
  }),
});

