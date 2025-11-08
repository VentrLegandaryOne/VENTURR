import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  createCrmClient,
  getCrmClient,
  getOrganizationClients,
  updateCrmClient,
  recordClientCommunication,
  getClientCommunications,
} from "../db";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";

export const crmRouter = router({
  // CLIENTS
  clients: router({
    list: protectedProcedure
      .input(z.object({ organizationId: z.string().min(1) }))
      .query(async ({ input }) => {
        try {
          const clients = await getOrganizationClients(input.organizationId);
          return { success: true, data: clients };
        } catch (error) {
          console.error("Error fetching CRM clients:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch clients",
          });
        }
      }),

    get: protectedProcedure
      .input(z.object({ clientId: z.string().min(1) }))
      .query(async ({ input }) => {
        try {
          const client = await getCrmClient(input.clientId);
          if (!client) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Client not found",
            });
          }
          return { success: true, data: client };
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          console.error("Error fetching client:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch client",
          });
        }
      }),

    create: protectedProcedure
      .input(
        z.object({
          organizationId: z.string().min(1),
          name: z.string().min(1, "Name required"),
          email: z.string().email().optional(),
          phone: z.string().optional(),
          company: z.string().optional(),
          address: z.string().optional(),
          city: z.string().optional(),
          state: z.string().optional(),
          postcode: z.string().optional(),
          clientType: z.enum(["residential", "commercial", "industrial", "government"]).default("residential"),
          preferredContactMethod: z.string().optional(),
          notes: z.string().optional(),
          tags: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const client = await createCrmClient({
            id: `client_${nanoid()}`,
            organizationId: input.organizationId,
            name: input.name,
            email: input.email,
            phone: input.phone,
            company: input.company,
            address: input.address,
            city: input.city,
            state: input.state,
            postcode: input.postcode,
            clientType: input.clientType,
            status: "prospect",
            preferredContactMethod: input.preferredContactMethod,
            notes: input.notes,
            tags: input.tags,
            totalSpent: "0",
            projectCount: "0",
            createdBy: ctx.user.id,
            createdAt: new Date(),
            updatedAt: new Date(),
            lastProjectDate: null,
          });
          return { success: true, data: client };
        } catch (error) {
          console.error("Error creating client:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create client",
          });
        }
      }),

    update: protectedProcedure
      .input(
        z.object({
          clientId: z.string().min(1),
          name: z.string().optional(),
          email: z.string().email().optional(),
          phone: z.string().optional(),
          status: z.enum(["lead", "prospect", "active", "inactive", "vip"]).optional(),
          notes: z.string().optional(),
          tags: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const { clientId, ...updates } = input;
          await updateCrmClient(clientId, {
            ...updates,
            updatedAt: new Date(),
          });
          const updated = await getCrmClient(clientId);
          return { success: true, data: updated };
        } catch (error) {
          console.error("Error updating client:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update client",
          });
        }
      }),
  }),

  // COMMUNICATIONS
  communications: router({
    list: protectedProcedure
      .input(z.object({ clientId: z.string().min(1) }))
      .query(async ({ input }) => {
        try {
          const communications = await getClientCommunications(input.clientId);
          return { success: true, data: communications };
        } catch (error) {
          console.error("Error fetching communications:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch communications",
          });
        }
      }),

    record: protectedProcedure
      .input(
        z.object({
          clientId: z.string().min(1),
          type: z.enum(["call", "email", "sms", "visit", "quote", "invoice", "note"]),
          subject: z.string().optional(),
          content: z.string().optional(),
          outcome: z.string().optional(),
          nextFollowUp: z.date().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const communication = await recordClientCommunication({
            id: `comm_${nanoid()}`,
            clientId: input.clientId,
            type: input.type,
            subject: input.subject,
            content: input.content,
            outcome: input.outcome,
            nextFollowUp: input.nextFollowUp,
            createdBy: ctx.user.id,
            createdAt: new Date(),
          });
          return { success: true, data: communication };
        } catch (error) {
          console.error("Error recording communication:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to record communication",
          });
        }
      }),
  }),

  // INTELLIGENT RECOMMENDATIONS
  recommendations: protectedProcedure
    .input(z.object({ organizationId: z.string().min(1), clientId: z.string().min(1) }))
    .query(async ({ input }) => {
      try {
        const client = await getCrmClient(input.clientId);
        if (!client) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Client not found",
          });
        }

        const recommendations = [];

        // Intelligent recommendation logic
        if (client.status === "prospect" && client.projectCount === "0") {
          recommendations.push({
            type: "send_quote",
            priority: "high",
            message: "Send initial quote to convert prospect to active client",
            action: "Create and send quote",
          });
        }

        if (client.status === "active" && client.lastProjectDate) {
          const lastProjectDate = new Date(client.lastProjectDate);
          const daysSinceLastProject = Math.floor((Date.now() - lastProjectDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysSinceLastProject > 90) {
            recommendations.push({
              type: "follow_up",
              priority: "medium",
              message: `No projects in ${daysSinceLastProject} days. Consider follow-up call`,
              action: "Schedule follow-up communication",
            });
          }
        }

        if (parseInt(client.totalSpent || "0") > 50000) {
          recommendations.push({
            type: "vip_treatment",
            priority: "high",
            message: "High-value client (>$50k spent). Consider VIP status and special offers",
            action: "Upgrade to VIP status",
          });
        }

        return { success: true, data: recommendations };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error generating recommendations:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate recommendations",
        });
      }
    }),
});

