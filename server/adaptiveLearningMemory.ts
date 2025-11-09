/**
 * ADAPTIVE LEARNING & PATTERN MEMORY SYSTEM
 * 
 * Enables the AI to learn from experience, remember successful patterns,
 * and escalate repeating faults automatically
 */

import { z } from 'zod';

// ============================================================================
// TYPES
// ============================================================================

export interface PatternMemoryEntry {
  id: string;
  pattern: string;
  context: string;
  successRate: number; // 0-1
  failureRate: number; // 0-1
  lastUsed: Date;
  timesUsed: number;
  averageReward: number; // -1 to +1
  confidence: number; // 0-1, increases with usage
  metadata: Record<string, any>;
}

export interface AdaptiveRule {
  id: string;
  condition: string;
  action: string;
  successRate: number;
  priority: number;
  lastApplied: Date;
  applicableContexts: string[];
}

export interface LearningSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  decisions: number;
  successfulDecisions: number;
  failedDecisions: number;
  patternsLearned: number;
  rulesCreated: number;
  faultsEscalated: number;
  sessionReward: number;
}

export interface MemoryStatistics {
  totalPatterns: number;
  totalRules: number;
  averageSuccessRate: number;
  averageConfidence: number;
  topPatterns: PatternMemoryEntry[];
  recentLearning: PatternMemoryEntry[];
}

// ============================================================================
// ADAPTIVE LEARNING & PATTERN MEMORY
// ============================================================================

export class AdaptiveLearningMemory {
  private patternMemory: Map<string, PatternMemoryEntry> = new Map();
  private adaptiveRules: Map<string, AdaptiveRule> = new Map();
  private learningSessions: LearningSession[] = [];
  private currentSession: LearningSession | null = null;
  private learningRate: number = 0.1; // How quickly to update patterns (0-1)
  private confidenceThreshold: number = 0.7; // Minimum confidence to use pattern

  constructor() {
    this.initializePatterns();
    this.startSession();
  }

  /**
   * Initialize base patterns from successful examples
   */
  private initializePatterns(): void {
    // Pattern: Quote generation with validation
    this.patternMemory.set('quote_with_validation', {
      id: 'pattern-quote-val',
      pattern: 'quote_generation_with_pricing_validation',
      context: 'Generate quote with automatic pricing validation',
      successRate: 0.92,
      failureRate: 0.08,
      lastUsed: new Date(),
      timesUsed: 156,
      averageReward: 0.78,
      confidence: 0.95,
      metadata: {
        avgDuration: 450,
        avgScore: 8.9,
        commonIssues: ['missing_breakdown', 'unclear_terms'],
      },
    });

    // Pattern: Invoice with compliance
    this.patternMemory.set('invoice_with_compliance', {
      id: 'pattern-invoice-comp',
      pattern: 'invoice_generation_with_compliance_check',
      context: 'Generate invoice with automatic compliance validation',
      successRate: 0.89,
      failureRate: 0.11,
      lastUsed: new Date(),
      timesUsed: 142,
      averageReward: 0.72,
      confidence: 0.92,
      metadata: {
        avgDuration: 380,
        avgScore: 8.7,
        commonIssues: ['missing_tax_info', 'unclear_payment_terms'],
      },
    });

    // Pattern: Data sync with conflict resolution
    this.patternMemory.set('data_sync_conflict', {
      id: 'pattern-sync-conflict',
      pattern: 'data_sync_with_conflict_resolution',
      context: 'Synchronize data across modules with automatic conflict handling',
      successRate: 0.87,
      failureRate: 0.13,
      lastUsed: new Date(),
      timesUsed: 234,
      averageReward: 0.68,
      confidence: 0.91,
      metadata: {
        avgDuration: 320,
        avgScore: 8.6,
        commonIssues: ['timestamp_conflicts', 'data_mismatch'],
      },
    });

    // Pattern: Error detection and recovery
    this.patternMemory.set('error_recovery', {
      id: 'pattern-error-recovery',
      pattern: 'error_detection_and_auto_recovery',
      context: 'Detect errors and automatically recover without user intervention',
      successRate: 0.91,
      failureRate: 0.09,
      lastUsed: new Date(),
      timesUsed: 89,
      averageReward: 0.75,
      confidence: 0.93,
      metadata: {
        avgDuration: 280,
        avgScore: 8.8,
        commonIssues: ['timeout_errors', 'connection_failures'],
      },
    });

    // Pattern: Notification delivery
    this.patternMemory.set('notification_delivery', {
      id: 'pattern-notif-delivery',
      pattern: 'notification_generation_and_delivery',
      context: 'Generate and deliver notifications with proper formatting',
      successRate: 0.88,
      failureRate: 0.12,
      lastUsed: new Date(),
      timesUsed: 567,
      averageReward: 0.70,
      confidence: 0.94,
      metadata: {
        avgDuration: 150,
        avgScore: 8.5,
        commonIssues: ['formatting_issues', 'delivery_delays'],
      },
    });
  }

