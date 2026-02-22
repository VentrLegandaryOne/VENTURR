/**
 * VENTURR VALDT - Enhanced LLM Prompts with Trade Industry Expertise
 * 
 * Comprehensive prompts incorporating:
 * - Trade-specific best practices and SOPs
 * - Australian Standards references
 * - State-specific requirements
 * - Quality benchmarks and defect identification
 * - Warranty requirements
 */

import { 
  TRADE_KNOWLEDGE_BASE, 
  getBestPracticesForTrade, 
  getCommonDefectsForTrade,
  getQualityBenchmarksForTrade,
  TradeType 
} from "./tradeKnowledgeBase";

/**
 * Trade detection from quote content
 */
export function detectTradeFromQuote(quoteText: string): TradeType {
  const lowerText = quoteText.toLowerCase();
  
  // Electrical indicators
  if (lowerText.includes("switchboard") || lowerText.includes("wiring") || 
      lowerText.includes("rcd") || lowerText.includes("circuit") ||
      lowerText.includes("electrical") || lowerText.includes("power point") ||
      lowerText.includes("lighting") || lowerText.includes("solar")) {
    return "electrical";
  }
  
  // Plumbing indicators
  if (lowerText.includes("plumbing") || lowerText.includes("hot water") ||
      lowerText.includes("drainage") || lowerText.includes("toilet") ||
      lowerText.includes("bathroom") || lowerText.includes("tap") ||
      lowerText.includes("pipe") || lowerText.includes("sewer")) {
    return "plumbing";
  }
  
  // Roofing indicators
  if (lowerText.includes("roof") || lowerText.includes("gutter") ||
      lowerText.includes("colorbond") || lowerText.includes("flashing") ||
      lowerText.includes("ridge") || lowerText.includes("tile") && lowerText.includes("roof")) {
    return "roofing";
  }
  
  // HVAC indicators
  if (lowerText.includes("air conditioning") || lowerText.includes("hvac") ||
      lowerText.includes("split system") || lowerText.includes("ducted") ||
      lowerText.includes("heating") || lowerText.includes("cooling")) {
    return "hvac";
  }
  
  // Painting indicators
  if (lowerText.includes("paint") || lowerText.includes("primer") ||
      lowerText.includes("coat") || lowerText.includes("dulux") ||
      lowerText.includes("taubmans")) {
    return "painting";
  }
  
  // Tiling indicators
  if (lowerText.includes("tile") || lowerText.includes("grout") ||
      lowerText.includes("waterproof") && lowerText.includes("membrane")) {
    return "tiling";
  }
  
  // Concreting indicators
  if (lowerText.includes("concrete") || lowerText.includes("slab") ||
      lowerText.includes("footing") || lowerText.includes("reinforcement")) {
    return "concreting";
  }
  
  // Landscaping indicators
  if (lowerText.includes("landscap") || lowerText.includes("retaining wall") ||
      lowerText.includes("paving") || lowerText.includes("garden")) {
    return "landscaping";
  }
  
  // Default to building/carpentry
  return "building";
}

/**
 * Generate trade-specific knowledge context for LLM
 */
export function generateTradeContext(trade: TradeType): string {
  const bestPractices = getBestPracticesForTrade(trade);
  const commonDefects = getCommonDefectsForTrade(trade);
  const qualityBenchmarks = getQualityBenchmarksForTrade(trade);
  
  let context = `\n## ${trade.toUpperCase()} TRADE EXPERTISE\n\n`;
  
  // Add best practices summary
  context += `### Best Practices & Standards:\n`;
  bestPractices.forEach(bp => {
    context += `- **${bp.title}**: ${bp.description}\n`;
    context += `  Standards: ${bp.standardReferences.join(", ")}\n`;
    context += `  Key Requirements:\n`;
    bp.requirements.slice(0, 3).forEach(req => {
      context += `    • ${req}\n`;
    });
  });
  
  // Add quality benchmarks
  context += `\n### Quality Benchmarks:\n`;
  qualityBenchmarks.slice(0, 5).forEach(qb => {
    context += `- ${qb.metric}: ${qb.acceptableRange} (measured by ${qb.measurementMethod})\n`;
  });
  
  // Add common defects to watch for
  context += `\n### Common Defects to Flag:\n`;
  Array.from(new Set(commonDefects)).slice(0, 8).forEach(defect => {
    context += `- ${defect}\n`;
  });
  
  return context;
}

