/**
 * VENTURR VALDT - Contractor Rating System
 * Star ratings and reviews based on verified quote accuracy and compliance scores
 */

import { getDb } from './db';
import { sql } from 'drizzle-orm';

export interface ContractorRating {
  id: number;
  contractorAbn: string;
  contractorName: string;
  overallRating: number;
  accuracyScore: number;
  complianceScore: number;
  communicationScore: number;
  totalReviews: number;
  totalQuotesVerified: number;
  avgPriceVariance: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContractorReview {
  id: number;
  contractorAbn: string;
  userId: string;
  quoteId: number | null;
  rating: number;
  accuracyRating: number | null;
  complianceRating: number | null;
  communicationRating: number | null;
  reviewText: string | null;
  verifiedQuote: boolean;
  createdAt: Date;
}

export interface ReviewInput {
  contractorAbn: string;
  contractorName: string;
  userId: string;
  quoteId?: number;
  rating: number;
  accuracyRating?: number;
  complianceRating?: number;
  communicationRating?: number;
  reviewText?: string;
  verifiedQuote?: boolean;
}

/**
 * Get or create contractor rating record
 */
export async function getOrCreateContractorRating(
  contractorAbn: string, 
  contractorName: string
): Promise<ContractorRating | null> {
  const db = await getDb();
  if (!db) return null;
  
  const cleanAbn = contractorAbn.replace(/\D/g, '');
  
  try {
    // Check if exists
    const existing = await db.execute(sql`
      SELECT * FROM contractor_ratings WHERE contractor_abn = ${cleanAbn} LIMIT 1
    `);
    
    const rows = (existing as any)[0] as any[];
    
    if (rows.length > 0) {
      return mapRatingRow(rows[0]);
    }
    
    // Create new
    await db.execute(sql`
      INSERT INTO contractor_ratings (contractor_abn, contractor_name)
      VALUES (${cleanAbn}, ${contractorName})
    `);
    
    const newRecord = await db.execute(sql`
      SELECT * FROM contractor_ratings WHERE contractor_abn = ${cleanAbn} LIMIT 1
    `);
    
    const newRows = (newRecord as any)[0] as any[];
    return newRows.length > 0 ? mapRatingRow(newRows[0]) : null;
    
  } catch (error) {
    console.error('[Rating] Error getting/creating rating:', error);
    return null;
  }
}

/**
 * Submit a review for a contractor
 */
export async function submitReview(input: ReviewInput): Promise<{ success: boolean; reviewId?: number; error?: string }> {
  const db = await getDb();
  if (!db) return { success: false, error: 'Database not available' };
  
  const cleanAbn = input.contractorAbn.replace(/\D/g, '');
  
  try {
    // Insert review
    const result = await db.execute(sql`
      INSERT INTO contractor_reviews 
      (contractor_abn, user_id, quote_id, rating, accuracy_rating, compliance_rating, communication_rating, review_text, verified_quote)
      VALUES (
        ${cleanAbn}, 
        ${input.userId}, 
        ${input.quoteId || null}, 
        ${input.rating}, 
        ${input.accuracyRating || null}, 
        ${input.complianceRating || null}, 
        ${input.communicationRating || null}, 
        ${input.reviewText || null}, 
        ${input.verifiedQuote || false}
      )
    `);
    
    const reviewId = (result as any).insertId;
    
    // Update contractor rating aggregates
    await updateContractorRatingAggregates(cleanAbn, input.contractorName);
    
    return { success: true, reviewId };
    
  } catch (error) {
    console.error('[Rating] Error submitting review:', error);
    return { success: false, error: 'Failed to submit review' };
  }
}

/**
 * Update contractor rating aggregates based on all reviews
 */
async function updateContractorRatingAggregates(contractorAbn: string, contractorName: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  try {
    // Calculate aggregates from reviews
    const aggregates = await db.execute(sql`
      SELECT 
        COUNT(*) as total_reviews,
        AVG(rating) as avg_rating,
        AVG(accuracy_rating) as avg_accuracy,
        AVG(compliance_rating) as avg_compliance,
        AVG(communication_rating) as avg_communication,
        SUM(CASE WHEN verified_quote = 1 THEN 1 ELSE 0 END) as verified_count
      FROM contractor_reviews 
      WHERE contractor_abn = ${contractorAbn}
    `);
    
    const rows = (aggregates as any)[0] as any[];
    if (rows.length === 0) return;
    
    const agg = rows[0];
    
    // Ensure contractor rating record exists
    await getOrCreateContractorRating(contractorAbn, contractorName);
    
    // Update aggregates
    await db.execute(sql`
      UPDATE contractor_ratings SET
        overall_rating = ${agg.avg_rating || 0},
        accuracy_score = ${agg.avg_accuracy || 0},
        compliance_score = ${agg.avg_compliance || 0},
        communication_score = ${agg.avg_communication || 0},
        total_reviews = ${agg.total_reviews || 0},
        total_quotes_verified = ${agg.verified_count || 0},
        updated_at = NOW()
      WHERE contractor_abn = ${contractorAbn}
    `);
    
  } catch (error) {
    console.error('[Rating] Error updating aggregates:', error);
  }
}

/**
 * Get contractor rating by ABN
 */
export async function getContractorRating(contractorAbn: string): Promise<ContractorRating | null> {
  const db = await getDb();
  if (!db) return null;
  
  const cleanAbn = contractorAbn.replace(/\D/g, '');
  
  try {
    const result = await db.execute(sql`
      SELECT * FROM contractor_ratings WHERE contractor_abn = ${cleanAbn} LIMIT 1
    `);
    
    const rows = (result as any)[0] as any[];
    return rows.length > 0 ? mapRatingRow(rows[0]) : null;
    
  } catch (error) {
    console.error('[Rating] Error getting rating:', error);
    return null;
  }
}

/**
 * Get reviews for a contractor
 */
export async function getContractorReviews(
  contractorAbn: string, 
  limit: number = 10, 
  offset: number = 0
): Promise<ContractorReview[]> {
  const db = await getDb();
  if (!db) return [];
  
  const cleanAbn = contractorAbn.replace(/\D/g, '');
  
  try {
    const result = await db.execute(sql`
      SELECT * FROM contractor_reviews 
      WHERE contractor_abn = ${cleanAbn}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `);
    
    const rows = (result as any)[0] as any[];
    return rows.map(mapReviewRow);
    
  } catch (error) {
    console.error('[Rating] Error getting reviews:', error);
    return [];
  }
}

/**
 * Get top rated contractors
 */
export async function getTopRatedContractors(
  limit: number = 10,
  minReviews: number = 1
): Promise<ContractorRating[]> {
  const db = await getDb();
  if (!db) return [];
  
  try {
    const result = await db.execute(sql`
      SELECT * FROM contractor_ratings 
      WHERE total_reviews >= ${minReviews}
      ORDER BY overall_rating DESC, total_reviews DESC
      LIMIT ${limit}
    `);
    
    const rows = (result as any)[0] as any[];
    return rows.map(mapRatingRow);
    
  } catch (error) {
    console.error('[Rating] Error getting top contractors:', error);
    return [];
  }
}

/**
 * Calculate accuracy score from verification results
 */
export async function calculateAccuracyFromVerification(
  contractorAbn: string,
  contractorName: string,
  priceVariance: number,
  complianceScore: number
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  const cleanAbn = contractorAbn.replace(/\D/g, '');
  
  try {
    // Ensure rating record exists
    await getOrCreateContractorRating(cleanAbn, contractorName);
    
    // Calculate accuracy score (inverse of price variance, capped at 5)
    // Lower variance = higher accuracy
    const accuracyFromVariance = Math.max(1, Math.min(5, 5 - Math.abs(priceVariance) / 20));
    
    // Update with new verification data
    await db.execute(sql`
      UPDATE contractor_ratings SET
        accuracy_score = (accuracy_score * total_quotes_verified + ${accuracyFromVariance}) / (total_quotes_verified + 1),
        compliance_score = (compliance_score * total_quotes_verified + ${complianceScore}) / (total_quotes_verified + 1),
        total_quotes_verified = total_quotes_verified + 1,
        avg_price_variance = (avg_price_variance * (total_quotes_verified - 1) + ${priceVariance}) / total_quotes_verified,
        updated_at = NOW()
      WHERE contractor_abn = ${cleanAbn}
    `);
    
    // Recalculate overall rating
    await db.execute(sql`
      UPDATE contractor_ratings SET
        overall_rating = (accuracy_score + compliance_score + communication_score) / 3,
        updated_at = NOW()
      WHERE contractor_abn = ${cleanAbn}
    `);
    
  } catch (error) {
    console.error('[Rating] Error calculating accuracy:', error);
  }
}

/**
 * Map database row to ContractorRating
 */
function mapRatingRow(row: any): ContractorRating {
  return {
    id: row.id,
    contractorAbn: row.contractor_abn,
    contractorName: row.contractor_name,
    overallRating: parseFloat(row.overall_rating) || 0,
    accuracyScore: parseFloat(row.accuracy_score) || 0,
    complianceScore: parseFloat(row.compliance_score) || 0,
    communicationScore: parseFloat(row.communication_score) || 0,
    totalReviews: row.total_reviews || 0,
    totalQuotesVerified: row.total_quotes_verified || 0,
    avgPriceVariance: parseFloat(row.avg_price_variance) || 0,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at)
  };
}

/**
 * Map database row to ContractorReview
 */
function mapReviewRow(row: any): ContractorReview {
  return {
    id: row.id,
    contractorAbn: row.contractor_abn,
    userId: row.user_id,
    quoteId: row.quote_id,
    rating: row.rating,
    accuracyRating: row.accuracy_rating,
    complianceRating: row.compliance_rating,
    communicationRating: row.communication_rating,
    reviewText: row.review_text,
    verifiedQuote: !!row.verified_quote,
    createdAt: new Date(row.created_at)
  };
}
