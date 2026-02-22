/**
 * VENTURR VALDT - Comprehensive Trade Industry Knowledge Base
 * 
 * Contains verified best practices, SOPs, and industry standards for all major trades
 * Sources: Standards Australia, SafeWork Australia, State Building Commissions, HIA
 */

export interface TradeBestPractice {
  id: string;
  trade: TradeType;
  category: PracticeCategory;
  title: string;
  description: string;
  requirements: string[];
  standardReferences: string[];
  safetyConsiderations: string[];
  qualityBenchmarks: QualityBenchmark[];
  commonDefects: string[];
  warrantyCoverage: WarrantyInfo;
  effectiveDate: string;
  state: StateScope;
}

export interface IndustrySOP {
  id: string;
  trade: TradeType;
  sopType: SOPType;
  title: string;
  purpose: string;
  scope: string;
  steps: SOPStep[];
  safetyRequirements: string[];
  qualityChecks: string[];
  documentation: string[];
  standardReferences: string[];
  effectiveDate: string;
}

export interface SOPStep {
  stepNumber: number;
  action: string;
  details: string;
  safetyNote?: string;
  qualityCheck?: string;
}

export interface QualityBenchmark {
  metric: string;
  acceptableRange: string;
  measurementMethod: string;
}

export interface WarrantyInfo {
  minimumPeriod: string;
  coverage: string[];
  exclusions: string[];
  statutoryRequirements: string;
}

export type TradeType = 
  | "electrical"
  | "plumbing"
  | "roofing"
  | "building"
  | "carpentry"
  | "hvac"
  | "painting"
  | "tiling"
  | "landscaping"
  | "concreting"
  | "glazing"
  | "fencing";

export type PracticeCategory =
  | "installation"
  | "materials"
  | "safety"
  | "quality_control"
  | "documentation"
  | "compliance"
  | "warranty";

export type SOPType =
  | "installation"
  | "inspection"
  | "testing"
  | "maintenance"
  | "safety"
  | "documentation";

export type StateScope = "national" | "nsw" | "vic" | "qld" | "sa" | "wa" | "tas" | "nt" | "act";

/**
 * ELECTRICAL TRADE - Best Practices
 */
export const ELECTRICAL_BEST_PRACTICES: TradeBestPractice[] = [
  {
    id: "ELEC-BP-001",
    trade: "electrical",
    category: "installation",
    title: "Residential Switchboard Installation",
    description: "Best practices for installing and upgrading residential switchboards to AS/NZS 3000:2018 standards",
    requirements: [
      "RCD protection required for all final sub-circuits",
      "Main switch clearly identified and accessible",
      "Minimum 100A main switch for residential",
      "Circuit labeling mandatory",
      "Adequate clearance for maintenance access",
      "Surge protection recommended for all new installations"
    ],
    standardReferences: [
      "AS/NZS 3000:2018 Section 2.5",
      "AS/NZS 3000:2018 Section 2.6",
      "NSW Advisory Note 3/2021"
    ],
    safetyConsiderations: [
      "Isolate supply before work commences",
      "Test for dead before touching",
      "Use appropriate PPE including insulated gloves",
      "Lock-out tag-out procedures mandatory"
    ],
    qualityBenchmarks: [
      { metric: "RCD trip time", acceptableRange: "<300ms at rated current", measurementMethod: "RCD tester" },
      { metric: "Earth fault loop impedance", acceptableRange: "Per AS/NZS 3000 Table 8.2", measurementMethod: "Loop impedance tester" },
      { metric: "Insulation resistance", acceptableRange: ">1MΩ", measurementMethod: "Insulation resistance tester" }
    ],
    commonDefects: [
      "Missing or incorrect circuit labeling",
      "Inadequate RCD protection",
      "Poor cable terminations",
      "Insufficient clearance around switchboard",
      "Missing main switch identification"
    ],
    warrantyCoverage: {
      minimumPeriod: "6 years",
      coverage: ["Workmanship", "Materials fitness for purpose", "Compliance with standards"],
      exclusions: ["Customer-caused damage", "Normal wear and tear", "Unauthorized modifications"],
      statutoryRequirements: "Home Building Act 1989 (NSW) - 6 year structural, 2 year non-structural"
    },
    effectiveDate: "2019-01-01",
    state: "national"
  },
  {
    id: "ELEC-BP-002",
    trade: "electrical",
    category: "installation",
    title: "Solar PV System Installation",
    description: "Best practices for residential solar photovoltaic system installation",
    requirements: [
      "DC isolator at array and inverter",
      "AC isolator at main switchboard",
      "Correct cable sizing for DC and AC",
      "Proper earthing of all metallic components",
      "Labeling of all DC and AC components",
      "Roof penetration waterproofing"
    ],
    standardReferences: [
      "AS/NZS 5033:2021 Installation of PV arrays",
      "AS/NZS 4777.1:2016 Grid connection",
      "NSW Advisory Note 6/2023"
    ],
    safetyConsiderations: [
      "DC circuits remain live when panels exposed to light",
      "Working at heights protocols required",
      "Arc flash hazard awareness",
      "Emergency shutdown procedures documented"
    ],
    qualityBenchmarks: [
      { metric: "String voltage", acceptableRange: "Within inverter MPPT range", measurementMethod: "Multimeter" },
      { metric: "Insulation resistance", acceptableRange: ">1MΩ per kW", measurementMethod: "Insulation tester" },
      { metric: "Earth continuity", acceptableRange: "<1Ω", measurementMethod: "Earth continuity tester" }
    ],
    commonDefects: [
      "Incorrect DC cable sizing",
      "Missing or incorrect isolator labeling",
      "Poor roof penetration sealing",
      "Inadequate cable support",
      "Missing emergency shutdown signage"
    ],
    warrantyCoverage: {
      minimumPeriod: "5 years workmanship",
      coverage: ["Installation workmanship", "Electrical connections", "Mounting system"],
      exclusions: ["Panel manufacturer defects", "Inverter manufacturer defects", "Storm damage"],
      statutoryRequirements: "Consumer guarantees under Australian Consumer Law"
    },
    effectiveDate: "2021-01-01",
    state: "national"
  },
  {
    id: "ELEC-BP-003",
    trade: "electrical",
    category: "safety",
    title: "RCD Protection Requirements",
    description: "Residual Current Device protection requirements for electrical installations",
    requirements: [
      "All socket outlets in domestic premises must have RCD protection",
      "Maximum 30mA rating for personal protection",
      "Lighting circuits in wet areas require RCD protection",
      "Regular testing recommended (6 monthly by user, annually by electrician)",
      "Type A or Type B RCDs for EV charging circuits"
    ],
    standardReferences: [
      "AS/NZS 3000:2018 Section 2.6.3",
      "NSW Advisory Note 2/2025",
      "NSW Advisory Note 3/2025"
    ],
    safetyConsiderations: [
      "RCDs do not protect against all electric shock scenarios",
      "Test button must be pressed regularly",
      "Nuisance tripping may indicate fault",
      "BESS installations require specific RCD consideration"
    ],
    qualityBenchmarks: [
      { metric: "Trip time at rated current", acceptableRange: "<300ms", measurementMethod: "RCD tester" },
      { metric: "Trip time at 5x rated", acceptableRange: "<40ms", measurementMethod: "RCD tester" },
      { metric: "Trip current", acceptableRange: "50-100% of rated", measurementMethod: "RCD tester" }
    ],
    commonDefects: [
      "RCDs not installed on all required circuits",
      "Incorrect RCD type selected",
      "RCDs not tested after installation",
      "Shared neutral causing nuisance tripping"
    ],
    warrantyCoverage: {
      minimumPeriod: "Manufacturer warranty applies",
      coverage: ["Device functionality", "Installation workmanship"],
      exclusions: ["Damage from lightning", "Misuse"],
      statutoryRequirements: "Mandatory compliance with AS/NZS 3000"
    },
    effectiveDate: "2019-01-01",
    state: "national"
  }
];