/**
 * Enhanced pricing analysis prompt with trade expertise
 */
export function enhancedPricingPrompt(quoteText: string, trade: TradeType, state: string = "NSW"): string {
  const tradeContext = generateTradeContext(trade);
  const bestPractices = getBestPracticesForTrade(trade);
  
  // Get warranty info for statutory requirements
  const warrantyInfo = bestPractices[0]?.warrantyCoverage;
  
  return `
You are an expert Australian construction cost analyst specializing in ${trade} work.

TASK: Analyze the following ${trade} quote for pricing accuracy against 2024/2025 Australian market rates.

QUOTE CONTENT:
${quoteText}

${tradeContext}

STATE-SPECIFIC REQUIREMENTS (${state}):
- Contractor licence required for work >$5,000 (Home Building Act 1989)
- Maximum deposit: 10% of contract price
- HBC Insurance required for work >$20,000
- Written contract required for work >$5,000
${warrantyInfo ? `- Statutory warranty: ${warrantyInfo.statutoryRequirements}` : ""}

MARKET RATE REFERENCES (2024/2025):
${getMarketRateReferences(trade)}

ANALYSIS REQUIREMENTS:
1. Compare each line item against typical ${state} metro rates
2. Consider material costs from major Australian suppliers
3. Factor in licensed tradesperson labor rates
4. Account for reasonable profit margins (10-20%)
5. Flag items >15% above market rate
6. Check deposit does not exceed 10% of total
7. Verify contractor licence requirements are met

RESPONSE FORMAT: Return ONLY valid JSON matching this structure:
{
  "score": <0-100 overall pricing score>,
  "marketRate": <estimated fair total>,
  "quotedRate": <total from quote>,
  "variance": <percentage difference>,
  "confidence": "high" | "medium" | "low",
  "trade": "${trade}",
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
`;
}

/**
 * Enhanced materials analysis prompt with trade expertise
 */
export function enhancedMaterialsPrompt(quoteText: string, trade: TradeType): string {
  const tradeContext = generateTradeContext(trade);
  const bestPractices = getBestPracticesForTrade(trade);
  
  // Extract material standards from best practices
  const materialStandards = bestPractices
    .filter(bp => bp.category === "materials" || bp.category === "installation")
    .flatMap(bp => bp.standardReferences);
  
  return `
You are an expert in Australian building materials and ${trade} standards.

TASK: Analyze the materials specified in this ${trade} quote for quality and compliance.

QUOTE CONTENT:
${quoteText}

${tradeContext}

AUTHORITATIVE STANDARDS TO REFERENCE:
${getMaterialStandardsForTrade(trade)}

ANALYSIS REQUIREMENTS:
1. Check material specifications against relevant Australian Standards
2. Verify compliance with industry best practices
3. Assess material grades and specifications
4. Identify any substandard or non-compliant materials
5. Note supplier/manufacturer where mentioned
6. Check material compatibility requirements

RESPONSE FORMAT: Return ONLY valid JSON matching this structure:
{
  "score": <0-100 materials quality score>,
  "confidence": "high" | "medium" | "low",
  "trade": "${trade}",
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
`;
}

/**
 * Enhanced compliance analysis prompt with trade expertise
 */
export function enhancedCompliancePrompt(quoteText: string, trade: TradeType, state: string = "NSW"): string {
  const tradeContext = generateTradeContext(trade);
  const bestPractices = getBestPracticesForTrade(trade);
  
  // Extract compliance requirements
  const complianceReqs = bestPractices
    .filter(bp => bp.category === "compliance" || bp.category === "safety")
    .flatMap(bp => bp.requirements);
  
  return `
You are an expert in Australian building codes and ${trade} compliance.

TASK: Analyze this ${trade} quote for compliance with Australian building codes and safety standards.

QUOTE CONTENT:
${quoteText}

${tradeContext}

AUTHORITATIVE SOURCES TO REFERENCE:
${getComplianceSourcesForTrade(trade, state)}

STATE-SPECIFIC REQUIREMENTS (${state}):
${getStateSpecificRequirements(trade, state)}

ANALYSIS REQUIREMENTS:
1. Check against relevant Australian Standards for ${trade} work
2. Verify NCC 2022 requirements are addressed
3. Assess SafeWork ${state} safety compliance
4. Check for contractor licence number display
5. Verify written contract and insurance mentions for work >$20,000
6. Check trade-specific compliance requirements

RESPONSE FORMAT: Return ONLY valid JSON matching this structure:
{
  "score": <0-100 compliance score>,
  "confidence": "high" | "medium" | "low",
  "trade": "${trade}",
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
`;
}

