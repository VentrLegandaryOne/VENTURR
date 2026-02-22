/**
 * Monitoring & Observability Test Suite
 * Tests webhook notifications, request logging, and admin metrics
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  getMetricsSnapshot,
  getHealthScore,
  recordS3Upload,
  recordRateLimitExceeded,
  resetServerStartTime,
} from './adminMetrics';
import {
  getAllLogs,
  getErrorLogs,
  getRequestStats,
  exportLogsAsJson,
  exportLogsAsCsv,
} from './requestLogging';
import {
  getWebhooks,
  registerWebhook,
  unregisterWebhook,
  getWebhookStats,
  broadcastHealthAlert,
} from './webhookNotifications';

describe('Admin Metrics', () => {
  beforeEach(() => {
    resetServerStartTime();
  });

  describe('getMetricsSnapshot', () => {
    it('should return metrics snapshot with all required fields', () => {
      const snapshot = getMetricsSnapshot();

      expect(snapshot).toHaveProperty('timestamp');
      expect(snapshot).toHaveProperty('uptime');
      expect(snapshot).toHaveProperty('requests');
      expect(snapshot).toHaveProperty('storage');
      expect(snapshot).toHaveProperty('rateLimiting');
      expect(snapshot).toHaveProperty('webhooks');
      expect(snapshot).toHaveProperty('errors');
    });

    it('should track uptime correctly', () => {
      const snapshot = getMetricsSnapshot();

      expect(snapshot.uptime.uptimeMs).toBeGreaterThanOrEqual(0);
      expect(snapshot.uptime.uptimeHours).toBeGreaterThanOrEqual(0);
      expect(snapshot.uptime.startTime).toBeDefined();
    });

    it('should include request statistics', () => {
      const snapshot = getMetricsSnapshot();

      expect(snapshot.requests).toHaveProperty('total');
      expect(snapshot.requests).toHaveProperty('averageDurationMs');
      expect(snapshot.requests).toHaveProperty('errorCount');
      expect(snapshot.requests).toHaveProperty('errorRate');
      expect(snapshot.requests).toHaveProperty('statusCodes');
      expect(snapshot.requests).toHaveProperty('methods');
      expect(snapshot.requests).toHaveProperty('topPaths');
    });
  });

  describe('getHealthScore', () => {
    it('should return health score between 0 and 100', () => {
      const health = getHealthScore();

      expect(health.score).toBeGreaterThanOrEqual(0);
      expect(health.score).toBeLessThanOrEqual(100);
    });

    it('should include component scores', () => {
      const health = getHealthScore();

      expect(health.components).toHaveProperty('availability');
      expect(health.components).toHaveProperty('performance');
      expect(health.components).toHaveProperty('storage');
      expect(health.components).toHaveProperty('rateLimit');
    });

    it('should have valid status for each component', () => {
      const health = getHealthScore();

      for (const component of Object.values(health.components)) {
        expect(['healthy', 'degraded', 'critical']).toContain(component.status);
        expect(component.score).toBeGreaterThanOrEqual(0);
        expect(component.score).toBeLessThanOrEqual(100);
      }
    });
  });

  describe('S3 Upload Tracking', () => {
    it('should record successful S3 uploads', () => {
      recordS3Upload(true, 0);
      recordS3Upload(true, 1);

      const snapshot = getMetricsSnapshot();
      expect(snapshot.storage.s3RetryStats.successfulUploads).toBe(2);
      expect(snapshot.storage.s3RetryStats.totalAttempts).toBe(2);
    });

    it('should record failed S3 uploads', () => {
      recordS3Upload(false, 3);

      const snapshot = getMetricsSnapshot();
      expect(snapshot.storage.s3RetryStats.failedUploads).toBe(1);
    });

    it('should calculate average retries', () => {
      recordS3Upload(true, 0);
      recordS3Upload(true, 2);
      recordS3Upload(true, 1);

      const snapshot = getMetricsSnapshot();
      expect(snapshot.storage.s3RetryStats.averageRetries).toBeGreaterThanOrEqual(0.9);
      expect(snapshot.storage.s3RetryStats.averageRetries).toBeLessThanOrEqual(1.3);
    });
  });

  describe('Rate Limit Tracking', () => {
    it('should record rate limit exceeded events', () => {
      recordRateLimitExceeded(1);
      recordRateLimitExceeded(2);
      recordRateLimitExceeded(1); // Same user

      const snapshot = getMetricsSnapshot();
      expect(snapshot.rateLimiting.uploadLimitExceeded).toBe(3);
      expect(snapshot.rateLimiting.activeUsers).toBe(2);
    });
  });
});

describe('Request Logging', () => {
  describe('getAllLogs', () => {
    it('should return array of logs', () => {
      const logs = getAllLogs();

      expect(Array.isArray(logs)).toBe(true);
    });

    it('should respect limit parameter', () => {
      const logs = getAllLogs(10);

      expect(logs.length).toBeLessThanOrEqual(10);
    });
  });

  describe('getErrorLogs', () => {
    it('should return array of error logs', () => {
      const logs = getErrorLogs();

      expect(Array.isArray(logs)).toBe(true);
    });

    it('should only return error logs', () => {
      const logs = getErrorLogs(100);

      for (const log of logs) {
        expect(log.status >= 400 || log.error).toBe(true);
      }
    });
  });

  describe('getRequestStats', () => {
    it('should return request statistics', () => {
      const stats = getRequestStats();

      expect(stats).toHaveProperty('totalRequests');
      expect(stats).toHaveProperty('averageDurationMs');
      expect(stats).toHaveProperty('errorCount');
      expect(stats).toHaveProperty('statusCodes');
      expect(stats).toHaveProperty('methods');
      expect(stats).toHaveProperty('topPaths');
    });

    it('should have valid statistics structure', () => {
      const stats = getRequestStats();

      expect(typeof stats.totalRequests).toBe('number');
      expect(typeof stats.averageDurationMs).toBe('number');
      expect(typeof stats.errorCount).toBe('number');
      expect(typeof stats.statusCodes).toBe('object');
      expect(typeof stats.methods).toBe('object');
      expect(Array.isArray(stats.topPaths)).toBe(true);
    });
  });

  describe('exportLogsAsJson', () => {
    it('should export logs as valid JSON', () => {
      const json = exportLogsAsJson();

      expect(() => JSON.parse(json)).not.toThrow();
    });
  });

  describe('exportLogsAsCsv', () => {
    it('should export logs as CSV with headers', () => {
      const csv = exportLogsAsCsv();

      expect(csv).toContain('id,timestamp,method,path');
    });
  });
});

describe('Webhook Notifications', () => {
  beforeEach(() => {
    // Clear webhooks before each test
    for (const [id] of Array.from(getWebhooks().entries())) {
      unregisterWebhook(id);
    }
  });

  describe('registerWebhook', () => {
    it('should register a new webhook', () => {
      registerWebhook('test-slack', {
        type: 'slack',
        url: 'https://hooks.slack.com/test',
        enabled: true,
        alertOnDegraded: true,
        alertOnCritical: true,
      });

      const webhooks = getWebhooks();
      expect(webhooks.has('test-slack')).toBe(true);
    });
  });

  describe('unregisterWebhook', () => {
    it('should unregister a webhook', () => {
      registerWebhook('test-slack', {
        type: 'slack',
        url: 'https://hooks.slack.com/test',
        enabled: true,
        alertOnDegraded: true,
        alertOnCritical: true,
      });

      unregisterWebhook('test-slack');

      const webhooks = getWebhooks();
      expect(webhooks.has('test-slack')).toBe(false);
    });
  });

  describe('getWebhookStats', () => {
    it('should return webhook statistics', () => {
      registerWebhook('slack-1', {
        type: 'slack',
        url: 'https://hooks.slack.com/test1',
        enabled: true,
        alertOnDegraded: true,
        alertOnCritical: true,
      });

      registerWebhook('discord-1', {
        type: 'discord',
        url: 'https://discord.com/api/webhooks/test',
        enabled: false,
        alertOnDegraded: true,
        alertOnCritical: true,
      });

      const stats = getWebhookStats();

      expect(stats.total).toBe(2);
      expect(stats.enabled).toBe(1);
      expect(stats.disabled).toBe(1);
      expect(stats.byType['slack']).toBe(1);
      expect(stats.byType['discord']).toBe(1);
    });
  });

  describe('broadcastHealthAlert', () => {
    it('should broadcast health alerts to registered webhooks', { timeout: 30000 }, async () => {
      registerWebhook('test-webhook', {
        type: 'slack',
        url: 'https://hooks.slack.com/invalid-test-url',
        enabled: true,
        alertOnDegraded: true,
        alertOnCritical: true,
      });

      const result = await broadcastHealthAlert({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          database: { status: 'up', latencyMs: 5 },
          redis: { status: 'up', latencyMs: 2, optional: true },
          storage: { status: 'up', latencyMs: 8 },
        },
        totalLatencyMs: 15,
      });

      expect(result).toHaveProperty('totalSent');
      expect(result).toHaveProperty('successful');
      expect(result).toHaveProperty('failed');
      expect(result).toHaveProperty('results');
    });
  });
});

describe('Admin Metrics Endpoints', () => {
  it('should provide all required metrics endpoints', async () => {
    // Verify metrics service functions are available
    const { getMetricsSnapshot, getHealthScore, getPerformanceMetrics } = await import('./adminMetrics');
    
    expect(typeof getMetricsSnapshot).toBe('function');
    expect(typeof getHealthScore).toBe('function');
    expect(typeof getPerformanceMetrics).toBe('function');
  });
});
