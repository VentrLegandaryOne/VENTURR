/**
 * VENTURR VALIDT - Compliance Standards Knowledge Base
 * Versioned, indexed compliance library limited to authoritative sources
 * 
 * Sources:
 * - NCC / ABCB (edition-stamped)
 * - SafeWork NSW Codes of Practice
 * - Relevant AS / AS-NZS standards
 * - Manufacturer technical manuals (roofing materials only)
 */

import { Citation } from '../shared/citations';

export interface ComplianceRule {
  id: string;
  standard: string;
  edition: string;
  clause: string;
  title: string;
  interpretation: string;
  applicationConstraints: string[];
  category: "building_code" | "safety" | "materials" | "installation" | "warranty";
  trade: "roofing" | "plumbing" | "electrical" | "general";
  state: "nsw" | "vic" | "qld" | "sa" | "wa" | "tas" | "nt" | "act" | "national";
  effectiveDate: string;
  supersededBy?: string;
  url?: string;
}

/**
 * Authoritative Standards Database
 * Each rule stored as: standard → edition → clause → interpretation → application constraints
 */
export const COMPLIANCE_RULES: ComplianceRule[] = [
  // NCC 2022 - Building Code of Australia
  {
    id: "NCC-2022-3.5.2.1",
    standard: "National Construction Code",
    edition: "NCC 2022 Volume Two",
    clause: "3.5.2.1",
    title: "Roof Covering Materials",
    interpretation: "Roof covering materials must comply with AS 1562.1 for metal sheet roofing or other relevant Australian Standards for the material type.",
    applicationConstraints: [
      "Applies to Class 1 and Class 10 buildings",
      "Metal roofing must comply with AS 1562.1",
      "Minimum BMT requirements apply based on exposure category"
    ],
    category: "building_code",
    trade: "roofing",
    state: "national",
    effectiveDate: "2022-05-01",
    url: "https://ncc.abcb.gov.au/editions/ncc-2022/adopted/volume-two"
  },
  {
    id: "NCC-2022-3.5.2.2",
    standard: "National Construction Code",
    edition: "NCC 2022 Volume Two",
    clause: "3.5.2.2",
    title: "Sarking",
    interpretation: "Where sarking is installed, it must comply with AS/NZS 4200.1 and be installed in accordance with AS/NZS 4200.2.",
    applicationConstraints: [
      "Required in certain climate zones",
      "Must be non-combustible in bushfire-prone areas",
      "Installation must prevent moisture accumulation"
    ],
    category: "building_code",
    trade: "roofing",
    state: "national",
    effectiveDate: "2022-05-01",
    url: "https://ncc.abcb.gov.au/editions/ncc-2022/adopted/volume-two"
  },
  {
    id: "NCC-2022-3.5.3.1",
    standard: "National Construction Code",
    edition: "NCC 2022 Volume Two",
    clause: "3.5.3.1",
    title: "Roof Drainage",
    interpretation: "Roofs must be designed and constructed to dispose of rainwater to an appropriate outfall without causing damage to the building.",
    applicationConstraints: [
      "Gutters must comply with AS/NZS 3500.3",
      "Minimum fall requirements apply",
      "Overflow provisions required"
    ],
    category: "building_code",
    trade: "roofing",
    state: "national",
    effectiveDate: "2022-05-01",
    url: "https://ncc.abcb.gov.au/editions/ncc-2022/adopted/volume-two"
  },

  // HB-39 - Installation Code for Metal Roofing and Wall Cladding
  {
    id: "HB39-2015-4.2",
    standard: "HB 39",
    edition: "HB 39:2015",
    clause: "Section 4.2",
    title: "Minimum Roof Pitch",
    interpretation: "Metal roofing requires minimum pitch based on profile type. Corrugated profiles require minimum 5° (1:12), standing seam minimum 1° (1:60).",
    applicationConstraints: [
      "Pitch requirements vary by profile type",
      "Lower pitches may require additional sealing",
      "Manufacturer specifications may require higher pitches"
    ],
    category: "installation",
    trade: "roofing",
    state: "national",
    effectiveDate: "2015-01-01",
    url: "https://www.standards.org.au/standards-catalogue/sa-snz/building/bd-059/hb--39-2015"
  },
  {
    id: "HB39-2015-5.1",
    standard: "HB 39",
    edition: "HB 39:2015",
    clause: "Section 5.1",
    title: "Fastener Requirements",
    interpretation: "Fasteners must be compatible with roofing material and substrate. Class 4 fasteners minimum for Colorbond, Class 3 for Zincalume in non-marine environments.",
    applicationConstraints: [
      "Marine environments require Class 4 minimum",
      "Fastener spacing per manufacturer specifications",
      "Sealant washers required for through-fixed applications"
    ],
    category: "installation",
    trade: "roofing",
    state: "national",
    effectiveDate: "2015-01-01",
    url: "https://www.standards.org.au/standards-catalogue/sa-snz/building/bd-059/hb--39-2015"
  },
  {
    id: "HB39-2015-6.3",
    standard: "HB 39",
    edition: "HB 39:2015",
    clause: "Section 6.3",
    title: "Flashing Requirements",
    interpretation: "All penetrations, junctions, and edges must be flashed to prevent water ingress. Flashings must be compatible with roofing material.",
    applicationConstraints: [
      "Minimum 150mm upstand at walls",
      "Valley flashings minimum 450mm wide",
      "Apron flashings minimum 200mm cover"
    ],
    category: "installation",
    trade: "roofing",
    state: "national",
    effectiveDate: "2015-01-01",
    url: "https://www.standards.org.au/standards-catalogue/sa-snz/building/bd-059/hb--39-2015"
  },

  // SafeWork NSW - Working at Heights
  {
    id: "SWNSW-WAH-2021-3.1",
    standard: "SafeWork NSW Code of Practice",
    edition: "Managing the Risk of Falls at Workplaces 2021",
    clause: "Section 3.1",
    title: "Fall Prevention",
    interpretation: "Work at height above 2 metres requires fall prevention measures. Hierarchy: eliminate risk, use passive fall prevention, use work positioning, use fall arrest.",
    applicationConstraints: [
      "Applies to all work above 2 metres",
      "Edge protection required where practicable",
      "Fall arrest systems require rescue plan"
    ],
    category: "safety",
    trade: "roofing",
    state: "nsw",
    effectiveDate: "2021-07-01",
    url: "https://www.safework.nsw.gov.au/resource-library/list-of-all-codes-of-practice"
  },
  {
    id: "SWNSW-WAH-2021-4.2",
    standard: "SafeWork NSW Code of Practice",
    edition: "Managing the Risk of Falls at Workplaces 2021",
    clause: "Section 4.2",
    title: "Scaffolding Requirements",
    interpretation: "Scaffolding must be erected by competent persons. Scaffolds over 4 metres require licensed scaffolder. Regular inspections required.",
    applicationConstraints: [
      "Scaffolds over 4m require licensed scaffolder",
      "Inspection before each use",
      "Load capacity must be clearly marked"
    ],
    category: "safety",
    trade: "roofing",
    state: "nsw",
    effectiveDate: "2021-07-01",
    url: "https://www.safework.nsw.gov.au/resource-library/list-of-all-codes-of-practice"
  },

  // AS 1397 - Steel Sheet and Strip
  {
    id: "AS1397-2021-5.2",
    standard: "AS 1397",
    edition: "AS 1397:2021",
    clause: "Section 5.2",
    title: "Base Metal Thickness (BMT)",
    interpretation: "Minimum BMT for roofing applications is 0.42mm for residential, 0.48mm for commercial. Higher BMT required for longer spans.",
    applicationConstraints: [
      "Residential minimum 0.42mm BMT",
      "Commercial minimum 0.48mm BMT",
      "Coastal areas may require higher BMT"
    ],
    category: "materials",
    trade: "roofing",
    state: "national",
    effectiveDate: "2021-01-01",
    url: "https://www.standards.org.au/standards-catalogue/sa-snz/manufacturing/mt-001/as--1397-2021"
  },
  {
    id: "AS1397-2021-6.1",
    standard: "AS 1397",
    edition: "AS 1397:2021",
    clause: "Section 6.1",
    title: "Coating Mass",
    interpretation: "Zinc/aluminium coating mass determines corrosion resistance. AM100 minimum for residential, AM150 for coastal or industrial environments.",
    applicationConstraints: [
      "AM100 minimum for residential inland",
      "AM150 for coastal (within 1km of coast)",
      "AM200 for severe marine environments"
    ],
    category: "materials",
    trade: "roofing",
    state: "national",
    effectiveDate: "2021-01-01",
    url: "https://www.standards.org.au/standards-catalogue/sa-snz/manufacturing/mt-001/as--1397-2021"
  },

  // NCC 2022 Housing Provisions - Part 7 Roof and Wall Cladding (Verified Dec 2024)
  {
    id: "NCC-2022-HP-7.2.2",
    standard: "National Construction Code",
    edition: "NCC 2022 Housing Provisions",
    clause: "Part 7.2.2",
    title: "Sheet Roofing Materials",
    interpretation: "Metal sheet roofing must be manufactured from steel complying with AS 1397 with minimum coating mass. Aluminium must comply with AS/NZS 1734. Copper, zinc, and lead must comply with relevant standards.",
    applicationConstraints: [
      "Steel roofing must comply with AS 1397",
      "Minimum coating mass requirements based on environment",
      "Applies to Class 1 and 10a buildings"
    ],
    category: "building_code",
    trade: "roofing",
    state: "national",
    effectiveDate: "2022-05-01",
    url: "https://ncc.abcb.gov.au/editions/ncc-2022/adopted/housing-provisions/7-roof-and-wall-cladding"
  },
  {
    id: "NCC-2022-HP-7.2.3",
    standard: "National Construction Code",
    edition: "NCC 2022 Housing Provisions",
    clause: "Part 7.2.3",
    title: "Sheet Roofing Fixing",
    interpretation: "Sheet roofing must be fixed in accordance with AS 1562.1 using fasteners that are compatible with the roofing material and corrosion resistant.",
    applicationConstraints: [
      "Fasteners must be compatible with roofing material",
      "Must comply with AS 1562.1 fixing requirements",
      "Corrosion resistance appropriate to environment"
    ],
    category: "building_code",
    trade: "roofing",
    state: "national",
    effectiveDate: "2022-05-01",
    url: "https://ncc.abcb.gov.au/editions/ncc-2022/adopted/housing-provisions/7-roof-and-wall-cladding/part-72-sheet-roofing"
  },

  // SafeWork NSW - WHS Regulation 2025 (Verified Dec 2024)
  {
    id: "SWNSW-WHS-2025-78",
    standard: "WHS Regulation 2025 (NSW)",
    edition: "2025",
    clause: "Sections 78-80",
    title: "Working at Heights - Fall Protection",
    interpretation: "PCBUs must protect workers from falls regardless of height. SWMS required for construction work where fall risk exceeds 2 metres. Hierarchy of control: eliminate, fall prevention devices, work positioning, fall arrest, administrative controls.",
    applicationConstraints: [
      "SWMS mandatory for work with fall risk >2m",
      "Fall prevention devices preferred over fall arrest",
      "Emergency rescue procedures required for fall arrest systems",
      "On-the-spot fines for non-compliance"
    ],
    category: "safety",
    trade: "roofing",
    state: "nsw",
    effectiveDate: "2025-01-01",
    url: "https://www.safework.nsw.gov.au/hazards-a-z/working-at-heights"
  },
  {
    id: "SWNSW-SWMS-2025",
    standard: "SafeWork NSW",
    edition: "2025",
    clause: "SWMS Requirements",
    title: "Safe Work Method Statement for Construction",
    interpretation: "A site-specific SWMS is required for construction work where a person could fall more than 2 metres. Must be available to workers, supervisors, and other persons at workplace.",
    applicationConstraints: [
      "Must be site-specific",
      "Must detail hazards, risks, and safety controls",
      "Must be available to all workers on site",
      "Required before high-risk construction work commences"
    ],
    category: "safety",
    trade: "roofing",
    state: "nsw",
    effectiveDate: "2025-01-01",
    url: "https://www.safework.nsw.gov.au/hazards-a-z/working-at-heights"
  },

  // NSW Fair Trading - Licensing Requirements (Verified Dec 2024)
  {
    id: "NSWFT-HBA-2024-LIC",
    standard: "Home Building Act 1989 (NSW)",
    edition: "Current 2024",
    clause: "Licensing Requirements",
    title: "Contractor Licence Threshold",
    interpretation: "A contractor licence is required to carry out, advertise, or contract for residential building work in NSW valued at more than $5,000 in labour and materials (including GST).",
    applicationConstraints: [
      "Applies to all residential building work over $5,000",
      "Includes roof tiling, roof plumbing, waterproofing",
      "Licence number must be displayed on quotes and contracts"
    ],
    category: "building_code",
    trade: "general",
    state: "nsw",
    effectiveDate: "2024-01-01",
    url: "https://www.nsw.gov.au/business-and-economy/licences-and-credentials/building-and-trade-licences-and-registrations/categories-of-work"
  },
  {
    id: "NSWFT-HBA-2024-CONTRACT",
    standard: "Home Building Act 1989 (NSW)",
    edition: "Current 2024",
    clause: "Contract Requirements",
    title: "Written Contract Requirements",
    interpretation: "Written contract mandatory for residential building work over $5,000. Contracts over $20,000 require insurance details, progress payments, warranties, and 5-day cooling-off period.",
    applicationConstraints: [
      "Written contract required for work over $5,000",
      "Large jobs (>$20,000) have additional requirements",
      "Consumer Building Guide must be provided",
      "Maximum deposit 10% of contract price"
    ],
    category: "building_code",
    trade: "general",
    state: "nsw",
    effectiveDate: "2024-01-01",
    url: "https://www.nsw.gov.au/housing-and-construction/compliance-and-regulation/your-obligations-to-your-customers/guide-to-providing-home-building-contracts"
  },
  {
    id: "NSWFT-HBA-2024-DEPOSIT",
    standard: "Home Building Act 1989 (NSW)",
    edition: "Current 2024",
    clause: "Deposit Limits",
    title: "Maximum Deposit Requirement",
    interpretation: "Contractors cannot request a deposit of more than 10% of the contract price. This applies to both small works contracts ($5,000-$20,000) and large jobs contracts (over $20,000).",
    applicationConstraints: [
      "Maximum deposit is 10% of contract price",
      "Applies to all residential building contracts",
      "Excess deposit requests are unlawful"
    ],
    category: "building_code",
    trade: "general",
    state: "nsw",
    effectiveDate: "2024-01-01",
    url: "https://www.nsw.gov.au/housing-and-construction/compliance-and-regulation/your-obligations-to-your-customers/guide-to-providing-home-building-contracts"
  },
  {
    id: "NSWFT-HBC-2024",
    standard: "Home Building Act 1989 (NSW)",
    edition: "Current 2024",
    clause: "Home Building Compensation",
    title: "HBC Insurance Requirements",
    interpretation: "Home Building Compensation (HBC) insurance is required for residential building work over $20,000. Certificate must be provided to homeowner before work commences.",
    applicationConstraints: [
      "Required for work over $20,000",
      "Must be obtained before work commences",
      "Certificate must be provided to homeowner",
      "Protects against builder insolvency or death"
    ],
    category: "building_code",
    trade: "general",
    state: "nsw",
    effectiveDate: "2024-01-01",
    url: "https://www.nsw.gov.au/housing-and-construction/compliance-and-regulation/your-obligations-to-your-customers/guide-to-providing-home-building-contracts"
  },

  // SA HB 39:2015 - Verified from HIA (Dec 2024)
  {
    id: "HB39-2015-SCOPE",
    standard: "SA HB 39",
    edition: "SA HB 39:2015",
    clause: "Section 1",
    title: "Scope and Purpose",
    interpretation: "Companion document to AS 1562.1:2018. Provides guidelines for selection, performance and installation of metal roof and wall cladding to ensure weatherproof exterior.",
    applicationConstraints: [
      "Companion to AS 1562.1:2018",
      "May be mandatory in some State/Territory legislation",
      "Not directly referenced in NCC"
    ],
    category: "installation",
    trade: "roofing",
    state: "national",
    effectiveDate: "2015-01-01",
    url: "https://hia.com.au/resources-and-advice/building-it-right/australian-standards/articles/installation-code-for-metal-roof-and-wall-cladding"
  },
  {
    id: "HB39-2015-SAFETY",
    standard: "SA HB 39",
    edition: "SA HB 39:2015",
    clause: "Section 4",
    title: "Roof Safety Requirements",
    interpretation: "Section 4 deals with roof safety, precautions for working on roofs including OH&S requirements. Must be followed in conjunction with WHS regulations.",
    applicationConstraints: [
      "OH&S requirements must be followed",
      "Precautions required for all roof work",
      "Complements WHS Regulation requirements"
    ],
    category: "safety",
    trade: "roofing",
    state: "national",
    effectiveDate: "2015-01-01",
    url: "https://hia.com.au/resources-and-advice/building-it-right/australian-standards/articles/installation-code-for-metal-roof-and-wall-cladding"
  },
  {
    id: "HB39-2015-GUTTERS",
    standard: "SA HB 39",
    edition: "SA HB 39:2015",
    clause: "Section 5",
    title: "Gutters and Drainage",
    interpretation: "Section 5 provides guidelines for manufacture and fitting of internal and external gutters, downpipes, sumps and rainheads.",
    applicationConstraints: [
      "Gutter sizing must match roof area",
      "Downpipe capacity must handle peak flow",
      "Overflow provisions required"
    ],
    category: "installation",
    trade: "roofing",
    state: "national",
    effectiveDate: "2015-01-01",
    url: "https://hia.com.au/resources-and-advice/building-it-right/australian-standards/articles/installation-code-for-metal-roof-and-wall-cladding"
  },
  {
    id: "HB39-2015-INSULATION",
    standard: "SA HB 39",
    edition: "SA HB 39:2015",
    clause: "Section 6",
    title: "Roof Insulation",
    interpretation: "Section 6 provides guidance on methods of insulating metal roofs, including assessing insulation requirements and controlling condensation.",
    applicationConstraints: [
      "R-value must meet NCC requirements for climate zone",
      "Condensation control measures required",
      "Vapour barriers may be required"
    ],
    category: "installation",
    trade: "roofing",
    state: "national",
    effectiveDate: "2015-01-01",
    url: "https://hia.com.au/resources-and-advice/building-it-right/australian-standards/articles/installation-code-for-metal-roof-and-wall-cladding"
  },

  // AS 1562.1:2018 - Verified (Dec 2024)
  {
    id: "AS1562-2018-DESIGN",
    standard: "AS 1562.1",
    edition: "AS 1562.1:2018",
    clause: "General",
    title: "Design and Installation of Metal Roof and Wall Cladding",
    interpretation: "Provides minimum design requirements for correct and safe design and installation of sheet metal roof and wall cladding for both cyclone and non-cyclone regions.",
    applicationConstraints: [
      "Applies to all classes of self-supporting sheet metal cladding",
      "Covers cyclone and non-cyclone regions",
      "Referenced by NCC for weatherproofing compliance"
    ],
    category: "building_code",
    trade: "roofing",
    state: "national",
    effectiveDate: "2018-01-01",
    url: "https://www.abcb.gov.au/news/2023/use-15621-demonstrating-weatherproofing-compliance-metal-wall-cladding-panel-systems"
  },

  // Manufacturer Specifications - BlueScope/Lysaght
  {
    id: "LYSAGHT-COLORBOND-2024-WTY",
    standard: "BlueScope Lysaght",
    edition: "Colorbond Steel Warranty 2024",
    clause: "Warranty Terms",
    title: "Colorbond Warranty Coverage",
    interpretation: "Colorbond steel carries manufacturer warranty: 10 years for perforation, 15 years for peeling/flaking in non-severe environments.",
    applicationConstraints: [
      "Warranty void if not installed per specifications",
      "Reduced warranty in severe marine/industrial zones",
      "Registration required within 30 days of installation"
    ],
    category: "warranty",
    trade: "roofing",
    state: "national",
    effectiveDate: "2024-01-01",
    url: "https://www.colorbond.com/warranties"
  },
  {
    id: "LYSAGHT-INSTALL-2024-SPAN",
    standard: "BlueScope Lysaght",
    edition: "Technical Manual 2024",
    clause: "Span Tables",
    title: "Maximum Span Requirements",
    interpretation: "Maximum purlin/batten spacing depends on profile, BMT, and wind region. Trimdek 0.42mm BMT: max 1200mm span in N2 wind region.",
    applicationConstraints: [
      "Spans must be reduced in higher wind regions",
      "End spans typically 80% of internal spans",
      "Overhang maximum 300mm without support"
    ],
    category: "installation",
    trade: "roofing",
    state: "national",
    effectiveDate: "2024-01-01",
    url: "https://www.lysaght.com/resources/technical-literature"
  }
];

