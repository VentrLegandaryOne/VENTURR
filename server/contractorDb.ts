import { getDb } from "./db";
import { contractors, contractorReviews, contractorProjects } from "../drizzle/schema";
import { eq, and, desc, sql, like, or } from "drizzle-orm";

/**
 * Create a new contractor
 */
export async function createContractor(data: {
  name: string;
  businessName?: string;
  abn?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  licenseNumber?: string;
  isVerified?: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");

  const result = await db.insert(contractors).values({
    name: data.name,
    businessName: data.businessName || null,
    abn: data.abn || null,
    email: data.email || null,
    phone: data.phone || null,
    website: data.website || null,
    address: data.address || null,
    licenseNumber: data.licenseNumber || null,
    isVerified: data.isVerified || false,
    avgScore: 0,
    totalReviews: 0,
    totalProjects: 0,
    totalValue: 0,
  });

  return result;
}

/**
 * Get contractor by ID
 */
export async function getContractorById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");

  const results = await db
    .select()
    .from(contractors)
    .where(eq(contractors.id, id))
    .limit(1);

  return results.length > 0 ? results[0] : null;
}

/**
 * Search contractors by name or license
 */
export async function searchContractors(query: string, limit: number = 20) {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");

  const searchPattern = `%${query}%`;
  
  const results = await db
    .select()
    .from(contractors)
    .where(
      or(
        like(contractors.name, searchPattern),
        like(contractors.licenseNumber, searchPattern)
      )
    )
    .orderBy(desc(contractors.avgScore))
    .limit(limit);

  return results;
}

/**
 * List all contractors with pagination
 */
export async function listContractors(options: {
  limit?: number;
  offset?: number;
  verified?: boolean;
  minRating?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");

  let query = db.select().from(contractors);

  // Apply filters
  const conditions = [];
  if (options.verified !== undefined) {
    conditions.push(eq(contractors.isVerified, options.verified));
  }
  if (options.minRating !== undefined) {
    conditions.push(sql`${contractors.avgScore} >= ${options.minRating}`);
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  // Apply ordering and pagination
  const results = await query
    .orderBy(desc(contractors.avgScore))
    .limit(options.limit || 20)
    .offset(options.offset || 0);

  return results;
}

/**
 * Create a contractor review
 */
export async function createContractorReview(data: {
  contractorId: number;
  userId: number;
  quoteId?: number;
  rating: number;
  comment?: string;
  verified?: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");

  // Insert review
  const result = await db.insert(contractorReviews).values({
    contractorId: data.contractorId,
    userId: data.userId,
    quoteId: data.quoteId || null,
    rating: data.rating,
    comment: data.comment || null,
    isVerified: data.verified || false,
  });

  // Update contractor average score and total reviews
  await updateContractorRating(data.contractorId);

  return result;
}

/**
 * Update contractor average rating
 */
async function updateContractorRating(contractorId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");

  // Calculate average rating
  const reviews = await db
    .select()
    .from(contractorReviews)
    .where(eq(contractorReviews.contractorId, contractorId));

  const totalReviews = reviews.length;
  const avgScore = totalReviews > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
    : 0;

  // Update contractor - store as 0-100 scale (rating 1-5 * 20 = 20-100)
  await db
    .update(contractors)
    .set({
      avgScore: Math.round(avgScore * 20), // Convert 1-5 scale to 0-100 scale
      totalReviews,
    })
    .where(eq(contractors.id, contractorId));
}

/**
 * Get reviews for a contractor
 */
export async function getContractorReviews(contractorId: number, limit: number = 20) {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");

  const results = await db
    .select()
    .from(contractorReviews)
    .where(eq(contractorReviews.contractorId, contractorId))
    .orderBy(desc(contractorReviews.createdAt))
    .limit(limit);

  return results;
}

/**
 * Add contractor project
 */
export async function addContractorProject(data: {
  contractorId: number;
  projectType: string;
  completedDate: Date;
  projectValue: number;
  location?: string;
  description?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");

  const result = await db.insert(contractorProjects).values({
    contractorId: data.contractorId,
    projectType: data.projectType,
    completedDate: data.completedDate,
    projectValue: data.projectValue,
    location: data.location || null,
    description: data.description || null,
  });

  return result;
}

/**
 * Get contractor projects
 */
export async function getContractorProjects(contractorId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");

  const results = await db
    .select()
    .from(contractorProjects)
    .where(eq(contractorProjects.contractorId, contractorId))
    .orderBy(desc(contractorProjects.completedDate));

  return results;
}

/**
 * Check if user has already reviewed a contractor
 */
export async function hasUserReviewedContractor(userId: number, contractorId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");

  const results = await db
    .select()
    .from(contractorReviews)
    .where(
      and(
        eq(contractorReviews.userId, userId),
        eq(contractorReviews.contractorId, contractorId)
      )
    )
    .limit(1);

  return results.length > 0;
}
