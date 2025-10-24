// Venturr Labor Analysis Engine
// ThomCo Workforce Intelligence v3.0

import type {
  LaborAnalysisRequest,
  LaborAnalysisResult,
  CrewMember,
  WorkforceStructure,
} from '../shared/workforceTypes';

import {
  THOMCO_WORKFORCE,
  THOMCO_CREW_MEMBERS,
  LABOR_CONSTANTS,
} from '../shared/workforceTypes';

export class LaborAnalysisEngine {
  /**
   * Analyze labor requirements and recommend optimal crew composition
   */
  static analyzeLaborRequirements(request: LaborAnalysisRequest): LaborAnalysisResult {
    // Step 1: Calculate base hours
    const baseHours = this.calculateBaseHours(request);

    // Step 2: Apply complexity multipliers
    const adjustedHours = this.applyComplexityMultipliers(baseHours, request);

    // Step 3: Recommend crew composition
    const crew = this.recommendCrewComposition(adjustedHours, request);

    // Step 4: Calculate duration
    const duration = this.calculateDuration(adjustedHours, crew.size);

    // Step 5: Calculate costs
    const costs = this.calculateCosts(adjustedHours, crew.members);

    // Step 6: Optimize for training and efficiency
    const optimization = this.optimizeCrewSelection(crew, request);

    // Step 7: Break down hours by phase
    const breakdown = this.breakdownHours(request);

    return {
      estimatedHours: Math.round(adjustedHours),
      recommendedCrew: crew,
      duration,
      costs,
      optimization,
      breakdown,
    };
  }

  /**
   * Calculate base hours before complexity adjustments
   */
  private static calculateBaseHours(request: LaborAnalysisRequest): number {
    const { roofArea, removalRequired, customFabrication } = request;
    const constants = LABOR_CONSTANTS.BASE_HOURS_PER_SQM;

    let hours = 0;

    if (removalRequired) {
      hours += roofArea * constants.removal;
    }

    hours += roofArea * constants.preparation;
    hours += roofArea * constants.installation;
    hours += roofArea * constants.cleanup;

    if (customFabrication) {
      hours += LABOR_CONSTANTS.CUSTOM_FABRICATION_HOURS;
    }

    return hours;
  }

  /**
   * Apply complexity multipliers based on project characteristics
   */
  private static applyComplexityMultipliers(
    baseHours: number,
    request: LaborAnalysisRequest
  ): number {
    const { roofType, pitch, height, accessDifficulty } = request;
    const multipliers = LABOR_CONSTANTS.COMPLEXITY_MULTIPLIERS;

    let adjustedHours = baseHours;

    // Roof type multiplier
    adjustedHours *= multipliers.roofType[roofType];

    // Pitch multiplier
    const pitchCategory = this.getPitchCategory(pitch);
    adjustedHours *= multipliers.pitch[pitchCategory];

    // Height multiplier
    adjustedHours *= multipliers.height[height];

    // Access difficulty multiplier
    adjustedHours *= multipliers.access[accessDifficulty];

    return adjustedHours;
  }

  /**
   * Determine pitch category from degrees
   */
  private static getPitchCategory(pitch: number): keyof typeof LABOR_CONSTANTS.COMPLEXITY_MULTIPLIERS.pitch {
    if (pitch < 15) return 'low';
    if (pitch < 25) return 'medium';
    if (pitch < 35) return 'steep';
    return 'very_steep';
  }

  /**
   * Recommend optimal crew composition
   */
  private static recommendCrewComposition(
    hours: number,
    request: LaborAnalysisRequest
  ): {
    size: number;
    composition: { leads: number; experienced: number; apprentices: number; laborers: number };
    members: CrewMember[];
  } {
    // Determine crew size based on hours and urgency
    let crewSize = LABOR_CONSTANTS.OPTIMAL_CREW_SIZE;

    if (hours < 20) {
      crewSize = LABOR_CONSTANTS.MINIMUM_CREW_SIZE;
    } else if (hours > 60 || request.urgency === 'urgent') {
      crewSize = LABOR_CONSTANTS.MAXIMUM_CREW_SIZE;
    } else if (request.urgency === 'priority') {
      crewSize = 4;
    }

    // Determine composition based on complexity
    const isComplex = request.roofType === 'complex' || 
                     request.accessDifficulty === 'very_difficult' ||
                     request.customFabrication;

    let composition: { leads: number; experienced: number; apprentices: number; laborers: number };

    if (crewSize === 2) {
      composition = { leads: 1, experienced: 1, apprentices: 0, laborers: 0 };
    } else if (crewSize === 3) {
      if (isComplex) {
        composition = { leads: 1, experienced: 2, apprentices: 0, laborers: 0 };
      } else {
        composition = { leads: 1, experienced: 1, apprentices: 1, laborers: 0 };
      }
    } else if (crewSize === 4) {
      if (isComplex) {
        composition = { leads: 1, experienced: 2, apprentices: 0, laborers: 1 };
      } else {
        composition = { leads: 1, experienced: 2, apprentices: 1, laborers: 0 };
      }
    } else {
      // crewSize === 5
      composition = { leads: 2, experienced: 2, apprentices: 1, laborers: 0 };
    }

    // Select actual crew members
    const members = this.selectCrewMembers(composition);

    return { size: crewSize, composition, members };
  }

