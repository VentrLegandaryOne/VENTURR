/**
 * WATCHDOG MONITORING & RECOVERY SYSTEM
 * 
 * Continuously monitors system health every 3 hours.
 * If stalled, triggers diagnostic summary and restores to last stable state.
 * Escalates to system admin if recovery fails.
 */

import { z } from 'zod';
import {
  diagnosticEngine,
  healingEngine,
  stabilityMonitor,
  DiagnosticResult,
  HealingAction,
} from './selfHealingSystem';

// ============================================================================
// TYPES
// ============================================================================

export interface WatchdogCycle {
  cycleId: string;
  timestamp: Date;
  duration: number;
  status: 'healthy' | 'degraded' | 'critical' | 'recovering' | 'recovered';
  diagnostics: DiagnosticResult[];
  healingActions: HealingAction[];
  metrics: any;
  issues: string[];
  recommendations: string[];
}

export interface RecoveryCheckpoint {
  id: string;
  timestamp: Date;
  state: any;
  metrics: any;
  status: 'stable' | 'degraded';
}

export interface WatchdogConfig {
  monitorInterval: number; // milliseconds
  criticalThreshold: number; // % of critical issues to trigger recovery
  recoveryTimeout: number; // milliseconds
  maxRecoveryAttempts: number;
}

// ============================================================================
// WATCHDOG MONITOR
// ============================================================================

export class WatchdogMonitor {
  private config: WatchdogConfig;
  private cycles: WatchdogCycle[] = [];
  private recoveryCheckpoints: RecoveryCheckpoint[] = [];
  private lastStableState: any = null;
  private monitoringActive: boolean = false;
  private recoveryInProgress: boolean = false;
  private recoveryAttempts: number = 0;

  constructor(config: Partial<WatchdogConfig> = {}) {
    this.config = {
      monitorInterval: config.monitorInterval || 3 * 60 * 60 * 1000, // 3 hours default
      criticalThreshold: config.criticalThreshold || 10, // 10% critical issues
      recoveryTimeout: config.recoveryTimeout || 5 * 60 * 1000, // 5 minutes
      maxRecoveryAttempts: config.maxRecoveryAttempts || 3,
    };
  }

  /**
   * Start watchdog monitoring
   */
  startMonitoring(): void {
    if (this.monitoringActive) {
      console.warn('[Watchdog] Monitoring already active');
      return;
    }

    this.monitoringActive = true;
    console.log(`[Watchdog] Starting monitoring with ${this.config.monitorInterval}ms interval`);

    // Run first cycle immediately
    this.runMonitoringCycle();

    // Schedule subsequent cycles
    setInterval(() => {
      if (this.monitoringActive) {
        this.runMonitoringCycle();
      }
    }, this.config.monitorInterval);
  }

  /**
   * Stop watchdog monitoring
   */
  stopMonitoring(): void {
    this.monitoringActive = false;
    console.log('[Watchdog] Monitoring stopped');
  }

  /**
   * Run single monitoring cycle
   */
  private async runMonitoringCycle(): Promise<WatchdogCycle> {
    const cycleId = 'cycle-' + Date.now();
    const startTime = Date.now();

    console.log(`[Watchdog] Starting cycle ${cycleId}`);

    try {
      // Run diagnostics
      const diagnostics = await diagnosticEngine.runDiagnostics();

      // Analyze results
      const criticalIssues = diagnostics.filter((d) => d.severity === 'critical');
      const highIssues = diagnostics.filter((d) => d.severity === 'high');
      const criticalPercent = (criticalIssues.length / diagnostics.length) * 100;

      // Determine status
      let status: 'healthy' | 'degraded' | 'critical' | 'recovering' | 'recovered' =
        'healthy';
      if (criticalIssues.length > 0) {
        status = 'critical';
      } else if (highIssues.length > 0) {
        status = 'degraded';
      }

      // Execute healing if needed
      let healingActions: HealingAction[] = [];
      if (status !== 'healthy') {
        console.log(`[Watchdog] System status: ${status}`);

        for (const diagnostic of diagnostics) {
          if (diagnostic.severity === 'critical' || diagnostic.severity === 'high') {
            const actions = await healingEngine.executeHealing(diagnostic);
            healingActions.push(...actions);
          }
        }

        // Re-run diagnostics after healing
        const rerunDiagnostics = await diagnosticEngine.runDiagnostics();
        const remainingCritical = rerunDiagnostics.filter((d) => d.severity === 'critical');

        if (remainingCritical.length === 0) {
          status = 'recovered';
          this.recoveryAttempts = 0;
        } else if (this.recoveryAttempts < this.config.maxRecoveryAttempts) {
          status = 'recovering';
          this.recoveryAttempts++;
        } else {
          status = 'critical';
          this.escalateToAdmin(cycleId, diagnostics, healingActions);
        }
      }

      // Save checkpoint if healthy
      if (status === 'healthy' || status === 'recovered') {
        this.saveRecoveryCheckpoint();
      }

      // Get metrics
      const metrics = stabilityMonitor.getMetrics();

      // Compile cycle report
      const duration = Date.now() - startTime;
      const cycle: WatchdogCycle = {
        cycleId,
        timestamp: new Date(),
        duration,
        status,
        diagnostics,
        healingActions,
        metrics,
        issues: diagnostics
          .filter((d) => d.severity === 'critical' || d.severity === 'high')
          .map((d) => d.rootCause),
        recommendations: this.generateRecommendations(diagnostics, status),
      };

      this.cycles.push(cycle);
      console.log(`[Watchdog] Cycle ${cycleId} completed with status: ${status}`);

      return cycle;
    } catch (error) {
      console.error(`[Watchdog] Cycle ${cycleId} failed:`, error);

      const cycle: WatchdogCycle = {
        cycleId,
        timestamp: new Date(),
        duration: Date.now() - startTime,
        status: 'critical',
        diagnostics: [],
        healingActions: [],
        metrics: {},
        issues: [String(error)],
        recommendations: ['Restart watchdog system', 'Check system logs', 'Escalate to admin'],
      };

      this.cycles.push(cycle);
      this.escalateToAdmin(cycleId, [], []);

      return cycle;
    }
  }