/**
 * PLUMBING TRADE - Best Practices
 */
export const PLUMBING_BEST_PRACTICES: TradeBestPractice[] = [
  {
    id: "PLMB-BP-001",
    trade: "plumbing",
    category: "installation",
    title: "Hot Water System Installation",
    description: "Best practices for installing hot water systems compliant with AS/NZS 3500.4",
    requirements: [
      "Temperature control device (tempering valve) for all new installations",
      "Maximum 50°C delivery temperature to sanitary fixtures",
      "Storage temperature minimum 60°C to prevent Legionella",
      "Pressure and temperature relief valve required",
      "Tundish installation for safe discharge",
      "Adequate clearance for maintenance"
    ],
    standardReferences: [
      "AS/NZS 3500.4:2021 Heated Water Services",
      "AS 3498 Authorization of plumbing products",
      "NSW Advisory Note 1/2013",
      "NSW Advisory Note 13/2021"
    ],
    safetyConsiderations: [
      "Scalding prevention is primary safety concern",
      "Legionella control through temperature management",
      "Safe discharge of relief valve",
      "Electrical isolation for electric systems"
    ],
    qualityBenchmarks: [
      { metric: "Delivery temperature", acceptableRange: "≤50°C at fixtures", measurementMethod: "Digital thermometer" },
      { metric: "Storage temperature", acceptableRange: "≥60°C", measurementMethod: "Digital thermometer" },
      { metric: "Relief valve operation", acceptableRange: "Operates at rated pressure", measurementMethod: "Pressure test" }
    ],
    commonDefects: [
      "Missing or incorrectly set tempering valve",
      "Tundish not installed or incorrectly positioned",
      "Relief valve discharge to unsafe location",
      "Inadequate pipe insulation",
      "Missing isolation valves"
    ],
    warrantyCoverage: {
      minimumPeriod: "6 years",
      coverage: ["Installation workmanship", "Compliance with standards", "Tempering valve function"],
      exclusions: ["Manufacturer defects in unit", "Scale buildup", "Anode replacement"],
      statutoryRequirements: "Home Building Act 1989 (NSW)"
    },
    effectiveDate: "2021-01-01",
    state: "national"
  },
  {
    id: "PLMB-BP-002",
    trade: "plumbing",
    category: "compliance",
    title: "Backflow Prevention",
    description: "Cross-connection control and backflow prevention requirements",
    requirements: [
      "Risk assessment required for all connections",
      "Device selection based on hazard rating (High, Medium, Low)",
      "Annual testing by licensed tester",
      "Registration with water authority",
      "Testable devices for medium and high hazard",
      "Air gaps preferred for high hazard"
    ],
    standardReferences: [
      "AS/NZS 3500.1:2025 Water Services",
      "NSW Advisory Note 21/2021",
      "Sydney Water requirements"
    ],
    safetyConsiderations: [
      "Contamination of drinking water supply",
      "Public health protection",
      "Cross-connection identification",
      "Regular testing essential"
    ],
    qualityBenchmarks: [
      { metric: "Device test", acceptableRange: "Pass annual test", measurementMethod: "Certified backflow tester" },
      { metric: "Air gap", acceptableRange: "2x pipe diameter minimum", measurementMethod: "Physical measurement" },
      { metric: "Check valve operation", acceptableRange: "No backflow detected", measurementMethod: "Differential pressure test" }
    ],
    commonDefects: [
      "Wrong device for hazard level",
      "Device not registered",
      "Annual testing not completed",
      "Device installed in inaccessible location",
      "Missing test points"
    ],
    warrantyCoverage: {
      minimumPeriod: "Device manufacturer warranty",
      coverage: ["Installation workmanship", "Correct device selection"],
      exclusions: ["Device wear", "Contamination from upstream"],
      statutoryRequirements: "Water authority requirements"
    },
    effectiveDate: "2021-01-01",
    state: "national"
  },
  {
    id: "PLMB-BP-003",
    trade: "plumbing",
    category: "installation",
    title: "Drainage System Installation",
    description: "Best practices for sanitary drainage installation per AS/NZS 3500.2",
    requirements: [
      "Minimum grades: 1:60 for 100mm, 1:40 for 65mm, 1:40 for 50mm",
      "Inspection openings at required intervals",
      "Overflow relief gully within 750mm of lowest fixture",
      "Venting to prevent trap seal loss",
      "Junction requirements at grade",
      "Bedding and backfill requirements"
    ],
    standardReferences: [
      "AS/NZS 3500.2:2021 Sanitary Plumbing and Drainage",
      "NSW Advisory Note 11/2015",
      "NSW Advisory Note 14/2021"
    ],
    safetyConsiderations: [
      "Sewer gas prevention through proper venting",
      "Structural support for underground drains",
      "Safe excavation practices",
      "Confined space entry for maintenance"
    ],
    qualityBenchmarks: [
      { metric: "Drain grade", acceptableRange: "Per AS/NZS 3500.2 Table 4.1", measurementMethod: "Spirit level/laser" },
      { metric: "Water test", acceptableRange: "No leaks under test", measurementMethod: "Water test to 1.5m head" },
      { metric: "Air test", acceptableRange: "No pressure loss", measurementMethod: "Air test 35kPa" }
    ],
    commonDefects: [
      "Insufficient grade causing blockages",
      "Missing inspection openings",
      "Incorrect junction angles",
      "Poor bedding causing pipe damage",
      "Inadequate venting"
    ],
    warrantyCoverage: {
      minimumPeriod: "6 years",
      coverage: ["Workmanship", "Grade compliance", "Leak-free joints"],
      exclusions: ["Root intrusion", "Ground movement", "Blockages from misuse"],
      statutoryRequirements: "Home Building Act 1989 (NSW)"
    },
    effectiveDate: "2021-01-01",
    state: "national"
  }
];

