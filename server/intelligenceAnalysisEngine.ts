/**
 * Intelligence Analysis Engine
 * 
 * AI-powered project analysis for material take-offs, compliance, crew requirements, and risk assessment
 */

import openrouter from './ai/openrouter';

export interface ProjectInput {
  clientName: string;
  address: string;
  jobType: string;
  difficultyLevel: 'easy' | 'medium' | 'hard' | 'extreme';
  coastalExposure: boolean;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  customNotes: string;
  measurements?: {
    totalArea: number;
    roofPitch: number;
    roofType: string;
    roofingMaterial: string;
    drawings?: any[];
  };
  mudMapData?: string;
  constructionPlans?: string;
}

export interface AnalysisResult {
  success: boolean;
  projectId: string;
  analysis: {
    complexity: string;
    estimatedDuration: string;
    materialRequirements: Array<{
      name: string;
      quantity: number;
      unit: string;
      unitPrice: number;
    }>;
    complianceNotes: string[];
    laborEstimate: {
      hours: number;
      crewSize: number;
      breakdown: string;
    };
    riskAssessment: {
      riskLevel: string;
      risks: Array<{
        category: string;
        description: string;
        severity: string;
        mitigation: string;
      }>;
    };
  };
}

/**
 * Analyze project and generate comprehensive intelligence
 */
export async function analyzeProject(input: ProjectInput): Promise<AnalysisResult> {
  console.log('[Intelligence Engine] Analyzing project:', input.clientName);

  try {
    // Generate unique project ID
    const projectId = `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Build project description for AI
    const projectDescription = `
${input.jobType} project for ${input.clientName}
Location: ${input.address}
Difficulty: ${input.difficultyLevel}
Coastal exposure: ${input.coastalExposure ? 'Yes' : 'No'}
Urgency: ${input.urgency}
${input.measurements ? `
Roof area: ${input.measurements.totalArea}m²
Roof pitch: ${input.measurements.roofPitch}°
Roof type: ${input.measurements.roofType}
Material: ${input.measurements.roofingMaterial}
` : ''}
Additional notes: ${input.customNotes}
    `.trim();

    // 1. Generate quote/material requirements
    console.log('[Intelligence Engine] Generating material requirements...');
    const quoteData = await openrouter.generateQuoteFromDescription({
      description: projectDescription,
      projectType: input.jobType,
      location: input.address,
    });

    // 2. Estimate labor time
    console.log('[Intelligence Engine] Estimating labor time...');
    const laborEstimate = await openrouter.estimateLaborTime({
      task: input.jobType,
      area: input.measurements?.totalArea || 100,
      complexity: input.difficultyLevel === 'easy' ? 'simple' : 
                  input.difficultyLevel === 'medium' ? 'standard' :
                  input.difficultyLevel === 'hard' ? 'complex' : 'very_complex',
    });

    // 3. Analyze risks
    console.log('[Intelligence Engine] Analyzing project risks...');
    const riskAnalysis = await openrouter.analyzeProjectRisk({
      projectDescription,
      location: input.address,
      timeline: laborEstimate.hours > 80 ? '2-3 weeks' : '1-2 weeks',
      budget: quoteData.totalCost,
    });

    // 4. Generate compliance notes
    const complianceNotes = [
      'AS 1562.1:2018 - Design and installation of sheet roof and wall cladding',
      'AS/NZS 1170.2:2021 - Structural design actions - Wind actions',
      input.coastalExposure ? 'AS 2728:2007 - Prefinished/prepainted sheet products - Corrosion resistance' : null,
      'NCC 2022 Building Code compliance required',
      input.difficultyLevel === 'extreme' ? 'Additional engineering certification may be required' : null,
    ].filter(Boolean) as string[];

    // Determine complexity
    const complexity = 
      input.difficultyLevel === 'extreme' ? 'Very High' :
      input.difficultyLevel === 'hard' ? 'High' :
      input.difficultyLevel === 'medium' ? 'Medium' : 'Low';

    // Estimate duration based on labor hours
    const estimatedDuration = 
      laborEstimate.hours > 120 ? '3-4 weeks' :
      laborEstimate.hours > 80 ? '2-3 weeks' :
      laborEstimate.hours > 40 ? '1-2 weeks' : '3-5 days';

    console.log('[Intelligence Engine] Analysis complete');

    return {
      success: true,
      projectId,
      analysis: {
        complexity,
        estimatedDuration,
        materialRequirements: quoteData.materials,
        complianceNotes,
        laborEstimate: {
          hours: laborEstimate.hours,
          crewSize: laborEstimate.crewSize,
          breakdown: laborEstimate.breakdown,
        },
        riskAssessment: {
          riskLevel: riskAnalysis.riskLevel,
          risks: riskAnalysis.risks,
        },
      },
    };
  } catch (error: any) {
    console.error('[Intelligence Engine] Analysis failed:', error);
    
    // Return fallback analysis
    return {
      success: false,
      projectId: `proj_${Date.now()}`,
      analysis: {
        complexity: 'Medium',
        estimatedDuration: '1-2 weeks',
        materialRequirements: [],
        complianceNotes: [
          'AS 1562.1:2018 - Design and installation of sheet roof and wall cladding',
          'NCC 2022 Building Code compliance required',
        ],
        laborEstimate: {
          hours: 40,
          crewSize: 2,
          breakdown: 'Estimate unavailable - AI service error',
        },
        riskAssessment: {
          riskLevel: 'medium',
          risks: [],
        },
      },
    };
  }
}

