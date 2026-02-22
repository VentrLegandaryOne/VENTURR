/**
 * VENTURR VALDT - Australian Construction Standards Knowledge Base
 * 
 * This module contains authoritative reference data from Australian building standards
 * used for quote verification and compliance checking.
 * 
 * Sources:
 * - HB-39:2015 Installation Code for Metal Roof and Wall Cladding
 * - NCC 2022 (National Construction Code)
 * - AS/NZS 1170.2 Wind Actions
 * - AS 4055 Wind Loads for Housing
 * - AS/NZS 4680 Hot-dip galvanized coatings
 * - AS 1397 Steel sheet and strip - Hot-dip zinc-coated or aluminium/zinc-coated
 */

// ============================================================================
// HB-39:2015 - METAL ROOF AND WALL CLADDING INSTALLATION CODE
// ============================================================================

export interface HB39Requirement {
  id: string;
  section: string;
  title: string;
  requirement: string;
  checklistItems: string[];
  penaltyForNonCompliance: "critical" | "major" | "minor";
}

export const HB39_REQUIREMENTS: HB39Requirement[] = [
  {
    id: "HB39-3.1",
    section: "3.1",
    title: "Material Selection",
    requirement: "Roofing materials must be selected based on environmental exposure category and building importance level",
    checklistItems: [
      "Material grade specified (e.g., G550, G300)",
      "Base Metal Thickness (BMT) stated",
      "Coating class appropriate for exposure (e.g., AZ150, AZ200)",
      "Manufacturer warranty period stated"
    ],
    penaltyForNonCompliance: "critical"
  },
  {
    id: "HB39-3.2",
    section: "3.2",
    title: "Fastener Specification",
    requirement: "Fasteners must be compatible with roofing material and appropriate for wind region",
    checklistItems: [
      "Fastener type specified (Type 17, hex head, etc.)",
      "Fastener material (Class 3 or Class 4 for coastal)",
      "Fastener spacing documented",
      "Seal washer type specified"
    ],
    penaltyForNonCompliance: "critical"
  },
  {
    id: "HB39-4.1",
    section: "4.1",
    title: "Roof Pitch Requirements",
    requirement: "Minimum roof pitch must comply with manufacturer specifications and HB-39 guidelines",
    checklistItems: [
      "Roof pitch stated in degrees or ratio",
      "Pitch appropriate for selected profile",
      "End lap requirements for low pitch addressed"
    ],
    penaltyForNonCompliance: "major"
  },
  {
    id: "HB39-5.1",
    section: "5.1",
    title: "Flashing Requirements",
    requirement: "All penetrations, junctions, and edges must have appropriate flashing",
    checklistItems: [
      "Ridge capping specified",
      "Valley flashing material and gauge stated",
      "Barge/gable flashing included",
      "Penetration flashings for vents, pipes listed"
    ],
    penaltyForNonCompliance: "critical"
  },
  {
    id: "HB39-6.1",
    section: "6.1",
    title: "Sarking and Insulation",
    requirement: "Sarking must be installed in accordance with NCC requirements for condensation control",
    checklistItems: [
      "Sarking type specified (reflective, non-reflective)",
      "Sarking R-value stated if applicable",
      "Installation method documented",
      "Vapour permeability class stated"
    ],
    penaltyForNonCompliance: "major"
  },
  {
    id: "HB39-7.1",
    section: "7.1",
    title: "Guttering and Drainage",
    requirement: "Gutter sizing must be adequate for roof catchment area and rainfall intensity",
    checklistItems: [
      "Gutter profile and size specified",
      "Gutter material and finish stated",
      "Downpipe size and quantity adequate",
      "Overflow provisions addressed"
    ],
    penaltyForNonCompliance: "major"
  },
  {
    id: "HB39-8.1",
    section: "8.1",
    title: "Ventilation Requirements",
    requirement: "Roof space ventilation must comply with NCC condensation management requirements",
    checklistItems: [
      "Ventilation type specified (whirlybirds, ridge vents)",
      "Ventilation area calculation provided",
      "Eave ventilation included if required"
    ],
    penaltyForNonCompliance: "minor"
  }
];

// ============================================================================
// NCC 2022 - NATIONAL CONSTRUCTION CODE REQUIREMENTS
// ============================================================================

