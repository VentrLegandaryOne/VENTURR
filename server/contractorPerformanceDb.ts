import { getDb } from "./db";
import { contractorPerformanceMetrics, quotes, verifications, contractors } from "../drizzle/schema";
import type { InsertContractorPerformanceMetric } from "../drizzle/schema";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";

/**
 * Calculate and store contractor performance metrics for a time period
 */
export async function calculateContractorPerformance(
  contractorId: number,
  periodStart: Date,
  periodEnd: Date
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get all quotes for this contractor in the period
  const contractorQuotes = await db
    .select()
    .from(quotes)
    .where(
      and(
        sql`${quotes.id} IN (SELECT id FROM quotes WHERE contractor_name LIKE (SELECT name FROM contractors WHERE id = ${contractorId}))`,
        gte(quotes.createdAt, periodStart),
        lte(quotes.createdAt, periodEnd)
      )
    );

  // Get all verifications for these quotes
  const quoteIds = contractorQuotes.map((q: any) => q.id);
  const verificationsData = quoteIds.length > 0
    ? await db
        .select()
        .from(verifications)
        .where(sql`${verifications.quoteId} IN (${sql.join(quoteIds, sql`, `)})`)
    : [];

  // Calculate metrics
  const totalQuotes = contractorQuotes.length;
  const completedVerifications = verificationsData.filter((v: any) => v.status === "completed");
  
  // Compliance score: average of all verification scores
  const complianceScores = completedVerifications.map((v: any) => v.overallScore || 0);
  const avgComplianceScore = complianceScores.length > 0
    ? Math.round(complianceScores.reduce((a: number, b: number) => a + b, 0) / complianceScores.length)
    : 0;

  // Compliance issues count
  const complianceIssuesCount = completedVerifications.reduce((count: number, v: any) => {
    const issues = v.issues as any[];
    return count + (issues?.length || 0);
  }, 0);

  // Quote accuracy: calculate from verification scores
  const pricingScores = completedVerifications.map((v: any) => v.pricingScore || 0);
  const quoteAccuracyScore = pricingScores.length > 0
    ? Math.round(pricingScores.reduce((a: number, b: number) => a + b, 0) / pricingScores.length)
    : 0;

  // Response metrics: calculate from quote timestamps
  const responseTimesHours = contractorQuotes.map((q: any) => {
    if (q.createdAt && q.updatedAt) {
      return (new Date(q.updatedAt).getTime() - new Date(q.createdAt).getTime()) / (1000 * 60 * 60);
    }
    return 24; // Default if no timestamps
  });
  const averageResponseTime = responseTimesHours.length > 0
    ? Math.round(responseTimesHours.reduce((a, b) => a + b, 0) / responseTimesHours.length)
    : 0;
  const responseRate = totalQuotes > 0 ? Math.round((completedVerifications.length / totalQuotes) * 100) : 0;

  // Completion metrics: calculate from verification status
  const completedCount = completedVerifications.length;
  const completionRate = totalQuotes > 0 ? Math.round((completedCount / totalQuotes) * 100) : 0;
  const onTimeDeliveryRate = completionRate; // Use completion rate as proxy

  // Rating metrics: get from contractor reviews table
  const reviewsResult = await db
    .select()
    .from(sql`contractor_reviews`)
    .where(sql`contractor_id = ${contractorId}`);
  const reviews = reviewsResult as any[];
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? Math.round((reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / totalReviews) * 100)
    : 0;

  const metrics: InsertContractorPerformanceMetric = {
    contractorId,
    quoteAccuracyScore,
    averageVariance: 100 - quoteAccuracyScore, // Inverse of accuracy
    complianceScore: avgComplianceScore,
    complianceIssuesCount,
    averageResponseTime,
    responseRate,
    completionRate,
    onTimeDeliveryRate,
    averageRating,
    totalReviews,
    totalQuotesSubmitted: totalQuotes,
    totalProjectsCompleted: Math.floor(totalQuotes * (completionRate / 100)),
    periodStart,
    periodEnd,
  };

  // Insert or update metrics
  const [result] = await db
    .insert(contractorPerformanceMetrics)
    .values(metrics);

  return result;
}

/**
 * Get contractor performance metrics for a specific period
 */
export async function getContractorPerformance(
  contractorId: number,
  periodStart?: Date,
  periodEnd?: Date
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (periodStart && periodEnd) {
    return await db
      .select()
      .from(contractorPerformanceMetrics)
      .where(
        and(
          eq(contractorPerformanceMetrics.contractorId, contractorId),
          gte(contractorPerformanceMetrics.periodStart, periodStart),
          lte(contractorPerformanceMetrics.periodEnd, periodEnd)
        )
      )
      .orderBy(desc(contractorPerformanceMetrics.periodEnd));
  }

  return await db
    .select()
    .from(contractorPerformanceMetrics)
    .where(eq(contractorPerformanceMetrics.contractorId, contractorId))
    .orderBy(desc(contractorPerformanceMetrics.periodEnd));
}

/**
 * Get performance trends for a contractor over multiple periods
 */
export async function getContractorPerformanceTrends(contractorId: number, months: number = 6) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  return await db
    .select()
    .from(contractorPerformanceMetrics)
    .where(
      and(
        eq(contractorPerformanceMetrics.contractorId, contractorId),
        gte(contractorPerformanceMetrics.periodEnd, startDate),
        lte(contractorPerformanceMetrics.periodEnd, endDate)
      )
    )
    .orderBy(contractorPerformanceMetrics.periodEnd);
}

/**
 * Compare multiple contractors' performance
 */
export async function compareContractorsPerformance(contractorIds: number[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (contractorIds.length === 0) return [];

  // Get latest metrics for each contractor
  const metrics = await db
    .select()
    .from(contractorPerformanceMetrics)
    .where(sql`${contractorPerformanceMetrics.contractorId} IN (${sql.join(contractorIds, sql`, `)})`)
    .orderBy(desc(contractorPerformanceMetrics.periodEnd));

  // Group by contractor and get latest
  const latestMetrics = new Map();
  for (const metric of metrics) {
    if (!latestMetrics.has(metric.contractorId)) {
      latestMetrics.set(metric.contractorId, metric);
    }
  }

  return Array.from(latestMetrics.values());
}

/**
 * Get top performing contractors by specific metric
 */
export async function getTopContractorsByMetric(
  metric: "complianceScore" | "quoteAccuracyScore" | "completionRate" | "averageRating",
  limit: number = 10
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get latest metrics for all contractors
  const allMetrics = await db
    .select()
    .from(contractorPerformanceMetrics)
    .orderBy(desc(contractorPerformanceMetrics.periodEnd));

  // Group by contractor and get latest
  const latestMetrics = new Map();
  for (const m of allMetrics) {
    if (!latestMetrics.has(m.contractorId)) {
      latestMetrics.set(m.contractorId, m);
    }
  }

  // Sort by specified metric
  const sorted = Array.from(latestMetrics.values()).sort((a, b) => {
    return (b[metric] || 0) - (a[metric] || 0);
  });

  return sorted.slice(0, limit);
}
