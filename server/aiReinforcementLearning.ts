/**
 * AI REINFORCEMENT LEARNING FRAMEWORK
 * 
 * Optimizes CI/validation decisions based on weighted objectives
 * Learns from successful patterns and escalates repeating faults
 */

import { z } from 'zod';

// ============================================================================
// TYPES
// ============================================================================

export interface ObjectiveWeights {
  functionalStability: number; // 0-1, default 0.35
  integrationCohesion: number; // 0-1, default 0.25
  perceptionAcceptance: number; // 0-1, default 0.20
  performanceLatency: number; // 0-1, default 0.10
  uxClarity: number; // 0-1, default 0.10
}

export interface ReinforcementMetrics {
  functionalStabilityScore: number; // 0-10
  integrationCohesionScore: number; // 0-10
  perceptionAcceptanceScore: number; // 0-10
  performanceLatencyScore: number; // 0-10
  uxClarityScore: number; // 0-10
  weightedScore: number; // 0-10
}

export interface Decision {
  id: string;
  timestamp: Date;
  context: string;
  options: DecisionOption[];
  selectedOption: DecisionOption;
  metrics: ReinforcementMetrics;
  reward: number; // -1 to +1
  reasoning: string;
  decisionPath: string[];
}

export interface DecisionOption {
  id: string;
  name: string;
  description: string;
  estimatedMetrics: Partial<ReinforcementMetrics>;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface SuccessfulPattern {
  id: string;
  pattern: string;
  context: string;
  successRate: number; // 0-1
  timesApplied: number;
  lastApplied: Date;
  metrics: ReinforcementMetrics;
}

export interface RepeatingFault {
  id: string;
  faultType: string;
  occurrences: number;
  lastOccurrence: Date;
  escalationLevel: number; // 1-5
  suggestedActions: string[];
}

// ============================================================================
// AI REINFORCEMENT LEARNING FRAMEWORK
// ============================================================================

export class AIReinforcementLearning {
  private objectiveWeights: ObjectiveWeights = {
    functionalStability: 0.35,
    integrationCohesion: 0.25,
    perceptionAcceptance: 0.20,
    performanceLatency: 0.10,
    uxClarity: 0.10,
  };

  private decisions: Decision[] = [];
  private successfulPatterns: Map<string, SuccessfulPattern> = new Map();
  private repeatingFaults: Map<string, RepeatingFault> = new Map();
  private patternMemory: Map<string, number> = new Map(); // pattern -> success rate

  // Reward thresholds
  private rewardThresholds = {
    crossModuleSuccess: 0.8,
    firstPassAcceptance: 0.95,
    latency: 1000, // milliseconds
    dataLoss: 0,
  };

  // Penalty thresholds
  private penaltyThresholds = {
    regression: -0.5,
    breakingChange: -0.8,
    unclearOutput: -0.3,
  };

  constructor() {
    this.initializePatterns();
  }

  /**
   * Initialize common successful patterns
   */
  private initializePatterns(): void {
    // Pattern 1: Successful quote generation
    this.successfulPatterns.set('quote_generation_success', {
      id: 'pattern-quote-gen',
      pattern: 'quote_generation_with_validation',
      context: 'Generate quote with pricing validation',
      successRate: 0.92,
      timesApplied: 156,
      lastApplied: new Date(),
      metrics: {
        functionalStabilityScore: 9.2,
        integrationCohesionScore: 8.8,
        perceptionAcceptanceScore: 8.9,
        performanceLatencyScore: 9.1,
        uxClarityScore: 8.7,
        weightedScore: 8.94,
      },
    });

    // Pattern 2: Invoice generation with compliance
    this.successfulPatterns.set('invoice_generation_success', {
      id: 'pattern-invoice-gen',
      pattern: 'invoice_generation_with_compliance_check',
      context: 'Generate invoice with compliance validation',
      successRate: 0.89,
      timesApplied: 142,
      lastApplied: new Date(),
      metrics: {
        functionalStabilityScore: 8.9,
        integrationCohesionScore: 8.6,
        perceptionAcceptanceScore: 8.7,
        performanceLatencyScore: 8.9,
        uxClarityScore: 8.5,
        weightedScore: 8.72,
      },
    });

    // Pattern 3: Data sync with conflict resolution
    this.successfulPatterns.set('data_sync_success', {
      id: 'pattern-data-sync',
      pattern: 'data_sync_with_conflict_resolution',
      context: 'Synchronize data across modules with conflict handling',
      successRate: 0.87,
      timesApplied: 234,
      lastApplied: new Date(),
      metrics: {
        functionalStabilityScore: 8.7,
        integrationCohesionScore: 9.1,
        perceptionAcceptanceScore: 8.4,
        performanceLatencyScore: 8.8,
        uxClarityScore: 8.3,
        weightedScore: 8.66,
      },
    });

    // Pattern 4: Error recovery
    this.successfulPatterns.set('error_recovery_success', {
      id: 'pattern-error-recovery',
      pattern: 'error_detection_and_auto_recovery',
      context: 'Detect and automatically recover from errors',
      successRate: 0.91,
      timesApplied: 89,
      lastApplied: new Date(),
      metrics: {
        functionalStabilityScore: 9.3,
        integrationCohesionScore: 8.9,
        perceptionAcceptanceScore: 8.6,
        performanceLatencyScore: 8.7,
        uxClarityScore: 8.4,
        weightedScore: 8.78,
      },
    });
  }

