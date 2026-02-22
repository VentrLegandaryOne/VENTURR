/**
 * Australian Standards Compliance Verification
 * Integrates NCC, HB-39, AS/NZS standards for construction quote verification
 */

import { getDb } from "./db";
import { sql } from "drizzle-orm";
import { invokeLLM } from "./_core/llm";

export interface AustralianStandard {
  id: number;
  standardCode: string;
  title: string;
  category: "structural" | "electrical" | "plumbing" | "roofing" | "fire_safety" | "accessibility" | "general_construction" | "safety" | "energy_efficiency";
  version: string;
  effectiveDate: string;
  supersededDate?: string;
  description: string;
  requirements: any;
  stateVariations?: any;
}

export interface ComplianceVerification {
  quoteId: string;
  standardId: number;
  status: "compliant" | "non_compliant" | "requires_review" | "not_applicable";
  confidenceScore: number;
  findings: string[];
  recommendations: string[];
  verifiedAt: number;
  verifiedBy: string;
}

/**
 * Seed initial Australian Standards data
 * This would typically be populated from official sources
 */
export async function seedAustralianStandards() {
  const db = await getDb();
  if (!db) return;

  const standards = [
    // National Construction Code (NCC) 2022
    {
      standard_code: "NCC-2022-Vol1",
      title: "National Construction Code 2022 - Volume One",
      category: "general_construction",
      version: "2022",
      effective_date: "2022-05-01",
      description: "Building Code of Australia - Commercial and industrial buildings",
      requirements: JSON.stringify({
        fire_safety: {
          required: true,
          sections: ["C1", "C2", "C3", "C4"],
        },
        structural_provisions: {
          required: true,
          sections: ["B1"],
        },
        health_amenity: {
          required: true,
          sections: ["F1", "F2", "F3", "F4"],
        },
      }),
      state_variations: JSON.stringify({
        NSW: { additional_requirements: ["NSW Fire Safety"] },
        VIC: { additional_requirements: ["VIC Building Regulations"] },
        QLD: { additional_requirements: ["QLD Development Code"] },
      }),
    },
    {
      standard_code: "NCC-2022-Vol2",
      title: "National Construction Code 2022 - Volume Two",
      category: "general_construction",
      version: "2022",
      effective_date: "2022-05-01",
      description: "Building Code of Australia - Residential buildings (Class 1 and 10)",
      requirements: JSON.stringify({
        structure: { required: true, sections: ["Part 3.3"] },
        fire_safety: { required: true, sections: ["Part 3.7"] },
        health_amenity: { required: true, sections: ["Part 3.8"] },
        energy_efficiency: { required: true, sections: ["Part 3.12"] },
      }),
    },
    // HB-39 Construction Materials
    {
      standard_code: "HB39-2015",
      title: "Compendium of Australian Standards for Construction Materials",
      category: "general_construction",
      version: "2015",
      effective_date: "2015-01-01",
      description: "Comprehensive guide to material standards for construction",
      requirements: JSON.stringify({
        concrete: ["AS 1379", "AS 3600", "AS 3972"],
        steel: ["AS 4100", "AS/NZS 1163", "AS/NZS 3679"],
        timber: ["AS 1684", "AS 1720", "AS/NZS 2269"],
        masonry: ["AS 3700", "AS/NZS 4455"],
      }),
    },
    // AS/NZS Standards - Structural
    {
      standard_code: "AS3600-2018",
      title: "Concrete structures",
      category: "structural",
      version: "2018",
      effective_date: "2018-07-20",
      description: "Requirements for design and construction of concrete structures",
      requirements: JSON.stringify({
        concrete_grade: { min: "N20", typical: "N32", high_strength: "N50+" },
        reinforcement: { type: ["N", "D", "R"], cover: "min_20mm" },
        durability: { exposure_classification: ["A1", "A2", "B1", "B2", "C", "U"] },
      }),
    },
    {
      standard_code: "AS4100-2020",
      title: "Steel structures",
      category: "structural",
      version: "2020",
      effective_date: "2020-09-25",
      description: "Requirements for design, fabrication and erection of steel structures",
      requirements: JSON.stringify({
        steel_grade: ["250", "300", "350", "400"],
        connections: { bolted: "AS/NZS 1252", welded: "AS/NZS 1554" },
        corrosion_protection: "AS/NZS 2312",
      }),
    },
    // WHS (Work Health & Safety)
    {
      standard_code: "WHS-ACT-2011",
      title: "Work Health and Safety Act 2011",
      category: "safety",
      version: "2011",
      effective_date: "2012-01-01",
      description: "National model WHS laws for workplace safety",
      requirements: JSON.stringify({
        general_duty_of_care: { required: true },
        risk_management: { required: true, hierarchy: ["eliminate", "substitute", "engineer", "admin", "ppe"] },
        consultation: { required: true },
        incident_notification: { required: true, serious_incidents: true },
      }),
    },
    {
      standard_code: "AS1657-2018",
      title: "Fixed platforms, walkways, stairways and ladders",
      category: "safety",
      version: "2018",
      effective_date: "2018-10-12",
      description: "Safety requirements for fixed access equipment",
      requirements: JSON.stringify({
        platform_width: { min: 600, typical: 900 },
        handrail_height: { min: 900, max: 1100 },
        toe_board: { min_height: 100 },
        load_capacity: { min: "2.5kPa" },
      }),
    },
  ];

  for (const standard of standards) {
    try {
      await db.execute(sql`
        INSERT INTO australian_standards (
          standard_code, title, category, version, effective_date,
          description, requirements, state_variations
        ) VALUES (
          ${standard.standard_code},
          ${standard.title},
          ${standard.category},
          ${standard.version},
          ${standard.effective_date},
          ${standard.description},
          ${standard.requirements},
          ${standard.state_variations || null}
        )
        ON DUPLICATE KEY UPDATE
          title = VALUES(title),
          description = VALUES(description),
          requirements = VALUES(requirements)
      `);
    } catch (error) {
      console.error(`Failed to seed standard ${standard.standard_code}:`, error);
    }
  }

  console.log(`[Standards] Seeded ${standards.length} Australian Standards`);
}

