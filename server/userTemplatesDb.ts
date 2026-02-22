import { getDb } from "./db";
import { userTemplates, quotes, verifications } from "../drizzle/schema";
import type { InsertUserTemplate } from "../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

/**
 * Create a custom template from a verified quote
 */
export async function createTemplateFromQuote(
  userId: number,
  quoteId: number,
  name: string,
  description?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get quote details
  const [quote] = await db
    .select()
    .from(quotes)
    .where(and(eq(quotes.id, quoteId), eq(quotes.userId, userId)))
    .limit(1);

  if (!quote) {
    throw new Error("Quote not found or access denied");
  }

  // Get verification details for compliance requirements
  const [verification] = await db
    .select()
    .from(verifications)
    .where(eq(verifications.quoteId, quoteId))
    .limit(1);

  if (!verification || verification.overallScore < 70) {
    throw new Error("Quote must have a verification score of 70+ to create a template");
  }

  const extractedData = quote.extractedData as any;
  
  // Create template
  const template: InsertUserTemplate = {
    userId,
    name,
    description: description || `Template created from quote ${quote.fileName}`,
    category: "Custom", // User can edit this later
    sourceQuoteId: quoteId,
    specifications: {
      materials: "Based on verified quote",
      workmanship: "Professional standards",
      duration: "As per quote",
      standards: ["NCC 2022", "AS 1562.1"],
    },
    complianceRequirements: {
      buildingCode: "NCC 2022",
      standards: ["AS 1562.1", "AS 1397"],
      permits: "Required as per local council",
      insurance: "Public liability $20M minimum",
      licensing: "Licensed contractor required",
    },
    estimatedCost: extractedData?.totalAmount || 0,
    usageCount: 0,
    isPublic: false,
  };

  const [result] = await db.insert(userTemplates).values(template);
  return result;
}

/**
 * Get user's custom templates
 */
export async function getUserTemplates(userId: number, category?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (category) {
    return await db
      .select()
      .from(userTemplates)
      .where(and(eq(userTemplates.userId, userId), eq(userTemplates.category, category)))
      .orderBy(desc(userTemplates.createdAt));
  }

  return await db
    .select()
    .from(userTemplates)
    .where(eq(userTemplates.userId, userId))
    .orderBy(desc(userTemplates.createdAt));
}

/**
 * Get template by ID
 */
export async function getUserTemplateById(templateId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [template] = await db
    .select()
    .from(userTemplates)
    .where(and(eq(userTemplates.id, templateId), eq(userTemplates.userId, userId)))
    .limit(1);

  return template;
}

/**
 * Update user template
 */
export async function updateUserTemplate(
  templateId: number,
  userId: number,
  updates: Partial<InsertUserTemplate>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(userTemplates)
    .set(updates)
    .where(and(eq(userTemplates.id, templateId), eq(userTemplates.userId, userId)));

  return { success: true };
}

/**
 * Delete user template
 */
export async function deleteUserTemplate(templateId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .delete(userTemplates)
    .where(and(eq(userTemplates.id, templateId), eq(userTemplates.userId, userId)));

  return { success: true };
}

/**
 * Increment template usage count
 */
export async function incrementTemplateUsage(templateId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(userTemplates)
    .set({ usageCount: (userTemplates.usageCount as any) + 1 })
    .where(eq(userTemplates.id, templateId));

  return { success: true };
}

/**
 * Get public templates (shared by other users)
 */
export async function getPublicTemplates(category?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (category) {
    return await db
      .select()
      .from(userTemplates)
      .where(and(eq(userTemplates.isPublic, true), eq(userTemplates.category, category)))
      .orderBy(desc(userTemplates.usageCount));
  }

  return await db
    .select()
    .from(userTemplates)
    .where(eq(userTemplates.isPublic, true))
    .orderBy(desc(userTemplates.usageCount));
}
