/**
 * Monitoring & Observability Module
 * Provides comprehensive system monitoring, error tracking, and performance metrics
 */

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  tags?: Record<string, string>;
}

export interface ErrorReport {
  id: string;
  message: string;
  stack?: string;
  context?: Record<string, any>;
  severity: "critical" | "high" | "medium" | "low";
  timestamp: Date;
  resolved: boolean;
}

export interface SystemHealth {
  status: "healthy" | "degraded" | "unhealthy";
  uptime: number;
  memoryUsage: number;
  cpuUsage: number;
  errorRate: number;
  requestsPerSecond: number;
  avgResponseTime: number;
  timestamp: Date;
}

class MonitoringSystem {
  private metrics: PerformanceMetric[] = [];
  private errors: ErrorReport[] = [];
  private requestCount = 0;
  private errorCount = 0;
  private totalResponseTime = 0;
  private startTime = Date.now();
  private maxMetricsSize = 10000;
  private maxErrorsSize = 1000;

  /**
   * Record performance metric
   */
  recordMetric(
    name: string,
    value: number,
    unit: string = "ms",
    tags?: Record<string, string>
  ): void {
    this.metrics.push({
      name,
      value,
      unit,
      timestamp: new Date(),
      tags,
    });

    // Keep metrics size manageable
    if (this.metrics.length > this.maxMetricsSize) {
      this.metrics = this.metrics.slice(-this.maxMetricsSize);
    }
  }

  /**
   * Record API request
   */
  recordRequest(responseTime: number, statusCode: number): void {
    this.requestCount++;
    this.totalResponseTime += responseTime;

    if (statusCode >= 400) {
      this.errorCount++;
    }

    this.recordMetric("request_duration", responseTime, "ms", {
      status: statusCode.toString(),
    });
  }

  /**
   * Record error
   */
  recordError(
    message: string,
    severity: "critical" | "high" | "medium" | "low" = "high",
    stack?: string,
    context?: Record<string, any>
  ): string {
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    this.errors.push({
      id: errorId,
      message,
      stack,
      context,
      severity,
      timestamp: new Date(),
      resolved: false,
    });

    // Keep errors size manageable
    if (this.errors.length > this.maxErrorsSize) {
      this.errors = this.errors.slice(-this.maxErrorsSize);
    }

    console.error(`[Monitoring] Error recorded: ${errorId} - ${message}`);

    return errorId;
  }

  /**
   * Mark error as resolved
   */
  resolveError(errorId: string): boolean {
    const error = this.errors.find((e) => e.id === errorId);
    if (error) {
      error.resolved = true;
      return true;
    }
    return false;
  }

  /**
   * Get system health status
   */
  getSystemHealth(): SystemHealth {
    const uptime = Date.now() - this.startTime;
    const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024; // MB
    const avgResponseTime = this.requestCount > 0 ? this.totalResponseTime / this.requestCount : 0;
    const errorRate = this.requestCount > 0 ? this.errorCount / this.requestCount : 0;
    const requestsPerSecond = this.requestCount / (uptime / 1000);

    // Determine health status
    let status: "healthy" | "degraded" | "unhealthy" = "healthy";

    if (errorRate > 0.1 || avgResponseTime > 500 || memoryUsage > 500) {
      status = "degraded";
    }

    if (errorRate > 0.2 || avgResponseTime > 1000 || memoryUsage > 800) {
      status = "unhealthy";
    }

    return {
      status,
      uptime,
      memoryUsage,
      cpuUsage: process.cpuUsage().user / 1000000, // Convert to seconds
      errorRate,
      requestsPerSecond,
      avgResponseTime,
      timestamp: new Date(),
    };
  }

  /**
   * Get performance metrics summary
   */
  getMetricsSummary(name?: string): {
    count: number;
    avg: number;
    min: number;
    max: number;
    p95: number;
    p99: number;
  } {
    let metrics = this.metrics;

    if (name) {
      metrics = metrics.filter((m) => m.name === name);
    }

    if (metrics.length === 0) {
      return { count: 0, avg: 0, min: 0, max: 0, p95: 0, p99: 0 };
    }

    const values = metrics.map((m) => m.value).sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);