/**
 * Get all active standards
 */
export async function getActiveStandards(
  category?: string
): Promise<AustralianStandard[]> {
  const db = await getDb();
  if (!db) return [];

  let query = sql`
    SELECT * FROM australian_standards
    WHERE superseded_date IS NULL
  `;

  if (category) {
    query = sql`
      SELECT * FROM australian_standards
      WHERE superseded_date IS NULL AND category = ${category}
    `;
  }

  query = sql`${query} ORDER BY category, standard_code`;

  const result: any = await db.execute(query);
  const rows = Array.isArray(result) ? result : result.rows || [];

  return rows.map((row: any) => ({
    id: row.id,
    standardCode: row.standard_code,
    title: row.title,
    category: row.category,
    version: row.version,
    effectiveDate: row.effective_date,
    supersededDate: row.superseded_date,
    description: row.description,
    requirements: JSON.parse(row.requirements || "{}"),
    stateVariations: row.state_variations ? JSON.parse(row.state_variations) : undefined,
  }));
}

/**
 * Get applicable standards for a project
 */
export async function getApplicableStandards(
  projectType: string,
  state: string,
  buildingClass: string
): Promise<AustralianStandard[]> {
  const standards = await getActiveStandards();
  
  // Filter standards based on project type and building class
  return standards.filter((std) => {
    // Residential projects (Class 1, 10)
    if (buildingClass.startsWith("1") || buildingClass === "10") {
      return std.standardCode.includes("Vol2") || std.category === "safety" || std.category === "general_construction";
    }
    // Commercial/industrial projects (Class 2-9)
    else {
      return std.standardCode.includes("Vol1") || std.category === "safety" || std.category === "structural";
    }
  });
}

/**
 * Verify quote compliance against Australian Standards
 */
export async function verifyQuoteCompliance(
  quoteId: string,
  quoteData: {
    materials: any[];
    specifications: string;
    location: { state: string };
    buildingType: string;
  }
): Promise<ComplianceVerification[]> {
  const standards = await getActiveStandards();
  const verifications: ComplianceVerification[] = [];

  // Get relevant standards based on building type
  const relevantStandards = standards.filter((std) => {
    if (quoteData.buildingType === "residential") {
      return std.standardCode.includes("Vol2") || std.category === "safety";
    } else if (quoteData.buildingType === "commercial") {
      return std.standardCode.includes("Vol1") || std.category === "safety";
    }
    return true; // Check all standards for unspecified types
  });

  // Verify each standard using AI
  for (const standard of relevantStandards) {
    const verification = await verifyAgainstStandard(
      quoteId,
      standard,
      quoteData
    );
    verifications.push(verification);

    // Save to database
    await saveComplianceVerification(verification);
  }

  return verifications;
}

/**
 * Verify quote against a specific standard using AI
 */
