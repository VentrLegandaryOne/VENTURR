/**
 * Venturr-Specific Task Schemas
 * Domain-specific tasks for roofing operations
 */

import { z } from "zod";

/**
 * Quote Generation Task
 */
export const QuoteGenerationTask = z.object({
  projectId: z.string(),
  roofArea: z.number().positive(),
  roofType: z.enum(["gable", "hip", "valley", "skillion", "flat", "complex"]),
  pitch: z.number().min(0).max(90),
  materialId: z.string(),
  location: z.string(),
  coastalDistance: z.number().optional(),
  windRegion: z.enum(["A", "B", "C", "D"]).default("B"),
  balRating: z.enum(["BAL-LOW", "BAL-12.5", "BAL-19", "BAL-29", "BAL-40", "BAL-FZ"]).default("BAL-LOW"),
  removalRequired: z.boolean().default(false),
  customFabrication: z.boolean().default(false),
  accessDifficulty: z.enum(["easy", "moderate", "difficult"]).default("moderate"),
});

export type QuoteGenerationTask = z.infer<typeof QuoteGenerationTask>;

/**
 * Material Extraction Task (from supplier invoice)
 */
export const MaterialExtractionTask = z.object({
  documentPath: z.string(),
  supplier: z.enum(["lysaght", "stramit", "metroll", "matrix", "metalline", "other"]),
  expectedFields: z.array(z.string()).default([
    "productName",
    "profile",
    "thickness",
    "coating",
    "pricePerUnit",
    "unit",
    "coverWidth",
    "minPitch",
  ]),
});

export type MaterialExtractionTask = z.infer<typeof MaterialExtractionTask>;

/**
 * Compliance Check Task
 */
export const ComplianceCheckTask = z.object({
  materialId: z.string(),
  location: z.string(),
  coastalDistance: z.number().optional(),
  windRegion: z.string(),
  balRating: z.string(),
  roofPitch: z.number(),
  standards: z.array(z.string()).default([
    "AS 1562.1:2018",
    "AS/NZS 1170.2:2021",
    "AS 4040.0:2018",
    "AS 3959:2018",
    "NCC 2022",
  ]),
});

export type ComplianceCheckTask = z.infer<typeof ComplianceCheckTask>;

/**
 * Labor Estimation Task
 */
export const LaborEstimationTask = z.object({
  roofArea: z.number().positive(),
  roofType: z.string(),
  pitch: z.number(),
  height: z.number().positive(),
  accessDifficulty: z.string(),
  removalRequired: z.boolean(),
  customFabrication: z.boolean(),
  valleys: z.number().default(0),
  hips: z.number().default(0),
  penetrations: z.number().default(0),
});

export type LaborEstimationTask = z.infer<typeof LaborEstimationTask>;

/**
 * Environmental Risk Assessment Task
 */
export const EnvironmentalRiskTask = z.object({
  location: z.string(),
  coastalDistance: z.number().optional(),
  windRegion: z.string(),
  balRating: z.string(),
  highSaltExposure: z.boolean().default(false),
  cycloneProne: z.boolean().default(false),
});

export type EnvironmentalRiskTask = z.infer<typeof EnvironmentalRiskTask>;

/**
 * Quote Optimization Task
 */
export const QuoteOptimizationTask = z.object({
  baseQuote: z.object({
    materials: z.number(),
    labor: z.number(),
    equipment: z.number(),
    overhead: z.number(),
    profit: z.number(),
  }),
  constraints: z.object({
    minProfitMargin: z.number().default(20),
    maxProfitMargin: z.number().default(35),
    competitorPrice: z.number().optional(),
    targetWinRate: z.number().min(0).max(100).default(70),
  }),
  marketData: z.object({
    averagePricePerSqm: z.number().optional(),
    seasonalDemand: z.enum(["low", "medium", "high"]).default("medium"),
    competitionLevel: z.enum(["low", "medium", "high"]).default("medium"),
  }).optional(),
});

export type QuoteOptimizationTask = z.infer<typeof QuoteOptimizationTask>;

/**
 * Document Classification Task
 */
export const DocumentClassificationTask = z.object({
  documentPath: z.string(),
  possibleTypes: z.array(z.string()).default([
    "invoice",
    "quote",
    "contract",
    "compliance_certificate",
    "installation_manual",
    "safety_document",
    "work_order",
    "other",
  ]),
});

export type DocumentClassificationTask = z.infer<typeof DocumentClassificationTask>;

/**
 * Project Complexity Scoring Task
 */
export const ProjectComplexityTask = z.object({
  roofArea: z.number(),
  roofType: z.string(),
  pitch: z.number(),
  height: z.number(),
  valleys: z.number(),
  hips: z.number(),
  penetrations: z.number(),
  accessDifficulty: z.string(),
  removalRequired: z.boolean(),
  customFabrication: z.boolean(),
  coastalLocation: z.boolean(),
  balRating: z.string(),
});

export type ProjectComplexityTask = z.infer<typeof ProjectComplexityTask>;

/**
 * Venturr Task Union
 */
export const VenturrTask = z.discriminatedUnion("type", [
  z.object({ type: z.literal("quote_generation"), data: QuoteGenerationTask }),
  z.object({ type: z.literal("material_extraction"), data: MaterialExtractionTask }),
  z.object({ type: z.literal("compliance_check"), data: ComplianceCheckTask }),
  z.object({ type: z.literal("labor_estimation"), data: LaborEstimationTask }),
  z.object({ type: z.literal("environmental_risk"), data: EnvironmentalRiskTask }),
  z.object({ type: z.literal("quote_optimization"), data: QuoteOptimizationTask }),
  z.object({ type: z.literal("document_classification"), data: DocumentClassificationTask }),
  z.object({ type: z.literal("project_complexity"), data: ProjectComplexityTask }),
]);

export type VenturrTask = z.infer<typeof VenturrTask>;

