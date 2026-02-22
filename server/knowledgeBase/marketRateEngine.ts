/**
 * VENTURR VALDT - Deterministic Market Rate Engine
 * 
 * This module provides accurate pricing analysis using:
 * 1. Database price benchmarks (real market data)
 * 2. Built-in Australian construction rates (Rawlinsons-based)
 * 3. Regional adjustment factors
 * 4. Trade-specific labor rates
 * 
 * All rates are in Australian cents for precision.
 * Sources: Rawlinsons Construction Cost Guide 2024, ABS Building Activity Data
 */

import { getDb } from "../db";
import { priceBenchmarks } from "../../drizzle/schema";
import { eq, and, sql } from "drizzle-orm";

// ============================================================================
// AUSTRALIAN CONSTRUCTION LABOR RATES (2024)
// Source: Fair Work Australia Award Rates + Industry Surveys
// ============================================================================

export interface LaborRate {
  trade: string;
  classification: string;
  hourlyRate: number; // cents per hour
  chargeOutRate: number; // typical contractor charge rate (includes overheads)
  source: string;
}

export const LABOR_RATES: LaborRate[] = [
  // Roofing
  {
    trade: "Roof Plumber",
    classification: "Licensed Tradesperson",
    hourlyRate: 4500, // $45/hr base
    chargeOutRate: 9500, // $95/hr charge out
    source: "Plumbing Award 2020, Industry Survey 2024"
  },
  {
    trade: "Roof Plumber",
    classification: "Apprentice 4th Year",
    hourlyRate: 3200,
    chargeOutRate: 6500,
    source: "Plumbing Award 2020"
  },
  {
    trade: "Roof Tiler",
    classification: "Licensed Tradesperson",
    hourlyRate: 4200,
    chargeOutRate: 8500,
    source: "Building Award 2020, Industry Survey 2024"
  },
  // Electrical
  {
    trade: "Electrician",
    classification: "Licensed A-Grade",
    hourlyRate: 4800,
    chargeOutRate: 11000,
    source: "Electrical Award 2020, Industry Survey 2024"
  },
  {
    trade: "Electrician",
    classification: "Licensed",
    hourlyRate: 4300,
    chargeOutRate: 9500,
    source: "Electrical Award 2020"
  },
  // Plumbing
  {
    trade: "Plumber",
    classification: "Licensed",
    hourlyRate: 4500,
    chargeOutRate: 10000,
    source: "Plumbing Award 2020, Industry Survey 2024"
  },
  {
    trade: "Plumber",
    classification: "Drainer",
    hourlyRate: 4800,
    chargeOutRate: 11500,
    source: "Plumbing Award 2020"
  },
  // Carpentry
  {
    trade: "Carpenter",
    classification: "Licensed",
    hourlyRate: 4200,
    chargeOutRate: 8500,
    source: "Building Award 2020"
  },
  {
    trade: "Carpenter",
    classification: "Formwork",
    hourlyRate: 4500,
    chargeOutRate: 9500,
    source: "Building Award 2020"
  },
  // General
  {
    trade: "Builder",
    classification: "Licensed",
    hourlyRate: 5000,
    chargeOutRate: 12000,
    source: "Building Award 2020, Industry Survey 2024"
  },
  {
    trade: "Labourer",
    classification: "General",
    hourlyRate: 3200,
    chargeOutRate: 5500,
    source: "Building Award 2020"
  }
];

// ============================================================================
// MATERIAL COSTS - ROOFING (2024)
// Source: Lysaght, BlueScope, Metroll Price Lists
// ============================================================================

export interface MaterialCost {
  item: string;
  unit: string;
  avgCost: number; // cents
  minCost: number;
  maxCost: number;
  supplier: string;
  lastUpdated: string;
}