export interface NCCRequirement {
  id: string;
  volume: number;
  part: string;
  section: string;
  title: string;
  requirement: string;
  applicability: string[];
  verificationMethod: string;
}

export const NCC_2022_REQUIREMENTS: NCCRequirement[] = [
  {
    id: "NCC-H2D2",
    volume: 2,
    part: "H2",
    section: "D2",
    title: "Weatherproofing - Roof and Wall Cladding",
    requirement: "A roof and external wall must prevent the penetration of water that could cause unhealthy or dangerous conditions, or loss of amenity",
    applicability: ["residential", "commercial"],
    verificationMethod: "Compliance with AS 4654.1 and AS 4654.2"
  },
  {
    id: "NCC-H2D3",
    volume: 2,
    part: "H2",
    section: "D3",
    title: "Roof Drainage",
    requirement: "A roof must have a drainage system that collects rainwater and disposes of it to an appropriate outfall",
    applicability: ["residential", "commercial"],
    verificationMethod: "Compliance with AS/NZS 3500.3"
  },
  {
    id: "NCC-H6P1",
    volume: 2,
    part: "H6",
    section: "P1",
    title: "Energy Efficiency",
    requirement: "A building must achieve an energy rating that reduces greenhouse gas emissions",
    applicability: ["residential"],
    verificationMethod: "NatHERS rating or DTS provisions"
  },
  {
    id: "NCC-B1P1",
    volume: 1,
    part: "B1",
    section: "P1",
    title: "Structural Reliability",
    requirement: "A building must be designed and constructed to sustain actions to which it may reasonably be subjected",
    applicability: ["all"],
    verificationMethod: "Compliance with AS/NZS 1170 series"
  },
  {
    id: "NCC-F7P1",
    volume: 2,
    part: "F7",
    section: "P1",
    title: "Condensation Management",
    requirement: "A roof and external wall must be designed to minimise the risk of condensation causing unhealthy conditions",
    applicability: ["residential", "commercial"],
    verificationMethod: "Compliance with condensation management provisions"
  }
];

// ============================================================================
// AS/NZS STANDARDS REFERENCE DATA
// ============================================================================

export interface AustralianStandard {
  id: string;
  title: string;
  currentVersion: string;
  relevance: string;
  keyRequirements: string[];
}

export const AUSTRALIAN_STANDARDS: AustralianStandard[] = [
  {
    id: "AS/NZS 1170.2",
    title: "Structural design actions - Wind actions",
    currentVersion: "2021",
    relevance: "Determines wind loads for roof design and fastener spacing",
    keyRequirements: [
      "Wind region classification (A to D)",
      "Terrain category assessment",
      "Building importance level",
      "Ultimate and serviceability wind speeds"
    ]
  },
  {
    id: "AS 4055",
    title: "Wind loads for housing",
    currentVersion: "2021",
    relevance: "Simplified wind load determination for residential buildings",
    keyRequirements: [
      "Wind classification (N1 to N6, C1 to C4)",
      "Roof tie-down requirements",
      "Cladding fixing requirements"
    ]
  },
  {
    id: "AS 1397",
    title: "Continuous hot-dip metallic coated steel sheet and strip",
    currentVersion: "2021",
    relevance: "Specifies material grades and coating requirements for roofing steel",
    keyRequirements: [
      "Steel grades (G300, G550)",
      "Coating mass (AZ150, AZ200)",
      "Base metal thickness tolerances"
    ]
  },
  {
    id: "AS/NZS 4680",
    title: "Hot-dip galvanized (zinc) coatings on fabricated ferrous articles",
    currentVersion: "2006",
    relevance: "Specifies galvanizing requirements for steel components",
    keyRequirements: [
      "Coating thickness requirements",
      "Inspection and testing methods"
    ]
  },
  {
    id: "AS/NZS 3500.3",
    title: "Plumbing and drainage - Stormwater drainage",
    currentVersion: "2021",
    relevance: "Specifies requirements for roof drainage systems",
    keyRequirements: [
      "Gutter sizing calculations",
      "Downpipe sizing",
      "Overflow provisions"
    ]
  },
  {
    id: "AS 4654.1",
    title: "Waterproofing membranes for external above-ground use - Materials",
    currentVersion: "2012",
    relevance: "Specifies waterproofing membrane requirements",
    keyRequirements: [
      "Membrane types and classifications",
      "Performance requirements"
    ]
  },
  {
    id: "AS 4654.2",
    title: "Waterproofing membranes for external above-ground use - Design and installation",
    currentVersion: "2012",
    relevance: "Specifies installation requirements for waterproofing",
    keyRequirements: [
      "Substrate preparation",
      "Lap and joint requirements",
      "Flashing details"
    ]
  }
];

