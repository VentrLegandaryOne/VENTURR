/**
 * Enhanced LLM Service for VENTURR VALIDT
 * Features:
 * - Structured JSON schema outputs
 * - Retry logic with exponential backoff
 * - Token usage tracking
 * - Response validation
 * - Cost optimization
 */

import axios, { AxiosError } from "axios";

// Configuration
const SONAR_API_KEY = process.env.SONAR_API_KEY;
const SONAR_API_URL = "https://api.perplexity.ai/chat/completions";

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second
const MAX_RETRY_DELAY = 10000; // 10 seconds

// Token tracking
interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCost: number;
}

interface LLMResponse<T> {
  data: T;
  usage: TokenUsage;
  latency: number;
  retries: number;
}

// Error types
export class LLMError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly retryable: boolean,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = "LLMError";
  }
}

// JSON Schema definitions for structured outputs
export const SCHEMAS = {
  pricingAnalysis: {
    type: "object",
    properties: {
      score: { type: "number", minimum: 0, maximum: 100 },
      marketRate: { type: "number" },
      quotedRate: { type: "number" },
      variance: { type: "number" },
      currency: { type: "string", default: "AUD" },
      confidence: { type: "string", enum: ["high", "medium", "low"] },
      findings: {
        type: "array",
        items: {
          type: "object",
          properties: {
            item: { type: "string" },
            quotedPrice: { type: "number" },
            marketPrice: { type: "number" },
            status: { type: "string", enum: ["assessed", "flagged", "insufficient-data"] },
            message: { type: "string" },
            citation: { type: "string" }
          },
          required: ["item", "status", "message"]
        }
      }
    },
    required: ["score", "variance", "findings", "confidence"]
  },

  materialsAnalysis: {
    type: "object",
    properties: {
      score: { type: "number", minimum: 0, maximum: 100 },
      confidence: { type: "string", enum: ["high", "medium", "low"] },
      findings: {
        type: "array",
        items: {
          type: "object",
          properties: {
            material: { type: "string" },
            specified: { type: "string" },
            standard: { type: "string" },
            status: { type: "string", enum: ["assessed", "flagged", "insufficient-data"] },
            message: { type: "string" },
            supplier: { type: "string" },
            citation: { type: "string" }
          },
          required: ["material", "status", "message"]
        }
      }
    },
    required: ["score", "findings", "confidence"]
  },

  complianceAnalysis: {
    type: "object",
    properties: {
      score: { type: "number", minimum: 0, maximum: 100 },
      confidence: { type: "string", enum: ["high", "medium", "low"] },
      findings: {
        type: "array",
        items: {
          type: "object",
          properties: {
            requirement: { type: "string" },
            standard: { type: "string" },
            clause: { type: "string" },
            status: { type: "string", enum: ["appears-compliant", "needs-review", "unclear", "insufficient-data"] },
            message: { type: "string" },
            reference: { type: "string" },
            citation: { type: "string" }
          },
          required: ["requirement", "status", "message"]
        }
      }
    },
    required: ["score", "findings", "confidence"]
  },

  warrantyAnalysis: {
    type: "object",
    properties: {
      score: { type: "number", minimum: 0, maximum: 100 },
      confidence: { type: "string", enum: ["high", "medium", "low"] },
      findings: {
        type: "array",
        items: {
          type: "object",
          properties: {
            item: { type: "string" },
            warrantyTerm: { type: "string" },
            industryStandard: { type: "string" },
            status: { type: "string", enum: ["assessed", "flagged", "insufficient-data"] },
            message: { type: "string" },
            citation: { type: "string" }
          },
          required: ["item", "status", "message"]
        }
      }
    },
    required: ["score", "findings", "confidence"]
  },

  comparisonAnalysis: {
    type: "object",
    properties: {
      bestValueQuoteId: { type: "number" },
      confidence: { type: "string", enum: ["high", "medium", "low"] },
      totalSavings: { type: "number" },
      categoryWinners: {
        type: "object",
        properties: {
          pricing: { type: "number" },
          materials: { type: "number" },
          compliance: { type: "number" },
          warranty: { type: "number" }
        }
      },
      detailedAnalysis: {
        type: "object",
        properties: {
          pricing: { type: "string" },
          materials: { type: "string" },
          compliance: { type: "string" },
          warranty: { type: "string" },
          overall: { type: "string" }
        }
      },
      recommendations: {
        type: "array",
        items: { type: "string" }
      }
    },
    required: ["bestValueQuoteId", "confidence", "categoryWinners", "recommendations"]
  }
};

