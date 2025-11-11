/**
 * VENTURR Knowledge Base Seeding Script
 * 
 * Populates database tables with extracted knowledge from Lysaght manuals:
 * - Fastener specifications (PAB04)
 * - Wind classifications (PAB10)
 * - Compliance requirements (HB 39, NCC 2022, AS/NZS)
 * - Material specifications (Lysaght catalogs)
 */

import { drizzle } from 'drizzle-orm/mysql2';
import { readFile } from 'fs/promises';
import { nanoid } from 'nanoid';
import {
  fasteners,
  windClassifications,
  complianceRequirements,
  materialSpecs,
} from '../drizzle/schema';

async function main() {
  console.log('🌱 VENTURR Knowledge Base Seeding Started\n');
  
  // Read extracted knowledge base
  const knowledgeBasePath = '/home/ubuntu/venturr-production/knowledge-base/extracted/knowledge-base.json';
  const knowledgeBaseJson = await readFile(knowledgeBasePath, 'utf-8');
  const knowledgeBase = JSON.parse(knowledgeBaseJson);
  
  console.log(`📚 Loaded knowledge base v${knowledgeBase.version}`);
  console.log(`📅 Extracted at: ${knowledgeBase.extractedAt}\n`);
  
  // Connect to database
  const db = drizzle(process.env.DATABASE_URL!);
  
  try {
    // Seed fasteners
    console.log('📌 Seeding fastener specifications...');
    for (const fastener of knowledgeBase.fasteners) {
      await db.insert(fasteners).values({
        id: nanoid(),
        screwType: fastener.screwType,
        material: fastener.material,
        class: fastener.class,
        application: fastener.application,
        environment: fastener.environment,
        distanceFromOcean: fastener.distanceFromOcean || null,
      });
    }
    console.log(`✅ Seeded ${knowledgeBase.fasteners.length} fastener specs\n`);
    
    // Seed wind classifications
    console.log('🌪️ Seeding wind classifications...');
    for (const windClass of knowledgeBase.windClassifications) {
      await db.insert(windClassifications).values({
        id: nanoid(),
        region: windClass.region,
        terrainCategory: windClass.terrainCategory,
        shieldingClass: windClass.shieldingClass,
        topography: windClass.topography,
        windSpeed: windClass.windSpeed,
        classification: windClass.classification,
      });
    }
    console.log(`✅ Seeded ${knowledgeBase.windClassifications.length} wind classifications\n`);
    
    // Seed compliance requirements
    console.log('📋 Seeding compliance requirements...');
    for (const requirement of knowledgeBase.complianceRequirements) {
      await db.insert(complianceRequirements).values({
        id: nanoid(),
        standard: requirement.standard,
        section: requirement.section,
        requirement: requirement.requirement,
        category: requirement.category,
      });
    }
    console.log(`✅ Seeded ${knowledgeBase.complianceRequirements.length} compliance requirements\n`);
    
    // Seed material specifications
    console.log('🏗️ Seeding material specifications...');
    for (const material of knowledgeBase.materials) {
      await db.insert(materialSpecs).values({
        id: nanoid(),
        productName: material.productName,
        profile: material.profile,
        thickness: material.thickness.toString(),
        coating: material.coating,
        color: material.color || null,
        spanRating: material.spanRating,
        coverWidth: material.coverWidth,
        applications: JSON.stringify(material.applications),
      });
    }
    console.log(`✅ Seeded ${knowledgeBase.materials.length} material specs\n`);
    
    console.log('🎉 Knowledge base seeding complete!');
    console.log('\n📊 Summary:');
    console.log(`   - Fasteners: ${knowledgeBase.fasteners.length} records`);
    console.log(`   - Wind Classifications: ${knowledgeBase.windClassifications.length} records`);
    console.log(`   - Compliance Requirements: ${knowledgeBase.complianceRequirements.length} records`);
    console.log(`   - Material Specs: ${knowledgeBase.materials.length} records`);
    console.log(`\n🎯 Next Steps:`);
    console.log(`   1. Query knowledge base in intelligence engine`);
    console.log(`   2. Reference specific standards in AI prompts`);
    console.log(`   3. Build compliance validation logic`);
    console.log(`   4. Create material recommendation system`);
    
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
}

main();

