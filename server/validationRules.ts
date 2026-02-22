/**
 * Optimized Validation Rules for VENTURR VALIDT
 * Based on analysis of real Thomco Roofing quotes
 * 
 * Key optimizations:
 * 1. Per-unit rate validation for common items
 * 2. Mandatory NCC 2022 compliance checking
 * 3. Enhanced warranty benchmarking
 * 4. Material specification completeness scoring
 * 5. Quote transparency/itemization scoring
 */

// Sydney Metro 2024 Market Rates (derived from Thomco analysis)
export const MARKET_RATES_2024 = {
  guttering: {
    min: 55,    // $/linear metre
    max: 160,   // $/linear metre
    typical: 100,
    unit: "lm",
    description: "Colorbond guttering supply and install"
  },
  reroofing: {
    min: 80,    // $/m²
    max: 150,   // $/m²
    typical: 115,
    unit: "m²",
    description: "Full re-roofing with Colorbond"
  },
  rescrewing: {
    min: 15,    // $/m²
    max: 25,    // $/m²
    typical: 20,
    unit: "m²",
    description: "Roof re-screwing service"
  },
  flashingReplacement: {
    min: 45,    // $/linear metre
    max: 95,    // $/linear metre
    typical: 70,
    unit: "lm",
    description: "Flashing replacement"
  },
  downpipes: {
    min: 80,    // per downpipe
    max: 200,   // per downpipe
    typical: 140,
    unit: "each",
    description: "90mm PVC downpipe supply and install"
  },
  ridgeCapping: {
    min: 35,    // $/linear metre
    max: 75,    // $/linear metre
    typical: 55,
    unit: "lm",
    description: "Ridge capping supply and install"
  },
  valleyCover: {
    min: 60,    // $/linear metre
    max: 120,   // $/linear metre
    typical: 90,
    unit: "lm",
    description: "Valley cover replacement"
  },
  scaffolding: {
    min: 500,   // per job
    max: 2500,  // per job
    typical: 1200,
    unit: "job",
    description: "Scaffolding/access equipment"
  },
  laborRate: {
    min: 65,    // $/hour
    max: 95,    // $/hour
    typical: 80,
    unit: "hour",
    description: "Licensed roof plumber labor"
  }
};

// Pricing variance thresholds
export const PRICING_THRESHOLDS = {
  acceptable: 15,      // Up to 15% above market is acceptable
  review: 20,          // 15-20% triggers review flag
  critical: 50,        // >50% is critically overpriced
  suspicious: -30      // >30% below market is suspiciously low
};

// Compliance standards requirements
export const COMPLIANCE_REQUIREMENTS = {
  mandatory: [
    {
      id: "ncc-2022",
      name: "National Construction Code 2022",
      shortName: "NCC 2022",
      description: "Primary building regulation in Australia",
      applicability: "all",
      weight: 30
    },
    {
      id: "hb-39-2015",
      name: "HB 39:2015 Installation Code for Metal Roof and Wall Cladding",
      shortName: "HB 39:2015",
      description: "Metal roofing installation standards",
      applicability: "metal-roofing",
      weight: 25
    },
    {
      id: "safework-nsw",
      name: "SafeWork NSW Fall Prevention Requirements",
      shortName: "SafeWork NSW",
      description: "Work health and safety for heights",
      applicability: "all",
      weight: 20
    }
  ],
  recommended: [
    {
      id: "as-1397-2021",
      name: "AS 1397:2021 Continuous hot-dip metallic coated steel sheet and strip",
      shortName: "AS 1397",
      description: "Steel sheet standards",
      applicability: "metal-roofing",
      weight: 15
    },
    {
      id: "as-nzs-1562-1",
      name: "AS/NZS 1562.1 Design and installation of sheet roof and wall cladding",
      shortName: "AS/NZS 1562.1",
      description: "Sheet cladding design standards",
      applicability: "metal-roofing",
      weight: 10
    },
    {
      id: "as-nzs-3500-3",
      name: "AS/NZS 3500.3 Plumbing and drainage - Stormwater drainage",
      shortName: "AS/NZS 3500.3",
      description: "Stormwater drainage requirements",
      applicability: "guttering",
      weight: 10
    }
  ]
};

// Warranty benchmarks (derived from Thomco analysis)
export const WARRANTY_BENCHMARKS = {
  workmanship: {
    belowStandard: 5,    // <5 years is below standard
    minimum: 7,          // 7 years minimum acceptable
    standard: 10,        // 10 years is industry standard
    premium: 15          // 15+ years is premium
  },
  materials: {
    belowStandard: 10,   // <10 years is below standard
    minimum: 15,         // 15 years minimum for metal roofing
    standard: 20,        // 20 years is standard
    premium: 25          // 25+ years is premium (Colorbond Ultra)
  }
};

