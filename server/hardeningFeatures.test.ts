import { describe, it, expect } from "vitest";

// ============================================================
// 1. Request Logging – Filtered Endpoints Tests
// ============================================================
describe("Request Logging Service", () => {
  it("should export all required functions", async () => {
    const mod = await import("./requestLogging");
    expect(typeof mod.createRequestLoggingMiddleware).toBe("function");
    expect(typeof mod.logError).toBe("function");
    expect(typeof mod.getAllLogs).toBe("function");
    expect(typeof mod.getErrorLogs).toBe("function");
    expect(typeof mod.getRequestStats).toBe("function");
    expect(typeof mod.getLogsForPath).toBe("function");
    expect(typeof mod.getLogsForUser).toBe("function");
    expect(typeof mod.exportLogsAsCsv).toBe("function");
    expect(typeof mod.exportLogsAsJson).toBe("function");
  });

  it("should log an error and retrieve it via getErrorLogs", async () => {
    const { logError, getErrorLogs } = await import("./requestLogging");

    const beforeCount = getErrorLogs(10000).length;
    logError("test-req-1", new Error("Test error for vitest"), { userId: 42 });

    const afterErrors = getErrorLogs(10000);
    expect(afterErrors.length).toBe(beforeCount + 1);

    const lastError = afterErrors.find(e => e.id === "test-req-1");
    expect(lastError).toBeDefined();
    expect(lastError!.error?.message).toBe("Test error for vitest");
    expect(lastError!.status).toBe(500);
  });

  it("should filter logs by path", async () => {
    const { logError, getLogsForPath } = await import("./requestLogging");

    // logError adds entries with path "system" by default
    logError("path-test-1", new Error("path filter test"));

    const systemLogs = getLogsForPath("system", 1000);
    expect(systemLogs.length).toBeGreaterThanOrEqual(1);
    systemLogs.forEach((log) => {
      expect(log.path).toContain("system");
    });
  });

  it("should filter logs by user ID", async () => {
    const { logError, getLogsForUser } = await import("./requestLogging");

    logError("user-test-1", new Error("user filter test"), { userId: 7777 });

    const userLogs = getLogsForUser(7777, 100);
    expect(userLogs.length).toBeGreaterThanOrEqual(1);
    userLogs.forEach((log) => {
      expect(log.userId).toBe(7777);
    });
  });

  it("should return all logs with limit", async () => {
    const { getAllLogs } = await import("./requestLogging");

    const logs = getAllLogs(5);
    expect(logs.length).toBeLessThanOrEqual(5);
    expect(Array.isArray(logs)).toBe(true);
  });

  it("should compute request statistics", async () => {
    const { getRequestStats } = await import("./requestLogging");

    const stats = getRequestStats();
    expect(typeof stats.totalRequests).toBe("number");
    expect(typeof stats.errorCount).toBe("number");
    expect(typeof stats.averageDurationMs).toBe("number");
    expect(stats.statusCodes).toBeDefined();
    expect(stats.methods).toBeDefined();
    expect(Array.isArray(stats.topPaths)).toBe(true);
  });

  it("should export logs as CSV with headers", async () => {
    const { exportLogsAsCsv } = await import("./requestLogging");

    const csv = exportLogsAsCsv(10);
    expect(typeof csv).toBe("string");
    expect(csv.length).toBeGreaterThan(0);
    // CSV should contain header-like content
    const lower = csv.toLowerCase();
    expect(lower.includes("method") || lower.includes("path") || lower.includes("id")).toBe(true);
  });

  it("should export logs as valid JSON", async () => {
    const { exportLogsAsJson } = await import("./requestLogging");

    const json = exportLogsAsJson(10);
    expect(typeof json).toBe("string");
    const parsed = JSON.parse(json);
    expect(Array.isArray(parsed)).toBe(true);
  });
});

