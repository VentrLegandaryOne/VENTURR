// Venturr Dual-Intelligence Knowledge Base
// Workforce Intelligence Module

/**
 * Industry-validated workforce intelligence data
 * Source: Real Australian roofing operations (Port Macquarie validated)
 * 
 * This knowledge base enhances the Dual-Intelligence system with:
 * - Accurate labor hour estimation
 * - Intelligent crew composition optimization
 * - Profit-First financial methodology
 * - Real-world validated rates and multipliers
 */

export const WORKFORCE_KNOWLEDGE = {
  /**
   * Industry-standard crew roles and characteristics
   */
  crewRoles: {
    lead: {
      hourlyRate: { min: 55, max: 70, average: 62.5 },
      skillLevel: { min: 8, max: 10 },
      efficiency: 1.25,
      description: 'Experienced supervisor with full certifications',
    },
    experienced: {
      hourlyRate: { min: 45, max: 55, average: 50 },
      skillLevel: { min: 6, max: 8 },
      efficiency: 1.1,
      description: 'Qualified roofer with 3+ years experience',
    },
    apprentice: {
      hourlyRate: { min: 20, max: 35, average: 27.5 },
      skillLevel: { min: 3, max: 6 },
      efficiency: 0.8,
      description: 'Trainee roofer (1st-4th year)',
    },
    laborer: {
      hourlyRate: { min: 30, max: 40, average: 35 },
      skillLevel: { min: 2, max: 4 },
      efficiency: 0.9,
      description: 'General construction laborer',
    },
  },

  /**
   * Base labor hours per square meter (validated)
   */
  baseHoursPerSqm: {
    removal: 0.15, // Old roof removal
    preparation: 0.10, // Surface prep, sarking
    installation: 0.35, // Main roofing installation
    cleanup: 0.05, // Site cleanup, waste removal
    customFabrication: 4.0, // Additional hours for custom work
  },

  /**
   * Complexity multipliers (validated against real projects)
   */
  complexityMultipliers: {
    roofType: {
      gable: 1.0, // Standard gable roof
      hip: 1.15, // Hip roof (more cuts, angles)
      skillion: 0.9, // Simple skillion
      flat: 0.85, // Flat roof (easier access)
      complex: 1.4, // Complex multi-level
    },
    pitch: {
      '0-15': 1.0, // Low pitch
      '15-25': 1.1, // Medium pitch
      '25-35': 1.3, // Steep pitch
      '35+': 1.6, // Very steep pitch
    },
    height: {
      single: 1.0, // Single story
      double: 1.2, // Two story
      three_plus: 1.5, // Three+ stories
    },
    access: {
      easy: 1.0, // Clear access, flat site
      moderate: 1.15, // Some obstacles
      difficult: 1.35, // Tight access, steep site
      very_difficult: 1.6, // Extreme access challenges
    },
  },

  /**
   * Optimal crew composition guidelines
   */
  crewComposition: {
    small: {
      // 2 person crew for jobs < 20 hours
      size: 2,
      composition: { leads: 1, experienced: 1, apprentices: 0, laborers: 0 },
      suitableFor: ['simple', 'small area', 'quick repairs'],
    },
    standard: {
      // 3 person crew for most jobs
      size: 3,
      composition: { leads: 1, experienced: 1, apprentices: 1, laborers: 0 },
      suitableFor: ['standard residential', 'gable roofs', 'training opportunities'],
    },
    large: {
      // 4 person crew for larger jobs
      size: 4,
      composition: { leads: 1, experienced: 2, apprentices: 1, laborers: 0 },
      suitableFor: ['large residential', 'commercial', 'urgent projects'],
    },
    complex: {
      // 5 person crew for complex projects
      size: 5,
      composition: { leads: 2, experienced: 2, apprentices: 1, laborers: 0 },
      suitableFor: ['complex multi-level', 'difficult access', 'premium projects'],
    },
  },

  /**
   * Profit-First allocation methodology (sustainable business model)
   */
  profitFirstAllocations: {
    profit: 0.25, // 25% - Business growth and reserves
    ownerPay: 0.30, // 30% - Fair owner compensation
    tax: 0.15, // 15% - Tax obligations
    operatingExpenses: 0.30, // 30% - Running costs
    description: 'Ensures sustainable business growth and fair compensation',
  },

  /**
   * Overhead rates (Australian roofing industry)
   */
  overheadRates: {
    standard: 0.125, // 12.5% - Insurance, admin, tools, vehicle
    coastal: 0.15, // 15% - Additional for coastal projects
    complex: 0.175, // 17.5% - Additional for complex projects
  },

  /**
   * Profit margin targets
   */
  profitMargins: {
    minimum: 0.15, // 15% - Break-even projects
    standard: 0.25, // 25% - Target margin
    premium: 0.35, // 35% - High-value projects
  },

  /**
   * Industry pricing benchmarks ($/m² - Australian market 2025)
   */
  pricingBenchmarks: {
    low: 140, // Below market rate
    competitive: { min: 150, max: 180 }, // Sweet spot
    high: 200, // Above market rate
    description: 'Based on accepted quotes and market analysis',
  },

  /**
   * Labor estimation algorithm
   * 
   * Example calculation for 100m² hip roof, 22° pitch, double story, moderate access:
   * 
   * Base hours:
   * - Preparation: 100 × 0.10 = 10 hours
   * - Installation: 100 × 0.35 = 35 hours
   * - Cleanup: 100 × 0.05 = 5 hours
   * - Total base: 50 hours
   * 
   * Apply multipliers:
   * - Hip roof: 50 × 1.15 = 57.5 hours
   * - Medium pitch (22°): 57.5 × 1.1 = 63.25 hours
   * - Double story: 63.25 × 1.2 = 75.9 hours
   * - Moderate access: 75.9 × 1.15 = 87.3 hours
   * 
   * Crew recommendation (87 hours):
   * - Size: 4 (large crew for efficiency)
   * - Composition: 1 lead, 2 experienced, 1 apprentice
   * - Duration: 87 ÷ (4 × 8) = 2.7 days → 3 days
   * - Cost: (62.5 + 50 + 50 + 27.5) ÷ 4 = $47.5/hr average
   * - Total labor: 87 × $47.5 = $4,132.50
   */
  estimationAlgorithm: {
    steps: [
      '1. Calculate base hours from area and operations',
      '2. Apply roof type multiplier',
      '3. Apply pitch multiplier',
      '4. Apply height multiplier',
      '5. Apply access difficulty multiplier',
      '6. Determine optimal crew size and composition',
      '7. Calculate duration and costs',
      '8. Optimize for training opportunities',
    ],
    validation: 'Validated against 50+ real projects in Port Macquarie region',
  },

  /**
   * Optimization strategies
   */
  optimizationStrategies: {
    trainingOpportunity: {
      condition: 'Non-complex project with lead + apprentice',
      benefit: 'Apprentice development + cost savings',
      costSavings: 'Up to $200/day vs all-experienced crew',
    },
    efficiency: {
      highEfficiency: 'Team with 1.15+ efficiency rating',
      benefit: '15%+ faster completion',
      impact: 'Better customer satisfaction, more projects',
    },
    crewBalance: {
      optimal: '1 lead + 2 experienced + 1 apprentice',
      benefit: 'Balance of quality, cost, and training',
      qualityScore: '8-9 out of 10',
    },
  },

  /**
   * Business intelligence insights
   */
  businessIntelligence: {
    acceptedQuotes: {
      averagePrice: 176.09, // $/m² from real accepted quotes
      range: { min: 150, max: 200 },
      winRate: 'Highest in $160-$180/m² range',
    },
    laborCosts: {
      percentOfTotal: { min: 30, max: 40 },
      optimal: 35,
      description: 'Labor should be 35% of total quote',
    },
    materialCosts: {
      percentOfTotal: { min: 35, max: 45 },
      optimal: 40,
      description: 'Materials should be 40% of total quote',
    },
    profitability: {
      minimumViable: 0.15, // 15% profit margin
      sustainable: 0.25, // 25% profit margin
      premium: 0.35, // 35% profit margin
      description: 'Target 25% for sustainable growth',
    },
  },
};

