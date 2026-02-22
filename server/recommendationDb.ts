import { eq, and, desc, sql, like, or } from "drizzle-orm";
import { getDb } from "./db";
import { contractors, contractorReviews, portfolioProjects, contractorCertifications, quotes, verifications } from "../drizzle/schema";

interface RecommendationCriteria {
  projectType?: string;
  location?: string;
  budget?: number; // in cents
  userId: number;
}

interface ContractorRecommendation {
  contractor: {
    id: number;
    name: string;
    businessName: string | null;
    avgScore: number;
    totalReviews: number;
    totalProjects: number;
    isVerified: boolean;
    specialties: string[] | null;
    serviceAreas: string[] | null;
  };
  matchScore: number; // 0-100
  matchReasons: string[];
  portfolioCount: number;
  certificationCount: number;
  avgRating: number;
  recentProjectValue: number | null;
}

/**
 * Get contractor recommendations based on project criteria
 */
export async function getContractorRecommendations(
  criteria: RecommendationCriteria,
  limit: number = 5
): Promise<ContractorRecommendation[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get all contractors
  const allContractors = await db.select().from(contractors);

  // Get portfolio projects for each contractor
  const portfolios = await db.select().from(portfolioProjects);
  const portfolioMap = new Map<number, typeof portfolios>();
  portfolios.forEach((p) => {
    const existing = portfolioMap.get(p.contractorId) || [];
    existing.push(p);
    portfolioMap.set(p.contractorId, existing);
  });

  // Get certifications for each contractor
  const certs = await db.select().from(contractorCertifications);
  const certMap = new Map<number, number>();
  certs.forEach((c) => {
    certMap.set(c.contractorId, (certMap.get(c.contractorId) || 0) + 1);
  });

  // Get reviews for each contractor
  const reviews = await db.select().from(contractorReviews);
  const reviewMap = new Map<number, { count: number; totalRating: number }>();
  reviews.forEach((r) => {
    const existing = reviewMap.get(r.contractorId) || { count: 0, totalRating: 0 };
    existing.count++;
    existing.totalRating += r.rating;
    reviewMap.set(r.contractorId, existing);
  });

  // Score and rank contractors
  const recommendations: ContractorRecommendation[] = allContractors.map((contractor) => {
    let matchScore = 50; // Base score
    const matchReasons: string[] = [];

    // Specialty match (up to +25 points)
    if (criteria.projectType && contractor.specialties) {
      const specialties = contractor.specialties as string[];
      const projectTypeLower = criteria.projectType.toLowerCase();
      const hasMatch = specialties.some((s) => 
        s.toLowerCase().includes(projectTypeLower) || 
        projectTypeLower.includes(s.toLowerCase())
      );
      if (hasMatch) {
        matchScore += 25;
        matchReasons.push(`Specializes in ${criteria.projectType}`);
      }
    }

    // Location match (up to +20 points)
    if (criteria.location && contractor.serviceAreas) {
      const serviceAreas = contractor.serviceAreas as string[];
      const locationLower = criteria.location.toLowerCase();
      const hasMatch = serviceAreas.some((area) => 
        area.toLowerCase().includes(locationLower) || 
        locationLower.includes(area.toLowerCase())
      );
      if (hasMatch) {
        matchScore += 20;
        matchReasons.push(`Services ${criteria.location} area`);
      }
    }

    // Portfolio experience (up to +15 points)
    const contractorPortfolio = portfolioMap.get(contractor.id) || [];
    if (contractorPortfolio.length > 0) {
      matchScore += Math.min(contractorPortfolio.length * 3, 15);
      matchReasons.push(`${contractorPortfolio.length} completed projects in portfolio`);
    }

    // Budget alignment (up to +15 points)
    if (criteria.budget) {
      const relevantProjects = contractorPortfolio.filter((p) => {
        if (!p.projectCost) return false;
        const costDiff = Math.abs(Number(p.projectCost) - criteria.budget!) / criteria.budget!;
        return costDiff < 0.5; // Within 50% of budget
      });
      if (relevantProjects.length > 0) {
        matchScore += 15;
        matchReasons.push("Has experience with similar budget projects");
      }
    }

    // Certifications bonus (up to +10 points)
    const certCount = certMap.get(contractor.id) || 0;
    if (certCount > 0) {
      matchScore += Math.min(certCount * 2, 10);
      matchReasons.push(`${certCount} verified certifications`);
    }

    // Verification bonus (+5 points)
    if (contractor.isVerified) {
      matchScore += 5;
      matchReasons.push("VENTURR Verified contractor");
    }

    // High rating bonus (up to +10 points)
    const reviewData = reviewMap.get(contractor.id);
    const avgRating = reviewData ? reviewData.totalRating / reviewData.count : 0;
    if (avgRating >= 4) {
      matchScore += Math.round((avgRating - 3) * 5);
      matchReasons.push(`${avgRating.toFixed(1)} star average rating`);
    }

    // Cap score at 100
    matchScore = Math.min(matchScore, 100);

    // Get most recent project value
    const sortedProjects = contractorPortfolio.sort((a, b) => {
      const dateA = a.completionDate ? new Date(a.completionDate).getTime() : 0;
      const dateB = b.completionDate ? new Date(b.completionDate).getTime() : 0;
      return dateB - dateA;
    });
    const recentProjectValue = sortedProjects[0]?.projectCost ? Number(sortedProjects[0].projectCost) : null;

    return {
      contractor: {
        id: contractor.id,
        name: contractor.name,
        businessName: contractor.businessName,
        avgScore: contractor.avgScore,
        totalReviews: contractor.totalReviews,
        totalProjects: contractor.totalProjects,
        isVerified: contractor.isVerified,
        specialties: contractor.specialties as string[] | null,
        serviceAreas: contractor.serviceAreas as string[] | null,
      },
      matchScore,
      matchReasons,
      portfolioCount: contractorPortfolio.length,
      certificationCount: certCount,
      avgRating,
      recentProjectValue,
    };
  });

  // Sort by match score and return top results
  return recommendations
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
}

