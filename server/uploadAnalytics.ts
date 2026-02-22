/**
 * Upload Analytics Database Helpers
 * 
 * Tracks upload performance, success rates, and error patterns to optimize user experience.
 */

import { getDb } from "./db";
import { uploadAnalytics, type InsertUploadAnalytics, type UploadAnalytics } from "../drizzle/schema";
import { eq, and, gte, sql, desc } from "drizzle-orm";

/**
 * Start tracking a new upload
 */
export async function trackUploadStart(data: {
  userId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
}): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const now = Date.now();
  
  const [result] = await db.insert(uploadAnalytics).values({
    userId: data.userId,
    fileName: data.fileName,
    fileSize: data.fileSize,
    fileType: data.fileType,
    uploadStartedAt: now,
    status: "uploading",
    retryCount: 0,
    createdAt: now,
  });

  return result.insertId;
}

/**
 * Mark upload as completed and start processing
 */
export async function trackUploadComplete(analyticsId: number, quoteId?: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const now = Date.now();
  
  // Get the record to calculate duration
  const [record] = await db
    .select()
    .from(uploadAnalytics)
    .where(eq(uploadAnalytics.id, analyticsId));

  if (!record) return;

  const uploadDuration = now - record.uploadStartedAt;

  await db
    .update(uploadAnalytics)
    .set({
      quoteId,
      uploadCompletedAt: now,
      processingStartedAt: now,
      status: "processing",
      uploadDurationMs: uploadDuration,
    })
    .where(eq(uploadAnalytics.id, analyticsId));
}

/**
 * Mark processing as completed
 */
export async function trackProcessingComplete(analyticsId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const now = Date.now();
  
  // Get the record to calculate durations
  const [record] = await db
    .select()
    .from(uploadAnalytics)
    .where(eq(uploadAnalytics.id, analyticsId));

  if (!record || !record.processingStartedAt) return;

  const processingDuration = now - record.processingStartedAt;
  const totalDuration = now - record.uploadStartedAt;

  await db
    .update(uploadAnalytics)
    .set({
      processingCompletedAt: now,
      status: "completed",
      processingDurationMs: processingDuration,
      totalDurationMs: totalDuration,
    })
    .where(eq(uploadAnalytics.id, analyticsId));
}

/**
 * Mark upload/processing as failed
 */
export async function trackUploadFailure(
  analyticsId: number,
  errorType: string,
  errorMessage: string
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const now = Date.now();
  
  // Get the record to calculate durations
  const [record] = await db
    .select()
    .from(uploadAnalytics)
    .where(eq(uploadAnalytics.id, analyticsId));

  if (!record) return;

  const totalDuration = now - record.uploadStartedAt;

  await db
    .update(uploadAnalytics)
    .set({
      status: "failed",
      errorType,
      errorMessage,
      totalDurationMs: totalDuration,
    })
    .where(eq(uploadAnalytics.id, analyticsId));
}

/**
 * Increment retry count
 */
export async function incrementRetryCount(analyticsId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(uploadAnalytics)
    .set({
      retryCount: sql`${uploadAnalytics.retryCount} + 1`,
    })
    .where(eq(uploadAnalytics.id, analyticsId));
}

/**
 * Get analytics summary for a user
 */
export async function getUserAnalyticsSummary(userId: string, daysBack: number = 30) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const cutoffTime = Date.now() - daysBack * 24 * 60 * 60 * 1000;

  const records = await db
    .select()
    .from(uploadAnalytics)
    .where(
      and(
        eq(uploadAnalytics.userId, userId),
        gte(uploadAnalytics.createdAt, cutoffTime)
      )
    );

  const total = records.length;
  const completed = records.filter((r: UploadAnalytics) => r.status === "completed").length;
  const failed = records.filter((r: UploadAnalytics) => r.status === "failed").length;
  const successRate = total > 0 ? (completed / total) * 100 : 0;

  const completedRecords = records.filter(
    (r: UploadAnalytics) => r.status === "completed" && r.totalDurationMs
  );
  const avgDuration =
    completedRecords.length > 0
      ? completedRecords.reduce((sum: number, r: UploadAnalytics) => sum + (r.totalDurationMs || 0), 0) /
        completedRecords.length
      : 0;

  // Group errors by type
  const errorCounts: Record<string, number> = {};
  records
    .filter((r: UploadAnalytics) => r.status === "failed" && r.errorType)
    .forEach((r: UploadAnalytics) => {
      const errorType = r.errorType!;
      errorCounts[errorType] = (errorCounts[errorType] || 0) + 1;
    });

  return {
    total,
    completed,
    failed,
    successRate: Math.round(successRate * 10) / 10,
    avgDurationMs: Math.round(avgDuration),
    avgDurationSeconds: Math.round(avgDuration / 1000),
    errorCounts,
  };
}

/**
 * Get system-wide analytics (admin only)
 */
export async function getSystemAnalyticsSummary(daysBack: number = 30) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const cutoffTime = Date.now() - daysBack * 24 * 60 * 60 * 1000;

  const records = await db
    .select()
    .from(uploadAnalytics)
    .where(gte(uploadAnalytics.createdAt, cutoffTime));

  const total = records.length;
  const completed = records.filter((r: UploadAnalytics) => r.status === "completed").length;
  const failed = records.filter((r: UploadAnalytics) => r.status === "failed").length;
  const successRate = total > 0 ? (completed / total) * 100 : 0;

  const completedRecords = records.filter(
    (r: UploadAnalytics) => r.status === "completed" && r.totalDurationMs
  );
  const avgDuration =
    completedRecords.length > 0
      ? completedRecords.reduce((sum: number, r: UploadAnalytics) => sum + (r.totalDurationMs || 0), 0) /
        completedRecords.length
      : 0;

  // Group errors by type
  const errorCounts: Record<string, number> = {};
  records
    .filter((r: UploadAnalytics) => r.status === "failed" && r.errorType)
    .forEach((r: UploadAnalytics) => {
      const errorType = r.errorType!;
      errorCounts[errorType] = (errorCounts[errorType] || 0) + 1;
    });

  // Get top error types
  const topErrors = Object.entries(errorCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([type, count]) => ({ type, count }));

  // Calculate average file size
  const avgFileSize =
    records.length > 0
      ? records.reduce((sum: number, r: UploadAnalytics) => sum + r.fileSize, 0) / records.length
      : 0;

  return {
    total,
    completed,
    failed,
    successRate: Math.round(successRate * 10) / 10,
    avgDurationMs: Math.round(avgDuration),
    avgDurationSeconds: Math.round(avgDuration / 1000),
    avgFileSizeMB: Math.round((avgFileSize / 1024 / 1024) * 100) / 100,
    topErrors,
  };
}

/**
 * Get recent failed uploads for debugging
 */
export async function getRecentFailures(limit: number = 20) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db
    .select()
    .from(uploadAnalytics)
    .where(eq(uploadAnalytics.status, "failed"))
    .orderBy(desc(uploadAnalytics.createdAt))
    .limit(limit);
}
