/**
 * VENTURR VALDT - Trade Knowledge Base Database Seeder
 * 
 * Seeds the database with comprehensive trade industry best practices,
 * SOPs, and Australian Standards data
 */

import { getDb } from "./db";
import { sql } from "drizzle-orm";
import { 
  ELECTRICAL_BEST_PRACTICES,
  PLUMBING_BEST_PRACTICES,
  ROOFING_BEST_PRACTICES,
  BUILDING_BEST_PRACTICES,
  HVAC_BEST_PRACTICES,
  PAINTING_BEST_PRACTICES,
  TILING_BEST_PRACTICES,
  CONCRETING_BEST_PRACTICES,
  LANDSCAPING_BEST_PRACTICES,
  INDUSTRY_SOPS
} from "./tradeKnowledgeBase";

/**
 * Create trade_best_practices table if not exists
 */
async function createBestPracticesTable() {
  const db = await getDb();
  if (!db) return;

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS trade_best_practices (
      id INT AUTO_INCREMENT PRIMARY KEY,
      practice_id VARCHAR(64) NOT NULL UNIQUE,
      trade VARCHAR(32) NOT NULL,
      category VARCHAR(32) NOT NULL,
      title VARCHAR(256) NOT NULL,
      description TEXT NOT NULL,
      requirements JSON NOT NULL,
      standard_references JSON NOT NULL,
      safety_considerations JSON NOT NULL,
      quality_benchmarks JSON NOT NULL,
      common_defects JSON NOT NULL,
      warranty_coverage JSON NOT NULL,
      effective_date DATE NOT NULL,
      state VARCHAR(16) NOT NULL DEFAULT 'national',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_trade (trade),
      INDEX idx_category (category),
      INDEX idx_state (state)
    )
  `);

  console.log("[TradeKB] Created trade_best_practices table");
}

/**
 * Create industry_sops table if not exists
 */
async function createSOPsTable() {
  const db = await getDb();
  if (!db) return;

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS industry_sops (
      id INT AUTO_INCREMENT PRIMARY KEY,
      sop_id VARCHAR(64) NOT NULL UNIQUE,
      trade VARCHAR(32) NOT NULL,
      sop_type VARCHAR(32) NOT NULL,
      title VARCHAR(256) NOT NULL,
      purpose TEXT NOT NULL,
      scope TEXT NOT NULL,
      steps JSON NOT NULL,
      safety_requirements JSON NOT NULL,
      quality_checks JSON NOT NULL,
      documentation JSON NOT NULL,
      standard_references JSON NOT NULL,
      effective_date DATE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_trade (trade),
      INDEX idx_sop_type (sop_type)
    )
  `);

  console.log("[TradeKB] Created industry_sops table");
}

/**
 * Create safety_requirements table if not exists
 */
async function createSafetyRequirementsTable() {
  const db = await getDb();
  if (!db) return;

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS safety_requirements (
      id INT AUTO_INCREMENT PRIMARY KEY,
      requirement_id VARCHAR(64) NOT NULL UNIQUE,
      trade VARCHAR(32) NOT NULL,
      category VARCHAR(64) NOT NULL,
      title VARCHAR(256) NOT NULL,
      description TEXT NOT NULL,
      standard_reference VARCHAR(128),
      clause VARCHAR(64),
      state VARCHAR(16) NOT NULL DEFAULT 'national',
      severity VARCHAR(16) NOT NULL DEFAULT 'mandatory',
      effective_date DATE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_trade (trade),
      INDEX idx_category (category)
    )
  `);

  console.log("[TradeKB] Created safety_requirements table");
}

/**
 * Create material_specifications table if not exists
 */
async function createMaterialSpecificationsTable() {
  const db = await getDb();
  if (!db) return;

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS material_specifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      spec_id VARCHAR(64) NOT NULL UNIQUE,
      trade VARCHAR(32) NOT NULL,
      material_type VARCHAR(128) NOT NULL,
      specification TEXT NOT NULL,
      standard_reference VARCHAR(128) NOT NULL,
      minimum_requirements JSON,
      quality_grades JSON,
      suppliers JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_trade (trade),
      INDEX idx_material_type (material_type)
    )
  `);

  console.log("[TradeKB] Created material_specifications table");
}

/**
 * Create warranty_benchmarks table if not exists
 */
