/**
 * CLOSED IMPROVEMENT LOOP ORCHESTRATOR
 * 
 * Orchestrates the complete improvement cycle:
 * Simulate → Detect Gaps → Fix → Re-Integrate → Re-Evaluate Acceptance
 * 
 * Permanent, self-reinforcing execution until all metrics meet thresholds
 */

import { z } from 'zod';
import { closedImprovementLoop } from './closedImprovementLoop';
import { intelligentOutputFixer } from './intelligentOutputFixer';
import { safeReIntegrationVerification } from './safeReIntegrationVerification';
import { realWorldAcceptanceEvaluation } from './realWorldAcceptanceEvaluation';

// ============================================================================
// TYPES
// ============================================================================

export interface ImprovementCycleResult {
  id: string;
  timestamp: Date;
  outputId: string;
  cycleNumber: number;
  status: 'completed' | 'in_progress' | 'failed';
  duration: number;
  phases: {
    simulation: { completed: boolean; score: number; gaps: string[] };
    fixing: { completed: boolean; fixesApplied: number; improvementScore: number };
    reintegration: { completed: boolean; passed: boolean; regressions: string[] };
    evaluation: { completed: boolean; acceptanceLevel: string; readyForDeployment: boolean };
  };
  iterationCount: number;
  maxIterations: number;
  finalAcceptanceScore: number;
  meetsThreshold: boolean;
  improvements: string[];
  failureReason?: string;
}

export interface LoopStatistics {
  totalCycles: number;
  completedCycles: number;
  failedCycles: number;
  averageCycleDuration: number;
  averageIterations: number;
  successRate: number;
  averageFinalScore: number;
  improvementRate: number;
}

// ============================================================================
// CLOSED IMPROVEMENT LOOP ORCHESTRATOR
// ============================================================================

export class ClosedImprovementLoopOrchestrator {
  private cycleResults: ImprovementCycleResult[] = [];
  private isRunning: boolean = false;
  private cycleInterval: NodeJS.Timeout | null = null;
  private maxIterationsPerCycle: number = 3;
  private acceptanceThreshold: number = 8.0;
  private cycleIntervalMs: number = 5 * 60 * 1000; // 5 minutes

  /**
   * Start the improvement loop
   */
  startLoop(): void {
    if (this.isRunning) {
      console.log('[CILO] Loop already running');
      return;
    }

    console.log('[CILO] Starting closed improvement loop');
    this.isRunning = true;

    // Run first cycle immediately
    this.executeCycle();

    // Schedule subsequent cycles
    this.cycleInterval = setInterval(() => {
      if (this.isRunning) {
        this.executeCycle();
      }
    }, this.cycleIntervalMs);
  }

  /**
   * Stop the improvement loop
   */
  stopLoop(): void {
    if (!this.isRunning) {
      console.log('[CILO] Loop not running');
      return;
    }

    console.log('[CILO] Stopping closed improvement loop');
    this.isRunning = false;

    if (this.cycleInterval) {
      clearInterval(this.cycleInterval);
      this.cycleInterval = null;
    }
  }

  /**
   * Execute single improvement cycle
   */
  private async executeCycle(): Promise<void> {
    const cycleId = `cycle-${Date.now()}-${Math.random()}`;
    const startTime = Date.now();

    console.log(`[CILO] Starting improvement cycle: ${cycleId}`);

    try {
      // Get outputs to evaluate (simulated)
      const outputs = this.getOutputsToEvaluate();

      for (const output of outputs) {
        await this.improveOutput(output.id, output.content, cycleId);
      }

      console.log(`[CILO] Cycle completed successfully`);
    } catch (error) {
      console.error(`[CILO] Cycle failed:`, error);
    }
  }