export const ROOFING_MATERIALS: MaterialCost[] = [
  // Metal Roofing Sheets
  {
    item: "Colorbond Trimdek 0.42mm BMT",
    unit: "linear metre",
    avgCost: 2800,
    minCost: 2400,
    maxCost: 3200,
    supplier: "BlueScope/Lysaght",
    lastUpdated: "2024-Q4"
  },
  {
    item: "Colorbond Trimdek 0.48mm BMT",
    unit: "linear metre",
    avgCost: 3200,
    minCost: 2800,
    maxCost: 3600,
    supplier: "BlueScope/Lysaght",
    lastUpdated: "2024-Q4"
  },
  {
    item: "Colorbond Custom Orb 0.42mm BMT",
    unit: "linear metre",
    avgCost: 2600,
    minCost: 2200,
    maxCost: 3000,
    supplier: "BlueScope/Lysaght",
    lastUpdated: "2024-Q4"
  },
  {
    item: "Colorbond Klip-Lok 0.48mm BMT",
    unit: "linear metre",
    avgCost: 3500,
    minCost: 3000,
    maxCost: 4000,
    supplier: "BlueScope/Lysaght",
    lastUpdated: "2024-Q4"
  },
  {
    item: "Zincalume Trimdek 0.42mm BMT",
    unit: "linear metre",
    avgCost: 2200,
    minCost: 1900,
    maxCost: 2600,
    supplier: "BlueScope/Lysaght",
    lastUpdated: "2024-Q4"
  },
  // Flashings
  {
    item: "Ridge Capping Colorbond",
    unit: "linear metre",
    avgCost: 1800,
    minCost: 1500,
    maxCost: 2200,
    supplier: "Various",
    lastUpdated: "2024-Q4"
  },
  {
    item: "Valley Gutter 450mm",
    unit: "linear metre",
    avgCost: 2500,
    minCost: 2000,
    maxCost: 3000,
    supplier: "Various",
    lastUpdated: "2024-Q4"
  },
  {
    item: "Barge Flashing",
    unit: "linear metre",
    avgCost: 1600,
    minCost: 1300,
    maxCost: 2000,
    supplier: "Various",
    lastUpdated: "2024-Q4"
  },
  {
    item: "Apron Flashing",
    unit: "linear metre",
    avgCost: 1400,
    minCost: 1100,
    maxCost: 1800,
    supplier: "Various",
    lastUpdated: "2024-Q4"
  },
  // Guttering
  {
    item: "Quad Gutter 115mm Colorbond",
    unit: "linear metre",
    avgCost: 2200,
    minCost: 1800,
    maxCost: 2600,
    supplier: "Various",
    lastUpdated: "2024-Q4"
  },
  {
    item: "Fascia Gutter 125mm Colorbond",
    unit: "linear metre",
    avgCost: 2800,
    minCost: 2400,
    maxCost: 3200,
    supplier: "Various",
    lastUpdated: "2024-Q4"
  },
  {
    item: "Downpipe 90mm Round Colorbond",
    unit: "linear metre",
    avgCost: 1800,
    minCost: 1500,
    maxCost: 2200,
    supplier: "Various",
    lastUpdated: "2024-Q4"
  },
  // Fasteners
  {
    item: "Type 17 Hex Head Screws Class 3 (box 500)",
    unit: "box",
    avgCost: 8500,
    minCost: 7000,
    maxCost: 10000,
    supplier: "Buildex/ITW",
    lastUpdated: "2024-Q4"
  },
  {
    item: "Type 17 Hex Head Screws Class 4 SS (box 500)",
    unit: "box",
    avgCost: 18000,
    minCost: 15000,
    maxCost: 22000,
    supplier: "Buildex/ITW",
    lastUpdated: "2024-Q4"
  },
  // Sarking
  {
    item: "Reflective Sarking (Anticon)",
    unit: "sqm",
    avgCost: 850,
    minCost: 700,
    maxCost: 1000,
    supplier: "Bradford/CSR",
    lastUpdated: "2024-Q4"
  },
  {
    item: "Non-reflective Sarking",
    unit: "sqm",
    avgCost: 450,
    minCost: 350,
    maxCost: 550,
    supplier: "Various",
    lastUpdated: "2024-Q4"
  }
];

// ============================================================================
// REGIONAL ADJUSTMENT FACTORS
// Source: ABS Building Activity Data, Rawlinsons Regional Indices
// ============================================================================

export interface RegionalFactor {
  region: string;
  state: string;
  laborFactor: number; // multiplier
  materialFactor: number;
  remotenessCategory: "metro" | "regional" | "remote";
}