  /**
   * Start learning session
   */
  startSession(): void {
    this.currentSession = {
      id: `session-${Date.now()}`,
      startTime: new Date(),
      decisions: 0,
      successfulDecisions: 0,
      failedDecisions: 0,
      patternsLearned: 0,
      rulesCreated: 0,
      faultsEscalated: 0,
      sessionReward: 0,
    };

    console.log(`[ALM] Learning session started: ${this.currentSession.id}`);
  }

  /**
   * End learning session
   */
  endSession(): LearningSession | null {
    if (!this.currentSession) return null;

    this.currentSession.endTime = new Date();
    this.learningSessions.push(this.currentSession);

    // Enforce retention
    if (this.learningSessions.length > 1000) {
      this.learningSessions = this.learningSessions.slice(-500);
    }

    const session = this.currentSession;
    this.currentSession = null;

    console.log(`[ALM] Learning session ended: ${session.id}`);

    return session;
  }

  /**
   * Learn from decision outcome
   */
  learnFromOutcome(
    patternId: string,
    success: boolean,
    reward: number,
    metadata: Record<string, any> = {}
  ): void {
    if (!this.currentSession) {
      this.startSession();
    }

    console.log(`[ALM] Learning from outcome - Pattern: ${patternId}, Success: ${success}, Reward: ${reward}`);

    const pattern = this.patternMemory.get(patternId);
    if (!pattern) {
      console.warn(`[ALM] Pattern not found: ${patternId}`);
      return;
    }

    // Update success/failure rates
    const oldSuccessRate = pattern.successRate;
    if (success) {
      pattern.successRate = oldSuccessRate + this.learningRate * (1 - oldSuccessRate);
      pattern.failureRate = Math.max(0, pattern.failureRate - this.learningRate * 0.5);
      this.currentSession!.successfulDecisions += 1;
    } else {
      pattern.successRate = oldSuccessRate - this.learningRate * oldSuccessRate;
      pattern.failureRate = Math.min(1, pattern.failureRate + this.learningRate * 0.5);
      this.currentSession!.failedDecisions += 1;
    }

    // Update average reward
    const oldReward = pattern.averageReward;
    pattern.averageReward = oldReward + this.learningRate * (reward - oldReward);

    // Update confidence (increases with usage)
    pattern.confidence = Math.min(1, pattern.confidence + 0.01);

    // Update usage tracking
    pattern.timesUsed += 1;
    pattern.lastUsed = new Date();

    // Update metadata
    if (metadata.duration) {
      pattern.metadata.avgDuration = (pattern.metadata.avgDuration || 0) * 0.9 + metadata.duration * 0.1;
    }
    if (metadata.score) {
      pattern.metadata.avgScore = (pattern.metadata.avgScore || 0) * 0.9 + metadata.score * 0.1;
    }

    // Track improvement
    const improvement = pattern.successRate - oldSuccessRate;
    this.currentSession!.decisions += 1;
    this.currentSession!.sessionReward += reward;

    console.log(
      `[ALM] Pattern updated - Success Rate: ${oldSuccessRate.toFixed(2)} → ${pattern.successRate.toFixed(2)}, ` +
      `Confidence: ${pattern.confidence.toFixed(2)}, Reward: ${reward.toFixed(2)}`
    );
  }

  /**
   * Create adaptive rule from successful pattern
   */
  createAdaptiveRule(
    condition: string,
    action: string,
    applicableContexts: string[],
    successRate: number = 0.8
  ): AdaptiveRule {
    const ruleId = `rule-${Date.now()}-${Math.random()}`;

    const rule: AdaptiveRule = {
      id: ruleId,
      condition,
      action,
      successRate,
      priority: successRate * 100, // Higher success rate = higher priority
      lastApplied: new Date(),
      applicableContexts,
    };

    this.adaptiveRules.set(ruleId, rule);

    if (this.currentSession) {
      this.currentSession.rulesCreated += 1;
    }

    console.log(`[ALM] Adaptive rule created: ${ruleId}`);

    return rule;
  }