async function verifyAgainstStandard(
  quoteId: string,
  standard: AustralianStandard,
  quoteData: any
): Promise<ComplianceVerification> {
  const prompt = `You are an Australian construction compliance expert. Verify if the following quote complies with ${standard.standardCode} - ${standard.title}.

Standard Requirements:
${JSON.stringify(standard.requirements, null, 2)}

Quote Data:
- Materials: ${JSON.stringify(quoteData.materials)}
- Specifications: ${quoteData.specifications}
- Location: ${quoteData.location.state}
- Building Type: ${quoteData.buildingType}

${standard.stateVariations && quoteData.location.state ? `
State-Specific Requirements (${quoteData.location.state}):
${JSON.stringify(standard.stateVariations[quoteData.location.state], null, 2)}
` : ""}

Analyze the quote and provide:
1. Compliance status (compliant/non_compliant/requires_review/not_applicable)
2. Confidence score (0-100)
3. Specific findings (what was checked)
4. Recommendations (if non-compliant or requires review)

Respond in JSON format:
{
  "status": "compliant|non_compliant|requires_review|not_applicable",
  "confidence": 85,
  "findings": ["finding 1", "finding 2"],
  "recommendations": ["recommendation 1", "recommendation 2"]
}`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are an Australian construction compliance expert. Always respond with valid JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "compliance_verification",
          strict: true,
          schema: {
            type: "object",
            properties: {
              status: {
                type: "string",
                enum: ["compliant", "non_compliant", "requires_review", "not_applicable"],
              },
              confidence: { type: "number" },
              findings: { type: "array", items: { type: "string" } },
              recommendations: { type: "array", items: { type: "string" } },
            },
            required: ["status", "confidence", "findings", "recommendations"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    const result = JSON.parse(typeof content === 'string' ? content : JSON.stringify(content));

    return {
      quoteId,
      standardId: standard.id,
      status: result.status,
      confidenceScore: result.confidence,
      findings: result.findings,
      recommendations: result.recommendations,
      verifiedAt: Date.now(),
      verifiedBy: "AI",
    };
  } catch (error) {
    console.error(`Failed to verify against ${standard.standardCode}:`, error);
    return {
      quoteId,
      standardId: standard.id,
      status: "requires_review",
      confidenceScore: 0,
      findings: ["Verification failed - manual review required"],
      recommendations: ["Contact compliance specialist"],
      verifiedAt: Date.now(),
      verifiedBy: "AI",
    };
  }
}

/**
 * Save compliance verification to database
 */
async function saveComplianceVerification(
  verification: ComplianceVerification
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.execute(sql`
    INSERT INTO compliance_verifications (
      quote_id, standard_id, status, confidence_score,
      findings, recommendations, verified_by
    ) VALUES (
      ${verification.quoteId},
      ${verification.standardId},
      ${verification.status},
      ${verification.confidenceScore},
      ${JSON.stringify(verification.findings)},
      ${JSON.stringify(verification.recommendations)},
      ${verification.verifiedBy}
    )
  `);
}

/**
 * Get compliance verifications for a quote
 */
export async function getQuoteCompliance(
  quoteId: string
): Promise<ComplianceVerification[]> {
  const db = await getDb();
  if (!db) return [];

  const result: any = await db.execute(sql`
    SELECT cv.*, aus.standard_code, aus.title, aus.category
    FROM compliance_verifications cv
    JOIN australian_standards aus ON cv.standard_id = aus.id
    WHERE cv.quote_id = ${quoteId}
    ORDER BY cv.verified_at DESC
  `);

  const rows = Array.isArray(result) ? result : result.rows || [];

  return rows.map((row: any) => ({
    quoteId: row.quote_id,
    standardId: row.standard_id,
    status: row.status,
    confidenceScore: parseFloat(row.confidence_score),
    findings: JSON.parse(row.findings || "[]"),
    recommendations: JSON.parse(row.recommendations || "[]"),
    verifiedAt: new Date(row.verified_at).getTime(),
    verifiedBy: row.verified_by,
  }));
}

/**
 * Get compliance summary statistics
 */
export async function getComplianceSummary(quoteId: string): Promise<{
  totalStandards: number;
  compliant: number;
  nonCompliant: number;
  requiresReview: number;
  notApplicable: number;
  averageConfidence: number;
}> {
  const verifications = await getQuoteCompliance(quoteId);

  return {
    totalStandards: verifications.length,
    compliant: verifications.filter((v) => v.status === "compliant").length,
    nonCompliant: verifications.filter((v) => v.status === "non_compliant").length,
    requiresReview: verifications.filter((v) => v.status === "requires_review").length,
    notApplicable: verifications.filter((v) => v.status === "not_applicable").length,
    averageConfidence:
      verifications.reduce((sum, v) => sum + v.confidenceScore, 0) /
        verifications.length || 0,
  };
}
