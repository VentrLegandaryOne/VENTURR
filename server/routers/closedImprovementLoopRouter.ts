/**
 * CLOSED IMPROVEMENT LOOP ROUTER
 * 
 * tRPC procedures for improvement cycle management and monitoring
 */

import { protectedProcedure, router } from '../_core/trpc';
import { z } from 'zod';
import { closedImprovementLoop } from '../closedImprovementLoop';

export const closedImprovementLoopRouter = router({
  /**
   * Execute improvement cycle for output
   */
  executeCycle: protectedProcedure
    .input(
      z.object({
        outputId: z.string(),
        content: z.string(),
        outputType: z.enum(['quote', 'invoice', 'compliance_doc', 'report', 'communication']),
      })
    )
    .mutation(async ({ input }) => {
      const cycle = await closedImprovementLoop.executeCycle(input.outputId, input.content, input.outputType);

      return {
        id: cycle.id,
        cycleNumber: cycle.cycleNumber,
        status: cycle.status,
        duration: cycle.duration,
        successRate: cycle.successRate.toFixed(1),
        fixesApplied: cycle.fixes.length,
        simulationScore: cycle.simulation?.simulationResult.averageScore.toFixed(1),
        evaluationScore: cycle.evaluation?.overallAcceptance.toFixed(1),
        meetsThreshold: cycle.evaluation?.meetsThreshold,
      };
    }),

  /**
   * Get cycle history
   */
  getCycleHistory: protectedProcedure
    .input(z.object({ outputId: z.string().optional(), limit: z.number().optional() }).optional())
    .query(({ input }) => {
      const cycles = closedImprovementLoop.getCycleHistory(input?.outputId, input?.limit || 50);

      return cycles.map((c) => ({
        id: c.id,
        timestamp: c.timestamp,
        cycleNumber: c.cycleNumber,
        status: c.status,
        duration: c.duration,
        successRate: c.successRate.toFixed(1),
        fixesApplied: c.fixes.length,
        simulationScore: c.simulation?.simulationResult.averageScore.toFixed(1),
        evaluationScore: c.evaluation?.overallAcceptance.toFixed(1),
      }));
    }),

  /**
   * Get improvement statistics
   */
  getImprovementStatistics: protectedProcedure.query(() => {
    const stats = closedImprovementLoop.getImprovementStatistics();

    return {
      totalCycles: stats.totalCycles,
      completedCycles: stats.completedCycles,
      failedCycles: stats.failedCycles,
      averageCycleDuration: stats.averageCycleDuration,
      averageSuccessRate: stats.averageSuccessRate.toFixed(1),
      totalFixes: stats.totalFixes,
      totalGapsDetected: stats.totalGapsDetected,
      regressionRate: stats.regressionRate.toFixed(1),
    };
  }),
});