    return {
      count: values.length,
      avg: sum / values.length,
      min: values[0],
      max: values[values.length - 1],
      p95: values[Math.floor(values.length * 0.95)],
      p99: values[Math.floor(values.length * 0.99)],
    };
  }

  /**
   * Get error summary
   */
  getErrorSummary(): {
    total: number;
    unresolved: number;
    bySeverity: Record<string, number>;
    topErrors: Array<{ message: string; count: number }>;
  } {
    const bySeverity: Record<string, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };

    const errorCounts: Record<string, number> = {};

    this.errors.forEach((error) => {
      bySeverity[error.severity]++;
      errorCounts[error.message] = (errorCounts[error.message] || 0) + 1;
    });

    const topErrors = Object.entries(errorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([message, count]) => ({ message, count }));

    return {
      total: this.errors.length,
      unresolved: this.errors.filter((e) => !e.resolved).length,
      bySeverity,
      topErrors,
    };
  }

  /**
   * Get recent metrics
   */
  getRecentMetrics(limit: number = 100): PerformanceMetric[] {
    return this.metrics.slice(-limit);
  }

  /**
   * Get recent errors
   */
  getRecentErrors(limit: number = 50): ErrorReport[] {
    return this.errors.slice(-limit);
  }

  /**
   * Get alerts based on thresholds
   */
  getAlerts(): Array<{
    severity: "critical" | "warning" | "info";
    message: string;
    metric?: string;
    value?: number;
  }> {
    const alerts: Array<{
      severity: "critical" | "warning" | "info";
      message: string;
      metric?: string;
      value?: number;
    }> = [];

    const health = this.getSystemHealth();

    // Check error rate
    if (health.errorRate > 0.2) {
      alerts.push({
        severity: "critical",
        message: `High error rate: ${(health.errorRate * 100).toFixed(2)}%`,
        metric: "error_rate",
        value: health.errorRate,
      });
    } else if (health.errorRate > 0.1) {
      alerts.push({
        severity: "warning",
        message: `Elevated error rate: ${(health.errorRate * 100).toFixed(2)}%`,
        metric: "error_rate",
        value: health.errorRate,
      });
    }

    // Check response time
    if (health.avgResponseTime > 1000) {
      alerts.push({
        severity: "critical",
        message: `Slow response time: ${health.avgResponseTime.toFixed(2)}ms`,
        metric: "avg_response_time",
        value: health.avgResponseTime,
      });
    } else if (health.avgResponseTime > 500) {
      alerts.push({
        severity: "warning",
        message: `Elevated response time: ${health.avgResponseTime.toFixed(2)}ms`,
        metric: "avg_response_time",
        value: health.avgResponseTime,
      });
    }

    // Check memory usage
    if (health.memoryUsage > 800) {
      alerts.push({
        severity: "critical",
        message: `High memory usage: ${health.memoryUsage.toFixed(2)}MB`,
        metric: "memory_usage",
        value: health.memoryUsage,
      });
    } else if (health.memoryUsage > 500) {
      alerts.push({
        severity: "warning",
        message: `Elevated memory usage: ${health.memoryUsage.toFixed(2)}MB`,
        metric: "memory_usage",
        value: health.memoryUsage,
      });
    }

    // Check for critical errors
    const unresolvedCritical = this.errors.filter(
      (e) => e.severity === "critical" && !e.resolved
    ).length;
    if (unresolvedCritical > 0) {
      alerts.push({
        severity: "critical",
        message: `${unresolvedCritical} unresolved critical errors`,
        metric: "unresolved_critical_errors",
        value: unresolvedCritical,
      });
    }

    return alerts;
  }

  /**
   * Reset metrics (useful for testing)
   */
  reset(): void {
    this.metrics = [];
    this.errors = [];
    this.requestCount = 0;
    this.errorCount = 0;
    this.totalResponseTime = 0;
    this.startTime = Date.now();
  }

  /**
   * Export metrics for external monitoring
   */
  exportMetrics(): {
    metrics: PerformanceMetric[];
    errors: ErrorReport[];
    health: SystemHealth;
    summary: {
      metrics: ReturnType<typeof this.getMetricsSummary>;
      errors: ReturnType<typeof this.getErrorSummary>;
    };
  } {
    return {
      metrics: this.getRecentMetrics(),
      errors: this.getRecentErrors(),
      health: this.getSystemHealth(),
      summary: {
        metrics: this.getMetricsSummary(),
        errors: this.getErrorSummary(),
      },
    };
  }
}

// Export singleton instance
export const monitoringSystem = new MonitoringSystem();

/**
 * Initialize monitoring system
 */
export async function initializeMonitoring(): Promise<void> {
  console.log("[Monitoring] Initializing...");

  // Log system health every 5 minutes
  setInterval(() => {
    const health = monitoringSystem.getSystemHealth();
    const alerts = monitoringSystem.getAlerts();

    console.log("[Monitoring] System Health:", {
      status: health.status,
      uptime: `${(health.uptime / 1000 / 60).toFixed(2)}m`,
      memory: `${health.memoryUsage.toFixed(2)}MB`,
      errorRate: `${(health.errorRate * 100).toFixed(2)}%`,
      rps: health.requestsPerSecond.toFixed(2),
      avgResponseTime: `${health.avgResponseTime.toFixed(2)}ms`,
    });

    if (alerts.length > 0) {
      console.warn("[Monitoring] Active Alerts:", alerts);
    }
  }, 5 * 60 * 1000);

  console.log("[Monitoring] Initialization complete");
}