  /**
   * Make decision based on weighted objectives
   */
  makeDecision(context: string, options: DecisionOption[]): Decision {
    const decisionId = `decision-${Date.now()}-${Math.random()}`;
    const decisionPath: string[] = [];

    console.log(`[ARL] Making decision for context: ${context}`);

    // Score each option
    const scoredOptions = options.map((option) => {
      const score = this.scoreOption(option);
      return { option, score };
    });

    // Select best option
    const selectedOption = scoredOptions.reduce((best, current) =>
      current.score > best.score ? current : best
    ).option;

    decisionPath.push(`Evaluated ${options.length} options`);

    // Check if this matches a successful pattern
    const matchingPattern = this.findMatchingPattern(context);
    if (matchingPattern) {
      decisionPath.push(`Matched successful pattern: ${matchingPattern.pattern}`);
      decisionPath.push(`Pattern success rate: ${(matchingPattern.successRate * 100).toFixed(1)}%`);
    }

    // Calculate metrics for selected option
    const metrics = this.calculateMetrics(selectedOption, matchingPattern);
    decisionPath.push(`Calculated weighted score: ${metrics.weightedScore.toFixed(1)}/10`);

    // Calculate reward
    const reward = this.calculateReward(metrics);
    decisionPath.push(`Estimated reward: ${reward.toFixed(2)}`);

    const reasoning = `Selected "${selectedOption.name}" based on weighted objectives. ` +
      `Functional Stability: ${metrics.functionalStabilityScore.toFixed(1)}/10, ` +
      `Integration Cohesion: ${metrics.integrationCohesionScore.toFixed(1)}/10, ` +
      `Perception Acceptance: ${metrics.perceptionAcceptanceScore.toFixed(1)}/10`;

    const decision: Decision = {
      id: decisionId,
      timestamp: new Date(),
      context,
      options,
      selectedOption,
      metrics,
      reward,
      reasoning,
      decisionPath,
    };

    this.decisions.push(decision);

    // Enforce retention
    if (this.decisions.length > 10000) {
      this.decisions = this.decisions.slice(-5000);
    }

    console.log(`[ARL] Decision made: ${selectedOption.name} (reward: ${reward.toFixed(2)})`);

    return decision;
  }

  /**
   * Score option based on weighted objectives
   */
  private scoreOption(option: DecisionOption): number {
    const metrics = option.estimatedMetrics;

    const functionalScore = (metrics.functionalStabilityScore || 5) * this.objectiveWeights.functionalStability;
    const integrationScore = (metrics.integrationCohesionScore || 5) * this.objectiveWeights.integrationCohesion;
    const perceptionScore = (metrics.perceptionAcceptanceScore || 5) * this.objectiveWeights.perceptionAcceptance;
    const performanceScore = (metrics.performanceLatencyScore || 5) * this.objectiveWeights.performanceLatency;
    const uxScore = (metrics.uxClarityScore || 5) * this.objectiveWeights.uxClarity;

    // Apply risk penalty
    const riskPenalty = option.riskLevel === 'high' ? 0.9 : option.riskLevel === 'medium' ? 0.95 : 1.0;

    return (functionalScore + integrationScore + perceptionScore + performanceScore + uxScore) * riskPenalty;
  }

