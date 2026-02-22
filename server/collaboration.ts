import { eq, and, desc } from "drizzle-orm";
import { getDb } from "./db";
import { sharedReports, comments, negotiations, quotes, verifications, type InsertSharedReport, type InsertComment, type InsertNegotiation } from "../drizzle/schema";
import { nanoid } from "nanoid";

/**
 * Create a share link for a quote report
 */
export async function createShareLink(data: {
  quoteId: number;
  sharedBy: number;
  sharedWith?: string;
  accessLevel: "view" | "comment" | "negotiate";
  expiresAt?: Date;
}): Promise<{ shareToken: string; shareUrl: string }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const shareToken = nanoid(32);
  
  await db.insert(sharedReports).values({
    quoteId: data.quoteId,
    shareToken,
    sharedBy: data.sharedBy,
    sharedWith: data.sharedWith,
    accessLevel: data.accessLevel,
    expiresAt: data.expiresAt,
  });

  const shareUrl = `${process.env.VITE_FRONTEND_FORGE_API_URL || 'http://localhost:3000'}/shared/${shareToken}`;
  
  return { shareToken, shareUrl };
}

/**
 * Get shared report by token with full quote and verification data
 */
export async function getSharedReport(shareToken: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(sharedReports)
    .where(eq(sharedReports.shareToken, shareToken))
    .limit(1);

  if (result.length === 0) return null;
  
  const share = result[0];
  
  // Check if expired
  if (share.expiresAt && new Date(share.expiresAt) < new Date()) {
    return null;
  }

  // Update view count and last viewed
  await db
    .update(sharedReports)
    .set({
      viewCount: share.viewCount + 1,
      lastViewedAt: new Date(),
    })
    .where(eq(sharedReports.id, share.id));

  // Fetch the quote data
  const quoteResult = await db
    .select()
    .from(quotes)
    .where(eq(quotes.id, share.quoteId))
    .limit(1);

  if (quoteResult.length === 0) return null;
  const quote = quoteResult[0];

  // Fetch verification data if available
  const verificationResult = await db
    .select()
    .from(verifications)
    .where(eq(verifications.quoteId, share.quoteId))
    .limit(1);

  const verification = verificationResult.length > 0 ? verificationResult[0] : null;

  return {
    ...share,
    quote: {
      id: quote.id,
      fileName: quote.fileName,
      uploadedAt: quote.createdAt,
      status: quote.status,
    },
    verification: verification ? {
      overallScore: verification.overallScore,
      pricingScore: verification.pricingScore,
      materialsScore: verification.materialsScore,
      complianceScore: verification.complianceScore,
      warrantyScore: verification.warrantyScore,
      flags: verification.flags,
      recommendations: verification.recommendations,
      potentialSavings: verification.potentialSavings,
    } : null,
  };
}

/**
 * Get all shares for a quote
 */
export async function getQuoteShares(quoteId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(sharedReports)
    .where(eq(sharedReports.quoteId, quoteId))
    .orderBy(desc(sharedReports.createdAt));
}

/**
 * Revoke a share link
 */
export async function revokeShareLink(shareId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Verify ownership
  const share = await db
    .select()
    .from(sharedReports)
    .where(and(
      eq(sharedReports.id, shareId),
      eq(sharedReports.sharedBy, userId)
    ))
    .limit(1);

  if (share.length === 0) {
    throw new Error("Share not found or unauthorized");
  }

  await db.delete(sharedReports).where(eq(sharedReports.id, shareId));
}

/**
 * Add a comment to a quote
 */
export async function addComment(data: InsertComment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(comments).values(data);
  
  // Get the last inserted comment
  const result = await db
    .select()
    .from(comments)
    .where(eq(comments.quoteId, data.quoteId))
    .orderBy(desc(comments.id))
    .limit(1);
  
  return result[0];
}

/**
 * Get comments for a quote
 */
export async function getQuoteComments(quoteId: number, section?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const conditions = section
    ? and(eq(comments.quoteId, quoteId), eq(comments.section, section))
    : eq(comments.quoteId, quoteId);

  return await db
    .select()
    .from(comments)
    .where(conditions)
    .orderBy(desc(comments.createdAt));
}

/**
 * Resolve a comment
 */
export async function resolveComment(commentId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(comments)
    .set({ isResolved: 1 })
    .where(eq(comments.id, commentId));
}

/**
 * Create a price negotiation
 */
export async function createNegotiation(data: InsertNegotiation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(negotiations).values(data);
  
  // Get the last inserted negotiation
  const result = await db
    .select()
    .from(negotiations)
    .where(eq(negotiations.quoteId, data.quoteId))
    .orderBy(desc(negotiations.id))
    .limit(1);
  
  return result[0];
}

/**
 * Get negotiations for a quote
 */
export async function getQuoteNegotiations(quoteId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(negotiations)
    .where(eq(negotiations.quoteId, quoteId))
    .orderBy(desc(negotiations.createdAt));
}

/**
 * Update negotiation status
 */
export async function updateNegotiationStatus(
  negotiationId: number,
  status: "pending" | "accepted" | "rejected" | "countered",
  userId: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(negotiations)
    .set({ status, updatedAt: new Date() })
    .where(eq(negotiations.id, negotiationId));
}