// Prompt templates with versioning - Updated with verified authoritative sources (Dec 2024)
export const PROMPT_TEMPLATES = {
  version: "1.3.0",
  lastVerified: "2024-12-24",
  
  pricing: (quoteText: string) => `
You are an expert construction cost analyst specializing in Australian roofing markets.

TASK: Analyze the following roofing quote for pricing accuracy against 2024 Australian market rates.

QUOTE CONTENT:
${quoteText}

AUTHORITATIVE SOURCES TO REFERENCE:
- NSW Fair Trading: Contractor licence required for work >$5,000 (Home Building Act 1989)
- Maximum deposit: 10% of contract price (Home Building Act 1989 NSW)
- HBC Insurance required for work >$20,000 (Home Building Act 1989 NSW)
- Sydney Metro 2024 rates: Colorbond roofing $85-120/m², Guttering $45-75/lm, Ridge capping $35-55/lm
- Licensed roof plumber rates: $65-95/hour (NSW Fair Work rates 2024)

ANALYSIS REQUIREMENTS:
1. Compare each line item against typical Sydney metro rates
2. Consider material costs from major suppliers (Lysaght, Metroll, Stramit)
3. Factor in licensed roof plumber labor rates ($65-95/hour)
4. Account for reasonable profit margins (10-20%)
5. Flag items >15% above market rate
6. Check deposit does not exceed 10% of total

RESPONSE FORMAT: Return ONLY valid JSON matching this structure:
{
  "score": <0-100 overall pricing score>,
  "marketRate": <estimated fair total>,
  "quotedRate": <total from quote>,
  "variance": <percentage difference>,
  "confidence": "high" | "medium" | "low",
  "findings": [
    {
      "item": "<line item>",
      "quotedPrice": <price if found>,
      "marketPrice": <estimated market price>,
      "status": "assessed" | "flagged" | "insufficient-data",
      "message": "<explanation>",
      "citation": "<source for market rate - must be specific>"
    }
  ]
}

CRITICAL: If information is insufficient, use "insufficient-data" status. Never fabricate data.
`,

  materials: (quoteText: string) => `
You are an expert in Australian building materials and roofing standards.

TASK: Analyze the materials specified in this roofing quote for quality and compliance.

QUOTE CONTENT:
${quoteText}

AUTHORITATIVE SOURCES TO REFERENCE:
- AS 1397:2021 - Steel sheet and strip - Hot-dipped metallic-coated
  * Minimum BMT: 0.42mm residential, 0.48mm commercial
  * Coating mass: AM100 inland, AM150 coastal (<1km), AM200 severe marine
- AS 1562.1:2018 - Design and installation of sheet metal roof and wall cladding
  * Referenced by NCC for weatherproofing compliance
- SA HB 39:2015 - Installation Code for Metal Roof and Wall Cladding
  * Companion to AS 1562.1, provides installation guidelines
- NCC 2022 Housing Provisions Part 7.2.2 - Sheet roofing materials
  * Steel must comply with AS 1397, aluminium with AS/NZS 1734
- BlueScope Colorbond warranty: 10yr perforation, 15yr peeling/flaking

ANALYSIS REQUIREMENTS:
1. Check material specifications against AS 1397:2021 (steel sheet standards)
2. Verify compliance with SA HB 39:2015 (metal roofing installation)
3. Assess material grades and thickness requirements (min 0.42mm BMT)
4. Identify any substandard or non-compliant materials
5. Note supplier/manufacturer where mentioned
6. Check fastener class compatibility (Class 4 for Colorbond, Class 3 for Zincalume)

RESPONSE FORMAT: Return ONLY valid JSON matching this structure:
{
  "score": <0-100 materials quality score>,
  "confidence": "high" | "medium" | "low",
  "findings": [
    {
      "material": "<material name>",
      "specified": "<specification from quote>",
      "standard": "<applicable standard - must cite specific clause>",
      "status": "assessed" | "flagged" | "insufficient-data",
      "message": "<assessment>",
      "supplier": "<supplier if mentioned>",
      "citation": "<standard reference with clause number>"
    }
  ]
}

CRITICAL: If material details are missing, use "insufficient-data" status. Never assume specifications.
`,

  compliance: (quoteText: string) => `
You are an expert in Australian building codes and construction compliance.

TASK: Analyze this roofing quote for compliance with Australian building codes and safety standards.

QUOTE CONTENT:
${quoteText}

AUTHORITATIVE SOURCES TO REFERENCE:
- NCC 2022 Housing Provisions Part 7 - Roof and Wall Cladding
  * Part 7.2.2: Sheet roofing materials must comply with AS 1397
  * Part 7.2.3: Sheet roofing fixing must comply with AS 1562.1
  * Source: https://ncc.abcb.gov.au/editions/ncc-2022/adopted/housing-provisions/7-roof-and-wall-cladding
- SA HB 39:2015 - Installation Code for Metal Roof and Wall Cladding
  * Section 4: Roof safety requirements
  * Section 5: Gutters and drainage
  * Section 6: Roof insulation
  * Source: https://hia.com.au/resources-and-advice/building-it-right/australian-standards
- SafeWork NSW WHS Regulation 2025
  * Sections 78-80: Fall protection requirements
  * SWMS required for work with fall risk >2m
  * Source: https://www.safework.nsw.gov.au/hazards-a-z/working-at-heights
- NSW Fair Trading Home Building Act 1989
  * Contractor licence required for work >$5,000
  * Written contract required for work >$5,000
  * HBC insurance required for work >$20,000
  * Source: https://www.nsw.gov.au/housing-and-construction/compliance-and-regulation

ANALYSIS REQUIREMENTS:
1. Check against SA HB 39:2015 (Installation Code for Metal Roofing)
2. Verify NCC 2022 Housing Provisions Part 7 requirements
3. Assess SafeWork NSW fall protection compliance (SWMS mention)
4. Check for contractor licence number display
5. Verify written contract and insurance mentions for work >$20,000
6. Check ventilation and drainage requirements

RESPONSE FORMAT: Return ONLY valid JSON matching this structure:
{
  "score": <0-100 compliance score>,
  "confidence": "high" | "medium" | "low",
  "findings": [
    {
      "requirement": "<compliance requirement>",
      "standard": "<standard name with edition>",
      "clause": "<specific clause or section>",
      "status": "appears-compliant" | "needs-review" | "unclear" | "insufficient-data",
      "message": "<assessment>",
      "reference": "<full reference with URL>",
      "citation": "<authoritative source>"
    }
  ]
}

CRITICAL: Use "unclear" or "insufficient-data" when quote doesn't address a requirement. Never assume compliance.
`,

  warranty: (quoteText: string) => `
You are an expert in Australian construction warranties and consumer protection.

TASK: Analyze the warranty terms in this roofing quote.

QUOTE CONTENT:
${quoteText}

AUTHORITATIVE SOURCES TO REFERENCE:
- Australian Consumer Law (Competition and Consumer Act 2010)
  * Consumer guarantees apply to all building services
  * Services must be provided with due care and skill
  * Services must be fit for purpose and completed in reasonable time
- NSW Home Building Act 1989 - Statutory Warranties
  * 6-year warranty period for major defects
  * 2-year warranty period for other defects
  * Applies to all residential building work
- BlueScope Colorbond Warranty Terms (2024)
  * 10 years against perforation by corrosion
  * 15 years against peeling, flaking, or blistering (non-severe environments)
  * Reduced warranty in severe marine/industrial zones
  * Registration required within 30 days of installation
- Industry Standards
  * Workmanship warranty: 7-10 years typical
  * Material warranties: 10-20 years from manufacturer

ANALYSIS REQUIREMENTS:
1. Identify workmanship warranty (industry standard: 7-10 years)
2. Identify material warranties (Colorbond: 10yr perforation, 15yr peeling)
3. Check for HBC insurance-backed warranty mentions (required >$20,000)
4. Note any exclusions or conditions
5. Compare against Australian Consumer Law requirements
6. Check warranty registration requirements

RESPONSE FORMAT: Return ONLY valid JSON matching this structure:
{
  "score": <0-100 warranty score>,
  "confidence": "high" | "medium" | "low",
  "findings": [
    {
      "item": "<warranty type>",
      "warrantyTerm": "<duration from quote>",
      "industryStandard": "<typical industry term with source>",
      "status": "assessed" | "flagged" | "insufficient-data",
      "message": "<assessment>",
      "citation": "<authoritative source>"
    }
  ]
}

CRITICAL: If warranty terms are not specified, use "insufficient-data" status. Never assume warranty coverage.
`,

  comparison: (quotesData: string) => `
You are an expert construction quote analyst.

TASK: Compare the following roofing quotes and determine the best value option.

QUOTES DATA:
${quotesData}

ANALYSIS REQUIREMENTS:
1. Compare overall value, not just lowest price
2. Consider material quality differences
3. Weight compliance and safety factors
4. Evaluate warranty coverage
5. Identify potential savings

RESPONSE FORMAT: Return ONLY valid JSON matching this structure:
{
  "bestValueQuoteId": <quote ID number>,
  "confidence": "high" | "medium" | "low",
  "totalSavings": <potential savings amount>,
  "categoryWinners": {
    "pricing": <quote ID>,
    "materials": <quote ID>,
    "compliance": <quote ID>,
    "warranty": <quote ID>
  },
  "detailedAnalysis": {
    "pricing": "<comparison analysis>",
    "materials": "<comparison analysis>",
    "compliance": "<comparison analysis>",
    "warranty": "<comparison analysis>",
    "overall": "<overall recommendation>"
  },
  "recommendations": ["<actionable recommendation>"]
}

CRITICAL: Base recommendations only on provided data. Never fabricate quote details.
`
};

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calculate retry delay with exponential backoff and jitter
 */
