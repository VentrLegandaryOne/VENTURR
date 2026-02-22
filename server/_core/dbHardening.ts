/**
 * Database Hardening Module for VENTURR VALDT
 * Provides transaction management, optimistic locking, and query safety
 */

import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { sql } from "drizzle-orm";

// ============================================
// TRANSACTION MANAGEMENT
// ============================================

interface TransactionOptions {
  timeout?: number;
  retries?: number;
  isolationLevel?: "READ UNCOMMITTED" | "READ COMMITTED" | "REPEATABLE READ" | "SERIALIZABLE";
}

const DEFAULT_TRANSACTION_OPTIONS: TransactionOptions = {
  timeout: 30000, // 30 seconds
  retries: 3,
  isolationLevel: "READ COMMITTED",
};

/**
 * Execute database operation within a transaction with automatic rollback on error
 */
export async function withTransaction<T>(
  operation: (db: Awaited<ReturnType<typeof getDb>>) => Promise<T>,
  options: TransactionOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_TRANSACTION_OPTIONS, ...options };
  let lastError: Error | null = null;
  const db = await getDb();
  
  if (!db) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Database not available",
    });
  }

  for (let attempt = 1; attempt <= (opts.retries || 1); attempt++) {
    try {
      // Create a timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new TRPCError({
            code: "TIMEOUT",
            message: "Database transaction timed out",
          }));
        }, opts.timeout);
      });

      // Execute transaction with timeout
      const result = await Promise.race([
        db.transaction(async (tx) => {
          return await operation(tx as unknown as Awaited<ReturnType<typeof getDb>>);
        }),
        timeoutPromise,
      ]);

      return result;
    } catch (error) {
      lastError = error as Error;

      // Check if error is retryable (deadlock, lock timeout)
      if (isRetryableDbError(error) && attempt < (opts.retries || 1)) {
        // Exponential backoff
        await sleep(Math.pow(2, attempt) * 100);
        continue;
      }

      throw error;
    }
  }

  throw lastError;
}

/**
 * Check if database error is retryable
 */
function isRetryableDbError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  
  const err = error as { code?: string; message?: string };
  
  // MySQL/TiDB error codes for retryable errors
  const retryableCodes = [
    "ER_LOCK_DEADLOCK",
    "ER_LOCK_WAIT_TIMEOUT",
    "ER_LOCK_ABORTED",
    "PROTOCOL_CONNECTION_LOST",
    "ECONNRESET",
  ];

  if (err.code && retryableCodes.includes(err.code)) {
    return true;
  }

  // Check message for deadlock indicators
  if (err.message?.toLowerCase().includes("deadlock")) {
    return true;
  }

  return false;
}

/**
 * Sleep helper
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// OPTIMISTIC LOCKING
// ============================================

/**
 * Optimistic locking error
 */
export class OptimisticLockError extends Error {
  constructor(message: string = "Record was modified by another process") {
    super(message);
    this.name = "OptimisticLockError";
  }
}

/**
 * Update record with optimistic locking using version column
 */
export async function updateWithOptimisticLock<T extends { id: number; version: number }>(
  tableName: string,
  id: number,
  currentVersion: number,
  updates: Partial<T>
): Promise<{ success: boolean; newVersion: number }> {
  const db = await getDb();
  if (!db) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Database not available",
    });
  }
  
  // Increment version
  const newVersion = currentVersion + 1;

  // Build update query with version check
  const result = await db.execute(sql`
    UPDATE ${sql.identifier(tableName)}
    SET ${sql.join(
      Object.entries(updates).map(([key, value]) => 
        sql`${sql.identifier(key)} = ${value}`
      ),
      sql`, `
    )}, version = ${newVersion}
    WHERE id = ${id} AND version = ${currentVersion}
  `);

  // Check if update was successful
  const affectedRows = (result as { rowsAffected?: number }).rowsAffected || 0;

  if (affectedRows === 0) {
    throw new OptimisticLockError();
  }

  return { success: true, newVersion };
}

/**
 * Retry operation with optimistic locking
 */
export async function withOptimisticLockRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof OptimisticLockError && attempt < maxRetries) {
        lastError = error;
        // Exponential backoff with jitter
        await sleep(Math.pow(2, attempt) * 50 + Math.random() * 50);
        continue;
      }
      throw error;
    }
  }

  throw lastError;
}

// ============================================
// QUERY SAFETY
// ============================================

/**
 * Validate query parameters to prevent injection
 */
export function validateQueryParams(params: Record<string, unknown>): void {
  for (const [key, value] of Object.entries(params)) {
    // Check for SQL injection patterns in string values
    if (typeof value === "string") {
      const dangerousPatterns = [
        /;\s*DROP/i,
        /;\s*DELETE/i,
        /;\s*UPDATE/i,
        /;\s*INSERT/i,
        /UNION\s+SELECT/i,
        /--/,
        /\/\*/,
      ];

      for (const pattern of dangerousPatterns) {
        if (pattern.test(value)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Invalid characters in parameter: ${key}`,
          });
        }
      }
    }

    // Validate numeric parameters
    if (key.endsWith("Id") || key === "id" || key === "limit" || key === "offset") {
      if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Invalid ${key}: must be a non-negative integer`,
        });
      }
    }
  }
}

/**
 * Safe pagination with bounds checking
 */
