import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { subscriptionsRouter } from "./routers/subscriptions";
import { measurementsRouter } from "./routers/measurements";
import { clientsRouter } from "./routers/clients";
import { quotesRouter } from "./routers/quotes";
import { intelligenceRouter } from "./routers/intelligenceRouter";
import { aiRouter } from "./routers/ai";
import { takeoffRouter } from "./routers/takeoff";
import { projectsRouter } from "./routers/projects";
import { materialsRouter } from "./routers/materials";
import { notificationsRouter } from "./routers/notifications";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { 
  createOrganization,
  getUserOrganizations,
  createProject,
  getProject,
  getOrganizationProjects,
  updateProject,
  deleteProject,
  createTakeoff,
  getProjectTakeoffs,
  updateTakeoff,
  createQuote,
  getQuote,
  getProjectQuotes,
  updateQuote,
  createMeasurement,
  getProjectMeasurements,
  updateMeasurement,
  deleteMeasurement
} from "./db";
import { nanoid } from "nanoid";

export const appRouter = router({
  system: systemRouter,
  subscriptions: subscriptionsRouter,
  measurements: measurementsRouter,
  clients: clientsRouter,
  quotes: quotesRouter,
  intelligence: intelligenceRouter,
  ai: aiRouter,
  takeoff: takeoffRouter,
  notifications: notificationsRouter,

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
        location: z.string().optional(),
        coastalDistance: z.string().optional(),
        windRegion: z.enum(["A", "B", "C", "D"]).optional(),
        balRating: z.enum(["BAL-LOW", "BAL-12.5", "BAL-19", "BAL-29", "BAL-40", "BAL-FZ"]).optional(),
        saltExposure: z.string().optional(),
        cycloneRisk: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await updateProject(id, updates);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({
        id: z.string(),
      }))
      .mutation(async ({ input }) => {
        await deleteProject(input.id);
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

    update: protectedProcedure
      .input(z.object({
        id: z.string(),
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
        const { id, ...updates } = input;
        await updateTakeoff(id, updates);
        return { success: true };
      }),
  }),

  // Materials library router (using dedicated router)
  materials: materialsRouter,

  // Legacy materials search (deprecated)
  materialsLegacy: router({
    search: publicProcedure
      .input(z.object({
        query: z.string(),
        category: z.string().optional(),
      }))
      .query(async ({ input }) => {
        // Mock material search - replace with actual database query
        const mockMaterials = [
          {
            id: "1",
            name: "Colorbond Steel Roofing",
            category: "roofing",
            price: 45.50,
            unit: "m²",
            supplier: "BlueScope Steel",
          },
          {
            id: "2",
            name: "Ridge Capping",
            category: "flashing",
            price: 12.80,
            unit: "m",
            supplier: "Lysaght",
          },
        ];
        
        return mockMaterials.filter(m => 
          m.name.toLowerCase().includes(input.query.toLowerCase()) ||
          (!input.category || m.category === input.category)
        );
      }),
  }),

  // Settings router - temporarily disabled
});

export type AppRouter = typeof appRouter;