/**
 * Search compliance rules by criteria
 */
export function searchRules(criteria: {
  standard?: string;
  category?: ComplianceRule["category"];
  trade?: ComplianceRule["trade"];
  state?: ComplianceRule["state"];
  keyword?: string;
}): ComplianceRule[] {
  return COMPLIANCE_RULES.filter(rule => {
    if (criteria.standard && !rule.standard.toLowerCase().includes(criteria.standard.toLowerCase())) {
      return false;
    }
    if (criteria.category && rule.category !== criteria.category) {
      return false;
    }
    if (criteria.trade && rule.trade !== criteria.trade) {
      return false;
    }
    if (criteria.state && rule.state !== criteria.state && rule.state !== "national") {
      return false;
    }
    if (criteria.keyword) {
      const searchText = `${rule.title} ${rule.interpretation} ${rule.clause}`.toLowerCase();
      if (!searchText.includes(criteria.keyword.toLowerCase())) {
        return false;
      }
    }
    return true;
  });
}

/**
 * Get rule by ID
 */
export function getRuleById(id: string): ComplianceRule | undefined {
  return COMPLIANCE_RULES.find(rule => rule.id === id);
}

/**
 * Convert a compliance rule to a citation object
 */
export function ruleToCitation(rule: ComplianceRule): Citation {
  return {
    authority: rule.standard,
    document: rule.edition,
    edition_or_version: rule.edition,
    clause_or_page: rule.clause,
    url_or_identifier: rule.url || rule.id,
    retrieved_at: new Date().toISOString(),
    confidence: "high"
  };
}