function calculateRetryDelay(attempt: number): number {
  const exponentialDelay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
  const jitter = Math.random() * 1000;
  return Math.min(exponentialDelay + jitter, MAX_RETRY_DELAY);
}

/**
 * Estimate token count (rough approximation)
 */
function estimateTokens(text: string): number {
  // Rough estimate: ~4 characters per token
  return Math.ceil(text.length / 4);
}

/**
 * Calculate estimated cost based on token usage
 * Perplexity Sonar Pro pricing (approximate)
 */
function calculateCost(promptTokens: number, completionTokens: number): number {
  const promptCostPer1K = 0.003;
  const completionCostPer1K = 0.015;
  return (promptTokens / 1000) * promptCostPer1K + (completionTokens / 1000) * completionCostPer1K;
}

/**
 * Validate response against JSON schema
 */
function validateResponse<T>(data: any, schema: any): T {
  // Basic validation - check required fields
  if (schema.required) {
    for (const field of schema.required) {
      if (data[field] === undefined) {
        throw new LLMError(
          `Response missing required field: ${field}`,
          "VALIDATION_ERROR",
          false
        );
      }
    }
  }

  // Validate score range if present
  if (schema.properties?.score && typeof data.score === "number") {
    if (data.score < 0 || data.score > 100) {
      throw new LLMError(
        `Invalid score value: ${data.score}. Must be 0-100.`,
        "VALIDATION_ERROR",
        false
      );
    }
  }

  // Validate confidence enum if present
  if (data.confidence && !["high", "medium", "low"].includes(data.confidence)) {
    data.confidence = "medium"; // Default to medium if invalid
  }

  return data as T;
}