  /**
   * Improve single output
   */
  private async improveOutput(outputId: string, content: string, cycleId: string): Promise<ImprovementCycleResult> {
    const resultId = `result-${Date.now()}-${Math.random()}`;
    const startTime = Date.now();
    let iterationCount = 0;
    let currentContent = content;
    let meetsThreshold = false;
    let finalAcceptanceScore = 0;
    const improvements: string[] = [];
    let failureReason: string | undefined;

    console.log(`[CILO] Improving output: ${outputId}`);

    // Phase 1: Simulate and detect gaps
    console.log(`[CILO] Phase 1: Simulating and detecting gaps`);
    const simulationResult = await closedImprovementLoop.simulateOutput(outputId, currentContent);
    const gaps = simulationResult.gaps.map((g) => g.type);

    const phases: ImprovementCycleResult['phases'] = {
      simulation: {
        completed: true,
        score: simulationResult.simulationResult.averageScore,
        gaps,
      },
      fixing: { completed: false, fixesApplied: 0, improvementScore: 0 },
      reintegration: { completed: false, passed: false, regressions: [] },
      evaluation: { completed: false, acceptanceLevel: 'unacceptable', readyForDeployment: false },
    };

    // Iterate until threshold met or max iterations reached
    while (iterationCount < this.maxIterationsPerCycle && !meetsThreshold) {
      iterationCount++;
      console.log(`[CILO] Iteration ${iterationCount}/${this.maxIterationsPerCycle}`);

      // Phase 2: Fix detected gaps
      console.log(`[CILO] Phase 2: Fixing gaps`);
      let fixesAppliedThisIteration = 0;

      for (const gap of simulationResult.gaps) {
        const fixResult = await intelligentOutputFixer.fixOutput(currentContent, gap.type, gap.category);
        currentContent = fixResult.fixedContent;
        fixesAppliedThisIteration += fixResult.appliedRules.length + fixResult.appliedLLMFixes.length;
        improvements.push(`Fixed ${gap.type}: ${fixResult.changesSummary}`);
      }

      phases.fixing.completed = true;
      phases.fixing.fixesApplied += fixesAppliedThisIteration;
      phases.fixing.improvementScore += fixesAppliedThisIteration * 10;

      // Phase 3: Re-integrate and verify
      console.log(`[CILO] Phase 3: Re-integrating and verifying`);
      const reintegrationTest = await safeReIntegrationVerification.executeReIntegrationTest(
        resultId,
        content,
        currentContent
      );

      phases.reintegration.completed = true;
      phases.reintegration.passed = reintegrationTest.canAccept;
      phases.reintegration.regressions = reintegrationTest.regressionDetails;

      if (!reintegrationTest.canAccept) {
        console.warn(`[CILO] Re-integration test failed, reverting changes`);
        currentContent = content;
        failureReason = `Re-integration failed: ${reintegrationTest.regressionDetails.join('; ')}`;
        break;
      }

      // Phase 4: Evaluate acceptance
      console.log(`[CILO] Phase 4: Evaluating acceptance`);
      const evaluation = await realWorldAcceptanceEvaluation.evaluateAcceptance(outputId, currentContent);

      phases.evaluation.completed = true;
      phases.evaluation.acceptanceLevel = evaluation.acceptanceLevel;
      phases.evaluation.readyForDeployment = evaluation.readyForDeployment;

      finalAcceptanceScore = evaluation.overallScore;

      if (evaluation.overallScore >= this.acceptanceThreshold) {
        meetsThreshold = true;
        console.log(`[CILO] Output meets acceptance threshold: ${evaluation.overallScore.toFixed(1)}/10`);
        improvements.push(`Reached acceptance threshold: ${evaluation.overallScore.toFixed(1)}/10`);
      } else {
        console.log(`[CILO] Score ${evaluation.overallScore.toFixed(1)}/10, continuing iterations`);
        improvements.push(`Iteration ${iterationCount}: Score ${evaluation.overallScore.toFixed(1)}/10`);
      }
    }

    const duration = Date.now() - startTime;

    const result: ImprovementCycleResult = {
      id: resultId,
      timestamp: new Date(),
      outputId,
      cycleNumber: this.cycleResults.length + 1,
      status: meetsThreshold ? 'completed' : iterationCount >= this.maxIterationsPerCycle ? 'failed' : 'in_progress',
      duration,
      phases,
      iterationCount,
      maxIterations: this.maxIterationsPerCycle,
      finalAcceptanceScore,
      meetsThreshold,
      improvements,
      failureReason,
    };

    this.cycleResults.push(result);

    // Enforce retention
    if (this.cycleResults.length > 10000) {
      this.cycleResults = this.cycleResults.slice(-5000);
    }

    console.log(`[CILO] Output improvement completed - Status: ${result.status}`);

    return result;
  }

  /**
   * Get outputs to evaluate (simulated)
   */
  private getOutputsToEvaluate(): Array<{ id: string; content: string }> {
    // Simulate getting outputs from database
    return [
      {
        id: `output-${Date.now()}-1`,
        content: 'Sample quote for roofing services. Price: $5000. Valid for 30 days.',
      },
      {
        id: `output-${Date.now()}-2`,
        content: 'Invoice #12345. Amount due: $4500. Payment terms: Net 30.',
      },
    ];
  }

  /**
   * Get cycle results
   */
  getCycleResults(limit: number = 50): ImprovementCycleResult[] {
    return this.cycleResults.slice(-limit);
  }

  /**
   * Get loop statistics
   */
  getLoopStatistics(): LoopStatistics {
    const total = this.cycleResults.length;
    const completed = this.cycleResults.filter((r) => r.status === 'completed').length;
    const failed = this.cycleResults.filter((r) => r.status === 'failed').length;
    const avgDuration =
      total > 0 ? this.cycleResults.reduce((sum, r) => sum + r.duration, 0) / total : 0;
    const avgIterations =
      total > 0 ? this.cycleResults.reduce((sum, r) => sum + r.iterationCount, 0) / total : 0;
    const successRate = total > 0 ? (completed / total) * 100 : 0;
    const avgScore =
      total > 0 ? this.cycleResults.reduce((sum, r) => sum + r.finalAcceptanceScore, 0) / total : 0;
    const improvementRate =
      total > 0
        ? (this.cycleResults.filter((r) => r.finalAcceptanceScore >= this.acceptanceThreshold).length / total) * 100
        : 0;

    return {
      totalCycles: total,
      completedCycles: completed,
      failedCycles: failed,
      averageCycleDuration: Math.round(avgDuration),
      averageIterations: Math.round(avgIterations * 10) / 10,
      successRate: Math.round(successRate * 10) / 10,
      averageFinalScore: Math.round(avgScore * 10) / 10,
      improvementRate: Math.round(improvementRate * 10) / 10,
    };
  }

  /**
   * Get loop status
   */
  getLoopStatus(): {
    isRunning: boolean;
    totalCycles: number;
    lastCycleTime: Date | null;
    successRate: number;
    averageScore: number;
  } {
    const lastCycle = this.cycleResults[this.cycleResults.length - 1];
    const stats = this.getLoopStatistics();

    return {
      isRunning: this.isRunning,
      totalCycles: this.cycleResults.length,
      lastCycleTime: lastCycle?.timestamp || null,
      successRate: stats.successRate,
      averageScore: stats.averageFinalScore,
    };
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export const closedImprovementLoopOrchestrator = new ClosedImprovementLoopOrchestrator();

