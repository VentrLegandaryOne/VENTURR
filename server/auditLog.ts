/**
 * Audit Logging System
 * Tracks sensitive operations for security and compliance
 */

import { getDb } from "./db";
import { sql } from "drizzle-orm";

export interface AuditLogEntry {
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: number;
  status: "success" | "failure";
  errorMessage?: string;
}

/**
 * Log an audit event
 */
export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  try {
    const db = await getDb();
    if (!db) return;
    
    await db.execute(sql`
      INSERT INTO audit_logs (
        user_id, action, resource, resource_id, details,
        ip_address, user_agent, timestamp, status, error_message
      ) VALUES (
        ${entry.userId},
        ${entry.action},
        ${entry.resource},
        ${entry.resourceId || null},
        ${entry.details ? JSON.stringify(entry.details) : null},
        ${entry.ipAddress || null},
        ${entry.userAgent || null},
        ${entry.timestamp},
        ${entry.status},
        ${entry.errorMessage || null}
      )
    `);
  } catch (error) {
    // Log to console if database logging fails
    console.error("Failed to write audit log:", error);
    console.log("Audit event:", entry);
  }
}

/**
 * Get audit logs for a user
 */
export async function getUserAuditLogs(
  userId: string,
  limit: number = 100
): Promise<AuditLogEntry[]> {
  const db = await getDb();
  if (!db) return [];
  
  const result: any = await db.execute(sql`
    SELECT * FROM audit_logs 
    WHERE user_id = ${userId}
    ORDER BY timestamp DESC 
    LIMIT ${limit}
  `);

  const rows = Array.isArray(result) ? result : result.rows || [];
  return rows.map((row: any) => ({
    userId: row.user_id,
    action: row.action,
    resource: row.resource,
    resourceId: row.resource_id,
    details: row.details ? JSON.parse(row.details) : undefined,
    ipAddress: row.ip_address,
    userAgent: row.user_agent,
    timestamp: row.timestamp,
    status: row.status,
    errorMessage: row.error_message,
  }));
}

/**
 * Get audit logs for a specific resource
 */
export async function getResourceAuditLogs(
  resource: string,
  resourceId: string,
  limit: number = 50
): Promise<AuditLogEntry[]> {
  const db = await getDb();
  if (!db) return [];
  
  const result: any = await db.execute(sql`
    SELECT * FROM audit_logs 
    WHERE resource = ${resource} AND resource_id = ${resourceId}
    ORDER BY timestamp DESC 
    LIMIT ${limit}
  `);

  const rows = Array.isArray(result) ? result : result.rows || [];
  return rows.map((row: any) => ({
    userId: row.user_id,
    action: row.action,
    resource: row.resource,
    resourceId: row.resource_id,
    details: row.details ? JSON.parse(row.details) : undefined,
    ipAddress: row.ip_address,
    userAgent: row.user_agent,
    timestamp: row.timestamp,
    status: row.status,
    errorMessage: row.error_message,
  }));
}

/**
 * Get failed login attempts
 */
export async function getFailedLoginAttempts(
  userId: string,
  since: number
): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  
  const result: any = await db.execute(sql`
    SELECT COUNT(*) as count FROM audit_logs 
    WHERE user_id = ${userId}
    AND action = 'login' 
    AND status = 'failure' 
    AND timestamp >= ${since}
  `);

  const rows = Array.isArray(result) ? result : result.rows || [];
  return rows[0]?.count || 0;
}

/**
 * Audit action types
 */
export const AuditActions = {
  // Authentication
  LOGIN: "login",
  LOGOUT: "logout",
  PASSWORD_CHANGE: "password_change",
  
  // Quote operations
  QUOTE_UPLOAD: "quote_upload",
  QUOTE_DELETE: "quote_delete",
  QUOTE_SHARE: "quote_share",
  QUOTE_DOWNLOAD: "quote_download",
  
  // Verification operations
  VERIFICATION_START: "verification_start",
  VERIFICATION_COMPLETE: "verification_complete",
  REPORT_DOWNLOAD: "report_download",
  
  // Settings
  SETTINGS_UPDATE: "settings_update",
  NOTIFICATION_PREFERENCES_UPDATE: "notification_preferences_update",
  
  // Admin operations
  USER_ROLE_CHANGE: "user_role_change",
  SYSTEM_CONFIG_CHANGE: "system_config_change",
} as const;

/**
 * Resource types
 */
export const AuditResources = {
  USER: "user",
  QUOTE: "quote",
  VERIFICATION: "verification",
  REPORT: "report",
  CONTRACTOR: "contractor",
  SETTINGS: "settings",
  SYSTEM: "system",
} as const;

/**
 * Helper to create audit log middleware
 */
export function createAuditMiddleware(action: string, resource: string) {
  return async (ctx: any, next: any) => {
    const startTime = Date.now();
    let status: "success" | "failure" = "success";
    let errorMessage: string | undefined;

    try {
      const result = await next();
      return result;
    } catch (error) {
      status = "failure";
      errorMessage = error instanceof Error ? error.message : "Unknown error";
      throw error;
    } finally {
      // Log after operation completes
      await logAuditEvent({
        userId: ctx.user?.id || "anonymous",
        action,
        resource,
        resourceId: ctx.input?.id || ctx.input?.quoteId,
        details: {
          duration: Date.now() - startTime,
          input: ctx.input,
        },
        ipAddress: ctx.req?.ip,
        userAgent: ctx.req?.headers?.["user-agent"],
        timestamp: Date.now(),
        status,
        errorMessage,
      });
    }
  };
}
