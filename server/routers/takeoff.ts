import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { calculateTakeoff, applyMarkup } from "../takeoffEngine";
import { createTakeoff, getProjectTakeoffs, updateTakeoff } from "../db";

/**
 * Takeoff Router
 * Handles material takeoff calculations with Australian standards
 */
export const takeoffRouter = router({
  /**
   * Calculate takeoff for a project
   * POST /projects/:id/takeoff
   */
  calculate: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        area: z.number(),
        linearMeters: z.number().optional(),
        roofPitch: z.number().optional(),
        roofType: z.string(),
        profile: z.string(),
        location: z.string(),
        height: z.number().optional(),
        markupTiers: z
          .object({
            materials: z.number().default(1.3), // 30% markup
            labour: z.number().default(1.4), // 40% markup
            plant: z.number().default(1.2), // 20% markup
          })
          .optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Calculate base takeoff
      const takeoff = calculateTakeoff({
        area: input.area,
        linearMeters: input.linearMeters,
        roofPitch: input.roofPitch,
        roofType: input.roofType,
        profile: input.profile,
        location: input.location,
        height: input.height,
      });

      // Apply markup if provided
      const finalTakeoff = input.markupTiers
        ? applyMarkup(takeoff, input.markupTiers)
        : takeoff;

      // Save to database
      const saved = await createTakeoff({
        projectId: input.projectId,
        items: JSON.stringify({
          materials: finalTakeoff.materials,
          labour: finalTakeoff.labour,
          plant: finalTakeoff.plant,
        }),
        subtotal: finalTakeoff.subtotal,
        gst: finalTakeoff.gst,
        total: finalTakeoff.total,
        complianceNotes: JSON.stringify(finalTakeoff.complianceNotes),
      });

      return {
        ...finalTakeoff,
        takeoffId: saved.id,
      };
    }),

  /**
   * Get all takeoffs for a project
   */
  list: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const takeoffs = await getProjectTakeoffs(input.projectId);
      return takeoffs.map((t) => ({
        ...t,
        items: JSON.parse(t.items as string),
        complianceNotes: JSON.parse(t.complianceNotes as string),
      }));
    }),

  /**
   * Update an existing takeoff
   */
  update: protectedProcedure
    .input(
      z.object({
        takeoffId: z.string(),
        items: z.string(),
        subtotal: z.number(),
        gst: z.number(),
        total: z.number(),
        complianceNotes: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const updated = await updateTakeoff(input.takeoffId, {
        items: input.items,
        subtotal: input.subtotal,
        gst: input.gst,
        total: input.total,
        complianceNotes: input.complianceNotes,
      });
      return updated;
    }),
});

