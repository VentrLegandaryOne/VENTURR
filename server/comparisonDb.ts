import { getDb } from "./db";
import { comparisonGroups, comparisonItems, quotes, verifications } from "../drizzle/schema";
import type { InsertComparisonGroup, InsertComparisonItem } from "../drizzle/schema";
import { eq, and, inArray } from "drizzle-orm";

/**
 * Create a new comparison group
 */
export async function createComparisonGroup(data: InsertComparisonGroup) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [group] = await db.insert(comparisonGroups).values(data);
  return group;
}

/**
 * Add a quote to a comparison group
 */
export async function addQuoteToComparison(data: InsertComparisonItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [item] = await db.insert(comparisonItems).values(data);
  return item;
}

/**
 * Get comparison group by ID with all quotes and verifications
 */
export async function getComparisonGroupById(groupId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [group] = await db
    .select()
    .from(comparisonGroups)
    .where(eq(comparisonGroups.id, groupId));

  if (!group) return null;

  // Get all comparison items for this group
  const items = await db
    .select()
    .from(comparisonItems)
    .where(eq(comparisonItems.groupId, groupId))
    .orderBy(comparisonItems.position);

  // Get quote IDs
  const quoteIds = items.map((item: any) => item.quoteId);

  if (quoteIds.length === 0) {
    return { ...group, items: [], quotes: [], verifications: [] };
  }

  // Get all quotes
  const quotesData = await db
    .select()
    .from(quotes)
    .where(inArray(quotes.id, quoteIds));

  // Get all verifications
  const verificationsData = await db
    .select()
    .from(verifications)
    .where(inArray(verifications.quoteId, quoteIds));

  return {
    ...group,
    items,
    quotes: quotesData,
    verifications: verificationsData,
  };
}

/**
 * Get all comparison groups for a user
 */
export async function getComparisonGroupsByUserId(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .select()
    .from(comparisonGroups)
    .where(eq(comparisonGroups.userId, userId))
    .orderBy(comparisonGroups.createdAt);
}

/**
 * Update comparison group recommendation
 */
export async function updateComparisonRecommendation(
  groupId: number,
  recommendation: any,
  status: "analyzing" | "completed"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(comparisonGroups)
    .set({ recommendation, status, updatedAt: new Date() })
    .where(eq(comparisonGroups.id, groupId));
}

/**
 * Delete comparison group and all items
 */
export async function deleteComparisonGroup(groupId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Delete items first
  await db.delete(comparisonItems).where(eq(comparisonItems.groupId, groupId));
  
  // Delete group
  await db.delete(comparisonGroups).where(eq(comparisonGroups.id, groupId));
}