export const REGIONAL_FACTORS: RegionalFactor[] = [
  // NSW
  { region: "Sydney Metro", state: "NSW", laborFactor: 1.0, materialFactor: 1.0, remotenessCategory: "metro" },
  { region: "Newcastle/Hunter", state: "NSW", laborFactor: 0.95, materialFactor: 1.02, remotenessCategory: "metro" },
  { region: "Wollongong/Illawarra", state: "NSW", laborFactor: 0.95, materialFactor: 1.02, remotenessCategory: "metro" },
  { region: "Central Coast", state: "NSW", laborFactor: 0.92, materialFactor: 1.03, remotenessCategory: "metro" },
  { region: "NSW Regional", state: "NSW", laborFactor: 0.88, materialFactor: 1.08, remotenessCategory: "regional" },
  { region: "NSW Remote", state: "NSW", laborFactor: 0.85, materialFactor: 1.20, remotenessCategory: "remote" },
  // VIC
  { region: "Melbourne Metro", state: "VIC", laborFactor: 0.98, materialFactor: 0.98, remotenessCategory: "metro" },
  { region: "Geelong", state: "VIC", laborFactor: 0.94, materialFactor: 1.00, remotenessCategory: "metro" },
  { region: "VIC Regional", state: "VIC", laborFactor: 0.88, materialFactor: 1.05, remotenessCategory: "regional" },
  // QLD
  { region: "Brisbane Metro", state: "QLD", laborFactor: 0.95, materialFactor: 0.95, remotenessCategory: "metro" },
  { region: "Gold Coast", state: "QLD", laborFactor: 0.93, materialFactor: 0.97, remotenessCategory: "metro" },
  { region: "Sunshine Coast", state: "QLD", laborFactor: 0.92, materialFactor: 0.98, remotenessCategory: "metro" },
  { region: "QLD Regional", state: "QLD", laborFactor: 0.85, materialFactor: 1.10, remotenessCategory: "regional" },
  { region: "QLD Remote/North", state: "QLD", laborFactor: 0.90, materialFactor: 1.25, remotenessCategory: "remote" },
  // WA
  { region: "Perth Metro", state: "WA", laborFactor: 1.05, materialFactor: 1.05, remotenessCategory: "metro" },
  { region: "WA Regional", state: "WA", laborFactor: 1.00, materialFactor: 1.15, remotenessCategory: "regional" },
  { region: "WA Remote/Pilbara", state: "WA", laborFactor: 1.20, materialFactor: 1.40, remotenessCategory: "remote" },
  // SA
  { region: "Adelaide Metro", state: "SA", laborFactor: 0.92, materialFactor: 0.95, remotenessCategory: "metro" },
  { region: "SA Regional", state: "SA", laborFactor: 0.85, materialFactor: 1.08, remotenessCategory: "regional" },
  // TAS
  { region: "Hobart", state: "TAS", laborFactor: 0.90, materialFactor: 1.05, remotenessCategory: "metro" },
  { region: "TAS Regional", state: "TAS", laborFactor: 0.85, materialFactor: 1.12, remotenessCategory: "regional" },
  // NT
  { region: "Darwin", state: "NT", laborFactor: 1.15, materialFactor: 1.20, remotenessCategory: "metro" },
  { region: "NT Remote", state: "NT", laborFactor: 1.25, materialFactor: 1.50, remotenessCategory: "remote" },
  // ACT
  { region: "Canberra", state: "ACT", laborFactor: 1.02, materialFactor: 1.02, remotenessCategory: "metro" }
];

// ============================================================================
// ROOFING PROJECT RATES (Per Square Metre)
// Source: Rawlinsons 2024, Industry Surveys
// ============================================================================

export interface ProjectRate {
  projectType: string;
  description: string;
  unit: string;
  laborRate: number; // cents
  materialRate: number; // cents
  totalRate: number; // cents
  complexity: "simple" | "standard" | "complex";
  notes: string;
}

export const ROOFING_PROJECT_RATES: ProjectRate[] = [
  // Re-roofing (remove and replace)
  {
    projectType: "Re-roof - Metal to Metal",
    description: "Remove existing metal roof and install new Colorbond",
    unit: "sqm",
    laborRate: 4500,
    materialRate: 5500,
    totalRate: 10000,
    complexity: "standard",
    notes: "Includes removal, disposal, sarking, new sheets and flashings"
  },
  {
    projectType: "Re-roof - Tiles to Metal",
    description: "Remove tile roof and install new Colorbond",
    unit: "sqm",
    laborRate: 6500,
    materialRate: 5500,
    totalRate: 12000,
    complexity: "complex",
    notes: "Includes tile removal, batten replacement, sarking, new sheets"
  },
  {
    projectType: "Re-roof - Asbestos to Metal",
    description: "Remove asbestos roof and install new Colorbond",
    unit: "sqm",
    laborRate: 8500,
    materialRate: 5500,
    totalRate: 14000,
    complexity: "complex",
    notes: "Includes licensed asbestos removal, disposal fees, new roof"
  },
  // New roof installation
  {
    projectType: "New Roof - Metal",
    description: "New Colorbond roof on new construction",
    unit: "sqm",
    laborRate: 3500,
    materialRate: 5500,
    totalRate: 9000,
    complexity: "standard",
    notes: "New installation on prepared frame"
  },
  {
    projectType: "New Roof - Tiles",
    description: "New concrete tile roof",
    unit: "sqm",
    laborRate: 4500,
    materialRate: 6500,
    totalRate: 11000,
    complexity: "standard",
    notes: "Includes battens, sarking, tiles, ridge capping"
  },
  // Repairs
  {
    projectType: "Roof Repair - Minor",
    description: "Patch repairs, replace damaged sheets",
    unit: "sqm",
    laborRate: 5500,
    materialRate: 3500,
    totalRate: 9000,
    complexity: "simple",
    notes: "Minimum charge typically $350-$500"
  },
  {
    projectType: "Roof Repair - Major",
    description: "Significant repairs, multiple areas",
    unit: "sqm",
    laborRate: 6500,
    materialRate: 4500,
    totalRate: 11000,
    complexity: "standard",
    notes: "May include structural repairs"
  },
  // Guttering
  {
    projectType: "Gutter Replacement",
    description: "Remove and replace gutters and downpipes",
    unit: "lm",
    laborRate: 3500,
    materialRate: 2500,
    totalRate: 6000,
    complexity: "simple",
    notes: "Per linear metre of gutter"
  },
  // Insulation
  {
    projectType: "Roof Insulation - Batts",
    description: "Install ceiling insulation batts",
    unit: "sqm",
    laborRate: 1500,
    materialRate: 2000,
    totalRate: 3500,
    complexity: "simple",
    notes: "R4.0 batts, standard installation"
  }
];

