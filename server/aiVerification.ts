import axios from "axios";
import { verifyQuoteCompliance } from "./complianceVerification";
import { ENV } from "./_core/env";

const SONAR_API_KEY = ENV.sonarApiKey;
const SONAR_API_URL = "https://api.perplexity.ai/chat/completions";

/**
 * Extract project type from quote text using keyword matching.
 * Defaults to 'general' if no specific type is detected.
 */
function extractProjectType(text: string): string {
  const lower = text.toLowerCase();
  const typeMap: Record<string, string[]> = {
    roofing: ["roof", "roofing", "gutter", "fascia", "soffit", "flashing", "colorbond", "metal roof", "tile roof", "roof plumb"],
    plumbing: ["plumbing", "plumber", "pipe", "drainage", "sewer", "hot water", "tap", "fixture"],
    electrical: ["electrical", "electrician", "wiring", "switchboard", "circuit", "power point", "lighting"],
    building: ["building", "construction", "renovation", "extension", "structural", "foundation", "framing"],
    hvac: ["hvac", "air conditioning", "heating", "ventilation", "ducted", "split system", "refrigeration"],
    painting: ["painting", "painter", "coat", "primer", "dulux", "taubmans"],
    tiling: ["tiling", "tiler", "tile", "grout", "waterproofing"],
    concreting: ["concrete", "concreting", "slab", "footing", "driveway"],
    landscaping: ["landscaping", "garden", "retaining wall", "paving", "turf"],
    glazing: ["glazing", "glass", "window", "door", "double glazed"],
  };
  for (const [type, keywords] of Object.entries(typeMap)) {
    if (keywords.some((kw) => lower.includes(kw))) return type;
  }
  return "general";
}

/**
 * Extract Australian state from quote text using address patterns and state codes.
 * Defaults to 'NSW' as the most common jurisdiction.
 */
function extractState(text: string): string {
  const upper = text.toUpperCase();
  const statePatterns: Record<string, RegExp[]> = {
    NSW: [/\bNSW\b/, /\bNEW SOUTH WALES\b/, /\bSYDNEY\b/, /\bNEWCASTLE\b/, /\bWOLLONGONG\b/],
    VIC: [/\bVIC\b/, /\bVICTORIA\b/, /\bMELBOURNE\b/, /\bGEELONG\b/, /\bBALLARAT\b/],
    QLD: [/\bQLD\b/, /\bQUEENSLAND\b/, /\bBRISBANE\b/, /\bGOLD COAST\b/, /\bCAIRNS\b/],
    WA: [/\bWA\b(?!RR|LL|NT|SH|TE)/, /\bWESTERN AUSTRALIA\b/, /\bPERTH\b/],
    SA: [/\bSA\b(?!FE|LE|VE|ID)/, /\bSOUTH AUSTRALIA\b/, /\bADELAIDE\b/],
    TAS: [/\bTAS\b/, /\bTASMANIA\b/, /\bHOBART\b/, /\bLAUNCESTON\b/],
    NT: [/\bNT\b(?!\w)/, /\bNORTHERN TERRITORY\b/, /\bDARWIN\b/],
    ACT: [/\bACT\b(?!I|U|S)/, /\bCANBERRA\b/],
  };
  for (const [state, patterns] of Object.entries(statePatterns)) {
    if (patterns.some((p) => p.test(upper))) return state;
  }
  // Check for postcodes
  const postcodeMatch = text.match(/\b(\d{4})\b/);
  if (postcodeMatch) {
    const pc = parseInt(postcodeMatch[1]);
    if (pc >= 2000 && pc <= 2999) return "NSW";
    if (pc >= 3000 && pc <= 3999) return "VIC";
    if (pc >= 4000 && pc <= 4999) return "QLD";
    if (pc >= 5000 && pc <= 5999) return "SA";
    if (pc >= 6000 && pc <= 6999) return "WA";
    if (pc >= 7000 && pc <= 7999) return "TAS";
    if (pc >= 800 && pc <= 899) return "NT";
    if (pc >= 2600 && pc <= 2619) return "ACT";
  }
  return "NSW";
}

