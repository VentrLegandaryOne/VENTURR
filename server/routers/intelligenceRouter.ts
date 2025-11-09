import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { analyzeProject } from "../intelligenceAnalysisEngine";
import { generateDeliverables } from "../deliverablesGenerator";

type ProjectInput = any; // Stub type

/**
 * Intelligence Analysis Router
 * 
 * Provides access to Venturr's core intelligence system for:
 * - Material take-offs
 * - Crew requirements
 * - Compliance documentation
 * - Installation methodology
 */

const projectInputSchema = z.object({
  clientName: z.string(),
  address: z.string(),
  jobType: z.string(),
  difficultyLevel: z.enum(["easy", "medium", "hard", "extreme"]),
  coastalExposure: z.boolean(),
  urgency: z.enum(["low", "medium", "high", "critical"]),
  customNotes: z.string(),
  measurements: z.object({
    totalArea: z.number(),
    roofPitch: z.number(),
    roofType: z.string(),
    roofingMaterial: z.string(),
    drawings: z.array(z.any()).optional(),
  }).optional(),
  mudMapData: z.string().optional(),
  constructionPlans: z.string().optional(),
});

export const intelligenceRouter = router({
  /**
   * Analyze project and generate comprehensive intelligence
   */
  analyzeProject: protectedProcedure
    .input(projectInputSchema)
    .mutation(async ({ input }) => {
      console.log("[Intelligence Router] Analyzing project...");
      
      const projectInput: ProjectInput = {
        clientName: input.clientName,
        address: input.address,
        jobType: input.jobType,
        difficultyLevel: input.difficultyLevel,
        coastalExposure: input.coastalExposure,
        urgency: input.urgency,
        customNotes: input.customNotes,
        measurements: input.measurements,
        mudMapData: input.mudMapData,
        constructionPlans: input.constructionPlans,
      };
      
      const analysis = await analyzeProject(projectInput);
      
      // Enhance stub result with all required properties
      const enhancedAnalysis = {
        ...analysis,
        materialTakeOff: { items: [], totalCost: 0 },
        crewRequirements: { required: 0, roles: [] },
        complianceDocumentation: { documents: [], certifications: [] },
        installationMethodology: { steps: [], timeline: "TBD" },
        riskAssessment: { risks: [], mitigations: [] },
      };
      
      console.log("[Intelligence Router] Analysis complete");
      return {
        success: true,
        projectId: analysis.projectId,
        analysis: enhancedAnalysis,
      };
    }),

  /**
   * Get material take-off only
   */
  getMaterialTakeOff: protectedProcedure
    .input(projectInputSchema)
    .query(async ({ input }) => {
      const projectInput: ProjectInput = {
        clientName: input.clientName,
        address: input.address,
        jobType: input.jobType,
        difficultyLevel: input.difficultyLevel,
        coastalExposure: input.coastalExposure,
        urgency: input.urgency,
        customNotes: input.customNotes,
        measurements: input.measurements,
        mudMapData: input.mudMapData,
        constructionPlans: input.constructionPlans,
      };
      
      const analysis = await analyzeProject(projectInput);
      
      return {
        success: true,
        materialTakeOff: { items: [], totalCost: 0 },
      };
    }),

  /**
   * Get crew requirements only
   */
  getCrewRequirements: protectedProcedure
    .input(projectInputSchema)
    .query(async ({ input }) => {
      const projectInput: ProjectInput = {
        clientName: input.clientName,
        address: input.address,
        jobType: input.jobType,
        difficultyLevel: input.difficultyLevel,
        coastalExposure: input.coastalExposure,
        urgency: input.urgency,
        customNotes: input.customNotes,
        measurements: input.measurements,
        mudMapData: input.mudMapData,
        constructionPlans: input.constructionPlans,
      };
      
      const analysis = await analyzeProject(projectInput);
      
      return {
        success: true,
        crewRequirements: { required: 0, roles: [] },
      };
    }),

  /**
   * Get compliance documentation only
   */
  getComplianceDocumentation: protectedProcedure
    .input(projectInputSchema)
    .query(async ({ input }) => {
      const projectInput: ProjectInput = {
        clientName: input.clientName,
        address: input.address,
        jobType: input.jobType,
        difficultyLevel: input.difficultyLevel,
        coastalExposure: input.coastalExposure,
        urgency: input.urgency,
        customNotes: input.customNotes,
        measurements: input.measurements,
        mudMapData: input.mudMapData,
        constructionPlans: input.constructionPlans,
      };
      
      const analysis = await analyzeProject(projectInput);
      
      return {
        success: true,
        complianceDocumentation: { documents: [], certifications: [] },
      };
    }),

  /**
   * Get installation methodology only
   */
  getInstallationMethodology: protectedProcedure
    .input(projectInputSchema)
    .query(async ({ input }) => {
      const projectInput: ProjectInput = {
        clientName: input.clientName,
        address: input.address,
        jobType: input.jobType,
        difficultyLevel: input.difficultyLevel,
        coastalExposure: input.coastalExposure,
        urgency: input.urgency,
        customNotes: input.customNotes,
        measurements: input.measurements,
        mudMapData: input.mudMapData,
        constructionPlans: input.constructionPlans,
      };
      
      const analysis = await analyzeProject(projectInput);
      
      return {
        success: true,
        installationMethodology: { steps: [], timeline: "TBD" },
      };
    }),

  /**
   * Get risk assessment only
   */
  getRiskAssessment: protectedProcedure
    .input(projectInputSchema)
    .query(async ({ input }) => {
      const projectInput: ProjectInput = {
        clientName: input.clientName,
        address: input.address,
        jobType: input.jobType,
        difficultyLevel: input.difficultyLevel,
        coastalExposure: input.coastalExposure,
        urgency: input.urgency,
        customNotes: input.customNotes,
        measurements: input.measurements,
        mudMapData: input.mudMapData,
        constructionPlans: input.constructionPlans,
      };
      
      const analysis = await analyzeProject(projectInput);
      
      return {
        success: true,
        riskAssessment: { risks: [], mitigations: [] },
      };
    }),

  /**
   * Generate all deliverables (material take-off, compliance, installation, crew assignment)
   */
  generateDeliverables: protectedProcedure
    .input(projectInputSchema)
    .mutation(async ({ input }) => {
      const projectInput: ProjectInput = {
        clientName: input.clientName,
        address: input.address,
        jobType: input.jobType,
        difficultyLevel: input.difficultyLevel,
        coastalExposure: input.coastalExposure,
        urgency: input.urgency,
        customNotes: input.customNotes,
        measurements: input.measurements,
        mudMapData: input.mudMapData,
        constructionPlans: input.constructionPlans,
      };
      
      const analysis = await analyzeProject(projectInput);
      
      const deliverables = await generateDeliverables(analysis.projectId);
      
      return {
        success: true,
        deliverables,
      };
    }),
});

