/**
 * Projects Router
 * 
 * CRUD operations for projects
 */

import { router, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { getDb } from '../db';
import { projects } from '../../drizzle/schema';
import { eq, and, desc } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export const projectsRouter = router({
  /**
   * List all projects for user's organization
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Database not available',
      });
    }

    // Get user's organization (simplified - assumes first org)
    const userProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.createdBy, ctx.user.id))
      .orderBy(desc(projects.createdAt));

    return userProjects;
  }),

  /**
   * Get single project by ID
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
        .from(projects)
        .where(and(
          eq(projects.id, input.id),
          eq(projects.createdBy, ctx.user.id)
        ))
        .limit(1);

      if (result.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found',
        });
      }

      return result[0];
    }),

  /**
   * Create new project
   */
  create: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        address: z.string().optional(),
        clientName: z.string().optional(),
        clientEmail: z.string().optional(),
        clientPhone: z.string().optional(),
        propertyType: z.enum(['residential', 'commercial', 'industrial']).optional(),
        location: z.string().optional(),
        coastalDistance: z.string().optional(),
        windRegion: z.enum(['A', 'B', 'C', 'D']).optional(),
        balRating: z.enum(['BAL-LOW', 'BAL-12.5', 'BAL-19', 'BAL-29', 'BAL-40', 'BAL-FZ']).optional(),
        saltExposure: z.string().optional(),
        cycloneRisk: z.string().optional(),
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

      const projectId = nanoid();
      const organizationId = input.organizationId || 'default-org';

      await db.insert(projects).values({
        id: projectId,
        organizationId,
        title: input.title,
        address: input.address,
        clientName: input.clientName,
        clientEmail: input.clientEmail,
        clientPhone: input.clientPhone,
        propertyType: input.propertyType,
        location: input.location,
        coastalDistance: input.coastalDistance,
        windRegion: input.windRegion,
        balRating: input.balRating,
        saltExposure: input.saltExposure,
        cycloneRisk: input.cycloneRisk,
        createdBy: ctx.user.id,
        status: 'draft',
      });

      return { id: projectId, success: true };
    }),

  /**
   * Update existing project
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        address: z.string().optional(),
        clientName: z.string().optional(),
        clientEmail: z.string().optional(),
        clientPhone: z.string().optional(),
        propertyType: z.enum(['residential', 'commercial', 'industrial']).optional(),
        status: z.enum(['draft', 'quoted', 'approved', 'in_progress', 'completed', 'canceled']).optional(),
        location: z.string().optional(),
        coastalDistance: z.string().optional(),
        windRegion: z.enum(['A', 'B', 'C', 'D']).optional(),
        balRating: z.enum(['BAL-LOW', 'BAL-12.5', 'BAL-19', 'BAL-29', 'BAL-40', 'BAL-FZ']).optional(),
        saltExposure: z.string().optional(),
        cycloneRisk: z.string().optional(),
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
        .update(projects)
        .set(updateData)
        .where(and(
          eq(projects.id, id),
          eq(projects.createdBy, ctx.user.id)
        ));

      return { success: true };
    }),

  /**
   * Delete project
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
        .delete(projects)
        .where(and(
          eq(projects.id, input.id),
          eq(projects.createdBy, ctx.user.id)
        ));

      return { success: true };
    }),
});

export default projectsRouter;

