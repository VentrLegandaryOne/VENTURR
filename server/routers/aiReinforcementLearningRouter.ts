/**
 * AI REINFORCEMENT LEARNING ROUTER
 * 
 * tRPC procedures for decision making and learning
 */

import { protectedProcedure, router } from '../_core/trpc';
import { z } from 'zod';
import { aiReinforcementLearning } from '../aiReinforcementLearning';

export const aiReinforcementLearningRouter = router({
  /**
   * Make decision based on weighted objectives
   */
  makeDecision: protectedProcedure
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
            riskLevel: z.enum(['low', 'medium', 'high']),
          })
        ),
      })
    )
    .mutation(({ input }) => {
      const decision = aiReinforcementLearning.makeDecision(input.context, input.options as any);

      return {
        id: decision.id,
        selectedOption: decision.selectedOption.name,
        weightedScore: decision.metrics.weightedScore.toFixed(1),
        reward: decision.reward.toFixed(2),
        reasoning: decision.reasoning,
        decisionPath: decision.decisionPath,
      };
    }),

  /**
   * Record decision outcome
   */
  recordOutcome: protectedProcedure
    .input(
      z.object({
        decisionId: z.string(),
        actualMetrics: z.object({
          functionalStabilityScore: z.number(),
          integrationCohesionScore: z.number(),
          perceptionAcceptanceScore: z.number(),
          performanceLatencyScore: z.number(),
          uxClarityScore: z.number(),
          weightedScore: z.number(),
        }),
        success: z.boolean(),
      })
    )
    .mutation(({ input }) => {
      aiReinforcementLearning.recordOutcome(input.decisionId, input.actualMetrics, input.success);

      return {
        success: true,
        message: 'Outcome recorded and patterns updated',
      };
    }),

  /**
   * Get successful patterns
   */
  getSuccessfulPatterns: protectedProcedure
    .input(z.object({ limit: z.number().optional() }).optional())
    .query(({ input }) => {
      const patterns = aiReinforcementLearning.getSuccessfulPatterns(input?.limit || 50);

      return patterns.map((p) => ({
        id: p.id,
        pattern: p.pattern,
        context: p.context,
        successRate: (p.successRate * 100).toFixed(1),
        timesApplied: p.timesApplied,
        lastApplied: p.lastApplied,
        weightedScore: p.metrics.weightedScore.toFixed(1),
      }));
    }),

  /**
   * Get repeating faults
   */
  getRepeatingFaults: protectedProcedure
    .input(z.object({ limit: z.number().optional() }).optional())
    .query(({ input }) => {
      const faults = aiReinforcementLearning.getRepeatingFaults(input?.limit || 50);

      return faults.map((f) => ({
        id: f.id,
        faultType: f.faultType,
        occurrences: f.occurrences,
        lastOccurrence: f.lastOccurrence,
        escalationLevel: f.escalationLevel,
        suggestedActions: f.suggestedActions,
      }));
    }),

  /**
   * Get decision history
   */
  getDecisionHistory: protectedProcedure
    .input(z.object({ limit: z.number().optional() }).optional())
    .query(({ input }) => {
      const decisions = aiReinforcementLearning.getDecisionHistory(input?.limit || 50);

      return decisions.map((d) => ({
        id: d.id,
        timestamp: d.timestamp,
        context: d.context,
        selectedOption: d.selectedOption.name,
        reward: d.reward.toFixed(2),
        reasoning: d.reasoning,
      }));
    }),

  /**
   * Get learning statistics
   */
  getLearningStatistics: protectedProcedure.query(() => {
    const stats = aiReinforcementLearning.getLearningStatistics();

    return {
      totalDecisions: stats.totalDecisions,
      averageReward: stats.averageReward.toFixed(2),
      successfulPatterns: stats.successfulPatterns,
      repeatingFaults: stats.repeatingFaults,
      topPattern: stats.topPattern
        ? {
            pattern: stats.topPattern.pattern,
            successRate: (stats.topPattern.successRate * 100).toFixed(1),
            timesApplied: stats.topPattern.timesApplied,
          }
        : null,
      criticalFaults: stats.criticalFaults.length,
    };
  }),
});

