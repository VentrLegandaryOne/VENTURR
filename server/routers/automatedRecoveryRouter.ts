/**
 * AUTOMATED RECOVERY ROUTER
 * 
 * tRPC procedures for recovery procedure management and execution
 */

import { protectedProcedure, router } from '../_core/trpc';
import { z } from 'zod';
import { automatedRecoveryProcedures } from '../automatedRecoveryProcedures';

export const automatedRecoveryRouter = router({
  /**
   * Get recovery procedures
   */
  getProcedures: protectedProcedure.query(() => {
    const procedures = automatedRecoveryProcedures.getProcedures();

    return procedures.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      trigger: p.trigger,
      priority: p.priority,
      estimatedTime: p.estimatedTime,
      riskLevel: p.riskLevel,
      successRate: (p.successRate * 100).toFixed(1),
      enabled: p.enabled,
      stepsCount: p.steps.length,
    }));
  }),

  /**
   * Execute recovery procedure
   */
  executeProcedure: protectedProcedure
    .input(z.object({ procedureId: z.string() }))
    .mutation(async ({ input }) => {
      const execution = await automatedRecoveryProcedures.executeProcedure(input.procedureId);

      return {
        id: execution.id,
        procedureName: execution.procedureName,
        status: execution.status,
        duration: execution.duration,
        stepsCompleted: execution.stepsCompleted,
        stepsFailed: execution.stepsFailed,
        stepCount: execution.stepCount,
        rollbackExecuted: execution.rollbackExecuted,
      };
    }),

  /**
   * Get execution history
   */
  getExecutionHistory: protectedProcedure
    .input(z.object({ procedureId: z.string().optional(), limit: z.number().optional() }).optional())
    .query(({ input }) => {
      const executions = automatedRecoveryProcedures.getExecutionHistory(
        input?.procedureId,
        input?.limit || 50
      );

      return executions.map((e) => ({
        id: e.id,
        timestamp: e.timestamp,
        procedureName: e.procedureName,
        status: e.status,
        duration: e.duration,
        stepsCompleted: e.stepsCompleted,
        stepsFailed: e.stepsFailed,
        rollbackExecuted: e.rollbackExecuted,
      }));
    }),

  /**
   * Get recovery statistics
   */
  getRecoveryStatistics: protectedProcedure.query(() => {
    const stats = automatedRecoveryProcedures.getRecoveryStatistics();

    return {
      totalExecutions: stats.totalExecutions,
      successfulExecutions: stats.successfulExecutions,
      failedExecutions: stats.failedExecutions,
      rolledBackExecutions: stats.rolledBackExecutions,
      successRate: stats.successRate.toFixed(1),
      averageExecutionTime: Math.round(stats.averageExecutionTime),
      proceduresCount: stats.proceduresCount,
    };
  }),
});