/**
 * Get recommendations based on a specific quote's extracted data
 */
export async function getRecommendationsForQuote(
  quoteId: number,
  userId: number,
  limit: number = 5
): Promise<ContractorRecommendation[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get the quote
  const quoteResult = await db
    .select()
    .from(quotes)
    .where(eq(quotes.id, quoteId))
    .limit(1);

  if (quoteResult.length === 0) {
    return getContractorRecommendations({ userId }, limit);
  }

  const quote = quoteResult[0];
  const extractedData = quote.extractedData as {
    contractor?: string;
    totalAmount?: number;
    projectAddress?: string;
  } | null;

  // Extract criteria from quote
  const criteria: RecommendationCriteria = {
    userId,
    budget: extractedData?.totalAmount ? extractedData.totalAmount * 100 : undefined, // Convert to cents
    location: extractedData?.projectAddress,
  };

  // Try to infer project type from file name or extracted data
  const fileName = quote.fileName.toLowerCase();
  if (fileName.includes("roof")) criteria.projectType = "Roofing";
  else if (fileName.includes("kitchen")) criteria.projectType = "Kitchen";
  else if (fileName.includes("bathroom")) criteria.projectType = "Bathroom";
  else if (fileName.includes("deck")) criteria.projectType = "Deck";
  else if (fileName.includes("solar")) criteria.projectType = "Solar";
  else if (fileName.includes("paint")) criteria.projectType = "Painting";
  else if (fileName.includes("plumb")) criteria.projectType = "Plumbing";
  else if (fileName.includes("electr")) criteria.projectType = "Electrical";

  return getContractorRecommendations(criteria, limit);
}

/**
 * Get top contractors by category
 */
export async function getTopContractorsByCategory(
  category: string,
  limit: number = 3
): Promise<ContractorRecommendation[]> {
  return getContractorRecommendations(
    { projectType: category, userId: 0 },
    limit
  );
}
