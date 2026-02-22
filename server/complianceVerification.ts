import { getApplicableStandards, type AustralianStandard } from "./australianStandards";

export interface ComplianceVerificationOptions {
  projectType: string;
  state: string;
  buildingClass: string;
}

export interface ComplianceVerificationResult {
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
}

/**
 * Verify quote text against applicable Australian Standards
 */
export async function verifyQuoteCompliance(
  quoteText: string,
  options: ComplianceVerificationOptions
): Promise<ComplianceVerificationResult> {
  // Get applicable standards for this project
  const applicableStandards = await getApplicableStandards(
    options.projectType,
    options.state,
    options.buildingClass
  );

  if (applicableStandards.length === 0) {
    // No standards found - return not-applicable result
    return {
      overallCompliance: "partial",
      confidenceScore: 0,
      verifiedStandards: [],
      findings: [{
        category: "compliance",
        severity: "medium",
        message: "No applicable Australian Standards found for this project type",
        standardReference: "N/A",
      }],
    };
  }

  // Verify against each standard
  const verifiedStandards = applicableStandards.map((standard: AustralianStandard) => {
    const findings = checkStandardCompliance(quoteText, standard, options.state);
    
    // Determine compliance status based on findings
    let status: "compliant" | "non-compliant" | "not-applicable";
    if (findings.length === 0) {
      status = "not-applicable"; // No evidence found either way
    } else if (findings.some(f => f.includes("missing") || f.includes("non-compliant"))) {
      status = "non-compliant";
    } else {
      status = "compliant";
    }

    return {
      standardId: standard.standardCode, // Use standardCode from interface
      title: standard.title,
      status,
      findings,
    };
  });

  // Generate compliance findings with severity
  const findings = verifiedStandards
    .filter((vs: any) => vs.status === "non-compliant")
    .flatMap((vs: any) => 
      vs.findings.map((finding: string) => ({
        category: "compliance",
        severity: determineSeverity(finding, vs.standardId),
        message: finding,
        standardReference: `${vs.standardId}: ${vs.title}`,
      }))
    );

  // Calculate overall compliance
  const compliantCount = verifiedStandards.filter(vs => vs.status === "compliant").length;
  const nonCompliantCount = verifiedStandards.filter(vs => vs.status === "non-compliant").length;
  const totalApplicable = compliantCount + nonCompliantCount;

  let overallCompliance: "compliant" | "non-compliant" | "partial";
  if (totalApplicable === 0) {
    overallCompliance = "partial";
  } else if (nonCompliantCount === 0) {
    overallCompliance = "compliant";
  } else if (compliantCount === 0) {
    overallCompliance = "non-compliant";
  } else {
    overallCompliance = "partial";
  }

  // Calculate confidence score (0-100)
  const confidenceScore = totalApplicable > 0 
    ? Math.round((compliantCount / totalApplicable) * 100)
    : 0;

  return {
    overallCompliance,
    confidenceScore,
    verifiedStandards,
    findings,
  };
}

/**
 * Check quote text against a specific standard
 * Returns array of findings (empty if compliant or not applicable)
 * Includes state-specific variations when applicable
 */
