/**
 * ACCEPTANCE ROUTER
 * 
 * tRPC procedures for archetype simulation and real-world acceptance validation
 */

import { protectedProcedure, router } from '../_core/trpc';
import { z } from 'zod';
import { simulationEngine } from '../archetypeSimulation';
import { improvementLoop } from '../improvementLoop';

export const acceptanceRouter = router({
  /**
   * Simulate perception from a single archetype
   */
  simulateArchetype: protectedProcedure
    .input(
      z.object({
        archetype: z.enum([
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
        outputType: z.enum(['quote', 'invoice', 'compliance', 'schedule', 'report', 'ui_screen']),
        content: z.string(),
        metadata: z.record(z.any()).optional(),
      })
    )
    .query(async ({ input }) => {
      const score = await simulationEngine.simulateArchetypePerception(input.archetype, {
        type: input.outputType,
        content: input.content,
        metadata: input.metadata,
      });

      return {
        archetype: score.archetype,
        clarity: score.clarity,
        compliance: score.compliance,
        professionalism: score.professionalism,
        riskVisibility: score.riskVisibility,
        overall: score.overall,
        feedback: score.feedback,
        gaps: score.gaps,
      };
    }),

  /**
   * Simulate perception from all archetypes
   */
  simulateAllArchetypes: protectedProcedure
    .input(
      z.object({
        outputType: z.enum(['quote', 'invoice', 'compliance', 'schedule', 'report', 'ui_screen']),
        content: z.string(),
        metadata: z.record(z.any()).optional(),
      })
    )
    .query(async ({ input }) => {
      const scores = await simulationEngine.simulateAllArchetypes({
        type: input.outputType,
        content: input.content,
        metadata: input.metadata,
      });

      const overall = simulationEngine.calculateOverallAcceptance(scores);
      const meetsStandard = simulationEngine.meetsRealWorldStandard(scores);

      return {
        scores: scores.map((s) => ({
          archetype: s.archetype,
          clarity: s.clarity,
          compliance: s.compliance,
          professionalism: s.professionalism,
          riskVisibility: s.riskVisibility,
          overall: s.overall,
          feedback: s.feedback,
          gaps: s.gaps,
        })),
        overall: {
          average: overall.average,
          minimum: overall.minimum,
          maximum: overall.maximum,
          byArchetype: overall.byArchetype,
        },
        meetsRealWorldStandard: meetsStandard,
      };
    }),

  /**
   * Execute complete improvement loop
   */
  executeImprovementLoop: protectedProcedure
    .input(
      z.object({
        outputId: z.string(),
        outputType: z.enum(['quote', 'invoice', 'compliance', 'schedule', 'report', 'ui_screen']),
        content: z.string(),
        metadata: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await improvementLoop.executeImprovementLoop(
        input.outputId,
        input.outputType,
        input.content,
        input.metadata
      );

      return {
        outputId: result.outputId,
        initialVersion: result.initialVersion,
        finalVersion: result.finalVersion,
        initialAcceptance: result.initialAcceptance,
        finalAcceptance: result.finalAcceptance,
        improvement: result.improvement,
        refinements: result.refinements.map((r) => ({
          type: r.type,
          description: r.description,
          changes: r.changes,
          impact: r.impact,
        })),
        decision: result.decision,
        reason: result.reason,
        meetsRealWorldStandard: result.meetsRealWorldStandard,
      };
    }),

  /**
   * Get improvement history for output
   */
  getImprovementHistory: protectedProcedure
    .input(z.object({ outputId: z.string() }))
    .query(({ input }) => {
      const history = improvementLoop.getImprovementHistory(input.outputId);

      return history.map((h) => ({
        outputId: h.outputId,
        initialVersion: h.initialVersion,
        finalVersion: h.finalVersion,
        initialAcceptance: h.initialAcceptance,
        finalAcceptance: h.finalAcceptance,
        improvement: h.improvement,
        decision: h.decision,
        reason: h.reason,
        meetsRealWorldStandard: h.meetsRealWorldStandard,
      }));
    }),

  /**
   * Get all versions of output
   */
  getVersions: protectedProcedure
    .input(z.object({ outputId: z.string() }))
    .query(({ input }) => {
      const versions = improvementLoop.getVersions(input.outputId);

      return versions.map((v) => ({
        id: v.id,
        version: v.version,
        outputType: v.outputType,
        createdAt: v.createdAt,
        overallAcceptance: v.overallAcceptance,
        status: v.status,
        scores: v.scores.map((s) => ({
          archetype: s.archetype,
          overall: s.overall,
        })),
      }));
    }),

  /**
   * Get archetype profiles
   */
  getArchetypeProfiles: protectedProcedure.query(async () => {
    const { ARCHETYPE_PROFILES } = await import('../archetypeSimulation');

    return Object.entries(ARCHETYPE_PROFILES).map(([id, profile]) => ({
      id: profile.id,
      name: profile.name,
      role: profile.role,
      organization: profile.organization,
      keyConcerns: profile.keyConcerns,
      decisionCriteria: profile.decisionCriteria,
      acceptanceStandards: profile.acceptanceStandards,
    }));
  }),
});

