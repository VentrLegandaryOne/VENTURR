/**
 * Materials Router
 * 
 * CRUD operations for materials library
 */

import { router, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { getDb } from '../db';
import { materials } from '../../drizzle/schema';
import { eq, and, desc, like } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export const materialsRouter = router({
  /**
   * List all materials for user's organization
   */
  list: protectedProcedure
    .input(
      z.object({
        category: z.string().optional(),
        manufacturer: z.string().optional(),
        search: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Database not available',
        });
      }

      let query = db.select().from(materials);

      // Apply filters
      const conditions = [eq(materials.createdBy, ctx.user.id)];
      
      if (input?.category) {
        conditions.push(eq(materials.category, input.category));
      }
      
      if (input?.manufacturer) {
        conditions.push(eq(materials.manufacturer, input.manufacturer));
      }
      
      if (input?.search) {
        conditions.push(like(materials.name, `%${input.search}%`));
      }

      const result = await query
        .where(and(...conditions))
        .orderBy(desc(materials.createdAt));

      return result;
    }),

  /**
   * Get single material by ID
   */
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Database not available',
        });
      }

      const result = await db
        .select()
        .from(materials)
        .where(and(
          eq(materials.id, input.id),
          eq(materials.createdBy, ctx.user.id)
        ))
        .limit(1);

      if (result.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Material not found',
        });
      }

      return result[0];
    }),

  /**
   * Create new material
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        category: z.string(),
        manufacturer: z.string(),
        profile: z.string(),
        thickness: z.string(),
        coating: z.string(),
        pricePerUnit: z.string(),
        unit: z.string(),
        coverWidth: z.string().optional(),
        minPitch: z.string().optional(),
        maxSpan: z.string().optional(),
        description: z.string().optional(),
        organizationId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Database not available',
        });
      }

      const materialId = nanoid();
      const organizationId = input.organizationId || 'default-org';

      await db.insert(materials).values({
        id: materialId,
        organizationId,
        name: input.name,
        category: input.category,
        manufacturer: input.manufacturer,
        profile: input.profile,
        thickness: input.thickness,
        coating: input.coating,
        pricePerUnit: input.pricePerUnit,
        unit: input.unit,
        coverWidth: input.coverWidth,
        minPitch: input.minPitch,
        maxSpan: input.maxSpan,
        description: input.description,
        createdBy: ctx.user.id,
      });

      return { id: materialId, success: true };
    }),

  /**
   * Update existing material
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        category: z.string().optional(),
        manufacturer: z.string().optional(),
        profile: z.string().optional(),
        thickness: z.string().optional(),
        coating: z.string().optional(),
        pricePerUnit: z.string().optional(),
        unit: z.string().optional(),
        coverWidth: z.string().optional(),
        minPitch: z.string().optional(),
        maxSpan: z.string().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Database not available',
        });
      }

      const { id, ...updateData } = input;

      await db
        .update(materials)
        .set(updateData)
        .where(and(
          eq(materials.id, id),
          eq(materials.createdBy, ctx.user.id)
        ));

      return { success: true };
    }),

  /**
   * Delete material
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Database not available',
        });
      }

      await db
        .delete(materials)
        .where(and(
          eq(materials.id, input.id),
          eq(materials.createdBy, ctx.user.id)
        ));

      return { success: true };
    }),

  /**
   * Get unique categories
   */
  getCategories: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      return [];
    }

    const result = await db
      .select({ category: materials.category })
      .from(materials)
      .where(eq(materials.createdBy, ctx.user.id))
      .groupBy(materials.category);

    return result.map(r => r.category);
  }),

  /**
   * Get unique manufacturers
   */
  getManufacturers: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      return [];
    }

    const result = await db
      .select({ manufacturer: materials.manufacturer })
      .from(materials)
      .where(eq(materials.createdBy, ctx.user.id))
      .groupBy(materials.manufacturer);

    return result.map(r => r.manufacturer);
  }),
});

export default materialsRouter;

