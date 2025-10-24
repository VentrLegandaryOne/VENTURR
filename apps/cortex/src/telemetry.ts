/**
 * Telemetry Module
 * Handles audit logging, metrics collection, and OpenTelemetry integration
 */

import { AuditLog, EvalMetric } from "../../../libs/schemas/task";

// In-memory storage for development (would use database in production)
const auditLogs: AuditLog[] = [];
const metrics: EvalMetric[] = [];

/**
 * Log an audit event
 */
export async function auditLog(log: AuditLog): Promise<void> {
  // Add to in-memory storage
  auditLogs.push(log);

  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console.log(`[AUDIT] ${log.event}:`, {
      taskId: log.taskId,
      userId: log.userId,
      details: log.details,
    });
  }

  // In production, would save to database
  // const db = getDb();
  // if (db) {
  //   await db.insert(auditLogsTable).values(log);
  // }

  // Send to OpenTelemetry if enabled
  if (process.env.OTEL_ENABLED === "true") {
    await sendToOTel(log);
  }
}

/**
 * Record a metric
 */
export async function recordMetric(metric: EvalMetric): Promise<void> {
  // Add to in-memory storage
  metrics.push(metric);

  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console.log(`[METRIC] ${metric.metric}:`, {
      taskId: metric.taskId,
      value: metric.value,
      baseline: metric.baseline,
    });
  }

  // In production, would save to database
  // const db = getDb();
  // if (db) {
  //   await db.insert(evalMetricsTable).values(metric);
  // }

  // Calculate improvement if baseline exists
  if (metric.baseline) {
    metric.improvement = ((metric.value - metric.baseline) / metric.baseline) * 100;
  }
}

/**
 * Get metrics for a specific task
 */
export async function getMetrics(taskId: string): Promise<EvalMetric[]> {
  // In development, return from memory
  if (process.env.NODE_ENV === "development") {
    return metrics.filter((m) => m.taskId === taskId);
  }

  // In production, would query database
  // const db = getDb();
  // if (db) {
  //   return await db.select().from(evalMetricsTable).where(eq(evalMetricsTable.taskId, taskId));
  // }

  return [];
}

/**
 * Get audit logs for a specific task
 */
export async function getAuditLogs(taskId: string): Promise<AuditLog[]> {
  // In development, return from memory
  if (process.env.NODE_ENV === "development") {
    return auditLogs.filter((l) => l.taskId === taskId);
  }

  // In production, would query database
  return [];
}

/**
 * Get aggregate metrics
 */
export async function getAggregateMetrics(): Promise<{
  avgLatency: number;
  avgCost: number;
  totalTasks: number;
  successRate: number;
}> {
  const latencyMetrics = metrics.filter((m) => m.metric === "latency");
  const costMetrics = metrics.filter((m) => m.metric === "cost");

  const avgLatency =
    latencyMetrics.length > 0
      ? latencyMetrics.reduce((sum, m) => sum + m.value, 0) / latencyMetrics.length
      : 0;

  const avgCost =
    costMetrics.length > 0
      ? costMetrics.reduce((sum, m) => sum + m.value, 0) / costMetrics.length
      : 0;

  const taskEvents = auditLogs.filter((l) => l.event === "task_completed" || l.event === "task_failed");
  const successEvents = auditLogs.filter((l) => l.event === "task_completed");

  const totalTasks = taskEvents.length;
  const successRate = totalTasks > 0 ? (successEvents.length / totalTasks) * 100 : 0;

  return {
    avgLatency,
    avgCost,
    totalTasks,
    successRate,
  };
}

/**
 * Send audit log to OpenTelemetry collector
 */
async function sendToOTel(log: AuditLog): Promise<void> {
  const otelEndpoint = process.env.OTEL_ENDPOINT;

  if (!otelEndpoint) {
    return;
  }

  try {
    await fetch(otelEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resourceSpans: [
          {
            resource: {
              attributes: [
                { key: "service.name", value: { stringValue: "cortex-orchestrator" } },
                { key: "service.version", value: { stringValue: "1.0.0" } },
              ],
            },
            scopeSpans: [
              {
                scope: { name: "audit" },
                spans: [
                  {
                    traceId: log.taskId,
                    spanId: log.id,
                    name: log.event,
                    kind: 1, // SPAN_KIND_INTERNAL
                    startTimeUnixNano: log.timestamp.getTime() * 1000000,
                    endTimeUnixNano: log.timestamp.getTime() * 1000000,
                    attributes: Object.entries(log.details).map(([key, value]) => ({
                      key,
                      value: { stringValue: String(value) },
                    })),
                  },
                ],
              },
            ],
          },
        ],
      }),
    });
  } catch (error) {
    console.error("Failed to send to OTel:", error);
  }
}

/**
 * Create a performance tracker for a task
 */
export function createPerformanceTracker(taskId: string) {
  const startTime = Date.now();
  let llmCalls = 0;
  let spikeCalls = 0;
  let toolCalls = 0;
  let cacheHits = 0;

  return {
    trackLLMCall: () => llmCalls++,
    trackSpikeCall: () => spikeCalls++,
    trackToolCall: () => toolCalls++,
    trackCacheHit: () => cacheHits++,

    async finish(status: "success" | "failed") {
      const duration = Date.now() - startTime;

      await recordMetric({
        taskId,
        metric: "latency",
        value: duration,
        timestamp: new Date(),
      });

      const estimatedCost = llmCalls * 0.002 + spikeCalls * 0.0001;

      await recordMetric({
        taskId,
        metric: "cost",
        value: estimatedCost,
        timestamp: new Date(),
      });

      return {
        totalDuration: duration,
        llmCalls,
        spikeCalls,
        toolCalls,
        estimatedCost,
        cacheHits,
      };
    },
  };
}

/**
 * Export metrics in Prometheus format
 */
export function exportPrometheusMetrics(): string {
  const latencyMetrics = metrics.filter((m) => m.metric === "latency");
  const costMetrics = metrics.filter((m) => m.metric === "cost");

  const avgLatency =
    latencyMetrics.length > 0
      ? latencyMetrics.reduce((sum, m) => sum + m.value, 0) / latencyMetrics.length
      : 0;

  const avgCost =
    costMetrics.length > 0
      ? costMetrics.reduce((sum, m) => sum + m.value, 0) / costMetrics.length
      : 0;

  const totalTasks = new Set(auditLogs.map((l) => l.taskId)).size;

  return `
# HELP cortex_tasks_total Total number of tasks processed
# TYPE cortex_tasks_total counter
cortex_tasks_total ${totalTasks}

# HELP cortex_latency_seconds Average task latency in seconds
# TYPE cortex_latency_seconds gauge
cortex_latency_seconds ${avgLatency / 1000}

# HELP cortex_cost_dollars Average task cost in USD
# TYPE cortex_cost_dollars gauge
cortex_cost_dollars ${avgCost}

# HELP cortex_llm_calls_total Total LLM API calls
# TYPE cortex_llm_calls_total counter
cortex_llm_calls_total ${auditLogs.filter((l) => l.event === "llm_call").length}

# HELP cortex_spike_calls_total Total Spike7B calls
# TYPE cortex_spike_calls_total counter
cortex_spike_calls_total ${auditLogs.filter((l) => l.event === "spike_call").length}
`.trim();
}

