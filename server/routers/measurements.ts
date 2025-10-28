import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { measurements } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { nanoid } from "nanoid";

export const measurementsRouter = router({
  // Create or update measurement
  save: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        measurementData: z.string(), // JSON string of measurements
        drawingData: z.string().optional(), // JSON string of drawn shapes
        scale: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      
      // Check if measurement already exists for this project
      const existing = await db
        .select()
        .from(measurements)
        .where(eq(measurements.projectId, input.projectId))
        .limit(1);

      if (existing.length > 0) {
        // Update existing measurement
        await db
          .update(measurements)
          .set({
            measurementData: input.measurementData,
            drawingData: input.drawingData,
            scale: input.scale,
            notes: input.notes,
          })
          .where(eq(measurements.id, existing[0].id));

        return { id: existing[0].id, updated: true };
      } else {
        // Create new measurement
        const id = nanoid();
        await db.insert(measurements).values({
          id,
          projectId: input.projectId,
          measurementData: input.measurementData,
          drawingData: input.drawingData,
          scale: input.scale,
          notes: input.notes,
          createdBy: ctx.user.id,
        });

        return { id, updated: false };
      }
    }),

  // Get measurement for a project
  get: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      
      const result = await db
        .select()
        .from(measurements)
        .where(eq(measurements.projectId, input.projectId))
        .orderBy(desc(measurements.createdAt))
        .limit(1);

      return result[0] || null;
    }),

  // List all measurements for a project (history)
  list: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      
      const result = await db
        .select()
        .from(measurements)
        .where(eq(measurements.projectId, input.projectId))
        .orderBy(desc(measurements.createdAt));

      return result;
    }),

  // Delete measurement
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      
      // Verify measurement exists
      const measurement = await db
        .select()
        .from(measurements)
        .where(eq(measurements.id, input.id))
        .limit(1);

      if (!measurement.length) {
        throw new Error("Measurement not found");
      }

      await db.delete(measurements).where(eq(measurements.id, input.id));

      return { success: true };
    }),
});