/**
 * Get all rules for a specific standard
 */
export function getRulesByStandard(standard: string): ComplianceRule[] {
  return COMPLIANCE_RULES.filter(rule => 
    rule.standard.toLowerCase().includes(standard.toLowerCase())
  );
}

/**
 * Check if a rule is superseded
 */
export function isRuleSuperseded(ruleId: string): boolean {
  const rule = getRuleById(ruleId);
  return rule?.supersededBy !== undefined;
}

/**
 * Get the latest version of a rule
 */
export function getLatestRule(ruleId: string): ComplianceRule | undefined {
  let rule = getRuleById(ruleId);
  while (rule?.supersededBy) {
    const newer = getRuleById(rule.supersededBy);
    if (!newer) break;
    rule = newer;
  }
  return rule;
}

/**
 * Validate that all referenced standards are current
 */
export function validateStandardsCurrency(): {
  valid: boolean;
  outdatedRules: string[];
  warnings: string[];
} {
  const outdatedRules: string[] = [];
  const warnings: string[] = [];
  
  for (const rule of COMPLIANCE_RULES) {
    if (rule.supersededBy) {
      outdatedRules.push(rule.id);
      warnings.push(`Rule ${rule.id} has been superseded by ${rule.supersededBy}`);
    }
    
    // Check if edition is more than 5 years old
    const effectiveDate = new Date(rule.effectiveDate);
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
    
    if (effectiveDate < fiveYearsAgo) {
      warnings.push(`Rule ${rule.id} (${rule.edition}) may need review - effective date is ${rule.effectiveDate}`);
    }
  }
  
  return {
    valid: outdatedRules.length === 0,
    outdatedRules,
    warnings
  };
}

/**
 * Get standards that apply to a specific analysis
 */
export function getApplicableStandards(
  trade: ComplianceRule["trade"],
  state: ComplianceRule["state"],
  categories: ComplianceRule["category"][]
): ComplianceRule[] {
  return COMPLIANCE_RULES.filter(rule => 
    rule.trade === trade &&
    (rule.state === state || rule.state === "national") &&
    categories.includes(rule.category)
  );
}
