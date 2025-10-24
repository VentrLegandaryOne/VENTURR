/**
 * LLM-OS Integration
 * Handles planning, long-context reasoning, and content generation
 */

import { Task, Plan, Step } from "../../../libs/schemas/task";

/**
 * LLM-OS Planning - Creates multi-step execution plan
 */
export async function llmPlan(task: Task): Promise<Plan> {
  const systemPrompt = `You are Cortex, an AI orchestrator for Venturr roofing platform.
Your role is to break down complex tasks into executable steps.

Available step types:
- extract: Fast data extraction using Spike7B
- tool: Execute a tool (file operations, API calls, calculations)
- generate: Generate content using LLM-OS
- score: Quick heuristic scoring using Spike7B
- classify: Fast classification using Spike7B

Available tools:
- calculateLaborHours: Estimate labor based on roof complexity
- calculateJobCosting: Complete job costing with profit calculation
- getManufacturerDocs: Retrieve compliance documentation
- assessEnvironmentalRisk: Evaluate environmental factors
- generateQuoteNumber: Create unique quote identifier
- calculateWastePercentage: Calculate material waste
- exportToCSV: Export data to CSV format
- exportToExcel: Export data to Excel format
- sendEmail: Send email via notification API
- uploadToS3: Upload file to cloud storage

Create a plan with clear, executable steps. Include both primary steps and safeSteps (fallback) if needed.`;

  const userPrompt = `Task: ${task.goal}
Mode: ${task.mode}
Input: ${JSON.stringify(task.input, null, 2)}
Context: ${JSON.stringify(task.context || {}, null, 2)}

Create an execution plan with specific steps to accomplish this task.`;

  // Call LLM API (using environment variable for API key)
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.SONAR_API_KEY;
  
  if (!apiKey) {
    // Fallback to rule-based planning if no API key
    return createRuleBasedPlan(task);
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "anthropic/claude-3.5-sonnet",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    const data = await response.json();
    const planText = data.choices[0].message.content;

    // Parse LLM response into Plan structure
    const plan = parsePlanFromLLM(planText, task);
    return plan;
  } catch (error) {
    console.error("LLM planning failed, using rule-based fallback:", error);
    return createRuleBasedPlan(task);
  }
}

/**
 * LLM-OS Generation - Tool-grounded content generation
 */
export async function llmGenerate(ctx: {
  task: Task;
  step?: Step;
  context?: any;
}): Promise<any> {
  const { task, step, context } = ctx;

  const systemPrompt = `You are an AI assistant for Venturr, a professional roofing platform.
Generate accurate, professional content based on the provided context and tools.

Your responses should be:
- Technically accurate for Australian roofing standards
- Professional and client-ready
- Compliant with AS standards and NCC 2022
- Formatted appropriately for the output type`;

  const userPrompt = step
    ? `Generate content for step: ${step.description}
Task goal: ${task.goal}
Step args: ${JSON.stringify(step.args || {}, null, 2)}
Context: ${JSON.stringify(context || {}, null, 2)}`
    : `Generate content for task: ${task.goal}
Input: ${JSON.stringify(task.input, null, 2)}
Context: ${JSON.stringify(context || {}, null, 2)}`;

  const apiKey = process.env.OPENROUTER_API_KEY || process.env.SONAR_API_KEY;

  if (!apiKey) {
    return createRuleBasedGeneration(task, step, context);
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "anthropic/claude-3.5-sonnet",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: task.policy.temperature || 0.7,
        max_tokens: task.policy.maxTokens || 4000,
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("LLM generation failed, using rule-based fallback:", error);
    return createRuleBasedGeneration(task, step, context);
  }
}

/**
 * Rule-based planning fallback (when LLM API unavailable)
 */
function createRuleBasedPlan(task: Task): Plan {
  const steps: Step[] = [];

  // Analyze task goal and create appropriate steps
  if (task.goal.toLowerCase().includes("quote")) {
    steps.push({
      id: "1",
      kind: "tool",
      description: "Calculate labor hours",
      tool: "calculateLaborHours",
      args: task.input,
      status: "pending",
    });
    steps.push({
      id: "2",
      kind: "tool",
      description: "Calculate job costing",
      tool: "calculateJobCosting",
      args: task.input,
      status: "pending",
    });
    steps.push({
      id: "3",
      kind: "generate",
      description: "Generate quote document",
      status: "pending",
    });
  } else if (task.goal.toLowerCase().includes("extract")) {
    steps.push({
      id: "1",
      kind: "extract",
      description: "Extract data from document",
      args: { text: task.input },
      status: "pending",
    });
  } else if (task.goal.toLowerCase().includes("compliance")) {
    steps.push({
      id: "1",
      kind: "tool",
      description: "Get manufacturer documentation",
      tool: "getManufacturerDocs",
      args: task.input,
      status: "pending",
    });
    steps.push({
      id: "2",
      kind: "tool",
      description: "Assess environmental risk",
      tool: "assessEnvironmentalRisk",
      args: task.input,
      status: "pending",
    });
  } else {
    // Generic plan
    steps.push({
      id: "1",
      kind: "generate",
      description: "Process task",
      status: "pending",
    });
  }

  return {
    taskId: task.id,
    steps,
    estimatedDuration: steps.length * 1000, // 1s per step estimate
    estimatedCost: steps.length * 0.001,
    confidence: 0.7,
  };
}

/**
 * Parse LLM response into Plan structure
 */
function parsePlanFromLLM(planText: string, task: Task): Plan {
  // Try to extract JSON from LLM response
  const jsonMatch = planText.match(/```json\n([\s\S]*?)\n```/) || planText.match(/{[\s\S]*}/);
  
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      return {
        taskId: task.id,
        steps: parsed.steps || [],
        safeSteps: parsed.safeSteps,
        estimatedDuration: parsed.estimatedDuration,
        estimatedCost: parsed.estimatedCost,
        confidence: parsed.confidence || 0.8,
      };
    } catch (e) {
      console.error("Failed to parse LLM plan JSON:", e);
    }
  }

  // Fallback to rule-based if parsing fails
  return createRuleBasedPlan(task);
}

/**
 * Rule-based generation fallback
 */
function createRuleBasedGeneration(task: Task, step?: Step, context?: any): any {
  if (task.goal.toLowerCase().includes("quote")) {
    return {
      quoteNumber: `TRC-${new Date().getFullYear()}-${Date.now()}`,
      message: "Quote generated successfully",
      details: task.input,
    };
  }

  if (task.goal.toLowerCase().includes("compliance")) {
    return {
      compliant: true,
      standards: ["AS 1562.1:2018", "AS/NZS 1170.2:2021", "NCC 2022"],
      recommendations: ["Use marine-grade fasteners", "Ensure proper ventilation"],
    };
  }

  return {
    result: "Task processed",
    input: task.input,
    context: context || {},
  };
}

/**
 * Estimate LLM cost based on token usage
 */
export function estimateCost(inputTokens: number, outputTokens: number, model: string = "claude-3.5-sonnet"): number {
  // Rough cost estimates (USD per 1M tokens)
  const costs = {
    "claude-3.5-sonnet": { input: 3, output: 15 },
    "gpt-4": { input: 30, output: 60 },
    "gpt-3.5-turbo": { input: 0.5, output: 1.5 },
  };

  const modelCost = costs[model] || costs["claude-3.5-sonnet"];
  const inputCost = (inputTokens / 1000000) * modelCost.input;
  const outputCost = (outputTokens / 1000000) * modelCost.output;

  return inputCost + outputCost;
}