function checkStandardCompliance(quoteText: string, standard: AustralianStandard, state?: string): string[] {
  const findings: string[] = [];
  const lowerText = quoteText.toLowerCase();

  // Apply state-specific variations if available
  let stateVariations: any = null;
  if (state && standard.stateVariations) {
    try {
      const variations = typeof standard.stateVariations === 'string' 
        ? JSON.parse(standard.stateVariations) 
        : standard.stateVariations;
      stateVariations = variations[state.toUpperCase()];
    } catch (e) {
      console.error(`Failed to parse state variations for ${standard.standardCode}:`, e);
    }
  }

  // Check for standard-specific requirements
  switch (standard.standardCode) {
    case "NCC_2022_VOL1":
    case "NCC_2022_VOL2":
      // Check for building class mentions
      if (!lowerText.includes("class") && !lowerText.includes("building type")) {
        findings.push("Building classification not specified (NCC requires classification)");
      }
      // Check for fire safety mentions for commercial buildings
      if (lowerText.includes("commercial") && !lowerText.includes("fire")) {
        findings.push("Fire safety requirements not addressed for commercial building");
      }
      break;

    case "HB_39_2015":
      // Check for material specifications
      if (!lowerText.includes("colorbond") && !lowerText.includes("zincalume") && !lowerText.includes("steel")) {
        findings.push("Metal roofing material specification missing (HB-39 requires material grade)");
      }
      // Check for installation method
      if (!lowerText.includes("screw") && !lowerText.includes("fastener") && !lowerText.includes("fixing")) {
        findings.push("Fastening/installation method not specified (HB-39 requires fixing details)");
      }
      break;

    case "AS_3600_2018":
      // Concrete structures
      if (lowerText.includes("concrete") && !lowerText.includes("mpa") && !lowerText.includes("strength")) {
        findings.push("Concrete strength grade not specified (AS 3600 requires strength class)");
      }
      break;

    case "AS_4100_2020":
      // Steel structures
      if (lowerText.includes("steel") && !lowerText.includes("grade") && !lowerText.includes("300")) {
        findings.push("Steel grade not specified (AS 4100 requires material grade)");
      }
      break;

    case "AS_1657_2018":
      // Fixed platforms, walkways, stairways and ladders
      if (lowerText.includes("ladder") || lowerText.includes("walkway") || lowerText.includes("platform")) {
        if (!lowerText.includes("handrail") && !lowerText.includes("guardrail")) {
          findings.push("Safety barriers not specified for elevated access (AS 1657 requires guardrails)");
        }
      }
      break;

    case "WHS_ACT_2011":
      // Work Health & Safety
      if (!lowerText.includes("safety") && !lowerText.includes("whs") && !lowerText.includes("safe work")) {
        findings.push("Work Health & Safety considerations not addressed (WHS Act 2011 requires safe work methods)");
      }
      // Check for fall protection mentions for roofing work
      if (lowerText.includes("roof") && !lowerText.includes("harness") && !lowerText.includes("fall protection")) {
        findings.push("Fall protection measures not specified for roofing work (WHS Act requires fall prevention)");
      }
      break;
  }

  // Add state-specific requirements if available
  if (stateVariations && stateVariations.additional_requirements) {
    for (const requirement of stateVariations.additional_requirements) {
      const reqLower = requirement.toLowerCase();
      
      // Check if the requirement is mentioned in the quote
      if (!lowerText.includes(reqLower.split(' ')[0])) {
        findings.push(`State-specific requirement not addressed: ${requirement} (${state?.toUpperCase()} variation)`);
      }
    }
  }

  // State-specific compliance checks
  if (state) {
    switch (state.toUpperCase()) {
      case "NSW":
        // NSW-specific: Stricter fire safety for high-rise
        if (lowerText.includes("storey") || lowerText.includes("floor")) {
          const storeyMatch = lowerText.match(/(\d+)\s*storey/);
          if (storeyMatch && parseInt(storeyMatch[1]) > 3) {
            if (!lowerText.includes("fire engineer") && !lowerText.includes("fire safety")) {
              findings.push("NSW requires fire engineering report for buildings over 3 storeys (NSW Fire Safety)");
            }
          }
        }
        break;

      case "VIC":
        // VIC-specific: Building permit requirements
        if (!lowerText.includes("permit") && !lowerText.includes("approval")) {
          findings.push("VIC Building Regulations require building permit reference in quote");
        }
        break;

      case "QLD":
        // QLD-specific: Cyclone rating for coastal areas
        if (lowerText.includes("roof") && (lowerText.includes("coastal") || lowerText.includes("cyclone"))) {
          if (!lowerText.includes("wind rating") && !lowerText.includes("cyclone rated")) {
            findings.push("QLD Development Code requires cyclone rating for coastal roofing");
          }
        }
        break;

      case "SA":
        // SA-specific: Energy efficiency requirements
        if (!lowerText.includes("energy") && !lowerText.includes("insulation")) {
          findings.push("SA Building Rules require energy efficiency compliance statement");
        }
        break;

      case "WA":
        // WA-specific: Bushfire Attack Level (BAL) requirements
        if (lowerText.includes("bushfire") || lowerText.includes("bal")) {
          if (!lowerText.includes("bal rating") && !lowerText.includes("bushfire attack level")) {
            findings.push("WA Building Code requires Bushfire Attack Level (BAL) rating in bushfire-prone areas");
          }
        }
        break;

      case "TAS":
        // TAS-specific: Thermal performance
        if (!lowerText.includes("thermal") && !lowerText.includes("r-value")) {
          findings.push("TAS Building Regulations require thermal performance specifications");
        }
        break;

      case "NT":
        // NT-specific: Termite protection
        if (!lowerText.includes("termite") && !lowerText.includes("pest")) {
          findings.push("NT Building Act requires termite protection measures");
        }
        break;

      case "ACT":
        // ACT-specific: Sustainability requirements
        if (!lowerText.includes("sustainable") && !lowerText.includes("environmental")) {
          findings.push("ACT Building Code requires sustainability compliance statement");
        }
        break;
    }
  }

  return findings;
}

/**
 * Determine severity of a compliance finding
 */
function determineSeverity(finding: string, standardId: string): "high" | "medium" | "low" {
  const lowerFinding = finding.toLowerCase();

  // High severity: Safety-critical issues
  if (
    lowerFinding.includes("safety") ||
    lowerFinding.includes("fall protection") ||
    lowerFinding.includes("fire") ||
    lowerFinding.includes("structural") ||
    standardId === "WHS_ACT_2011"
  ) {
    return "high";
  }

  // Medium severity: Material/specification issues
  if (
    lowerFinding.includes("material") ||
    lowerFinding.includes("specification") ||
    lowerFinding.includes("grade") ||
    lowerFinding.includes("strength")
  ) {
    return "medium";
  }

  // Low severity: Documentation/administrative issues
  return "low";
}
