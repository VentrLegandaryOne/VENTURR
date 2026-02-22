import { getDb } from "./db";
import { contractorComparisons, contractors, contractorReviews, portfolioProjects, contractorCertifications } from "../drizzle/schema";
import { eq, and, sql, desc, count } from "drizzle-orm";

/**
 * Add a contractor to user's comparison list
 */
export async function addToComparison(userId: number, contractorId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");

  // Check if already in comparison
  const existing = await db
    .select()
    .from(contractorComparisons)
    .where(and(
      eq(contractorComparisons.userId, userId),
      eq(contractorComparisons.contractorId, contractorId)
    ))
    .limit(1);

  if (existing.length > 0) {
    return { success: true, message: "Already in comparison" };
  }

  // Check comparison limit (max 4 contractors)
  const currentCount = await db
    .select({ count: count() })
    .from(contractorComparisons)
    .where(eq(contractorComparisons.userId, userId));

  if (currentCount[0]?.count >= 4) {
    throw new Error("Maximum 4 contractors can be compared at once");
  }

  await db.insert(contractorComparisons).values({
    userId,
    contractorId,
  });

  return { success: true, message: "Added to comparison" };
}

/**
 * Remove a contractor from user's comparison list
 */
export async function removeFromComparison(userId: number, contractorId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");

  await db
    .delete(contractorComparisons)
    .where(and(
      eq(contractorComparisons.userId, userId),
      eq(contractorComparisons.contractorId, contractorId)
    ));

  return { success: true, message: "Removed from comparison" };
}

/**
 * Get all contractors in user's comparison list
 */
export async function getComparisonList(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");

  const comparisons = await db
    .select()
    .from(contractorComparisons)
    .where(eq(contractorComparisons.userId, userId))
    .orderBy(contractorComparisons.addedAt);

  const contractorIds = comparisons.map(c => c.contractorId);
  
  if (contractorIds.length === 0) {
    return [];
  }

  // Get contractor details
  const contractorsList = await db
    .select()
    .from(contractors)
    .where(sql`${contractors.id} IN (${sql.join(contractorIds.map(id => sql`${id}`), sql`, `)})`);

  return contractorsList;
}

/**
 * Get detailed comparison data for selected contractors
 */
export async function getDetailedComparison(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");

  // Get contractors in comparison
  const contractorsList = await getComparisonList(userId);
  
  if (contractorsList.length === 0) {
    return [];
  }

  const contractorIds = contractorsList.map(c => c.id);

  // Get review statistics for each contractor
  const reviewStats = await Promise.all(
    contractorIds.map(async (contractorId) => {
      const stats = await db
        .select({
          contractorId: contractorReviews.contractorId,
          avgRating: sql<number>`AVG(${contractorReviews.rating})`,
          totalReviews: count(),
          avgQuality: sql<number>`AVG(${contractorReviews.qualityScore})`,
          avgValue: sql<number>`AVG(${contractorReviews.valueScore})`,
          avgCommunication: sql<number>`AVG(${contractorReviews.communicationScore})`,
          avgTimeliness: sql<number>`AVG(${contractorReviews.timelinessScore})`,
        })
        .from(contractorReviews)
        .where(eq(contractorReviews.contractorId, contractorId))
        .groupBy(contractorReviews.contractorId);

      return stats[0] || {
        contractorId,
        avgRating: 0,
        totalReviews: 0,
        avgQuality: 0,
        avgValue: 0,
        avgCommunication: 0,
        avgTimeliness: 0,
      };
    })
  );

  // Get portfolio project counts
  const portfolioCounts = await Promise.all(
    contractorIds.map(async (contractorId) => {
      const result = await db
        .select({ count: count() })
        .from(portfolioProjects)
        .where(eq(portfolioProjects.contractorId, contractorId));
      
      return { contractorId, projectCount: result[0]?.count || 0 };
    })
  );

  // Get certification counts by category
  const certificationCounts = await Promise.all(
    contractorIds.map(async (contractorId) => {
      const certs = await db
        .select({
          category: contractorCertifications.category,
          count: count(),
        })
        .from(contractorCertifications)
        .where(and(
          eq(contractorCertifications.contractorId, contractorId),
          sql`(${contractorCertifications.expiryDate} IS NULL OR ${contractorCertifications.expiryDate} > NOW())`
        ))
        .groupBy(contractorCertifications.category);

      return {
        contractorId,
        certifications: certs.reduce((acc, cert) => {
          acc[cert.category] = cert.count;
          return acc;
        }, {} as Record<string, number>),
      };
    })
  );

  // Get recent projects
  const recentProjects = await Promise.all(
    contractorIds.map(async (contractorId) => {
      const projects = await db
        .select()
        .from(portfolioProjects)
        .where(eq(portfolioProjects.contractorId, contractorId))
        .orderBy(desc(portfolioProjects.completionDate))
        .limit(3);
      
      return { contractorId, projects };
    })
  );

  // Combine all data
  return contractorsList.map(contractor => {
    const stats = reviewStats.find(s => s.contractorId === contractor.id);
    const portfolio = portfolioCounts.find(p => p.contractorId === contractor.id);
    const certs = certificationCounts.find(c => c.contractorId === contractor.id);
    const projects = recentProjects.find(p => p.contractorId === contractor.id);

    return {
      contractor,
      stats: {
        avgRating: stats?.avgRating ? Number(stats.avgRating.toFixed(1)) : 0,
        totalReviews: stats?.totalReviews || 0,
        avgQuality: stats?.avgQuality ? Number(stats.avgQuality.toFixed(0)) : 0,
        avgValue: stats?.avgValue ? Number(stats.avgValue.toFixed(0)) : 0,
        avgCommunication: stats?.avgCommunication ? Number(stats.avgCommunication.toFixed(0)) : 0,
        avgTimeliness: stats?.avgTimeliness ? Number(stats.avgTimeliness.toFixed(0)) : 0,
      },
      portfolio: {
        projectCount: portfolio?.projectCount || 0,
        recentProjects: projects?.projects || [],
      },
      certifications: certs?.certifications || {},
    };
  });
}

/**
 * Clear all contractors from user's comparison list
 */
export async function clearComparison(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");

  await db
    .delete(contractorComparisons)
    .where(eq(contractorComparisons.userId, userId));

  return { success: true, message: "Comparison cleared" };
}

/**
 * Check if a contractor is in user's comparison list
 */
export async function isInComparison(userId: number, contractorId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");

  const result = await db
    .select()
    .from(contractorComparisons)
    .where(and(
      eq(contractorComparisons.userId, userId),
      eq(contractorComparisons.contractorId, contractorId)
    ))
    .limit(1);

  return result.length > 0;
}
