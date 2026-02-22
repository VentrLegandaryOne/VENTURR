/**
 * Admin Dashboard Metrics Service
 * Provides comprehensive metrics for monitoring platform health and performance
 */

import { TRPCError } from '@trpc/server';
import { getRequestStats, getErrorLogs, getAllLogs } from './requestLogging';
import { getQuoteUploadRateLimitInfo, getAllRateLimitInfo } from './rateLimit';
import { getWebhookStats } from './webhookNotifications';

export interface MetricsSnapshot {
  timestamp: string;
  uptime: {
    startTime: string;
    uptimeMs: number;
    uptimeHours: number;
  };
  requests: {
    total: number;
    averageDurationMs: number;
    errorCount: number;
    errorRate: number;
    statusCodes: Record<number, number>;
    methods: Record<string, number>;
    topPaths: Array<{ path: string; count: number; avgDurationMs: number }>;
  };
  storage: {
    s3RetryStats: {
      totalAttempts: number;
      successfulUploads: number;
      failedUploads: number;
      averageRetries: number;
    };
  };
  rateLimiting: {
    activeUsers: number;
    uploadLimitExceeded: number;
    quotaUtilization: number;
  };
  webhooks: {
    total: number;
    enabled: number;
    disabled: number;
    byType: Record<string, number>;
  };
  errors: {
    recentErrors: Array<{
      timestamp: string;
      path: string;
      status: number;
      message?: string;
    }>;
    errorTrend: Array<{ hour: number; count: number }>;
  };
}

/**
 * Track S3 retry statistics
 */
const s3Stats = {
  totalAttempts: 0,
  successfulUploads: 0,
  failedUploads: 0,
  totalRetries: 0,
};

/**
 * Record S3 upload attempt
 */
export function recordS3Upload(success: boolean, retriesUsed: number): void {
  s3Stats.totalAttempts++;
  if (success) {
    s3Stats.successfulUploads++;
  } else {
    s3Stats.failedUploads++;
  }
  s3Stats.totalRetries += retriesUsed;
}

/**
 * Get S3 retry statistics
 */
export function getS3Stats() {
  return {
    totalAttempts: s3Stats.totalAttempts,
    successfulUploads: s3Stats.successfulUploads,
    failedUploads: s3Stats.failedUploads,
    averageRetries:
      s3Stats.totalAttempts > 0
        ? Math.round(s3Stats.totalRetries / s3Stats.totalAttempts * 10) / 10
        : 0,
  };
}

/**
 * Track rate limit violations
 */
const rateLimitStats = {
  uploadLimitExceeded: 0,
  activeUsers: new Set<number>(),
};

/**
 * Record rate limit exceeded event
 */
export function recordRateLimitExceeded(userId: number): void {
  rateLimitStats.uploadLimitExceeded++;
  rateLimitStats.activeUsers.add(userId);
}

/**
 * Get rate limit statistics
 */
export function getRateLimitStats() {
  return {
    uploadLimitExceeded: rateLimitStats.uploadLimitExceeded,
    activeUsers: rateLimitStats.activeUsers.size,
  };
}

/**
 * Server start time for uptime calculation
 */
let serverStartTime = Date.now();

/**
 * Reset server start time (for testing)
 */
export function resetServerStartTime(): void {
  serverStartTime = Date.now();
}

/**
 * Get comprehensive metrics snapshot
 */
export function getMetricsSnapshot(): MetricsSnapshot {
  const now = Date.now();
  const uptimeMs = now - serverStartTime;

  const requestStats = getRequestStats();
  const errorLogs = getErrorLogs(100);
  const webhookStats = getWebhookStats();
  const s3Stats_ = getS3Stats();
  const rateLimitStats_ = getRateLimitStats();

  // Calculate error rate
  const errorRate =
    requestStats.totalRequests > 0
      ? Math.round((requestStats.errorCount / requestStats.totalRequests) * 10000) / 100
      : 0;

  // Calculate quota utilization (based on rate limit exceeded events)
  const quotaUtilization =
    rateLimitStats_.activeUsers > 0
      ? Math.round(
          (rateLimitStats_.uploadLimitExceeded / (rateLimitStats_.activeUsers * 10)) * 100
        )
      : 0;

  // Build error trend (last 24 hours)
  const errorTrend: Array<{ hour: number; count: number }> = [];
  const now24h = now - 24 * 60 * 60 * 1000;

  for (let i = 0; i < 24; i++) {
    const hourStart = now24h + i * 60 * 60 * 1000;
    const hourEnd = hourStart + 60 * 60 * 1000;

    const errorsInHour = errorLogs.filter(log => {
      const logTime = new Date(log.timestamp).getTime();
      return logTime >= hourStart && logTime < hourEnd;
    }).length;

    errorTrend.push({
      hour: i,
      count: errorsInHour,
    });
  }

  return {
    timestamp: new Date().toISOString(),
    uptime: {
      startTime: new Date(serverStartTime).toISOString(),
      uptimeMs,
      uptimeHours: Math.round(uptimeMs / (60 * 60 * 1000) * 100) / 100,
    },
    requests: {
      total: requestStats.totalRequests,
      averageDurationMs: requestStats.averageDurationMs,
      errorCount: requestStats.errorCount,
      errorRate,
      statusCodes: requestStats.statusCodes,
      methods: requestStats.methods,
      topPaths: requestStats.topPaths,
    },
    storage: {
      s3RetryStats: s3Stats_,
    },
    rateLimiting: {
      activeUsers: rateLimitStats_.activeUsers,
      uploadLimitExceeded: rateLimitStats_.uploadLimitExceeded,
      quotaUtilization,
    },
    webhooks: webhookStats,
    errors: {
      recentErrors: errorLogs.slice(0, 10).map(log => ({
        timestamp: log.timestamp,
        path: log.path,
        status: log.status,
        message: log.error?.message,
      })),
      errorTrend,
    },
  };
}