// ============================================================================
// MARKET RATE ENGINE FUNCTIONS
// ============================================================================

export interface PriceAnalysisResult {
  quotedPrice: number; // cents
  marketPrice: number; // cents
  variance: number; // percentage
  varianceAmount: number; // cents
  assessment: "below_market" | "fair" | "above_market" | "significantly_above";
  confidence: number; // 0-100
  breakdown: {
    labor: { quoted: number; market: number; variance: number };
    materials: { quoted: number; market: number; variance: number };
  };
  marketData: {
    source: string;
    sampleSize: number;
    region: string;
    lastUpdated: string;
  };
  recommendations: string[];
}

/**
 * Get regional adjustment factor for a location
 */
export function getRegionalFactor(state: string, isMetro: boolean = true): RegionalFactor {
  const searchRegion = isMetro ? `${state} Metro` : `${state} Regional`;
  
  // Try exact match first
  let factor = REGIONAL_FACTORS.find(r => 
    r.region.toLowerCase().includes(searchRegion.toLowerCase()) ||
    (r.state === state && r.remotenessCategory === (isMetro ? "metro" : "regional"))
  );
  
  // Fallback to state capital
  if (!factor) {
    factor = REGIONAL_FACTORS.find(r => r.state === state && r.remotenessCategory === "metro");
  }
  
  // Ultimate fallback to Sydney
  return factor || REGIONAL_FACTORS[0];
}

/**
 * Calculate market rate for a roofing project
 */
export function calculateRoofingMarketRate(
  projectType: string,
  area: number, // sqm
  state: string,
  isMetro: boolean = true
): { rate: number; breakdown: { labor: number; materials: number }; source: string } {
  const projectRate = ROOFING_PROJECT_RATES.find(r => 
    r.projectType.toLowerCase().includes(projectType.toLowerCase())
  ) || ROOFING_PROJECT_RATES[0]; // Default to re-roof metal to metal
  
  const regional = getRegionalFactor(state, isMetro);
  
  const adjustedLabor = Math.round(projectRate.laborRate * regional.laborFactor);
  const adjustedMaterials = Math.round(projectRate.materialRate * regional.materialFactor);
  const totalRate = adjustedLabor + adjustedMaterials;
  
  return {
    rate: totalRate * area,
    breakdown: {
      labor: adjustedLabor * area,
      materials: adjustedMaterials * area
    },
    source: `Rawlinsons 2024 + ${regional.region} regional adjustment`
  };
}

/**
 * Get price benchmark from database
 */