/**
 * ROOFING TRADE - Best Practices
 */
export const ROOFING_BEST_PRACTICES: TradeBestPractice[] = [
  {
    id: "ROOF-BP-001",
    trade: "roofing",
    category: "installation",
    title: "Metal Roof Installation",
    description: "Best practices for metal roof and wall cladding installation per SA HB 39:2015",
    requirements: [
      "Minimum pitch: 5° for corrugated, 1° for standing seam",
      "Fastener class: Class 4 for Colorbond, Class 3 for Zincalume inland",
      "Fastener spacing per manufacturer specifications",
      "Sealant washers for through-fixed applications",
      "BMT: 0.42mm residential, 0.48mm commercial minimum",
      "Coating mass: AM100 inland, AM150 coastal"
    ],
    standardReferences: [
      "SA HB 39:2015 Installation Code",
      "AS 1562.1:2018 Design and Installation",
      "AS 1397:2021 Steel Sheet and Strip",
      "NCC 2022 Part 7.2"
    ],
    safetyConsiderations: [
      "Fall prevention for all roof work",
      "Edge protection required",
      "Fragile roof awareness",
      "Weather conditions assessment"
    ],
    qualityBenchmarks: [
      { metric: "Roof pitch", acceptableRange: "≥5° corrugated, ≥1° standing seam", measurementMethod: "Digital inclinometer" },
      { metric: "BMT", acceptableRange: "≥0.42mm residential", measurementMethod: "Micrometer" },
      { metric: "Fastener torque", acceptableRange: "Per manufacturer spec", measurementMethod: "Torque driver" }
    ],
    commonDefects: [
      "Insufficient pitch causing ponding",
      "Wrong fastener class for environment",
      "Over-driven fasteners damaging coating",
      "Missing or incorrect flashings",
      "Inadequate end laps"
    ],
    warrantyCoverage: {
      minimumPeriod: "6 years workmanship",
      coverage: ["Installation workmanship", "Weatherproofing", "Fastener integrity"],
      exclusions: ["Material manufacturer defects", "Storm damage", "Foot traffic damage"],
      statutoryRequirements: "Home Building Act 1989 (NSW)"
    },
    effectiveDate: "2015-01-01",
    state: "national"
  },
  {
    id: "ROOF-BP-002",
    trade: "roofing",
    category: "installation",
    title: "Flashing Installation",
    description: "Best practices for roof flashing installation",
    requirements: [
      "Wall flashings: 150mm minimum upstand",
      "Valley flashings: 450mm minimum width",
      "Apron flashings: 200mm minimum cover",
      "Material compatibility with roof sheets",
      "Sealed joints with appropriate sealant",
      "Expansion allowance for long runs"
    ],
    standardReferences: [
      "SA HB 39:2015 Section 6",
      "AS 1562.1:2018",
      "NCC 2022 Housing Provisions Part 7"
    ],
    safetyConsiderations: [
      "Working at heights protocols",
      "Sharp edge protection",
      "Weather conditions",
      "Secure ladder access"
    ],
    qualityBenchmarks: [
      { metric: "Upstand height", acceptableRange: "≥150mm", measurementMethod: "Tape measure" },
      { metric: "Valley width", acceptableRange: "≥450mm", measurementMethod: "Tape measure" },
      { metric: "Water test", acceptableRange: "No leaks", measurementMethod: "Hose test" }
    ],
    commonDefects: [
      "Insufficient upstand height",
      "Unsealed joints",
      "Incompatible materials causing corrosion",
      "Missing kick-out flashings",
      "Inadequate overlap"
    ],
    warrantyCoverage: {
      minimumPeriod: "6 years",
      coverage: ["Weatherproofing", "Material compatibility", "Workmanship"],
      exclusions: ["Storm damage", "Debris accumulation", "Unauthorized modifications"],
      statutoryRequirements: "Home Building Act 1989 (NSW)"
    },
    effectiveDate: "2015-01-01",
    state: "national"
  },
  {
    id: "ROOF-BP-003",
    trade: "roofing",
    category: "installation",
    title: "Gutter and Downpipe Installation",
    description: "Best practices for roof drainage installation per AS/NZS 3500.3",
    requirements: [
      "Gutter sizing per AS/NZS 3500.3 calculations",
      "Minimum fall 1:500 to outlets",
      "Overflow provisions required",
      "Downpipe sizing adequate for catchment",
      "Secure fixing at required intervals",
      "Leaf guards in bushfire areas"
    ],
    standardReferences: [
      "AS/NZS 3500.3:2021 Stormwater Drainage",
      "NCC 2022 Part 3.5.3",
      "Local council requirements"
    ],
    safetyConsiderations: [
      "Working at heights",
      "Ladder safety",
      "Power line proximity",
      "Weather conditions"
    ],
    qualityBenchmarks: [
      { metric: "Gutter fall", acceptableRange: "≥1:500", measurementMethod: "Spirit level" },
      { metric: "Joint sealing", acceptableRange: "No leaks", measurementMethod: "Water test" },
      { metric: "Bracket spacing", acceptableRange: "≤1200mm", measurementMethod: "Tape measure" }
    ],
    commonDefects: [
      "Insufficient fall causing overflow",
      "Undersized gutters for roof area",
      "Leaking joints",
      "Missing overflow provisions",
      "Inadequate downpipe capacity"
    ],
    warrantyCoverage: {
      minimumPeriod: "6 years",
      coverage: ["Workmanship", "Leak-free joints", "Adequate capacity"],
      exclusions: ["Debris blockage", "Storm damage", "Tree damage"],
      statutoryRequirements: "Home Building Act 1989 (NSW)"
    },
    effectiveDate: "2021-01-01",
    state: "national"
  }
];

