import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { subscriptionsRouter } from "./routers/subscriptions";
import { measurementsRouter } from "./routers/measurements";
import { clientsRouter } from "./routers/clients";
import { quotesRouter } from "./routers/quotes";
import { advancedFeaturesRouter } from "./routers/advancedFeatures";
import { paymentAndDocumentsRouter } from "./routers/paymentAndDocuments";
import { clientAndSchedulingRouter } from "./routers/clientAndScheduling";
import { authEmailAPIRouter } from "./routers/authEmailAPI";
import { uiAndWebhooksRouter } from "./routers/uiAndWebhooks";
import { projectRouter } from "./routers/projectRouter";
import { inventoryRouter } from "./routers/inventoryRouter";
import { crmRouter } from "./routers/crmRouter";
import { financialRouter } from "./routers/financialRouter";
import { materialAllocationRouter } from "./routers/materialAllocationRouter";
import { fieldTrackingRouter } from "./routers/fieldTrackingRouter";
import { profitabilityRouter } from "./routers/profitabilityRouter";
import { supplierRouter } from "./routers/supplierRouter";
import { laborRouter } from "./routers/laborRouter";
import { customerPortalRouter } from "./routers/customerPortalRouter";
import { sendQuoteEmail } from "./emailService";
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
  subscriptions: subscriptionsRouter,
  measurements: measurementsRouter,
  clients: clientsRouter,
  quotes: quotesRouter,
  advancedFeatures: advancedFeaturesRouter,
  paymentAndDocuments: paymentAndDocumentsRouter,
  clientAndScheduling: clientAndSchedulingRouter,
  authEmailAPI: authEmailAPIRouter,
  uiAndWebhooks: uiAndWebhooksRouter,
  project: projectRouter,
  inventory: inventoryRouter,
  crm: crmRouter,
  financial: financialRouter,
  materialAllocation: materialAllocationRouter,
  fieldTracking: fieldTrackingRouter,
  profitability: profitabilityRouter,
  supplier: supplierRouter,
  labor: laborRouter,
  customerPortal: customerPortalRouter,

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
        // Environmental factors
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
    
    export: protectedProcedure
      .input(z.object({
        organizationId: z.string(),
        format: z.enum(['csv', 'xlsx']),
      }))
      .mutation(async ({ input }) => {
        const { generateCSV, generateExcel } = await import('./utils/csvExport');
        
        const { organizationId, format } = input;
        const projects = await getOrganizationProjects(organizationId);
        
        // Transform to export format
        const exportData = projects.map(p => ({
          title: p.title,
          propertyType: p.propertyType || '',
          address: p.address || '',
          clientName: p.clientName || '',
          clientEmail: p.clientEmail || '',
          clientPhone: p.clientPhone || '',
          status: p.status,
          location: p.location || '',
          coastalDistance: p.coastalDistance || '',
          windRegion: p.windRegion || '',
          balRating: p.balRating || '',
        }));
        
        const headers = [
          'title', 'propertyType', 'address', 'clientName', 
          'clientEmail', 'clientPhone', 'status', 'location',
          'coastalDistance', 'windRegion', 'balRating'
        ];
        
        if (format === 'csv') {
          const csv = generateCSV(exportData, headers);
          return {
            content: csv,
            filename: `projects-${new Date().toISOString().split('T')[0]}.csv`,
            mimeType: 'text/csv'
          };
        } else {
          const excel = generateExcel(exportData, 'Projects', headers);
          return {
            content: excel.toString('base64'),
            filename: `projects-${new Date().toISOString().split('T')[0]}.xlsx`,
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          };
        }
      }),
    
    downloadTemplate: protectedProcedure
      .input(z.object({
        format: z.enum(['csv', 'xlsx']),
      }))
      .mutation(async ({ input }) => {
        const { generateCSV, generateExcel } = await import('./utils/csvExport');
        
        const template = [
          {
            title: 'Sample Residential Roof',
            propertyType: 'residential',
            address: '123 Main St, Sydney NSW 2000',
            clientName: 'John Smith',
            clientEmail: 'john@example.com',
            clientPhone: '0412345678',
            status: 'draft',
            location: 'Sydney, NSW',
            coastalDistance: '5',
            windRegion: 'B',
            balRating: 'BAL-LOW'
          }
        ];
        
        const headers = [
          'title', 'propertyType', 'address', 'clientName', 
          'clientEmail', 'clientPhone', 'status', 'location',
          'coastalDistance', 'windRegion', 'balRating'
        ];
        
        if (input.format === 'csv') {
          const csv = generateCSV(template, headers);
          return {
            content: csv,
            filename: 'projects-template.csv',
            mimeType: 'text/csv'
          };
        } else {
          const excel = generateExcel(template, 'Projects', headers);
          return {
            content: excel.toString('base64'),
            filename: 'projects-template.xlsx',
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          };
        }
      }),
    
    import: protectedProcedure
      .input(z.object({
        organizationId: z.string(),
        fileContent: z.string(),
        format: z.enum(['csv', 'xlsx']),
        mode: z.enum(['append', 'replace']),
      }))
      .mutation(async ({ ctx, input }) => {
        const { parseCSV, parseExcel } = await import('./utils/csvExport');
        const { ImportValidator } = await import('./utils/importValidator');
        
        const { organizationId, fileContent, format, mode } = input;
        
        // Parse file
        let parsedData;
        if (format === 'csv') {
          parsedData = await parseCSV(fileContent);
        } else {
          const buffer = Buffer.from(fileContent, 'base64');
          parsedData = parseExcel(buffer);
        }
        
        // Validate data
        const projectSchema = z.object({
          title: z.string().min(1, 'Title is required'),
          propertyType: z.string().optional(),
          address: z.string().optional(),
          clientName: z.string().optional(),
          clientEmail: z.string().email('Invalid email').optional().or(z.literal('')),
          clientPhone: z.string().optional(),
          status: z.string().optional(),
          location: z.string().optional(),
          coastalDistance: z.string().optional(),
          windRegion: z.string().optional(),
          balRating: z.string().optional(),
        });
        
        const validator = new ImportValidator(projectSchema);
        const { result, validatedData } = validator.validate(parsedData);
        
        if (!result.success) {
          return result;
        }
        
        // Batch insert
        for (const row of validatedData) {
          const projectId = nanoid();
          await createProject({
            id: projectId,
            organizationId,
            createdBy: ctx.user.id,
            status: 'draft',
            ...(row as any),
          });
        }
        
        return {
          ...result,
          success: true
        };
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
        validUntil: z.string().optional(),
        items: z.string().optional(),
        terms: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const quoteId = nanoid();
        const { validUntil, ...rest } = input;
        await createQuote({
          id: quoteId,
          ...rest,
          validUntil: validUntil ? new Date(validUntil) : undefined,
          status: "draft",
          createdBy: ctx.user.id,
        });
        
        // Send email notification if client email is available
        const project = await getProject(input.projectId);
        if (project?.clientEmail && project?.clientName) {
          await sendQuoteEmail(
            project.clientEmail,
            project.clientName,
            project.title,
            input.quoteNumber,
            input.total
          );
        }
        
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

  materials: router({
    list: protectedProcedure
      .input(z.object({
        organizationId: z.string(),
        category: z.string().optional(),
        manufacturer: z.string().optional(),
        searchTerm: z.string().optional(),
      }))
      .query(async ({ input }) => {
        const { getOrganizationMaterials, searchMaterials } = await import('./materialsDb');
        
        if (input.category || input.manufacturer || input.searchTerm) {
          return await searchMaterials(input.organizationId, {
            category: input.category,
            manufacturer: input.manufacturer,
            searchTerm: input.searchTerm,
          });
        }
        
        return await getOrganizationMaterials(input.organizationId);
      }),
    
    get: protectedProcedure
      .input(z.object({
        id: z.string(),
      }))
      .query(async ({ input }) => {
        const { getMaterial } = await import('./materialsDb');
        return await getMaterial(input.id);
      }),
    
    create: protectedProcedure
      .input(z.object({
        organizationId: z.string(),
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
      }))
      .mutation(async ({ ctx, input }) => {
        const { createMaterial } = await import('./materialsDb');
        const materialId = nanoid();
        await createMaterial({
          id: materialId,
          ...input,
          createdBy: ctx.user.id,
        });
        return { id: materialId };
      }),
    
    update: protectedProcedure
      .input(z.object({
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
      }))
      .mutation(async ({ input }) => {
        const { updateMaterial } = await import('./materialsDb');
        const { id, ...updates } = input;
        await updateMaterial(id, updates);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({
        id: z.string(),
      }))
      .mutation(async ({ input }) => {
        const { deleteMaterial } = await import('./materialsDb');
        await deleteMaterial(input.id);
        return { success: true };
      }),
    
    export: protectedProcedure
      .input(z.object({
        organizationId: z.string(),
        format: z.enum(['csv', 'xlsx']),
        filters: z.object({
          category: z.string().optional(),
          manufacturer: z.string().optional(),
        }).optional(),
      }))
      .mutation(async ({ input }) => {
        const { getOrganizationMaterials, searchMaterials } = await import('./materialsDb');
        const { generateCSV, generateExcel } = await import('./utils/csvExport');
        
        const { organizationId, format, filters } = input;
        
        // Query materials with filters
        let data;
        if (filters?.category || filters?.manufacturer) {
          data = await searchMaterials(organizationId, filters);
        } else {
          data = await getOrganizationMaterials(organizationId);
        }
        
        // Transform to export format
        const exportData = data.map(m => ({
          name: m.name,
          category: m.category,
          manufacturer: m.manufacturer,
          profile: m.profile,
          thickness: m.thickness,
          coating: m.coating,
          pricePerUnit: m.pricePerUnit,
          unit: m.unit,
          coverWidth: m.coverWidth || '',
          minPitch: m.minPitch || '',
          maxSpan: m.maxSpan || '',
          description: m.description || '',
        }));
        
        const headers = [
          'name', 'category', 'manufacturer', 'profile', 
          'thickness', 'coating', 'pricePerUnit', 'unit',
          'coverWidth', 'minPitch', 'maxSpan', 'description'
        ];
        
        if (format === 'csv') {
          const csv = generateCSV(exportData, headers);
          return {
            content: csv,
            filename: `materials-${new Date().toISOString().split('T')[0]}.csv`,
            mimeType: 'text/csv'
          };
        } else {
          const excel = generateExcel(exportData, 'Materials', headers);
          return {
            content: excel.toString('base64'),
            filename: `materials-${new Date().toISOString().split('T')[0]}.xlsx`,
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          };
        }
      }),
    
    downloadTemplate: protectedProcedure
      .input(z.object({
        format: z.enum(['csv', 'xlsx']),
      }))
      .mutation(async ({ input }) => {
        const { generateCSV, generateExcel } = await import('./utils/csvExport');
        
        const template = [
          {
            name: 'Lysaght Klip-Lok 700 0.42mm COLORBOND',
            category: 'Roofing',
            manufacturer: 'Lysaght',
            profile: 'Klip-Lok 700',
            thickness: '0.42',
            coating: 'COLORBOND',
            pricePerUnit: '52',
            unit: 'm²',
            coverWidth: '0.7',
            minPitch: '1',
            maxSpan: '1200',
            description: 'Concealed fix roofing profile'
          }
        ];
        
        const headers = [
          'name', 'category', 'manufacturer', 'profile', 
          'thickness', 'coating', 'pricePerUnit', 'unit',
          'coverWidth', 'minPitch', 'maxSpan', 'description'
        ];
        
        if (input.format === 'csv') {
          const csv = generateCSV(template, headers);
          return {
            content: csv,
            filename: 'materials-template.csv',
            mimeType: 'text/csv'
          };
        } else {
          const excel = generateExcel(template, 'Materials', headers);
          return {
            content: excel.toString('base64'),
            filename: 'materials-template.xlsx',
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          };
        }
      }),
    
    import: protectedProcedure
      .input(z.object({
        organizationId: z.string(),
        fileContent: z.string(),
        format: z.enum(['csv', 'xlsx']),
        mode: z.enum(['append', 'replace']),
      }))
      .mutation(async ({ ctx, input }) => {
        const { parseCSV, parseExcel } = await import('./utils/csvExport');
        const { ImportValidator } = await import('./utils/importValidator');
        const { batchCreateMaterials, deleteOrganizationMaterials } = await import('./materialsDb');
        
        const { organizationId, fileContent, format, mode } = input;
        
        // Parse file
        let parsedData;
        if (format === 'csv') {
          parsedData = await parseCSV(fileContent);
        } else {
          const buffer = Buffer.from(fileContent, 'base64');
          parsedData = parseExcel(buffer);
        }
        
        // Validate data
        const materialSchema = z.object({
          name: z.string().min(1, 'Name is required'),
          category: z.string().min(1, 'Category is required'),
          manufacturer: z.string().min(1, 'Manufacturer is required'),
          profile: z.string().min(1, 'Profile is required'),
          thickness: z.string().min(1, 'Thickness is required'),
          coating: z.string().min(1, 'Coating is required'),
          pricePerUnit: z.string().min(1, 'Price is required'),
          unit: z.string().min(1, 'Unit is required'),
          coverWidth: z.string().optional(),
          minPitch: z.string().optional(),
          maxSpan: z.string().optional(),
          description: z.string().optional(),
        });
        
        const validator = new ImportValidator(materialSchema);
        const { result, validatedData } = validator.validate(parsedData);
        
        if (!result.success) {
          return result;
        }
        
        // Handle import mode
        if (mode === 'replace') {
          await deleteOrganizationMaterials(organizationId);
        }
        
        // Batch insert
        const insertData = validatedData.map(row => ({
          id: nanoid(),
          organizationId,
          createdBy: ctx.user.id,
          ...row,
        }));
        
        await batchCreateMaterials(insertData);
        
        return {
          ...result,
          success: true
        };
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