  /**
   * Find matching successful pattern
   */
  private findMatchingPattern(context: string): SuccessfulPattern | null {
    for (const [, pattern] of this.successfulPatterns) {
      if (pattern.context.toLowerCase().includes(context.toLowerCase()) ||
          context.toLowerCase().includes(pattern.context.toLowerCase())) {
        return pattern;
      }
    }
    return null;
  }

  /**
   * Calculate metrics for option
   */
  private calculateMetrics(option: DecisionOption, matchingPattern: SuccessfulPattern | null): ReinforcementMetrics {
    const baseMetrics = option.estimatedMetrics;

    // If matching pattern exists, use its metrics as baseline
    if (matchingPattern) {
      return {
        functionalStabilityScore: baseMetrics.functionalStabilityScore || matchingPattern.metrics.functionalStabilityScore,
        integrationCohesionScore: baseMetrics.integrationCohesionScore || matchingPattern.metrics.integrationCohesionScore,
        perceptionAcceptanceScore: baseMetrics.perceptionAcceptanceScore || matchingPattern.metrics.perceptionAcceptanceScore,
        performanceLatencyScore: baseMetrics.performanceLatencyScore || matchingPattern.metrics.performanceLatencyScore,
        uxClarityScore: baseMetrics.uxClarityScore || matchingPattern.metrics.uxClarityScore,
        weightedScore: 0, // Will be calculated below
      };
    }

    // Otherwise use provided metrics or defaults
    const metrics: ReinforcementMetrics = {
      functionalStabilityScore: baseMetrics.functionalStabilityScore || 6,
      integrationCohesionScore: baseMetrics.integrationCohesionScore || 6,
      perceptionAcceptanceScore: baseMetrics.perceptionAcceptanceScore || 6,
      performanceLatencyScore: baseMetrics.performanceLatencyScore || 6,
      uxClarityScore: baseMetrics.uxClarityScore || 6,
      weightedScore: 0,
    };

    // Calculate weighted score
    metrics.weightedScore =
      metrics.functionalStabilityScore * this.objectiveWeights.functionalStability +
      metrics.integrationCohesionScore * this.objectiveWeights.integrationCohesion +
      metrics.perceptionAcceptanceScore * this.objectiveWeights.perceptionAcceptance +
      metrics.performanceLatencyScore * this.objectiveWeights.performanceLatency +
      metrics.uxClarityScore * this.objectiveWeights.uxClarity;

    return metrics;
  }

  /**
   * Calculate reward
   */
  private calculateReward(metrics: ReinforcementMetrics): number {
    let reward = 0;

    // Reward for cross-module success
    if (metrics.integrationCohesionScore >= 8) reward += 0.2;

    // Reward for first-pass acceptance
    if (metrics.perceptionAcceptanceScore >= 9.5) reward += 0.3;

    // Reward for latency
    if (metrics.performanceLatencyScore >= 9) reward += 0.2;

    // Reward for functional stability
    if (metrics.functionalStabilityScore >= 9) reward += 0.2;

    // Reward for UX clarity
    if (metrics.uxClarityScore >= 8.5) reward += 0.1;

    // Normalize to -1 to +1 range
    return Math.max(-1, Math.min(1, reward - 0.5));
  }

