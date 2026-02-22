/**
 * Security logging utilities for audit trail and suspicious activity detection
 */

export type SecurityEventType =
  | "auth_success"
  | "auth_failure"
  | "unauthorized_access"
  | "suspicious_activity"
  | "rate_limit_exceeded"
  | "file_upload"
  | "data_export"
  | "admin_action"
  | "password_reset"
  | "account_lockout";

export interface SecurityEvent {
  type: SecurityEventType;
  userId?: number;
  userEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  resource?: string;
  action?: string;
  details?: Record<string, any>;
  timestamp: Date;
  severity: "low" | "medium" | "high" | "critical";
}

// In-memory security event log for audit trail
const securityEventLog: SecurityEvent[] = [];
const MAX_SECURITY_EVENTS = 5000;

/**
 * Log security event and broadcast critical alerts via webhooks
 */
export function logSecurityEvent(event: Omit<SecurityEvent, "timestamp">): void {
  const fullEvent: SecurityEvent = {
    ...event,
    timestamp: new Date(),
  };

  // Store in audit log
  securityEventLog.push(fullEvent);
  if (securityEventLog.length > MAX_SECURITY_EVENTS) {
    securityEventLog.shift();
  }

  // Log to console with structured format
  console.log("[SECURITY]", JSON.stringify(fullEvent));

  // Broadcast critical and high severity events via webhook notifications
  if (fullEvent.severity === 'critical' || fullEvent.severity === 'high') {
    broadcastSecurityAlert(fullEvent).catch(err => {
      console.error('[SECURITY] Failed to broadcast security alert:', err);
    });
  }
}

/**
 * Broadcast security alert via webhook notification system
 */
async function broadcastSecurityAlert(event: SecurityEvent): Promise<void> {
  try {
    const { broadcastHealthAlert } = await import('../webhookNotifications');
    // Use health alert format to send security notifications
    await broadcastHealthAlert({
      status: event.severity === 'critical' ? 'critical' : 'degraded',
      timestamp: event.timestamp.toISOString(),
      services: {
        database: { status: 'up', latencyMs: 0 },
        redis: { status: 'up', latencyMs: 0, optional: true },
        storage: { status: 'up', latencyMs: 0 },
      },
      totalLatencyMs: 0,
    });
  } catch {
    // Silently fail - webhook system may not be configured
  }
}

/**
 * Get recent security events for admin review
 */
export function getSecurityEvents(limit: number = 100): SecurityEvent[] {
  return securityEventLog.slice(-limit).reverse();
}

/**
 * Get security events by severity
 */
export function getSecurityEventsBySeverity(severity: SecurityEvent['severity'], limit: number = 50): SecurityEvent[] {
  return securityEventLog
    .filter(e => e.severity === severity)
    .slice(-limit)
    .reverse();
}

/**
 * Get security event statistics
 */
export function getSecurityStats(): {
  total: number;
  bySeverity: Record<string, number>;
  byType: Record<string, number>;
  recentCritical: number;
} {
  const stats = {
    total: securityEventLog.length,
    bySeverity: {} as Record<string, number>,
    byType: {} as Record<string, number>,
    recentCritical: 0,
  };

  const oneHourAgo = Date.now() - 3600000;

  for (const event of securityEventLog) {
    stats.bySeverity[event.severity] = (stats.bySeverity[event.severity] || 0) + 1;
    stats.byType[event.type] = (stats.byType[event.type] || 0) + 1;
    if (event.severity === 'critical' && event.timestamp.getTime() > oneHourAgo) {
      stats.recentCritical++;
    }
  }

  return stats;
}

/**
 * Log authentication attempt
 */
export function logAuthAttempt(params: {
  success: boolean;
  userId?: number;
  userEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  reason?: string;
}): void {
  logSecurityEvent({
    type: params.success ? "auth_success" : "auth_failure",
    userId: params.userId,
    userEmail: params.userEmail,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    details: { reason: params.reason },
    severity: params.success ? "low" : "medium",
  });
}

/**
 * Log unauthorized access attempt
 */
export function logUnauthorizedAccess(params: {
  userId: number;
  resource: string;
  action: string;
  ipAddress?: string;
}): void {
  logSecurityEvent({
    type: "unauthorized_access",
    userId: params.userId,
    resource: params.resource,
    action: params.action,
    ipAddress: params.ipAddress,
    severity: "high",
  });
}

/**
 * Log suspicious activity
 */
export function logSuspiciousActivity(params: {
  userId?: number;
  activity: string;
  details: Record<string, any>;
  ipAddress?: string;
}): void {
  logSecurityEvent({
    type: "suspicious_activity",
    userId: params.userId,
    details: { activity: params.activity, ...params.details },
    ipAddress: params.ipAddress,
    severity: "high",
  });
}

/**
 * Log file upload
 */
export function logFileUpload(params: {
  userId: number;
  fileName: string;
  fileSize: number;
  fileType: string;
  ipAddress?: string;
}): void {
  logSecurityEvent({
    type: "file_upload",
    userId: params.userId,
    details: {
      fileName: params.fileName,
      fileSize: params.fileSize,
      fileType: params.fileType,
    },
    ipAddress: params.ipAddress,
    severity: "low",
  });
}

/**
 * Log data export
 */
export function logDataExport(params: {
  userId: number;
  resource: string;
  format: string;
  recordCount?: number;
  ipAddress?: string;
}): void {
  logSecurityEvent({
    type: "data_export",
    userId: params.userId,
    resource: params.resource,
    details: {
      format: params.format,
      recordCount: params.recordCount,
    },
    ipAddress: params.ipAddress,
    severity: "medium",
  });
}

/**
 * Log admin action
 */
export function logAdminAction(params: {
  userId: number;
  action: string;
  targetUserId?: number;
  details: Record<string, any>;
  ipAddress?: string;
}): void {
  logSecurityEvent({
    type: "admin_action",
    userId: params.userId,
    action: params.action,
    details: {
      targetUserId: params.targetUserId,
      ...params.details,
    },
    ipAddress: params.ipAddress,
    severity: "high",
  });
}