/**
 * Parse JSON from LLM response
 */
function parseJSONResponse(response: string): any {
  // Try to extract JSON from markdown code blocks
  const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[1].trim());
  }

  // Try to find raw JSON object
  const objectMatch = response.match(/\{[\s\S]*\}/);
  if (objectMatch) {
    return JSON.parse(objectMatch[0]);
  }

  throw new LLMError(
    "Could not extract JSON from response",
    "PARSE_ERROR",
    true
  );
}

/**
 * Main LLM call function with retry logic
 */
export async function callLLM<T>(
  prompt: string,
  schema: any,
  options: {
    maxRetries?: number;
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<LLMResponse<T>> {
  const { maxRetries = MAX_RETRIES, temperature = 0.1, maxTokens = 2500 } = options;

  if (!SONAR_API_KEY) {
    throw new LLMError(
      "AI service not configured. Please contact support.",
      "CONFIG_ERROR",
      false
    );
  }

  const startTime = Date.now();
  let lastError: Error | null = null;
  let retries = 0;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await axios.post(
        SONAR_API_URL,
        {
          model: "sonar-pro",
          messages: [
            {
              role: "system",
              content: `You are an expert construction quote verification AI for Australian roofing projects. 
Always respond with valid JSON matching the requested schema.
Never fabricate data - use "insufficient-data" status when information is missing.
Include citations for all factual claims.
Prompt version: ${PROMPT_TEMPLATES.version}`
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature,
          max_tokens: maxTokens,
          response_format: { type: "json_object" }
        },
        {
          headers: {
            Authorization: `Bearer ${SONAR_API_KEY}`,
            "Content-Type": "application/json"
          },
          timeout: 90000 // 90 second timeout
        }
      );

      const content = response.data?.choices?.[0]?.message?.content;
      if (!content) {
        throw new LLMError("Empty response from AI service", "EMPTY_RESPONSE", true);
      }

      // Parse and validate response
      const parsed = parseJSONResponse(content);
      const validated = validateResponse<T>(parsed, schema);

      // Calculate token usage
      const promptTokens = estimateTokens(prompt);
      const completionTokens = estimateTokens(content);
      const usage: TokenUsage = {
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
        estimatedCost: calculateCost(promptTokens, completionTokens)
      };

      // Log usage for monitoring
      console.log(`[LLM] Call completed: ${usage.totalTokens} tokens, $${usage.estimatedCost.toFixed(4)}, ${retries} retries`);

      return {
        data: validated,
        usage,
        latency: Date.now() - startTime,
        retries
      };

    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      retries = attempt;

      // Check if error is retryable
      if (error instanceof LLMError && !error.retryable) {
        throw error;
      }

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        
        // Non-retryable errors
        if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
          throw new LLMError("AI service authentication failed", "AUTH_ERROR", false, error);
        }

        // Retryable errors
        if (axiosError.response?.status === 429) {
          console.log(`[LLM] Rate limited, waiting before retry ${attempt + 1}/${maxRetries}`);
        } else if (axiosError.code === "ECONNABORTED" || axiosError.code === "ETIMEDOUT") {
          console.log(`[LLM] Timeout, retrying ${attempt + 1}/${maxRetries}`);
        } else if (axiosError.response?.status && axiosError.response.status >= 500) {
          console.log(`[LLM] Server error ${axiosError.response.status}, retrying ${attempt + 1}/${maxRetries}`);
        }
      }

      // Wait before retry (except on last attempt)
      if (attempt < maxRetries) {
        const delay = calculateRetryDelay(attempt);
        console.log(`[LLM] Waiting ${delay}ms before retry`);
        await sleep(delay);
      }
    }
  }

  // All retries exhausted
  throw new LLMError(
    "AI service temporarily unavailable after multiple attempts. Please try again later.",
    "MAX_RETRIES",
    false,
    lastError || undefined
  );
}

