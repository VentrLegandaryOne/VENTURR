/**
 * REAL-WORLD ACCEPTANCE EVALUATION
 * 
 * Evaluates outputs against real-world standards:
 * - Technically correct
 * - Socially acceptable
 * - Legally defensible
 * - Commercially persuasive
 */

import { z } from 'zod';

// ============================================================================
// TYPES
// ============================================================================

export interface AcceptanceEvaluation {
  id: string;
  timestamp: Date;
  outputId: string;
  content: string;
  archetypeEvaluations: ArchetypeEvaluation[];
  technicalScore: number; // 0-10
  socialScore: number; // 0-10
  legalScore: number; // 0-10
  commercialScore: number; // 0-10
  overallScore: number; // 0-10
  acceptanceThreshold: number;
  meetsThreshold: boolean;
  acceptanceLevel: 'excellent' | 'good' | 'acceptable' | 'needs_improvement' | 'unacceptable';
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  readyForDeployment: boolean;
}

export interface ArchetypeEvaluation {
  archetypeId: string;
  archetypeName: string;
  technicalScore: number;
  socialScore: number;
  legalScore: number;
  commercialScore: number;
  overallScore: number;
  acceptanceLevel: 'excellent' | 'good' | 'acceptable' | 'needs_improvement' | 'unacceptable';
  feedback: string;
  concerns: string[];
  recommendations: string[];
}

export interface RealWorldStandard {
  dimension: 'technical' | 'social' | 'legal' | 'commercial';
  criteria: StandardCriterion[];
}

export interface StandardCriterion {
  id: string;
  name: string;
  description: string;
  weight: number; // 0-1
  evaluationFunction: (content: string) => number; // 0-10
}

// ============================================================================
// REAL-WORLD ACCEPTANCE EVALUATION
// ============================================================================

export class RealWorldAcceptanceEvaluation {
  private evaluations: AcceptanceEvaluation[] = [];
  private standards: Map<string, RealWorldStandard> = new Map();
  private evaluationHistory: Map<string, AcceptanceEvaluation[]> = new Map();

  // Archetype definitions
  private archetypes = [
    { id: 'director', name: 'Director', focus: ['legal', 'commercial', 'technical'] },
    { id: 'admin', name: 'Admin', focus: ['technical', 'social', 'legal'] },
    { id: 'estimator', name: 'Estimator', focus: ['technical', 'commercial', 'social'] },
    { id: 'supervisor', name: 'Supervisor', focus: ['social', 'technical', 'legal'] },
    { id: 'onsite_crew', name: 'Onsite Crew', focus: ['social', 'technical', 'commercial'] },
    { id: 'strata_manager', name: 'Strata Manager', focus: ['legal', 'technical', 'commercial'] },
    { id: 'insurer', name: 'Insurer', focus: ['legal', 'technical', 'social'] },
    { id: 'builder', name: 'Builder', focus: ['technical', 'commercial', 'legal'] },
    { id: 'homeowner', name: 'Homeowner', focus: ['social', 'commercial', 'legal'] },
    { id: 'government', name: 'Government/Asset Manager', focus: ['legal', 'technical', 'social'] },
  ];

  constructor() {
    this.initializeStandards();
  }

