import { getDb } from "../db";
import { auditLogs } from "../../drizzle/schema";

/**
 * Comprehensive audit logging system for Venturr
 * Tracks all significant actions for compliance and debugging
 */

export enum AuditAction {
  // Authentication
  LOGIN = "LOGIN",
  LOGOUT = "LOGOUT",
  LOGIN_FAILED = "LOGIN_FAILED",

  // Organization
  ORG_CREATED = "ORG_CREATED",
  ORG_UPDATED = "ORG_UPDATED",
  ORG_DELETED = "ORG_DELETED",

  // Projects
  PROJECT_CREATED = "PROJECT_CREATED",
  PROJECT_UPDATED = "PROJECT_UPDATED",
  PROJECT_DELETED = "PROJECT_DELETED",
  PROJECT_STATUS_CHANGED = "PROJECT_STATUS_CHANGED",

  // Measurements
  MEASUREMENT_CREATED = "MEASUREMENT_CREATED",
  MEASUREMENT_UPDATED = "MEASUREMENT_UPDATED",
  MEASUREMENT_DELETED = "MEASUREMENT_DELETED",

  // Takeoffs
  TAKEOFF_CREATED = "TAKEOFF_CREATED",
  TAKEOFF_UPDATED = "TAKEOFF_UPDATED",
  TAKEOFF_DELETED = "TAKEOFF_DELETED",

  // Quotes
  QUOTE_CREATED = "QUOTE_CREATED",
  QUOTE_UPDATED = "QUOTE_UPDATED",
  QUOTE_DELETED = "QUOTE_DELETED",
  QUOTE_SENT = "QUOTE_SENT",
  QUOTE_ACCEPTED = "QUOTE_ACCEPTED",
  QUOTE_REJECTED = "QUOTE_REJECTED",

  // Clients
  CLIENT_CREATED = "CLIENT_CREATED",
  CLIENT_UPDATED = "CLIENT_UPDATED",
  CLIENT_DELETED = "CLIENT_DELETED",

  // Materials
  MATERIAL_CREATED = "MATERIAL_CREATED",
  MATERIAL_UPDATED = "MATERIAL_UPDATED",
  MATERIAL_DELETED = "MATERIAL_DELETED",

  // Payments
  PAYMENT_PROCESSED = "PAYMENT_PROCESSED",
  PAYMENT_FAILED = "PAYMENT_FAILED",
  SUBSCRIPTION_CHANGED = "SUBSCRIPTION_CHANGED",

  // Data
  DATA_EXPORTED = "DATA_EXPORTED",
  DATA_IMPORTED = "DATA_IMPORTED",

  // System
  SYSTEM_ERROR = "SYSTEM_ERROR",
  SECURITY_EVENT = "SECURITY_EVENT",
}

export interface AuditLogEntry {
  id?: string;
  userId: string;
  organizationId?: string;
  action: AuditAction;
  resourceType: string;
  resourceId: string;
  changes?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  status: "success" | "failure";
  errorMessage?: string;
  timestamp?: Date;
}

/**
 * Log an audit event
 */
export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  try {
    const db = await getDb();
    if (!db) {
      console.warn("[AuditLogger] Database not available");
      return;
    }

    await db.insert(auditLogs).values({
      id: entry.id || `audit-${Date.now()}-${Math.random()}`,
      userId: entry.userId,
      organizationId: entry.organizationId,
      action: entry.action,
      resourceType: entry.resourceType,
      resourceId: entry.resourceId,
      changes: entry.changes ? JSON.stringify(entry.changes) : null,
      metadata: entry.metadata ? JSON.stringify(entry.metadata) : null,
      ipAddress: entry.ipAddress,
      userAgent: entry.userAgent,
      status: entry.status,
      errorMessage: entry.errorMessage,
      createdAt: entry.timestamp || new Date(),
    });
  } catch (error) {
    console.error("[AuditLogger] Failed to log audit event:", error);
    // Don't throw - audit logging should not break the main operation
  }
}

/**
 * Get audit logs for a user
 */
