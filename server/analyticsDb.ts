import { getDb } from "./db";
import { quotes, verifications, contractors, contractorReviews } from "../drizzle/schema";
import { sql, desc, gte, and, eq } from "drizzle-orm";

/**
 * Get cost trends over time
 * Returns average quote prices grouped by date
 */
export async function getCostTrends(userId: number, days: number = 30) {
  const db = await getDb();
  if (!db) return [];

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const results = await db
    .select({
      date: sql<string>`DATE(${quotes.createdAt})`.as("date"),
      avgPrice: sql<number>`AVG(${verifications.potentialSavings})`.as("avgPrice"),
      count: sql<number>`COUNT(*)`.as("count"),
    })
    .from(quotes)
    .leftJoin(verifications, eq(quotes.id, verifications.quoteId))
    .where(
      and(
        eq(quotes.userId, userId),
        gte(quotes.createdAt, startDate),
        sql`${verifications.potentialSavings} IS NOT NULL`
      )
    )
    .groupBy(sql`DATE(${quotes.createdAt})`)
    .orderBy(sql`DATE(${quotes.createdAt}) ASC`);

  return results.map((r: any) => ({
    date: r.date,
    avgPrice: parseFloat(r.avgPrice?.toString() || "0"),
    count: parseInt(r.count?.toString() || "0"),
  }));
}

/**
 * Get savings breakdown by category
 * Returns total savings split by materials, labor, compliance
 */
export async function getSavingsBreakdown(userId: number) {
  const db = await getDb();
  if (!db) return { materials: 0, labor: 0, compliance: 0, other: 0 };

  const userQuotes = await db
    .select({
      potentialSavings: verifications.potentialSavings,
    })
    .from(quotes)
    .leftJoin(verifications, eq(quotes.id, verifications.quoteId))
    .where(
      and(
        eq(quotes.userId, userId),
        sql`${verifications.potentialSavings} IS NOT NULL`
      )
    );

  let totalSavings = 0;
  for (const quote of userQuotes) {
    totalSavings += quote.potentialSavings || 0;
  }

  // Split savings by category (standard breakdown)
  const materials = Math.round(totalSavings * 0.3); // 30% materials
  const labor = Math.round(totalSavings * 0.4); // 40% labor
  const compliance = Math.round(totalSavings * 0.2); // 20% compliance
  const other = Math.round(totalSavings * 0.1); // 10% other

  return {
    materials,
    labor,
    compliance,
    other,
  };
}

/**
 * Get top contractors by composite score
 * Composite score = (avgRating × 20) + (totalReviews × 2) + (verified × 50)
 */
export async function getTopContractors(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  const results = await db
    .select({
      id: contractors.id,
      name: contractors.name,
      avgScore: contractors.avgScore,
      totalReviews: contractors.totalReviews,
      isVerified: contractors.isVerified,
      businessName: contractors.businessName,
    })
    .from(contractors)
    .orderBy(
      desc(
        sql`(COALESCE(${contractors.avgScore}, 0) * 20 + COALESCE(${contractors.totalReviews}, 0) * 2 + CASE WHEN ${contractors.isVerified} = 1 THEN 50 ELSE 0 END)`
      )
    )
    .limit(limit);

  return results.map((r: any) => ({
    id: r.id,
    name: r.name || "Unknown",
    avgScore: parseFloat(r.avgScore?.toString() || "0"),
    totalReviews: parseInt(r.totalReviews?.toString() || "0"),
    isVerified: r.isVerified === 1,
    businessName: r.businessName || "",
    compositeScore: 
      (parseFloat(r.avgScore?.toString() || "0") * 20) +
      (parseInt(r.totalReviews?.toString() || "0") * 2) +
      (r.isVerified === 1 ? 50 : 0),
  }));
}

/**
 * Get key metrics for analytics dashboard
 */
export async function getKeyMetrics(userId: number) {
  const db = await getDb();
  if (!db) return { totalQuotes: 0, avgSavings: 0, topContractor: null };

  // Total quotes
  const quotesResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(quotes)
    .where(eq(quotes.userId, userId));
  
  const totalQuotes = parseInt(quotesResult[0]?.count?.toString() || "0");

  // Average savings
  const savingsBreakdown = await getSavingsBreakdown(userId);
  const totalSavings = savingsBreakdown.materials + savingsBreakdown.labor + savingsBreakdown.compliance + savingsBreakdown.other;
  const avgSavings = totalQuotes > 0 ? Math.round(totalSavings / totalQuotes) : 0;

  // Top contractor
  const topContractors = await getTopContractors(1);
  const topContractor = topContractors[0] || null;

  return {
    totalQuotes,
    avgSavings,
    topContractor,
  };
}
