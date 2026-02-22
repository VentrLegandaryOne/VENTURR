import { getDb } from "./db.js";
import { contractorReviews, reviewPhotos } from "../drizzle/schema.js";
import { eq, and, desc, sql } from "drizzle-orm";

export async function createReview(data: {
  contractorId: number;
  userId: number;
  quoteId?: number | null;
  rating: number;
  qualityScore: number;
  valueScore: number;
  communicationScore: number;
  timelinessScore: number;
  comment: string;
  isVerified: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(contractorReviews).values({
    contractorId: data.contractorId,
    userId: data.userId,
    quoteId: data.quoteId,
    rating: data.rating,
    qualityScore: data.qualityScore,
    valueScore: data.valueScore,
    communicationScore: data.communicationScore,
    timelinessScore: data.timelinessScore,
    comment: data.comment,
    isVerified: data.isVerified,
    helpfulCount: 0,
    createdAt: new Date(),
  });

  return result;
}

export async function addReviewPhotos(reviewId: number, photoUrls: string[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const photos = photoUrls.map((url) => ({
    reviewId,
    photoUrl: url,
    uploadedAt: new Date(),
  }));

  await db.insert(reviewPhotos).values(photos);
}

export async function getReviewsByContractor(contractorId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const reviews = await db
    .select()
    .from(contractorReviews)
    .where(eq(contractorReviews.contractorId, contractorId))
    .orderBy(desc(contractorReviews.createdAt));

  // Fetch photos for each review
  const reviewsWithPhotos = await Promise.all(
    reviews.map(async (review) => {
      const photos = await db
        .select()
        .from(reviewPhotos)
        .where(eq(reviewPhotos.reviewId, review.id));
      
      return {
        ...review,
        photos: photos.map((p) => p.photoUrl),
      };
    })
  );

  return reviewsWithPhotos;
}

export async function getReviewStats(contractorId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const stats = await db
    .select({
      totalReviews: sql<number>`COUNT(*)`,
      avgRating: sql<number>`AVG(${contractorReviews.rating})`,
      avgQuality: sql<number>`AVG(${contractorReviews.qualityScore})`,
      avgValue: sql<number>`AVG(${contractorReviews.valueScore})`,
      avgCommunication: sql<number>`AVG(${contractorReviews.communicationScore})`,
      avgTimeliness: sql<number>`AVG(${contractorReviews.timelinessScore})`,
      verifiedCount: sql<number>`SUM(CASE WHEN ${contractorReviews.isVerified} THEN 1 ELSE 0 END)`,
    })
    .from(contractorReviews)
    .where(eq(contractorReviews.contractorId, contractorId));

  return stats[0] || {
    totalReviews: 0,
    avgRating: 0,
    avgQuality: 0,
    avgValue: 0,
    avgCommunication: 0,
    avgTimeliness: 0,
    verifiedCount: 0,
  };
}

export async function markReviewHelpful(reviewId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(contractorReviews)
    .set({
      helpfulCount: sql`${contractorReviews.helpfulCount} + 1`,
    })
    .where(eq(contractorReviews.id, reviewId));
}

export async function deleteReview(reviewId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Delete photos first (foreign key constraint)
  await db.delete(reviewPhotos).where(eq(reviewPhotos.reviewId, reviewId));

  // Delete review
  await db
    .delete(contractorReviews)
    .where(
      and(
        eq(contractorReviews.id, reviewId),
        eq(contractorReviews.userId, userId)
      )
    );
}

/**
 * Add a contractor response to a review
 */
export async function addContractorResponse(reviewId: number, contractorId: number, response: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Verify the review belongs to this contractor
  const review = await db
    .select()
    .from(contractorReviews)
    .where(
      and(
        eq(contractorReviews.id, reviewId),
        eq(contractorReviews.contractorId, contractorId)
      )
    )
    .limit(1);

  if (review.length === 0) {
    throw new Error("Review not found or does not belong to this contractor");
  }

  // Update the review with the contractor's response
  await db
    .update(contractorReviews)
    .set({
      contractorResponse: response,
      contractorResponseAt: new Date(),
    })
    .where(eq(contractorReviews.id, reviewId));

  return { success: true };
}

/**
 * Update an existing contractor response
 */
export async function updateContractorResponse(reviewId: number, contractorId: number, response: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Verify the review belongs to this contractor and has an existing response
  const review = await db
    .select()
    .from(contractorReviews)
    .where(
      and(
        eq(contractorReviews.id, reviewId),
        eq(contractorReviews.contractorId, contractorId)
      )
    )
    .limit(1);

  if (review.length === 0) {
    throw new Error("Review not found or does not belong to this contractor");
  }

  if (!review[0].contractorResponse) {
    throw new Error("No existing response to update");
  }

  await db
    .update(contractorReviews)
    .set({
      contractorResponse: response,
      contractorResponseAt: new Date(),
    })
    .where(eq(contractorReviews.id, reviewId));

  return { success: true };
}

/**
 * Delete a contractor response from a review
 */
export async function deleteContractorResponse(reviewId: number, contractorId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Verify the review belongs to this contractor
  const review = await db
    .select()
    .from(contractorReviews)
    .where(
      and(
        eq(contractorReviews.id, reviewId),
        eq(contractorReviews.contractorId, contractorId)
      )
    )
    .limit(1);

  if (review.length === 0) {
    throw new Error("Review not found or does not belong to this contractor");
  }

  await db
    .update(contractorReviews)
    .set({
      contractorResponse: null,
      contractorResponseAt: null,
    })
    .where(eq(contractorReviews.id, reviewId));

  return { success: true };
}

/**
 * Get reviews pending contractor response
 */
export async function getReviewsPendingResponse(contractorId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const reviews = await db
    .select()
    .from(contractorReviews)
    .where(
      and(
        eq(contractorReviews.contractorId, contractorId),
        sql`${contractorReviews.contractorResponse} IS NULL`
      )
    )
    .orderBy(desc(contractorReviews.createdAt));

  return reviews;
}
