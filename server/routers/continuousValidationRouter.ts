/**
 * CONTINUOUS VALIDATION LOOP ROUTER
 * 
 * tRPC procedures for managing the continuous validation loop
 */

import { protectedProcedure, router } from '../_core/trpc';
import { continuousValidationLoop } from '../continuousValidationLoop';

export const continuousValidationRouter = router({
  /**
   * Start the continuous validation loop
   */
  start: protectedProcedure.mutation(async () => {
    await continuousValidationLoop.start();
    return {
      success: true,
      message: 'Continuous validation loop started',
    };
  }),

  /**
   * Stop the continuous validation loop
   */
  stop: protectedProcedure.mutation(async () => {
    await continuousValidationLoop.stop();
    return {
      success: true,
      message: 'Continuous validation loop stopped',
    };
  }),

  /**
   * Pause the loop
   */
  pause: protectedProcedure.mutation(() => {
    continuousValidationLoop.pause();
    return {
      success: true,
      message: 'Continuous validation loop paused',
    };
  }),

  /**
   * Resume the loop
   */
  resume: protectedProcedure.mutation(() => {
    continuousValidationLoop.resume();
    return {
      success: true,
      message: 'Continuous validation loop resumed',
    };
  }),

  /**
   * Get current status
   */
  getStatus: protectedProcedure.query(() => {
    const status = continuousValidationLoop.getStatus();
    return {
      running: status.running,
      paused: status.paused,
      cycleCount: status.cycleCount,
      allMetricsMet: status.allMetricsMet,
      successMetrics: {
        workflowSuccessRate: (status.successMetrics.workflowSuccessRate * 100).toFixed(1),
        validationPassRate: (status.successMetrics.validationPassRate * 100).toFixed(1),
        perceptionAcceptance: status.successMetrics.perceptionAcceptance.toFixed(1),
        outputQAPassRate: (status.successMetrics.outputQAPassRate * 100).toFixed(1),
        refinementSuccessRate: (status.successMetrics.refinementSuccessRate * 100).toFixed(1),
        systemUptime: (status.successMetrics.systemUptime * 100).toFixed(2),
        recoveryTime: Math.round(status.successMetrics.recoveryTime),
        errorRate: (status.successMetrics.errorRate * 100).toFixed(2),
        dataIntegrity: (status.successMetrics.dataIntegrity * 100).toFixed(1),
        responseLatency: Math.round(status.successMetrics.responseLatency),
      },
      currentCycle: status.currentCycle ? {
        cycleId: status.currentCycle.cycleId,
        timestamp: status.currentCycle.timestamp,
        phase: status.currentCycle.phase,
        status: status.currentCycle.status,
        duration: status.currentCycle.duration,
        faultsDetected: status.currentCycle.faultsDetected,
        faultsHealed: status.currentCycle.faultsHealed,
        componentsPatched: status.currentCycle.componentsPatched,
        integrationIssues: status.currentCycle.integrationIssues,
      } : null,
    };
  }),

  /**
   * Get current cycle details
   */
  getCurrentCycle: protectedProcedure.query(() => {
    const cycle = continuousValidationLoop.getCurrentCycle();
    if (!cycle) {
      return null;
    }

    return {
      cycleId: cycle.cycleId,
      timestamp: cycle.timestamp,
      phase: cycle.phase,
      status: cycle.status,
      duration: cycle.duration,
      faultsDetected: cycle.faultsDetected,
      faultsHealed: cycle.faultsHealed,
      componentsPatched: cycle.componentsPatched,
      integrationIssues: cycle.integrationIssues,
      nextAction: cycle.nextAction,
      improvements: cycle.improvements.map((i) => ({
        id: i.id,
        type: i.type,
        component: i.component,
        issue: i.issue,
        action: i.action,
        result: i.result,
        improvement: i.improvement.toFixed(2),
      })),
    };
  }),

  /**
   * Get cycle history
   */
  getCycleHistory: protectedProcedure.query(() => {
    const cycles = continuousValidationLoop.getCycleHistory(20);
    return cycles.map((c) => ({
      cycleId: c.cycleId,
      timestamp: c.timestamp,
      phase: c.phase,
      status: c.status,
      duration: c.duration,
      faultsDetected: c.faultsDetected,
      faultsHealed: c.faultsHealed,
      componentsPatched: c.componentsPatched,
      integrationIssues: c.integrationIssues,
    }));
  }),

  /**
   * Get improvement history
   */
  getImprovementHistory: protectedProcedure.query(() => {
    const improvements = continuousValidationLoop.getImprovementHistory(50);
    return improvements.map((i) => ({
      id: i.id,
      timestamp: i.timestamp,
      type: i.type,
      component: i.component,
      issue: i.issue,
      action: i.action,
      result: i.result,
      improvement: i.improvement.toFixed(2),
    }));
  }),

  /**
   * Get metrics snapshot
   */
  getMetrics: protectedProcedure.query(() => {
    const metrics = continuousValidationLoop.getCurrentMetrics();
    return {
      workflowSuccessRate: (metrics.workflowSuccessRate * 100).toFixed(1),
      validationPassRate: (metrics.validationPassRate * 100).toFixed(1),
      perceptionAcceptance: metrics.perceptionAcceptance.toFixed(1),
      outputQAPassRate: (metrics.outputQAPassRate * 100).toFixed(1),
      refinementSuccessRate: (metrics.refinementSuccessRate * 100).toFixed(1),
      systemUptime: (metrics.systemUptime * 100).toFixed(2),
      recoveryTime: Math.round(metrics.recoveryTime),
      errorRate: (metrics.errorRate * 100).toFixed(2),
      dataIntegrity: (metrics.dataIntegrity * 100).toFixed(1),
      responseLatency: Math.round(metrics.responseLatency),
    };
  }),
});

