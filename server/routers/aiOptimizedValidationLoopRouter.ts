/**
 * AI-OPTIMIZED VALIDATION LOOP ROUTER
 * 
 * tRPC procedures for AI-powered validation decisions
 */

import { protectedProcedure, router } from '../_core/trpc';
import { z } from 'zod';
import { aiOptimizedValidationLoop } from '../aiOptimizedValidationLoop';

export const aiOptimizedValidationLoopRouter = router({
  /**
   * Make validation decision using AI
   */
  makeValidationDecision: protectedProcedure
    .input(
      z.object({
        context: z.string(),
        options: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            description: z.string(),
            estimatedMetrics: z.object({
              functionalStabilityScore: z.number().optional(),
              integrationCohesionScore: z.number().optional(),
              perceptionAcceptanceScore: z.number().optional(),
              performanceLatencyScore: z.number().optional(),
              uxClarityScore: z.number().optional(),
            }).optional(),
            riskLevel: z.enum(['low', 'medium', 'high']).optional(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      const decision = await aiOptimizedValidationLoop.makeValidationDecision(input.context, input.options as any);

      return {
        id: decision.id,
        selectedOption: decision.selectedOption,
        reasoning: decision.reasoning,
        confidence: (decision.confidence * 100).toFixed(0),
        reward: decision.reward.toFixed(2),
      };
    }),

  /**
   * Record validation outcome
   */
  recordValidationOutcome: protectedProcedure
    .input(
      z.object({
        decisionId: z.string(),
        success: z.boolean(),
        metrics: z.record(z.number()),
        reward: z.number(),
      })
    )
    .mutation(({ input }) => {
      aiOptimizedValidationLoop.recordValidationOutcome(input.decisionId, input.success, input.metrics, input.reward);

      return {
        success: true,
        message: 'Validation outcome recorded',
      };
    }),

  /**
   * Start validation loop
   */
  startLoop: protectedProcedure.mutation(() => {
    aiOptimizedValidationLoop.start();

    return {
      success: true,
      message: 'AI-Optimized Validation Loop started',
    };
  }),

  /**
   * Stop validation loop
   */
  stopLoop: protectedProcedure.mutation(() => {
    aiOptimizedValidationLoop.stop();

    return {
      success: true,
      message: 'AI-Optimized Validation Loop stopped',
    };
  }),

  /**
   * Get loop status
   */
  getLoopStatus: protectedProcedure.query(() => {
    const status = aiOptimizedValidationLoop.getStatus();

    return {
      isRunning: status.isRunning,
      cycleCount: status.cycleCount,
      lastCycleTime: status.lastCycleTime,
      decisionsCount: status.decisionsCount,
      successRate: (status.successRate * 100).toFixed(1),
      averageReward: status.averageReward.toFixed(2),
    };
  }),

  /**
   * Get optimization metrics
   */
  getOptimizationMetrics: protectedProcedure.query(() => {
    const metrics = aiOptimizedValidationLoop.getOptimizationMetrics();

    return {
      decisionsCount: metrics.decisionsCount,
      successRate: (metrics.successRate * 100).toFixed(1),
      averageReward: metrics.averageReward.toFixed(2),
      averageConfidence: (metrics.averageConfidence * 100).toFixed(0),
      patternsLearned: metrics.patternsLearned,
      rulesCreated: metrics.rulesCreated,
      faultsEscalated: metrics.faultsEscalated,
    };
  }),

  /**
   * Get decision history
   */
  getDecisionHistory: protectedProcedure
    .input(z.object({ limit: z.number().optional() }).optional())
    .query(({ input }) => {
      const decisions = aiOptimizedValidationLoop.getDecisionHistory(input?.limit || 50);

      return decisions.map((d) => ({
        id: d.id,
        timestamp: d.timestamp,
        context: d.context,
        selectedOption: d.selectedOption,
        success: d.success,
        reward: d.reward.toFixed(2),
      }));
    }),
});