// Material specification requirements
export const MATERIAL_REQUIREMENTS = {
  colorbond: {
    requiredSpecs: ["profile", "color", "bmt"],
    optionalSpecs: ["grade", "coating"],
    standardBMT: {
      roofing: 0.42,     // Minimum for roofing
      guttering: 0.55,   // Standard for guttering
      premium: 0.60      // Premium thickness
    }
  },
  fixings: {
    requiredSpecs: ["material", "class"],
    optionalSpecs: ["size", "quantity"],
    minimumClass: 4      // Class 4 stainless steel minimum
  },
  sealants: {
    requiredSpecs: ["type"],
    optionalSpecs: ["uvRating", "warranty"]
  }
};

// Quote structure scoring
export const QUOTE_STRUCTURE_SCORING = {
  lineItems: {
    single: 0,           // Lump sum = 0 points
    minimal: 5,          // 2-3 items = 5 points
    detailed: 10,        // 4-7 items = 10 points
    comprehensive: 15    // 8+ items = 15 points
  },
  breakdown: {
    none: 0,             // No breakdown
    partial: 5,          // Some items broken down
    full: 10             // Full labor/materials breakdown
  },
  specifications: {
    vague: 0,            // Generic descriptions
    basic: 5,            // Some specifications
    detailed: 10         // Full specifications
  }
};

// Validation functions

/**
 * Calculate pricing score based on market rate comparison
 */
export function calculatePricingScore(
  quotedAmount: number,
  quantity: number,
  unit: string,
  itemType: keyof typeof MARKET_RATES_2024
): {
  score: number;
  variance: number;
  status: "acceptable" | "review" | "critical" | "suspicious" | "unknown";
  message: string;
} {
  const rates = MARKET_RATES_2024[itemType];
  if (!rates || !quantity || quantity <= 0) {
    return {
      score: 50,
      variance: 0,
      status: "unknown",
      message: "Unable to calculate - missing quantity or unknown item type"
    };
  }

  const perUnitRate = quotedAmount / quantity;
  const variance = ((perUnitRate - rates.typical) / rates.typical) * 100;

  let score: number;
  let status: "acceptable" | "review" | "critical" | "suspicious" | "unknown";
  let message: string;

  if (variance < PRICING_THRESHOLDS.suspicious) {
    score = 40;
    status = "suspicious";
    message = `Rate of $${perUnitRate.toFixed(2)}/${unit} is ${Math.abs(variance).toFixed(1)}% below market - may indicate quality concerns`;
  } else if (variance <= PRICING_THRESHOLDS.acceptable) {
    score = 90 - Math.abs(variance);
    status = "acceptable";
    message = `Rate of $${perUnitRate.toFixed(2)}/${unit} is within acceptable market range ($${rates.min}-$${rates.max}/${unit})`;
  } else if (variance <= PRICING_THRESHOLDS.review) {
    score = 70 - (variance - PRICING_THRESHOLDS.acceptable);
    status = "review";
    message = `Rate of $${perUnitRate.toFixed(2)}/${unit} is ${variance.toFixed(1)}% above typical market rate - review recommended`;
  } else if (variance <= PRICING_THRESHOLDS.critical) {
    score = 50 - (variance - PRICING_THRESHOLDS.review) / 2;
    status = "critical";
    message = `Rate of $${perUnitRate.toFixed(2)}/${unit} is ${variance.toFixed(1)}% above market - significantly overpriced`;
  } else {
    score = 20;
    status = "critical";
    message = `Rate of $${perUnitRate.toFixed(2)}/${unit} is ${variance.toFixed(1)}% above market - extremely overpriced`;
  }

  return { score: Math.max(0, Math.min(100, score)), variance, status, message };
}

/**
 * Calculate compliance score based on standards referenced
 */
export function calculateComplianceScore(
  referencedStandards: string[],
  projectType: "metal-roofing" | "guttering" | "repairs" | "general"
): {
  score: number;
  missingMandatory: string[];
  missingRecommended: string[];
  message: string;
} {
  const normalizedRefs = referencedStandards.map(s => s.toLowerCase());
  
  const missingMandatory: string[] = [];
  const missingRecommended: string[] = [];
  let mandatoryScore = 0;
  let recommendedScore = 0;

  // Check mandatory standards
  for (const standard of COMPLIANCE_REQUIREMENTS.mandatory) {
    if (standard.applicability === "all" || standard.applicability === projectType) {
      const found = normalizedRefs.some(ref => 
        ref.includes(standard.shortName.toLowerCase()) ||
        ref.includes(standard.id.replace(/-/g, " "))
      );
      if (found) {
        mandatoryScore += standard.weight;
      } else {
        missingMandatory.push(standard.shortName);
      }
    }
  }

  // Check recommended standards
  for (const standard of COMPLIANCE_REQUIREMENTS.recommended) {
    if (standard.applicability === "all" || standard.applicability === projectType) {
      const found = normalizedRefs.some(ref => 
        ref.includes(standard.shortName.toLowerCase()) ||
        ref.includes(standard.id.replace(/-/g, " "))
      );
      if (found) {
        recommendedScore += standard.weight;
      } else {
        missingRecommended.push(standard.shortName);
      }
    }
  }

  const totalScore = mandatoryScore + recommendedScore;
  
  let message: string;
  if (missingMandatory.length === 0) {
    message = "All mandatory compliance standards referenced";
  } else if (missingMandatory.length === 1) {
    message = `Missing mandatory reference: ${missingMandatory[0]}`;
  } else {
    message = `Missing ${missingMandatory.length} mandatory references: ${missingMandatory.join(", ")}`;
  }

  return {
    score: Math.min(100, totalScore),
    missingMandatory,
    missingRecommended,
    message
  };
}

