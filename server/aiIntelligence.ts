import { invokeLLM } from "./_core/llm";

/**
 * AI Intelligence Layer for Venturr
 * Handles normalization, pattern recognition, and intelligent suggestions
 */

export interface SiteNotes {
  rawNotes: string;
  photos?: string[];
}

export interface NormalizedMeasurements {
  area: number;
  linearMeters: number;
  roofPitch?: number;
  roofType?: string;
  accessIssues?: string[];
  materialHints?: string[];
  complianceNotes?: string[];
}

/**
 * Normalizes messy site notes into structured measurement data
 * POST /ai/normalise-site-notes
 */
export async function normaliseSiteNotes(
  notes: SiteNotes
): Promise<NormalizedMeasurements> {
  const prompt = `You are a roofing expert AI. Convert the following site notes into structured measurement data.

Site Notes: ${notes.rawNotes}

Extract and return ONLY a JSON object with this exact structure:
{
  "area": <number in square meters>,
  "linearMeters": <number of lineal meters for gutters/flashings>,
  "roofPitch": <pitch in degrees if mentioned>,
  "roofType": <type of roof: "gable", "hip", "flat", "skillion", etc.>,
  "accessIssues": [<array of access challenges mentioned>],
  "materialHints": [<array of materials mentioned or suggested>],
  "complianceNotes": [<array of compliance or safety notes>]
}

If a value is not mentioned, use null for numbers and empty arrays for lists.`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are an expert Australian roofing contractor AI. You understand trade terminology, Australian building standards (HB-39, NCC), and roofing measurements. Always respond with valid JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "normalized_measurements",
          strict: true,
          schema: {
            type: "object",
            properties: {
              area: { type: ["number", "null"] },
              linearMeters: { type: ["number", "null"] },
              roofPitch: { type: ["number", "null"] },
              roofType: { type: ["string", "null"] },
              accessIssues: {
                type: "array",
                items: { type: "string" },
              },
              materialHints: {
                type: "array",
                items: { type: "string" },
              },
              complianceNotes: {
                type: "array",
                items: { type: "string" },
              },
            },
            required: [
              "area",
              "linearMeters",
              "roofPitch",
              "roofType",
              "accessIssues",
              "materialHints",
              "complianceNotes",
            ],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content in LLM response");
    }

    const normalized = JSON.parse(content);
    return normalized;
  } catch (error) {
    console.error("[AI Intelligence] Normalization failed:", error);
    throw new Error("Failed to normalize site notes");
  }
}

/**
 * Generates intelligent suggestions based on project context
 */
export async function generateProjectSuggestions(projectData: {
  address: string;
  scope: string;
  measurements?: NormalizedMeasurements;
}): Promise<{
  pricingWarnings: string[];
  complianceAlerts: string[];
  materialSuggestions: string[];
  accessRecommendations: string[];
}> {
  const prompt = `You are a roofing business AI advisor. Analyze this project and provide intelligent suggestions.

Project Address: ${projectData.address}
Scope of Work: ${projectData.scope}
${projectData.measurements ? `Measurements: ${JSON.stringify(projectData.measurements)}` : ""}

Provide suggestions in these categories:
1. Pricing Warnings - Any risks of underquoting or missing costs
2. Compliance Alerts - Australian standards (HB-39, NCC) requirements
3. Material Suggestions - Recommended materials based on location/scope
4. Access Recommendations - Safety and access equipment needed

Return ONLY valid JSON with this structure:
{
  "pricingWarnings": [<array of pricing warnings>],
  "complianceAlerts": [<array of compliance requirements>],
  "materialSuggestions": [<array of material recommendations>],
  "accessRecommendations": [<array of access/safety recommendations>]
}`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are an expert Australian roofing business advisor AI. You understand pricing, compliance (HB-39, NCC), materials, and safety requirements for Australian roofing projects.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "project_suggestions",
          strict: true,
          schema: {
            type: "object",
            properties: {
              pricingWarnings: {
                type: "array",
                items: { type: "string" },
              },
              complianceAlerts: {
                type: "array",
                items: { type: "string" },
              },
              materialSuggestions: {
                type: "array",
                items: { type: "string" },
              },
              accessRecommendations: {
                type: "array",
                items: { type: "string" },
              },
            },
            required: [
              "pricingWarnings",
              "complianceAlerts",
              "materialSuggestions",
              "accessRecommendations",
            ],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content in LLM response");
    }

    return JSON.parse(content);
  } catch (error) {
    console.error("[AI Intelligence] Suggestions failed:", error);
    throw new Error("Failed to generate project suggestions");
  }
}

/**
 * Generates compliance documentation (Method Statement, HBCF)
 */
export async function generateComplianceDoc(
  projectData: {
    address: string;
    scope: string;
    measurements?: NormalizedMeasurements;
  },
  docType: "method_statement" | "hbcf" | "safety_plan"
): Promise<string> {
  const docTypeNames = {
    method_statement: "Project Methodology and Facilitation Plan",
    hbcf: "HBCF-Ready Project Description",
    safety_plan: "Work Health and Safety Plan",
  };

  const prompt = `Generate a professional ${docTypeNames[docType]} for this roofing project:

Project Address: ${projectData.address}
Scope of Work: ${projectData.scope}
${projectData.measurements ? `Measurements: Area ${projectData.measurements.area}m², Roof Type: ${projectData.measurements.roofType}` : ""}

Create a comprehensive, compliant document following Australian standards (HB-39, NCC, WHS regulations).
Include all necessary sections, safety requirements, and compliance notes.

Return the document as formatted markdown text.`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are an expert Australian roofing compliance specialist. You create professional, compliant documentation for roofing projects following HB-39, NCC, and WHS regulations.",
        },
        {
          role: "user",
          content: prompt,
        }
      ],
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content in LLM response");
    }

    return content;
  } catch (error) {
    console.error("[AI Intelligence] Compliance doc generation failed:", error);
    throw new Error("Failed to generate compliance documentation");
  }
}

