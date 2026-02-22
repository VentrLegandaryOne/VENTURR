/**
 * Feedback Database Helpers
 * CRUD operations for beta feedback collection
 */

import { getDb } from "./db";
import { feedback, type Feedback, type InsertFeedback } from "../drizzle/schema";
import { eq, desc, and, sql, count } from "drizzle-orm";

export type FeedbackType = "bug" | "feature" | "improvement" | "general" | "praise";
export type FeedbackCategory = 
  | "quote_upload" 
  | "verification" 
  | "comparison" 
  | "market_rates" 
  | "credentials" 
  | "reports" 
  | "dashboard" 
  | "mobile" 
  | "performance" 
  | "other";
export type FeedbackStatus = "new" | "reviewing" | "in_progress" | "resolved" | "wont_fix";

export interface CreateFeedbackInput {
  userId?: number;
  type: FeedbackType;
  category: FeedbackCategory;
  title: string;
  description: string;
  rating?: number;
  pageUrl?: string;
  userAgent?: string;
  screenSize?: string;
  screenshotKey?: string;
  screenshotUrl?: string;
}

/**
 * Create a new feedback entry
 */
export async function createFeedback(input: CreateFeedbackInput): Promise<Feedback> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(feedback).values({
    userId: input.userId,
    type: input.type,
    category: input.category,
    title: input.title,
    description: input.description,
    rating: input.rating,
    pageUrl: input.pageUrl,
    userAgent: input.userAgent,
    screenSize: input.screenSize,
    screenshotKey: input.screenshotKey,
    screenshotUrl: input.screenshotUrl,
  });

  const insertedId = result[0].insertId;
  const [created] = await db.select().from(feedback).where(eq(feedback.id, insertedId));
  return created;
}

/**
 * Get all feedback entries (admin only)
 */
export async function getAllFeedback(options?: {
  status?: FeedbackStatus;
  type?: FeedbackType;
  category?: FeedbackCategory;
  limit?: number;
  offset?: number;
}): Promise<{ items: Feedback[]; total: number }> {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };
  
  const conditions = [];
  if (options?.status) {
    conditions.push(eq(feedback.status, options.status));
  }
  if (options?.type) {
    conditions.push(eq(feedback.type, options.type));
  }
  if (options?.category) {
    conditions.push(eq(feedback.category, options.category));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [items, [{ total }]] = await Promise.all([
    db
      .select()
      .from(feedback)
      .where(whereClause)
      .orderBy(desc(feedback.createdAt))
      .limit(options?.limit || 50)
      .offset(options?.offset || 0),
    db
      .select({ total: count() })
      .from(feedback)
      .where(whereClause),
  ]);

  return { items, total };
}

/**
 * Get feedback by ID
 */
export async function getFeedbackById(id: number): Promise<Feedback | null> {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.select().from(feedback).where(eq(feedback.id, id));
  return result || null;
}

/**
 * Get feedback by user ID
 */
export async function getFeedbackByUserId(userId: number): Promise<Feedback[]> {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(feedback)
    .where(eq(feedback.userId, userId))
    .orderBy(desc(feedback.createdAt));
}

/**
 * Update feedback status (admin only)
 */
export async function updateFeedbackStatus(
  id: number,
  status: FeedbackStatus,
  adminNotes?: string,
  resolvedBy?: number
): Promise<Feedback | null> {
  const db = await getDb();
  if (!db) return null;
  
  const updateData: Partial<InsertFeedback> = {
    status,
    adminNotes,
  };

  if (status === "resolved" || status === "wont_fix") {
    updateData.resolvedAt = new Date();
    updateData.resolvedBy = resolvedBy;
  }

  await db.update(feedback).set(updateData).where(eq(feedback.id, id));
  return getFeedbackById(id);
}

/**
 * Get feedback statistics
 */
export async function getFeedbackStats(): Promise<{
  total: number;
  byStatus: Record<FeedbackStatus, number>;
  byType: Record<FeedbackType, number>;
  byCategory: Record<FeedbackCategory, number>;
  avgRating: number | null;
}> {
  const db = await getDb();
  if (!db) {
    return {
      total: 0,
      byStatus: { new: 0, reviewing: 0, in_progress: 0, resolved: 0, wont_fix: 0 },
      byType: { bug: 0, feature: 0, improvement: 0, general: 0, praise: 0 },
      byCategory: { quote_upload: 0, verification: 0, comparison: 0, market_rates: 0, credentials: 0, reports: 0, dashboard: 0, mobile: 0, performance: 0, other: 0 },
      avgRating: null,
    };
  }

  const [totalResult] = await db.select({ total: count() }).from(feedback);
  
  const statusCounts = await db
    .select({ status: feedback.status, count: count() })
    .from(feedback)
    .groupBy(feedback.status);

  const typeCounts = await db
    .select({ type: feedback.type, count: count() })
    .from(feedback)
    .groupBy(feedback.type);

  const categoryCounts = await db
    .select({ category: feedback.category, count: count() })
    .from(feedback)
    .groupBy(feedback.category);

  const [avgResult] = await db
    .select({ avg: sql<number>`AVG(rating)` })
    .from(feedback)
    .where(sql`rating IS NOT NULL`);

  const byStatus: Record<FeedbackStatus, number> = {
    new: 0,
    reviewing: 0,
    in_progress: 0,
    resolved: 0,
    wont_fix: 0,
  };
  statusCounts.forEach((s) => {
    if (s.status) byStatus[s.status as FeedbackStatus] = s.count;
  });

  const byType: Record<FeedbackType, number> = {
    bug: 0,
    feature: 0,
    improvement: 0,
    general: 0,
    praise: 0,
  };
  typeCounts.forEach((t) => {
    if (t.type) byType[t.type as FeedbackType] = t.count;
  });

  const byCategory: Record<FeedbackCategory, number> = {
    quote_upload: 0,
    verification: 0,
    comparison: 0,
    market_rates: 0,
    credentials: 0,
    reports: 0,
    dashboard: 0,
    mobile: 0,
    performance: 0,
    other: 0,
  };
  categoryCounts.forEach((c) => {
    if (c.category) byCategory[c.category as FeedbackCategory] = c.count;
  });

  return {
    total: totalResult.total,
    byStatus,
    byType,
    byCategory,
    avgRating: avgResult?.avg || null,
  };
}

/**
 * Delete feedback (admin only)
 */
export async function deleteFeedback(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const result = await db.delete(feedback).where(eq(feedback.id, id));
  return result[0].affectedRows > 0;
}
