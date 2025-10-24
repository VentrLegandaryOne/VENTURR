/**
 * Labor Pricing Knowledge Base for Australian Roofing Industry
 * Optimized for Colorbond Metal Roofing on East Coast
 * 
 * Data sources:
 * - PayScale Australia 2025
 * - Indeed Australia 2025
 * - NSW WorkCover 2025-26
 * - Queensland WorkCover 2025-26
 * - Victoria WorkSafe 2025-26
 * - ATO Superannuation Guarantee 2025-26
 */

export interface SkillLevel {
  id: string;
  name: string;
  description: string;
  baseHourlyRate: number; // AUD per hour
  experienceYears: string;
  percentile: string; // e.g., "10th", "50th", "90th"
}

export interface RegionalAdjustment {
  region: string;
  state: string;
  adjustmentPercentage: number; // Percentage to adjust base rate
  costOfLiving: 'low' | 'medium' | 'high' | 'very-high';
}

export interface OnCost {
  id: string;
  name: string;
  description: string;
  rate: number; // Percentage or fixed amount
  type: 'percentage' | 'fixed';
  applicableStates?: string[]; // If specific to certain states
  mandatory: boolean;
}

export interface CrewComposition {
  id: string;
  name: string;
  description: string;
  suitableFor: string[];
  skillLevels: {
    skillLevelId: string;
    quantity: number;
  }[];
  efficiencyMultiplier: number; // Relative to standard 2-person crew
  minimumRoofArea: number; // m²
  maximumRoofArea: number; // m²
  // Specialized crew fields (optional)
  specialization?: 'reroofing' | 'repairs' | 'commercial' | 'heritage' | 'emergency';
  removalEfficiencyBonus?: number;
  diagnosticTimeMultiplier?: number;
  safetyComplianceLevel?: string;
  precisionMultiplier?: number;
  calloutFee?: number;
  afterHoursMultiplier?: number;
  weekendMultiplier?: number;
  notes?: string;
}

export interface InstallationTimeEstimate {
  roofComplexity: 'simple' | 'standard' | 'complex' | 'very-complex';
  baseHoursPerSqm: number;
  pitchMultipliers: {
    low: number; // 0-15°
    moderate: number; // 15-30°
    steep: number; // 30-45°
    verySteep: number; // 45°+
  };
  complexityMultipliers: {
    simpleRectangular: number;
    fewValleys: number; // 1-2
    moderateValleys: number; // 3-5
    manyValleys: number; // 6+
  };
}

// ============================================================================
// SKILL LEVELS - Based on PayScale Australia 2025 Data
// ============================================================================

export const SKILL_LEVELS: SkillLevel[] = [
  {
    id: 'apprentice',
    name: 'Apprentice',
    description: 'Entry-level roofer with less than 1 year experience',
    baseHourlyRate: 22.00, // Conservative estimate based on 10th percentile
    experienceYears: '<1 year',
    percentile: '10th'
  },
  {
    id: 'junior-tradesperson',
    name: 'Junior Tradesperson',
    description: 'Early career roofer with 1-4 years experience',
    baseHourlyRate: 26.00, // Based on PayScale early career data
    experienceYears: '1-4 years',
    percentile: '25th'
  },
  {
    id: 'tradesperson',
    name: 'Qualified Tradesperson',
    description: 'Mid-career roofer with 5-9 years experience',
    baseHourlyRate: 32.00, // Based on PayScale mid-career estimate
    experienceYears: '5-9 years',
    percentile: '50th (Median)'
  },
  {
    id: 'senior-tradesperson',
    name: 'Senior Tradesperson',
    description: 'Experienced roofer with 10-19 years experience',
    baseHourlyRate: 38.00, // Based on PayScale experienced estimate
    experienceYears: '10-19 years',
    percentile: '75th'
  },
  {
    id: 'supervisor',
    name: 'Supervisor/Foreman',
    description: 'Lead roofer with 20+ years experience, manages crews',
    baseHourlyRate: 45.00, // Based on SEEK salary data upper range
    experienceYears: '20+ years',
    percentile: '90th'
  }
];

// ============================================================================
// REGIONAL ADJUSTMENTS - East Coast Focus
// ============================================================================

