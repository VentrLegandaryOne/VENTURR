import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { clients } from "../../drizzle/schema";
import { eq, and, desc, like, or } from "drizzle-orm";
import { nanoid } from "nanoid";

export const clientsRouter = router({
  // List all clients for an organization
  list: protectedProcedure
    .input(
      z.object({
        organizationId: z.string(),
        search: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      let query = db
        .select()
        .from(clients)
        .where(eq(clients.organizationId, input.organizationId))
        .$dynamic();

      // Add search filter if provided
      if (input.search) {
        query = query.where(
          or(
            like(clients.name, `%${input.search}%`),
            like(clients.email, `%${input.search}%`),
            like(clients.phone, `%${input.search}%`),
            like(clients.company, `%${input.search}%`)
          )
        );
      }

      const result = await query.orderBy(desc(clients.createdAt));
      return result;
    }),

  // Get a single client by ID
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const result = await db
        .select()
        .from(clients)
        .where(eq(clients.id, input.id))
        .limit(1);

      return result[0] || null;
    }),

  // Create a new client
  create: protectedProcedure
    .input(
      z.object({
        organizationId: z.string(),
        name: z.string().min(1, "Name is required"),
        email: z.string().email().optional().or(z.literal("")),
        phone: z.string().optional(),
        company: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        postcode: z.string().optional(),
        notes: z.string().optional(),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const clientId = nanoid();

      await db.insert(clients).values({
        id: clientId,
        organizationId: input.organizationId,
        name: input.name,
        email: input.email || null,
        phone: input.phone || null,
        company: input.company || null,
        address: input.address || null,
        city: input.city || null,
        state: input.state || null,
        postcode: input.postcode || null,
        notes: input.notes || null,
        tags: input.tags ? JSON.stringify(input.tags) : null,
        createdBy: ctx.user.id,
      });

      return { id: clientId };
    }),

  // Update a client
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1, "Name is required").optional(),
        email: z.string().email().optional().or(z.literal("")),
        phone: z.string().optional(),
        company: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        postcode: z.string().optional(),
        notes: z.string().optional(),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, tags, ...updates } = input;

      const updateData: any = updates;
      if (tags !== undefined) {
        updateData.tags = JSON.stringify(tags);
      }

      await db
        .update(clients)
        .set(updateData)
        .where(eq(clients.id, id));

      return { success: true };
    }),

  // Delete a client
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.delete(clients).where(eq(clients.id, input.id));

      return { success: true };
    }),

  // Get client statistics
  stats: protectedProcedure
    .input(z.object({ organizationId: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const allClients = await db
        .select()
        .from(clients)
        .where(eq(clients.organizationId, input.organizationId));

      return {
        total: allClients.length,
        withEmail: allClients.filter((c) => c.email).length,
        withPhone: allClients.filter((c) => c.phone).length,
        withCompany: allClients.filter((c) => c.company).length,
      };
    }),
});