// ============================================================================
// WIND REGION DATA - AUSTRALIA
// ============================================================================

export interface WindRegion {
  region: string;
  description: string;
  ultimateWindSpeed: number; // m/s
  serviceabilityWindSpeed: number; // m/s
  states: string[];
  typicalClassifications: string[];
}

export const WIND_REGIONS: WindRegion[] = [
  {
    region: "A",
    description: "Non-cyclonic, inland areas",
    ultimateWindSpeed: 41,
    serviceabilityWindSpeed: 26,
    states: ["NSW", "VIC", "SA", "TAS", "ACT", "inland QLD"],
    typicalClassifications: ["N1", "N2", "N3"]
  },
  {
    region: "B",
    description: "Non-cyclonic, coastal areas",
    ultimateWindSpeed: 50,
    serviceabilityWindSpeed: 32,
    states: ["NSW coast", "VIC coast", "SA coast", "TAS coast"],
    typicalClassifications: ["N3", "N4"]
  },
  {
    region: "C",
    description: "Cyclonic, 50-100km from coast",
    ultimateWindSpeed: 66,
    serviceabilityWindSpeed: 42,
    states: ["QLD north of Bundaberg", "WA north of Geraldton", "NT"],
    typicalClassifications: ["C1", "C2"]
  },
  {
    region: "D",
    description: "Cyclonic, within 50km of coast",
    ultimateWindSpeed: 80,
    serviceabilityWindSpeed: 51,
    states: ["QLD coast north of Bundaberg", "WA coast north of Geraldton", "NT coast"],
    typicalClassifications: ["C3", "C4"]
  }
];

// ============================================================================
// ROOFING MATERIAL SPECIFICATIONS
// ============================================================================

export interface RoofingMaterial {
  profile: string;
  manufacturer: string;
  minPitch: number; // degrees
  maxSpan: number; // mm
  coverWidth: number; // mm
  bmtOptions: number[]; // mm
  coatingOptions: string[];
  warrantyYears: {
    coastal: number;
    inland: number;
  };
}

export const ROOFING_MATERIALS: RoofingMaterial[] = [
  {
    profile: "Colorbond Trimdek",
    manufacturer: "BlueScope Steel",
    minPitch: 1,
    maxSpan: 1800,
    coverWidth: 762,
    bmtOptions: [0.42, 0.48],
    coatingOptions: ["AZ150", "AZ200"],
    warrantyYears: { coastal: 15, inland: 25 }
  },
  {
    profile: "Colorbond Klip-Lok",
    manufacturer: "BlueScope Steel",
    minPitch: 1,
    maxSpan: 1800,
    coverWidth: 700,
    bmtOptions: [0.42, 0.48],
    coatingOptions: ["AZ150", "AZ200"],
    warrantyYears: { coastal: 15, inland: 25 }
  },
  {
    profile: "Colorbond Custom Orb",
    manufacturer: "BlueScope Steel",
    minPitch: 5,
    maxSpan: 1200,
    coverWidth: 762,
    bmtOptions: [0.42, 0.48],
    coatingOptions: ["AZ150", "AZ200"],
    warrantyYears: { coastal: 15, inland: 25 }
  },
  {
    profile: "Lysaght Spandek",
    manufacturer: "Lysaght",
    minPitch: 2,
    maxSpan: 1500,
    coverWidth: 700,
    bmtOptions: [0.42, 0.48],
    coatingOptions: ["AZ150", "AZ200"],
    warrantyYears: { coastal: 15, inland: 25 }
  },
  {
    profile: "Metroll 5-Rib",
    manufacturer: "Metroll",
    minPitch: 3,
    maxSpan: 1200,
    coverWidth: 760,
    bmtOptions: [0.42, 0.48],
    coatingOptions: ["AZ150", "AZ200"],
    warrantyYears: { coastal: 10, inland: 20 }
  },
  {
    profile: "Stramit Speed Deck Ultra",
    manufacturer: "Stramit",
    minPitch: 1,
    maxSpan: 2100,
    coverWidth: 700,
    bmtOptions: [0.42, 0.48, 0.60],
    coatingOptions: ["AZ150", "AZ200"],
    warrantyYears: { coastal: 15, inland: 25 }
  }
];