/**
 * Enhanced warranty analysis prompt with trade expertise
 */
export function enhancedWarrantyPrompt(quoteText: string, trade: TradeType, state: string = "NSW"): string {
  const bestPractices = getBestPracticesForTrade(trade);
  const warrantyInfo = bestPractices[0]?.warrantyCoverage;
  
  return `
You are an expert in Australian construction warranties and consumer protection for ${trade} work.

TASK: Analyze the warranty terms in this ${trade} quote.

QUOTE CONTENT:
${quoteText}

AUTHORITATIVE SOURCES TO REFERENCE:
- Australian Consumer Law (Competition and Consumer Act 2010)
  * Consumer guarantees apply to all building services
  * Services must be provided with due care and skill
  * Services must be fit for purpose and completed in reasonable time

- ${state} Home Building Act - Statutory Warranties
${warrantyInfo ? `  * ${warrantyInfo.minimumPeriod} warranty period
  * Coverage: ${warrantyInfo.coverage.join(", ")}
  * Exclusions: ${warrantyInfo.exclusions.join(", ")}
  * ${warrantyInfo.statutoryRequirements}` : `  * 6-year warranty period for major defects
  * 2-year warranty period for other defects
  * Applies to all residential building work`}

${getWarrantyStandardsForTrade(trade)}

ANALYSIS REQUIREMENTS:
1. Identify workmanship warranty (compare to industry standard)
2. Identify material warranties from manufacturers
3. Check for HBC insurance-backed warranty mentions (required >$20,000)
4. Note any exclusions or conditions
5. Compare against Australian Consumer Law requirements
6. Check warranty registration requirements

RESPONSE FORMAT: Return ONLY valid JSON matching this structure:
{
  "score": <0-100 warranty score>,
  "confidence": "high" | "medium" | "low",
  "trade": "${trade}",
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
`;
}

/**
 * Helper functions for trade-specific references
 */
function getMarketRateReferences(trade: TradeType): string {
  const rates: Record<TradeType, string> = {
    electrical: `
- Licensed electrician rates: $80-120/hour (NSW Fair Work rates 2024)
- Switchboard upgrade: $1,500-3,500 depending on circuits
- RCD installation: $150-300 per device
- Power point installation: $150-250 per point
- Solar system: $4,000-10,000 for 6.6kW system installed`,
    
    plumbing: `
- Licensed plumber rates: $80-120/hour (NSW Fair Work rates 2024)
- Hot water system replacement: $1,500-3,500 installed
- Toilet replacement: $400-800 installed
- Tap replacement: $150-350 per tap
- Blocked drain clearing: $150-400`,
    
    roofing: `
- Colorbond roofing: $85-120/m² installed
- Guttering: $45-75/lm installed
- Ridge capping: $35-55/lm
- Licensed roof plumber rates: $65-95/hour
- Tile replacement: $50-80/m²`,
    
    building: `
- Licensed builder rates: $50-80/hour
- Timber framing: $45-75/m² (materials + labor)
- Deck construction: $300-600/m²
- Pergola: $250-500/m²`,
    
    carpentry: `
- Licensed carpenter rates: $50-75/hour
- Door installation: $200-400 per door
- Window installation: $300-600 per window
- Built-in wardrobe: $800-2,000/lm`,
    
    hvac: `
- Split system installation: $600-1,200 per unit
- Ducted system: $8,000-15,000 installed
- Service/maintenance: $150-300
- Refrigerant regas: $200-400`,
    
    painting: `
- Interior painting: $35-55/m²
- Exterior painting: $40-60/m²
- Licensed painter rates: $45-65/hour
- Ceiling painting: $15-25/m²`,
    
    tiling: `
- Floor tiling: $60-100/m² (including waterproofing)
- Wall tiling: $50-80/m²
- Waterproofing: $60-100/m²
- Licensed tiler rates: $50-70/hour`,
    
    concreting: `
- Concrete slab: $70-100/m²
- Driveway: $80-120/m²
- Footpath: $60-90/m²
- Licensed concreter rates: $50-70/hour`,
    
    landscaping: `
- Retaining wall: $250-500/m² (depending on height)
- Paving: $80-150/m²
- Turf laying: $25-45/m²
- Garden bed preparation: $50-80/m²`,
    
    glazing: `
- Window replacement: $300-800 per window
- Shower screen: $800-2,000
- Glass balustrade: $400-800/lm`,
    
    fencing: `
- Colorbond fencing: $80-120/lm
- Timber fencing: $100-180/lm
- Pool fencing: $200-400/lm`
  };
  
  return rates[trade] || rates.building;
}

