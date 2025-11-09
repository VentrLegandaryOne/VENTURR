/**
 * REAL-WORLD ACCEPTANCE ROUTER
 * 
 * tRPC procedures for acceptance evaluation and monitoring
 */

import { protectedProcedure, router } from '../_core/trpc';
import { z } from 'zod';
import { realWorldAcceptanceEvaluation } from '../realWorldAcceptanceEvaluation';

export const realWorldAcceptanceRouter = router({
  /**
   * Evaluate acceptance
   */
  evaluateAcceptance: protectedProcedure
    .input(
      z.object({
        outputId: z.string(),
        content: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const evaluation = await realWorldAcceptanceEvaluation.evaluateAcceptance(input.outputId, input.content);

      return {
        id: evaluation.id,
        technicalScore: evaluation.technicalScore.toFixed(1),
        socialScore: evaluation.socialScore.toFixed(1),
        legalScore: evaluation.legalScore.toFixed(1),
        commercialScore: evaluation.commercialScore.toFixed(1),
        overallScore: evaluation.overallScore.toFixed(1),
        acceptanceLevel: evaluation.acceptanceLevel,
        meetsThreshold: evaluation.meetsThreshold,
        readyForDeployment: evaluation.readyForDeployment,
        strengths: evaluation.strengths,
        weaknesses: evaluation.weaknesses,
        recommendations: evaluation.recommendations,
        archetypeScores: evaluation.archetypeEvaluations.map((a) => ({
          archetypeName: a.archetypeName,
          overallScore: a.overallScore.toFixed(1),
          acceptanceLevel: a.acceptanceLevel,
        })),
      };
    }),

  /**
   * Get evaluation history
   */
  getEvaluationHistory: protectedProcedure
    .input(z.object({ outputId: z.string().optional(), limit: z.number().optional() }).optional())
    .query(({ input }) => {
      const evaluations = realWorldAcceptanceEvaluation.getEvaluationHistory(input?.outputId, input?.limit || 50);

      return evaluations.map((e) => ({
        id: e.id,
        timestamp: e.timestamp,
        overallScore: e.overallScore.toFixed(1),
        acceptanceLevel: e.acceptanceLevel,
        meetsThreshold: e.meetsThreshold,
        readyForDeployment: e.readyForDeployment,
      }));
    }),

  /**
   * Get acceptance statistics
   */
  getAcceptanceStatistics: protectedProcedure.query(() => {
    const stats = realWorldAcceptanceEvaluation.getAcceptanceStatistics();

    return {
      totalEvaluations: stats.totalEvaluations,
      excellentEvaluations: stats.excellentEvaluations,
      goodEvaluations: stats.goodEvaluations,
      acceptableEvaluations: stats.acceptableEvaluations,
      needsImprovementEvaluations: stats.needsImprovementEvaluations,
      unacceptableEvaluations: stats.unacceptableEvaluations,
      readyForDeployment: stats.readyForDeployment,
      averageScore: stats.averageScore.toFixed(1),
      acceptanceRate: stats.acceptanceRate.toFixed(1),
    };
  }),
});

