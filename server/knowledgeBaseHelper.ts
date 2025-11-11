/**
 * Knowledge Base Helper
 * 
 * Query functions for accessing VENTURR knowledge base (Lysaght manuals, Australian standards)
 */

import { eq } from 'drizzle-orm';
import { getDb } from './db';
import {
  fasteners,
  windClassifications,
  complianceRequirements,
  materialSpecs,
  type Fastener,
  type WindClassification,
  type ComplianceRequirement,
  type MaterialSpec,
} from '../drizzle/schema';

/**
 * Get recommended fastener based on distance from ocean and exposure conditions
 */
export async function getRecommendedFastener(distanceFromOceanKm: number): Promise<Fastener | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    // Determine fastener class based on distance from ocean
    // < 0.2km: Class 4+ (Stainless steel)
    // 0.2-0.4km: Class 4 (COLORBOND steel)
    // > 0.4km: Class 3 (ZINCALUME steel)
    
    let targetClass: string;
    if (distanceFromOceanKm < 0.2) {
      targetClass = 'Class 4+';
    } else if (distanceFromOceanKm < 0.4) {
      targetClass = 'Class 4';
    } else {
      targetClass = 'Class 3';
    }

    const result = await db.select().from(fasteners).where(eq(fasteners.class, targetClass)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('[Knowledge Base] Error fetching fastener:', error);
    return null;
  }
}

/**
 * Get wind classification based on region and terrain
 */
export async function getWindClassification(
  region: 'A' | 'B' | 'C' | 'D',
  terrainCategory: string = 'TC2',
  shieldingClass: string = 'NS'
): Promise<WindClassification | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db
      .select()
      .from(windClassifications)
      .where(eq(windClassifications.region, region))
      .limit(1);
    
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('[Knowledge Base] Error fetching wind classification:', error);
    return null;
  }
}

/**
 * Get all compliance requirements for a specific category
 */
export async function getComplianceRequirements(category?: string): Promise<ComplianceRequirement[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    let query = db.select().from(complianceRequirements);
    
    if (category) {
      query = query.where(eq(complianceRequirements.category, category));
    }
    
    return await query;
  } catch (error) {
    console.error('[Knowledge Base] Error fetching compliance requirements:', error);
    return [];
  }
}

/**
 * Get material specifications by profile
 */
export async function getMaterialSpec(profile: string): Promise<MaterialSpec | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db
      .select()
      .from(materialSpecs)
      .where(eq(materialSpecs.profile, profile))
      .limit(1);
    
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('[Knowledge Base] Error fetching material spec:', error);
    return null;
  }
}

/**
 * Get all material specifications
 */
export async function getAllMaterialSpecs(): Promise<MaterialSpec[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(materialSpecs);
  } catch (error) {
    console.error('[Knowledge Base] Error fetching material specs:', error);
    return [];
  }
}

/**
 * Get compliance notes formatted for AI prompts
 */
export async function getFormattedComplianceNotes(): Promise<string> {
  const requirements = await getComplianceRequirements();
  
  if (requirements.length === 0) {
    return 'No specific compliance requirements found in knowledge base.';
  }

  const formatted = requirements.map(req => 
    `- ${req.standard} ${req.section}: ${req.requirement}`
  ).join('\n');

  return `Australian Standards Compliance Requirements:\n${formatted}`;
}

/**
 * Get fastener recommendation formatted for AI prompts
 */
export async function getFormattedFastenerRecommendation(distanceFromOceanKm: number): Promise<string> {
  const fastener = await getRecommendedFastener(distanceFromOceanKm);
  
  if (!fastener) {
    return 'Unable to determine fastener recommendation. Default to AS 3566.1 Class 3 minimum for external applications.';
  }

  return `Fastener Recommendation (${fastener.class}):
- Screw Type: ${fastener.screwType}
- Material: ${fastener.material}
- Application: ${fastener.application}
- Environment: ${fastener.environment}
- Distance from Ocean: ${distanceFromOceanKm}km`;
}

/**
 * Get wind classification formatted for AI prompts
 */
export async function getFormattedWindClassification(region: 'A' | 'B' | 'C' | 'D'): Promise<string> {
  const windClass = await getWindClassification(region);
  
  if (!windClass) {
    return `Wind Region ${region} - Unable to determine specific classification. Refer to AS/NZS 1170.2:2021 for wind actions.`;
  }

  return `Wind Classification: ${windClass.classification}
- Region: ${windClass.region}
- Terrain Category: ${windClass.terrainCategory}
- Shielding Class: ${windClass.shieldingClass}
- Wind Speed: ${windClass.windSpeed} m/s
- Topography: ${windClass.topography}`;
}

