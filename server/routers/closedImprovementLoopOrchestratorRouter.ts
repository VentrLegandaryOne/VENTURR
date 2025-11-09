/**
 * CLOSED IMPROVEMENT LOOP ORCHESTRATOR ROUTER
 * 
 * tRPC procedures for loop control and monitoring
 */

import { protectedProcedure, router } from '../_core/trpc';
import { z } from 'zod';
import { closedImprovementLoopOrchestrator } from '../closedImprovementLoopOrchestrator';

export const closedImprovementLoopOrchestratorRouter = router({
  /**
   * Start the improvement loop
   */
  startLoop: protectedProcedure.mutation(() => {
    closedImprovementLoopOrchestrator.startLoop();

    return {
      success: true,
      message: 'Closed improvement loop started',
    };
  }),

  /**
   * Stop the improvement loop
   */
  stopLoop: protectedProcedure.mutation(() => {
    closedImprovementLoopOrchestrator.stopLoop();

    return {
      success: true,
      message: 'Closed improvement loop stopped',
    };
  }),

  /**
   * Get loop status
   */
  getLoopStatus: protectedProcedure.query(() => {
    const status = closedImprovementLoopOrchestrator.getLoopStatus();

    return {
      isRunning: status.isRunning,
      totalCycles: status.totalCycles,
      lastCycleTime: status.lastCycleTime,
      successRate: status.successRate.toFixed(1),
      averageScore: status.averageScore.toFixed(1),
    };
  }),

  /**
   * Get cycle results
   */
  getCycleResults: protectedProcedure
    .input(z.object({ limit: z.number().optional() }).optional())
    .query(({ input }) => {
      const results = closedImprovementLoopOrchestrator.getCycleResults(input?.limit || 50);

      return results.map((r) => ({
        id: r.id,
        timestamp: r.timestamp,
        outputId: r.outputId,
        cycleNumber: r.cycleNumber,
        status: r.status,
        duration: r.duration,
        iterationCount: r.iterationCount,
        finalAcceptanceScore: r.finalAcceptanceScore.toFixed(1),
        meetsThreshold: r.meetsThreshold,
      }));
    }),

  /**
   * Get loop statistics
   */
  getLoopStatistics: protectedProcedure.query(() => {
    const stats = closedImprovementLoopOrchestrator.getLoopStatistics();

    return {
      totalCycles: stats.totalCycles,
      completedCycles: stats.completedCycles,
      failedCycles: stats.failedCycles,
      averageCycleDuration: stats.averageCycleDuration,
      averageIterations: stats.averageIterations.toFixed(1),
      successRate: stats.successRate.toFixed(1),
      averageFinalScore: stats.averageFinalScore.toFixed(1),
      improvementRate: stats.improvementRate.toFixed(1),
    };
  }),
});

