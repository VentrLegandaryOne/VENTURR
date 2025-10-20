/**
 * Environmental Intelligence Engine
 * Provides automated risk assessment and material optimization based on environmental factors
 */

export interface EnvironmentalFactors {
  location: string;
  coastalDistance?: number; // km from coast
  windRegion?: 'A' | 'B' | 'C' | 'D';
  balRating?: 'BAL-LOW' | 'BAL-12.5' | 'BAL-19' | 'BAL-29' | 'BAL-40' | 'BAL-FZ';
  saltExposure?: boolean;
  cycloneRisk?: boolean;
  industrialFallout?: boolean;
}

export interface EnvironmentalRecommendations {
  materialGrade: string;
  fastenerGrade: string;
  extraRequirements: string[];
  riskLevel: 'Low' | 'Medium' | 'High' | 'Extreme';
  complianceStandards: string[];
  warnings: string[];
  installationNotes: string[];
}

/**
 * Assess environmental risks and provide material recommendations
 */
export function assessEnvironmentalFactors(
  factors: EnvironmentalFactors
): EnvironmentalRecommendations {
  const recommendations: EnvironmentalRecommendations = {
    materialGrade: 'Standard Colorbond',
    fastenerGrade: 'Class 3 Galvanized',
    extraRequirements: [],
    riskLevel: 'Low',
    complianceStandards: ['AS 1562.1:2018'],
    warnings: [],
    installationNotes: [],
  };

  let riskScore = 0;

  // Coastal exposure assessment
  if (factors.coastalDistance !== undefined) {
    if (factors.coastalDistance < 0.2) {
      // Severe marine (< 200m)
      recommendations.materialGrade = 'Colorbond Ultra or Zincalume';
      recommendations.fastenerGrade = 'Stainless Steel 316';
      recommendations.extraRequirements.push('Marine-grade anti-corrosion coating');
      recommendations.extraRequirements.push('Increased maintenance schedule (6-monthly)');
      recommendations.warnings.push('SEVERE MARINE ZONE: Mandatory stainless steel fasteners');
      recommendations.installationNotes.push('Avoid dissimilar metal contact');
      recommendations.installationNotes.push('Use marine-grade sealants only');
      riskScore += 40;
    } else if (factors.coastalDistance < 1.0) {
      // Moderate marine (200m - 1km)
      recommendations.materialGrade = 'Colorbond or Zincalume with protective coating';
      recommendations.fastenerGrade = 'Class 4 Galvanized minimum';
      recommendations.extraRequirements.push('Enhanced corrosion protection');
      recommendations.warnings.push('MODERATE MARINE ZONE: Upgrade fastener specification');
      recommendations.installationNotes.push('Regular cleaning required (quarterly)');
      riskScore += 25;
    } else if (factors.coastalDistance < 5.0) {
      // Mild marine (1-5km)
      recommendations.fastenerGrade = 'Class 4 Galvanized';
      recommendations.installationNotes.push('Annual inspection recommended');
      riskScore += 10;
    }
  }

  // Salt exposure assessment
  if (factors.saltExposure) {
    recommendations.extraRequirements.push('Salt-resistant coating system');
    recommendations.warnings.push('HIGH SALT EXPOSURE: Enhanced protection required');
    riskScore += 15;
  }

  // Industrial fallout assessment
  if (factors.industrialFallout) {
    recommendations.extraRequirements.push('Chemical-resistant coating');
    recommendations.warnings.push('INDUSTRIAL ZONE: Regular cleaning essential');
    riskScore += 15;
  }

  // Wind region assessment
  if (factors.windRegion) {
    recommendations.complianceStandards.push('AS/NZS 1170.2:2021');
    
    if (factors.windRegion === 'C' || factors.windRegion === 'D') {
      recommendations.fastenerGrade = 'Class 4 Galvanized minimum (Stainless Steel recommended)';
      recommendations.extraRequirements.push('Enhanced fastening density (12-18 per m²)');
      recommendations.extraRequirements.push('Cyclone-rated anchor fixing');
      recommendations.warnings.push(`WIND REGION ${factors.windRegion}: Cyclonic conditions - enhanced fastening required`);
      recommendations.installationNotes.push('Follow AS/NZS 1170.2 wind load calculations');
      recommendations.installationNotes.push('Structural engineer certification may be required');
      riskScore += factors.windRegion === 'D' ? 35 : 25;
    } else if (factors.windRegion === 'B') {
      recommendations.installationNotes.push('Standard fastening adequate for Wind Region B');
      riskScore += 5;
    }
  }

  // Cyclone risk assessment
  if (factors.cycloneRisk) {
    recommendations.fastenerGrade = 'Stainless Steel 316';
    recommendations.extraRequirements.push('Cyclone-rated fixing system');
    recommendations.extraRequirements.push('Structural tie-down system');
    recommendations.warnings.push('CYCLONE ZONE: Mandatory structural engineering certification');
    recommendations.complianceStandards.push('AS 4055:2021');
    riskScore += 40;
  }

  // BAL (Bushfire Attack Level) assessment
  if (factors.balRating) {
    recommendations.complianceStandards.push('AS 3959:2018');
    
    const balRiskMap: Record<string, number> = {
      'BAL-LOW': 0,
      'BAL-12.5': 10,
      'BAL-19': 15,
      'BAL-29': 25,
      'BAL-40': 35,
      'BAL-FZ': 45,
    };

    riskScore += balRiskMap[factors.balRating] || 0;

    if (factors.balRating === 'BAL-29' || factors.balRating === 'BAL-40' || factors.balRating === 'BAL-FZ') {
      recommendations.fastenerGrade = 'Stainless Steel 316';
      recommendations.extraRequirements.push('Ember guards on all roof vents');
      recommendations.extraRequirements.push('Scribed and sealed flashings');
      recommendations.extraRequirements.push('Fire-rated roof penetrations');
      recommendations.extraRequirements.push('Sarking/blanket with ember protection');
      recommendations.warnings.push(`${factors.balRating}: HIGH BUSHFIRE RISK - Specialist installation required`);
      recommendations.installationNotes.push('No combustible materials within 400mm of roof');
      recommendations.installationNotes.push('Gutter guards mandatory');
      
      if (factors.balRating === 'BAL-FZ') {
        recommendations.warnings.push('BAL-FZ: EXTREME BUSHFIRE RISK - Engineering certification mandatory');
        recommendations.installationNotes.push('Non-combustible construction throughout');
      }
    } else if (factors.balRating === 'BAL-19') {
      recommendations.extraRequirements.push('Ember protection for vents');
      recommendations.installationNotes.push('Regular debris removal from gutters');
    } else if (factors.balRating === 'BAL-12.5') {
      recommendations.installationNotes.push('Standard construction with bushfire awareness');
    }
  }

  // Determine overall risk level
  if (riskScore >= 70) {
    recommendations.riskLevel = 'Extreme';
  } else if (riskScore >= 40) {
    recommendations.riskLevel = 'High';
  } else if (riskScore >= 20) {
    recommendations.riskLevel = 'Medium';
  } else {
    recommendations.riskLevel = 'Low';
  }

  // Add general compliance standards
  if (!recommendations.complianceStandards.includes('NCC 2022')) {
    recommendations.complianceStandards.push('NCC 2022 (Building Code of Australia)');
  }

  return recommendations;
}