/**
 * Calculate warranty score based on industry benchmarks
 */
export function calculateWarrantyScore(
  workmanshipYears: number | null,
  materialsYears: number | null
): {
  score: number;
  workmanshipStatus: "premium" | "standard" | "minimum" | "below-standard" | "not-specified";
  materialsStatus: "premium" | "standard" | "minimum" | "below-standard" | "not-specified";
  message: string;
} {
  let workmanshipScore = 0;
  let materialsScore = 0;
  let workmanshipStatus: "premium" | "standard" | "minimum" | "below-standard" | "not-specified";
  let materialsStatus: "premium" | "standard" | "minimum" | "below-standard" | "not-specified";

  // Workmanship warranty scoring
  if (workmanshipYears === null) {
    workmanshipScore = 0;
    workmanshipStatus = "not-specified";
  } else if (workmanshipYears >= WARRANTY_BENCHMARKS.workmanship.premium) {
    workmanshipScore = 50;
    workmanshipStatus = "premium";
  } else if (workmanshipYears >= WARRANTY_BENCHMARKS.workmanship.standard) {
    workmanshipScore = 40;
    workmanshipStatus = "standard";
  } else if (workmanshipYears >= WARRANTY_BENCHMARKS.workmanship.minimum) {
    workmanshipScore = 25;
    workmanshipStatus = "minimum";
  } else {
    workmanshipScore = 10;
    workmanshipStatus = "below-standard";
  }

  // Materials warranty scoring
  if (materialsYears === null) {
    materialsScore = 0;
    materialsStatus = "not-specified";
  } else if (materialsYears >= WARRANTY_BENCHMARKS.materials.premium) {
    materialsScore = 50;
    materialsStatus = "premium";
  } else if (materialsYears >= WARRANTY_BENCHMARKS.materials.standard) {
    materialsScore = 40;
    materialsStatus = "standard";
  } else if (materialsYears >= WARRANTY_BENCHMARKS.materials.minimum) {
    materialsScore = 25;
    materialsStatus = "minimum";
  } else {
    materialsScore = 10;
    materialsStatus = "below-standard";
  }

  const totalScore = workmanshipScore + materialsScore;

  let message: string;
  if (workmanshipStatus === "not-specified" && materialsStatus === "not-specified") {
    message = "No warranty terms specified - request clarification";
  } else if (workmanshipStatus === "below-standard" || materialsStatus === "below-standard") {
    message = "Warranty terms below industry standard";
  } else if (workmanshipStatus === "premium" && materialsStatus === "premium") {
    message = "Excellent warranty coverage";
  } else {
    message = "Warranty terms meet industry standards";
  }

  return { score: totalScore, workmanshipStatus, materialsStatus, message };
}

/**
 * Calculate quote transparency/structure score
 */