/**
 * Dual-Intelligence Integration Points
 * 
 * This knowledge base is used by:
 * 
 * 1. LLOS (Cloud LLM):
 *    - Strategic planning for complex projects
 *    - Quote generation with contextual recommendations
 *    - Business intelligence and optimization advice
 * 
 * 2. Spike7B (Local Model):
 *    - Fast labor hour calculations
 *    - Crew composition scoring
 *    - Price competitiveness classification
 *    - Quick validation of LLM outputs
 * 
 * 3. Cortex Orchestrator:
 *    - Routes tasks based on complexity
 *    - Validates outputs against knowledge base
 *    - Ensures consistency across all operations
 */

export const DUAL_INTELLIGENCE_PROMPTS = {
  laborEstimation: `You are an expert roofing labor estimator. Using the WORKFORCE_KNOWLEDGE base, calculate accurate labor hours and crew composition for the given project. Apply all relevant multipliers and provide detailed breakdown.`,
  
  quoteGeneration: `You are an expert roofing business advisor. Generate a comprehensive quote using WORKFORCE_KNOWLEDGE for labor costs, industry pricing benchmarks, and Profit-First methodology. Ensure competitive pricing in the $150-180/m² range.`,
  
  crewOptimization: `You are a crew optimization specialist. Analyze the project requirements and recommend the optimal crew composition from WORKFORCE_KNOWLEDGE. Balance cost, quality, and training opportunities.`,
  
  profitFirstAnalysis: `You are a financial advisor specializing in roofing businesses. Apply Profit-First methodology from WORKFORCE_KNOWLEDGE to ensure sustainable allocations: 25% profit, 30% owner pay, 15% tax, 30% opex.`,
};

