/**
 * Task Schema - Dual-Intelligence System Contracts
 * Defines the interface between Cortex Orchestrator and Spike7B
 */

import { z } from "zod";

/**
 * Task Mode - Determines which intelligence layer handles the task
 */
export const TaskMode = z.enum([
  "plan",      // LLM-OS: Strategic planning, multi-step reasoning
  "extract",   // Spike7B: Fast data extraction from documents
  "score",     // Spike7B: Quick heuristic scoring and validation
  "generate",  // LLM-OS: Content generation with tool grounding
  "classify",  // Spike7B: Fast classification and labeling
  "optimize",  // LLM-OS: Complex optimization with constraints
]);

export type TaskMode = z.infer<typeof TaskMode>;

/**
 * Policy Configuration
 */
export const Policy = z.object({
  piiGuard: z.boolean().default(true),
  maxTokens: z.number().default(4000),
  temperature: z.number().min(0).max(2).default(0.7),
  timeout: z.number().default(30000), // ms
  retries: z.number().default(3),
  cacheEnabled: z.boolean().default(true),
});

export type Policy = z.infer<typeof Policy>;

/**
 * Task Definition
 */
export const Task = z.object({
  id: z.string().uuid(),
  goal: z.string().min(1).max(1000),
  input: z.any(),
  context: z.record(z.any()).optional(),
  policy: Policy.default({}),
  mode: TaskMode,
  traceId: z.string().optional(),
  userId: z.string().optional(),
  organizationId: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  createdAt: z.date().default(() => new Date()),
});

export type Task = z.infer<typeof Task>;

/**
 * Step in execution plan
 */
export const Step = z.object({
  id: z.string(),
  kind: z.enum(["extract", "tool", "generate", "score", "classify"]),
  description: z.string(),
  tool: z.string().optional(),
  args: z.record(z.any()).optional(),
  result: z.any().optional(),
  status: z.enum(["pending", "running", "completed", "failed"]).default("pending"),
  error: z.string().optional(),
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
  duration: z.number().optional(), // ms
});

export type Step = z.infer<typeof Step>;

/**
 * Execution Plan
 */
export const Plan = z.object({
  taskId: z.string().uuid(),
  steps: z.array(Step),
  safeSteps: z.array(Step).optional(), // Fallback steps if fast-pass fails
  estimatedDuration: z.number().optional(), // ms
  estimatedCost: z.number().optional(), // USD
  confidence: z.number().min(0).max(1).optional(),
});

export type Plan = z.infer<typeof Plan>;

/**
 * Spike7B Request
 */
export const SpikeRequest = z.object({
  mode: z.enum(["score", "extract", "classify"]),
  text: z.string().optional(),
  plan: Plan.optional(),
  fields: z.array(z.string()).optional(), // For extraction
  labels: z.array(z.string()).optional(), // For classification
});

export type SpikeRequest = z.infer<typeof SpikeRequest>;

/**
 * Spike7B Response
 */
export const SpikeResponse = z.object({
  ok: z.boolean().optional(), // For scoring
  score: z.number().min(0).max(1).optional(),
  fields: z.record(z.any()).optional(), // For extraction
  label: z.string().optional(), // For classification
  confidence: z.number().min(0).max(1).optional(),
  duration: z.number().optional(), // ms
});

export type SpikeResponse = z.infer<typeof SpikeResponse>;

/**
 * Task Result
 */
export const TaskResult = z.object({
  taskId: z.string().uuid(),
  status: z.enum(["success", "partial", "failed"]),
  steps: z.array(Step),
  output: z.any(),
  error: z.string().optional(),
  metrics: z.object({
    totalDuration: z.number(), // ms
    llmCalls: z.number(),
    spikeCalls: z.number(),
    toolCalls: z.number(),
    estimatedCost: z.number(), // USD
    cacheHits: z.number(),
  }),
  traceId: z.string().optional(),
  completedAt: z.date().default(() => new Date()),
});

export type TaskResult = z.infer<typeof TaskResult>;

/**
 * Tool Definition
 */
export const Tool = z.object({
  name: z.string(),
  description: z.string(),
  parameters: z.record(z.any()),
  category: z.enum([
    "file",
    "accounting",
    "crm",
    "storage",
    "communication",
    "calculation",
    "compliance",
    "other",
  ]),
  requiresAuth: z.boolean().default(false),
  rateLimit: z.number().optional(), // calls per minute
});

export type Tool = z.infer<typeof Tool>;

/**
 * Evaluation Metric
 */
export const EvalMetric = z.object({
  taskId: z.string().uuid(),
  metric: z.enum(["bleu", "rouge", "latency", "cost", "accuracy"]),
  value: z.number(),
  baseline: z.number().optional(),
  improvement: z.number().optional(), // percentage
  timestamp: z.date().default(() => new Date()),
});

export type EvalMetric = z.infer<typeof EvalMetric>;

/**
 * Audit Log Entry
 */
export const AuditLog = z.object({
  id: z.string().uuid(),
  taskId: z.string().uuid(),
  event: z.enum([
    "task_created",
    "task_started",
    "task_completed",
    "task_failed",
    "llm_call",
    "spike_call",
    "tool_call",
    "cache_hit",
    "policy_violation",
  ]),
  details: z.record(z.any()),
  userId: z.string().optional(),
  timestamp: z.date().default(() => new Date()),
});

export type AuditLog = z.infer<typeof AuditLog>;