/**
 * BUILDING/CARPENTRY TRADE - Best Practices
 */
export const BUILDING_BEST_PRACTICES: TradeBestPractice[] = [
  {
    id: "BLDG-BP-001",
    trade: "building",
    category: "installation",
    title: "Timber Frame Construction",
    description: "Best practices for residential timber frame construction per AS 1684",
    requirements: [
      "Timber grade and species per engineering or AS 1684 span tables",
      "Correct member sizes for spans and loads",
      "Appropriate connections and fixings",
      "Bracing requirements per wind classification",
      "Termite protection measures",
      "Moisture protection during construction"
    ],
    standardReferences: [
      "AS 1684.2:2021 Non-cyclonic areas",
      "AS 1684.3:2021 Cyclonic areas",
      "NCC 2022 Volume Two Part 3.4",
      "AS 3660.1 Termite management"
    ],
    safetyConsiderations: [
      "Working at heights",
      "Manual handling",
      "Power tool safety",
      "Temporary bracing during construction"
    ],
    qualityBenchmarks: [
      { metric: "Stud straightness", acceptableRange: "≤5mm in 3m", measurementMethod: "String line" },
      { metric: "Wall plumb", acceptableRange: "≤3mm per metre", measurementMethod: "Spirit level" },
      { metric: "Floor level", acceptableRange: "≤10mm over 10m", measurementMethod: "Laser level" }
    ],
    commonDefects: [
      "Incorrect timber grade used",
      "Undersized members",
      "Missing or inadequate bracing",
      "Poor connection details",
      "No termite protection"
    ],
    warrantyCoverage: {
      minimumPeriod: "6 years structural",
      coverage: ["Structural integrity", "Compliance with standards", "Workmanship"],
      exclusions: ["Termite damage without treatment", "Moisture damage from leaks", "Unauthorized modifications"],
      statutoryRequirements: "Home Building Act 1989 (NSW) - 6 years structural"
    },
    effectiveDate: "2021-01-01",
    state: "national"
  },
  {
    id: "BLDG-BP-002",
    trade: "building",
    category: "installation",
    title: "Deck Construction",
    description: "Best practices for timber deck construction",
    requirements: [
      "Footing design per soil conditions",
      "Bearer and joist sizing per AS 1684 or engineering",
      "Decking board fixing requirements",
      "Balustrade compliance with NCC",
      "Drainage and ventilation provisions",
      "Durability class appropriate for exposure"
    ],
    standardReferences: [
      "AS 1684.2:2021",
      "NCC 2022 Part 3.9.2 Balustrades",
      "AS 1170.1 Structural design actions"
    ],
    safetyConsiderations: [
      "Fall hazard from elevated decks",
      "Balustrade strength requirements",
      "Slip resistance",
      "Structural adequacy for loads"
    ],
    qualityBenchmarks: [
      { metric: "Balustrade height", acceptableRange: "≥1000mm", measurementMethod: "Tape measure" },
      { metric: "Baluster spacing", acceptableRange: "≤125mm", measurementMethod: "Tape measure" },
      { metric: "Board gap", acceptableRange: "3-6mm", measurementMethod: "Spacer gauge" }
    ],
    commonDefects: [
      "Inadequate footings",
      "Non-compliant balustrades",
      "Wrong timber durability class",
      "Poor drainage causing rot",
      "Insufficient fixing"
    ],
    warrantyCoverage: {
      minimumPeriod: "6 years structural",
      coverage: ["Structural integrity", "Balustrade compliance", "Workmanship"],
      exclusions: ["Weathering of timber", "Staining", "Normal maintenance"],
      statutoryRequirements: "Home Building Act 1989 (NSW)"
    },
    effectiveDate: "2021-01-01",
    state: "national"
  }
];

/**
 * HVAC TRADE - Best Practices
 */
