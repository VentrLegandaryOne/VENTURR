/**
 * SAFE RE-INTEGRATION ROUTER
 * 
 * tRPC procedures for re-integration testing and verification
 */

import { protectedProcedure, router } from '../_core/trpc';
import { z } from 'zod';
import { safeReIntegrationVerification } from '../safeReIntegrationVerification';

export const safeReIntegrationRouter = router({
  /**
   * Execute re-integration test
   */
  executeReIntegrationTest: protectedProcedure
    .input(
      z.object({
        fixId: z.string(),
        originalContent: z.string(),
        fixedContent: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const test = await safeReIntegrationVerification.executeReIntegrationTest(
        input.fixId,
        input.originalContent,
        input.fixedContent
      );

      return {
        id: test.id,
        overallStatus: test.overallStatus,
        regressionDetected: test.regressionDetected,
        canAccept: test.canAccept,
        acceptanceReason: test.acceptanceReason,
        modulesPassed: test.moduleTests.filter((m) => m.status === 'passed').length,
        modulesFailed: test.moduleTests.filter((m) => m.status === 'failed').length,
        performanceImpact: test.performanceImpact,
        dataIntegrityOk: test.dataIntegrityOk,
        crossModuleSyncOk: test.crossModuleSyncOk,
      };
    }),

  /**
   * Get re-integration test history
   */
  getReIntegrationTestHistory: protectedProcedure
    .input(z.object({ fixId: z.string().optional(), limit: z.number().optional() }).optional())
    .query(({ input }) => {
      const tests = safeReIntegrationVerification.getReIntegrationTestHistory(input?.fixId, input?.limit || 50);

      return tests.map((t) => ({
        id: t.id,
        timestamp: t.timestamp,
        overallStatus: t.overallStatus,
        regressionDetected: t.regressionDetected,
        canAccept: t.canAccept,
        modulesPassed: t.moduleTests.filter((m) => m.status === 'passed').length,
        modulesFailed: t.moduleTests.filter((m) => m.status === 'failed').length,
        performanceImpact: t.performanceImpact,
      }));
    }),

  /**
   * Get re-integration statistics
   */
  getReIntegrationStatistics: protectedProcedure.query(() => {
    const stats = safeReIntegrationVerification.getReIntegrationStatistics();

    return {
      totalTests: stats.totalTests,
      healthyTests: stats.healthyTests,
      degradedTests: stats.degradedTests,
      brokenTests: stats.brokenTests,
      acceptedFixes: stats.acceptedFixes,
      rejectedFixes: stats.rejectedFixes,
      regressionRate: stats.regressionRate.toFixed(1),
      averagePerformanceImpact: stats.averagePerformanceImpact,
    };
  }),
});