export async function getUserAuditLogs(
  userId: string,
  limit: number = 100,
  offset: number = 0
) {
  try {
    const db = await getDb();
    if (!db) return [];

    return await db
      .select()
      .from(auditLogs)
      .where((logs) => logs.userId === userId)
      .orderBy((logs) => logs.createdAt)
      .limit(limit)
      .offset(offset);
  } catch (error) {
    console.error("[AuditLogger] Failed to retrieve user audit logs:", error);
    return [];
  }
}

/**
 * Get audit logs for an organization
 */
export async function getOrganizationAuditLogs(
  organizationId: string,
  limit: number = 100,
  offset: number = 0
) {
  try {
    const db = await getDb();
    if (!db) return [];

    return await db
      .select()
      .from(auditLogs)
      .where((logs) => logs.organizationId === organizationId)
      .orderBy((logs) => logs.createdAt)
      .limit(limit)
      .offset(offset);
  } catch (error) {
    console.error(
      "[AuditLogger] Failed to retrieve organization audit logs:",
      error
    );
    return [];
  }
}

/**
 * Get audit logs for a specific resource
 */
export async function getResourceAuditLogs(
  resourceType: string,
  resourceId: string
) {
  try {
    const db = await getDb();
    if (!db) return [];

    return await db
      .select()
      .from(auditLogs)
      .where(
        (logs) =>
          logs.resourceType === resourceType && logs.resourceId === resourceId
      )
      .orderBy((logs) => logs.createdAt);
  } catch (error) {
    console.error(
      "[AuditLogger] Failed to retrieve resource audit logs:",
      error
    );
    return [];
  }
}

/**
 * Helper to track changes between old and new values
 */
export function trackChanges(
  oldValues: Record<string, unknown>,
  newValues: Record<string, unknown>
): Record<string, { from: unknown; to: unknown }> {
  const changes: Record<string, { from: unknown; to: unknown }> = {};

  const allKeys = new Set([
    ...Object.keys(oldValues),
    ...Object.keys(newValues),
  ]);

  allKeys.forEach((key) => {
    const oldValue = oldValues[key];
    const newValue = newValues[key];

    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      changes[key] = { from: oldValue, to: newValue };
    }
  });

  return changes;
}

/**
 * Helper to extract IP address from request
 */
export function extractIpAddress(req: any): string | undefined {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.headers["x-real-ip"] ||
    req.socket?.remoteAddress
  );
}

/**
 * Helper to extract user agent from request
 */
export function extractUserAgent(req: any): string | undefined {
  return req.headers["user-agent"];
}

/**
 * Audit log cleanup (remove logs older than specified days)
 */
export async function cleanupOldAuditLogs(daysToKeep: number = 90): Promise<void> {
  try {
    const db = await getDb();
    if (!db) return;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    // Note: This would require a delete query implementation
    // For now, just log the action
    console.log(
      `[AuditLogger] Cleanup: Would remove logs older than ${cutoffDate.toISOString()}`
    );
  } catch (error) {
    console.error("[AuditLogger] Failed to cleanup old audit logs:", error);
  }
}

/**
 * Generate audit report
 */
export async function generateAuditReport(
  organizationId: string,
  startDate: Date,
  endDate: Date
) {
  try {
    const db = await getDb();
    if (!db) return null;

    const logs = await db
      .select()
      .from(auditLogs)
      .where(
        (l) =>
          l.organizationId === organizationId &&
          l.createdAt >= startDate &&
          l.createdAt <= endDate
      )
      .orderBy((l) => l.createdAt);

    // Group by action
    const actionCounts: Record<string, number> = {};
    const userActions: Record<string, number> = {};
    const failureCount = logs.filter((l) => l.status === "failure").length;

    logs.forEach((log) => {
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
      userActions[log.userId] = (userActions[log.userId] || 0) + 1;
    });

    return {
      organizationId,
      period: { startDate, endDate },
      totalEvents: logs.length,
      successfulEvents: logs.length - failureCount,
      failedEvents: failureCount,
      actionCounts,
      userActions,
      logs,
    };
  } catch (error) {
    console.error("[AuditLogger] Failed to generate audit report:", error);
    return null;
  }
}