// ============================================================================
// FASTENER SPECIFICATIONS
// ============================================================================

export interface FastenerSpec {
  type: string;
  class: number;
  material: string;
  suitableFor: string[];
  corrosionResistance: "standard" | "enhanced" | "marine";
  typicalSpacing: {
    sheeting: number; // mm
    flashings: number; // mm
  };
}

export const FASTENER_SPECS: FastenerSpec[] = [
  {
    type: "Type 17 Hex Head",
    class: 3,
    material: "Carbon steel with mechanical zinc plating",
    suitableFor: ["Wind Region A", "Wind Region B (inland)"],
    corrosionResistance: "standard",
    typicalSpacing: { sheeting: 200, flashings: 150 }
  },
  {
    type: "Type 17 Hex Head Class 4",
    class: 4,
    material: "Stainless steel 316 or equivalent",
    suitableFor: ["Wind Region B (coastal)", "Wind Region C", "Wind Region D"],
    corrosionResistance: "marine",
    typicalSpacing: { sheeting: 165, flashings: 100 }
  },
  {
    type: "Tek Screw",
    class: 3,
    material: "Carbon steel with mechanical zinc plating",
    suitableFor: ["Steel purlins", "Light gauge framing"],
    corrosionResistance: "standard",
    typicalSpacing: { sheeting: 200, flashings: 150 }
  }
];

// ============================================================================
// COMPLIANCE CHECKING FUNCTIONS
// ============================================================================

export interface ComplianceCheckResult {
  standardId: string;
  standardTitle: string;
  status: "compliant" | "non-compliant" | "needs-review" | "not-applicable";
  findings: string[];
  recommendations: string[];
  severity: "critical" | "major" | "minor" | "info";
  reference: string;
}

/**
 * Check if a roof pitch is compliant for a given profile
 */
export function checkRoofPitchCompliance(
  profile: string,
  pitch: number
): ComplianceCheckResult {
  const material = ROOFING_MATERIALS.find(m => 
    m.profile.toLowerCase().includes(profile.toLowerCase())
  );

  if (!material) {
    return {
      standardId: "HB39-4.1",
      standardTitle: "Roof Pitch Requirements",
      status: "needs-review",
      findings: [`Profile "${profile}" not found in database. Manual verification required.`],
      recommendations: ["Verify roof pitch against manufacturer specifications"],
      severity: "major",
      reference: "HB-39:2015 Section 4.1"
    };
  }

  if (pitch < material.minPitch) {
    return {
      standardId: "HB39-4.1",
      standardTitle: "Roof Pitch Requirements",
      status: "non-compliant",
      findings: [
        `Roof pitch of ${pitch}° is below minimum of ${material.minPitch}° for ${material.profile}`,
        "Low pitch may cause water pooling and premature failure"
      ],
      recommendations: [
        `Increase roof pitch to minimum ${material.minPitch}°`,
        "Or select a profile suitable for lower pitches"
      ],
      severity: "critical",
      reference: "HB-39:2015 Section 4.1, Manufacturer specifications"
    };
  }

  return {
    standardId: "HB39-4.1",
    standardTitle: "Roof Pitch Requirements",
    status: "compliant",
    findings: [`Roof pitch of ${pitch}° meets minimum requirement of ${material.minPitch}° for ${material.profile}`],
    recommendations: [],
    severity: "info",
    reference: "HB-39:2015 Section 4.1"
  };
}

/**
 * Check fastener class compliance for wind region
 */