function getMaterialStandardsForTrade(trade: TradeType): string {
  const standards: Record<TradeType, string> = {
    electrical: `
- AS/NZS 3000:2018 - Electrical Installations (Wiring Rules)
- AS/NZS 3008.1.1 - Cable selection
- AS/NZS 3017:2022 - Verification of electrical installations
- AS/NZS 61439 - Low-voltage switchgear assemblies`,
    
    plumbing: `
- AS/NZS 3500.1:2025 - Water services
- AS/NZS 3500.2:2021 - Sanitary plumbing and drainage
- AS/NZS 3500.4:2021 - Heated water services
- AS 3498 - Authorization of plumbing products`,
    
    roofing: `
- AS 1397:2021 - Steel sheet and strip (BMT requirements)
- AS 1562.1:2018 - Metal roof and wall cladding
- SA HB 39:2015 - Installation code for metal roofing
- AS/NZS 4200.1 - Sarking materials`,
    
    building: `
- AS 1684 Series - Residential timber-framed construction
- AS 3600:2018 - Concrete structures
- AS 4100:2020 - Steel structures
- AS 3700:2018 - Masonry structures`,
    
    carpentry: `
- AS 1684 Series - Residential timber-framed construction
- AS 1720.1 - Timber structures design methods
- AS/NZS 2269 - Plywood structural`,
    
    hvac: `
- AS/NZS 3823 - Air conditioners and heat pumps
- AS/NZS 60335.2.40 - Safety of household appliances
- AS 1668.2 - Mechanical ventilation`,
    
    painting: `
- AS/NZS 2311:2017 - Guide to painting of buildings
- AS/NZS 4361.1 - Guide to hazardous paint management`,
    
    tiling: `
- AS 3958.1:2007 - Ceramic tiles installation
- AS 3740:2021 - Waterproofing of domestic wet areas`,
    
    concreting: `
- AS 3600:2018 - Concrete structures
- AS 2870:2011 - Residential slabs and footings
- AS 1379 - Specification and supply of concrete`,
    
    landscaping: `
- AS 4419:2018 - Soils for landscaping
- AS 4678:2002 - Earth-retaining structures`,
    
    glazing: `
- AS 1288 - Glass in buildings
- AS 2047 - Windows and external glazed doors`,
    
    fencing: `
- AS 1926.1 - Swimming pool safety - Fencing
- AS/NZS 4687 - Temporary fencing`
  };
  
  return standards[trade] || standards.building;
}

function getComplianceSourcesForTrade(trade: TradeType, state: string): string {
  const baseCompliance = `
- NCC 2022 - National Construction Code
- ${state} Home Building Act
- SafeWork ${state} WHS Regulation
- Australian Consumer Law`;

  const tradeSpecific: Record<TradeType, string> = {
    electrical: `${baseCompliance}
- AS/NZS 3000:2018 Wiring Rules (mandatory)
- ${state} Electrical Safety Regulations
- Energy Safe Victoria / NSW Fair Trading electrical requirements`,
    
    plumbing: `${baseCompliance}
- Plumbing Code of Australia (PCA) 2022
- AS/NZS 3500 Series
- ${state} Plumbing Regulations`,
    
    roofing: `${baseCompliance}
- SA HB 39:2015 Installation Code
- AS 1562.1:2018 Metal roofing
- SafeWork ${state} Working at Heights Code`,
    
    building: `${baseCompliance}
- AS 1684 Timber Framing Code
- AS 3660.1 Termite management
- ${state} Building Regulations`,
    
    carpentry: `${baseCompliance}
- AS 1684 Timber Framing Code
- ${state} Building Regulations`,
    
    hvac: `${baseCompliance}
- AS/NZS 3823 Performance standards
- Refrigerant handling regulations
- ${state} noise regulations`,
    
    painting: `${baseCompliance}
- AS/NZS 2311:2017 Painting guide
- Lead paint regulations`,
    
    tiling: `${baseCompliance}
- AS 3958.1 Tiling installation
- AS 3740 Waterproofing requirements`,
    
    concreting: `${baseCompliance}
- AS 3600 Concrete structures
- AS 2870 Residential slabs`,
    
    landscaping: `${baseCompliance}
- AS 4678 Retaining structures
- Local council requirements`,
    
    glazing: `${baseCompliance}
- AS 1288 Glass in buildings
- AS 2047 Windows and doors`,
    
    fencing: `${baseCompliance}
- AS 1926.1 Pool fencing
- Local council requirements`
  };
  
  return tradeSpecific[trade] || baseCompliance;
}

