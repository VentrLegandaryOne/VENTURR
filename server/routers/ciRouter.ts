/**
 * CONTINUOUS INTEGRATION ROUTER
 * 
 * tRPC procedures for CI/validation/refinement environment
 */

import { protectedProcedure, router } from '../_core/trpc';
import { z } from 'zod';
import {
  workflowSimulationEngine,
  validationCheckpointEngine,
  perceptionAnalysisEngine,
} from '../ciValidationEngine';
import { watchdogMonitor } from '../watchdogMonitor';

export const ciRouter = router({
  /**
   * Execute workflow for a specific role
   */
  executeWorkflow: protectedProcedure
    .input(
      z.object({
        role: z.enum([
          'director',
          'admin',
          'estimator',
          'site_lead',
          'installer',
          'strata_manager',
          'insurer',
          'builder',
          'homeowner',
          'government_asset_manager',
        ]),
      })
    )
    .mutation(async ({ input }) => {
      const result = await workflowSimulationEngine.executeWorkflow(input.role);

      return {
        role: result.role,
        totalDuration: result.totalDuration,
        stepsCompleted: result.stepsCompleted,
        stepsFailed: result.stepsFailed,
        results: result.results.map((r) => ({
          stepId: r.stepId,
          stepName: r.stepName,
          status: r.status,
          duration: r.duration,
          error: r.error,
        })),
      };
    }),

  /**
   * Execute all workflows
   */
  executeAllWorkflows: protectedProcedure.mutation(async () => {
    const results = await workflowSimulationEngine.executeAllWorkflows();

    return results.map((r) => ({
      role: r.role,
      totalDuration: r.totalDuration,
      stepsCompleted: r.stepsCompleted,
      stepsFailed: r.stepsFailed,
      successRate: ((r.stepsCompleted / (r.stepsCompleted + r.stepsFailed)) * 100).toFixed(1),
    }));
  }),

  /**
   * Run validation checkpoints
   */
  validateAll: protectedProcedure.mutation(async () => {
    const result = await validationCheckpointEngine.validateAll();

    return {
      total: result.total,
      passed: result.passed,
      failed: result.failed,
      criticalFailures: result.criticalFailures,
      passRate: ((result.passed / result.total) * 100).toFixed(1),
      results: result.results.map((r) => ({
        checkpoint: r.checkpoint,
        passed: r.passed,
        duration: r.duration,
        error: r.error,
        severity: r.severity,
      })),
    };
  }),

  /**
   * Analyze perception for output
   */
  analyzePerception: protectedProcedure
    .input(
      z.object({
        outputType: z.enum(['quote', 'invoice', 'compliance', 'schedule', 'report', 'ui_screen']),
        content: z.string(),
      })
    )
    .query(async ({ input }) => {
      const result = await perceptionAnalysisEngine.analyzePerception(
        input.outputType,
        input.content
      );

      return {
        analyses: result.analyses.map((a) => ({
          archetype: a.archetype,
          clarity: a.clarity,
          professionalism: a.professionalism,
          complianceVisibility: a.complianceVisibility,
          acceptanceProbability: a.acceptanceProbability,
          overall: a.overall,
          feedback: a.feedback,
        })),
        summary: {
          average: result.average.toFixed(2),
          minimum: result.minimum.toFixed(2),
          maximum: result.maximum.toFixed(2),
        },
      };
    }),

  /**
   * Start watchdog monitoring
   */
  startWatchdog: protectedProcedure.mutation(() => {
    watchdogMonitor.startMonitoring();

    return {
      status: 'started',
      interval: '3 hours',
      message: 'Watchdog monitoring started',
    };
  }),

  /**
   * Stop watchdog monitoring
   */
  stopWatchdog: protectedProcedure.mutation(() => {
    watchdogMonitor.stopMonitoring();

    return {
      status: 'stopped',
      message: 'Watchdog monitoring stopped',
    };
  }),

  /**
   * Get watchdog status
   */
  getWatchdogStatus: protectedProcedure.query(() => {
    const status = watchdogMonitor.getStatus();

    return {
      active: status.active,
      recoveryInProgress: status.recoveryInProgress,
      recoveryAttempts: status.recoveryAttempts,
      lastCycle: status.lastCycle
        ? {
            cycleId: status.lastCycle.cycleId,
            timestamp: status.lastCycle.timestamp,
            status: status.lastCycle.status,
            issues: status.lastCycle.issues,
            recommendations: status.lastCycle.recommendations,
          }
        : null,
      lastStableState: status.lastStableState
        ? {
            id: status.lastStableState.id,
            timestamp: status.lastStableState.timestamp,
            status: status.lastStableState.status,
          }
        : null,
    };
  }),

  /**
   * Get watchdog cycles
   */
  getWatchdogCycles: protectedProcedure.query(() => {
    const cycles = watchdogMonitor.getCycles();

    return cycles.map((c) => ({
      cycleId: c.cycleId,
      timestamp: c.timestamp,
      duration: c.duration,
      status: c.status,
      diagnosticsCount: c.diagnostics.length,
      criticalIssues: c.diagnostics.filter((d) => d.severity === 'critical').length,
      healingActionsCount: c.healingActions.length,
      issues: c.issues,
      recommendations: c.recommendations,
    }));
  }),

  /**
   * Restore to last stable state
   */
  restoreToLastStableState: protectedProcedure.mutation(async () => {
    const success = await watchdogMonitor.restoreToLastStableState();

    return {
      success,
      message: success ? 'Restored to last stable state' : 'Restoration failed',
    };
  }),

  /**
   * Get recovery checkpoints
   */
  getRecoveryCheckpoints: protectedProcedure.query(() => {
    const checkpoints = watchdogMonitor.getRecoveryCheckpoints();

    return checkpoints.map((c) => ({
      id: c.id,
      timestamp: c.timestamp,
      status: c.status,
      metrics: {
        uptime: c.metrics.uptime?.toFixed(2),
        errorRate: c.metrics.errorRate?.toFixed(2),
        responseTime: c.metrics.responseTime?.toFixed(0),
        dataIntegrity: c.metrics.dataIntegrity?.toFixed(2),
      },
    }));
  }),
});

