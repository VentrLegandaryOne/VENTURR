/**
 * Cortex Orchestrator - Task Router
 * Routes tasks between LLM-OS and Spike7B based on complexity and requirements
 */

import { Task, Plan, Step, TaskResult, SpikeRequest } from "../../../libs/schemas/task";
import { llmPlan, llmGenerate } from "./llm";
import { askSpike } from "./spike";
import { pickTools, executeTool } from "./tools";
import { auditLog, recordMetric } from "./telemetry";
import { v4 as uuidv4 } from "uuid";

/**
 * Main task router - orchestrates execution between LLM-OS and Spike7B
 */
export async function route(raw: any): Promise<TaskResult> {
  const startTime = Date.now();
  const task = Task.parse(raw);
  
  // Ensure task has ID and trace ID
  if (!task.id) task.id = uuidv4();
  if (!task.traceId) task.traceId = uuidv4();

  await auditLog({
    id: uuidv4(),
    taskId: task.id,
    event: "task_started",
    details: { mode: task.mode, goal: task.goal },
    userId: task.userId,
  });

  try {
    let result: TaskResult;

    switch (task.mode) {
      case "plan":
        result = await executePlanMode(task);
        break;
      case "extract":
        result = await executeExtractMode(task);
        break;
      case "score":
        result = await executeScoreMode(task);
        break;
      case "generate":
        result = await executeGenerateMode(task);
        break;
      case "classify":
        result = await executeClassifyMode(task);
        break;
      case "optimize":
        result = await executeOptimizeMode(task);
        break;
      default:
        throw new Error(`Unknown task mode: ${task.mode}`);
    }

    const totalDuration = Date.now() - startTime;
    result.metrics.totalDuration = totalDuration;

    await auditLog({
      id: uuidv4(),
      taskId: task.id,
      event: "task_completed",
      details: { duration: totalDuration, status: result.status },
      userId: task.userId,
    });

    await recordMetric({
      taskId: task.id,
      metric: "latency",
      value: totalDuration,
    });

    return result;
  } catch (error) {
    await auditLog({
      id: uuidv4(),
      taskId: task.id,
      event: "task_failed",
      details: { error: error.message },
      userId: task.userId,
    });

    return {
      taskId: task.id,
      status: "failed",
      steps: [],
      output: null,
      error: error.message,
      metrics: {
        totalDuration: Date.now() - startTime,
        llmCalls: 0,
        spikeCalls: 0,
        toolCalls: 0,
        estimatedCost: 0,
        cacheHits: 0,
      },
      traceId: task.traceId,
      completedAt: new Date(),
    };
  }
}

/**
 * Execute PLAN mode - LLM-OS creates multi-step plan with Spike7B validation
 */
async function executePlanMode(task: Task): Promise<TaskResult> {
  const metrics = {
    totalDuration: 0,
    llmCalls: 0,
    spikeCalls: 0,
    toolCalls: 0,
    estimatedCost: 0,
    cacheHits: 0,
  };

  // Step 1: LLM-OS creates execution plan
  const plan = await llmPlan(task);
  metrics.llmCalls++;

  // Step 2: Spike7B validates plan (fast-pass gate)
  const spikeReq: SpikeRequest = {
    mode: "score",
    plan,
  };
  const fastPass = await askSpike(spikeReq);
  metrics.spikeCalls++;

  // Step 3: Choose steps based on fast-pass result
  const steps = fastPass.ok && fastPass.score! > 0.6 ? plan.steps : (plan.safeSteps || plan.steps);

  // Step 4: Execute each step
  for (const step of steps) {
    step.status = "running";
    step.startedAt = new Date();

    try {
      switch (step.kind) {
        case "extract":
          const extractReq: SpikeRequest = {
            mode: "extract",
            text: step.args?.text || task.input,
            fields: step.args?.fields,
          };
          const extractRes = await askSpike(extractReq);
          step.result = extractRes.fields;
          metrics.spikeCalls++;
          break;

        case "tool":
          const toolResult = await executeTool(step.tool!, step.args!);
          step.result = toolResult;
          metrics.toolCalls++;
          break;

        case "generate":
          const genResult = await llmGenerate({ task, step, context: { previousSteps: steps } });
          step.result = genResult;
          metrics.llmCalls++;
          break;

        case "score":
          const scoreReq: SpikeRequest = {
            mode: "score",
            text: step.args?.text,
          };
          const scoreRes = await askSpike(scoreReq);
          step.result = { score: scoreRes.score, ok: scoreRes.ok };
          metrics.spikeCalls++;
          break;

        case "classify":
          const classifyReq: SpikeRequest = {
            mode: "classify",
            text: step.args?.text,
            labels: step.args?.labels,
          };
          const classifyRes = await askSpike(classifyReq);
          step.result = { label: classifyRes.label, confidence: classifyRes.confidence };
          metrics.spikeCalls++;
          break;
      }

      step.status = "completed";
      step.completedAt = new Date();
      step.duration = step.completedAt.getTime() - step.startedAt.getTime();
    } catch (error) {
      step.status = "failed";
      step.error = error.message;
      step.completedAt = new Date();
    }
  }

  // Calculate estimated cost (rough approximation)
  metrics.estimatedCost = metrics.llmCalls * 0.002 + metrics.spikeCalls * 0.0001;

  return {
    taskId: task.id,
    status: steps.every((s) => s.status === "completed") ? "success" : "partial",
    steps,
    output: { plan, results: steps.map((s) => s.result) },
    metrics,
    traceId: task.traceId,
    completedAt: new Date(),
  };
}

