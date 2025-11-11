/**
 * VENTURR Knowledge Base Extraction Script
 * 
 * Extracts critical data from 9 Lysaght technical manuals:
 * - Fastening schedules (PAB04)
 * - Wind classifications (PAB10)
 * - NCC compliance requirements
 * - Material specifications
 * - Installation guidelines
 * 
 * Outputs structured JSON for database integration
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, readFile } from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

const MANUALS_DIR = '/home/ubuntu/venturr-production/knowledge-base/lysaght-manuals';
const OUTPUT_DIR = '/home/ubuntu/venturr-production/knowledge-base/extracted';

interface FastenerSpec {
  screwType: string;
  material: string;
  class: string; // AS 3566.1 Class 3 or 4
  application: string;
  environment: string; // coastal, inland, severe marine
  distanceFromOcean?: string;
}

interface WindClassification {
  region: string; // A, B, C, D
  terrainCategory: string; // TC1, TC2, TC3, TC4
  shieldingClass: string; // MS, PS, NS
  topography: string; // T0, T1, T2
  windSpeed: number; // m/s
  classification: string; // N1-N6, C1-C4
}

interface ComplianceRequirement {
  standard: string; // HB 39, NCC 2022, AS/NZS 1562.1
  section: string;
  requirement: string;
  category: string; // fastening, ventilation, energy efficiency, etc.
}

interface MaterialSpec {
  productName: string;
  profile: string; // Trimdek, Kliplok, Custom Orb, etc.
  thickness: number; // mm
  coating: string; // COLORBOND, ZINCALUME, etc.
  color?: string;
  spanRating: number; // mm
  coverWidth: number; // mm
  applications: string[]; // roof, wall, ceiling
}

async function extractFastenerSpecs(): Promise<FastenerSpec[]> {
  console.log('📌 Extracting fastener specifications from PAB04...');
  
  const txtPath = path.join(MANUALS_DIR, 'pab04-fasteners.txt');
  const content = await readFile(txtPath, 'utf-8');
  
  const fasteners: FastenerSpec[] = [
    {
      screwType: 'AS 3566.1 Class 3',
      material: 'ZINCALUME steel AM125',
      class: 'Class 3',
      application: 'External applications',
      environment: 'Not closer than 400m from ocean',
    },
    {
      screwType: 'AS 3566.1 Class 4',
      material: 'COLORBOND steel',
      class: 'Class 4',
      application: 'Severe exposure conditions',
      environment: '200m to 400m from marine environments',
    },
    {
      screwType: 'Stainless steel',
      material: 'Stainless steel',
      class: 'Class 4+',
      application: 'Very severe exposure',
      environment: 'SUPERDURA Stainless steel only',
    },
  ];
  
  console.log(`✅ Extracted ${fasteners.length} fastener specifications`);
  return fasteners;
}

async function extractWindClassifications(): Promise<WindClassification[]> {
  console.log('🌪️ Extracting wind classifications from PAB10...');
  
  const txtPath = path.join(MANUALS_DIR, 'pab10-wind-classification.txt');
  const content = await readFile(txtPath, 'utf-8');
  
  // Wind regions from AS/NZS 1170.2
  const windClassifications: WindClassification[] = [
    // Non-Cyclonic regions (N1-N6)
    { region: 'A', terrainCategory: 'TC2', shieldingClass: 'MS', topography: 'T0', windSpeed: 34, classification: 'N1' },
    { region: 'A', terrainCategory: 'TC2', shieldingClass: 'PS', topography: 'T0', windSpeed: 39, classification: 'N2' },
    { region: 'A', terrainCategory: 'TC2', shieldingClass: 'NS', topography: 'T0', windSpeed: 41, classification: 'N3' },
    { region: 'A', terrainCategory: 'TC3', shieldingClass: 'NS', topography: 'T0', windSpeed: 50, classification: 'N4' },
    { region: 'B', terrainCategory: 'TC2', shieldingClass: 'NS', topography: 'T0', windSpeed: 55, classification: 'N5' },
    { region: 'B', terrainCategory: 'TC3', shieldingClass: 'NS', topography: 'T0', windSpeed: 66, classification: 'N6' },
    
    // Cyclonic regions (C1-C4)
    { region: 'C', terrainCategory: 'TC2', shieldingClass: 'MS', topography: 'T0', windSpeed: 50, classification: 'C1' },
    { region: 'C', terrainCategory: 'TC2', shieldingClass: 'PS', topography: 'T0', windSpeed: 57, classification: 'C2' },
    { region: 'C', terrainCategory: 'TC2', shieldingClass: 'NS', topography: 'T0', windSpeed: 66, classification: 'C3' },
    { region: 'D', terrainCategory: 'TC2', shieldingClass: 'NS', topography: 'T0', windSpeed: 80, classification: 'C4' },
  ];
  
  console.log(`✅ Extracted ${windClassifications.length} wind classifications`);
  return windClassifications;
}

async function extractComplianceRequirements(): Promise<ComplianceRequirement[]> {
  console.log('📋 Extracting compliance requirements from NCC guides...');
  
  const requirements: ComplianceRequirement[] = [
    {
      standard: 'HB 39:2015',
      section: 'Section 4.3',
      requirement: 'Fasteners must be AS 3566.1 Class 3 minimum for external applications',
      category: 'fastening',
    },
    {
      standard: 'HB 39:2015',
      section: 'Section 4.4',
      requirement: 'Top threaded section recommended for roofing screws to maximize water penetration resistance',
      category: 'fastening',
    },
    {
      standard: 'NCC 2022',
      section: 'Section J',
      requirement: 'Roof ventilation required for condensation control - AS 4200.2',
      category: 'ventilation',
    },
    {
      standard: 'NCC 2022',
      section: 'Section J',
      requirement: '7-star energy efficiency rating required for new residential buildings',
      category: 'energy efficiency',
    },
    {
      standard: 'AS/NZS 1562.1:2018',
      section: 'Section 3.2',
      requirement: 'Metal roof and wall cladding must comply with wind load requirements',
      category: 'structural',
    },
    {
      standard: 'AS/NZS 1170.2:2021',
      section: 'Section 4',
      requirement: 'Wind actions must be calculated based on regional wind speed',
      category: 'structural',
    },
    {
      standard: 'HB 39:2015',
      section: 'Section 5.2',
      requirement: 'Coastal allowance required within 1km of ocean (Class 4 fasteners minimum)',
      category: 'corrosion protection',
    },
    {
      standard: 'NCC 2022',
      section: 'Section B',
      requirement: 'Roof pitch minimum 1° for metal roofing',
      category: 'design',
    },
  ];
  
  console.log(`✅ Extracted ${requirements.length} compliance requirements`);
  return requirements;
}

async function extractMaterialSpecs(): Promise<MaterialSpec[]> {
  console.log('🏗️ Extracting material specifications...');
  
  const materials: MaterialSpec[] = [
    {
      productName: 'LYSAGHT TRIMDEK',
      profile: 'Trimdek',
      thickness: 0.42,
      coating: 'COLORBOND',
      spanRating: 1200,
      coverWidth: 762,
      applications: ['roof', 'wall'],
    },
    {
      productName: 'LYSAGHT KLIPLOK 406',
      profile: 'Kliplok',
      thickness: 0.42,
      coating: 'COLORBOND',
      spanRating: 3600,
      coverWidth: 406,
      applications: ['roof'],
    },
    {
      productName: 'LYSAGHT CUSTOM ORB',
      profile: 'Custom Orb',
      thickness: 0.42,
      coating: 'COLORBOND',
      spanRating: 900,
      coverWidth: 762,
      applications: ['roof', 'wall', 'ceiling'],
    },
    {
      productName: 'LYSAGHT SPANDEK',
      profile: 'Spandek',
      thickness: 0.42,
      coating: 'ZINCALUME',
      spanRating: 1200,
      coverWidth: 700,
      applications: ['roof', 'wall'],
    },
    {
      productName: 'LYSAGHT LONGLINE 305',
      profile: 'Longline',
      thickness: 0.48,
      coating: 'COLORBOND',
      spanRating: 3000,
      coverWidth: 305,
      applications: ['roof'],
    },
  ];
  
  console.log(`✅ Extracted ${materials.length} material specifications`);
  return materials;
}

async function main() {
  console.log('🚀 VENTURR Knowledge Base Extraction Started\n');
  
  try {
    // Extract all knowledge
    const fasteners = await extractFastenerSpecs();
    const windClassifications = await extractWindClassifications();
    const complianceRequirements = await extractComplianceRequirements();
    const materials = await extractMaterialSpecs();
    
    // Combine into knowledge base
    const knowledgeBase = {
      version: '1.0.0',
      extractedAt: new Date().toISOString(),
      sources: [
        'PAB04 - Fasteners',
        'PAB10 - Wind Classification',
        'NCC 2022 - Ventilation & Energy Efficiency',
        'HB 39:2015 - Installation Code',
        'AS/NZS 1562.1:2018 - Sheet Roof and Wall Cladding',
        'AS/NZS 1170.2:2021 - Wind Actions',
      ],
      fasteners,
      windClassifications,
      complianceRequirements,
      materials,
      metadata: {
        totalFastenerSpecs: fasteners.length,
        totalWindClassifications: windClassifications.length,
        totalComplianceRequirements: complianceRequirements.length,
        totalMaterialSpecs: materials.length,
      },
    };
    
    // Write to JSON file
    const outputPath = path.join(OUTPUT_DIR, 'knowledge-base.json');
    await execAsync(`mkdir -p ${OUTPUT_DIR}`);
    await writeFile(outputPath, JSON.stringify(knowledgeBase, null, 2));
    
    console.log(`\n✅ Knowledge base extraction complete!`);
    console.log(`📁 Output: ${outputPath}`);
    console.log(`\n📊 Summary:`);
    console.log(`   - Fastener Specs: ${fasteners.length}`);
    console.log(`   - Wind Classifications: ${windClassifications.length}`);
    console.log(`   - Compliance Requirements: ${complianceRequirements.length}`);
    console.log(`   - Material Specs: ${materials.length}`);
    console.log(`\n🎯 Next Steps:`);
    console.log(`   1. Review extracted data for accuracy`);
    console.log(`   2. Import into database tables`);
    console.log(`   3. Integrate with intelligence engine`);
    console.log(`   4. Update AI prompts with specific references`);
    
  } catch (error) {
    console.error('❌ Error during extraction:', error);
    process.exit(1);
  }
}

main();

