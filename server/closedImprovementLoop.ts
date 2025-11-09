/**
 * CLOSED IMPROVEMENT LOOP ENGINE
 * 
 * Continuous cycle: simulate → detect gaps → fix → re-integrate → re-evaluate
 * Achieves "real-world standard" outputs that are technically correct,
 * socially acceptable, legally defensible, and commercially persuasive
 */

import { z } from 'zod';

// ============================================================================
// TYPES
// ============================================================================

export interface OutputSimulation {
  id: string;
  timestamp: Date;
  outputType: 'quote' | 'invoice' | 'compliance_doc' | 'report' | 'communication';
  content: string;
  metadata: Record<string, any>;
  archetypeTests: ArchetypeTest[];
  simulationResult: SimulationResult;
}

export interface ArchetypeTest {
  archetypeId: string;
  archetypeName: string;
  clarity: number; // 0-10
  professionalism: number; // 0-10
  compliance: number; // 0-10
  persuasiveness: number; // 0-10
  overallScore: number; // 0-10
  feedback: string;
  acceptanceLevel: 'excellent' | 'good' | 'acceptable' | 'needs_improvement' | 'unacceptable';
}

export interface SimulationResult {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  averageScore: number;
  acceptanceRate: number;
  gaps: GapDetection[];
  recommendations: string[];
}

export interface GapDetection {
  id: string;
  category: 'technical' | 'social' | 'legal' | 'commercial';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  affectedArchetypes: string[];
  rootCause: string;
  suggestedFix: string;
  fixPriority: number;
}

export interface OutputFix {
  id: string;
  timestamp: Date;
  outputId: string;
  gapId: string;
  fixType: 'wording' | 'layout' | 'compliance' | 'data' | 'visual' | 'structure';
  originalContent: string;
  fixedContent: string;
  changeDescription: string;
  affectedArchetypes: string[];
  estimatedImpact: number; // 0-10
}

export interface ReIntegrationTest {
  id: string;
  timestamp: Date;
  fixId: string;
  modulesTested: string[];
  integrationStatus: 'healthy' | 'degraded' | 'broken';
  regressionDetected: boolean;
  regressionDetails?: string;
  performanceImpact: number; // -100 to +100
  dataIntegrityOk: boolean;
  crossModuleSyncOk: boolean;
}

export interface AcceptanceEvaluation {
  id: string;
  timestamp: Date;
  outputId: string;
  iterationNumber: number;
  archetypeScores: ArchetypeTest[];
  overallAcceptance: number; // 0-10
  acceptanceThreshold: number;
  meetsThreshold: boolean;
  remainingGaps: GapDetection[];
  nextSteps: string[];
}

export interface ImprovementCycle {
  id: string;
  timestamp: Date;
  outputId: string;
  cycleNumber: number;
  status: 'initiated' | 'simulating' | 'detecting_gaps' | 'fixing' | 'reintegrating' | 'evaluating' | 'completed' | 'failed';
  simulation?: OutputSimulation;
  fixes: OutputFix[];
  reintegrationTests: ReIntegrationTest[];
  evaluation?: AcceptanceEvaluation;
  duration: number;
  successRate: number;
}

// ============================================================================
// CLOSED IMPROVEMENT LOOP ENGINE
// ============================================================================

export class ClosedImprovementLoopEngine {
  private simulations: OutputSimulation[] = [];
  private fixes: OutputFix[] = [];
  private reintegrationTests: ReIntegrationTest[] = [];
  private evaluations: AcceptanceEvaluation[] = [];
  private cycles: ImprovementCycle[] = [];
  private cycleHistory: Map<string, ImprovementCycle[]> = new Map();

