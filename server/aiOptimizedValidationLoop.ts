/**
 * AI-OPTIMIZED VALIDATION LOOP
 * 
 * Integrates reinforcement learning into the CI/validation loop
 * Uses weighted objectives, adaptive learning, and decision path logging
 */

import { aiReinforcementLearning, DecisionOption } from './aiReinforcementLearning';
import { adaptiveLearningMemory } from './adaptiveLearningMemory';
import { decisionPathLogging } from './decisionPathLogging';

// ============================================================================
// TYPES
// ============================================================================

export interface ValidationDecision {
  id: string;
  timestamp: Date;
  context: string;
  selectedOption: string;
  reasoning: string;
  confidence: number;
  reward: number;
  success: boolean;
  metrics: Record<string, number>;
}

export interface AIOptimizationMetrics {
  decisionsCount: number;
  successRate: number;
  averageReward: number;
  averageConfidence: number;
  patternsLearned: number;
  rulesCreated: number;
  faultsEscalated: number;
}

// ============================================================================
// AI-OPTIMIZED VALIDATION LOOP
// ============================================================================

export class AIOptimizedValidationLoop {
  private decisions: ValidationDecision[] = [];
  private isRunning: boolean = false;
  private cycleCount: number = 0;
  private lastCycleTime: Date | null = null;

  constructor() {
    console.log('[AOVL] AI-Optimized Validation Loop initialized');
  }

  /**
   * Make validation decision using AI
   */
  async makeValidationDecision(
    context: string,
    options: Array<{
      id: string;
      name: string;
      description: string;
      estimatedMetrics?: Partial<{
        functionalStabilityScore: number;
        integrationCohesionScore: number;
        perceptionAcceptanceScore: number;
        performanceLatencyScore: number;
        uxClarityScore: number;
      }>;
      riskLevel?: 'low' | 'medium' | 'high';
    }>
  ): Promise<ValidationDecision> {
    console.log(`[AOVL] Making validation decision for context: ${context}`);

    // Convert to DecisionOption format
    const decisionOptions: DecisionOption[] = options.map((opt) => ({
      id: opt.id,
      name: opt.name,
      description: opt.description,
      estimatedMetrics: opt.estimatedMetrics || {},
      riskLevel: opt.riskLevel || 'medium',
    }));

    // Get applicable patterns from adaptive learning
    const applicablePatterns = adaptiveLearningMemory.getApplicablePatterns(context);
    console.log(`[AOVL] Found ${applicablePatterns.length} applicable patterns`);

    // Log decision step: Pattern matching
    decisionPathLogging.logDecisionStep(
      `decision-${Date.now()}`,
      context,
      'evaluation',
      'Pattern Matching',
      `Evaluated ${applicablePatterns.length} applicable patterns`,
      {
        patternsFound: applicablePatterns.length,
        topPatternSuccessRate: applicablePatterns.length > 0 ? applicablePatterns[0].successRate : 0,
      },
      applicablePatterns.map((p) => p.pattern),
      applicablePatterns.length > 0 ? applicablePatterns[0].pattern : '',
      applicablePatterns.length > 0 ? applicablePatterns[0].confidence : 0.5
    );

    // Make decision using AI reinforcement learning
    const decision = aiReinforcementLearning.makeDecision(context, decisionOptions);

    // Log decision step: Option selection
    decisionPathLogging.logDecisionStep(
      decision.id,
      context,
      'selection',
      'Option Selection',
      `Selected "${decision.selectedOption.name}" based on weighted objectives`,
      decision.metrics as Record<string, number>,
      options.map((o) => o.name),
      decision.selectedOption.name,
      Math.max(...Object.values(decision.metrics).map((v) => (typeof v === 'number' ? v : 0))) / 10
    );

    // Create transparency report
    const report = decisionPathLogging.createTransparencyReport(
      decision.id,
      `Validation Decision: ${context}`,
      `Selected "${decision.selectedOption.name}" for ${context}`,
      {
        functionalStability: 0.35,
        integrationCohesion: 0.25,
        perceptionAcceptance: 0.2,
        performanceLatency: 0.1,
        uxClarity: 0.1,
      },
      decision.selectedOption.name,
      decision.reasoning,
      options.map((opt) => ({
        name: opt.name,
        score: (Math.random() * 3 + 6), // Placeholder scoring
        reason: opt.description,
      }))
    );

    // Create validation decision record
    const validationDecision: ValidationDecision = {
      id: decision.id,
      timestamp: new Date(),
      context,
      selectedOption: decision.selectedOption.name,
      reasoning: decision.reasoning,
      confidence: Math.max(...Object.values(decision.metrics).map((v) => (typeof v === 'number' ? v : 0))) / 10,
      reward: decision.reward,
      success: false, // Will be updated after execution
      metrics: decision.metrics as Record<string, number>,
    };

    this.decisions.push(validationDecision);

    // Enforce retention
    if (this.decisions.length > 10000) {
      this.decisions = this.decisions.slice(-5000);
    }

    console.log(`[AOVL] Validation decision made: ${validationDecision.selectedOption} (Reward: ${decision.reward.toFixed(2)})`);

    return validationDecision;
  }