export function checkFastenerCompliance(
  fastenerClass: number,
  windRegion: string,
  isCoastal: boolean
): ComplianceCheckResult {
  const region = WIND_REGIONS.find(r => r.region === windRegion);
  
  if (!region) {
    return {
      standardId: "HB39-3.2",
      standardTitle: "Fastener Specification",
      status: "needs-review",
      findings: [`Wind region "${windRegion}" not recognized`],
      recommendations: ["Verify wind region classification per AS/NZS 1170.2"],
      severity: "major",
      reference: "HB-39:2015 Section 3.2, AS/NZS 1170.2"
    };
  }

  const requiresClass4 = windRegion === "C" || windRegion === "D" || 
    (windRegion === "B" && isCoastal);

  if (requiresClass4 && fastenerClass < 4) {
    return {
      standardId: "HB39-3.2",
      standardTitle: "Fastener Specification",
      status: "non-compliant",
      findings: [
        `Class ${fastenerClass} fasteners insufficient for Wind Region ${windRegion}${isCoastal ? " (coastal)" : ""}`,
        "Class 4 (stainless steel) fasteners required for corrosion resistance"
      ],
      recommendations: [
        "Upgrade to Class 4 stainless steel fasteners",
        "Consider 316 grade stainless for maximum corrosion resistance"
      ],
      severity: "critical",
      reference: "HB-39:2015 Section 3.2, AS 3566.2"
    };
  }

  return {
    standardId: "HB39-3.2",
    standardTitle: "Fastener Specification",
    status: "compliant",
    findings: [`Class ${fastenerClass} fasteners appropriate for Wind Region ${windRegion}`],
    recommendations: [],
    severity: "info",
    reference: "HB-39:2015 Section 3.2"
  };
}

/**
 * Check material coating compliance for exposure
 */
export function checkCoatingCompliance(
  coating: string,
  isCoastal: boolean,
  distanceFromCoast: number // km
): ComplianceCheckResult {
  const coatingMass = parseInt(coating.replace(/\D/g, ""));
  
  // Severe marine: within 1km of coast
  // Marine: 1-10km from coast
  // Moderate: 10-50km from coast
  
  let requiredCoating = "AZ150";
  let exposure = "inland";
  
  if (distanceFromCoast < 1) {
    requiredCoating = "AZ200";
    exposure = "severe marine";
  } else if (distanceFromCoast < 10) {
    requiredCoating = "AZ200";
    exposure = "marine";
  } else if (distanceFromCoast < 50 || isCoastal) {
    requiredCoating = "AZ150";
    exposure = "moderate";
  }

  const requiredMass = parseInt(requiredCoating.replace(/\D/g, ""));

  if (coatingMass < requiredMass) {
    return {
      standardId: "HB39-3.1",
      standardTitle: "Material Selection - Coating",
      status: "non-compliant",
      findings: [
        `${coating} coating insufficient for ${exposure} exposure`,
        `Location is ${distanceFromCoast}km from coast`
      ],
      recommendations: [
        `Upgrade to minimum ${requiredCoating} coating`,
        "Consider Colorbond Ultra for severe marine environments"
      ],
      severity: "critical",
      reference: "HB-39:2015 Section 3.1, AS 1397"
    };
  }

  return {
    standardId: "HB39-3.1",
    standardTitle: "Material Selection - Coating",
    status: "compliant",
    findings: [`${coating} coating appropriate for ${exposure} exposure`],
    recommendations: [],
    severity: "info",
    reference: "HB-39:2015 Section 3.1"
  };
}

/**
 * Get warranty expectations based on location
 */
export function getWarrantyExpectations(
  profile: string,
  isCoastal: boolean
): { minWarranty: number; typicalWarranty: number; reference: string } {
  const material = ROOFING_MATERIALS.find(m => 
    m.profile.toLowerCase().includes(profile.toLowerCase())
  );

  if (!material) {
    return {
      minWarranty: 10,
      typicalWarranty: 15,
      reference: "Industry standard minimum"
    };
  }

  const warranty = isCoastal ? material.warrantyYears.coastal : material.warrantyYears.inland;

  return {
    minWarranty: Math.floor(warranty * 0.8),
    typicalWarranty: warranty,
    reference: `${material.manufacturer} warranty schedule`
  };
}

// ============================================================================
// EXPORT ALL FOR USE IN VERIFICATION ENGINE
// ============================================================================

export const KNOWLEDGE_BASE = {
  hb39: HB39_REQUIREMENTS,
  ncc2022: NCC_2022_REQUIREMENTS,
  standards: AUSTRALIAN_STANDARDS,
  windRegions: WIND_REGIONS,
  materials: ROOFING_MATERIALS,
  fasteners: FASTENER_SPECS,
  compliance: {
    checkRoofPitch: checkRoofPitchCompliance,
    checkFastener: checkFastenerCompliance,
    checkCoating: checkCoatingCompliance,
    getWarrantyExpectations
  }
};