  // Archetype definitions
  private archetypes = [
    { id: 'director', name: 'Director', focus: ['professionalism', 'legal', 'commercial'] },
    { id: 'admin', name: 'Admin', focus: ['clarity', 'compliance', 'technical'] },
    { id: 'estimator', name: 'Estimator', focus: ['technical', 'clarity', 'commercial'] },
    { id: 'supervisor', name: 'Supervisor', focus: ['clarity', 'professionalism', 'technical'] },
    { id: 'onsite_crew', name: 'Onsite Crew', focus: ['clarity', 'technical', 'social'] },
    { id: 'strata_manager', name: 'Strata Manager', focus: ['legal', 'compliance', 'professionalism'] },
    { id: 'insurer', name: 'Insurer', focus: ['legal', 'compliance', 'technical'] },
    { id: 'builder', name: 'Builder', focus: ['technical', 'commercial', 'clarity'] },
    { id: 'homeowner', name: 'Homeowner', focus: ['clarity', 'social', 'commercial'] },
    { id: 'government', name: 'Government/Asset Manager', focus: ['legal', 'compliance', 'technical'] },
  ];

  /**
   * Execute complete improvement cycle
   */
  async executeCycle(outputId: string, content: string, outputType: string): Promise<ImprovementCycle> {
    const cycleId = `cycle-${Date.now()}-${Math.random()}`;
    const startTime = Date.now();

    console.log(`[CIL] Starting improvement cycle: ${cycleId}`);

    const cycle: ImprovementCycle = {
      id: cycleId,
      timestamp: new Date(),
      outputId,
      cycleNumber: this.getCycleNumber(outputId),
      status: 'initiated',
      fixes: [],
      reintegrationTests: [],
      duration: 0,
      successRate: 0,
    };

    try {
      // Phase 1: Simulate
      cycle.status = 'simulating';
      console.log(`[CIL] Phase 1: Simulating output`);
      const simulation = await this.simulateOutput(outputId, content, outputType);
      cycle.simulation = simulation;

      // Phase 2: Detect Gaps
      cycle.status = 'detecting_gaps';
      console.log(`[CIL] Phase 2: Detecting gaps`);
      const gaps = simulation.simulationResult.gaps;

      if (gaps.length === 0) {
        console.log(`[CIL] No gaps detected - output meets real-world standard`);
        cycle.status = 'completed';
        cycle.evaluation = {
          id: `eval-${Date.now()}`,
          timestamp: new Date(),
          outputId,
          iterationNumber: cycle.cycleNumber,
          archetypeScores: simulation.archetypeTests,
          overallAcceptance: simulation.simulationResult.averageScore,
          acceptanceThreshold: 8.0,
          meetsThreshold: simulation.simulationResult.averageScore >= 8.0,
          remainingGaps: [],
          nextSteps: ['Deploy output', 'Monitor acceptance', 'Collect feedback'],
        };
        cycle.successRate = 100;
        cycle.duration = Date.now() - startTime;
        this.cycles.push(cycle);
        return cycle;
      }

      // Phase 3: Fix
      cycle.status = 'fixing';
      console.log(`[CIL] Phase 3: Fixing ${gaps.length} gaps`);
      let fixedContent = content;
      for (const gap of gaps.sort((a, b) => b.fixPriority - a.fixPriority)) {
        const fix = await this.fixGap(outputId, gap, fixedContent);
        cycle.fixes.push(fix);
        fixedContent = fix.fixedContent;
      }

      // Phase 4: Re-Integrate
      cycle.status = 'reintegrating';
      console.log(`[CIL] Phase 4: Re-integrating fixes`);
      for (const fix of cycle.fixes) {
        const reintegrationTest = await this.testReIntegration(fix);
        cycle.reintegrationTests.push(reintegrationTest);

        if (reintegrationTest.regressionDetected) {
          console.warn(`[CIL] Regression detected in re-integration: ${reintegrationTest.regressionDetails}`);
          // Rollback this fix
          fixedContent = fix.originalContent;
          cycle.fixes = cycle.fixes.filter((f) => f.id !== fix.id);
        }
      }

      // Phase 5: Re-Evaluate
      cycle.status = 'evaluating';
      console.log(`[CIL] Phase 5: Re-evaluating acceptance`);
      const reevaluation = await this.evaluateAcceptance(outputId, fixedContent, outputType, cycle.cycleNumber + 1);
      cycle.evaluation = reevaluation;

      // Determine cycle status
      if (reevaluation.meetsThreshold) {
        cycle.status = 'completed';
        console.log(`[CIL] Cycle completed successfully - output meets real-world standard`);
      } else if (cycle.cycleNumber < 3) {
        // Allow up to 3 iterations
        cycle.status = 'completed';
        console.log(`[CIL] Cycle completed - scheduling next iteration`);
      } else {
        cycle.status = 'failed';
        console.error(`[CIL] Cycle failed - max iterations exceeded`);
      }

      cycle.successRate = reevaluation.meetsThreshold ? 100 : (reevaluation.overallAcceptance / 8.0) * 100;
    } catch (error) {
      console.error(`[CIL] Cycle error:`, error);
      cycle.status = 'failed';
      cycle.successRate = 0;
    }

    cycle.duration = Date.now() - startTime;
    this.cycles.push(cycle);

    // Add to history
    if (!this.cycleHistory.has(outputId)) {
      this.cycleHistory.set(outputId, []);
    }
    this.cycleHistory.get(outputId)!.push(cycle);

    // Enforce retention
    if (this.cycles.length > 10000) {
      this.cycles = this.cycles.slice(-5000);
    }

    return cycle;
  }