  /**
   * Record validation outcome
   */
  recordValidationOutcome(
    decisionId: string,
    success: boolean,
    metrics: Record<string, number>,
    reward: number
  ): void {
    console.log(`[AOVL] Recording validation outcome - Decision: ${decisionId}, Success: ${success}, Reward: ${reward.toFixed(2)}`);

    // Find decision
    const decision = this.decisions.find((d) => d.id === decisionId);
    if (!decision) {
      console.warn(`[AOVL] Decision not found: ${decisionId}`);
      return;
    }

    // Update decision
    decision.success = success;
    decision.metrics = metrics;

    // Record outcome in AI reinforcement learning
    aiReinforcementLearning.recordOutcome(decisionId, metrics, success);

    // Learn from outcome in adaptive learning
    const patternId = `pattern-${decision.context.replace(/\s+/g, '_')}`;
    adaptiveLearningMemory.learnFromOutcome(patternId, success, reward, { metrics });

    // Record outcome in transparency report
    const reports = decisionPathLogging.getTransparencyReports(1);
    if (reports.length > 0) {
      decisionPathLogging.recordDecisionOutcome(reports[0].id, success, metrics, reward);
    }

    // Log decision step: Outcome
    decisionPathLogging.logDecisionStep(
      decisionId,
      decision.context,
      'outcome',
      'Outcome Recording',
      `Recorded outcome - Success: ${success}, Reward: ${reward.toFixed(2)}`,
      metrics,
      [],
      '',
      success ? 0.9 : 0.3
    );

    console.log(`[AOVL] Validation outcome recorded and patterns updated`);
  }

  /**
   * Start continuous validation loop
   */
  start(): void {
    if (this.isRunning) {
      console.log('[AOVL] Validation loop already running');
      return;
    }

    this.isRunning = true;
    this.cycleCount = 0;
    console.log('[AOVL] AI-Optimized Validation Loop started');

    // Start adaptive learning session
    adaptiveLearningMemory.startSession();
  }

  /**
   * Stop continuous validation loop
   */
  stop(): void {
    if (!this.isRunning) {
      console.log('[AOVL] Validation loop not running');
      return;
    }

    this.isRunning = false;
    console.log('[AOVL] AI-Optimized Validation Loop stopped');

    // End adaptive learning session
    const session = adaptiveLearningMemory.endSession();
    if (session) {
      console.log(`[AOVL] Learning session ended - Decisions: ${session.decisions}, Success Rate: ${((session.successfulDecisions / session.decisions) * 100).toFixed(1)}%`);
    }
  }

  /**
   * Get loop status
   */
  getStatus(): {
    isRunning: boolean;
    cycleCount: number;
    lastCycleTime: Date | null;
    decisionsCount: number;
    successRate: number;
    averageReward: number;
  } {
    const successfulDecisions = this.decisions.filter((d) => d.success).length;
    const successRate = this.decisions.length > 0 ? successfulDecisions / this.decisions.length : 0;
    const averageReward = this.decisions.length > 0 ? this.decisions.reduce((sum, d) => sum + d.reward, 0) / this.decisions.length : 0;

    return {
      isRunning: this.isRunning,
      cycleCount: this.cycleCount,
      lastCycleTime: this.lastCycleTime,
      decisionsCount: this.decisions.length,
      successRate,
      averageReward,
    };
  }

  /**
   * Get optimization metrics
   */
  getOptimizationMetrics(): AIOptimizationMetrics {
    const learningStats = aiReinforcementLearning.getLearningStatistics();
    const memoryStats = adaptiveLearningMemory.getMemoryStatistics();
    const successfulDecisions = this.decisions.filter((d) => d.success).length;
    const successRate = this.decisions.length > 0 ? successfulDecisions / this.decisions.length : 0;

    return {
      decisionsCount: this.decisions.length,
      successRate: Math.round(successRate * 100) / 100,
      averageReward: learningStats.averageReward,
      averageConfidence: this.decisions.length > 0 ? this.decisions.reduce((sum, d) => sum + d.confidence, 0) / this.decisions.length : 0,
      patternsLearned: memoryStats.totalPatterns,
      rulesCreated: memoryStats.totalRules,
      faultsEscalated: learningStats.criticalFaults.length,
    };
  }

  /**
   * Get decision history
   */
  getDecisionHistory(limit: number = 50): ValidationDecision[] {
    return this.decisions.slice(-limit);
  }

  /**
   * Increment cycle count
   */
  incrementCycle(): void {
    this.cycleCount += 1;
    this.lastCycleTime = new Date();
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export const aiOptimizedValidationLoop = new AIOptimizedValidationLoop();