export function safePagination(
  limit?: number,
  offset?: number
): { limit: number; offset: number } {
  const MAX_LIMIT = 100;
  const DEFAULT_LIMIT = 20;

  return {
    limit: Math.min(Math.max(1, limit || DEFAULT_LIMIT), MAX_LIMIT),
    offset: Math.max(0, offset || 0),
  };
}

// ============================================
// CONNECTION POOL MONITORING
// ============================================

interface PoolStats {
  activeConnections: number;
  idleConnections: number;
  waitingRequests: number;
  totalConnections: number;
}

/**
 * Get connection pool statistics
 */
export function getPoolStats(): PoolStats {
  // This would integrate with your actual connection pool
  // For Drizzle with mysql2, you'd access the pool directly
  return {
    activeConnections: 0,
    idleConnections: 0,
    waitingRequests: 0,
    totalConnections: 0,
  };
}

/**
 * Check if pool is healthy
 */
export function isPoolHealthy(): boolean {
  const stats = getPoolStats();
  
  // Pool is unhealthy if too many waiting requests
  if (stats.waitingRequests > 50) {
    return false;
  }

  // Pool is unhealthy if all connections are active
  if (stats.activeConnections >= stats.totalConnections && stats.totalConnections > 0) {
    return false;
  }

  return true;
}

// ============================================
// QUERY TIMEOUT
// ============================================

/**
 * Execute query with timeout
 */
export async function queryWithTimeout<T>(
  query: () => Promise<T>,
  timeoutMs: number = 10000
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new TRPCError({
        code: "TIMEOUT",
        message: "Database query timed out",
      }));
    }, timeoutMs);
  });

  return Promise.race([query(), timeoutPromise]);
}

// ============================================
// AUDIT LOGGING
// ============================================

interface AuditLogEntry {
  userId: number;
  action: string;
  tableName: string;
  recordId: number;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  timestamp: Date;
  ipAddress?: string;
}

const auditLog: AuditLogEntry[] = [];

/**
 * Log database change for audit trail
 */
export function logDatabaseChange(entry: Omit<AuditLogEntry, "timestamp">): void {
  auditLog.push({
    ...entry,
    timestamp: new Date(),
  });

  // In production, this would write to a separate audit table or service
  console.log(`[Audit] ${entry.action} on ${entry.tableName}:${entry.recordId} by user ${entry.userId}`);
}

/**
 * Get audit log entries for a record
 */
export function getAuditLog(
  tableName: string,
  recordId: number,
  limit: number = 50
): AuditLogEntry[] {
  return auditLog
    .filter(entry => entry.tableName === tableName && entry.recordId === recordId)
    .slice(-limit);
}

// ============================================
// SOFT DELETE SUPPORT
// ============================================

/**
 * Soft delete a record instead of hard delete
 */
export async function softDelete(
  tableName: string,
  id: number,
  userId: number
): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Database not available",
    });
  }
  
  await db.execute(sql`
    UPDATE ${sql.identifier(tableName)}
    SET deleted_at = NOW(), deleted_by = ${userId}
    WHERE id = ${id} AND deleted_at IS NULL
  `);

  logDatabaseChange({
    userId,
    action: "SOFT_DELETE",
    tableName,
    recordId: id,
  });
}

/**
 * Restore a soft-deleted record
 */
export async function restoreDeleted(
  tableName: string,
  id: number,
  userId: number
): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Database not available",
    });
  }
  
  await db.execute(sql`
    UPDATE ${sql.identifier(tableName)}
    SET deleted_at = NULL, deleted_by = NULL
    WHERE id = ${id}
  `);

  logDatabaseChange({
    userId,
    action: "RESTORE",
    tableName,
    recordId: id,
  });
}

// ============================================
// DATA INTEGRITY CHECKS
// ============================================

/**
 * Verify referential integrity for a record
 */
export async function verifyReferentialIntegrity(
  tableName: string,
  recordId: number,
  foreignKeys: Array<{ table: string; column: string; value: number }>
): Promise<{ valid: boolean; errors: string[] }> {
  const db = await getDb();
  if (!db) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Database not available",
    });
  }
  
  const errors: string[] = [];

  for (const fk of foreignKeys) {
    const result = await db.execute(sql`
      SELECT COUNT(*) as count FROM ${sql.identifier(fk.table)}
      WHERE ${sql.identifier(fk.column)} = ${fk.value}
    `);

    const rows = result as unknown as Array<{ count: number }>;
    const count = rows[0]?.count || 0;
    
    if (count === 0) {
      errors.push(`Referenced ${fk.table}.${fk.column} = ${fk.value} does not exist`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Check for orphaned records
 */
export async function findOrphanedRecords(
  childTable: string,
  parentTable: string,
  foreignKeyColumn: string,
  parentIdColumn: string = "id"
): Promise<number[]> {
  const db = await getDb();
  if (!db) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Database not available",
    });
  }
  
  const result = await db.execute(sql`
    SELECT c.id FROM ${sql.identifier(childTable)} c
    LEFT JOIN ${sql.identifier(parentTable)} p ON c.${sql.identifier(foreignKeyColumn)} = p.${sql.identifier(parentIdColumn)}
    WHERE p.${sql.identifier(parentIdColumn)} IS NULL
  `);

  const rows = result as unknown as Array<{ id: number }>;
  return rows.map(row => row.id);
}