export const REGIONAL_ADJUSTMENTS: RegionalAdjustment[] = [
  // New South Wales
  {
    region: 'Sydney Metro',
    state: 'NSW',
    adjustmentPercentage: 15, // Sydney premium
    costOfLiving: 'very-high'
  },
  {
    region: 'Newcastle',
    state: 'NSW',
    adjustmentPercentage: 5,
    costOfLiving: 'medium'
  },
  {
    region: 'Wollongong',
    state: 'NSW',
    adjustmentPercentage: 8,
    costOfLiving: 'high'
  },
  {
    region: 'Central Coast',
    state: 'NSW',
    adjustmentPercentage: 10,
    costOfLiving: 'high'
  },
  {
    region: 'Regional NSW',
    state: 'NSW',
    adjustmentPercentage: 0, // Baseline
    costOfLiving: 'medium'
  },
  
  // Queensland
  {
    region: 'Brisbane Metro',
    state: 'QLD',
    adjustmentPercentage: 10,
    costOfLiving: 'high'
  },
  {
    region: 'Gold Coast',
    state: 'QLD',
    adjustmentPercentage: 12,
    costOfLiving: 'high'
  },
  {
    region: 'Sunshine Coast',
    state: 'QLD',
    adjustmentPercentage: 8,
    costOfLiving: 'medium'
  },
  {
    region: 'Regional QLD',
    state: 'QLD',
    adjustmentPercentage: -5, // Lower than baseline
    costOfLiving: 'low'
  },
  
  // Victoria
  {
    region: 'Melbourne Metro',
    state: 'VIC',
    adjustmentPercentage: 12,
    costOfLiving: 'very-high'
  },
  {
    region: 'Geelong',
    state: 'VIC',
    adjustmentPercentage: 5,
    costOfLiving: 'medium'
  },
  {
    region: 'Regional VIC',
    state: 'VIC',
    adjustmentPercentage: 0,
    costOfLiving: 'medium'
  }
];

// ============================================================================
// ON-COSTS - Taxes and Insurance (2025-26 Rates)
// ============================================================================

export const ON_COSTS: OnCost[] = [
  {
    id: 'superannuation',
    name: 'Superannuation Guarantee',
    description: 'Mandatory employer contribution to super (from 1 July 2025)',
    rate: 12.0, // 12% from 1 July 2025
    type: 'percentage',
    mandatory: true
  },
  {
    id: 'workcover-nsw',
    name: 'WorkCover NSW',
    description: 'Workers compensation insurance for roofing services in NSW',
    rate: 10.81, // 10.700% + 0.110% dust disease
    type: 'percentage',
    applicableStates: ['NSW'],
    mandatory: true
  },
  {
    id: 'workcover-qld',
    name: 'WorkCover Queensland',
    description: 'Workers compensation insurance for roofing services in QLD',
    rate: 4.5, // Estimated for roofing (higher than average 1.343%)
    type: 'percentage',
    applicableStates: ['QLD'],
    mandatory: true
  },
  {
    id: 'workcover-vic',
    name: 'WorkSafe Victoria',
    description: 'Workers compensation insurance for roofing services in VIC',
    rate: 7.0, // Estimated based on historical 5.478-8.073% range
    type: 'percentage',
    applicableStates: ['VIC'],
    mandatory: true
  },
  {
    id: 'public-liability',
    name: 'Public Liability Insurance',
    description: 'Insurance for third-party injury or property damage',
    rate: 2.5, // Typical allocation per labor hour
    type: 'percentage',
    mandatory: true
  },
  {
    id: 'tools-equipment',
    name: 'Tools & Equipment',
    description: 'Depreciation and maintenance of tools and equipment',
    rate: 3.0,
    type: 'percentage',
    mandatory: false
  },
  {
    id: 'ppe-safety',
    name: 'PPE & Safety Equipment',
    description: 'Personal protective equipment and safety gear',
    rate: 2.0,
    type: 'percentage',
    mandatory: true
  },
  {
    id: 'vehicle-costs',
    name: 'Vehicle Costs',
    description: 'Vehicle depreciation, fuel, and maintenance',
    rate: 4.0,
    type: 'percentage',
    mandatory: false
  },
  {
    id: 'administration',
    name: 'Administration Overhead',
    description: 'Office costs, accounting, management',
    rate: 5.0,
    type: 'percentage',
    mandatory: false
  }
];

// ============================================================================
// CREW COMPOSITIONS
// ============================================================================

export const CREW_COMPOSITIONS: CrewComposition[] = [
  {
    id: 'apprentice-duo',
    name: 'Apprentice Duo (Budget)',
    description: '1 qualified tradesperson + 1 apprentice',
    suitableFor: ['Simple residential jobs under 100m²', 'Budget-conscious clients'],
    skillLevels: [
      { skillLevelId: 'tradesperson', quantity: 1 },
      { skillLevelId: 'apprentice', quantity: 1 }
    ],
    efficiencyMultiplier: 0.8,
    minimumRoofArea: 0,
    maximumRoofArea: 100
  },
  {
    id: 'standard-crew',
    name: 'Standard Crew',
    description: '2 qualified tradespeople',
    suitableFor: ['Most residential jobs 100-200m²', 'Standard complexity'],
    skillLevels: [
      { skillLevelId: 'tradesperson', quantity: 2 }
    ],
    efficiencyMultiplier: 1.0,
    minimumRoofArea: 50,
    maximumRoofArea: 200
  },
  {
    id: 'enhanced-crew',
    name: 'Enhanced Crew (Faster)',
    description: '1 senior tradesperson + 2 qualified tradespeople',
    suitableFor: ['Larger residential 200-300m²', 'Faster completion required'],
    skillLevels: [
      { skillLevelId: 'senior-tradesperson', quantity: 1 },
      { skillLevelId: 'tradesperson', quantity: 2 }
    ],
    efficiencyMultiplier: 1.4,
    minimumRoofArea: 150,
    maximumRoofArea: 300
  },
  {
    id: 'premium-crew',
    name: 'Premium Crew (Complex)',
    description: '1 supervisor + 3 qualified tradespeople',
    suitableFor: ['Complex residential', 'Multi-level homes', 'Small commercial'],
    skillLevels: [
      { skillLevelId: 'supervisor', quantity: 1 },
      { skillLevelId: 'tradesperson', quantity: 3 }
    ],
    efficiencyMultiplier: 1.8,
    minimumRoofArea: 200,
    maximumRoofArea: 500
  },
  {
    id: 'commercial-crew',
    name: 'Commercial Crew',
    description: '1 supervisor + 4 qualified + 1 apprentice',
    suitableFor: ['Large commercial projects', 'Industrial buildings'],
    skillLevels: [
      { skillLevelId: 'supervisor', quantity: 1 },
      { skillLevelId: 'tradesperson', quantity: 4 },
      { skillLevelId: 'apprentice', quantity: 1 }
    ],
    efficiencyMultiplier: 2.5,
    minimumRoofArea: 400,
    maximumRoofArea: 10000
  }
];