/**
 * Execute EXTRACT mode - Spike7B fast extraction
 */
async function executeExtractMode(task: Task): Promise<TaskResult> {
  const spikeReq: SpikeRequest = {
    mode: "extract",
    text: typeof task.input === "string" ? task.input : JSON.stringify(task.input),
    fields: task.context?.fields,
  };

  const result = await askSpike(spikeReq);

  return {
    taskId: task.id,
    status: "success",
    steps: [],
    output: result.fields,
    metrics: {
      totalDuration: result.duration || 0,
      llmCalls: 0,
      spikeCalls: 1,
      toolCalls: 0,
      estimatedCost: 0.0001,
      cacheHits: 0,
    },
    traceId: task.traceId,
    completedAt: new Date(),
  };
}

/**
 * Execute SCORE mode - Spike7B fast scoring
 */
async function executeScoreMode(task: Task): Promise<TaskResult> {
  const spikeReq: SpikeRequest = {
    mode: "score",
    text: typeof task.input === "string" ? task.input : JSON.stringify(task.input),
  };

  const result = await askSpike(spikeReq);

  return {
    taskId: task.id,
    status: "success",
    steps: [],
    output: { score: result.score, ok: result.ok },
    metrics: {
      totalDuration: result.duration || 0,
      llmCalls: 0,
      spikeCalls: 1,
      toolCalls: 0,
      estimatedCost: 0.0001,
      cacheHits: 0,
    },
    traceId: task.traceId,
    completedAt: new Date(),
  };
}

/**
 * Execute GENERATE mode - LLM-OS content generation
 */
async function executeGenerateMode(task: Task): Promise<TaskResult> {
  const result = await llmGenerate({ task, context: task.context });

  return {
    taskId: task.id,
    status: "success",
    steps: [],
    output: result,
    metrics: {
      totalDuration: 0, // Will be set by main router
      llmCalls: 1,
      spikeCalls: 0,
      toolCalls: 0,
      estimatedCost: 0.002,
      cacheHits: 0,
    },
    traceId: task.traceId,
    completedAt: new Date(),
  };
}

/**
 * Execute CLASSIFY mode - Spike7B fast classification
 */
async function executeClassifyMode(task: Task): Promise<TaskResult> {
  const spikeReq: SpikeRequest = {
    mode: "classify",
    text: typeof task.input === "string" ? task.input : JSON.stringify(task.input),
    labels: task.context?.labels,
  };

  const result = await askSpike(spikeReq);

  return {
    taskId: task.id,
    status: "success",
    steps: [],
    output: { label: result.label, confidence: result.confidence },
    metrics: {
      totalDuration: result.duration || 0,
      llmCalls: 0,
      spikeCalls: 1,
      toolCalls: 0,
      estimatedCost: 0.0001,
      cacheHits: 0,
    },
    traceId: task.traceId,
    completedAt: new Date(),
  };
}

/**
 * Execute OPTIMIZE mode - LLM-OS complex optimization
 */
async function executeOptimizeMode(task: Task): Promise<TaskResult> {
  // Create optimization plan
  const plan = await llmPlan(task);

  // Execute optimization steps
  const steps: Step[] = [];
  for (const step of plan.steps) {
    step.status = "running";
    step.startedAt = new Date();

    if (step.kind === "tool") {
      step.result = await executeTool(step.tool!, step.args!);
    } else if (step.kind === "generate") {
      step.result = await llmGenerate({ task, step, context: { previousSteps: steps } });
    }

    step.status = "completed";
    step.completedAt = new Date();
    steps.push(step);
  }

  return {
    taskId: task.id,
    status: "success",
    steps,
    output: steps[steps.length - 1]?.result,
    metrics: {
      totalDuration: 0, // Will be set by main router
      llmCalls: plan.steps.filter((s) => s.kind === "generate").length + 1,
      spikeCalls: 0,
      toolCalls: plan.steps.filter((s) => s.kind === "tool").length,
      estimatedCost: 0.005,
      cacheHits: 0,
    },
    traceId: task.traceId,
    completedAt: new Date(),
  };
}

/**
 * Intelligent task routing based on task characteristics
 */
export function smartRoute(task: Task): "llm" | "spike" | "hybrid" {
  // Fast operations → Spike7B
  if (task.mode === "extract" || task.mode === "score" || task.mode === "classify") {
    return "spike";
  }

  // Complex operations → LLM-OS
  if (task.mode === "plan" || task.mode === "optimize") {
    return "llm";
  }

  // Generation can use hybrid approach
  if (task.mode === "generate") {
    // Simple generation → Spike7B
    if (task.goal.length < 100 && !task.context) {
      return "spike";
    }
    // Complex generation → LLM-OS
    return "llm";
  }

  return "hybrid";
}