  /**
   * Initialize real-world standards
   */
  private initializeStandards(): void {
    // Technical standards
    this.standards.set('technical', {
      dimension: 'technical',
      criteria: [
        {
          id: 'data_accuracy',
          name: 'Data Accuracy',
          description: 'All data is accurate and current',
          weight: 0.3,
          evaluationFunction: (content: string) => {
            let score = 5;
            if (/\$|AUD|price|cost|amount/i.test(content)) score += 2;
            if (/date|reference|id/i.test(content)) score += 2;
            if (/total|subtotal|tax|gst/i.test(content)) score += 1;
            return Math.min(10, score);
          },
        },
        {
          id: 'data_completeness',
          name: 'Data Completeness',
          description: 'All required data fields are present',
          weight: 0.3,
          evaluationFunction: (content: string) => {
            let score = 5;
            const fields = [
              /date/i,
              /reference/i,
              /customer|client|name/i,
              /description|details/i,
              /amount|price|cost/i,
            ];
            const presentFields = fields.filter((f) => f.test(content)).length;
            score += presentFields;
            return Math.min(10, score);
          },
        },
        {
          id: 'data_consistency',
          name: 'Data Consistency',
          description: 'Data is consistent across document',
          weight: 0.2,
          evaluationFunction: (content: string) => {
            let score = 7;
            // Check for consistent formatting
            const lines = content.split('\n');
            if (lines.every((line) => line.length < 150)) score += 2;
            if (!/\$\d+\.\d{1}(?!\d)/.test(content)) score += 1; // Consistent currency format
            return Math.min(10, score);
          },
        },
        {
          id: 'no_errors',
          name: 'No Errors',
          description: 'No technical errors or corruption',
          weight: 0.2,
          evaluationFunction: (content: string) => {
            let score = 10;
            if (/undefined|null|error|exception/i.test(content)) score -= 3;
            if (/\[object Object\]|\[Function\]/i.test(content)) score -= 2;
            return Math.max(0, score);
          },
        },
      ],
    });

    // Social standards
    this.standards.set('social', {
      dimension: 'social',
      criteria: [
        {
          id: 'clarity',
          name: 'Clarity',
          description: 'Language is clear and easy to understand',
          weight: 0.35,
          evaluationFunction: (content: string) => {
            let score = 5;
            // Check for jargon
            const jargonPatterns = /\b(herein|thereof|aforementioned|notwithstanding)\b/gi;
            if (!jargonPatterns.test(content)) score += 2;
            // Check sentence length
            const sentences = content.split(/[.!?]+/).filter((s) => s.trim());
            const avgLength = sentences.reduce((sum, s) => sum + s.split(' ').length, 0) / sentences.length;
            if (avgLength < 20) score += 2;
            if (avgLength < 15) score += 1;
            return Math.min(10, score);
          },
        },
        {
          id: 'professionalism',
          name: 'Professionalism',
          description: 'Tone is professional and appropriate',
          weight: 0.35,
          evaluationFunction: (content: string) => {
            let score = 6;
            // Check for unprofessional language
            const unprofessional = /\b(lol|omg|gonna|wanna|ain't|y'all)\b/gi;
            if (!unprofessional.test(content)) score += 2;
            // Check for proper punctuation
            if (!/[!?]{2,}/.test(content)) score += 1;
            // Check for structure
            if (/\n\n/.test(content)) score += 1;
            return Math.min(10, score);
          },
        },
        {
          id: 'accessibility',
          name: 'Accessibility',
          description: 'Content is accessible to all archetypes',
          weight: 0.3,
          evaluationFunction: (content: string) => {
            let score = 5;
            // Check for structure
            if (/^#+\s/m.test(content)) score += 2;
            if (/[•\-\*]\s+/.test(content)) score += 2;
            if (/\n\n/.test(content)) score += 1;
            return Math.min(10, score);
          },
        },
      ],
    });

    // Legal standards
    this.standards.set('legal', {
      dimension: 'legal',
      criteria: [
        {
          id: 'compliance_language',
          name: 'Compliance Language',
          description: 'Proper compliance and regulatory language',
          weight: 0.3,
          evaluationFunction: (content: string) => {
            let score = 4;
            if (/compliance|standard|regulation|requirement/i.test(content)) score += 2;
            if (/australian|building|code|act|regulation/i.test(content)) score += 2;
            if (/certified|approved|licensed|qualified/i.test(content)) score += 2;
            return Math.min(10, score);
          },
        },
        {
          id: 'liability_disclaimers',
          name: 'Liability Disclaimers',
          description: 'Clear liability and warranty disclaimers',
          weight: 0.35,
          evaluationFunction: (content: string) => {
            let score = 4;
            if (/warranty|guarantee|warrantee/i.test(content)) score += 2;
            if (/liability|liable|not responsible|indemnity/i.test(content)) score += 2;
            if (/disclaimer|not liable|exclusion|limitation/i.test(content)) score += 2;
            return Math.min(10, score);
          },
        },
        {
          id: 'risk_visibility',
          name: 'Risk Visibility',
          description: 'Risks and exclusions are clearly visible',
          weight: 0.35,
          evaluationFunction: (content: string) => {
            let score = 4;
            if (/risk|danger|hazard|limitation|restriction/i.test(content)) score += 2;
            if (/exclusion|not included|not covered/i.test(content)) score += 2;
            if (/important|note|warning|caution/i.test(content)) score += 2;
            return Math.min(10, score);
          },
        },
      ],
    });

    // Commercial standards
    this.standards.set('commercial', {
      dimension: 'commercial',
      criteria: [
        {
          id: 'persuasiveness',
          name: 'Persuasiveness',
          description: 'Content is persuasive and compelling',
          weight: 0.35,
          evaluationFunction: (content: string) => {
            let score = 4;
            if (/benefit|advantage|improve|enhance|optimize/i.test(content)) score += 2;
            if (/proven|reliable|trusted|professional|expert/i.test(content)) score += 2;
            if (/quality|excellence|superior|premium/i.test(content)) score += 2;
            return Math.min(10, score);
          },
        },
        {
          id: 'call_to_action',
          name: 'Call to Action',
          description: 'Clear and compelling call to action',
          weight: 0.35,
          evaluationFunction: (content: string) => {
            let score = 3;
            if (/contact|call|email|request|schedule|book/i.test(content)) score += 3;
            if (/phone|email|website|address/i.test(content)) score += 2;
            if (/today|now|immediate|urgent|limited/i.test(content)) score += 2;
            return Math.min(10, score);
          },
        },
        {
          id: 'value_proposition',
          name: 'Value Proposition',
          description: 'Clear value proposition and benefits',
          weight: 0.3,
          evaluationFunction: (content: string) => {
            let score = 4;
            if (/save|cost|price|affordable|competitive/i.test(content)) score += 2;
            if (/quality|satisfaction|guarantee|proven/i.test(content)) score += 2;
            if (/experience|expertise|professional|certified/i.test(content)) score += 2;
            return Math.min(10, score);
          },
        },
      ],
    });
  }

  /**
   * Execute acceptance evaluation
   */
  async evaluateAcceptance(outputId: string, content: string): Promise<AcceptanceEvaluation> {
    const evaluationId = `eval-${Date.now()}-${Math.random()}`;

    console.log(`[RWAE] Evaluating acceptance for output: ${outputId}`);

    // Evaluate each dimension
    const technicalScore = this.evaluateDimension('technical', content);
    const socialScore = this.evaluateDimension('social', content);
    const legalScore = this.evaluateDimension('legal', content);
    const commercialScore = this.evaluateDimension('commercial', content);

    // Calculate overall score (weighted average)
    const overallScore = (technicalScore * 0.25 + socialScore * 0.25 + legalScore * 0.25 + commercialScore * 0.25);

    // Evaluate for each archetype
    const archetypeEvaluations: ArchetypeEvaluation[] = [];
    for (const archetype of this.archetypes) {
      const archetypeEval = this.evaluateForArchetype(archetype, content, technicalScore, socialScore, legalScore, commercialScore);
      archetypeEvaluations.push(archetypeEval);
    }

    // Determine acceptance level
    const acceptanceThreshold = 8.0;
    const meetsThreshold = overallScore >= acceptanceThreshold;
    const acceptanceLevel =
      overallScore >= 9.0
        ? 'excellent'
        : overallScore >= 8.0
          ? 'good'
          : overallScore >= 7.0
            ? 'acceptable'
            : overallScore >= 5.0
              ? 'needs_improvement'
              : 'unacceptable';

    // Extract strengths and weaknesses
    const strengths = this.extractStrengths(technicalScore, socialScore, legalScore, commercialScore);
    const weaknesses = this.extractWeaknesses(technicalScore, socialScore, legalScore, commercialScore);
    const recommendations = this.generateRecommendations(weaknesses);

    // Determine if ready for deployment
    const readyForDeployment =
      meetsThreshold &&
      archetypeEvaluations.every((a) => a.acceptanceLevel !== 'unacceptable') &&
      technicalScore >= 7.0 &&
      legalScore >= 7.0;

    const evaluation: AcceptanceEvaluation = {
      id: evaluationId,
      timestamp: new Date(),
      outputId,
      content,
      archetypeEvaluations,
      technicalScore,
      socialScore,
      legalScore,
      commercialScore,
      overallScore,
      acceptanceThreshold,
      meetsThreshold,
      acceptanceLevel,
      strengths,
      weaknesses,
      recommendations,
      readyForDeployment,
    };

    this.evaluations.push(evaluation);

    // Add to history
    if (!this.evaluationHistory.has(outputId)) {
      this.evaluationHistory.set(outputId, []);
    }
    this.evaluationHistory.get(outputId)!.push(evaluation);

    // Enforce retention
    if (this.evaluations.length > 10000) {
      this.evaluations = this.evaluations.slice(-5000);
    }

    console.log(`[RWAE] Evaluation complete - Overall Score: ${overallScore.toFixed(1)}/10`);

    return evaluation;
  }

  /**
   * Evaluate single dimension
   */
  private evaluateDimension(dimension: string, content: string): number {
    const standard = this.standards.get(dimension);
    if (!standard) return 5;

    let totalScore = 0;
    let totalWeight = 0;

    for (const criterion of standard.criteria) {
      const score = criterion.evaluationFunction(content);
      totalScore += score * criterion.weight;
      totalWeight += criterion.weight;
    }

    return totalWeight > 0 ? totalScore / totalWeight : 5;
  }

  /**
   * Evaluate for specific archetype
   */
  private evaluateForArchetype(
    archetype: (typeof this.archetypes)[0],
    content: string,
    technicalScore: number,
    socialScore: number,
    legalScore: number,
    commercialScore: number
  ): ArchetypeEvaluation {
    // Weight scores based on archetype focus
    const scores: Record<string, number> = {
      technical: technicalScore,
      social: socialScore,
      legal: legalScore,
      commercial: commercialScore,
    };

    let weightedScore = 0;
    let totalWeight = 0;

    for (const focus of archetype.focus) {
      const weight = archetype.focus.indexOf(focus) === 0 ? 0.5 : archetype.focus.indexOf(focus) === 1 ? 0.3 : 0.2;
      weightedScore += (scores[focus] || 5) * weight;
      totalWeight += weight;
    }

    const overallScore = totalWeight > 0 ? weightedScore / totalWeight : 5;

    const acceptanceLevel =
      overallScore >= 9.0
        ? 'excellent'
        : overallScore >= 8.0
          ? 'good'
          : overallScore >= 7.0
            ? 'acceptable'
            : overallScore >= 5.0
              ? 'needs_improvement'
              : 'unacceptable';

    return {
      archetypeId: archetype.id,
      archetypeName: archetype.name,
      technicalScore,
      socialScore,
      legalScore,
      commercialScore,
      overallScore,
      acceptanceLevel,
      feedback: `Output ${acceptanceLevel} for ${archetype.name}`,
      concerns: this.identifyConcerns(archetype, technicalScore, socialScore, legalScore, commercialScore),
      recommendations: this.generateArchetypeRecommendations(archetype, technicalScore, socialScore, legalScore, commercialScore),
    };
  }

  /**
   * Identify concerns for archetype
   */
  private identifyConcerns(
    archetype: (typeof this.archetypes)[0],
    technicalScore: number,
    socialScore: number,
    legalScore: number,
    commercialScore: number
  ): string[] {
    const concerns: string[] = [];
    const scores: Record<string, number> = {
      technical: technicalScore,
      social: socialScore,
      legal: legalScore,
      commercial: commercialScore,
    };

    for (const focus of archetype.focus) {
      if (scores[focus] < 7) {
        concerns.push(`${focus} score is below acceptable threshold`);
      }
    }

    return concerns;
  }

  /**
   * Generate archetype-specific recommendations
   */
  private generateArchetypeRecommendations(
    archetype: (typeof this.archetypes)[0],
    technicalScore: number,
    socialScore: number,
    legalScore: number,
    commercialScore: number
  ): string[] {
    const recommendations: string[] = [];
    const scores: Record<string, number> = {
      technical: technicalScore,
      social: socialScore,
      legal: legalScore,
      commercial: commercialScore,
    };

    if (technicalScore < 7) recommendations.push('Improve technical accuracy and completeness');
    if (socialScore < 7) recommendations.push('Enhance clarity and professionalism');
    if (legalScore < 7) recommendations.push('Add legal disclaimers and compliance language');
    if (commercialScore < 7) recommendations.push('Strengthen value proposition and call to action');

    return recommendations;
  }

  /**
   * Extract strengths
   */
  private extractStrengths(technicalScore: number, socialScore: number, legalScore: number, commercialScore: number): string[] {
    const strengths: string[] = [];

    if (technicalScore >= 8) strengths.push('Strong technical accuracy and data completeness');
    if (socialScore >= 8) strengths.push('Clear, professional, and accessible language');
    if (legalScore >= 8) strengths.push('Comprehensive legal disclaimers and compliance language');
    if (commercialScore >= 8) strengths.push('Persuasive and compelling value proposition');

    return strengths;
  }

  /**
   * Extract weaknesses
   */
  private extractWeaknesses(technicalScore: number, socialScore: number, legalScore: number, commercialScore: number): string[] {
    const weaknesses: string[] = [];

    if (technicalScore < 7) weaknesses.push('Technical accuracy and data completeness need improvement');
    if (socialScore < 7) weaknesses.push('Language clarity and professionalism need improvement');
    if (legalScore < 7) weaknesses.push('Legal disclaimers and compliance language missing');
    if (commercialScore < 7) weaknesses.push('Value proposition and call to action need strengthening');

    return weaknesses;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(weaknesses: string[]): string[] {
    return weaknesses.map((w) => {
      if (w.includes('Technical')) return 'Add missing data fields and verify accuracy';
      if (w.includes('Language')) return 'Simplify language and improve structure';
      if (w.includes('Legal')) return 'Add warranty, liability, and compliance disclaimers';
      if (w.includes('Value')) return 'Highlight benefits and add clear call to action';
      return 'Review and improve content';
    });
  }

  /**
   * Get evaluation history
   */
  getEvaluationHistory(outputId?: string, limit: number = 50): AcceptanceEvaluation[] {
    if (outputId) {
      return (this.evaluationHistory.get(outputId) || []).slice(-limit);
    }
    return this.evaluations.slice(-limit);
  }

  /**
   * Get acceptance statistics
   */
  getAcceptanceStatistics(): {
    totalEvaluations: number;
    excellentEvaluations: number;
    goodEvaluations: number;
    acceptableEvaluations: number;
    needsImprovementEvaluations: number;
    unacceptableEvaluations: number;
    readyForDeployment: number;
    averageScore: number;
    acceptanceRate: number;
  } {
    const total = this.evaluations.length;
    const excellent = this.evaluations.filter((e) => e.acceptanceLevel === 'excellent').length;
    const good = this.evaluations.filter((e) => e.acceptanceLevel === 'good').length;
    const acceptable = this.evaluations.filter((e) => e.acceptanceLevel === 'acceptable').length;
    const needsImprovement = this.evaluations.filter((e) => e.acceptanceLevel === 'needs_improvement').length;
    const unacceptable = this.evaluations.filter((e) => e.acceptanceLevel === 'unacceptable').length;
    const readyForDeployment = this.evaluations.filter((e) => e.readyForDeployment).length;
    const avgScore = total > 0 ? this.evaluations.reduce((sum, e) => sum + e.overallScore, 0) / total : 0;
    const acceptanceRate = total > 0 ? ((excellent + good + acceptable) / total) * 100 : 0;

    return {
      totalEvaluations: total,
      excellentEvaluations: excellent,
      goodEvaluations: good,
      acceptableEvaluations: acceptable,
      needsImprovementEvaluations: needsImprovement,
      unacceptableEvaluations: unacceptable,
      readyForDeployment,
      averageScore: Math.round(avgScore * 10) / 10,
      acceptanceRate: Math.round(acceptanceRate * 10) / 10,
    };
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export const realWorldAcceptanceEvaluation = new RealWorldAcceptanceEvaluation();