// ============================================================================
// INSTALLATION TIME ESTIMATES
// ============================================================================

export const INSTALLATION_TIME_ESTIMATES: Record<string, InstallationTimeEstimate> = {
  simple: {
    roofComplexity: 'simple',
    baseHoursPerSqm: 0.30, // 0.25-0.35 hours per m²
    pitchMultipliers: {
      low: 1.0,
      moderate: 1.15,
      steep: 1.35,
      verySteep: 1.6
    },
    complexityMultipliers: {
      simpleRectangular: 1.0,
      fewValleys: 1.05,
      moderateValleys: 1.1,
      manyValleys: 1.2
    }
  },
  standard: {
    roofComplexity: 'standard',
    baseHoursPerSqm: 0.425, // 0.35-0.50 hours per m²
    pitchMultipliers: {
      low: 1.0,
      moderate: 1.15,
      steep: 1.35,
      verySteep: 1.6
    },
    complexityMultipliers: {
      simpleRectangular: 1.0,
      fewValleys: 1.1,
      moderateValleys: 1.25,
      manyValleys: 1.5
    }
  },
  complex: {
    roofComplexity: 'complex',
    baseHoursPerSqm: 0.625, // 0.50-0.75 hours per m²
    pitchMultipliers: {
      low: 1.0,
      moderate: 1.15,
      steep: 1.35,
      verySteep: 1.6
    },
    complexityMultipliers: {
      simpleRectangular: 1.0,
      fewValleys: 1.15,
      moderateValleys: 1.35,
      manyValleys: 1.7
    }
  },
  'very-complex': {
    roofComplexity: 'very-complex',
    baseHoursPerSqm: 1.0, // 0.75-1.25 hours per m²
    pitchMultipliers: {
      low: 1.0,
      moderate: 1.15,
      steep: 1.35,
      verySteep: 1.6
    },
    complexityMultipliers: {
      simpleRectangular: 1.0,
      fewValleys: 1.2,
      moderateValleys: 1.5,
      manyValleys: 2.0
    }
  }
};

// ============================================================================
// CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculate the adjusted hourly rate for a skill level in a specific region
 */
export function calculateAdjustedRate(
  skillLevel: SkillLevel,
  region: RegionalAdjustment
): number {
  const adjustment = 1 + (region.adjustmentPercentage / 100);
  return skillLevel.baseHourlyRate * adjustment;
}

/**
 * Calculate total on-costs for a given state
 */
export function calculateOnCosts(
  baseWage: number,
  state: string,
  includeOptional: boolean = true
): {
  totalOnCostRate: number;
  breakdown: { name: string; amount: number }[];
} {
  let totalRate = 0;
  const breakdown: { name: string; amount: number }[] = [];

  ON_COSTS.forEach(onCost => {
    // Skip if not applicable to this state
    if (onCost.applicableStates && !onCost.applicableStates.includes(state)) {
      return;
    }
    
    // Skip optional costs if not included
    if (!onCost.mandatory && !includeOptional) {
      return;
    }

    const amount = (baseWage * onCost.rate) / 100;
    totalRate += onCost.rate;
    breakdown.push({
      name: onCost.name,
      amount: amount
    });
  });

  return {
    totalOnCostRate: totalRate,
    breakdown
  };
}

/**
 * Calculate total crew hourly cost
 */
