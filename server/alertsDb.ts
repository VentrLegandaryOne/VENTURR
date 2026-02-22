import { getDb } from "./db";
import { comparisonAlerts, comparisonGroups, comparisonItems, quotes } from "../drizzle/schema";
import type { InsertComparisonAlert } from "../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { notifyOwner } from "./_core/notification";

/**
 * Detect pricing outliers in a comparison group (20%+ variance from median)
 */
export async function detectPricingOutliers(comparisonGroupId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get all quotes in the comparison
  const items = await db
    .select()
    .from(comparisonItems)
    .leftJoin(quotes, eq(comparisonItems.quoteId, quotes.id))
    .where(eq(comparisonItems.groupId, comparisonGroupId));

  if (items.length < 2) return null; // Need at least 2 quotes to compare

  // Calculate median price
  const prices = items
    .map((item) => {
      const extractedData = item.quotes?.extractedData as any;
      return extractedData?.totalAmount || 0;
    })
    .filter((p) => p > 0)
    .sort((a, b) => a - b);

  if (prices.length === 0) return null;

  const median = prices[Math.floor(prices.length / 2)];
  const outliers: any[] = [];

  // Find quotes with 20%+ variance from median
  for (const item of items) {
    const extractedData = item.quotes?.extractedData as any;
    const price = extractedData?.totalAmount || 0;
    if (price === 0) continue;

    const variance = Math.abs((price - median) / median) * 100;
    if (variance >= 20) {
      outliers.push({
        quoteId: item.quotes?.id,
        contractorName: extractedData?.contractor || "Unknown",
        price,
        variance: Math.round(variance),
      });
    }
  }

  if (outliers.length === 0) return null;

  // Create alert
  const severity = outliers.some((o: any) => o.variance >= 50) ? "high" : "medium";
  const alert: InsertComparisonAlert = {
    userId,
    comparisonGroupId,
    alertType: "pricing_outlier",
    severity,
    title: `${outliers.length} Pricing Outlier${outliers.length > 1 ? "s" : ""} Detected`,
    message: `Found ${outliers.length} quote(s) with pricing that varies 20%+ from the median. Review these quotes carefully.`,
    details: {
      quoteIds: outliers.map((o: any) => o.quoteId),
      variance: Math.max(...outliers.map((o: any) => o.variance)),
    },
  };

  const [result] = await db.insert(comparisonAlerts).values(alert);

  // Send email notification
  try {
    const outlierDetails = outliers
      .map((o: any) => `• ${o.contractorName}: $${(o.price / 100).toFixed(2)} (${o.variance}% variance)`)
      .join("\n");

    await notifyOwner({
      title: `⚠️ Pricing Outlier Alert`,
      content: `Comparison Group #${comparisonGroupId}\n\nMedian Price: $${(median / 100).toFixed(2)}\n\nOutliers:\n${outlierDetails}\n\nReview these quotes for potential pricing issues.`,
    });

    // Mark email as sent
    await db
      .update(comparisonAlerts)
      .set({ emailSent: true, emailSentAt: new Date() })
      .where(eq(comparisonAlerts.id, result.insertId));
  } catch (error) {
    console.error("[detectPricingOutliers] Failed to send notification:", error);
  }

  return result;
}

/**
 * Detect compliance gaps in a comparison group
 */
export async function detectComplianceGaps(comparisonGroupId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get all quotes with their verification results
  const items = await db
    .select()
    .from(comparisonItems)
    .leftJoin(quotes, eq(comparisonItems.quoteId, quotes.id))
    .where(eq(comparisonItems.groupId, comparisonGroupId));

  const quotesWithIssues: any[] = [];

  for (const item of items) {
    const quote = item.quotes;
    if (!quote) continue;

    // Get verification for this quote
    const [verification] = await db
      .select()
      .from(require("../drizzle/schema").verifications)
      .where(eq(require("../drizzle/schema").verifications.quoteId, quote.id))
      .limit(1);

    // Check verification status
    if (quote.status === "failed" || (verification && verification.complianceScore < 70)) {
      const contractorName = (quote.extractedData as any)?.contractor || "Unknown";
      quotesWithIssues.push({
        quoteId: quote.id,
        contractorName,
        complianceScore: verification?.complianceScore || 0,
        issues: [], // Would extract from verification results
      });
    }
  }

  if (quotesWithIssues.length === 0) return null;

  // Create alert
  const severity = quotesWithIssues.some((q: any) => q.complianceScore < 50) ? "critical" : "high";
  const alert: InsertComparisonAlert = {
    userId,
    comparisonGroupId,
    alertType: "compliance_gap",
    severity,
    title: `${quotesWithIssues.length} Compliance Issue${quotesWithIssues.length > 1 ? "s" : ""} Found`,
    message: `Found ${quotesWithIssues.length} quote(s) with compliance scores below 70%. Review compliance requirements.`,
    details: {
      quoteIds: quotesWithIssues.map((q: any) => q.quoteId),
      complianceIssues: quotesWithIssues.map((q: any) => `${q.contractorName}: ${q.complianceScore}%`),
    },
  };

  const [result] = await db.insert(comparisonAlerts).values(alert);

  // Send email notification
  try {
    const issueDetails = quotesWithIssues
      .map((q: any) => `• ${q.contractorName}: ${q.complianceScore}% compliance`)
      .join("\n");

    await notifyOwner({
      title: `🚨 Compliance Gap Alert`,
      content: `Comparison Group #${comparisonGroupId}\n\nQuotes with Low Compliance:\n${issueDetails}\n\nReview these quotes for compliance issues before proceeding.`,
    });

    // Mark email as sent
    await db
      .update(comparisonAlerts)
      .set({ emailSent: true, emailSentAt: new Date() })
      .where(eq(comparisonAlerts.id, result.insertId));
  } catch (error) {
    console.error("[detectComplianceGaps] Failed to send notification:", error);
  }

  return result;
}

/**
 * Get all alerts for a user
 */
export async function getUserAlerts(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(comparisonAlerts)
    .where(eq(comparisonAlerts.userId, userId))
    .orderBy(desc(comparisonAlerts.createdAt))
    .limit(limit);
}

/**
 * Get alerts for a specific comparison group
 */
export async function getComparisonAlerts(comparisonGroupId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(comparisonAlerts)
    .where(eq(comparisonAlerts.comparisonGroupId, comparisonGroupId))
    .orderBy(desc(comparisonAlerts.createdAt));
}

/**
 * Mark alert as read
 */
export async function markAlertRead(alertId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(comparisonAlerts)
    .set({ isRead: true, readAt: new Date() })
    .where(and(eq(comparisonAlerts.id, alertId), eq(comparisonAlerts.userId, userId)));

  return { success: true };
}

/**
 * Dismiss alert
 */
export async function dismissAlert(alertId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(comparisonAlerts)
    .set({ isDismissed: true, dismissedAt: new Date() })
    .where(and(eq(comparisonAlerts.id, alertId), eq(comparisonAlerts.userId, userId)));

  return { success: true };
}

/**
 * Get unread alert count
 */
export async function getUnreadAlertCount(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(comparisonAlerts)
    .where(
      and(
        eq(comparisonAlerts.userId, userId),
        eq(comparisonAlerts.isRead, false),
        eq(comparisonAlerts.isDismissed, false)
      )
    );

  return result[0]?.count || 0;
}
