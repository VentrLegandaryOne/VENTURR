import { getDb } from "./db";
import { quoteTemplates } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export async function listTemplates(category?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  if (category) {
    return await db
      .select()
      .from(quoteTemplates)
      .where(eq(quoteTemplates.category, category))
      .orderBy(quoteTemplates.usageCount);
  }
  
  return await db
    .select()
    .from(quoteTemplates)
    .orderBy(quoteTemplates.category, quoteTemplates.name);
}

export async function getTemplateById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  const results = await db
    .select()
    .from(quoteTemplates)
    .where(eq(quoteTemplates.id, id))
    .limit(1);
  
  return results[0] || null;
}

export async function getTemplateCategories() {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  const results = await db
    .selectDistinct({ category: quoteTemplates.category })
    .from(quoteTemplates)
    .orderBy(quoteTemplates.category);
  
  return results.map((r: any) => r.category);
}

export async function createTemplate(data: {
  name: string;
  category: string;
  description: string;
  specifications: any;
  complianceRequirements: any;
  estimatedCost: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  const result = await db.insert(quoteTemplates).values({
    name: data.name,
    category: data.category,
    description: data.description,
    specifications: data.specifications,
    complianceRequirements: data.complianceRequirements,
    estimatedCost: data.estimatedCost,
    usageCount: 0,
  });
  
  return { id: Number((result as any).insertId) };
}

export async function deleteTemplate(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  await db.delete(quoteTemplates).where(eq(quoteTemplates.id, id));
  return { success: true };
}

export async function incrementTemplateUsage(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  const template = await getTemplateById(id);
  
  if (!template) {
    throw new Error("Template not found");
  }
  
  await db
    .update(quoteTemplates)
    .set({ usageCount: template.usageCount + 1 })
    .where(eq(quoteTemplates.id, id));
  
  return { success: true };
}

/**
 * Seed initial templates
 */
export async function seedTemplates(): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const existingTemplates = await listTemplates();
  if (existingTemplates.length > 0) {
    console.log("[Templates] Templates already seeded");
    return;
  }

  const templates = [
    {
      name: "Colorbond Roof Replacement",
      category: "Roofing",
      description: "Complete roof replacement with Colorbond steel roofing, including removal of existing roof, installation of new battens, and flashing.",
      specifications: {
        materials: ["Colorbond steel sheets", "Roof battens", "Flashing", "Ridge capping", "Screws and fixings"],
        dimensions: "Standard residential roof (150-200 sqm)",
        workmanship: "Licensed roofing contractor with 10+ years experience",
        duration: "5-7 working days",
        standards: ["AS 1562.1", "SA HB 39", "AS 1397"]
      },
      complianceRequirements: {
        buildingCode: "NCC 2022 Volume 2",
        standards: ["AS 1562.1 - Design and installation of sheet roof", "SA HB 39 - Installation code for metal roofing", "AS 1397 - Steel sheet and strip"],
        permits: "Building permit required for structural work",
        insurance: "Public liability insurance $20M minimum",
        licensing: "NSW Building License Class 1C or equivalent"
      },
      estimatedCost: 1500000
    },
    {
      name: "Kitchen Renovation - Full",
      category: "Kitchen",
      description: "Complete kitchen renovation including cabinetry, benchtops, appliances, plumbing, and electrical work.",
      specifications: {
        materials: ["Custom cabinetry", "Stone benchtops", "Stainless steel appliances", "Plumbing fixtures", "Electrical fittings"],
        dimensions: "Standard kitchen (12-15 sqm)",
        workmanship: "Licensed builder, plumber, and electrician",
        duration: "3-4 weeks",
        standards: ["AS/NZS 3000", "AS/NZS 3500", "AS 4386"]
      },
      complianceRequirements: {
        buildingCode: "NCC 2022 Volume 1",
        standards: ["AS/NZS 3000 - Electrical installations", "AS/NZS 3500 - Plumbing and drainage", "AS 4386 - Domestic kitchen assemblies"],
        permits: "Building permit, plumbing permit, electrical permit",
        insurance: "Public liability insurance $20M minimum",
        licensing: "NSW Building License, Plumbing License, Electrical License"
      },
      estimatedCost: 3500000
    },
    {
      name: "Timber Deck Construction",
      category: "Decking",
      description: "New timber deck construction with hardwood decking boards, treated pine frame, and stainless steel fixings.",
      specifications: {
        materials: ["Hardwood decking boards", "Treated pine frame", "Stainless steel screws", "Concrete footings", "Handrails"],
        dimensions: "Medium deck (20-30 sqm)",
        workmanship: "Licensed carpenter with decking experience",
        duration: "2-3 weeks",
        standards: ["AS 1684", "AS 3660", "AS 5604"]
      },
      complianceRequirements: {
        buildingCode: "NCC 2022 Volume 2",
        standards: ["AS 1684 - Residential timber-framed construction", "AS 3660 - Termite management", "AS 5604 - Timber - Natural durability ratings"],
        permits: "Building permit required if deck is over 1m high",
        insurance: "Public liability insurance $20M minimum",
        licensing: "NSW Building License Class 1C or equivalent"
      },
      estimatedCost: 1200000
    },
    {
      name: "Bathroom Renovation - Full",
      category: "Bathroom",
      description: "Complete bathroom renovation including waterproofing, tiling, fixtures, plumbing, and electrical work.",
      specifications: {
        materials: ["Waterproofing membrane", "Ceramic tiles", "Bathroom fixtures", "Vanity unit", "Shower screen"],
        dimensions: "Standard bathroom (6-8 sqm)",
        workmanship: "Licensed builder, plumber, and waterproofer",
        duration: "2-3 weeks",
        standards: ["AS 3740", "AS/NZS 3500", "AS/NZS 3000"]
      },
      complianceRequirements: {
        buildingCode: "NCC 2022 Volume 1",
        standards: ["AS 3740 - Waterproofing of domestic wet areas", "AS/NZS 3500 - Plumbing and drainage", "AS/NZS 3000 - Electrical installations"],
        permits: "Building permit, plumbing permit, waterproofing certificate",
        insurance: "Public liability insurance $20M minimum",
        licensing: "NSW Building License, Plumbing License, Waterproofing License"
      },
      estimatedCost: 2500000
    },
    {
      name: "Fence Installation - Colorbond",
      category: "Fencing",
      description: "New Colorbond fence installation with steel posts, concrete footings, and powder-coated panels.",
      specifications: {
        materials: ["Colorbond fence panels", "Steel posts", "Concrete", "Post caps", "Fixings"],
        dimensions: "Standard residential fence (30-40 linear meters)",
        workmanship: "Licensed fencing contractor",
        duration: "3-5 working days",
        standards: ["AS 2870", "AS 1397"]
      },
      complianceRequirements: {
        buildingCode: "NCC 2022 Volume 2",
        standards: ["AS 2870 - Residential slabs and footings", "AS 1397 - Steel sheet and strip"],
        permits: "Development consent may be required (check with council)",
        insurance: "Public liability insurance $10M minimum",
        licensing: "NSW Building License or Fencing License"
      },
      estimatedCost: 800000
    }
  ];

  for (const template of templates) {
    await createTemplate(template);
  }

  console.log(`[Templates] Seeded ${templates.length} templates`);
}