function getStateSpecificRequirements(trade: TradeType, state: string): string {
  // Common requirements across states
  const common = `
- Contractor licence required for work >$5,000
- Written contract required for work >$5,000
- HBC Insurance required for work >$20,000
- Maximum deposit: 10% of contract price`;

  // State-specific additions
  const stateReqs: Record<string, string> = {
    NSW: `${common}
- Certificate of Compliance required (electrical/plumbing)
- Building Commission NSW oversight
- Fair Trading complaints process`,
    
    VIC: `${common}
- Victorian Building Authority (VBA) registration
- Plumbing inspection requirements
- Energy Safe Victoria for electrical`,
    
    QLD: `${common}
- QBCC licence requirements
- Form 4 completion certificate
- Pool safety requirements`,
    
    SA: `${common}
- Consumer and Business Services oversight
- Building Rules Consent requirements`,
    
    WA: `${common}
- Building Commission WA oversight
- 6-year responsibility period for plumbing`,
    
    TAS: `${common}
- Consumer, Building and Occupational Services
- Building permit requirements`,
    
    NT: `${common}
- NT Building Advisory Services
- Building certification requirements`,
    
    ACT: `${common}
- Access Canberra oversight
- Building approval requirements`
  };
  
  return stateReqs[state] || stateReqs.NSW;
}

function getWarrantyStandardsForTrade(trade: TradeType): string {
  const warranties: Record<TradeType, string> = {
    electrical: `
- Workmanship warranty: 6 years (statutory)
- Switchboard components: 2-5 years manufacturer
- Solar inverter: 5-10 years manufacturer
- Solar panels: 25 years performance warranty`,
    
    plumbing: `
- Workmanship warranty: 6 years (statutory)
- Hot water system: 5-10 years manufacturer
- Tapware: 5-10 years manufacturer
- Pipes and fittings: 25+ years typical`,
    
    roofing: `
- Workmanship warranty: 6 years (statutory)
- Colorbond: 10yr perforation, 15yr peeling/flaking
- Roof tiles: 50+ years manufacturer
- Guttering: 10-15 years`,
    
    building: `
- Structural warranty: 6 years (statutory)
- Non-structural: 2 years (statutory)
- Timber treatment: 25 years typical`,
    
    carpentry: `
- Workmanship warranty: 6 years structural
- Non-structural: 2 years
- Timber products: varies by manufacturer`,
    
    hvac: `
- Workmanship warranty: 1-2 years typical
- Compressor: 5-10 years manufacturer
- Parts: 5 years typical`,
    
    painting: `
- Workmanship warranty: 2 years (statutory)
- Paint products: 10-15 years manufacturer`,
    
    tiling: `
- Workmanship warranty: 6 years (includes waterproofing)
- Tiles: 10+ years manufacturer`,
    
    concreting: `
- Structural warranty: 6 years (statutory)
- Surface finish: 2 years typical`,
    
    landscaping: `
- Retaining walls: 6 years if structural
- Plants: 3-12 months establishment
- Paving: 5-10 years typical`,
    
    glazing: `
- Workmanship: 2-5 years typical
- Glass: 5-10 years manufacturer`,
    
    fencing: `
- Workmanship: 5-10 years typical
- Colorbond: 10-15 years manufacturer`
  };
  
  return warranties[trade] || warranties.building;
}

/**
 * Export enhanced prompt generators
 */
export const ENHANCED_PROMPTS = {
  pricing: enhancedPricingPrompt,
  materials: enhancedMaterialsPrompt,
  compliance: enhancedCompliancePrompt,
  warranty: enhancedWarrantyPrompt,
  detectTrade: detectTradeFromQuote,
  getTradeContext: generateTradeContext
};
