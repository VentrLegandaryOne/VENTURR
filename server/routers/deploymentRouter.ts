/**
 * DEPLOYMENT ROUTER
 * 
 * tRPC procedures for deployment validation and alerting
 */

import { protectedProcedure, router } from '../_core/trpc';
import { z } from 'zod';
import { deploymentValidator } from '../deploymentValidator';
import { alertManager } from '../alertingSystem';

export const deploymentRouter = router({
  /**
   * Validate deployment
   */
  validateDeployment: protectedProcedure
    .input(z.object({ version: z.string() }))
    .mutation(async ({ input }) => {
      const result = await deploymentValidator.validateDeployment(input.version);

      return {
        deploymentId: result.deploymentId,
        version: result.version,
        approved: result.approved,
        reason: result.reason,
        workflowResults: {
          total: result.workflowResults.total,
          passed: result.workflowResults.passed,
          failed: result.workflowResults.failed,
          successRate: result.workflowResults.successRate.toFixed(1),
        },
        validationResults: {
          total: result.validationResults.total,
          passed: result.validationResults.passed,
          failed: result.validationResults.failed,
          criticalFailures: result.validationResults.criticalFailures,
          passRate: result.validationResults.passRate.toFixed(1),
        },
        perceptionResults: {
          average: result.perceptionResults.average.toFixed(2),
          minimum: result.perceptionResults.minimum.toFixed(2),
          maximum: result.perceptionResults.maximum.toFixed(2),
          archetypesAboveThreshold: result.perceptionResults.archetypesAboveThreshold,
          totalArchetypes: result.perceptionResults.totalArchetypes,
        },
        realWorldStandardMet: result.realWorldStandardMet,
        regressionDetected: result.regressionDetected,
        recommendations: result.recommendations,
        duration: result.duration,
      };
    }),

  /**
   * Get deployment history
   */
  getDeploymentHistory: protectedProcedure.query(() => {
    const history = deploymentValidator.getHistory();

    return history.map((h) => ({
      deploymentId: h.deploymentId,
      timestamp: h.timestamp,
      version: h.version,
      approved: h.approved,
      duration: h.result.duration,
      workflowSuccessRate: h.result.workflowResults.successRate.toFixed(1),
      validationPassRate: h.result.validationResults.passRate.toFixed(1),
      perceptionAverage: h.result.perceptionResults.average.toFixed(2),
    }));
  }),

  /**
   * Get deployment result
   */
  getDeploymentResult: protectedProcedure
    .input(z.object({ deploymentId: z.string() }))
    .query(({ input }) => {
      const result = deploymentValidator.getDeploymentResult(input.deploymentId);

      if (!result) {
        return null;
      }

      return {
        deploymentId: result.deploymentId,
        version: result.version,
        approved: result.approved,
        reason: result.reason,
        workflowResults: {
          total: result.workflowResults.total,
          passed: result.workflowResults.passed,
          failed: result.workflowResults.failed,
          successRate: result.workflowResults.successRate.toFixed(1),
        },
        validationResults: {
          total: result.validationResults.total,
          passed: result.validationResults.passed,
          failed: result.validationResults.failed,
          criticalFailures: result.validationResults.criticalFailures,
          passRate: result.validationResults.passRate.toFixed(1),
        },
        perceptionResults: {
          average: result.perceptionResults.average.toFixed(2),
          minimum: result.perceptionResults.minimum.toFixed(2),
          maximum: result.perceptionResults.maximum.toFixed(2),
          archetypesAboveThreshold: result.perceptionResults.archetypesAboveThreshold,
          totalArchetypes: result.perceptionResults.totalArchetypes,
        },
        realWorldStandardMet: result.realWorldStandardMet,
        regressionDetected: result.regressionDetected,
        recommendations: result.recommendations,
        duration: result.duration,
      };
    }),

  /**
   * Get deployment statistics
   */
  getDeploymentStatistics: protectedProcedure.query(() => {
    const stats = deploymentValidator.getStatistics();

    return {
      totalDeployments: stats.totalDeployments,
      approved: stats.approved,
      rejected: stats.rejected,
      approvalRate: stats.approvalRate.toFixed(1),
    };
  }),

  /**
   * Get recent alerts
   */
  getRecentAlerts: protectedProcedure
    .input(z.object({ limit: z.number().default(10) }))
    .query(({ input }) => {
      const alerts = alertManager.getRecentAlerts(input.limit);

      return alerts.map((a) => ({
        id: a.id,
        timestamp: a.timestamp,
        severity: a.severity,
        title: a.title,
        description: a.description,
        sent: a.sent,
        channels: a.channels,
      }));
    }),

  /**
   * Get alert statistics
   */
  getAlertStatistics: protectedProcedure.query(() => {
    const stats = alertManager.getStatistics();

    return {
      total: stats.total,
      bySeverity: {
        critical: stats.bySeverity.critical,
        high: stats.bySeverity.high,
        medium: stats.bySeverity.medium,
        low: stats.bySeverity.low,
        info: stats.bySeverity.info,
      },
      sent: stats.sent,
      failed: stats.failed,
    };
  }),

  /**
   * Get alert history for specific type
   */
  getAlertHistory: protectedProcedure
    .input(z.object({ title: z.string() }))
    .query(({ input }) => {
      const history = alertManager.getAlertHistory(input.title);

      return history.map((a) => ({
        id: a.id,
        timestamp: a.timestamp,
        severity: a.severity,
        sent: a.sent,
        sentAt: a.sentAt,
      }));
    }),

  /**
   * Clear old alerts
   */
  clearOldAlerts: protectedProcedure
    .input(z.object({ ageHours: z.number().default(24) }))
    .mutation(({ input }) => {
      const ageMs = input.ageHours * 60 * 60 * 1000;
      const cleared = alertManager.clearOldAlerts(ageMs);

      return {
        cleared,
        message: `Cleared ${cleared} alerts older than ${input.ageHours} hours`,
      };
    }),
});