/**
 * Extract building class from quote text using NCC classification keywords.
 * Defaults to '1a' (standard residential) if no specific class is detected.
 */
function extractBuildingClass(text: string): string {
  const lower = text.toLowerCase();
  if (/\bclass\s*10[ab]?\b/i.test(text) || lower.includes("shed") || lower.includes("carport") || lower.includes("garage")) return "10a";
  if (/\bclass\s*2\b/i.test(text) || lower.includes("apartment") || lower.includes("unit") || lower.includes("multi-unit")) return "2";
  if (/\bclass\s*3\b/i.test(text) || lower.includes("hotel") || lower.includes("motel") || lower.includes("hostel")) return "3";
  if (/\bclass\s*[4-9]\b/i.test(text) || lower.includes("commercial") || lower.includes("office") || lower.includes("retail") || lower.includes("shop")) return "5";
  if (/\bclass\s*1[ab]\b/i.test(text)) return text.match(/class\s*1([ab])/i)?.[1] === "b" ? "1b" : "1a";
  if (lower.includes("residential") || lower.includes("house") || lower.includes("dwelling") || lower.includes("home")) return "1a";
  return "1a";
}

// Custom error classes for explicit error handling
export class ExtractionError extends Error {
  constructor(message: string, public readonly originalError?: Error) {
    super(message);
    this.name = 'ExtractionError';
  }
}

export class AIAnalysisError extends Error {
  constructor(message: string, public readonly category: string, public readonly originalError?: Error) {
    super(message);
    this.name = 'AIAnalysisError';
  }
}

interface VerificationResult {
  overallScore: number;
  pricingScore: number;
  materialsScore: number;
  complianceScore: number;
  warrantyScore: number;
  statusBadge: "green" | "amber" | "red";
  pricingDetails: any;
  materialsDetails: any;
  complianceDetails: any;
  warrantyDetails: any;
  flags: Array<{
    category: "pricing" | "materials" | "compliance" | "warranty";
    severity: "high" | "medium" | "low";
    message: string;
  }>;
  recommendations: Array<{
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
  }>;
  // New field to indicate analysis confidence
  analysisConfidence: "high" | "medium" | "low";
  analysisWarnings: string[];
  // Australian Standards compliance results
  australianStandardsCompliance?: {
    overallCompliance: "compliant" | "non-compliant" | "partial";
    confidenceScore: number;
    verifiedStandards: Array<{
      standardId: string;
      title: string;
      status: "compliant" | "non-compliant" | "not-applicable";
      findings: string[];
    }>;
    findings: Array<{
      category: string;
      severity: "high" | "medium" | "low";
      message: string;
      standardReference: string;
    }>;
  };
}

/**
 * Call Perplexity API with a prompt
 * CRITICAL: This function throws on failure - no silent fallbacks
 */
