/**
 * Spike7B Client
 * Communicates with Spike7B microservice for fast operations
 */

import { SpikeRequest, SpikeResponse } from "../../../libs/schemas/task";

const SPIKE_URL = process.env.SPIKE_URL || "http://localhost:8000";
const SPIKE_TIMEOUT = parseInt(process.env.SPIKE_TIMEOUT || "5000");

/**
 * Call Spike7B microservice
 */
export async function askSpike(req: SpikeRequest): Promise<SpikeResponse> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), SPIKE_TIMEOUT);

    const response = await fetch(`${SPIKE_URL}/spike`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Spike7B HTTP error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return SpikeResponse.parse(data);
  } catch (error) {
    console.error("Spike7B call failed:", error);

    // Check if it's a timeout
    if (error.name === "AbortError") {
      console.warn("Spike7B timeout, using fallback");
    }

    // Fallback to simple heuristics
    return createFallbackResponse(req);
  }
}

/**
 * Create fallback response when Spike7B is unavailable
 */
function createFallbackResponse(req: SpikeRequest): SpikeResponse {
  if (req.mode === "score") {
    // Conservative scoring fallback
    return {
      ok: true,
      score: 0.7,
      confidence: 0.5,
      duration: 0,
    };
  }

  if (req.mode === "extract") {
    // Return empty fields with low confidence
    return {
      fields: {},
      confidence: 0.3,
      duration: 0,
    };
  }

  if (req.mode === "classify") {
    // Return "other" classification
    return {
      label: "other",
      confidence: 0.3,
      duration: 0,
    };
  }

  throw new Error(`Cannot create fallback for mode: ${req.mode}`);
}

/**
 * Check Spike7B health
 */
export async function checkSpikeHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${SPIKE_URL}/health`, {
      method: "GET",
      signal: AbortSignal.timeout(2000),
    });

    return response.ok;
  } catch (error) {
    console.error("Spike7B health check failed:", error);
    return false;
  }
}

/**
 * Classify project complexity using Spike7B
 */
export async function classifyProjectComplexity(data: any): Promise<{
  complexity: string;
  confidence: number;
  duration: number;
}> {
  try {
    const response = await fetch(`${SPIKE_URL}/classify-complexity`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(SPIKE_TIMEOUT),
    });

    if (!response.ok) {
      throw new Error(`Spike7B complexity classification failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Complexity classification failed:", error);

    // Fallback to simple heuristic
    const area = data.roofArea || 0;
    const complexity = area > 150 ? "complex" : area > 80 ? "moderate" : "simple";

    return {
      complexity,
      confidence: 0.5,
      duration: 0,
    };
  }
}

