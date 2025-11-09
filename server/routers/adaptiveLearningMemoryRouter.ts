/**
 * ADAPTIVE LEARNING MEMORY ROUTER
 * 
 * tRPC procedures for pattern memory and adaptive learning
 */

import { protectedProcedure, router } from '../_core/trpc';
import { z } from 'zod';
import { adaptiveLearningMemory } from '../adaptiveLearningMemory';

export const adaptiveLearningMemoryRouter = router({
  /**
   * Learn from decision outcome
   */
  learnFromOutcome: protectedProcedure
    .input(
      z.object({
        patternId: z.string(),
        success: z.boolean(),
        reward: z.number(),
        metadata: z.record(z.any()).optional(),
      })
    )
    .mutation(({ input }) => {
      adaptiveLearningMemory.learnFromOutcome(input.patternId, input.success, input.reward, input.metadata);

      return {
        success: true,
        message: 'Learning outcome recorded',
      };
    }),

  /**
   * Get applicable patterns for context
   */
  getApplicablePatterns: protectedProcedure
    .input(z.object({ context: z.string() }))
    .query(({ input }) => {
      const patterns = adaptiveLearningMemory.getApplicablePatterns(input.context);

      return patterns.map((p) => ({
        id: p.id,
        pattern: p.pattern,
        context: p.context,
        successRate: (p.successRate * 100).toFixed(1),
        confidence: (p.confidence * 100).toFixed(1),
        timesUsed: p.timesUsed,
        averageReward: p.averageReward.toFixed(2),
      }));
    }),

  /**
   * Get applicable rules for context
   */
  getApplicableRules: protectedProcedure
    .input(z.object({ context: z.string() }))
    .query(({ input }) => {
      const rules = adaptiveLearningMemory.getApplicableRules(input.context);

      return rules.map((r) => ({
        id: r.id,
        condition: r.condition,
        action: r.action,
        successRate: (r.successRate * 100).toFixed(1),
        priority: r.priority.toFixed(1),
      }));
    }),

  /**
   * Get memory statistics
   */
  getMemoryStatistics: protectedProcedure.query(() => {
    const stats = adaptiveLearningMemory.getMemoryStatistics();

    return {
      totalPatterns: stats.totalPatterns,
      totalRules: stats.totalRules,
      averageSuccessRate: (stats.averageSuccessRate * 100).toFixed(1),
      averageConfidence: (stats.averageConfidence * 100).toFixed(1),
      topPatterns: stats.topPatterns.map((p) => ({
        pattern: p.pattern,
        successRate: (p.successRate * 100).toFixed(1),
        timesUsed: p.timesUsed,
      })),
    };
  }),

  /**
   * Get pattern memory
   */
  getPatternMemory: protectedProcedure
    .input(z.object({ limit: z.number().optional() }).optional())
    .query(({ input }) => {
      const patterns = adaptiveLearningMemory.getPatternMemory(input?.limit || 50);

      return patterns.map((p) => ({
        id: p.id,
        pattern: p.pattern,
        successRate: (p.successRate * 100).toFixed(1),
        confidence: (p.confidence * 100).toFixed(1),
        timesUsed: p.timesUsed,
        averageReward: p.averageReward.toFixed(2),
      }));
    }),

  /**
   * Get adaptive rules
   */
  getAdaptiveRules: protectedProcedure
    .input(z.object({ limit: z.number().optional() }).optional())
    .query(({ input }) => {
      const rules = adaptiveLearningMemory.getAdaptiveRules(input?.limit || 50);

      return rules.map((r) => ({
        id: r.id,
        condition: r.condition,
        action: r.action,
        successRate: (r.successRate * 100).toFixed(1),
        priority: r.priority.toFixed(1),
      }));
    }),

  /**
   * Get learning sessions
   */
  getLearningSessions: protectedProcedure
    .input(z.object({ limit: z.number().optional() }).optional())
    .query(({ input }) => {
      const sessions = adaptiveLearningMemory.getLearningSessions(input?.limit || 50);

      return sessions.map((s) => ({
        id: s.id,
        startTime: s.startTime,
        endTime: s.endTime,
        decisions: s.decisions,
        successfulDecisions: s.successfulDecisions,
        failedDecisions: s.failedDecisions,
        patternsLearned: s.patternsLearned,
        rulesCreated: s.rulesCreated,
        sessionReward: s.sessionReward.toFixed(2),
      }));
    }),
});