  /**
   * Select specific crew members based on composition
   */
  private static selectCrewMembers(composition: {
    leads: number;
    experienced: number;
    apprentices: number;
    laborers: number;
  }): CrewMember[] {
    const members: CrewMember[] = [];
    const available = THOMCO_CREW_MEMBERS.filter(m => m.availability === 'available');

    // Select leads (highest skill first)
    const leads = available
      .filter(m => m.role === 'lead')
      .sort((a, b) => b.skillLevel - a.skillLevel)
      .slice(0, composition.leads);
    members.push(...leads);

    // Select experienced
    const experienced = available
      .filter(m => m.role === 'experienced')
      .sort((a, b) => b.skillLevel - a.skillLevel)
      .slice(0, composition.experienced);
    members.push(...experienced);

    // Select apprentices (prefer higher year)
    const apprentices = available
      .filter(m => m.role === 'apprentice')
      .sort((a, b) => b.skillLevel - a.skillLevel)
      .slice(0, composition.apprentices);
    members.push(...apprentices);

    // Select laborers
    const laborers = available
      .filter(m => m.role === 'laborer')
      .slice(0, composition.laborers);
    members.push(...laborers);

    return members;
  }

  /**
   * Calculate project duration
   */
  private static calculateDuration(
    hours: number,
    crewSize: number
  ): { days: number; startDate: Date; endDate: Date } {
    const hoursPerDay = 8;
    const crewHoursPerDay = hoursPerDay * crewSize;
    const days = Math.ceil(hours / crewHoursPerDay);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 3); // 3 days lead time

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + days);

    return { days, startDate, endDate };
  }

  /**
   * Calculate labor costs
   */
  private static calculateCosts(
    hours: number,
    members: CrewMember[]
  ): {
    laborCost: number;
    hourlyRate: number;
    overtimeEstimate: number;
    totalCost: number;
  } {
    // Calculate weighted average hourly rate
    const totalRate = members.reduce((sum, m) => sum + m.hourlyRate, 0);
    const hourlyRate = totalRate / members.length;

    // Base labor cost
    const laborCost = hours * hourlyRate;

    // Estimate overtime (10% for projects > 40 hours)
    const overtimeEstimate = hours > 40 ? laborCost * 0.1 : 0;

    const totalCost = laborCost + overtimeEstimate;

    return {
      laborCost: Math.round(laborCost),
      hourlyRate: Math.round(hourlyRate * 100) / 100,
      overtimeEstimate: Math.round(overtimeEstimate),
      totalCost: Math.round(totalCost),
    };
  }

  /**
   * Optimize crew selection for training and efficiency
   */
  private static optimizeCrewSelection(
    crew: { size: number; composition: any; members: CrewMember[] },
    request: LaborAnalysisRequest
  ): {
    efficiency: number;
    trainingOpportunity: boolean;
    costSavings: number;
    qualityScore: number;
  } {
    // Calculate team efficiency
    const efficiencyScores = crew.members.map(m => m.efficiency);
    const avgEfficiency = efficiencyScores.reduce((a, b) => a + b, 0) / efficiencyScores.length;

    // Check for training opportunity
    const hasApprentice = crew.members.some(m => m.role === 'apprentice');
    const hasLead = crew.members.some(m => m.role === 'lead');
    const trainingOpportunity = hasApprentice && hasLead && request.roofType !== 'complex';

    // Calculate potential cost savings vs. all-experienced crew
    const currentCost = crew.members.reduce((sum, m) => sum + m.hourlyRate, 0);
    const allExperiencedCost = crew.size * 50; // $50/hr average experienced rate
    const costSavings = Math.max(0, allExperiencedCost - currentCost);

    // Calculate quality score (1-10)
    const avgSkill = crew.members.reduce((sum, m) => sum + m.skillLevel, 0) / crew.members.length;
    const qualityScore = Math.min(10, Math.round(avgSkill * 1.2));

    return {
      efficiency: Math.round(avgEfficiency * 100) / 100,
      trainingOpportunity,
      costSavings: Math.round(costSavings),
      qualityScore,
    };
  }

  /**
   * Break down hours by phase
   */
  private static breakdownHours(request: LaborAnalysisRequest): {
    removal?: number;
    preparation: number;
    installation: number;
    customWork?: number;
    cleanup: number;
  } {
    const { roofArea, removalRequired, customFabrication } = request;
    const constants = LABOR_CONSTANTS.BASE_HOURS_PER_SQM;

    const breakdown: any = {
      preparation: Math.round(roofArea * constants.preparation * 10) / 10,
      installation: Math.round(roofArea * constants.installation * 10) / 10,
      cleanup: Math.round(roofArea * constants.cleanup * 10) / 10,
    };

    if (removalRequired) {
      breakdown.removal = Math.round(roofArea * constants.removal * 10) / 10;
    }

    if (customFabrication) {
      breakdown.customWork = LABOR_CONSTANTS.CUSTOM_FABRICATION_HOURS;
    }

    return breakdown;
  }

  /**
   * Get current workforce structure
   */
  static getWorkforceStructure(): WorkforceStructure {
    return THOMCO_WORKFORCE;
  }

  /**
   * Get available crew members
   */
  static getAvailableCrewMembers(): CrewMember[] {
    return THOMCO_CREW_MEMBERS.filter(m => m.availability === 'available');
  }
}