export async function getPriceBenchmark(
  projectType: string,
  region: string
): Promise<{ avgCost: number; minCost: number; maxCost: number; sampleSize: number; confidence: number } | null> {
  try {
    const db = await getDb();
    if (!db) return null;
    
    const benchmark = await db
      .select()
      .from(priceBenchmarks)
      .where(
        and(
          sql`LOWER(${priceBenchmarks.projectType}) LIKE LOWER(${`%${projectType}%`})`,
          sql`LOWER(${priceBenchmarks.region}) LIKE LOWER(${`%${region}%`})`
        )
      )
      .limit(1);
    
    if (benchmark.length > 0) {
      return {
        avgCost: benchmark[0].avgCost,
        minCost: benchmark[0].minCost,
        maxCost: benchmark[0].maxCost,
        sampleSize: benchmark[0].sampleSize,
        confidence: benchmark[0].confidenceScore
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching price benchmark:", error);
    return null;
  }
}

/**
 * Analyze a quote price against market rates
 */
export async function analyzeQuotePrice(
  quotedPrice: number, // cents
  projectType: string,
  area: number, // sqm
  state: string,
  isMetro: boolean = true
): Promise<PriceAnalysisResult> {
  // Get database benchmark if available
  const benchmark = await getPriceBenchmark(projectType, state);
  
  // Calculate rate-based estimate
  const rateEstimate = calculateRoofingMarketRate(projectType, area, state, isMetro);
  
  // Use benchmark if available and has good sample size, otherwise use rate calculation
  let marketPrice: number;
  let confidence: number;
  let source: string;
  let sampleSize: number;
  
  if (benchmark && benchmark.sampleSize >= 30) {
    // Scale benchmark to project size (benchmarks are for typical project)
    const typicalArea = 150; // sqm - typical residential roof
    const scaleFactor = area / typicalArea;
    marketPrice = Math.round(benchmark.avgCost * scaleFactor);
    confidence = benchmark.confidence;
    source = `VENTURR VALDT Database (${benchmark.sampleSize} verified quotes)`;
    sampleSize = benchmark.sampleSize;
  } else {
    marketPrice = rateEstimate.rate;
    confidence = 75; // Lower confidence for rate-based estimates
    source = rateEstimate.source;
    sampleSize = 0;
  }
  
  // Calculate variance
  const varianceAmount = quotedPrice - marketPrice;
  const variance = (varianceAmount / marketPrice) * 100;
  
  // Determine assessment
  let assessment: PriceAnalysisResult["assessment"];
  if (variance < -10) {
    assessment = "below_market";
  } else if (variance <= 15) {
    assessment = "fair";
  } else if (variance <= 30) {
    assessment = "above_market";
  } else {
    assessment = "significantly_above";
  }
  
  // Generate recommendations
  const recommendations: string[] = [];
  
  if (assessment === "significantly_above") {
    recommendations.push(
      "Quote is significantly above market rate. Request itemized breakdown.",
      "Consider getting 2-3 additional quotes for comparison.",
      "Ask contractor to justify premium pricing with specific value-adds."
    );
  } else if (assessment === "above_market") {
    recommendations.push(
      "Quote is above average market rate.",
      "Review scope to ensure no unnecessary items included.",
      "Negotiate on non-essential items if budget is a concern."
    );
  } else if (assessment === "below_market") {
    recommendations.push(
      "Quote is below market rate - verify scope is complete.",
      "Confirm all necessary items are included (flashings, sarking, etc.).",
      "Check contractor credentials and warranty terms carefully."
    );
  } else {
    recommendations.push(
      "Quote is within fair market range.",
      "Verify all scope items match your requirements.",
      "Review warranty terms and payment schedule."
    );
  }
  
  return {
    quotedPrice,
    marketPrice,
    variance: Math.round(variance * 10) / 10,
    varianceAmount,
    assessment,
    confidence,
    breakdown: {
      labor: {
        quoted: Math.round(quotedPrice * 0.45), // Estimate 45% labor
        market: rateEstimate.breakdown.labor,
        variance: 0 // Would need itemized quote to calculate
      },
      materials: {
        quoted: Math.round(quotedPrice * 0.55), // Estimate 55% materials
        market: rateEstimate.breakdown.materials,
        variance: 0
      }
    },
    marketData: {
      source,
      sampleSize,
      region: `${state} ${isMetro ? "Metro" : "Regional"}`,
      lastUpdated: new Date().toISOString().split("T")[0]
    },
    recommendations
  };
}

/**
 * Get labor rate for a specific trade
 */
export function getLaborRate(trade: string): LaborRate | null {
  return LABOR_RATES.find(r => 
    r.trade.toLowerCase().includes(trade.toLowerCase())
  ) || null;
}

/**
 * Get material cost for a specific item
 */
export function getMaterialCost(item: string): MaterialCost | null {
  return ROOFING_MATERIALS.find(m => 
    m.item.toLowerCase().includes(item.toLowerCase())
  ) || null;
}

// ============================================================================
// EXPORT ENGINE
// ============================================================================

export const MARKET_RATE_ENGINE = {
  laborRates: LABOR_RATES,
  materials: ROOFING_MATERIALS,
  regionalFactors: REGIONAL_FACTORS,
  projectRates: ROOFING_PROJECT_RATES,
  getRegionalFactor,
  calculateRoofingMarketRate,
  getPriceBenchmark,
  analyzeQuotePrice,
  getLaborRate,
  getMaterialCost
};
