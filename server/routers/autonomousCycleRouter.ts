/**
 * AUTONOMOUS CYCLE ROUTER
 * 
 * tRPC procedures for executing and monitoring autonomous validation cycles
 */

import { protectedProcedure, router } from '../_core/trpc';
import { z } from 'zod';
import { continuousAutonomousCycle } from '../continuousAutonomousCycle';

export const autonomousCycleRouter = router({
  /**
   * Execute autonomous validation cycle
   */
  executeAutonomousCycle: protectedProcedure.mutation(async () => {
    const execution = await continuousAutonomousCycle.executeAutonomousCycle();

    return {
      id: execution.id,
      cycleNumber: execution.cycleNumber,
      status: execution.status,
      overallScore: execution.overallScore.toFixed(1),
      acceptanceRate: execution.acceptanceRate.toFixed(1),
      productionReady: execution.productionReady,
      iterationCount: execution.iterationCount,
      correctionsApplied: execution.correctionsApplied,
      phaseCount: execution.phases.length,
      startTime: execution.startTime,
      endTime: execution.endTime,
    };
  }),

  /**
   * Start continuous autonomous cycle
   */
  startContinuousCycle: protectedProcedure.mutation(() => {
    continuousAutonomousCycle.start();

    return {
      success: true,
      message: 'Continuous Autonomous Cycle started',
    };
  }),

  /**
   * Stop continuous autonomous cycle
   */
  stopContinuousCycle: protectedProcedure.mutation(() => {
    continuousAutonomousCycle.stop();

    return {
      success: true,
      message: 'Continuous Autonomous Cycle stopped',
    };
  }),

  /**
   * Get cycle status
   */
  getCycleStatus: protectedProcedure.query(() => {
    const status = continuousAutonomousCycle.getStatus();

    return {
      isRunning: status.isRunning,
      cycleCount: status.cycleCount,
      totalCycles: status.totalCycles,
      productionReady: status.productionReady,
    };
  }),

  /**
   * Get cycle statistics
   */
  getCycleStatistics: protectedProcedure.query(() => {
    const stats = continuousAutonomousCycle.getCycleStatistics();

    return {
      totalCycles: stats.totalCycles,
      completedCycles: stats.completedCycles,
      failedCycles: stats.failedCycles,
      averageScore: stats.averageScore.toFixed(2),
      averageAcceptance: stats.averageAcceptance.toFixed(1),
      averageIterations: stats.averageIterations.toFixed(1),
      totalCorrections: stats.totalCorrections,
      productionReadyCycles: stats.productionReadyCycles,
    };
  }),

  /**
   * Get cycle executions
   */
  getCycleExecutions: protectedProcedure
    .input(z.object({ limit: z.number().optional() }).optional())
    .query(({ input }) => {
      const executions = continuousAutonomousCycle.getCycleExecutions(input?.limit || 50);

      return executions.map((e) => ({
        id: e.id,
        cycleNumber: e.cycleNumber,
        status: e.status,
        overallScore: e.overallScore.toFixed(1),
        acceptanceRate: e.acceptanceRate.toFixed(1),
        productionReady: e.productionReady,
        iterationCount: e.iterationCount,
        correctionsApplied: e.correctionsApplied,
        startTime: e.startTime,
        endTime: e.endTime,
      }));
    }),

  /**
   * Get auto-correction actions
   */
  getAutoCorrectionActions: protectedProcedure
    .input(z.object({ limit: z.number().optional() }).optional())
    .query(({ input }) => {
      const actions = continuousAutonomousCycle.getAutoCorrectionActions(input?.limit || 50);

      return actions.map((a) => ({
        id: a.id,
        timestamp: a.timestamp,
        issueType: a.issueType,
        severity: a.severity,
        description: a.description,
        correctionApplied: a.correctionApplied,
        success: a.success,
      }));
    }),
});