export function calculateCrewHourlyCost(
  crew: CrewComposition,
  region: RegionalAdjustment,
  includeOptionalOnCosts: boolean = true
): {
  totalHourlyRate: number;
  breakdown: {
    skillLevel: string;
    quantity: number;
    baseRate: number;
    adjustedRate: number;
    subtotal: number;
  }[];
  onCosts: {
    totalOnCostRate: number;
    breakdown: { name: string; amount: number }[];
  };
  totalWithOnCosts: number;
} {
  let totalHourlyRate = 0;
  const breakdown: {
    skillLevel: string;
    quantity: number;
    baseRate: number;
    adjustedRate: number;
    subtotal: number;
  }[] = [];

  crew.skillLevels.forEach(({ skillLevelId, quantity }) => {
    const skillLevel = SKILL_LEVELS.find(sl => sl.id === skillLevelId);
    if (!skillLevel) return;

    const adjustedRate = calculateAdjustedRate(skillLevel, region);
    const subtotal = adjustedRate * quantity;
    totalHourlyRate += subtotal;

    breakdown.push({
      skillLevel: skillLevel.name,
      quantity,
      baseRate: skillLevel.baseHourlyRate,
      adjustedRate,
      subtotal
    });
  });

  const onCosts = calculateOnCosts(totalHourlyRate, region.state, includeOptionalOnCosts);
  const totalOnCostAmount = (totalHourlyRate * onCosts.totalOnCostRate) / 100;
  const totalWithOnCosts = totalHourlyRate + totalOnCostAmount;

  return {
    totalHourlyRate,
    breakdown,
    onCosts,
    totalWithOnCosts
  };
}

/**
 * Calculate total labor hours for a roofing job
 */
export function calculateLaborHours(
  roofArea: number,
  complexity: 'simple' | 'standard' | 'complex' | 'very-complex',
  pitch: 'low' | 'moderate' | 'steep' | 'verySteep',
  valleyCount: number,
  crew: CrewComposition
): {
  baseHours: number;
  adjustedHours: number;
  daysRequired: number;
} {
  const estimate = INSTALLATION_TIME_ESTIMATES[complexity];
  
  // Determine complexity multiplier based on valley count
  let complexityMultiplier = estimate.complexityMultipliers.simpleRectangular;
  if (valleyCount >= 6) {
    complexityMultiplier = estimate.complexityMultipliers.manyValleys;
  } else if (valleyCount >= 3) {
    complexityMultiplier = estimate.complexityMultipliers.moderateValleys;
  } else if (valleyCount >= 1) {
    complexityMultiplier = estimate.complexityMultipliers.fewValleys;
  }

  const pitchMultiplier = estimate.pitchMultipliers[pitch];
  
  // Calculate base hours (for a standard 2-person crew)
  const baseHours = roofArea * estimate.baseHoursPerSqm * pitchMultiplier * complexityMultiplier;
  
  // Adjust for crew efficiency
  const adjustedHours = baseHours / crew.efficiencyMultiplier;
  
  // Calculate days required (assuming 8-hour workdays)
  const daysRequired = Math.ceil(adjustedHours / 8);

  return {
    baseHours,
    adjustedHours,
    daysRequired
  };
}

/**
 * Calculate total labor cost for a roofing job
 */
export function calculateTotalLaborCost(
  roofArea: number,
  complexity: 'simple' | 'standard' | 'complex' | 'very-complex',
  pitch: 'low' | 'moderate' | 'steep' | 'verySteep',
  valleyCount: number,
  crewId: string,
  regionName: string,
  includeOptionalOnCosts: boolean = true,
  materialType: string = 'colorbond-metal',
  removalType: string = 'none',
  season: string = 'summer'
): {
  crew: CrewComposition;
  region: RegionalAdjustment;
  laborHours: ReturnType<typeof calculateLaborHours>;
  crewCost: ReturnType<typeof calculateCrewHourlyCost>;
  totalLaborCost: number;
  costPerSqm: number;
  installationHours: number;
  removalHours: number;
  weatherDelayDays: number;
  totalDaysWithWeather: number;
} | null {
  const crew = CREW_COMPOSITIONS.find(c => c.id === crewId);
  const region = REGIONAL_ADJUSTMENTS.find(r => r.region === regionName);

  if (!crew || !region) {
    return null;
  }

  // Calculate base labor hours
  const laborHours = calculateLaborHours(roofArea, complexity, pitch, valleyCount, crew);
  
  // Apply material-specific multiplier
  const materialMultiplier = MATERIAL_LABOR_MULTIPLIERS.find(m => m.materialType === materialType)?.multiplier || 1.0;
  const materialAdjustedHours = laborHours.baseHours * materialMultiplier;
  
  // Calculate removal hours
  const removalHours = calculateRemovalHours(roofArea, removalType);
  
  // Total installation + removal hours
  const totalHours = materialAdjustedHours + removalHours;
  
  // Adjust for crew efficiency
  const adjustedHours = totalHours / crew.efficiencyMultiplier;
  
  // Calculate days
  const baseDays = Math.ceil(adjustedHours / 8);
  
  // Apply weather delay
  const weatherDelay = calculateWeatherDelayDays(baseDays, season);
  
  // Calculate costs
  const crewCost = calculateCrewHourlyCost(crew, region, includeOptionalOnCosts);
  const totalLaborCost = crewCost.totalWithOnCosts * adjustedHours;
  const costPerSqm = totalLaborCost / roofArea;

  return {
    crew,
    region,
    laborHours: {
      ...laborHours,
      adjustedHours: adjustedHours,
      daysRequired: weatherDelay.adjustedDays
    },
    crewCost,
    totalLaborCost,
    costPerSqm,
    installationHours: materialAdjustedHours,
    removalHours,
    weatherDelayDays: weatherDelay.delayDays,
    totalDaysWithWeather: weatherDelay.adjustedDays
  };
}

