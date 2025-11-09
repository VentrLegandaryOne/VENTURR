/**
 * DEPLOYMENT VALIDATION PIPELINE
 * 
 * Validates all changes before deployment:
 * 1. Run full CI validation
 * 2. Execute all workflows
 * 3. Run validation checkpoints
 * 4. Analyze perception
 * 5. Verify real-world standard
 * 6. Generate deployment report
 * 7. Approve or reject deployment
 */

import { z } from 'zod';
import {
  workflowSimulationEngine,
  validationCheckpointEngine,
  perceptionAnalysisEngine,
} from './ciValidationEngine';
import { simulationEngine } from './archetypeSimulation';
import { alertManager } from './alertingSystem';

// ============================================================================
// TYPES
// ============================================================================

export interface DeploymentValidationResult {
  deploymentId: string;
  timestamp: Date;
  version: string;
  workflowResults: {
    total: number;
    passed: number;
    failed: number;
    successRate: number;
  };
  validationResults: {
    total: number;
    passed: number;
    failed: number;
    criticalFailures: number;
    passRate: number;
  };
  perceptionResults: {
    average: number;
    minimum: number;
    maximum: number;
    archetypesAboveThreshold: number;
    totalArchetypes: number;
  };
  realWorldStandardMet: boolean;
  regressionDetected: boolean;
  approved: boolean;
  reason: string;
  recommendations: string[];
  timestamp_completed: Date;
  duration: number;
}

export interface DeploymentHistory {
  deploymentId: string;
  timestamp: Date;
  version: string;
  approved: boolean;
  result: DeploymentValidationResult;
}

// ============================================================================
// DEPLOYMENT VALIDATOR
// ============================================================================

export class DeploymentValidator {
  private history: DeploymentHistory[] = [];
  private lastApprovedVersion: string | null = null;
  private perceptionThreshold: number = 7.0; // Minimum acceptance score
  private regressionThreshold: number = 0.5; // Maximum acceptable drop in score

  /**
   * Validate deployment
   */
  async validateDeployment(version: string): Promise<DeploymentValidationResult> {
    const deploymentId = 'deploy-' + Date.now();
    const startTime = Date.now();

    console.log(`[Deployment Validator] Starting validation for version ${version}`);

    try {
      // Step 1: Execute all workflows
      console.log('[Deployment Validator] Executing workflows...');
      const workflowResults = await workflowSimulationEngine.executeAllWorkflows();
      const workflowsPassed = workflowResults.filter((w) => w.stepsFailed === 0).length;
      const workflowsTotal = workflowResults.length;

      // Step 2: Run validation checkpoints
      console.log('[Deployment Validator] Running validation checkpoints...');
      const validationResults = await validationCheckpointEngine.validateAll();

      // Step 3: Analyze perception
      console.log('[Deployment Validator] Analyzing perception...');
      const perceptionResults = await perceptionAnalysisEngine.analyzePerception(
        'quote',
        'Sample quote for validation'
      );

      // Step 4: Verify real-world standard
      const archetypesAboveThreshold = perceptionResults.analyses.filter(
        (a) => a.overall >= this.perceptionThreshold
      ).length;
      const realWorldStandardMet =
        validationResults.criticalFailures === 0 &&
        validationResults.passRate >= 95 &&
        perceptionResults.average >= 8.0 &&
        archetypesAboveThreshold === perceptionResults.analyses.length;

      // Step 5: Check for regressions
      const regressionDetected = this.detectRegression(
        perceptionResults.average,
        this.regressionThreshold
      );

      // Step 6: Make approval decision
      const approved = realWorldStandardMet && !regressionDetected;
      const reason = this.generateApprovalReason(
        realWorldStandardMet,
        regressionDetected,
        validationResults,
        perceptionResults
      );

      // Step 7: Generate recommendations
      const recommendations = this.generateRecommendations(
        validationResults,
        perceptionResults,
        approved
      );

      const duration = Date.now() - startTime;

      const result: DeploymentValidationResult = {
        deploymentId,
        timestamp: new Date(),
        version,
        workflowResults: {
          total: workflowsTotal,
          passed: workflowsPassed,
          failed: workflowsTotal - workflowsPassed,
          successRate: (workflowsPassed / workflowsTotal) * 100,
        },
        validationResults: {
          total: validationResults.total,
          passed: validationResults.passed,
          failed: validationResults.failed,
          criticalFailures: validationResults.criticalFailures,
          passRate: parseFloat(validationResults.passRate),
        },
        perceptionResults: {
          average: perceptionResults.average,
          minimum: perceptionResults.minimum,
          maximum: perceptionResults.maximum,
          archetypesAboveThreshold,
          totalArchetypes: perceptionResults.analyses.length,
        },
        realWorldStandardMet,
        regressionDetected,
        approved,
        reason,
        recommendations,
        timestamp_completed: new Date(),
        duration,
      };

      // Store in history
      this.history.push({
        deploymentId,
        timestamp: new Date(),
        version,
        approved,
        result,
      });

      // Update last approved version
      if (approved) {
        this.lastApprovedVersion = version;
      }

      // Send alert if not approved
      if (!approved) {
        await alertManager.alertCriticalIssue(
          'Deployment Validation Failed',
          reason,
          ['deployment', 'validation'],
          recommendations
        );
      }

      console.log(
        `[Deployment Validator] Validation complete. Approved: ${approved}`
      );

      return result;
    } catch (error) {
      console.error('[Deployment Validator] Validation failed:', error);

      const duration = Date.now() - startTime;

      const result: DeploymentValidationResult = {
        deploymentId,
        timestamp: new Date(),
        version,
        workflowResults: {
          total: 0,
          passed: 0,
          failed: 0,
          successRate: 0,
        },
        validationResults: {
          total: 0,
          passed: 0,
          failed: 0,
          criticalFailures: 0,
          passRate: 0,
        },
        perceptionResults: {
          average: 0,
          minimum: 0,
          maximum: 0,
          archetypesAboveThreshold: 0,
          totalArchetypes: 0,
        },
        realWorldStandardMet: false,
        regressionDetected: false,
        approved: false,
        reason: `Validation failed with error: ${String(error)}`,
        recommendations: [
          'Review error logs',
          'Fix underlying issues',
          'Re-run validation',
          'Escalate to system admin if needed',
        ],
        timestamp_completed: new Date(),
        duration,
      };

      this.history.push({
        deploymentId,
        timestamp: new Date(),
        version,
        approved: false,
        result,
      });

      return result;
    }
  }