  /**
   * Record decision outcome
   */
  recordOutcome(decisionId: string, actualMetrics: ReinforcementMetrics, success: boolean): void {
    const decision = this.decisions.find((d) => d.id === decisionId);
    if (!decision) return;

    console.log(`[ARL] Recording outcome for decision: ${decisionId}`);

    // Update pattern memory
    const patternKey = `${decision.context}-${decision.selectedOption.id}`;
    const currentRate = this.patternMemory.get(patternKey) || 0;
    const newRate = (currentRate + (success ? 1 : 0)) / 2;
    this.patternMemory.set(patternKey, newRate);

    // Update or create successful pattern
    if (success) {
      const existingPattern = this.successfulPatterns.get(patternKey);
      if (existingPattern) {
        existingPattern.successRate = newRate;
        existingPattern.timesApplied += 1;
        existingPattern.lastApplied = new Date();
        existingPattern.metrics = actualMetrics;
      } else {
        this.successfulPatterns.set(patternKey, {
          id: `pattern-${Date.now()}`,
          pattern: `${decision.context}-${decision.selectedOption.name}`,
          context: decision.context,
          successRate: newRate,
          timesApplied: 1,
          lastApplied: new Date(),
          metrics: actualMetrics,
        });
      }
    } else {
      // Record repeating fault
      const faultKey = `${decision.context}-failure`;
      const existingFault = this.repeatingFaults.get(faultKey);

      if (existingFault) {
        existingFault.occurrences += 1;
        existingFault.lastOccurrence = new Date();
        existingFault.escalationLevel = Math.min(5, existingFault.escalationLevel + 1);
      } else {
        this.repeatingFaults.set(faultKey, {
          id: `fault-${Date.now()}`,
          faultType: decision.context,
          occurrences: 1,
          lastOccurrence: new Date(),
          escalationLevel: 1,
          suggestedActions: this.generateSuggestedActions(decision.context),
        });
      }
    }
  }

  /**
   * Generate suggested actions for repeating faults
   */
  private generateSuggestedActions(context: string): string[] {
    const actions: string[] = [];

    if (context.includes('quote')) {
      actions.push('Review quote generation logic');
      actions.push('Verify pricing calculations');
      actions.push('Check compliance language');
    }

    if (context.includes('invoice')) {
      actions.push('Review invoice generation logic');
      actions.push('Verify payment terms');
      actions.push('Check tax calculations');
    }

    if (context.includes('sync')) {
      actions.push('Check data synchronization logic');
      actions.push('Verify conflict resolution');
      actions.push('Review database consistency');
    }

    if (context.includes('error')) {
      actions.push('Review error handling logic');
      actions.push('Check recovery procedures');
      actions.push('Verify logging');
    }

    return actions;
  }

  /**
   * Get successful patterns
   */
  getSuccessfulPatterns(limit: number = 50): SuccessfulPattern[] {
    return Array.from(this.successfulPatterns.values())
      .sort((a, b) => b.successRate - a.successRate)
      .slice(0, limit);
  }

  /**
   * Get repeating faults
   */
  getRepeatingFaults(limit: number = 50): RepeatingFault[] {
    return Array.from(this.repeatingFaults.values())
      .sort((a, b) => b.escalationLevel - a.escalationLevel)
      .slice(0, limit);
  }

  /**
   * Get decision history
   */
  getDecisionHistory(limit: number = 50): Decision[] {
    return this.decisions.slice(-limit);
  }

  /**
   * Get learning statistics
   */
  getLearningStatistics(): {
    totalDecisions: number;
    averageReward: number;
    successfulPatterns: number;
    repeatingFaults: number;
    topPattern: SuccessfulPattern | null;
    criticalFaults: RepeatingFault[];
  } {
    const total = this.decisions.length;
    const avgReward = total > 0 ? this.decisions.reduce((sum, d) => sum + d.reward, 0) / total : 0;
    const patterns = Array.from(this.successfulPatterns.values());
    const topPattern = patterns.length > 0 ? patterns.sort((a, b) => b.successRate - a.successRate)[0] : null;
    const faults = Array.from(this.repeatingFaults.values());
    const criticalFaults = faults.filter((f) => f.escalationLevel >= 4);

    return {
      totalDecisions: total,
      averageReward: Math.round(avgReward * 100) / 100,
      successfulPatterns: patterns.length,
      repeatingFaults: faults.length,
      topPattern,
      criticalFaults,
    };
  }

  /**
   * Set objective weights
   */
  setObjectiveWeights(weights: Partial<ObjectiveWeights>): void {
    this.objectiveWeights = { ...this.objectiveWeights, ...weights };

    // Normalize weights to sum to 1.0
    const total = Object.values(this.objectiveWeights).reduce((a, b) => a + b, 0);
    for (const key in this.objectiveWeights) {
      this.objectiveWeights[key as keyof ObjectiveWeights] /= total;
    }

    console.log(`[ARL] Objective weights updated:`, this.objectiveWeights);
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export const aiReinforcementLearning = new AIReinforcementLearning();

