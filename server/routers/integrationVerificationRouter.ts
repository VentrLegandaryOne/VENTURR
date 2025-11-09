/**
 * INTEGRATION VERIFICATION ROUTER
 * 
 * tRPC procedures for cross-module integration verification
 */

import { protectedProcedure, router } from '../_core/trpc';
import { z } from 'zod';
import { crossModuleIntegrationVerification } from '../integrationVerification';

export const integrationVerificationRouter = router({
  /**
   * Test integration between modules
   */
  testIntegration: protectedProcedure
    .input(
      z.object({
        sourceModule: z.string(),
        targetModule: z.string(),
        testType: z.enum(['data_flow', 'sync', 'communication', 'performance', 'reliability']),
      })
    )
    .mutation(async ({ input }) => {
      const result = await crossModuleIntegrationVerification.testIntegration(
        input.sourceModule,
        input.targetModule,
        input.testType
      );

      return {
        id: result.id,
        sourceModule: result.sourceModule,
        targetModule: result.targetModule,
        testType: result.testType,
        status: result.status,
        duration: result.duration,
        dataIntegrity: result.dataIntegrity.toFixed(2),
        latency: result.latency,
        errorRate: (result.errorRate * 100).toFixed(2),
        issuesCount: result.issues.length,
      };
    }),

  /**
   * Verify all integrations
   */
  verifyAllIntegrations: protectedProcedure.mutation(async () => {
    const result = await crossModuleIntegrationVerification.verifyAllIntegrations();

    return {
      modules: result.modules,
      integrations: result.integrations.map((i) => ({
        source: i.source,
        target: i.target,
        status: i.status,
        successRate: (i.successRate * 100).toFixed(1),
        averageLatency: Math.round(i.averageLatency),
        dataIntegrity: (i.dataIntegrity * 100).toFixed(1),
        testCount: i.testCount,
      })),
      healthScore: result.healthScore.toFixed(1),
      criticalIssuesCount: result.criticalIssues.length,
    };
  }),

  /**
   * Get integration status
   */
  getIntegrationStatus: protectedProcedure
    .input(
      z
        .object({
          sourceModule: z.string().optional(),
          targetModule: z.string().optional(),
        })
        .optional()
    )
    .query(({ input }) => {
      const status = crossModuleIntegrationVerification.getIntegrationStatus(
        input?.sourceModule,
        input?.targetModule
      );

      if (Array.isArray(status)) {
        return status.map((s) => ({
          source: s.source,
          target: s.target,
          status: s.status,
          lastTest: s.lastTest,
          successRate: (s.successRate * 100).toFixed(1),
          averageLatency: Math.round(s.averageLatency),
          dataIntegrity: (s.dataIntegrity * 100).toFixed(1),
          testCount: s.testCount,
        }));
      }

      if (!status) {
        return null;
      }

      return {
        source: status.source,
        target: status.target,
        status: status.status,
        lastTest: status.lastTest,
        successRate: (status.successRate * 100).toFixed(1),
        averageLatency: Math.round(status.averageLatency),
        dataIntegrity: (status.dataIntegrity * 100).toFixed(1),
        testCount: status.testCount,
      };
    }),

  /**
   * Get integration test history
   */
  getIntegrationTestHistory: protectedProcedure.query(() => {
    const history = crossModuleIntegrationVerification.getIntegrationTestHistory(50);

    return history.map((h) => ({
      id: h.id,
      timestamp: h.timestamp,
      sourceModule: h.sourceModule,
      targetModule: h.targetModule,
      testType: h.testType,
      status: h.status,
      duration: h.duration,
      dataIntegrity: h.dataIntegrity.toFixed(2),
      latency: h.latency,
      issuesCount: h.issues.length,
    }));
  }),

  /**
   * Get integration issues
   */
  getIntegrationIssues: protectedProcedure
    .input(z.object({ severity: z.enum(['critical', 'high', 'medium', 'low']).optional() }).optional())
    .query(({ input }) => {
      const issues = crossModuleIntegrationVerification.getIntegrationIssues(input?.severity);

      return issues.map((i) => ({
        id: i.id,
        timestamp: i.timestamp,
        type: i.type,
        severity: i.severity,
        description: i.description,
        affectedData: i.affectedData,
      }));
    }),

  /**
   * Get integration statistics
   */
  getIntegrationStatistics: protectedProcedure.query(() => {
    const stats = crossModuleIntegrationVerification.getIntegrationStatistics();

    return {
      totalIntegrations: stats.totalIntegrations,
      healthyIntegrations: stats.healthyIntegrations,
      degradedIntegrations: stats.degradedIntegrations,
      failedIntegrations: stats.failedIntegrations,
      averageSuccessRate: (stats.averageSuccessRate * 100).toFixed(1),
      averageLatency: Math.round(stats.averageLatency),
      averageDataIntegrity: (stats.averageDataIntegrity * 100).toFixed(1),
      totalTests: stats.totalTests,
      totalIssues: stats.totalIssues,
      criticalIssues: stats.criticalIssues,
    };
  }),
});