export const HVAC_BEST_PRACTICES: TradeBestPractice[] = [
  {
    id: "HVAC-BP-001",
    trade: "hvac",
    category: "installation",
    title: "Split System Air Conditioning Installation",
    description: "Best practices for residential split system installation",
    requirements: [
      "Correct sizing for room/zone",
      "Adequate clearances for airflow and maintenance",
      "Proper refrigerant pipe installation and insulation",
      "Condensate drainage to approved location",
      "Electrical isolation requirements",
      "Noise compliance with local regulations"
    ],
    standardReferences: [
      "AS/NZS 60335.2.40 Safety requirements",
      "AS/NZS 3823 Performance testing",
      "AS 1668.2 Mechanical ventilation",
      "Local council noise requirements"
    ],
    safetyConsiderations: [
      "Refrigerant handling certification required",
      "Electrical isolation",
      "Working at heights for outdoor unit",
      "Manual handling of units"
    ],
    qualityBenchmarks: [
      { metric: "Refrigerant charge", acceptableRange: "Per manufacturer spec", measurementMethod: "Manifold gauges" },
      { metric: "Airflow", acceptableRange: "Per manufacturer spec", measurementMethod: "Anemometer" },
      { metric: "Noise level", acceptableRange: "Per local requirements", measurementMethod: "Sound level meter" }
    ],
    commonDefects: [
      "Undersized unit for space",
      "Inadequate clearances",
      "Poor condensate drainage",
      "Refrigerant leaks",
      "Excessive noise"
    ],
    warrantyCoverage: {
      minimumPeriod: "5 years manufacturer, 1 year installation",
      coverage: ["Installation workmanship", "Refrigerant connections", "Electrical connections"],
      exclusions: ["Manufacturer defects", "Filter cleaning", "Refrigerant top-up"],
      statutoryRequirements: "Australian Consumer Law guarantees"
    },
    effectiveDate: "2020-01-01",
    state: "national"
  }
];

/**
 * PAINTING TRADE - Best Practices
 */
export const PAINTING_BEST_PRACTICES: TradeBestPractice[] = [
  {
    id: "PAINT-BP-001",
    trade: "painting",
    category: "installation",
    title: "Interior Painting",
    description: "Best practices for interior painting per AS/NZS 2311:2017",
    requirements: [
      "Surface preparation per substrate type",
      "Primer selection appropriate to surface",
      "Minimum two coats topcoat",
      "Correct paint system for area (wet areas, high traffic)",
      "Environmental conditions during application",
      "Adequate drying time between coats"
    ],
    standardReferences: [
      "AS/NZS 2311:2017 Guide to painting of buildings",
      "Manufacturer specifications"
    ],
    safetyConsiderations: [
      "Ventilation during application",
      "Lead paint identification for older buildings",
      "Working at heights",
      "Chemical handling"
    ],
    qualityBenchmarks: [
      { metric: "Film thickness", acceptableRange: "Per manufacturer spec", measurementMethod: "Wet film gauge" },
      { metric: "Coverage", acceptableRange: "Complete opacity", measurementMethod: "Visual inspection" },
      { metric: "Finish quality", acceptableRange: "No runs, sags, or defects", measurementMethod: "Visual inspection" }
    ],
    commonDefects: [
      "Poor surface preparation",
      "Insufficient coats",
      "Wrong paint for application",
      "Runs and sags",
      "Poor cutting in"
    ],
    warrantyCoverage: {
      minimumPeriod: "2 years",
      coverage: ["Workmanship", "Adhesion", "Coverage"],
      exclusions: ["Normal wear", "Fading from UV", "Damage from cleaning"],
      statutoryRequirements: "Home Building Act 1989 (NSW) - 2 years non-structural"
    },
    effectiveDate: "2017-01-01",
    state: "national"
  }
];

/**
 * TILING TRADE - Best Practices
 */
export const TILING_BEST_PRACTICES: TradeBestPractice[] = [
  {
    id: "TILE-BP-001",
    trade: "tiling",
    category: "installation",
    title: "Wet Area Tiling",
    description: "Best practices for tiling in wet areas per AS 3958.1",
    requirements: [
      "Waterproof membrane required under tiles",
      "Fall to waste: 1:80 minimum",
      "Appropriate adhesive for wet area",
      "Grout type suitable for wet area",
      "Movement joints at perimeter and changes of plane",
      "Tile selection appropriate for wet area"
    ],
    standardReferences: [
      "AS 3958.1:2007 Ceramic tiles installation",
      "AS 3740:2021 Waterproofing of domestic wet areas",
      "NCC 2022 Part 3.8.1"
    ],
    safetyConsiderations: [
      "Slip resistance requirements",
      "Chemical handling for adhesives",
      "Dust control during cutting",
      "Manual handling"
    ],
    qualityBenchmarks: [
      { metric: "Floor fall", acceptableRange: "≥1:80 to waste", measurementMethod: "Spirit level/water test" },
      { metric: "Tile lippage", acceptableRange: "≤1mm", measurementMethod: "Straight edge" },
      { metric: "Grout joints", acceptableRange: "Consistent width, fully filled", measurementMethod: "Visual inspection" }
    ],
    commonDefects: [
      "Insufficient fall to waste",
      "Waterproofing failures",
      "Hollow tiles (poor adhesive coverage)",
      "Inconsistent grout joints",
      "Missing movement joints"
    ],
    warrantyCoverage: {
      minimumPeriod: "6 years",
      coverage: ["Waterproofing", "Tile adhesion", "Workmanship"],
      exclusions: ["Grout discoloration", "Tile damage from impact", "Efflorescence"],
      statutoryRequirements: "Home Building Act 1989 (NSW)"
    },
    effectiveDate: "2021-01-01",
    state: "national"
  }
];

/**
 * CONCRETING TRADE - Best Practices
 */