  /**
   * Detect regression in perception scores
   */
  private detectRegression(currentAverage: number, threshold: number): boolean {
    if (!this.lastApprovedVersion) {
      return false; // No previous version to compare
    }

    // In production, retrieve last approved version's perception score from database
    // For now, use a baseline
    const lastApprovedScore = 8.5;
    const drop = lastApprovedScore - currentAverage;

    return drop > threshold;
  }

  /**
   * Generate approval reason
   */
  private generateApprovalReason(
    realWorldStandardMet: boolean,
    regressionDetected: boolean,
    validationResults: any,
    perceptionResults: any
  ): string {
    if (realWorldStandardMet && !regressionDetected) {
      return 'Deployment approved. All validation checks passed and real-world standard met.';
    }

    const reasons: string[] = [];

    if (!realWorldStandardMet) {
      if (validationResults.criticalFailures > 0) {
        reasons.push(`${validationResults.criticalFailures} critical validation failures`);
      }
      if (validationResults.passRate < 95) {
        reasons.push(`Validation pass rate ${validationResults.passRate}% below 95% threshold`);
      }
      if (perceptionResults.average < 8.0) {
        reasons.push(`Perception average ${perceptionResults.average.toFixed(2)} below 8.0 threshold`);
      }
    }

    if (regressionDetected) {
      reasons.push('Regression detected in perception scores');
    }

    return `Deployment rejected: ${reasons.join('; ')}`;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    validationResults: any,
    perceptionResults: any,
    approved: boolean
  ): string[] {
    const recommendations: string[] = [];

    if (!approved) {
      if (validationResults.failed > 0) {
        recommendations.push(
          `Fix ${validationResults.failed} failing validation checkpoints before deployment`
        );
      }

      const lowPerceptionArchetypes = perceptionResults.analyses.filter(
        (a: any) => a.overall < 7.0
      );
      if (lowPerceptionArchetypes.length > 0) {
        recommendations.push(
          `Improve perception for ${lowPerceptionArchetypes.map((a: any) => a.archetype).join(', ')}`
        );
      }

      recommendations.push('Run deployment validation again after fixes');
    } else {
      recommendations.push('Proceed with deployment');
      recommendations.push('Monitor system closely after deployment');
      recommendations.push('Be prepared to rollback if issues arise');
    }

    return recommendations;
  }

  /**
   * Get deployment history
   */
  getHistory(): DeploymentHistory[] {
    return this.history;
  }

  /**
   * Get last approved version
   */
  getLastApprovedVersion(): string | null {
    return this.lastApprovedVersion;
  }

  /**
   * Get deployment result
   */
  getDeploymentResult(deploymentId: string): DeploymentValidationResult | null {
    const history = this.history.find((h) => h.deploymentId === deploymentId);
    return history?.result || null;
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalDeployments: number;
    approved: number;
    rejected: number;
    approvalRate: number;
  } {
    const approved = this.history.filter((h) => h.approved).length;
    const rejected = this.history.filter((h) => !h.approved).length;
    const total = this.history.length;

    return {
      totalDeployments: total,
      approved,
      rejected,
      approvalRate: total > 0 ? (approved / total) * 100 : 0,
    };
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export const deploymentValidator = new DeploymentValidator();