/**
 * Get installation weather recommendations
 */
export interface WeatherRecommendations {
  safeWindSpeed: number; // km/h
  temperatureRange: { min: number; max: number }; // Celsius
  warnings: string[];
  bestConditions: string[];
}

export function getWeatherRecommendations(
  roofType: 'concealed-fix' | 'pierce-fix',
  sheetLength: number
): WeatherRecommendations {
  const baseWindLimit = 25; // km/h
  const sheetSizeMultiplier = Math.max(1, sheetLength / 6); // Larger sheets = lower wind tolerance
  
  return {
    safeWindSpeed: Math.round(baseWindLimit / sheetSizeMultiplier),
    temperatureRange: { min: 5, max: 35 },
    warnings: [
      'Do not install in rain or when rain is imminent',
      'Avoid installation in extreme heat (>35°C) - thermal expansion issues',
      'Do not install in freezing conditions (<5°C) - material brittleness',
      `Wind speeds above ${Math.round(baseWindLimit / sheetSizeMultiplier)} km/h are unsafe for ${sheetLength}m sheets`,
      'Ensure adequate crew size for sheet handling in any wind conditions',
    ],
    bestConditions: [
      'Calm to light winds (<15 km/h)',
      'Temperature 15-25°C',
      'Dry conditions with no rain forecast for 24 hours',
      'Good visibility and daylight',
    ],
  };
}