export const CONCRETING_BEST_PRACTICES: TradeBestPractice[] = [
  {
    id: "CONC-BP-001",
    trade: "concreting",
    category: "installation",
    title: "Residential Concrete Slab",
    description: "Best practices for residential concrete slab construction per AS 2870",
    requirements: [
      "Site classification and soil testing",
      "Slab design per AS 2870 or engineering",
      "Reinforcement placement and cover",
      "Concrete grade minimum N20 (typically N25-N32)",
      "Control joints at maximum 3m centres",
      "Curing for minimum 7 days"
    ],
    standardReferences: [
      "AS 2870:2011 Residential slabs and footings",
      "AS 3600:2018 Concrete structures",
      "NCC 2022 Part 3.2"
    ],
    safetyConsiderations: [
      "Concrete burns from wet concrete",
      "Manual handling",
      "Vibration from equipment",
      "Weather conditions"
    ],
    qualityBenchmarks: [
      { metric: "Concrete strength", acceptableRange: "≥N20 (25MPa typical)", measurementMethod: "Cylinder test" },
      { metric: "Slab thickness", acceptableRange: "Per design (typically 100mm)", measurementMethod: "Core sample" },
      { metric: "Surface level", acceptableRange: "±10mm", measurementMethod: "Laser level" }
    ],
    commonDefects: [
      "Inadequate curing",
      "Insufficient reinforcement cover",
      "Missing control joints",
      "Poor surface finish",
      "Cracking from shrinkage"
    ],
    warrantyCoverage: {
      minimumPeriod: "6 years structural",
      coverage: ["Structural integrity", "Compliance with design", "Workmanship"],
      exclusions: ["Hairline cracking", "Surface dusting", "Staining"],
      statutoryRequirements: "Home Building Act 1989 (NSW) - 6 years structural"
    },
    effectiveDate: "2018-01-01",
    state: "national"
  }
];

/**
 * LANDSCAPING TRADE - Best Practices
 */
export const LANDSCAPING_BEST_PRACTICES: TradeBestPractice[] = [
  {
    id: "LAND-BP-001",
    trade: "landscaping",
    category: "installation",
    title: "Retaining Wall Construction",
    description: "Best practices for retaining wall construction per AS 4678",
    requirements: [
      "Engineering design required for walls >600mm",
      "Adequate drainage behind wall",
      "Appropriate foundation for soil conditions",
      "Material selection for durability",
      "Weep holes at regular intervals",
      "Geotextile fabric behind wall"
    ],
    standardReferences: [
      "AS 4678:2002 Earth-retaining structures",
      "AS 3700:2018 Masonry structures",
      "Local council requirements"
    ],
    safetyConsiderations: [
      "Excavation safety",
      "Manual handling",
      "Working near services",
      "Structural stability during construction"
    ],
    qualityBenchmarks: [
      { metric: "Wall alignment", acceptableRange: "±10mm in 3m", measurementMethod: "String line" },
      { metric: "Drainage function", acceptableRange: "No water retention", measurementMethod: "Visual after rain" },
      { metric: "Foundation depth", acceptableRange: "Per design", measurementMethod: "Measurement" }
    ],
    commonDefects: [
      "Inadequate drainage",
      "Insufficient foundation",
      "Wall lean or bulge",
      "Missing weep holes",
      "Poor material selection"
    ],
    warrantyCoverage: {
      minimumPeriod: "6 years structural",
      coverage: ["Structural integrity", "Drainage function", "Workmanship"],
      exclusions: ["Plant root damage", "Ground movement", "Unauthorized modifications"],
      statutoryRequirements: "Home Building Act 1989 (NSW) if >600mm"
    },
    effectiveDate: "2002-01-01",
    state: "national"
  },
  {
    id: "LAND-BP-002",
    trade: "landscaping",
    category: "materials",
    title: "Landscaping Soil Requirements",
    description: "Best practices for landscaping soil selection per AS 4419",
    requirements: [
      "Soil testing to AS 4419 requirements",
      "pH range: 5.5-7.5 for general use",
      "Organic matter content appropriate",
      "Free from contaminants and weed seeds",
      "Texture suitable for intended plants",
      "Drainage characteristics appropriate"
    ],
    standardReferences: [
      "AS 4419:2018 Soils for landscaping and garden use"
    ],
    safetyConsiderations: [
      "Contaminated soil identification",
      "Manual handling",
      "Dust control"
    ],
    qualityBenchmarks: [
      { metric: "pH level", acceptableRange: "5.5-7.5 general, 4.5-6.0 acid-loving", measurementMethod: "pH meter" },
      { metric: "Organic matter", acceptableRange: "Per AS 4419 Table 1", measurementMethod: "Laboratory test" },
      { metric: "Contaminants", acceptableRange: "Below detection limits", measurementMethod: "Laboratory test" }
    ],
    commonDefects: [
      "Wrong pH for plants",
      "Contaminated soil",
      "Poor drainage",
      "Weed seed contamination",
      "Insufficient organic matter"
    ],
    warrantyCoverage: {
      minimumPeriod: "Supplier warranty",
      coverage: ["Compliance with AS 4419", "Contaminant-free"],
      exclusions: ["Plant selection", "Ongoing maintenance"],
      statutoryRequirements: "Australian Consumer Law"
    },
    effectiveDate: "2018-01-01",
    state: "national"
  }
];

/**
 * STANDARD OPERATING PROCEDURES (SOPs)
 */