  /**
   * Get applicable patterns for context
   */
  getApplicablePatterns(context: string): PatternMemoryEntry[] {
    const applicable: PatternMemoryEntry[] = [];

    for (const [, pattern] of this.patternMemory) {
      // Check if pattern context matches
      if (pattern.context.toLowerCase().includes(context.toLowerCase()) ||
          context.toLowerCase().includes(pattern.context.toLowerCase())) {
        // Only return patterns with sufficient confidence
        if (pattern.confidence >= this.confidenceThreshold) {
          applicable.push(pattern);
        }
      }
    }

    // Sort by success rate and confidence
    return applicable.sort((a, b) => {
      const scoreA = a.successRate * a.confidence;
      const scoreB = b.successRate * b.confidence;
      return scoreB - scoreA;
    });
  }

  /**
   * Get applicable rules for context
   */
  getApplicableRules(context: string): AdaptiveRule[] {
    const applicable: AdaptiveRule[] = [];

    for (const [, rule] of this.adaptiveRules) {
      if (rule.applicableContexts.some((c) => c.toLowerCase().includes(context.toLowerCase()))) {
        applicable.push(rule);
      }
    }

    // Sort by priority
    return applicable.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Escalate repeating fault
   */
  escalateRepeatingFault(faultType: string, occurrences: number): void {
    if (this.currentSession) {
      this.currentSession.faultsEscalated += 1;
    }

    console.log(`[ALM] Escalating repeating fault: ${faultType} (${occurrences} occurrences)`);

    // Create rule to handle this fault
    if (occurrences >= 3) {
      this.createAdaptiveRule(
        `fault_type == "${faultType}"`,
        `escalate_to_admin_and_log`,
        [faultType],
        0.85
      );
    }
  }

  /**
   * Get memory statistics
   */
  getMemoryStatistics(): MemoryStatistics {
    const patterns = Array.from(this.patternMemory.values());
    const avgSuccessRate =
      patterns.length > 0 ? patterns.reduce((sum, p) => sum + p.successRate, 0) / patterns.length : 0;
    const avgConfidence =
      patterns.length > 0 ? patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length : 0;

    const topPatterns = patterns
      .sort((a, b) => b.successRate * b.confidence - a.successRate * a.confidence)
      .slice(0, 5);

    const recentPatterns = patterns
      .sort((a, b) => b.lastUsed.getTime() - a.lastUsed.getTime())
      .slice(0, 5);

    return {
      totalPatterns: patterns.length,
      totalRules: this.adaptiveRules.size,
      averageSuccessRate: Math.round(avgSuccessRate * 100) / 100,
      averageConfidence: Math.round(avgConfidence * 100) / 100,
      topPatterns,
      recentLearning: recentPatterns,
    };
  }

  /**
   * Get pattern memory
   */
  getPatternMemory(limit: number = 50): PatternMemoryEntry[] {
    return Array.from(this.patternMemory.values())
      .sort((a, b) => b.successRate * b.confidence - a.successRate * a.confidence)
      .slice(0, limit);
  }

  /**
   * Get adaptive rules
   */
  getAdaptiveRules(limit: number = 50): AdaptiveRule[] {
    return Array.from(this.adaptiveRules.values())
      .sort((a, b) => b.priority - a.priority)
      .slice(0, limit);
  }

  /**
   * Get learning sessions
   */
  getLearningSessions(limit: number = 50): LearningSession[] {
    return this.learningSessions.slice(-limit);
  }

  /**
   * Set learning rate
   */
  setLearningRate(rate: number): void {
    this.learningRate = Math.max(0, Math.min(1, rate));
    console.log(`[ALM] Learning rate set to: ${this.learningRate}`);
  }

  /**
   * Set confidence threshold
   */
  setConfidenceThreshold(threshold: number): void {
    this.confidenceThreshold = Math.max(0, Math.min(1, threshold));
    console.log(`[ALM] Confidence threshold set to: ${this.confidenceThreshold}`);
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export const adaptiveLearningMemory = new AdaptiveLearningMemory();