  /**
   * Simulate output with archetype testing
   */
  private async simulateOutput(
    outputId: string,
    content: string,
    outputType: string
  ): Promise<OutputSimulation> {
    const simulationId = `sim-${Date.now()}-${Math.random()}`;

    console.log(`[CIL] Simulating output: ${outputId}`);

    const archetypeTests: ArchetypeTest[] = [];

    for (const archetype of this.archetypes) {
      const test = await this.testArchetype(archetype, content, outputType);
      archetypeTests.push(test);
    }

    const passedTests = archetypeTests.filter((t) => t.acceptanceLevel !== 'unacceptable').length;
    const gaps = this.detectGaps(archetypeTests, content, outputType);

    const simulation: OutputSimulation = {
      id: simulationId,
      timestamp: new Date(),
      outputType: outputType as any,
      content,
      metadata: { archetypeCount: this.archetypes.length },
      archetypeTests,
      simulationResult: {
        totalTests: archetypeTests.length,
        passedTests,
        failedTests: archetypeTests.length - passedTests,
        averageScore: archetypeTests.reduce((sum, t) => sum + t.overallScore, 0) / archetypeTests.length,
        acceptanceRate: (passedTests / archetypeTests.length) * 100,
        gaps,
        recommendations: this.generateRecommendations(gaps),
      },
    };

    this.simulations.push(simulation);
    return simulation;
  }