/**
 * Convenience functions for specific analysis types
 */
export async function analyzePricingEnhanced(quoteText: string) {
  return callLLM(
    PROMPT_TEMPLATES.pricing(quoteText),
    SCHEMAS.pricingAnalysis,
    { temperature: 0.1 }
  );
}

export async function analyzeMaterialsEnhanced(quoteText: string) {
  return callLLM(
    PROMPT_TEMPLATES.materials(quoteText),
    SCHEMAS.materialsAnalysis,
    { temperature: 0.1 }
  );
}

export async function analyzeComplianceEnhanced(quoteText: string) {
  return callLLM(
    PROMPT_TEMPLATES.compliance(quoteText),
    SCHEMAS.complianceAnalysis,
    { temperature: 0.1 }
  );
}

export async function analyzeWarrantyEnhanced(quoteText: string) {
  return callLLM(
    PROMPT_TEMPLATES.warranty(quoteText),
    SCHEMAS.warrantyAnalysis,
    { temperature: 0.1 }
  );
}

export async function analyzeComparisonEnhanced(quotesData: string) {
  return callLLM(
    PROMPT_TEMPLATES.comparison(quotesData),
    SCHEMAS.comparisonAnalysis,
    { temperature: 0.2, maxTokens: 3000 }
  );
}

/**
 * Batch analysis with parallel execution and error handling
 */
export async function runFullAnalysis(quoteText: string): Promise<{
  pricing: any;
  materials: any;
  compliance: any;
  warranty: any;
  totalUsage: TokenUsage;
  totalLatency: number;
}> {
  const startTime = Date.now();
  
  const results = await Promise.allSettled([
    analyzePricingEnhanced(quoteText),
    analyzeMaterialsEnhanced(quoteText),
    analyzeComplianceEnhanced(quoteText),
    analyzeWarrantyEnhanced(quoteText)
  ]);

  // Aggregate results
  const totalUsage: TokenUsage = {
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
    estimatedCost: 0
  };

  const extractResult = (result: PromiseSettledResult<LLMResponse<any>>, category: string) => {
    if (result.status === "fulfilled") {
      totalUsage.promptTokens += result.value.usage.promptTokens;
      totalUsage.completionTokens += result.value.usage.completionTokens;
      totalUsage.totalTokens += result.value.usage.totalTokens;
      totalUsage.estimatedCost += result.value.usage.estimatedCost;
      return result.value.data;
    } else {
      console.error(`[LLM] ${category} analysis failed:`, result.reason);
      throw new LLMError(
        `${category} analysis failed: ${result.reason?.message || "Unknown error"}`,
        "ANALYSIS_FAILED",
        false,
        result.reason
      );
    }
  };

  return {
    pricing: extractResult(results[0], "Pricing"),
    materials: extractResult(results[1], "Materials"),
    compliance: extractResult(results[2], "Compliance"),
    warranty: extractResult(results[3], "Warranty"),
    totalUsage,
    totalLatency: Date.now() - startTime
  };
}
