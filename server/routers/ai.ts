import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  normaliseSiteNotes,
  generateProjectSuggestions,
  generateComplianceDoc,
} from "../aiIntelligence";

/**
 * AI Intelligence Router
 * Provides LLM-powered intelligence features
 */
export const aiRouter = router({
  /**
   * Normalize messy site notes into structured measurement data
   * POST /ai/normalise-site-notes
   */
  normaliseSiteNotes: protectedProcedure
    .input(
      z.object({
        rawNotes: z.string(),
        photos: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const normalized = await normaliseSiteNotes({
        rawNotes: input.rawNotes,
        photos: input.photos,
      });
      return normalized;
    }),

  /**
   * Generate intelligent suggestions for a project
   */
  generateSuggestions: protectedProcedure
    .input(
      z.object({
        address: z.string(),
        scope: z.string(),
        measurements: z
          .object({
            area: z.number().nullable(),
            linearMeters: z.number().nullable(),
            roofPitch: z.number().nullable(),
            roofType: z.string().nullable(),
            accessIssues: z.array(z.string()),
            materialHints: z.array(z.string()),
            complianceNotes: z.array(z.string()),
          })
          .optional(),
      })
    )
    .mutation(async ({ input }) => {
      const suggestions = await generateProjectSuggestions(input);
      return suggestions;
    }),

  /**
   * Generate compliance documentation
   */
  generateComplianceDoc: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        address: z.string(),
        scope: z.string(),
        docType: z.enum(["method_statement", "hbcf", "safety_plan"]),
        measurements: z
          .object({
            area: z.number().nullable(),
            linearMeters: z.number().nullable(),
            roofPitch: z.number().nullable(),
            roofType: z.string().nullable(),
            accessIssues: z.array(z.string()),
            materialHints: z.array(z.string()),
            complianceNotes: z.array(z.string()),
          })
          .optional(),
      })
    )
    .mutation(async ({ input }) => {
      const doc = await generateComplianceDoc(
        {
          address: input.address,
          scope: input.scope,
          measurements: input.measurements,
        },
        input.docType
      );
      return { content: doc };
    }),
});