export const INDUSTRY_SOPS: IndustrySOP[] = [
  // Electrical SOP
  {
    id: "SOP-ELEC-001",
    trade: "electrical",
    sopType: "installation",
    title: "Switchboard Upgrade Procedure",
    purpose: "To ensure safe and compliant switchboard upgrades in residential premises",
    scope: "All residential switchboard upgrades and replacements",
    steps: [
      { stepNumber: 1, action: "Site Assessment", details: "Assess existing installation, identify scope of work, check for asbestos", safetyNote: "Wear appropriate PPE" },
      { stepNumber: 2, action: "Isolation", details: "Isolate supply at meter box, verify dead with voltage tester", safetyNote: "Lock-out tag-out required", qualityCheck: "Confirm zero voltage" },
      { stepNumber: 3, action: "Remove Old Board", details: "Disconnect and remove existing switchboard, photograph existing wiring", qualityCheck: "Document existing circuits" },
      { stepNumber: 4, action: "Install New Board", details: "Mount new enclosure, install DIN rail, main switch, RCDs, MCBs", qualityCheck: "Verify correct ratings" },
      { stepNumber: 5, action: "Wiring", details: "Connect circuits to appropriate protective devices, label all circuits", qualityCheck: "Torque all connections" },
      { stepNumber: 6, action: "Testing", details: "Perform insulation resistance, earth continuity, RCD, and polarity tests", qualityCheck: "Record all test results" },
      { stepNumber: 7, action: "Energize", details: "Remove isolation, energize board, verify operation", safetyNote: "Stand clear during energization" },
      { stepNumber: 8, action: "Documentation", details: "Complete CCEW, provide test results to customer", qualityCheck: "All documentation complete" }
    ],
    safetyRequirements: [
      "Isolation and lock-out tag-out mandatory",
      "Test for dead before touching",
      "Appropriate PPE at all times",
      "Work permit if required"
    ],
    qualityChecks: [
      "All circuits labeled correctly",
      "RCD test results within specification",
      "Insulation resistance >1MΩ",
      "Earth fault loop impedance within limits"
    ],
    documentation: [
      "Certificate of Compliance for Electrical Work (CCEW)",
      "Test results sheet",
      "Circuit schedule",
      "Photos of completed work"
    ],
    standardReferences: ["AS/NZS 3000:2018", "AS/NZS 3017:2022"],
    effectiveDate: "2019-01-01"
  },
  // Plumbing SOP
  {
    id: "SOP-PLMB-001",
    trade: "plumbing",
    sopType: "installation",
    title: "Hot Water System Replacement Procedure",
    purpose: "To ensure safe and compliant hot water system replacement",
    scope: "All residential hot water system replacements",
    steps: [
      { stepNumber: 1, action: "Site Assessment", details: "Assess existing system, determine replacement type, check compliance requirements", safetyNote: "Check for asbestos flue if gas" },
      { stepNumber: 2, action: "Isolation", details: "Isolate water supply, drain existing system, isolate power/gas", safetyNote: "Hot water scalding risk", qualityCheck: "Confirm isolation" },
      { stepNumber: 3, action: "Remove Old System", details: "Disconnect and remove existing unit, cap services temporarily", qualityCheck: "Safe disposal of old unit" },
      { stepNumber: 4, action: "Install New System", details: "Position new unit, connect water services, install tempering valve", qualityCheck: "Verify valve settings" },
      { stepNumber: 5, action: "Connect Services", details: "Connect power/gas, install relief valve and tundish", safetyNote: "Licensed gasfitter for gas", qualityCheck: "Tundish visible" },
      { stepNumber: 6, action: "Commission", details: "Fill system, check for leaks, set temperatures", qualityCheck: "Storage ≥60°C, delivery ≤50°C" },
      { stepNumber: 7, action: "Testing", details: "Test tempering valve output, relief valve operation", qualityCheck: "Record temperatures" },
      { stepNumber: 8, action: "Documentation", details: "Complete compliance certificate, provide warranty info", qualityCheck: "All documentation complete" }
    ],
    safetyRequirements: [
      "Scalding prevention - check temperatures",
      "Electrical isolation before work",
      "Gas leak testing if applicable",
      "Manual handling for heavy units"
    ],
    qualityChecks: [
      "Delivery temperature ≤50°C",
      "Storage temperature ≥60°C",
      "Relief valve operates correctly",
      "No leaks at connections"
    ],
    documentation: [
      "Plumbing compliance certificate",
      "Manufacturer warranty registration",
      "Temperature test results",
      "Customer handover documentation"
    ],
    standardReferences: ["AS/NZS 3500.4:2021", "PCA 2022"],
    effectiveDate: "2021-01-01"
  },
  // Roofing SOP
  {
    id: "SOP-ROOF-001",
    trade: "roofing",
    sopType: "installation",
    title: "Metal Roof Installation Procedure",
    purpose: "To ensure safe and compliant metal roof installation",
    scope: "All residential metal roof installations and replacements",
    steps: [
      { stepNumber: 1, action: "Site Setup", details: "Establish exclusion zones, install edge protection, set up safe access", safetyNote: "Fall prevention mandatory" },
      { stepNumber: 2, action: "Substrate Check", details: "Verify battens/purlins spacing and condition, check for level", qualityCheck: "Spacing per manufacturer spec" },
      { stepNumber: 3, action: "Sarking Installation", details: "Install sarking if required, ensure correct overlap and taping", qualityCheck: "Overlaps sealed" },
      { stepNumber: 4, action: "Sheet Installation", details: "Install sheets from eaves to ridge, correct side laps and end laps", qualityCheck: "Minimum pitch achieved" },
      { stepNumber: 5, action: "Fastening", details: "Fix sheets with correct fasteners at specified spacing", safetyNote: "Correct torque - don't over-drive", qualityCheck: "Fastener class correct" },
      { stepNumber: 6, action: "Flashings", details: "Install all flashings - ridge, barge, valleys, penetrations", qualityCheck: "Minimum upstands achieved" },
      { stepNumber: 7, action: "Guttering", details: "Install gutters with correct fall, connect downpipes", qualityCheck: "Fall to outlets" },
      { stepNumber: 8, action: "Final Inspection", details: "Water test, check all fixings, clean up site", qualityCheck: "No leaks, all debris removed" }
    ],
    safetyRequirements: [
      "Edge protection at all times",
      "Harness if edge protection not possible",
      "Weather monitoring",
      "Exclusion zone below work area"
    ],
    qualityChecks: [
      "Roof pitch meets minimum",
      "Fastener spacing correct",
      "Flashings sealed",
      "Water test passed"
    ],
    documentation: [
      "Manufacturer warranty registration",
      "Compliance certificate if required",
      "Photos of completed work",
      "Maintenance instructions"
    ],
    standardReferences: ["SA HB 39:2015", "AS 1562.1:2018"],
    effectiveDate: "2015-01-01"
  }
];