/**
 * Get metrics for a specific time range
 */
export function getMetricsForTimeRange(
  startTime: Date,
  endTime: Date
): {
  period: { start: string; end: string };
  metrics: MetricsSnapshot;
} {
  return {
    period: {
      start: startTime.toISOString(),
      end: endTime.toISOString(),
    },
    metrics: getMetricsSnapshot(),
  };
}

/**
 * Get performance metrics
 */
export function getPerformanceMetrics() {
  const requestStats = getRequestStats();

  return {
    averageResponseTime: requestStats.averageDurationMs,
    p95ResponseTime: calculatePercentile(95),
    p99ResponseTime: calculatePercentile(99),
    slowestEndpoints: requestStats.topPaths
      .sort((a, b) => b.avgDurationMs - a.avgDurationMs)
      .slice(0, 5),
    fastestEndpoints: requestStats.topPaths
      .sort((a, b) => a.avgDurationMs - b.avgDurationMs)
      .slice(0, 5),
  };
}

/**
 * Calculate percentile response time
 * This is a simplified calculation - in production use proper percentile library
 */
function calculatePercentile(percentile: number): number {
  const allLogs = getAllLogs(1000);
  if (allLogs.length === 0) return 0;

  const sorted = allLogs
    .map(log => log.durationMs)
    .sort((a, b) => a - b);

  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

/**
 * Get health score (0-100)
 */
export function getHealthScore(): {
  score: number;
  components: Record<string, { score: number; status: 'healthy' | 'degraded' | 'critical' }>;
} {
  const metrics = getMetricsSnapshot();

  const components: Record<string, { score: number; status: 'healthy' | 'degraded' | 'critical' }> = {
    availability: {
      score: 100, // Uptime percentage
      status: metrics.requests.errorRate < 1 ? 'healthy' : metrics.requests.errorRate < 5 ? 'degraded' : 'critical',
    },
    performance: {
      score: Math.max(0, 100 - Math.min(metrics.requests.averageDurationMs / 10, 50)),
      status: metrics.requests.averageDurationMs < 100 ? 'healthy' : metrics.requests.averageDurationMs < 500 ? 'degraded' : 'critical',
    },
    storage: {
      score:
        metrics.storage.s3RetryStats.totalAttempts > 0
          ? Math.round(
              (metrics.storage.s3RetryStats.successfulUploads /
                metrics.storage.s3RetryStats.totalAttempts) *
                100
            )
          : 100,
      status:
        metrics.storage.s3RetryStats.totalAttempts === 0 ||
        metrics.storage.s3RetryStats.successfulUploads /
          metrics.storage.s3RetryStats.totalAttempts >
          0.95
          ? 'healthy'
          : 'degraded',
    },
    rateLimit: {
      score: Math.max(0, 100 - metrics.rateLimiting.quotaUtilization),
      status: metrics.rateLimiting.quotaUtilization < 50 ? 'healthy' : metrics.rateLimiting.quotaUtilization < 80 ? 'degraded' : 'critical',
    },
  };

  const overallScore = Math.round(
    (components.availability.score +
      components.performance.score +
      components.storage.score +
      components.rateLimit.score) /
      4
  );

  return {
    score: overallScore,
    components,
  };
}

/**
 * Verify admin access
 */
export function verifyAdminAccess(userRole?: string): void {
  if (userRole !== 'admin') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Admin access required',
    });
  }
}