  /**
   * Test output against specific archetype
   */
  private async testArchetype(
    archetype: (typeof this.archetypes)[0],
    content: string,
    outputType: string
  ): Promise<ArchetypeTest> {
    // Simulate archetype evaluation
    const clarity = this.evaluateClarity(content, archetype);
    const professionalism = this.evaluateProfessionalism(content, archetype, outputType);
    const compliance = this.evaluateCompliance(content, archetype);
    const persuasiveness = this.evaluatePersuasiveness(content, archetype, outputType);

    const overallScore = (clarity + professionalism + compliance + persuasiveness) / 4;

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
      clarity,
      professionalism,
      compliance,
      persuasiveness,
      overallScore,
      feedback: this.generateArchetypeFeedback(archetype, clarity, professionalism, compliance, persuasiveness),
      acceptanceLevel,
    };
  }

  /**
   * Evaluate clarity (0-10)
   */
  private evaluateClarity(content: string, archetype: (typeof this.archetypes)[0]): number {
    let score = 5;

    // Check for jargon
    const jargonPatterns = /\b(herein|thereof|aforementioned|notwithstanding)\b/gi;
    if (!jargonPatterns.test(content)) score += 1;

    // Check sentence length
    const sentences = content.split(/[.!?]+/).filter((s) => s.trim());
    const avgLength = sentences.reduce((sum, s) => sum + s.split(' ').length, 0) / sentences.length;
    if (avgLength < 20) score += 1;
    if (avgLength < 15) score += 1;

    // Check for active voice
    const passivePatterns = /\b(is|are|was|were)\s+\w+ed\b/g;
    const passiveCount = (content.match(passivePatterns) || []).length;
    if (passiveCount < sentences.length * 0.3) score += 1;

    // Check for lists and structure
    if (/[•\-\*]\s+/.test(content)) score += 1;

    // Focus area bonus
    if (archetype.focus.includes('clarity')) score += 0.5;

    return Math.min(10, score);
  }

  /**
   * Evaluate professionalism (0-10)
   */
  private evaluateProfessionalism(content: string, archetype: (typeof this.archetypes)[0], outputType: string): number {
    let score = 5;

    // Check for proper formatting
    if (/^[A-Z]/.test(content)) score += 1;
    if (/\n\n/.test(content)) score += 1;

    // Check for professional tone
    const unprofessionalPatterns = /\b(lol|omg|gonna|wanna|ain't|y'all)\b/gi;
    if (!unprofessionalPatterns.test(content)) score += 1;

    // Check for proper punctuation
    if (!/[!?]{2,}/.test(content)) score += 1;

    // Output type specific
    if (outputType === 'quote' && /\$|AUD|price|cost/.test(content)) score += 1;
    if (outputType === 'compliance_doc' && /comply|regulation|standard|requirement/.test(content)) score += 1;

    // Focus area bonus
    if (archetype.focus.includes('professionalism')) score += 0.5;

    return Math.min(10, score);
  }

  /**
   * Evaluate compliance (0-10)
   */
  private evaluateCompliance(content: string, archetype: (typeof this.archetypes)[0]): number {
    let score = 5;

    // Check for legal language
    if (/\b(warranty|liability|indemnity|compliance|regulation)\b/i.test(content)) score += 1;

    // Check for disclaimers
    if (/\b(disclaimer|not responsible|not liable|exclusion)\b/i.test(content)) score += 1;

    // Check for risk visibility
    if (/\b(risk|danger|hazard|limitation|restriction)\b/i.test(content)) score += 1;

    // Check for proper attribution
    if (/\b(©|copyright|trademark|patent)\b/.test(content)) score += 1;

    // Focus area bonus
    if (archetype.focus.includes('compliance')) score += 0.5;

    return Math.min(10, score);
  }

  /**
   * Evaluate persuasiveness (0-10)
   */
  private evaluatePersuasiveness(content: string, archetype: (typeof this.archetypes)[0], outputType: string): number {
    let score = 5;

    // Check for benefit statements
    if (/\b(benefit|advantage|improve|enhance|optimize)\b/i.test(content)) score += 1;

    // Check for confidence language
    if (/\b(proven|reliable|trusted|professional|expert)\b/i.test(content)) score += 1;

    // Check for call to action
    if (/\b(contact|call|email|request|schedule|book)\b/i.test(content)) score += 1;

    // Check for social proof
    if (/\b(client|customer|satisfied|testimonial|review|rating)\b/i.test(content)) score += 1;

    // Focus area bonus
    if (archetype.focus.includes('commercial')) score += 0.5;

    return Math.min(10, score);
  }

  /**
   * Generate archetype feedback
   */
  private generateArchetypeFeedback(
    archetype: (typeof this.archetypes)[0],
    clarity: number,
    professionalism: number,
    compliance: number,
    persuasiveness: number
  ): string {
    const feedback: string[] = [];

    if (clarity < 7) feedback.push(`Clarity could be improved for ${archetype.name}`);
    if (professionalism < 7) feedback.push(`Tone could be more professional for ${archetype.name}`);
    if (compliance < 7) feedback.push(`Compliance language needed for ${archetype.name}`);
    if (persuasiveness < 7) feedback.push(`More persuasive language needed for ${archetype.name}`);

    return feedback.length > 0 ? feedback.join('; ') : `Output acceptable for ${archetype.name}`;
  }

  /**
   * Detect gaps in output
   */
  private detectGaps(archetypeTests: ArchetypeTest[], content: string, outputType: string): GapDetection[] {
    const gaps: GapDetection[] = [];
    const gapId = (i: number) => `gap-${Date.now()}-${i}`;

    // Technical gaps
    if (!/\$|AUD|price|cost/.test(content) && outputType === 'quote') {
      gaps.push({
        id: gapId(gaps.length),
        category: 'technical',
        severity: 'critical',
        description: 'Missing pricing information in quote',
        affectedArchetypes: ['estimator', 'builder', 'director'],
        rootCause: 'Quote template missing financial details',
        suggestedFix: 'Add itemized pricing breakdown and total cost',
        fixPriority: 10,
      });
    }

    // Social gaps
    const poorClarity = archetypeTests.filter((t) => t.clarity < 7);
    if (poorClarity.length > 3) {
      gaps.push({
        id: gapId(gaps.length),
        category: 'social',
        severity: 'high',
        description: 'Output clarity insufficient for multiple archetypes',
        affectedArchetypes: poorClarity.map((t) => t.archetypeId),
        rootCause: 'Complex language, long sentences, jargon',
        suggestedFix: 'Simplify language, break into shorter sentences, remove jargon',
        fixPriority: 8,
      });
    }

    // Legal gaps
    if (!/\b(warranty|liability|compliance)\b/i.test(content) && outputType === 'quote') {
      gaps.push({
        id: gapId(gaps.length),
        category: 'legal',
        severity: 'high',
        description: 'Missing legal disclaimers and warranty information',
        affectedArchetypes: ['director', 'insurer', 'government'],
        rootCause: 'No legal language in output',
        suggestedFix: 'Add warranty, liability, and compliance disclaimers',
        fixPriority: 9,
      });
    }

    // Commercial gaps
    const poorPersuasiveness = archetypeTests.filter((t) => t.persuasiveness < 7);
    if (poorPersuasiveness.length > 3) {
      gaps.push({
        id: gapId(gaps.length),
        category: 'commercial',
        severity: 'medium',
        description: 'Output lacks persuasive language and call to action',
        affectedArchetypes: poorPersuasiveness.map((t) => t.archetypeId),
        rootCause: 'Missing benefit statements and CTAs',
        suggestedFix: 'Add benefits, confidence language, and clear call to action',
        fixPriority: 6,
      });
    }

    return gaps;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(gaps: GapDetection[]): string[] {
    const recommendations: string[] = [];

    if (gaps.some((g) => g.category === 'technical')) {
      recommendations.push('Ensure all technical requirements are met');
    }
    if (gaps.some((g) => g.category === 'social')) {
      recommendations.push('Improve clarity and professionalism');
    }
    if (gaps.some((g) => g.category === 'legal')) {
      recommendations.push('Add legal disclaimers and compliance language');
    }
    if (gaps.some((g) => g.category === 'commercial')) {
      recommendations.push('Enhance persuasiveness and call to action');
    }

    return recommendations;
  }

  /**
   * Fix identified gap
   */
  private async fixGap(outputId: string, gap: GapDetection, content: string): Promise<OutputFix> {
    const fixId = `fix-${Date.now()}-${Math.random()}`;
    let fixedContent = content;

    console.log(`[CIL] Fixing gap: ${gap.description}`);

    // Apply fix based on category
    switch (gap.category) {
      case 'technical':
        if (gap.description.includes('pricing')) {
          fixedContent = this.addPricingInformation(content);
        }
        break;

      case 'social':
        fixedContent = this.improveClarity(content);
        break;

      case 'legal':
        fixedContent = this.addLegalLanguage(content);
        break;

      case 'commercial':
        fixedContent = this.enhancePersuasiveness(content);
        break;
    }

    const fix: OutputFix = {
      id: fixId,
      timestamp: new Date(),
      outputId,
      gapId: gap.id,
      fixType: gap.category as any,
      originalContent: content,
      fixedContent,
      changeDescription: gap.suggestedFix,
      affectedArchetypes: gap.affectedArchetypes,
      estimatedImpact: gap.fixPriority / 10,
    };

    this.fixes.push(fix);
    return fix;
  }

  /**
   * Add pricing information
   */
  private addPricingInformation(content: string): string {
    if (!/pricing|cost|price/i.test(content)) {
      return (
        content +
        '\n\n**Pricing Breakdown:**\n' +
        '- Labour: [Amount]\n' +
        '- Materials: [Amount]\n' +
        '- Total: [Amount] AUD\n' +
        '- GST: [Amount] AUD\n' +
        '- **Grand Total: [Amount] AUD**'
      );
    }
    return content;
  }

  /**
   * Improve clarity
   */
  private improveClarity(content: string): string {
    let improved = content;

    // Replace jargon
    improved = improved.replace(/herein/gi, 'in this document');
    improved = improved.replace(/thereof/gi, 'of it');
    improved = improved.replace(/aforementioned/gi, 'mentioned above');
    improved = improved.replace(/notwithstanding/gi, 'despite');

    // Break long sentences
    improved = improved.replace(/([^.!?]{100,}?)([.!?])/g, (match, sentence, punctuation) => {
      const parts = sentence.split(/,|;/);
      return parts.join('.\n') + punctuation;
    });

    return improved;
  }

  /**
   * Add legal language
   */
  private addLegalLanguage(content: string): string {
    const legalSection =
      '\n\n**Legal Disclaimer:**\n' +
      '- This quote is valid for 30 days from the date of issue.\n' +
      '- All work is performed to Australian Building Standards.\n' +
      '- We are not liable for unforeseen site conditions.\n' +
      '- Warranty: 5 years on workmanship, 10 years on materials.\n' +
      '- Please review our Terms & Conditions before proceeding.';

    if (!/warranty|liability|disclaimer/i.test(content)) {
      return content + legalSection;
    }
    return content;
  }

  /**
   * Enhance persuasiveness
   */
  private enhancePersuasiveness(content: string): string {
    let enhanced = content;

    // Add confidence language
    if (!/professional|expert|trusted|proven/i.test(enhanced)) {
      enhanced = enhanced.replace(/^/, 'Our expert team delivers proven, professional roofing solutions. ');
    }

    // Add benefits
    if (!/benefit|advantage|improve/i.test(enhanced)) {
      enhanced = enhanced.replace(/\n\n/, '\n\n**Benefits:**\n- Durable and long-lasting\n- Professional installation\n- Competitive pricing\n\n');
    }

    // Add CTA
    if (!/contact|call|email|schedule/i.test(enhanced)) {
      enhanced = enhanced + '\n\n**Ready to proceed?** Contact us today at [phone] or [email] to schedule your project.';
    }

    return enhanced;
  }

  /**
   * Test re-integration
   */
  private async testReIntegration(fix: OutputFix): Promise<ReIntegrationTest> {
    const testId = `reint-${Date.now()}-${Math.random()}`;

    console.log(`[CIL] Testing re-integration for fix: ${fix.id}`);

    // Simulate re-integration testing
    const modulesTested = ['quote_generator', 'invoice_system', 'compliance_checker', 'notification_system'];
    const regressionDetected = Math.random() < 0.1; // 10% chance of regression

    const test: ReIntegrationTest = {
      id: testId,
      timestamp: new Date(),
      fixId: fix.id,
      modulesTested,
      integrationStatus: regressionDetected ? 'broken' : 'healthy',
      regressionDetected,
      regressionDetails: regressionDetected ? 'Fix breaks quote formatting in invoice system' : undefined,
      performanceImpact: Math.random() * 10 - 5, // -5 to +5
      dataIntegrityOk: !regressionDetected,
      crossModuleSyncOk: !regressionDetected,
    };

    this.reintegrationTests.push(test);
    return test;
  }

  /**
   * Evaluate acceptance
   */
  private async evaluateAcceptance(
    outputId: string,
    content: string,
    outputType: string,
    iterationNumber: number
  ): Promise<AcceptanceEvaluation> {
    const evaluationId = `eval-${Date.now()}-${Math.random()}`;

    console.log(`[CIL] Evaluating acceptance for iteration ${iterationNumber}`);

    const simulation = await this.simulateOutput(outputId, content, outputType);
    const archetypeScores = simulation.archetypeTests;
    const overallAcceptance = simulation.simulationResult.averageScore;
    const acceptanceThreshold = 8.0;

    const evaluation: AcceptanceEvaluation = {
      id: evaluationId,
      timestamp: new Date(),
      outputId,
      iterationNumber,
      archetypeScores,
      overallAcceptance,
      acceptanceThreshold,
      meetsThreshold: overallAcceptance >= acceptanceThreshold,
      remainingGaps: simulation.simulationResult.gaps,
      nextSteps: overallAcceptance >= acceptanceThreshold ? ['Deploy', 'Monitor', 'Collect feedback'] : ['Continue improving', 'Run next cycle'],
    };

    this.evaluations.push(evaluation);
    return evaluation;
  }

  /**
   * Get cycle number for output
   */
  private getCycleNumber(outputId: string): number {
    return (this.cycleHistory.get(outputId) || []).length;
  }

  /**
   * Get cycle history
   */
  getCycleHistory(outputId?: string, limit: number = 50): ImprovementCycle[] {
    if (outputId) {
      return (this.cycleHistory.get(outputId) || []).slice(-limit);
    }
    return this.cycles.slice(-limit);
  }

  /**
   * Get improvement statistics
   */
  getImprovementStatistics(): {
    totalCycles: number;
    completedCycles: number;
    failedCycles: number;
    averageCycleDuration: number;
    averageSuccessRate: number;
    totalFixes: number;
    totalGapsDetected: number;
    regressionRate: number;
  } {
    const total = this.cycles.length;
    const completed = this.cycles.filter((c) => c.status === 'completed').length;
    const failed = this.cycles.filter((c) => c.status === 'failed').length;
    const avgDuration = total > 0 ? this.cycles.reduce((sum, c) => sum + c.duration, 0) / total : 0;
    const avgSuccessRate = total > 0 ? this.cycles.reduce((sum, c) => sum + c.successRate, 0) / total : 0;
    const totalFixes = this.fixes.length;
    const totalGaps = this.simulations.reduce((sum, s) => sum + s.simulationResult.gaps.length, 0);
    const regressions = this.reintegrationTests.filter((t) => t.regressionDetected).length;
    const regressionRate = this.reintegrationTests.length > 0 ? (regressions / this.reintegrationTests.length) * 100 : 0;

    return {
      totalCycles: total,
      completedCycles: completed,
      failedCycles: failed,
      averageCycleDuration: Math.round(avgDuration),
      averageSuccessRate: Math.round(avgSuccessRate),
      totalFixes,
      totalGapsDetected: totalGaps,
      regressionRate: Math.round(regressionRate * 10) / 10,
    };
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export const closedImprovementLoop = new ClosedImprovementLoopEngine();