  /**
   * Save recovery checkpoint
   */
  private saveRecoveryCheckpoint(): void {
    const checkpoint: RecoveryCheckpoint = {
      id: 'checkpoint-' + Date.now(),
      timestamp: new Date(),
      state: {
        timestamp: new Date(),
        systemStatus: 'stable',
      },
      metrics: stabilityMonitor.getMetrics(),
      status: 'stable',
    };

    this.recoveryCheckpoints.push(checkpoint);
    this.lastStableState = checkpoint;

    console.log(`[Watchdog] Saved recovery checkpoint: ${checkpoint.id}`);
  }

  /**
   * Restore to last stable state
   */
  async restoreToLastStableState(): Promise<boolean> {
    if (!this.lastStableState) {
      console.warn('[Watchdog] No stable state to restore to');
      return false;
    }

    console.log(
      `[Watchdog] Restoring to last stable state: ${this.lastStableState.id}`
    );

    try {
      this.recoveryInProgress = true;

      // In production, actually restore system state
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Verify restoration
      const diagnostics = await diagnosticEngine.runDiagnostics();
      const criticalIssues = diagnostics.filter((d) => d.severity === 'critical');

      if (criticalIssues.length === 0) {
        console.log('[Watchdog] Successfully restored to stable state');
        this.recoveryInProgress = false;
        this.recoveryAttempts = 0;
        return true;
      } else {
        console.warn('[Watchdog] Restoration did not resolve all issues');
        this.recoveryInProgress = false;
        return false;
      }
    } catch (error) {
      console.error('[Watchdog] Restoration failed:', error);
      this.recoveryInProgress = false;
      return false;
    }
  }

  /**
   * Generate recommendations based on diagnostics
   */
  private generateRecommendations(
    diagnostics: DiagnosticResult[],
    status: string
  ): string[] {
    const recommendations: string[] = [];

    const criticalIssues = diagnostics.filter((d) => d.severity === 'critical');
    const highIssues = diagnostics.filter((d) => d.severity === 'high');

    if (criticalIssues.length > 0) {
      recommendations.push('Critical issues detected - immediate action required');
      for (const issue of criticalIssues) {
        recommendations.push(`- ${issue.component}: ${issue.rootCause}`);
        recommendations.push(...issue.recommendedActions.slice(0, 2));
      }
    }

    if (highIssues.length > 0) {
      recommendations.push('High-priority issues detected - plan remediation');
      for (const issue of highIssues) {
        recommendations.push(`- ${issue.component}: ${issue.rootCause}`);
      }
    }

    if (status === 'healthy') {
      recommendations.push('System operating normally - continue monitoring');
    }

    return recommendations;
  }

  /**
   * Escalate to system admin
   */
  private escalateToAdmin(
    cycleId: string,
    diagnostics: DiagnosticResult[],
    healingActions: HealingAction[]
  ): void {
    console.error(`[Watchdog] ESCALATING TO ADMIN - Cycle: ${cycleId}`);
    console.error(`[Watchdog] Critical issues: ${diagnostics.filter((d) => d.severity === 'critical').length}`);
    console.error(`[Watchdog] Healing attempts: ${healingActions.length}`);

    // In production, send alert to admin
    // - Email notification
    // - SMS alert
    // - Dashboard notification
    // - PagerDuty integration
  }

  /**
   * Get monitoring cycles
   */
  getCycles(): WatchdogCycle[] {
    return this.cycles;
  }

  /**
   * Get recovery checkpoints
   */
  getRecoveryCheckpoints(): RecoveryCheckpoint[] {
    return this.recoveryCheckpoints;
  }

  /**
   * Get last stable state
   */
  getLastStableState(): RecoveryCheckpoint | null {
    return this.lastStableState;
  }

  /**
   * Get monitoring status
   */
  getStatus(): {
    active: boolean;
    recoveryInProgress: boolean;
    recoveryAttempts: number;
    lastCycle: WatchdogCycle | null;
    lastStableState: RecoveryCheckpoint | null;
  } {
    return {
      active: this.monitoringActive,
      recoveryInProgress: this.recoveryInProgress,
      recoveryAttempts: this.recoveryAttempts,
      lastCycle: this.cycles.length > 0 ? this.cycles[this.cycles.length - 1] : null,
      lastStableState: this.lastStableState,
    };
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export const watchdogMonitor = new WatchdogMonitor({
  monitorInterval: 3 * 60 * 60 * 1000, // 3 hours
  criticalThreshold: 10,
  recoveryTimeout: 5 * 60 * 1000,
  maxRecoveryAttempts: 3,
});

