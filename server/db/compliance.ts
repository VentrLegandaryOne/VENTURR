/**
 * Compliance Framework for Metal Roofing
 * Implements Australian Building Standards and Codes
 */

import { drizzle } from "drizzle-orm/mysql2";
import { eq, and } from "drizzle-orm";

export interface ComplianceStandard {
  id: string;
  code: string;
  title: string;
  description: string;
  requirements: ComplianceRequirement[];
  applicableToProjectTypes: string[];
}

export interface ComplianceRequirement {
  id: string;
  standardCode: string;
  requirement: string;
  description: string;
  checkpoints: string[];
  documentation: string[];
  penalties?: string;
}

export interface ProjectCompliance {
  projectId: string;
  standardCode: string;
  status: "compliant" | "non_compliant" | "pending_review" | "exempt";
  checkedDate: Date;
  notes: string;
  documentationUrl?: string;
}

/**
 * Australian Compliance Standards for Metal Roofing
 */
export const COMPLIANCE_STANDARDS: ComplianceStandard[] = [
  {
    id: "as1562.1",
    code: "AS 1562.1:2018",
    title: "Roofing Code of Practice - Metal Roofing",
    description:
      "Australian Standard for design, installation and maintenance of metal roofing",
    applicableToProjectTypes: ["residential", "commercial", "industrial"],
    requirements: [
      {
        id: "as1562.1-001",
        standardCode: "AS 1562.1:2018",
        requirement: "Roof Pitch Requirements",
        description:
          "Minimum roof pitch of 5 degrees (1:11.5 slope) for standing seam profiles, 3 degrees for flat lock profiles",
        checkpoints: [
          "Measure roof pitch with inclinometer",
          "Document pitch on site plans",
          "Verify compliance before installation",
        ],
        documentation: [
          "Pitch measurement report",
          "Site photographs",
          "Design drawings",
        ],
      },
      {
        id: "as1562.1-002",
        standardCode: "AS 1562.1:2018",
        requirement: "Fastening Requirements",
        description:
          "Fasteners must be stainless steel or hot-dip galvanized, spaced at maximum 600mm centers",
        checkpoints: [
          "Verify fastener material",
          "Measure fastener spacing",
          "Check fastener torque specifications",
        ],
        documentation: [
          "Fastener specification sheet",
          "Installation photographs",
          "Torque verification report",
        ],
      },
      {
        id: "as1562.1-003",
        standardCode: "AS 1562.1:2018",
        requirement: "Underlayment Installation",
        description:
          "Underlayment must be installed with minimum 150mm overlap and properly sealed",
        checkpoints: [
          "Verify underlayment type",
          "Measure overlap dimensions",
          "Check seal integrity",
        ],
        documentation: [
          "Underlayment specification",
          "Installation photographs",
          "Overlap measurement report",
        ],
      },
      {
        id: "as1562.1-004",
        standardCode: "AS 1562.1:2018",
        requirement: "Flashing and Penetration Sealing",
        description:
          "All roof penetrations must be properly flashed and sealed to prevent water ingress",
        checkpoints: [
          "Identify all penetrations",
          "Verify flashing installation",
          "Check sealant application",
        ],
        documentation: [
          "Penetration schedule",
          "Flashing specification",
          "Installation photographs",
        ],
      },
    ],
  },
  {
    id: "asnzs1170.2",
    code: "AS/NZS 1170.2:2021",
    title: "Structural Design Actions - Wind Actions",
    description: "Wind load calculations and structural requirements for roofing",
    applicableToProjectTypes: ["residential", "commercial", "industrial"],
    requirements: [
      {
        id: "asnzs1170.2-001",
        standardCode: "AS/NZS 1170.2:2021",
        requirement: "Wind Speed Classification",
        description:
          "Determine wind speed region based on location (N1-N3, C1-C4, W1-W4)",
        checkpoints: [
          "Identify project location",
          "Determine wind region",
          "Calculate design wind speed",
        ],
        documentation: [
          "Wind speed map",
          "Location coordinates",
          "Wind speed calculation report",
        ],
      },
      {
        id: "asnzs1170.2-002",
        standardCode: "AS/NZS 1170.2:2021",
        requirement: "Terrain Category Assessment",
        description:
          "Classify terrain as TC1, TC2, TC3, or TC4 based on surrounding environment",
        checkpoints: [
          "Assess surrounding terrain",
          "Classify terrain category",
          "Apply terrain factor to calculations",
        ],
        documentation: [
          "Terrain assessment report",
          "Aerial photographs",
          "Terrain factor calculation",
        ],
      },
      {
        id: "asnzs1170.2-003",
        standardCode: "AS/NZS 1170.2:2021",
        requirement: "Fastener Strength Verification",
        description:
          "Fasteners must be sized to resist calculated wind uplift forces",
        checkpoints: [
          "Calculate wind uplift forces",
          "Verify fastener strength",
          "Check fastener spacing",
        ],
        documentation: [
          "Wind load calculation",
          "Fastener strength report",
          "Spacing verification",
        ],
      },
    ],
  },
  {
    id: "as3959",
    code: "AS 3959:2018",
    title: "Construction of Buildings in Bushfire-Prone Areas",
    description: "Requirements for roofing in bushfire-prone regions",
    applicableToProjectTypes: ["residential", "commercial"],
    requirements: [
      {
        id: "as3959-001",
        standardCode: "AS 3959:2018",
        requirement: "Bushfire Attack Level (BAL) Assessment",
        description:
          "Determine BAL rating (BAL-LOW, BAL-12.5, BAL-19, BAL-29, BAL-40, BAL-FZ)",
        checkpoints: [
          "Identify property location",
          "Determine BAL rating",
          "Apply BAL-specific requirements",
        ],
        documentation: [
          "BAL assessment report",
          "Location coordinates",
          "BAL determination letter",
        ],
      },
      {
        id: "as3959-002",
        standardCode: "AS 3959:2018",
        requirement: "Roof Material Specifications",
        description:
          "Metal roofing is acceptable for all BAL levels with proper installation",
        checkpoints: [
          "Verify metal roofing material",
          "Check material specifications",
          "Ensure proper installation",
        ],
        documentation: [
          "Material specification sheet",
          "Product certification",
          "Installation photographs",
        ],
      },
      {
        id: "as3959-003",
        standardCode: "AS 3959:2018",
        requirement: "Ember Protection",
        description:
          "Roof must be designed to prevent ember entry and protect structural elements",
        checkpoints: [
          "Verify roof-to-wall junction",
          "Check gutter design",
          "Inspect penetration sealing",
        ],
        documentation: [
          "Junction detail drawings",
          "Gutter specification",
          "Installation photographs",
        ],
      },
    ],
  },
  {
    id: "ncc2022",
    code: "NCC 2022",
    title: "National Construction Code 2022",
    description: "Australian National Building Code requirements for roofing",
    applicableToProjectTypes: ["residential", "commercial", "industrial"],
    requirements: [
      {
        id: "ncc2022-001",
        standardCode: "NCC 2022",
        requirement: "Performance Requirements",
        description:
          "Roof must provide adequate strength, stability, and durability",
        checkpoints: [
          "Verify structural design",
          "Check material durability",
          "Assess maintenance requirements",
        ],
        documentation: [
          "Structural design report",
          "Material durability assessment",
          "Maintenance schedule",
        ],
      },
      {
        id: "ncc2022-002",
        standardCode: "NCC 2022",
        requirement: "Fire Resistance",
        description:
          "Roof must meet fire resistance requirements based on building classification",
        checkpoints: [
          "Determine building classification",
          "Verify fire resistance rating",
          "Check material certifications",
        ],
        documentation: [
          "Building classification",
          "Fire resistance certificate",
          "Material test reports",
        ],
      },
      {
        id: "ncc2022-003",
        standardCode: "NCC 2022",
        requirement: "Water Tightness",
        description:
          "Roof must prevent water ingress and provide adequate drainage",
        checkpoints: [
          "Verify slope and drainage",
          "Check flashing and sealing",
          "Inspect gutters and downpipes",
        ],
        documentation: [
          "Drainage design",
          "Flashing specification",
          "Installation photographs",
        ],
      },
    ],
  },
];