/**
 * Recommend optimal crew for a job
 */
export function recommendCrew(
  roofArea: number,
  complexity: 'simple' | 'standard' | 'complex' | 'very-complex'
): CrewComposition {
  // Filter crews suitable for the roof area
  const suitableCrews = CREW_COMPOSITIONS.filter(
    crew => roofArea >= crew.minimumRoofArea && roofArea <= crew.maximumRoofArea
  );

  if (suitableCrews.length === 0) {
    // Default to standard crew if no perfect match
    return CREW_COMPOSITIONS.find(c => c.id === 'standard-crew')!;
  }

  // For simple jobs, prefer smaller crews
  if (complexity === 'simple') {
    return suitableCrews[0]; // Smallest suitable crew
  }

  // For complex jobs, prefer larger crews
  if (complexity === 'complex' || complexity === 'very-complex') {
    return suitableCrews[suitableCrews.length - 1]; // Largest suitable crew
  }

  // For standard complexity, use middle option
  return suitableCrews[Math.floor(suitableCrews.length / 2)];
}




// ============================================================================
// MATERIAL-SPECIFIC LABOR MULTIPLIERS
// ============================================================================

export interface MaterialLaborMultiplier {
  materialType: string;
  multiplier: number;
  description: string;
  considerations: string[];
}

export const MATERIAL_LABOR_MULTIPLIERS: MaterialLaborMultiplier[] = [
  {
    materialType: 'colorbond-metal',
    multiplier: 1.0,
    description: 'Colorbond/Metal roofing (baseline)',
    considerations: [
      'Lightest material, easiest to handle',
      'Large sheets cover area quickly',
      'Fastest installation time',
      'Standard for Australian residential'
    ]
  },
  {
    materialType: 'concrete-tile',
    multiplier: 2.5,
    description: 'Concrete tile roofing',
    considerations: [
      'Much heavier than metal',
      'Individual tiles placed one by one',
      'May require structural reinforcement',
      'Slower installation process'
    ]
  },
  {
    materialType: 'terracotta-tile',
    multiplier: 2.8,
    description: 'Terracotta tile roofing',
    considerations: [
      'Heavier and more fragile than concrete',
      'Requires more careful handling',
      'Premium material with longer install time',
      'Higher skill level recommended'
    ]
  },
  {
    materialType: 'slate',
    multiplier: 3.0,
    description: 'Slate roofing',
    considerations: [
      'Heaviest roofing material',
      'Requires specialized skills',
      'Very time-consuming installation',
      'Premium pricing justified'
    ]
  },
  {
    materialType: 'custom-specialty',
    multiplier: 2.5,
    description: 'Custom or specialty roofing',
    considerations: [
      'Varies by specific material',
      'May require specialized training',
      'Custom fabrication often needed',
      'Multiplier range: 2.0-4.0x'
    ]
  }
];

// ============================================================================
// REMOVAL/DEMOLITION TIME ESTIMATES
// ============================================================================

export interface RemovalEstimate {
  removalType: string;
  hoursPerSqm: number;
  description: string;
  additionalCosts?: string[];
  requiresLicense?: boolean;
}

export const REMOVAL_ESTIMATES: RemovalEstimate[] = [
  {
    removalType: 'none',
    hoursPerSqm: 0,
    description: 'New construction (no removal required)'
  },
  {
    removalType: 'metal-simple',
    hoursPerSqm: 0.15,
    description: 'Simple metal roof removal (single layer)',
    additionalCosts: ['Disposal fees', 'Skip bin hire']
  },
  {
    removalType: 'metal-complex',
    hoursPerSqm: 0.25,
    description: 'Complex metal roof removal (multiple layers)',
    additionalCosts: ['Disposal fees', 'Skip bin hire', 'Additional labor']
  },
  {
    removalType: 'metal-with-battens',
    hoursPerSqm: 0.35,
    description: 'Metal roof removal with batten replacement',
    additionalCosts: ['Disposal fees', 'Skip bin hire', 'New batten materials']
  },
  {
    removalType: 'concrete-tile',
    hoursPerSqm: 0.30,
    description: 'Concrete tile roof removal',
    additionalCosts: ['Heavy disposal fees', 'Large skip bins', 'Additional labor for weight']
  },
  {
    removalType: 'terracotta-tile',
    hoursPerSqm: 0.35,
    description: 'Terracotta tile roof removal',
    additionalCosts: ['Heavy disposal fees', 'Large skip bins', 'Careful handling required']
  },
  {
    removalType: 'tile-with-battens',
    hoursPerSqm: 0.45,
    description: 'Tile roof removal with batten replacement',
    additionalCosts: ['Heavy disposal fees', 'Large skip bins', 'New batten materials', 'Structural inspection']
  },
  {
    removalType: 'asbestos',
    hoursPerSqm: 0.65,
    description: 'Asbestos roof removal (licensed contractor required)',
    additionalCosts: [
      'Licensed asbestos removal contractor',
      'Specialized disposal fees (high cost)',
      'WorkSafe notification and compliance',
      'Air monitoring',
      'Decontamination procedures'
    ],
    requiresLicense: true
  },
  {
    removalType: 'batten-only',
    hoursPerSqm: 0.10,
    description: 'Batten replacement only (add to other removal types)'
  }
];