async function callPerplexityAPI(prompt: string): Promise<string> {
  if (!SONAR_API_KEY) {
    throw new AIAnalysisError(
      "AI analysis service is not configured. Please contact support.",
      "configuration"
    );
  }

  try {
    const response = await axios.post(
      SONAR_API_URL,
      {
        model: "sonar-pro",
        messages: [
          {
            role: "system",
            content: "You are an expert construction quote verification AI specializing in Australian roofing, building codes (HB-39, NCC 2022), and compliance standards. Provide accurate, detailed analysis with specific references. Always respond with valid JSON.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.2,
        max_tokens: 2000,
      },
      {
        headers: {
          Authorization: `Bearer ${SONAR_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 60000, // 60 second timeout
      }
    );

    if (!response.data?.choices?.[0]?.message?.content) {
      throw new AIAnalysisError(
        "AI service returned an invalid response. Please try again.",
        "response"
      );
    }

    return response.data.choices[0].message.content;
  } catch (error) {
    if (error instanceof AIAnalysisError) {
      throw error;
    }
    
    // Handle specific axios errors
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        throw new AIAnalysisError(
          "AI analysis timed out. The service may be experiencing high load. Please try again in a few minutes.",
          "timeout",
          error
        );
      }
      if (error.response?.status === 429) {
        throw new AIAnalysisError(
          "AI service rate limit reached. Please wait a moment and try again.",
          "rate_limit",
          error
        );
      }
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new AIAnalysisError(
          "AI service authentication failed. Please contact support.",
          "auth",
          error
        );
      }
    }
    
    console.error("Perplexity API error:", error);
    throw new AIAnalysisError(
      "AI analysis service is temporarily unavailable. Please try again later.",
      "service",
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Extract text from quote file using PDF parsing or OCR
 * CRITICAL: This function throws on failure - no silent fallbacks
 */
export async function extractQuoteText(fileUrl: string): Promise<string> {
  console.log(`[OCR] Extracting text from: ${fileUrl}`);

  // Validate URL
  if (!fileUrl || typeof fileUrl !== 'string') {
    throw new ExtractionError("Invalid file URL provided");
  }

  try {
    // Download file from URL
    const axios = await import('axios');
    const response = await axios.default.get(fileUrl, { 
      responseType: 'arraybuffer',
      timeout: 30000 // 30 second timeout
    });
    const fileBuffer = Buffer.from(response.data);

    // Validate file size
    if (fileBuffer.length === 0) {
      throw new ExtractionError("Downloaded file is empty");
    }

    // Determine file type from URL or content
    const isPDF = fileUrl.toLowerCase().includes('.pdf') || 
                  response.headers['content-type']?.includes('pdf');
    
    if (isPDF) {
      // Extract text from PDF using pdf-parse
      const { PDFParse } = await import('pdf-parse');
      const parser = new PDFParse({ data: fileBuffer });
      const textResult = await parser.getText();
      const pdfData = { text: textResult.text };
      
      if (!pdfData.text || pdfData.text.trim().length < 50) {
        throw new ExtractionError(
          "Could not extract sufficient text from PDF. The document may be a scanned image or encrypted. Please upload a text-based PDF or contact support for assistance."
        );
      }
      
      console.log(`[OCR] Extracted ${pdfData.text.length} characters from PDF`);
      return pdfData.text;
    } else {
      // For images, attempt OCR
      const fs = await import('fs/promises');
      const path = await import('path');
      const os = await import('os');
      const { execSync } = await import('child_process');
      
      const tempDir = os.tmpdir();
      const tempImagePath = path.join(tempDir, `quote-${Date.now()}.jpg`);
      
      await fs.writeFile(tempImagePath, fileBuffer);
      
      try {
        // Try using tesseract if available
        const ocrOutput = execSync(`tesseract ${tempImagePath} stdout`, { 
          encoding: 'utf-8',
          stdio: ['pipe', 'pipe', 'ignore'], // Suppress stderr
          timeout: 60000 // 60 second timeout
        });
        
        await fs.unlink(tempImagePath).catch(() => {});
        
        if (!ocrOutput || ocrOutput.trim().length < 50) {
          throw new ExtractionError(
            "Could not extract sufficient text from image. The image may be too low quality or not contain readable text. Please upload a clearer image or a PDF document."
          );
        }
        
        console.log(`[OCR] Extracted ${ocrOutput.length} characters from image`);
        return ocrOutput;
      } catch (tesseractError) {
        await fs.unlink(tempImagePath).catch(() => {});
        
        // CRITICAL: Do NOT fall back to sample data - throw explicit error
        throw new ExtractionError(
          "Image text extraction is currently unavailable. Please upload your quote as a PDF document instead, or try again later."
        );
      }
    }
  } catch (error) {
    if (error instanceof ExtractionError) {
      throw error;
    }
    
    console.error('[OCR] Text extraction failed:', error);
    throw new ExtractionError(
      "Failed to process the uploaded file. Please ensure the file is a valid PDF or image and try again.",
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Parse JSON from AI response with validation
 * CRITICAL: Throws on parse failure - no silent fallbacks
 */
function parseAIResponse(response: string, category: string): any {
  try {
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new AIAnalysisError(
        `AI returned invalid response format for ${category} analysis. Please try again.`,
        category
      );
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    // Validate required fields
    if (typeof parsed.score !== 'number' || parsed.score < 0 || parsed.score > 100) {
      throw new AIAnalysisError(
        `AI returned invalid score for ${category} analysis. Please try again.`,
        category
      );
    }
    
    return parsed;
  } catch (error) {
    if (error instanceof AIAnalysisError) {
      throw error;
    }
    
    console.error(`Failed to parse ${category} analysis:`, error);
    throw new AIAnalysisError(
      `Failed to process ${category} analysis results. Please try again.`,
      category,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Analyze pricing using AI
 * CRITICAL: Throws on failure - no silent fallbacks
 */
async function analyzePricing(quoteText: string): Promise<any> {
  const prompt = `
Analyze the following roofing quote for pricing accuracy against Australian market rates (2024):

${quoteText}

Provide a JSON response with:
{
  "score": <0-100>,
  "marketRate": <estimated fair market rate>,
  "quotedRate": <total from quote>,
  "variance": <percentage difference>,
  "findings": [
    {
      "item": "<line item name>",
      "status": "assessed" | "flagged",
      "message": "<explanation>"
    }
  ]
}

Consider:
- Typical Sydney metro rates for residential roofing
- Material costs from major suppliers (Lysaght, Metroll, Stramit)
- Labor rates for licensed roof plumbers
- Reasonable profit margins (10-20%)
`;

  const response = await callPerplexityAPI(prompt);
  return parseAIResponse(response, "pricing");
}

/**
 * Analyze materials using AI
 * CRITICAL: Throws on failure - no silent fallbacks
 */
async function analyzeMaterials(quoteText: string): Promise<any> {
  const prompt = `
Analyze the materials specified in this roofing quote for quality and compliance:

${quoteText}

Provide a JSON response with:
{
  "score": <0-100>,
  "findings": [
    {
      "material": "<material name>",
      "specified": "<specification>",
      "status": "assessed" | "flagged",
      "message": "<compliance/quality assessment>",
      "supplier": "<supplier name if mentioned>"
    }
  ]
}

Check against:
- AS 1397 (steel roofing standards)
- HB-39 (installation code)
- Manufacturer specifications
- Quality grades and thickness requirements
`;

  const response = await callPerplexityAPI(prompt);
  return parseAIResponse(response, "materials");
}

/**
 * Analyze compliance using AI
 * CRITICAL: Throws on failure - no silent fallbacks
 */
async function analyzeCompliance(quoteText: string): Promise<any> {
  const prompt = `
Analyze this roofing quote for compliance with Australian building codes and safety standards:

${quoteText}

Provide a JSON response with:
{
  "score": <0-100>,
  "findings": [
    {
      "requirement": "<compliance requirement>",
      "status": "appears-compliant" | "needs-review" | "unclear",
      "message": "<assessment>",
      "reference": "<code reference, e.g., HB-39 Section 4.2>"
    }
  ]
}

Check:
- HB-39 (Installation Code for Metal Roofing)
- NCC 2022 Building Code of Australia
- SafeWork NSW fall protection requirements
- Structural adequacy and engineer certification
- Ventilation and drainage requirements
`;

  const response = await callPerplexityAPI(prompt);
  return parseAIResponse(response, "compliance");
}

/**
 * Analyze warranty using AI
 * CRITICAL: Throws on failure - no silent fallbacks
 */
async function analyzeWarranty(quoteText: string): Promise<any> {
  const prompt = `
Analyze the warranty terms in this roofing quote:

${quoteText}

Provide a JSON response with:
{
  "score": <0-100>,
  "findings": [
    {
      "item": "<warranty type>",
      "warrantyTerm": "<duration>",
      "status": "assessed" | "flagged",
      "message": "<assessment against industry standards>"
    }
  ]
}

Compare against:
- Industry standard workmanship warranty (7-10 years)
- Manufacturer material warranties (typically 10-20 years)
- Insurance-backed warranty requirements
- Exclusions and conditions
`;

  const response = await callPerplexityAPI(prompt);
  return parseAIResponse(response, "warranty");
}

/**
 * Calculate overall score and status badge
 */
function calculateOverallScore(
  pricingScore: number,
  materialsScore: number,
  complianceScore: number,
  warrantyScore: number
): { score: number; badge: "green" | "amber" | "red" } {
  // Weighted average: pricing 30%, materials 25%, compliance 30%, warranty 15%
  const score = Math.round(
    pricingScore * 0.3 +
    materialsScore * 0.25 +
    complianceScore * 0.3 +
    warrantyScore * 0.15
  );

  let badge: "green" | "amber" | "red";
  if (score >= 85) {
    badge = "green";
  } else if (score >= 70) {
    badge = "amber";
  } else {
    badge = "red";
  }

  return { score, badge };
}

/**
 * Generate flags and recommendations
 */
function generateFlagsAndRecommendations(
  pricingDetails: any,
  materialsDetails: any,
  complianceDetails: any,
  warrantyDetails: any
): { flags: VerificationResult["flags"]; recommendations: VerificationResult["recommendations"] } {
  const flags: VerificationResult["flags"] = [];
  const recommendations: VerificationResult["recommendations"] = [];

  // Check pricing variance
  if (pricingDetails.variance > 15) {
    flags.push({
      category: "pricing",
      severity: "high",
      message: `Quote appears to be ${pricingDetails.variance.toFixed(1)}% above typical market range`,
    });
    recommendations.push({
      title: "Review pricing details",
      description: "Consider requesting an itemized breakdown and comparing with other quotes",
      priority: "high",
    });
  } else if (pricingDetails.variance > 10) {
    flags.push({
      category: "pricing",
      severity: "medium",
      message: `Quote appears to be ${pricingDetails.variance.toFixed(1)}% above typical market range`,
    });
  }

  // Check warranty
  const workmanshipWarranty = warrantyDetails.findings?.find((f: any) => 
    f.item?.toLowerCase().includes("workmanship")
  );
  if (workmanshipWarranty && workmanshipWarranty.status === "flagged") {
    flags.push({
      category: "warranty",
      severity: "low",
      message: "Workmanship warranty may be below typical industry terms",
    });
    recommendations.push({
      title: "Discuss warranty terms",
      description: "Consider asking about extended workmanship warranty options",
      priority: "medium",
    });
  }

  // Check compliance issues
  const unclearItems = complianceDetails.findings?.filter(
    (f: any) => f.status === "needs-review" || f.status === "unclear"
  ) || [];
  if (unclearItems.length > 0) {
    flags.push({
      category: "compliance",
      severity: "medium",
      message: `${unclearItems.length} item(s) may need clarification`,
    });
    recommendations.push({
      title: "Clarify compliance details",
      description: "Consider asking the contractor to clarify compliance-related items",
      priority: "medium",
    });
  }

  return { flags, recommendations };
}

/**
 * Extract basic metadata from quote text (contractor name, total, etc.)
 */
export async function extractQuoteMetadata(quoteText: string): Promise<{
  contractor?: string;
  totalAmount?: number;
  projectAddress?: string;
  quoteDate?: string;
  validUntil?: string;
  abn?: string;
  phone?: string;
  email?: string;
  licenseNumber?: string;
  lineItems?: Array<{ description: string; quantity: number; unitPrice: number; total: number }>;
}> {
  const prompt = `
Extract the following information from this construction/roofing quote:

${quoteText}

Provide a JSON response with:
{
  "contractor": "<business/contractor name>",
  "totalAmount": <total amount as number, no currency symbols>,
  "projectAddress": "<site/project address if mentioned>",
  "quoteDate": "<quote date in YYYY-MM-DD format if found>",
  "validUntil": "<quote validity date in YYYY-MM-DD format if found>",
  "abn": "<ABN number if found, format: XX XXX XXX XXX>",
  "phone": "<phone number if found>",
  "email": "<email address if found>",
  "licenseNumber": "<license/registration number if found>",
  "lineItems": [
    {
      "description": "<item description>",
      "quantity": <quantity as number>,
      "unitPrice": <unit price as number>,
      "total": <line total as number>
    }
  ]
}

IMPORTANT:
- For contractor name, look for business name, trading name, or company name at the top of the quote
- Extract the EXACT business name as written on the quote
- If no business name found, look for individual tradesperson name
- For totalAmount, extract the final total including GST if shown
- Return null for any field not found in the document
`;

  try {
    const response = await callPerplexityAPI(prompt);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn('[Metadata] Could not extract JSON from response');
      return {};
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      contractor: parsed.contractor || undefined,
      totalAmount: typeof parsed.totalAmount === 'number' ? parsed.totalAmount : undefined,
      projectAddress: parsed.projectAddress || undefined,
      quoteDate: parsed.quoteDate || undefined,
      validUntil: parsed.validUntil || undefined,
      abn: parsed.abn || undefined,
      phone: parsed.phone || undefined,
      email: parsed.email || undefined,
      licenseNumber: parsed.licenseNumber || undefined,
      lineItems: Array.isArray(parsed.lineItems) ? parsed.lineItems : undefined,
    };
  } catch (error) {
    console.error('[Metadata] Failed to extract quote metadata:', error);
    return {};
  }
}

/**
 * Main verification function
 * CRITICAL: Throws explicit errors on failure - no silent fallbacks
 */
export async function verifyQuote(fileUrl: string): Promise<VerificationResult> {
  const analysisWarnings: string[] = [];
  
  // Extract text from quote - will throw ExtractionError on failure
  const quoteText = await extractQuoteText(fileUrl);

  // Check text quality and add warnings
  if (quoteText.length < 200) {
    analysisWarnings.push("Limited text extracted from document - analysis may be incomplete");
  }

  // Run all analyses in parallel - will throw AIAnalysisError on failure
  const [pricingDetails, materialsDetails, complianceDetails, warrantyDetails, australianStandardsCompliance] = await Promise.all([
    analyzePricing(quoteText),
    analyzeMaterials(quoteText),
    analyzeCompliance(quoteText),
    analyzeWarranty(quoteText),
    // Verify against Australian Standards (NCC, HB-39, AS/NZS, WHS)
    verifyQuoteCompliance(quoteText, {
      projectType: extractProjectType(quoteText),
      state: extractState(quoteText),
      buildingClass: extractBuildingClass(quoteText),
    }),
  ]);

  // Calculate overall score
  const { score: overallScore, badge: statusBadge } = calculateOverallScore(
    pricingDetails.score,
    materialsDetails.score,
    complianceDetails.score,
    warrantyDetails.score
  );

  // Generate flags and recommendations
  const { flags, recommendations } = generateFlagsAndRecommendations(
    pricingDetails,
    materialsDetails,
    complianceDetails,
    warrantyDetails
  );

  // Determine analysis confidence based on data quality
  let analysisConfidence: "high" | "medium" | "low" = "high";
  if (quoteText.length < 500) {
    analysisConfidence = "low";
    analysisWarnings.push("Document contains limited information for comprehensive analysis");
  } else if (quoteText.length < 1000) {
    analysisConfidence = "medium";
  }

  return {
    overallScore,
    pricingScore: pricingDetails.score,
    materialsScore: materialsDetails.score,
    complianceScore: complianceDetails.score,
    warrantyScore: warrantyDetails.score,
    statusBadge,
    pricingDetails,
    materialsDetails,
    complianceDetails,
    warrantyDetails,
    flags,
    recommendations,
    analysisConfidence,
    analysisWarnings,
    australianStandardsCompliance,
  };
}