/**
 * Get compliance standards for a project type
 */
export function getApplicableStandards(
  projectType: string
): ComplianceStandard[] {
  return COMPLIANCE_STANDARDS.filter((standard) =>
    standard.applicableToProjectTypes.includes(projectType)
  );
}

/**
 * Generate compliance checklist for a project
 */
export function generateComplianceChecklist(
  projectType: string
): Array<{
  standard: ComplianceStandard;
  requirements: ComplianceRequirement[];
}> {
  const standards = getApplicableStandards(projectType);

  return standards.map((standard) => ({
    standard,
    requirements: standard.requirements,
  }));
}

/**
 * Validate project against compliance standards
 */
export function validateProjectCompliance(
  projectData: any,
  standards: ComplianceStandard[]
): {
  compliant: boolean;
  issues: Array<{
    standard: string;
    requirement: string;
    status: string;
  }>;
} {
  const issues: Array<{
    standard: string;
    requirement: string;
    status: string;
  }> = [];

  // Check roof pitch
  if (projectData.roofPitch < 5) {
    issues.push({
      standard: "AS 1562.1:2018",
      requirement: "Roof Pitch Requirements",
      status: "non_compliant",
    });
  }

  // Check fastener specifications
  if (!projectData.fastenerMaterial?.includes("stainless")) {
    issues.push({
      standard: "AS 1562.1:2018",
      requirement: "Fastening Requirements",
      status: "non_compliant",
    });
  }

  // Check underlayment
  if (!projectData.underlaymentSpecified) {
    issues.push({
      standard: "AS 1562.1:2018",
      requirement: "Underlayment Installation",
      status: "non_compliant",
    });
  }

  return {
    compliant: issues.length === 0,
    issues,
  };
}

/**
 * Generate compliance documentation
 */
export function generateComplianceDocument(
  projectData: any,
  standards: ComplianceStandard[]
): string {
  let document = `# COMPLIANCE DOCUMENTATION REPORT\n\n`;
  document += `Project: ${projectData.projectName}\n`;
  document += `Date: ${new Date().toISOString().split("T")[0]}\n\n`;

  document += `## Applicable Standards\n\n`;
  standards.forEach((standard) => {
    document += `### ${standard.code} - ${standard.title}\n`;
    document += `${standard.description}\n\n`;

    standard.requirements.forEach((req) => {
      document += `#### ${req.requirement}\n`;
      document += `${req.description}\n\n`;
      document += `**Checkpoints:**\n`;
      req.checkpoints.forEach((checkpoint) => {
        document += `- [ ] ${checkpoint}\n`;
      });
      document += `\n`;
    });
  });

  return document;
}