// ============================================================================
// WEATHER DELAY FACTORS
// ============================================================================

export interface WeatherDelayFactor {
  season: string;
  months: string;
  delayPercentage: number;
  description: string;
  riskFactors: string[];
}

export const WEATHER_DELAY_FACTORS: WeatherDelayFactor[] = [
  {
    season: 'summer',
    months: 'December - February',
    delayPercentage: 7.5,
    description: 'Best conditions for roofing work',
    riskFactors: [
      'Minimal rain delays',
      'Occasional extreme heat (35°C+) may slow work',
      'Storm risk in late summer',
      'Generally optimal conditions'
    ]
  },
  {
    season: 'autumn',
    months: 'March - May',
    delayPercentage: 12.5,
    description: 'Good conditions with moderate rain risk',
    riskFactors: [
      'Increasing rainfall toward winter',
      'Mild temperatures ideal for work',
      'Occasional strong winds',
      'Generally reliable weather'
    ]
  },
  {
    season: 'winter',
    months: 'June - August',
    delayPercentage: 25.0,
    description: 'Highest risk period for delays',
    riskFactors: [
      'Frequent rain and wet conditions',
      'Shorter daylight hours',
      'Strong winds common',
      'Highest delay risk of year',
      'May require weather contingency planning'
    ]
  },
  {
    season: 'spring',
    months: 'September - November',
    delayPercentage: 17.5,
    description: 'Variable conditions with moderate risk',
    riskFactors: [
      'Unpredictable weather patterns',
      'Storm season beginning',
      'Strong winds possible',
      'Improving conditions toward summer'
    ]
  }
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate material-specific labor hours
 */
export function calculateMaterialLaborHours(
  baseHours: number,
  materialType: string
): number {
  const multiplier = MATERIAL_LABOR_MULTIPLIERS.find(
    m => m.materialType === materialType
  )?.multiplier || 1.0;
  
  return baseHours * multiplier;
}

/**
 * Calculate removal/demolition hours
 */
export function calculateRemovalHours(
  roofArea: number,
  removalType: string
): number {
  const estimate = REMOVAL_ESTIMATES.find(
    r => r.removalType === removalType
  );
  
  if (!estimate) return 0;
  
  return roofArea * estimate.hoursPerSqm;
}

/**
 * Calculate weather delay buffer
 */
export function calculateWeatherDelayDays(
  baseDays: number,
  season: string
): { adjustedDays: number; delayDays: number; delayPercentage: number } {
  const weatherFactor = WEATHER_DELAY_FACTORS.find(
    w => w.season.toLowerCase() === season.toLowerCase()
  );
  
  if (!weatherFactor) {
    return {
      adjustedDays: baseDays,
      delayDays: 0,
      delayPercentage: 0
    };
  }
  
  const delayDays = Math.ceil(baseDays * (weatherFactor.delayPercentage / 100));
  const adjustedDays = baseDays + delayDays;
  
  return {
    adjustedDays,
    delayDays,
    delayPercentage: weatherFactor.delayPercentage
  };
}

/**
 * Get current season based on month
 */
export function getCurrentSeason(month?: number): string {
  const currentMonth = month || new Date().getMonth() + 1; // 1-12
  
  if (currentMonth >= 12 || currentMonth <= 2) return 'summer';
  if (currentMonth >= 3 && currentMonth <= 5) return 'autumn';
  if (currentMonth >= 6 && currentMonth <= 8) return 'winter';
  if (currentMonth >= 9 && currentMonth <= 11) return 'spring';
  
  return 'summer'; // Default
}

/**
 * Calculate total labor cost with all factors
 */
export function calculateComprehensiveLaborCost(params: {
  roofArea: number;
  baseHoursPerSqm: number;
  materialType: string;
  removalType: string;
  season: string;
  crewCompositionId: string;
  regionState: string;
  includeOptionalCosts: boolean;
}): {
  installationHours: number;
  removalHours: number;
  totalHours: number;
  baseDays: number;
  weatherDelayDays: number;
  totalDays: number;
  laborCost: number;
  breakdown: any;
} {
  // Calculate installation hours with material multiplier
  const baseInstallHours = params.roofArea * params.baseHoursPerSqm;
  const installationHours = calculateMaterialLaborHours(
    baseInstallHours,
    params.materialType
  );
  
  // Calculate removal hours
  const removalHours = calculateRemovalHours(
    params.roofArea,
    params.removalType
  );
  
  // Total hours
  const totalHours = installationHours + removalHours;
  
  // Get crew composition
  const crew = CREW_COMPOSITIONS.find(c => c.id === params.crewCompositionId);
  if (!crew) {
    throw new Error('Invalid crew composition');
  }
  
  // Adjust for crew efficiency
  const adjustedHours = totalHours / crew.efficiencyMultiplier;
  
  // Calculate days (8 hour workday)
  const baseDays = Math.ceil(adjustedHours / 8);
  
  // Add weather delay
  const weatherDelay = calculateWeatherDelayDays(baseDays, params.season);
  
  // Calculate labor cost (simplified - would need full crew rate calculation)
  const laborCost = adjustedHours * 100; // Placeholder
  
  return {
    installationHours,
    removalHours,
    totalHours: adjustedHours,
    baseDays,
    weatherDelayDays: weatherDelay.delayDays,
    totalDays: weatherDelay.adjustedDays,
    laborCost,
    breakdown: {
      materialMultiplier: MATERIAL_LABOR_MULTIPLIERS.find(
        m => m.materialType === params.materialType
      )?.multiplier || 1.0,
      removalRate: REMOVAL_ESTIMATES.find(
        r => r.removalType === params.removalType
      )?.hoursPerSqm || 0,
      weatherDelayPercentage: weatherDelay.delayPercentage,
      crewEfficiency: crew.efficiencyMultiplier
    }
  };
}




// ============================================================================
// SPECIALIZED CREW SCENARIOS
// ============================================================================

export const SPECIALIZED_CREWS: CrewComposition[] = [
  {
    id: 'reroofing-specialist',
    name: 'Re-Roofing Specialist',
    description: '1 supervisor + 2 qualified + 1 laborer (removal specialist)',
    suitableFor: ['Re-roofing projects with removal', 'Tile to metal conversions', 'Asbestos removal coordination'],
    skillLevels: [
      { skillLevelId: 'supervisor', quantity: 1 },
      { skillLevelId: 'tradesperson', quantity: 2 },
      { skillLevelId: 'apprentice', quantity: 1 } // Acts as removal specialist/laborer
    ],
    efficiencyMultiplier: 1.6,
    minimumRoofArea: 80,
    maximumRoofArea: 350,
    specialization: 'reroofing',
    removalEfficiencyBonus: 1.3, // 30% faster at removal tasks
    notes: 'Optimized for projects requiring old roof removal. Includes waste management expertise.'
  },
  {
    id: 'repair-maintenance',
    name: 'Repair & Maintenance',
    description: '1 senior tradesperson + 1 qualified',
    suitableFor: ['Leak repairs', 'Flashing replacement', 'Gutter maintenance', 'Storm damage repairs'],
    skillLevels: [
      { skillLevelId: 'senior-tradesperson', quantity: 1 },
      { skillLevelId: 'tradesperson', quantity: 1 }
    ],
    efficiencyMultiplier: 1.2,
    minimumRoofArea: 0,
    maximumRoofArea: 100,
    specialization: 'repairs',
    diagnosticTimeMultiplier: 1.5, // Extra time for problem diagnosis
    notes: 'Highly skilled crew for diagnostic work and precision repairs. Mobile service ready.'
  },
  {
    id: 'commercial-large',
    name: 'Commercial Large-Scale',
    description: '2 supervisors + 6 qualified + 2 apprentices',
    suitableFor: ['Large commercial buildings', 'Industrial warehouses', 'Multi-building projects'],
    skillLevels: [
      { skillLevelId: 'supervisor', quantity: 2 },
      { skillLevelId: 'tradesperson', quantity: 6 },
      { skillLevelId: 'apprentice', quantity: 2 }
    ],
    efficiencyMultiplier: 3.5,
    minimumRoofArea: 800,
    maximumRoofArea: 50000,
    specialization: 'commercial',
    safetyComplianceLevel: 'enhanced', // Extra safety protocols for commercial
    notes: 'Full commercial crew with dual supervision. Includes safety officer protocols.'
  },
  {
    id: 'heritage-custom',
    name: 'Heritage & Custom Work',
    description: '1 supervisor + 2 senior tradespeople',
    suitableFor: ['Heritage buildings', 'Custom copper/zinc work', 'Architectural features', 'Listed buildings'],
    skillLevels: [
      { skillLevelId: 'supervisor', quantity: 1 },
      { skillLevelId: 'senior-tradesperson', quantity: 2 }
    ],
    efficiencyMultiplier: 0.7, // Slower due to precision requirements
    minimumRoofArea: 50,
    maximumRoofArea: 400,
    specialization: 'heritage',
    precisionMultiplier: 2.0, // Double time for custom fabrication
    notes: 'Specialist crew for heritage restoration and custom metalwork. Premium pricing justified.'
  },
  {
    id: 'emergency-response',
    name: 'Emergency Response',
    description: '1 supervisor + 2 qualified (24/7 callout)',
    suitableFor: ['Storm damage', 'Emergency leak repairs', 'Temporary weatherproofing', 'Insurance work'],
    skillLevels: [
      { skillLevelId: 'supervisor', quantity: 1 },
      { skillLevelId: 'tradesperson', quantity: 2 }
    ],
    efficiencyMultiplier: 1.1,
    minimumRoofArea: 0,
    maximumRoofArea: 200,
    specialization: 'emergency',
    calloutFee: 350, // Flat callout fee for emergency work
    afterHoursMultiplier: 1.5, // 50% premium for after-hours
    weekendMultiplier: 2.0, // 100% premium for weekends
    notes: 'Emergency response crew with 24/7 availability. Includes callout fees and premium rates.'
  }
];

// ============================================================================
// PROJECT TYPE RECOMMENDATIONS
// ============================================================================

export interface ProjectTypeRecommendation {
  projectType: string;
  description: string;
  recommendedCrews: string[]; // Crew IDs in order of preference
  typicalDuration: string;
  keyConsiderations: string[];
}

export const PROJECT_TYPE_RECOMMENDATIONS: ProjectTypeRecommendation[] = [
  {
    projectType: 'new-construction',
    description: 'New residential construction - clean install',
    recommendedCrews: ['standard-crew', 'enhanced-crew', 'premium-crew'],
    typicalDuration: '5-10 days',
    keyConsiderations: [
      'No removal required',
      'Clean working conditions',
      'Coordination with other trades',
      'Weather-dependent scheduling'
    ]
  },
  {
    projectType: 'reroofing-metal-to-metal',
    description: 'Re-roofing - metal roof replacement',
    recommendedCrews: ['reroofing-specialist', 'enhanced-crew', 'premium-crew'],
    typicalDuration: '7-14 days',
    keyConsiderations: [
      'Old roof removal required',
      'Waste disposal logistics',
      'Potential structural issues',
      'Occupant protection during work'
    ]
  },
  {
    projectType: 'reroofing-tile-to-metal',
    description: 'Re-roofing - tile to metal conversion',
    recommendedCrews: ['reroofing-specialist', 'premium-crew'],
    typicalDuration: '10-18 days',
    keyConsiderations: [
      'Heavy tile removal',
      'Batten replacement likely',
      'Structural assessment needed',
      'Significant waste volume',
      'Potential asbestos in old tiles'
    ]
  },
  {
    projectType: 'repairs-maintenance',
    description: 'Repairs, maintenance, and leak fixes',
    recommendedCrews: ['repair-maintenance', 'standard-crew'],
    typicalDuration: '1-3 days',
    keyConsiderations: [
      'Diagnostic time required',
      'Access challenges',
      'Material matching',
      'Warranty considerations'
    ]
  },
  {
    projectType: 'commercial-small',
    description: 'Small commercial building (400-1000m²)',
    recommendedCrews: ['premium-crew', 'commercial-crew'],
    typicalDuration: '15-25 days',
    keyConsiderations: [
      'Business hours restrictions',
      'Enhanced safety requirements',
      'Commercial warranties',
      'Building code compliance'
    ]
  },
  {
    projectType: 'commercial-large',
    description: 'Large commercial/industrial (1000m²+)',
    recommendedCrews: ['commercial-large', 'commercial-crew'],
    typicalDuration: '4-12 weeks',
    keyConsiderations: [
      'Project management required',
      'Multiple crew coordination',
      'Staged completion',
      'Strict safety protocols',
      'Commercial insurance requirements'
    ]
  },
  {
    projectType: 'heritage-restoration',
    description: 'Heritage building restoration',
    recommendedCrews: ['heritage-custom'],
    typicalDuration: '3-8 weeks',
    keyConsiderations: [
      'Heritage approval required',
      'Material sourcing challenges',
      'Custom fabrication',
      'Documentation requirements',
      'Premium pricing justified'
    ]
  },
  {
    projectType: 'emergency-storm-damage',
    description: 'Emergency storm damage repairs',
    recommendedCrews: ['emergency-response', 'repair-maintenance'],
    typicalDuration: '1-5 days',
    keyConsiderations: [
      'Immediate response required',
      'Temporary weatherproofing',
      'Insurance documentation',
      'Premium rates apply',
      'Follow-up permanent repairs'
    ]
  }
];

// ============================================================================
// CREW SELECTION HELPER FUNCTIONS
// ============================================================================

export function getAllCrews(): CrewComposition[] {
  return [...CREW_COMPOSITIONS, ...SPECIALIZED_CREWS];
}

export function getCrewById(crewId: string): CrewComposition | undefined {
  return getAllCrews().find(crew => crew.id === crewId);
}

export function getCrewsBySpecialization(specialization: string): CrewComposition[] {
  return SPECIALIZED_CREWS.filter(crew => crew.specialization === specialization);
}

export function recommendCrewForProject(
  projectType: string,
  roofArea: number,
  complexity: 'simple' | 'standard' | 'complex' | 'very-complex'
): CrewComposition[] {
  const recommendation = PROJECT_TYPE_RECOMMENDATIONS.find(
    rec => rec.projectType === projectType
  );
  
  if (!recommendation) {
    // Default to area-based recommendation
    const singleCrew = recommendCrew(roofArea, complexity);
    return [singleCrew];
  }
  
  const allCrews = getAllCrews();
  return recommendation.recommendedCrews
    .map(crewId => allCrews.find(crew => crew.id === crewId))
    .filter((crew): crew is CrewComposition => crew !== undefined)
    .filter(crew => 
      roofArea >= crew.minimumRoofArea && 
      roofArea <= crew.maximumRoofArea
    );
}

