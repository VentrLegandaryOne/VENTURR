/**
 * Structured Request Logging Module
 * Logs all API requests with timestamps, duration, and detailed metadata
 */

import { Request, Response } from 'express';

export interface RequestLog {
  id: string;
  timestamp: string;
  method: string;
  path: string;
  userId?: number;
  status: number;
  durationMs: number;
  userAgent?: string;
  ipAddress?: string;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
}

/**
 * In-memory request log storage
 * In production, this should be persisted to a database or logging service
 */
const requestLogs: RequestLog[] = [];
const MAX_LOGS = 10000; // Keep last 10k requests in memory

/**
 * Generate unique request ID
 */
function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(7)}`;
}

/**
 * Extract IP address from request
 */
function getClientIp(req: Request): string {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
    (req.headers['x-real-ip'] as string) ||
    req.socket.remoteAddress ||
    'unknown'
  );
}

/**
 * Create request logging middleware
 */
export function createRequestLoggingMiddleware() {
  return (req: Request, res: Response, next: Function) => {
    const requestId = generateRequestId();
    const startTime = Date.now();
    const originalSend = res.send;

    // Store request ID in response locals for later reference
    res.locals.requestId = requestId;

    // Override send to capture response
    res.send = function (data: any) {
      const durationMs = Date.now() - startTime;
      const status = res.statusCode;

      const log: RequestLog = {
        id: requestId,
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.path,
        status,
        durationMs,
        userAgent: req.headers['user-agent'],
        ipAddress: getClientIp(req),
      };

      // Extract user ID if available (from session or JWT)
      if ((req as any).user?.id) {
        log.userId = (req as any).user.id;
      }

      // Add to log storage
      addLog(log);

      // Log to console for immediate visibility
      const logMessage = `[${log.timestamp}] ${requestId} ${log.method} ${log.path} - ${status} (${durationMs}ms)`;
      if (status >= 500) {
        console.error(logMessage);
      } else if (status >= 400) {
        console.warn(logMessage);
      } else {
        console.log(logMessage);
      }

      // Call original send
      return originalSend.call(this, data);
    };

    next();
  };
}

/**
 * Add log entry to storage
 */
function addLog(log: RequestLog): void {
  requestLogs.push(log);

  // Keep only recent logs to avoid memory bloat
  if (requestLogs.length > MAX_LOGS) {
    requestLogs.shift();
  }
}

/**
 * Log an error
 */
export function logError(
  requestId: string,
  error: Error,
  additionalContext?: Record<string, unknown>
): void {
  const errorLog: RequestLog = {
    id: requestId,
    timestamp: new Date().toISOString(),
    method: 'ERROR',
    path: 'system',
    status: 500,
    durationMs: 0,
    error: {
      message: error.message,
      stack: error.stack,
      code: (error as any).code,
    },
  };

  if (additionalContext?.userId) {
    errorLog.userId = additionalContext.userId as number;
  }

  addLog(errorLog);

  console.error(
    `[ERROR] ${requestId} - ${error.message}`,
    additionalContext || {}
  );
}

/**
 * Get all request logs
 */
export function getAllLogs(limit: number = 100): RequestLog[] {
  return requestLogs.slice(-limit).reverse();
}

/**
 * Get logs for a specific user
 */
export function getLogsForUser(userId: number, limit: number = 100): RequestLog[] {
  return requestLogs
    .filter(log => log.userId === userId)
    .slice(-limit)
    .reverse();
}

/**
 * Get logs for a specific path
 */
export function getLogsForPath(path: string, limit: number = 100): RequestLog[] {
  return requestLogs
    .filter(log => log.path.includes(path))
    .slice(-limit)
    .reverse();
}

/**
 * Get error logs
 */
export function getErrorLogs(limit: number = 100): RequestLog[] {
  return requestLogs
    .filter(log => log.error || log.status >= 400)
    .slice(-limit)
    .reverse();
}

/**
 * Get request statistics
 */
export function getRequestStats(): {
  totalRequests: number;
  averageDurationMs: number;
  errorCount: number;
  statusCodes: Record<number, number>;
  methods: Record<string, number>;
  topPaths: Array<{ path: string; count: number; avgDurationMs: number }>;
} {
  const stats = {
    totalRequests: requestLogs.length,
    averageDurationMs: 0,
    errorCount: 0,
    statusCodes: {} as Record<number, number>,
    methods: {} as Record<string, number>,
    topPaths: [] as Array<{ path: string; count: number; avgDurationMs: number }>,
  };

  if (requestLogs.length === 0) {
    return stats;
  }

  const pathStats = new Map<string, { count: number; totalDuration: number }>();
  let totalDuration = 0;

  for (const log of requestLogs) {
    // Duration stats
    totalDuration += log.durationMs;

    // Status codes
    stats.statusCodes[log.status] = (stats.statusCodes[log.status] || 0) + 1;

    // Methods
    stats.methods[log.method] = (stats.methods[log.method] || 0) + 1;

    // Error count
    if (log.status >= 400 || log.error) {
      stats.errorCount++;
    }

    // Path stats
    if (!pathStats.has(log.path)) {
      pathStats.set(log.path, { count: 0, totalDuration: 0 });
    }
    const ps = pathStats.get(log.path)!;
    ps.count++;
    ps.totalDuration += log.durationMs;
  }

  stats.averageDurationMs = Math.round(totalDuration / requestLogs.length);

  // Get top paths
  stats.topPaths = Array.from(pathStats.entries())
    .map(([path, stats]) => ({
      path,
      count: stats.count,
      avgDurationMs: Math.round(stats.totalDuration / stats.count),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return stats;
}

/**
 * Clear old logs (for maintenance)
 */
export function clearOldLogs(olderThanMinutes: number = 60): number {
  const cutoffTime = Date.now() - olderThanMinutes * 60 * 1000;
  const initialLength = requestLogs.length;

  const filtered = requestLogs.filter(log => {
    const logTime = new Date(log.timestamp).getTime();
    return logTime > cutoffTime;
  });

  requestLogs.length = 0;
  requestLogs.push(...filtered);

  const removed = initialLength - requestLogs.length;
  console.log(`[RequestLogging] Cleared ${removed} old logs`);

  return removed;
}

/**
 * Export logs to JSON format
 */
export function exportLogsAsJson(limit: number = 1000): string {
  const logs = requestLogs.slice(-limit);
  return JSON.stringify(logs, null, 2);
}

/**
 * Export logs to CSV format
 */
export function exportLogsAsCsv(limit: number = 1000): string {
  const logs = requestLogs.slice(-limit);
  
  if (logs.length === 0) {
    return 'id,timestamp,method,path,userId,status,durationMs,userAgent,ipAddress\n';
  }

  const headers = 'id,timestamp,method,path,userId,status,durationMs,userAgent,ipAddress';
  const rows = logs.map(log =>
    [
      log.id,
      log.timestamp,
      log.method,
      log.path,
      log.userId || '',
      log.status,
      log.durationMs,
      (log.userAgent || '').replace(/,/g, ';'),
      log.ipAddress,
    ].join(',')
  );

  return [headers, ...rows].join('\n');
}
