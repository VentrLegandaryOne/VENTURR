/**
 * INTEGRATED HEALING ROUTER
 * 
 * tRPC procedures for integrated healing orchestration
 */

import { protectedProcedure, router } from '../_core/trpc';
import { z } from 'zod';
import { integratedHealingOrchestrator } from '../integratedHealingOrchestrator';

export const integratedHealingRouter = router({
  /**
   * Execute integrated healing workflow
   */
  executeHealingWorkflow: protectedProcedure
    .input(z.object({ cycleId: z.string() }))
    .mutation(async ({ input }) => {
      const result = await integratedHealingOrchestrator.executeHealingWorkflow(input.cycleId);

      return {
        id: result.id,
        cycleId: result.cycleId,
        status: result.status,
        faultsDetected: result.faultsDetected,
        faultsHealed: result.faultsHealed,
        componentsPatched: result.componentsPatched,
        totalImprovement: result.totalImprovement.toFixed(2),
        duration: result.duration,
        actionsCount: result.healingActions.length,
        recommendationsCount: result.recommendations.length,
        nextAction: result.nextAction,
      };
    }),

  /**
   * Get healing workflow history
   */
  getHealingWorkflowHistory: protectedProcedure
    .input(z.object({ cycleId: z.string().optional(), limit: z.number().optional() }).optional())
    .query(({ input }) => {
      const workflows = integratedHealingOrchestrator.getHealingWorkflowHistory(
        input?.cycleId,
        input?.limit || 50
      );

      return workflows.map((w) => ({
        id: w.id,
        timestamp: w.timestamp,
        cycleId: w.cycleId,
        status: w.status,
        faultsDetected: w.faultsDetected,
        faultsHealed: w.faultsHealed,
        componentsPatched: w.componentsPatched,
        totalImprovement: w.totalImprovement.toFixed(2),
        duration: w.duration,
      }));
    }),

  /**
   * Get healing strategies
   */
  getHealingStrategies: protectedProcedure.query(() => {
    const strategies = integratedHealingOrchestrator.getHealingStrategies();

    return strategies.map((s) => ({
      component: s.component,
      actionType: s.actionType,
      priority: s.priority,
      estimatedTime: s.estimatedTime,
      riskLevel: s.riskLevel,
      successRate: (s.successRate * 100).toFixed(1),
      executionCount: s.executionCount,
      successCount: s.successCount,
      lastExecuted: s.lastExecuted,
    }));
  }),

  /**
   * Get healing statistics
   */
  getHealingStatistics: protectedProcedure.query(() => {
    const stats = integratedHealingOrchestrator.getHealingStatistics();

    return {
      totalWorkflows: stats.totalWorkflows,
      successfulWorkflows: stats.successfulWorkflows,
      failedWorkflows: stats.failedWorkflows,
      successRate: stats.successRate.toFixed(1),
      totalFaultsDetected: stats.totalFaultsDetected,
      totalFaultsHealed: stats.totalFaultsHealed,
      totalComponentsPatched: stats.totalComponentsPatched,
      totalImprovement: stats.totalImprovement.toFixed(2),
      averageWorkflowDuration: Math.round(stats.averageWorkflowDuration),
      strategiesUsed: stats.strategiesUsed,
    };
  }),
});