export function calculateTransparencyScore(
  lineItemCount: number,
  hasLaborBreakdown: boolean,
  hasMaterialsBreakdown: boolean,
  hasDetailedSpecs: boolean
): {
  score: number;
  level: "comprehensive" | "detailed" | "basic" | "minimal" | "opaque";
  message: string;
} {
  let score = 0;

  // Line items scoring
  if (lineItemCount >= 8) {
    score += QUOTE_STRUCTURE_SCORING.lineItems.comprehensive;
  } else if (lineItemCount >= 4) {
    score += QUOTE_STRUCTURE_SCORING.lineItems.detailed;
  } else if (lineItemCount >= 2) {
    score += QUOTE_STRUCTURE_SCORING.lineItems.minimal;
  } else {
    score += QUOTE_STRUCTURE_SCORING.lineItems.single;
  }

  // Breakdown scoring
  if (hasLaborBreakdown && hasMaterialsBreakdown) {
    score += QUOTE_STRUCTURE_SCORING.breakdown.full;
  } else if (hasLaborBreakdown || hasMaterialsBreakdown) {
    score += QUOTE_STRUCTURE_SCORING.breakdown.partial;
  }

  // Specifications scoring
  if (hasDetailedSpecs) {
    score += QUOTE_STRUCTURE_SCORING.specifications.detailed;
  } else if (lineItemCount > 1) {
    score += QUOTE_STRUCTURE_SCORING.specifications.basic;
  }

  // Normalize to 0-100
  const maxScore = QUOTE_STRUCTURE_SCORING.lineItems.comprehensive +
                   QUOTE_STRUCTURE_SCORING.breakdown.full +
                   QUOTE_STRUCTURE_SCORING.specifications.detailed;
  const normalizedScore = (score / maxScore) * 100;

  let level: "comprehensive" | "detailed" | "basic" | "minimal" | "opaque";
  let message: string;

  if (normalizedScore >= 80) {
    level = "comprehensive";
    message = "Excellent quote transparency with detailed breakdown";
  } else if (normalizedScore >= 60) {
    level = "detailed";
    message = "Good quote structure with reasonable detail";
  } else if (normalizedScore >= 40) {
    level = "basic";
    message = "Basic quote structure - consider requesting more detail";
  } else if (normalizedScore >= 20) {
    level = "minimal";
    message = "Limited transparency - recommend requesting itemized breakdown";
  } else {
    level = "opaque";
    message = "Lump sum quote with no breakdown - request detailed itemization";
  }

  return { score: normalizedScore, level, message };
}

/**
 * Check material specifications completeness
 */
export function checkMaterialCompleteness(
  materials: Array<{
    name: string;
    specs: Record<string, string | number | undefined>;
  }>
): {
  score: number;
  missingSpecs: Array<{ material: string; missing: string[] }>;
  message: string;
} {
  const missingSpecs: Array<{ material: string; missing: string[] }> = [];
  let totalRequired = 0;
  let totalFound = 0;

  for (const material of materials) {
    const materialName = material.name.toLowerCase();
    let requirements: { requiredSpecs: string[]; optionalSpecs: string[] } | null = null;

    // Determine material type
    if (materialName.includes("colorbond") || materialName.includes("steel")) {
      requirements = MATERIAL_REQUIREMENTS.colorbond;
    } else if (materialName.includes("screw") || materialName.includes("fixing")) {
      requirements = MATERIAL_REQUIREMENTS.fixings;
    } else if (materialName.includes("silicone") || materialName.includes("sealant")) {
      requirements = MATERIAL_REQUIREMENTS.sealants;
    }

    if (requirements) {
      const missing: string[] = [];
      for (const spec of requirements.requiredSpecs) {
        totalRequired++;
        if (material.specs[spec]) {
          totalFound++;
        } else {
          missing.push(spec);
        }
      }
      if (missing.length > 0) {
        missingSpecs.push({ material: material.name, missing });
      }
    }
  }

  const score = totalRequired > 0 ? (totalFound / totalRequired) * 100 : 50;

  let message: string;
  if (missingSpecs.length === 0) {
    message = "All material specifications complete";
  } else if (missingSpecs.length === 1) {
    message = `Missing specifications for ${missingSpecs[0].material}: ${missingSpecs[0].missing.join(", ")}`;
  } else {
    message = `${missingSpecs.length} materials have incomplete specifications`;
  }

  return { score, missingSpecs, message };
}

/**
 * Detect project type from quote content
 */
export function detectProjectType(
  quoteText: string
): "metal-roofing" | "guttering" | "repairs" | "general" {
  const text = quoteText.toLowerCase();
  
  if (text.includes("re-roof") || text.includes("reroof") || text.includes("new roof")) {
    return "metal-roofing";
  }
  if (text.includes("gutter") || text.includes("downpipe") || text.includes("fascia")) {
    return "guttering";
  }
  if (text.includes("repair") || text.includes("fix") || text.includes("patch") || text.includes("re-screw")) {
    return "repairs";
  }
  return "general";
}

/**
 * Extract warranty years from text
 */
export function extractWarrantyYears(text: string): number | null {
  const patterns = [
    /(\d+)\s*year[s]?\s*(?:warranty|guarantee)/i,
    /(?:warranty|guarantee)\s*(?:of|:)?\s*(\d+)\s*year/i,
    /(\d+)\s*yr[s]?\s*(?:warranty|guarantee)/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return parseInt(match[1], 10);
    }
  }
  return null;
}

export default {
  MARKET_RATES_2024,
  PRICING_THRESHOLDS,
  COMPLIANCE_REQUIREMENTS,
  WARRANTY_BENCHMARKS,
  MATERIAL_REQUIREMENTS,
  QUOTE_STRUCTURE_SCORING,
  calculatePricingScore,
  calculateComplianceScore,
  calculateWarrantyScore,
  calculateTransparencyScore,
  checkMaterialCompleteness,
  detectProjectType,
  extractWarrantyYears
};