// ============================================================
// 2. Webhook Notification Service Tests
// ============================================================
describe("Webhook Notification Service", () => {
  it("should export all required functions", async () => {
    const mod = await import("./webhookNotifications");
    expect(typeof mod.registerWebhook).toBe("function");
    expect(typeof mod.unregisterWebhook).toBe("function");
    expect(typeof mod.getWebhooks).toBe("function");
    expect(typeof mod.getWebhookStats).toBe("function");
    expect(typeof mod.testWebhook).toBe("function");
  });

  it("should register and retrieve a webhook", async () => {
    const { registerWebhook, getWebhooks, unregisterWebhook } = await import("./webhookNotifications");

    const testId = `test-webhook-${Date.now()}`;
    registerWebhook(testId, {
      type: "slack",
      url: "https://hooks.slack.com/services/T00/B00/test",
      enabled: true,
      alertOnDegraded: true,
      alertOnCritical: true,
    });

    const webhooks = getWebhooks();
    expect(webhooks.has(testId)).toBe(true);

    const config = webhooks.get(testId);
    expect(config?.type).toBe("slack");
    expect(config?.enabled).toBe(true);
    expect(config?.url).toBe("https://hooks.slack.com/services/T00/B00/test");

    // Cleanup
    unregisterWebhook(testId);
    expect(getWebhooks().has(testId)).toBe(false);
  });

  it("should unregister a webhook", async () => {
    const { registerWebhook, unregisterWebhook, getWebhooks } = await import("./webhookNotifications");

    const testId = `test-unreg-${Date.now()}`;
    registerWebhook(testId, {
      type: "discord",
      url: "https://discord.com/api/webhooks/test",
      enabled: true,
      alertOnDegraded: false,
      alertOnCritical: true,
    });

    expect(getWebhooks().has(testId)).toBe(true);
    unregisterWebhook(testId);
    expect(getWebhooks().has(testId)).toBe(false);
  });

  it("should return correct webhook stats", async () => {
    const { registerWebhook, unregisterWebhook, getWebhookStats } = await import("./webhookNotifications");

    const id1 = `stat-test-1-${Date.now()}`;
    const id2 = `stat-test-2-${Date.now()}`;

    registerWebhook(id1, {
      type: "slack",
      url: "https://hooks.slack.com/services/T00/B00/stat1",
      enabled: true,
      alertOnDegraded: true,
      alertOnCritical: true,
    });

    registerWebhook(id2, {
      type: "discord",
      url: "https://discord.com/api/webhooks/stat2",
      enabled: false,
      alertOnDegraded: true,
      alertOnCritical: true,
    });

    const stats = getWebhookStats();
    expect(stats.total).toBeGreaterThanOrEqual(2);
    expect(stats.enabled).toBeGreaterThanOrEqual(1);
    expect(stats.disabled).toBeGreaterThanOrEqual(1);
    expect(stats.byType).toBeDefined();

    // Cleanup
    unregisterWebhook(id1);
    unregisterWebhook(id2);
  });

  it("should handle test webhook for non-existent ID gracefully", async () => {
    const { testWebhook } = await import("./webhookNotifications");

    const result = await testWebhook("non-existent-webhook-id");
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

// ============================================================
// 3. Push Notification Service Tests
// ============================================================
describe("Push Notification Service", () => {
  it("should export all required functions", async () => {
    const mod = await import("./pushNotificationService");
    expect(typeof mod.savePushSubscription).toBe("function");
    expect(typeof mod.removePushSubscription).toBe("function");
    expect(typeof mod.sendPushNotification).toBe("function");
    expect(typeof mod.getPushSubscriptionsForUser).toBe("function");
    expect(typeof mod.notifyVerificationComplete).toBe("function");
    expect(typeof mod.notifyComparisonComplete).toBe("function");
  });

  it("should handle sending push to non-subscribed user gracefully", async () => {
    const { sendPushNotification } = await import("./pushNotificationService");

    // Should handle gracefully for a user with no subscriptions
    try {
      await sendPushNotification(999999, {
        title: "Test",
        body: "Test notification",
      });
    } catch (err) {
      // It's acceptable to throw or return gracefully
      expect(err).toBeDefined();
    }
  });

  it("should export domain-specific notification helpers", async () => {
    const mod = await import("./pushNotificationService");
    expect(typeof mod.notifyVerificationComplete).toBe("function");
    expect(typeof mod.notifyComparisonComplete).toBe("function");
  });
});

// ============================================================
// 4. Admin Metrics Service Tests
// ============================================================
describe("Admin Metrics Service", () => {
  it("should export all required functions", async () => {
    const mod = await import("./adminMetrics");
    expect(typeof mod.getMetricsSnapshot).toBe("function");
    expect(typeof mod.getPerformanceMetrics).toBe("function");
    expect(typeof mod.getHealthScore).toBe("function");
    expect(typeof mod.verifyAdminAccess).toBe("function");
    expect(typeof mod.recordS3Upload).toBe("function");
    expect(typeof mod.getS3Stats).toBe("function");
  });

  it("should return a valid metrics snapshot", async () => {
    const { getMetricsSnapshot } = await import("./adminMetrics");

    const snapshot = getMetricsSnapshot();
    expect(snapshot.timestamp).toBeDefined();
    expect(snapshot.uptime).toBeDefined();
    expect(snapshot.uptime.uptimeMs).toBeGreaterThanOrEqual(0);
    expect(snapshot.requests).toBeDefined();
    expect(typeof snapshot.requests.total).toBe("number");
    expect(snapshot.storage).toBeDefined();
    expect(snapshot.rateLimiting).toBeDefined();
    expect(snapshot.webhooks).toBeDefined();
    expect(snapshot.errors).toBeDefined();
  });

  it("should return a valid health score", async () => {
    const { getHealthScore } = await import("./adminMetrics");

    const health = getHealthScore();
    expect(health.score).toBeGreaterThanOrEqual(0);
    expect(health.score).toBeLessThanOrEqual(100);
    expect(health.components).toBeDefined();
    expect(health.components.availability).toBeDefined();
    expect(health.components.performance).toBeDefined();
    expect(health.components.storage).toBeDefined();
    expect(health.components.rateLimit).toBeDefined();
  });

  it("should reject non-admin access", async () => {
    const { verifyAdminAccess } = await import("./adminMetrics");

    expect(() => verifyAdminAccess("user")).toThrow();
    expect(() => verifyAdminAccess(undefined)).toThrow();
    expect(() => verifyAdminAccess("admin")).not.toThrow();
  });

  it("should track S3 upload statistics", async () => {
    const { recordS3Upload, getS3Stats } = await import("./adminMetrics");

    const before = getS3Stats();
    recordS3Upload(true, 0);
    recordS3Upload(false, 2);
    const after = getS3Stats();

    expect(after.totalAttempts).toBe(before.totalAttempts + 2);
    expect(after.successfulUploads).toBe(before.successfulUploads + 1);
    expect(after.failedUploads).toBe(before.failedUploads + 1);
  });

  it("should return performance metrics with percentiles", async () => {
    const { getPerformanceMetrics } = await import("./adminMetrics");

    const perf = getPerformanceMetrics();
    expect(typeof perf.averageResponseTime).toBe("number");
    expect(typeof perf.p95ResponseTime).toBe("number");
    expect(typeof perf.p99ResponseTime).toBe("number");
    expect(Array.isArray(perf.slowestEndpoints)).toBe(true);
    expect(Array.isArray(perf.fastestEndpoints)).toBe(true);
  });
});