/**
 * Get all best practices for a specific trade
 */
export function getBestPracticesForTrade(trade: TradeType): TradeBestPractice[] {
  const allPractices = [
    ...ELECTRICAL_BEST_PRACTICES,
    ...PLUMBING_BEST_PRACTICES,
    ...ROOFING_BEST_PRACTICES,
    ...BUILDING_BEST_PRACTICES,
    ...HVAC_BEST_PRACTICES,
    ...PAINTING_BEST_PRACTICES,
    ...TILING_BEST_PRACTICES,
    ...CONCRETING_BEST_PRACTICES,
    ...LANDSCAPING_BEST_PRACTICES
  ];
  
  return allPractices.filter(bp => bp.trade === trade);
}

/**
 * Get all SOPs for a specific trade
 */
export function getSOPsForTrade(trade: TradeType): IndustrySOP[] {
  return INDUSTRY_SOPS.filter(sop => sop.trade === trade);
}

/**
 * Get best practices by category
 */
export function getBestPracticesByCategory(category: PracticeCategory): TradeBestPractice[] {
  const allPractices = [
    ...ELECTRICAL_BEST_PRACTICES,
    ...PLUMBING_BEST_PRACTICES,
    ...ROOFING_BEST_PRACTICES,
    ...BUILDING_BEST_PRACTICES,
    ...HVAC_BEST_PRACTICES,
    ...PAINTING_BEST_PRACTICES,
    ...TILING_BEST_PRACTICES,
    ...CONCRETING_BEST_PRACTICES,
    ...LANDSCAPING_BEST_PRACTICES
  ];
  
  return allPractices.filter(bp => bp.category === category);
}

/**
 * Search best practices by keyword
 */
export function searchBestPractices(keyword: string): TradeBestPractice[] {
  const allPractices = [
    ...ELECTRICAL_BEST_PRACTICES,
    ...PLUMBING_BEST_PRACTICES,
    ...ROOFING_BEST_PRACTICES,
    ...BUILDING_BEST_PRACTICES,
    ...HVAC_BEST_PRACTICES,
    ...PAINTING_BEST_PRACTICES,
    ...TILING_BEST_PRACTICES,
    ...CONCRETING_BEST_PRACTICES,
    ...LANDSCAPING_BEST_PRACTICES
  ];
  
  const lowerKeyword = keyword.toLowerCase();
  return allPractices.filter(bp => 
    bp.title.toLowerCase().includes(lowerKeyword) ||
    bp.description.toLowerCase().includes(lowerKeyword) ||
    bp.requirements.some(r => r.toLowerCase().includes(lowerKeyword)) ||
    bp.standardReferences.some(r => r.toLowerCase().includes(lowerKeyword))
  );
}

/**
 * Get warranty information for a trade
 */
export function getWarrantyInfoForTrade(trade: TradeType): WarrantyInfo[] {
  const practices = getBestPracticesForTrade(trade);
  return practices.map(bp => bp.warrantyCoverage);
}

/**
 * Get common defects for a trade
 */
export function getCommonDefectsForTrade(trade: TradeType): string[] {
  const practices = getBestPracticesForTrade(trade);
  return practices.flatMap(bp => bp.commonDefects);
}

/**
 * Get quality benchmarks for a trade
 */
export function getQualityBenchmarksForTrade(trade: TradeType): QualityBenchmark[] {
  const practices = getBestPracticesForTrade(trade);
  return practices.flatMap(bp => bp.qualityBenchmarks);
}

/**
 * Export all knowledge base data
 */
export const TRADE_KNOWLEDGE_BASE = {
  electrical: {
    bestPractices: ELECTRICAL_BEST_PRACTICES,
    sops: INDUSTRY_SOPS.filter(s => s.trade === "electrical")
  },
  plumbing: {
    bestPractices: PLUMBING_BEST_PRACTICES,
    sops: INDUSTRY_SOPS.filter(s => s.trade === "plumbing")
  },
  roofing: {
    bestPractices: ROOFING_BEST_PRACTICES,
    sops: INDUSTRY_SOPS.filter(s => s.trade === "roofing")
  },
  building: {
    bestPractices: BUILDING_BEST_PRACTICES,
    sops: INDUSTRY_SOPS.filter(s => s.trade === "building")
  },
  hvac: {
    bestPractices: HVAC_BEST_PRACTICES,
    sops: INDUSTRY_SOPS.filter(s => s.trade === "hvac")
  },
  painting: {
    bestPractices: PAINTING_BEST_PRACTICES,
    sops: INDUSTRY_SOPS.filter(s => s.trade === "painting")
  },
  tiling: {
    bestPractices: TILING_BEST_PRACTICES,
    sops: INDUSTRY_SOPS.filter(s => s.trade === "tiling")
  },
  concreting: {
    bestPractices: CONCRETING_BEST_PRACTICES,
    sops: INDUSTRY_SOPS.filter(s => s.trade === "concreting")
  },
  landscaping: {
    bestPractices: LANDSCAPING_BEST_PRACTICES,
    sops: INDUSTRY_SOPS.filter(s => s.trade === "landscaping")
  }
};
