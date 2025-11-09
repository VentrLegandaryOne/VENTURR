/**
 * TRACEABILITY & LOGGING ROUTER
 * 
 * tRPC procedures for audit logging and traceability
 */

import { protectedProcedure, router } from '../_core/trpc';
import { z } from 'zod';
import { traceabilityLogging } from '../traceabilityLogging';

export const traceabilityRouter = router({
  /**
   * Get audit logs
   */
  getAuditLogs: protectedProcedure
    .input(z.object({ cycleId: z.string().optional(), limit: z.number().optional() }).optional())
    .query(({ input }) => {
      const logs = traceabilityLogging.getAuditLogs(input?.cycleId, input?.limit || 100);

      return logs.map((log) => ({
        id: log.id,
        timestamp: log.timestamp,
        cycleId: log.cycleId,
        phase: log.phase,
        action: log.action,
        actor: log.actor,
        status: log.status,
        changesCount: log.changes.length,
        duration: log.duration,
      }));
    }),

  /**
   * Get state snapshots
   */
  getStateSnapshots: protectedProcedure
    .input(z.object({ cycleId: z.string().optional(), limit: z.number().optional() }).optional())
    .query(({ input }) => {
      const snapshots = traceabilityLogging.getStateSnapshots(input?.cycleId, input?.limit || 50);

      return snapshots.map((snap) => ({
        id: snap.id,
        timestamp: snap.timestamp,
        cycleId: snap.cycleId,
        phase: snap.phase,
        componentCount: snap.components.length,
        integrationCount: snap.integrations.length,
      }));
    }),

  /**
   * Get validation results
   */
  getValidationResults: protectedProcedure
    .input(z.object({ cycleId: z.string().optional(), limit: z.number().optional() }).optional())
    .query(({ input }) => {
      const results = traceabilityLogging.getValidationResults(input?.cycleId, input?.limit || 100);

      return results.map((result) => ({
        id: result.id,
        timestamp: result.timestamp,
        cycleId: result.cycleId,
        checkpointName: result.checkpointName,
        status: result.status,
        score: result.score.toFixed(1),
        recommendationsCount: result.recommendations.length,
      }));
    }),

  /**
   * Get change logs
   */
  getChangeLogs: protectedProcedure
    .input(z.object({ cycleId: z.string().optional(), limit: z.number().optional() }).optional())
    .query(({ input }) => {
      const logs = traceabilityLogging.getChangeLogs(input?.cycleId, input?.limit || 100);

      return logs.map((log) => ({
        id: log.id,
        timestamp: log.timestamp,
        cycleId: log.cycleId,
        changeType: log.changeType,
        component: log.component,
        description: log.description,
        improvement: log.improvement.toFixed(2),
        success: log.success,
        rollback: log.rollback,
      }));
    }),

  /**
   * Get cycle summary
   */
  getCycleSummary: protectedProcedure
    .input(z.object({ cycleId: z.string() }))
    .query(({ input }) => {
      const summary = traceabilityLogging.getCycleSummary(input.cycleId);

      return {
        cycleId: summary.cycleId,
        auditLogCount: summary.auditLogCount,
        snapshotCount: summary.snapshotCount,
        validationCount: summary.validationCount,
        changeCount: summary.changeCount,
        successfulChanges: summary.successfulChanges,
        failedChanges: summary.failedChanges,
        totalImprovement: summary.totalImprovement.toFixed(2),
        startTime: summary.startTime,
        endTime: summary.endTime,
      };
    }),

  /**
   * Export cycle data
   */
  exportCycleData: protectedProcedure
    .input(z.object({ cycleId: z.string() }))
    .query(({ input }) => {
      const data = traceabilityLogging.exportCycleData(input.cycleId);

      return {
        cycleId: input.cycleId,
        auditLogCount: data.auditLogs.length,
        snapshotCount: data.snapshots.length,
        validationCount: data.validations.length,
        changeCount: data.changes.length,
        summary: data.summary,
      };
    }),

  /**
   * Get system statistics
   */
  getSystemStatistics: protectedProcedure.query(() => {
    const stats = traceabilityLogging.getSystemStatistics();

    return {
      totalAuditLogs: stats.totalAuditLogs,
      totalSnapshots: stats.totalSnapshots,
      totalValidations: stats.totalValidations,
      totalChanges: stats.totalChanges,
      totalCycles: stats.totalCycles,
      averageChangesPerCycle: stats.averageChangesPerCycle.toFixed(1),
      averageSuccessRate: stats.averageSuccessRate.toFixed(1),
      totalImprovement: stats.totalImprovement.toFixed(2),
    };
  }),
});

