import { getDb } from "./db";
import { sql } from "drizzle-orm";
import crypto from "crypto";

/**
 * Generate a unique share token
 */
function generateShareToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Create a shareable link for a contractor comparison
 */
export async function createComparisonShare(params: {
  userId: number;
  contractorIds: number[];
  title?: string;
  notes?: string;
  expiresInDays?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { userId, contractorIds, title, notes, expiresInDays } = params;
  const shareToken = generateShareToken();
  const expiresAt = expiresInDays
    ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
    : null;

  const contractorIdsJson = JSON.stringify(contractorIds);
  const titleValue = title || null;
  const notesValue = notes || null;

  await db.execute(sql`
    INSERT INTO shared_comparisons (user_id, share_token, contractor_ids, title, notes, expires_at)
    VALUES (${userId}, ${shareToken}, ${contractorIdsJson}, ${titleValue}, ${notesValue}, ${expiresAt})
  `);

  return {
    shareToken,
    contractorIds,
    title: titleValue,
    notes: notesValue,
    expiresAt,
  };
}

/**
 * Get a shared comparison by token
 */
export async function getSharedComparison(shareToken: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.execute(sql`
    SELECT * FROM shared_comparisons WHERE share_token = ${shareToken}
  `);

  const rows = (result as any)[0] as any[];
  if (rows.length === 0) return null;

  const share = rows[0];

  // Check if expired
  if (share.expires_at && new Date(share.expires_at) < new Date()) {
    return null;
  }

  // Increment view count
  await db.execute(sql`
    UPDATE shared_comparisons 
    SET view_count = view_count + 1, last_viewed_at = NOW()
    WHERE share_token = ${shareToken}
  `);

  return {
    id: share.id,
    userId: share.user_id,
    shareToken: share.share_token,
    contractorIds: typeof share.contractor_ids === "string" 
      ? JSON.parse(share.contractor_ids) 
      : share.contractor_ids,
    title: share.title,
    notes: share.notes,
    expiresAt: share.expires_at,
    viewCount: share.view_count + 1,
    lastViewedAt: new Date(),
    createdAt: share.created_at,
  };
}

/**
 * Get all shares created by a user
 */
export async function getUserShares(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.execute(sql`
    SELECT * FROM shared_comparisons 
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `);

  return ((result as any)[0] as any[]).map((share) => ({
    id: share.id,
    shareToken: share.share_token,
    contractorIds: typeof share.contractor_ids === "string" 
      ? JSON.parse(share.contractor_ids) 
      : share.contractor_ids,
    title: share.title,
    notes: share.notes,
    expiresAt: share.expires_at,
    viewCount: share.view_count,
    lastViewedAt: share.last_viewed_at,
    createdAt: share.created_at,
  }));
}

/**
 * Delete a shared comparison
 */
export async function deleteComparisonShare(userId: number, shareToken: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.execute(sql`
    DELETE FROM shared_comparisons 
    WHERE user_id = ${userId} AND share_token = ${shareToken}
  `);

  return true;
}

/**
 * Get detailed contractor data for a shared comparison
 */
export async function getSharedComparisonDetails(shareToken: string) {
  const share = await getSharedComparison(shareToken);
  if (!share) return null;

  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get contractor details
  const contractorIds = share.contractorIds;
  if (!contractorIds || contractorIds.length === 0) {
    return { ...share, contractors: [] };
  }

  // Get contractors one by one
  const contractors = await Promise.all(
    contractorIds.map(async (contractorId: number) => {
      const contractorResult = await db.execute(sql`
        SELECT * FROM contractors WHERE id = ${contractorId}
      `);
      const contractor = (contractorResult as any)[0]?.[0];
      if (!contractor) return null;

      // Get portfolio projects
      const portfolioResult = await db.execute(sql`
        SELECT * FROM portfolio_projects 
        WHERE contractor_id = ${contractorId}
        ORDER BY completion_date DESC
        LIMIT 3
      `);

      // Get certifications
      const certResult = await db.execute(sql`
        SELECT * FROM contractor_certifications 
        WHERE contractor_id = ${contractorId}
        AND (expiry_date IS NULL OR expiry_date > NOW())
      `);

      // Get average rating
      const ratingResult = await db.execute(sql`
        SELECT AVG(rating) as avg_rating, COUNT(*) as review_count
        FROM contractor_reviews
        WHERE contractor_id = ${contractorId}
      `);

      const ratingRow = (ratingResult as any)[0]?.[0];

      return {
        id: contractor.id,
        name: contractor.name,
        businessName: contractor.business_name || contractor.name,
        business_name: contractor.business_name || contractor.name,
        email: contractor.email,
        phone: contractor.phone,
        website: contractor.website,
        location: contractor.address,
        category: contractor.specialties,
        licenseNumber: contractor.license_number,
        isVerified: contractor.is_verified,
        portfolio: (portfolioResult as any)[0] || [],
        certifications: (certResult as any)[0] || [],
        avgRating: ratingRow?.avg_rating || 0,
        reviewCount: ratingRow?.review_count || 0,
      };
    })
  ).then(results => results.filter(Boolean));

  return {
    ...share,
    contractors,
  };
}