/**
 * Calculate required fastener density based on environmental factors
 */
export function calculateFastenerDensity(
  windRegion: 'A' | 'B' | 'C' | 'D',
  roofPitch: number, // degrees
  coastalDistance?: number
): { fastenersPerM2: number; notes: string[] } {
  let baseDensity = 8; // Standard fasteners per m²
  const notes: string[] = [];

  // Wind region adjustment
  if (windRegion === 'C') {
    baseDensity = 12;
    notes.push('Wind Region C: Enhanced fastening density required');
  } else if (windRegion === 'D') {
    baseDensity = 18;
    notes.push('Wind Region D: Maximum fastening density for cyclonic conditions');
  } else if (windRegion === 'B') {
    baseDensity = 10;
    notes.push('Wind Region B: Moderate fastening density');
  }

  // Low pitch adjustment
  if (roofPitch < 5) {
    baseDensity += 2;
    notes.push('Low pitch (<5°): Additional fasteners for wind uplift resistance');
  }

  // Coastal adjustment
  if (coastalDistance !== undefined && coastalDistance < 1.0) {
    baseDensity += 2;
    notes.push('Coastal location: Additional fasteners for corrosion redundancy');
  }

  return {
    fastenersPerM2: baseDensity,
    notes,
  };
}

/**
 * Get tool recommendations based on project size and conditions
 */
export interface ToolRecommendations {
  essential: Array<{ name: string; reason: string; estimatedCost?: string }>;
  recommended: Array<{ name: string; reason: string; estimatedCost?: string }>;
  timeSavings: string;
}

export function getToolRecommendations(
  roofArea: number,
  coastal: boolean
): ToolRecommendations {
  const recommendations: ToolRecommendations = {
    essential: [
      {
        name: 'Electric Metal Cutting Shears',
        reason: '10x faster than tin snips - essential for projects >20m²',
        estimatedCost: '$150-300',
      },
      {
        name: 'Cordless Drill/Driver',
        reason: 'For fastener installation',
        estimatedCost: '$200-400',
      },
      {
        name: 'Safety Harness & Fall Protection',
        reason: 'Mandatory for roof work',
        estimatedCost: '$300-600',
      },
    ],
    recommended: [],
    timeSavings: '',
  };

  if (roofArea > 50) {
    recommendations.recommended.push({
      name: 'Portable Roof Panel Lifter',
      reason: 'Reduces crew size and improves safety for large projects',
      estimatedCost: '$800-1500',
    });
  }

  if (coastal) {
    recommendations.essential.push({
      name: 'Stainless Steel Cutting Blades',
      reason: 'Required for cutting stainless fasteners in marine environments',
      estimatedCost: '$50-100',
    });
  }

  recommendations.recommended.push(
    {
      name: 'Large Bevel/Angle Finder',
      reason: 'Accurate angle transfer for complex cuts',
      estimatedCost: '$30-60',
    },
    {
      name: 'Roof Pitch Gauge',
      reason: 'Precise pitch measurement for compliance',
      estimatedCost: '$20-40',
    }
  );

  // Calculate time savings
  const manualCuttingTime = roofArea * 2; // minutes
  const electricShearTime = roofArea * 0.2; // minutes
  const timeSaved = Math.round((manualCuttingTime - electricShearTime) / 60);
  
  recommendations.timeSavings = `Electric shears save approximately ${timeSaved} hours on cutting for ${roofArea}m² project`;

  return recommendations;
}