async function createWarrantyBenchmarksTable() {
  const db = await getDb();
  if (!db) return;

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS warranty_benchmarks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      benchmark_id VARCHAR(64) NOT NULL UNIQUE,
      trade VARCHAR(32) NOT NULL,
      item_type VARCHAR(128) NOT NULL,
      minimum_period VARCHAR(32) NOT NULL,
      industry_standard VARCHAR(32),
      coverage JSON NOT NULL,
      exclusions JSON,
      statutory_requirement TEXT,
      state VARCHAR(16) NOT NULL DEFAULT 'national',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_trade (trade),
      INDEX idx_item_type (item_type)
    )
  `);

  console.log("[TradeKB] Created warranty_benchmarks table");
}

/**
 * Seed best practices data
 */
async function seedBestPractices() {
  const db = await getDb();
  if (!db) return;

  const allPractices = [
    ...ELECTRICAL_BEST_PRACTICES,
    ...PLUMBING_BEST_PRACTICES,
    ...ROOFING_BEST_PRACTICES,
    ...BUILDING_BEST_PRACTICES,
    ...HVAC_BEST_PRACTICES,
    ...PAINTING_BEST_PRACTICES,
    ...TILING_BEST_PRACTICES,
    ...CONCRETING_BEST_PRACTICES,
    ...LANDSCAPING_BEST_PRACTICES
  ];

  let seeded = 0;
  for (const practice of allPractices) {
    try {
      await db.execute(sql`
        INSERT INTO trade_best_practices (
          practice_id, trade, category, title, description,
          requirements, standard_references, safety_considerations,
          quality_benchmarks, common_defects, warranty_coverage,
          effective_date, state
        ) VALUES (
          ${practice.id},
          ${practice.trade},
          ${practice.category},
          ${practice.title},
          ${practice.description},
          ${JSON.stringify(practice.requirements)},
          ${JSON.stringify(practice.standardReferences)},
          ${JSON.stringify(practice.safetyConsiderations)},
          ${JSON.stringify(practice.qualityBenchmarks)},
          ${JSON.stringify(practice.commonDefects)},
          ${JSON.stringify(practice.warrantyCoverage)},
          ${practice.effectiveDate},
          ${practice.state}
        )
        ON DUPLICATE KEY UPDATE
          title = VALUES(title),
          description = VALUES(description),
          requirements = VALUES(requirements),
          standard_references = VALUES(standard_references),
          safety_considerations = VALUES(safety_considerations),
          quality_benchmarks = VALUES(quality_benchmarks),
          common_defects = VALUES(common_defects),
          warranty_coverage = VALUES(warranty_coverage)
      `);
      seeded++;
    } catch (error) {
      console.error(`[TradeKB] Failed to seed practice ${practice.id}:`, error);
    }
  }

  console.log(`[TradeKB] Seeded ${seeded} best practices`);
}

/**
 * Seed SOPs data
 */
async function seedSOPs() {
  const db = await getDb();
  if (!db) return;

  let seeded = 0;
  for (const sop of INDUSTRY_SOPS) {
    try {
      await db.execute(sql`
        INSERT INTO industry_sops (
          sop_id, trade, sop_type, title, purpose, scope,
          steps, safety_requirements, quality_checks,
          documentation, standard_references, effective_date
        ) VALUES (
          ${sop.id},
          ${sop.trade},
          ${sop.sopType},
          ${sop.title},
          ${sop.purpose},
          ${sop.scope},
          ${JSON.stringify(sop.steps)},
          ${JSON.stringify(sop.safetyRequirements)},
          ${JSON.stringify(sop.qualityChecks)},
          ${JSON.stringify(sop.documentation)},
          ${JSON.stringify(sop.standardReferences)},
          ${sop.effectiveDate}
        )
        ON DUPLICATE KEY UPDATE
          title = VALUES(title),
          purpose = VALUES(purpose),
          scope = VALUES(scope),
          steps = VALUES(steps),
          safety_requirements = VALUES(safety_requirements),
          quality_checks = VALUES(quality_checks),
          documentation = VALUES(documentation)
      `);
      seeded++;
    } catch (error) {
      console.error(`[TradeKB] Failed to seed SOP ${sop.id}:`, error);
    }
  }

  console.log(`[TradeKB] Seeded ${seeded} SOPs`);
}

/**
 * Seed safety requirements data
 */
async function seedSafetyRequirements() {
  const db = await getDb();
  if (!db) return;

  const safetyRequirements = [
    // Electrical Safety
    {
      requirement_id: "SAFE-ELEC-001",
      trade: "electrical",
      category: "isolation",
      title: "Electrical Isolation Procedures",
      description: "All electrical work must be performed with circuits isolated and verified dead using appropriate testing equipment",
      standard_reference: "AS/NZS 3000:2018",
      clause: "Section 1.5.3",
      state: "national",
      severity: "mandatory",
      effective_date: "2019-01-01"
    },
    {
      requirement_id: "SAFE-ELEC-002",
      trade: "electrical",
      category: "rcd",
      title: "RCD Protection Requirements",
      description: "All socket outlets in domestic premises must be protected by RCDs with maximum 30mA rating",
      standard_reference: "AS/NZS 3000:2018",
      clause: "Section 2.6.3",
      state: "national",
      severity: "mandatory",
      effective_date: "2019-01-01"
    },
    // Plumbing Safety
    {
      requirement_id: "SAFE-PLMB-001",
      trade: "plumbing",
      category: "scalding",
      title: "Scalding Prevention",
      description: "Hot water delivery temperature must not exceed 50°C at sanitary fixtures to prevent scalding",
      standard_reference: "AS/NZS 3500.4:2021",
      clause: "Section 6.4",
      state: "national",
      severity: "mandatory",
      effective_date: "2021-01-01"
    },
    {
      requirement_id: "SAFE-PLMB-002",
      trade: "plumbing",
      category: "backflow",
      title: "Backflow Prevention",
      description: "Backflow prevention devices required based on hazard rating to protect drinking water supply",
      standard_reference: "AS/NZS 3500.1:2025",
      clause: "Section 4",
      state: "national",
      severity: "mandatory",
      effective_date: "2025-01-01"
    },
    // Roofing Safety
    {
      requirement_id: "SAFE-ROOF-001",
      trade: "roofing",
      category: "fall_prevention",
      title: "Fall Prevention Requirements",
      description: "Work at height above 2 metres requires fall prevention measures following hierarchy of controls",
      standard_reference: "SafeWork NSW WHS Regulation",
      clause: "Sections 78-80",
      state: "nsw",
      severity: "mandatory",
      effective_date: "2021-01-01"
    },
    {
      requirement_id: "SAFE-ROOF-002",
      trade: "roofing",
      category: "scaffolding",
      title: "Scaffolding Requirements",
      description: "Scaffolds over 4 metres require licensed scaffolder. Regular inspections mandatory",
      standard_reference: "SafeWork NSW Code of Practice",
      clause: "Section 4.2",
      state: "nsw",
      severity: "mandatory",
      effective_date: "2021-01-01"
    },
    // Building Safety
    {
      requirement_id: "SAFE-BLDG-001",
      trade: "building",
      category: "structural",
      title: "Temporary Bracing Requirements",
      description: "Temporary bracing must be installed during construction to prevent structural collapse",
      standard_reference: "AS 1684.2:2021",
      clause: "Section 8",
      state: "national",
      severity: "mandatory",
      effective_date: "2021-01-01"
    },
    // HVAC Safety
    {
      requirement_id: "SAFE-HVAC-001",
      trade: "hvac",
      category: "refrigerant",
      title: "Refrigerant Handling Certification",
      description: "Refrigerant handling requires ARC certification and compliance with handling regulations",
      standard_reference: "Ozone Protection and Synthetic Greenhouse Gas Management Act",
      clause: "Part 3",
      state: "national",
      severity: "mandatory",
      effective_date: "2020-01-01"
    },
    // General WHS
    {
      requirement_id: "SAFE-GEN-001",
      trade: "general",
      category: "swms",
      title: "Safe Work Method Statement Requirements",
      description: "SWMS required for all high-risk construction work including work at heights, excavation, and electrical work",
      standard_reference: "WHS Regulation 2017",
      clause: "Section 299",
      state: "national",
      severity: "mandatory",
      effective_date: "2017-01-01"
    }
  ];

  let seeded = 0;
  for (const req of safetyRequirements) {
    try {
      await db.execute(sql`
        INSERT INTO safety_requirements (
          requirement_id, trade, category, title, description,
          standard_reference, clause, state, severity, effective_date
        ) VALUES (
          ${req.requirement_id},
          ${req.trade},
          ${req.category},
          ${req.title},
          ${req.description},
          ${req.standard_reference},
          ${req.clause},
          ${req.state},
          ${req.severity},
          ${req.effective_date}
        )
        ON DUPLICATE KEY UPDATE
          title = VALUES(title),
          description = VALUES(description),
          standard_reference = VALUES(standard_reference)
      `);
      seeded++;
    } catch (error) {
      console.error(`[TradeKB] Failed to seed safety requirement ${req.requirement_id}:`, error);
    }
  }

  console.log(`[TradeKB] Seeded ${seeded} safety requirements`);
}

/**
 * Seed material specifications data
 */
async function seedMaterialSpecifications() {
  const db = await getDb();
  if (!db) return;

  const materialSpecs = [
    // Electrical Materials
    {
      spec_id: "MAT-ELEC-001",
      trade: "electrical",
      material_type: "Cable",
      specification: "TPS (Twin and Earth) cable for general power circuits",
      standard_reference: "AS/NZS 3008.1.1",
      minimum_requirements: { "2.5mm²": "20A circuits", "4mm²": "32A circuits", "6mm²": "40A circuits" },
      quality_grades: ["V-75", "V-90"],
      suppliers: ["Prysmian", "Olex", "Nexans"]
    },
    {
      spec_id: "MAT-ELEC-002",
      trade: "electrical",
      material_type: "RCD",
      specification: "Residual Current Device for personal protection",
      standard_reference: "AS/NZS 3190",
      minimum_requirements: { "rating": "30mA", "trip_time": "<300ms" },
      quality_grades: ["Type A", "Type AC", "Type B"],
      suppliers: ["Clipsal", "HPM", "Hager", "ABB"]
    },
    // Plumbing Materials
    {
      spec_id: "MAT-PLMB-001",
      trade: "plumbing",
      material_type: "Copper Pipe",
      specification: "Copper tube for water services",
      standard_reference: "AS 1432",
      minimum_requirements: { "Type_B": "above ground", "Type_C": "underground" },
      quality_grades: ["Type A", "Type B", "Type C"],
      suppliers: ["MM Kembla", "Crane Copper"]
    },
    {
      spec_id: "MAT-PLMB-002",
      trade: "plumbing",
      material_type: "PVC Pipe",
      specification: "uPVC pipe for drainage",
      standard_reference: "AS/NZS 1260",
      minimum_requirements: { "SN4": "light duty", "SN8": "standard", "SN16": "heavy duty" },
      quality_grades: ["SN4", "SN8", "SN16"],
      suppliers: ["Iplex", "Vinidex", "Holman"]
    },
    // Roofing Materials
    {
      spec_id: "MAT-ROOF-001",
      trade: "roofing",
      material_type: "Steel Sheet",
      specification: "Metallic-coated steel sheet for roofing",
      standard_reference: "AS 1397:2021",
      minimum_requirements: { "BMT": "0.42mm residential", "coating": "AM100 inland" },
      quality_grades: ["AM100", "AM150", "AM200"],
      suppliers: ["BlueScope", "Lysaght", "Metroll", "Stramit"]
    },
    {
      spec_id: "MAT-ROOF-002",
      trade: "roofing",
      material_type: "Fasteners",
      specification: "Roofing fasteners for metal roofing",
      standard_reference: "SA HB 39:2015",
      minimum_requirements: { "class_3": "inland Zincalume", "class_4": "Colorbond/coastal" },
      quality_grades: ["Class 3", "Class 4"],
      suppliers: ["Buildex", "ITW", "Hillman"]
    },
    // Building Materials
    {
      spec_id: "MAT-BLDG-001",
      trade: "building",
      material_type: "Structural Timber",
      specification: "Structural timber for framing",
      standard_reference: "AS 1684.2:2021",
      minimum_requirements: { "stress_grade": "MGP10 minimum", "treatment": "H2 interior" },
      quality_grades: ["MGP10", "MGP12", "MGP15", "F7", "F17"],
      suppliers: ["Carter Holt Harvey", "Hyne", "Wespine"]
    },
    {
      spec_id: "MAT-BLDG-002",
      trade: "building",
      material_type: "Concrete",
      specification: "Ready-mix concrete for residential construction",
      standard_reference: "AS 3600:2018",
      minimum_requirements: { "grade": "N20 minimum", "slump": "80mm typical" },
      quality_grades: ["N20", "N25", "N32", "N40"],
      suppliers: ["Boral", "Holcim", "Hanson"]
    },
    // Tiling Materials
    {
      spec_id: "MAT-TILE-001",
      trade: "tiling",
      material_type: "Waterproofing Membrane",
      specification: "Waterproofing membrane for wet areas",
      standard_reference: "AS 3740:2021",
      minimum_requirements: { "thickness": "1.5mm minimum", "bond": "class 2" },
      quality_grades: ["Class 1", "Class 2", "Class 3"],
      suppliers: ["Ardex", "Davco", "Mapei", "Laticrete"]
    }
  ];

  let seeded = 0;
  for (const spec of materialSpecs) {
    try {
      await db.execute(sql`
        INSERT INTO material_specifications (
          spec_id, trade, material_type, specification,
          standard_reference, minimum_requirements, quality_grades, suppliers
        ) VALUES (
          ${spec.spec_id},
          ${spec.trade},
          ${spec.material_type},
          ${spec.specification},
          ${spec.standard_reference},
          ${JSON.stringify(spec.minimum_requirements)},
          ${JSON.stringify(spec.quality_grades)},
          ${JSON.stringify(spec.suppliers)}
        )
        ON DUPLICATE KEY UPDATE
          specification = VALUES(specification),
          minimum_requirements = VALUES(minimum_requirements),
          quality_grades = VALUES(quality_grades)
      `);
      seeded++;
    } catch (error) {
      console.error(`[TradeKB] Failed to seed material spec ${spec.spec_id}:`, error);
    }
  }

  console.log(`[TradeKB] Seeded ${seeded} material specifications`);
}

/**
 * Seed warranty benchmarks data
 */
async function seedWarrantyBenchmarks() {
  const db = await getDb();
  if (!db) return;

  const warrantyBenchmarks = [
    // Electrical
    {
      benchmark_id: "WARR-ELEC-001",
      trade: "electrical",
      item_type: "Workmanship",
      minimum_period: "6 years",
      industry_standard: "6 years",
      coverage: ["Installation defects", "Compliance issues", "Material fitness"],
      exclusions: ["Customer damage", "Unauthorized modifications"],
      statutory_requirement: "Home Building Act 1989 (NSW) - 6 years structural",
      state: "nsw"
    },
    {
      benchmark_id: "WARR-ELEC-002",
      trade: "electrical",
      item_type: "Solar Panels",
      minimum_period: "10 years",
      industry_standard: "25 years performance",
      coverage: ["Manufacturing defects", "Performance degradation"],
      exclusions: ["Physical damage", "Improper installation"],
      statutory_requirement: "Australian Consumer Law guarantees",
      state: "national"
    },
    // Plumbing
    {
      benchmark_id: "WARR-PLMB-001",
      trade: "plumbing",
      item_type: "Workmanship",
      minimum_period: "6 years",
      industry_standard: "6 years",
      coverage: ["Installation defects", "Leak-free joints", "Compliance"],
      exclusions: ["Blockages from misuse", "Root intrusion"],
      statutory_requirement: "Home Building Act 1989 (NSW) - 6 years structural",
      state: "nsw"
    },
    {
      benchmark_id: "WARR-PLMB-002",
      trade: "plumbing",
      item_type: "Hot Water System",
      minimum_period: "5 years",
      industry_standard: "5-10 years",
      coverage: ["Tank integrity", "Heating element", "Thermostat"],
      exclusions: ["Scale buildup", "Anode replacement"],
      statutory_requirement: "Manufacturer warranty + ACL",
      state: "national"
    },
    // Roofing
    {
      benchmark_id: "WARR-ROOF-001",
      trade: "roofing",
      item_type: "Workmanship",
      minimum_period: "6 years",
      industry_standard: "7-10 years",
      coverage: ["Weatherproofing", "Fastener integrity", "Flashing"],
      exclusions: ["Storm damage", "Foot traffic damage"],
      statutory_requirement: "Home Building Act 1989 (NSW) - 6 years structural",
      state: "nsw"
    },
    {
      benchmark_id: "WARR-ROOF-002",
      trade: "roofing",
      item_type: "Colorbond Material",
      minimum_period: "10 years",
      industry_standard: "10yr perforation, 15yr peeling",
      coverage: ["Perforation by corrosion", "Peeling/flaking", "Blistering"],
      exclusions: ["Severe marine exposure", "Industrial pollution"],
      statutory_requirement: "BlueScope warranty terms",
      state: "national"
    },
    // Building
    {
      benchmark_id: "WARR-BLDG-001",
      trade: "building",
      item_type: "Structural Work",
      minimum_period: "6 years",
      industry_standard: "6 years",
      coverage: ["Structural integrity", "Foundation", "Framing"],
      exclusions: ["Ground movement", "Unauthorized modifications"],
      statutory_requirement: "Home Building Act 1989 (NSW) - 6 years structural",
      state: "nsw"
    },
    {
      benchmark_id: "WARR-BLDG-002",
      trade: "building",
      item_type: "Non-Structural Work",
      minimum_period: "2 years",
      industry_standard: "2 years",
      coverage: ["Finishes", "Fixtures", "Fittings"],
      exclusions: ["Normal wear", "Maintenance items"],
      statutory_requirement: "Home Building Act 1989 (NSW) - 2 years non-structural",
      state: "nsw"
    },
    // Painting
    {
      benchmark_id: "WARR-PAINT-001",
      trade: "painting",
      item_type: "Workmanship",
      minimum_period: "2 years",
      industry_standard: "2-5 years",
      coverage: ["Adhesion", "Coverage", "Finish quality"],
      exclusions: ["Fading from UV", "Normal wear"],
      statutory_requirement: "Home Building Act 1989 (NSW) - 2 years non-structural",
      state: "nsw"
    },
    // Tiling
    {
      benchmark_id: "WARR-TILE-001",
      trade: "tiling",
      item_type: "Wet Area Tiling",
      minimum_period: "6 years",
      industry_standard: "6 years",
      coverage: ["Waterproofing", "Tile adhesion", "Grout integrity"],
      exclusions: ["Grout discoloration", "Impact damage"],
      statutory_requirement: "Home Building Act 1989 (NSW) - 6 years structural (waterproofing)",
      state: "nsw"
    }
  ];

  let seeded = 0;
  for (const benchmark of warrantyBenchmarks) {
    try {
      await db.execute(sql`
        INSERT INTO warranty_benchmarks (
          benchmark_id, trade, item_type, minimum_period,
          industry_standard, coverage, exclusions,
          statutory_requirement, state
        ) VALUES (
          ${benchmark.benchmark_id},
          ${benchmark.trade},
          ${benchmark.item_type},
          ${benchmark.minimum_period},
          ${benchmark.industry_standard},
          ${JSON.stringify(benchmark.coverage)},
          ${JSON.stringify(benchmark.exclusions)},
          ${benchmark.statutory_requirement},
          ${benchmark.state}
        )
        ON DUPLICATE KEY UPDATE
          minimum_period = VALUES(minimum_period),
          industry_standard = VALUES(industry_standard),
          coverage = VALUES(coverage),
          exclusions = VALUES(exclusions)
      `);
      seeded++;
    } catch (error) {
      console.error(`[TradeKB] Failed to seed warranty benchmark ${benchmark.benchmark_id}:`, error);
    }
  }

  console.log(`[TradeKB] Seeded ${seeded} warranty benchmarks`);
}

/**
 * Main seeding function
 */
export async function seedTradeKnowledgeBase() {
  console.log("[TradeKB] Starting trade knowledge base seeding...");

  try {
    // Create tables
    await createBestPracticesTable();
    await createSOPsTable();
    await createSafetyRequirementsTable();
    await createMaterialSpecificationsTable();
    await createWarrantyBenchmarksTable();

    // Seed data
    await seedBestPractices();
    await seedSOPs();
    await seedSafetyRequirements();
    await seedMaterialSpecifications();
    await seedWarrantyBenchmarks();

    console.log("[TradeKB] Trade knowledge base seeding completed successfully!");
    return { success: true };
  } catch (error) {
    console.error("[TradeKB] Failed to seed trade knowledge base:", error);
    return { success: false, error };
  }
}

// Export for use in routers
export { seedTradeKnowledgeBase as runTradeKBSeeding };
