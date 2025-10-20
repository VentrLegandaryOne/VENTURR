import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { 
  createOrganization,
  getUserOrganizations,
  createProject,
  getProject,
  getOrganizationProjects,
  updateProject,
  createTakeoff,
  getProjectTakeoffs,
  createQuote,
  getQuote,
  getProjectQuotes,
  updateQuote,
  createMeasurement,
  getProjectMeasurements
} from "./db";
import { nanoid } from "nanoid";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  organizations: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getUserOrganizations(ctx.user.id);
    }),
    
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const orgId = nanoid();
        await createOrganization({
          id: orgId,
          name: input.name,
          ownerId: ctx.user.id,
          subscriptionPlan: "starter",
          subscriptionStatus: "trialing",
        });
        return { id: orgId };
      }),
  }),

  projects: router({
    list: protectedProcedure
      .input(z.object({
        organizationId: z.string(),
      }))
      .query(async ({ input }) => {
        return await getOrganizationProjects(input.organizationId);
      }),
    
    get: protectedProcedure
      .input(z.object({
        id: z.string(),
      }))
      .query(async ({ input }) => {
        return await getProject(input.id);
      }),
    
    create: protectedProcedure
      .input(z.object({
        organizationId: z.string(),
        title: z.string(),
        address: z.string().optional(),
        clientName: z.string().optional(),
        clientEmail: z.string().optional(),
        clientPhone: z.string().optional(),
        propertyType: z.enum(["residential", "commercial", "industrial"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const projectId = nanoid();
        await createProject({
          id: projectId,
          organizationId: input.organizationId,
          title: input.title,
          address: input.address,
          clientName: input.clientName,
          clientEmail: input.clientEmail,
          clientPhone: input.clientPhone,
          propertyType: input.propertyType,
          status: "draft",
          createdBy: ctx.user.id,
        });
        return { id: projectId };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.string(),
        title: z.string().optional(),
        address: z.string().optional(),
        clientName: z.string().optional(),
        clientEmail: z.string().optional(),
        clientPhone: z.string().optional(),
        status: z.enum(["draft", "quoted", "approved", "in_progress", "completed", "canceled"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await updateProject(id, updates);
        return { success: true };
      }),
  }),

  takeoffs: router({
    list: protectedProcedure
      .input(z.object({
        projectId: z.string(),
      }))
      .query(async ({ input }) => {
        return await getProjectTakeoffs(input.projectId);
      }),
    
    create: protectedProcedure
      .input(z.object({
        projectId: z.string(),
        roofLength: z.string().optional(),
        roofWidth: z.string().optional(),
        roofArea: z.string().optional(),
        roofType: z.string().optional(),
        roofPitch: z.string().optional(),
        wastePercentage: z.string().optional(),
        labourRate: z.string().optional(),
        profitMargin: z.string().optional(),
        includeGst: z.string().optional(),
        materials: z.string().optional(),
        calculations: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const takeoffId = nanoid();
        await createTakeoff({
          id: takeoffId,
          ...input,
        });
        return { id: takeoffId };
      }),
  }),

  quotes: router({
    list: protectedProcedure
      .input(z.object({
        projectId: z.string(),
      }))
      .query(async ({ input }) => {
        return await getProjectQuotes(input.projectId);
      }),
    
    get: protectedProcedure
      .input(z.object({
        id: z.string(),
      }))
      .query(async ({ input }) => {
        return await getQuote(input.id);
      }),
    
    create: protectedProcedure
      .input(z.object({
        projectId: z.string(),
        quoteNumber: z.string(),
        subtotal: z.string(),
        gst: z.string(),
        total: z.string(),
        deposit: z.string().optional(),
        validUntil: z.date().optional(),
        items: z.string().optional(),
        terms: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const quoteId = nanoid();
        await createQuote({
          id: quoteId,
          ...input,
          status: "draft",
          createdBy: ctx.user.id,
        });
        return { id: quoteId };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.string(),
        status: z.enum(["draft", "sent", "viewed", "accepted", "rejected"]).optional(),
        items: z.string().optional(),
        terms: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await updateQuote(id, updates);
        return { success: true };
      }),
  }),

  measurements: router({
    list: protectedProcedure
      .input(z.object({
        projectId: z.string(),
      }))
      .query(async ({ input }) => {
        return await getProjectMeasurements(input.projectId);
      }),
    
    create: protectedProcedure
      .input(z.object({
        projectId: z.string(),
        deviceId: z.string().optional(),
        measurementData: z.string().optional(),
        drawingData: z.string().optional(),
        scale: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const measurementId = nanoid();
        await createMeasurement({
          id: measurementId,
          ...input,
          createdBy: ctx.user.id,
        });
        return { id: measurementId };
      }),
  }),
});

export type AppRouter = typeof appRouter;

