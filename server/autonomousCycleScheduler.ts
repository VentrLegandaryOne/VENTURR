/**
 * AUTONOMOUS CYCLE SCHEDULER
 * 
 * Schedules continuous autonomous validation cycles at configurable intervals
 */

import { continuousAutonomousCycle } from './continuousAutonomousCycle';

// ============================================================================
// TYPES
// ============================================================================

export interface ScheduleConfig {
  enabled: boolean;
  intervalMinutes: number; // How often to run cycles (default 360 = 6 hours)
  maxCyclesPerDay: number; // Maximum cycles per day (default 4)
  autoStartOnBoot: boolean; // Auto-start on server boot
  notifyOnCompletion: boolean; // Send notifications on completion
  notifyOnFailure: boolean; // Send notifications on failure
  notifyOnProductionReady: boolean; // Send notifications when production-ready
}

export interface ScheduleExecution {
  id: string;
  timestamp: Date;
  type: 'scheduled' | 'manual' | 'triggered';
  cycleId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
}

// ============================================================================
// AUTONOMOUS CYCLE SCHEDULER
// ============================================================================

export class AutonomousCycleScheduler {
  private config: ScheduleConfig = {
    enabled: true,
    intervalMinutes: 360, // 6 hours
    maxCyclesPerDay: 4,
    autoStartOnBoot: true,
    notifyOnCompletion: true,
    notifyOnFailure: true,
    notifyOnProductionReady: true,
  };

  private isSchedulerRunning: boolean = false;
  private schedulerInterval: NodeJS.Timeout | null = null;
  private executionHistory: ScheduleExecution[] = [];
  private lastExecutionTime: Date | null = null;
  private cyclesExecutedToday: number = 0;
  private lastResetDate: Date = new Date();

  constructor() {
    console.log('[ACS] Autonomous Cycle Scheduler initialized');
  }

  /**
   * Start the scheduler
   */
  start(): void {
    if (this.isSchedulerRunning) {
      console.log('[ACS] Scheduler already running');
      return;
    }

    if (!this.config.enabled) {
      console.log('[ACS] Scheduler is disabled');
      return;
    }

    this.isSchedulerRunning = true;
    console.log(`[ACS] Starting scheduler with ${this.config.intervalMinutes} minute interval`);

    // Execute first cycle immediately
    this.executeCycle('triggered');

    // Schedule subsequent cycles
    this.schedulerInterval = setInterval(() => {
      this.executeCycle('scheduled');
    }, this.config.intervalMinutes * 60 * 1000);

    console.log('[ACS] Scheduler started');
  }

  /**
   * Stop the scheduler
   */
  stop(): void {
    if (!this.isSchedulerRunning) {
      console.log('[ACS] Scheduler not running');
      return;
    }

    if (this.schedulerInterval) {
      clearInterval(this.schedulerInterval);
      this.schedulerInterval = null;
    }

    this.isSchedulerRunning = false;
    console.log('[ACS] Scheduler stopped');
  }

  /**
   * Execute a cycle
   */
  private async executeCycle(type: 'scheduled' | 'manual' | 'triggered'): Promise<void> {
    // Check daily limit
    const now = new Date();
    if (now.toDateString() !== this.lastResetDate.toDateString()) {
      this.cyclesExecutedToday = 0;
      this.lastResetDate = now;
    }

    if (this.cyclesExecutedToday >= this.config.maxCyclesPerDay) {
      console.log(`[ACS] Daily cycle limit (${this.config.maxCyclesPerDay}) reached`);
      return;
    }

    const executionId = `exec-${Date.now()}-${Math.random()}`;

    const execution: ScheduleExecution = {
      id: executionId,
      timestamp: now,
      type,
      cycleId: '',
      status: 'running',
    };

    this.executionHistory.push(execution);

    try {
      console.log(`[ACS] Executing cycle (${type})`);

      const cycleExecution = await continuousAutonomousCycle.executeAutonomousCycle();

      execution.cycleId = cycleExecution.id;
      execution.status = 'completed';
      execution.result = {
        score: cycleExecution.overallScore,
        acceptance: cycleExecution.acceptanceRate,
        productionReady: cycleExecution.productionReady,
        iterations: cycleExecution.iterationCount,
        corrections: cycleExecution.correctionsApplied,
      };

      this.lastExecutionTime = now;
      this.cyclesExecutedToday += 1;

      console.log(`[ACS] Cycle completed: Score ${cycleExecution.overallScore.toFixed(1)}/10, Ready: ${cycleExecution.productionReady}`);

      // Send notifications
      if (this.config.notifyOnCompletion) {
        await this.notifyCompletion(cycleExecution);
      }

      if (cycleExecution.productionReady && this.config.notifyOnProductionReady) {
        await this.notifyProductionReady(cycleExecution);
      }
    } catch (error) {
      execution.status = 'failed';
      console.error(`[ACS] Cycle execution failed:`, error);

      if (this.config.notifyOnFailure) {
        await this.notifyFailure(error);
      }
    }

    // Enforce retention
    if (this.executionHistory.length > 1000) {
      this.executionHistory = this.executionHistory.slice(-500);
    }
  }

  /**
   * Manually trigger a cycle
   */
  async triggerManualCycle(): Promise<ScheduleExecution> {
    const executionId = `exec-manual-${Date.now()}-${Math.random()}`;

    const execution: ScheduleExecution = {
      id: executionId,
      timestamp: new Date(),
      type: 'manual',
      cycleId: '',
      status: 'pending',
    };

    this.executionHistory.push(execution);

    try {
      execution.status = 'running';
      const cycleExecution = await continuousAutonomousCycle.executeAutonomousCycle();

      execution.cycleId = cycleExecution.id;
      execution.status = 'completed';
      execution.result = {
        score: cycleExecution.overallScore,
        acceptance: cycleExecution.acceptanceRate,
        productionReady: cycleExecution.productionReady,
      };
    } catch (error) {
      execution.status = 'failed';
      execution.result = { error: String(error) };
    }

    return execution;
  }

  /**
   * Send completion notification
   */
  private async notifyCompletion(cycleExecution: any): Promise<void> {
    console.log(`[ACS] Sending completion notification for cycle ${cycleExecution.id}`);
    // TODO: Implement actual notification (email, Slack, etc.)
  }

  /**
   * Send production ready notification
   */
  private async notifyProductionReady(cycleExecution: any): Promise<void> {
    console.log(`[ACS] Sending production-ready notification for cycle ${cycleExecution.id}`);
    // TODO: Implement actual notification (email, Slack, etc.)
  }

  /**
   * Send failure notification
   */
  private async notifyFailure(error: any): Promise<void> {
    console.log(`[ACS] Sending failure notification:`, error);
    // TODO: Implement actual notification (email, Slack, etc.)
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<ScheduleConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('[ACS] Configuration updated:', this.config);

    // Restart scheduler if interval changed
    if (this.isSchedulerRunning) {
      this.stop();
      this.start();
    }
  }

  /**
   * Get configuration
   */
  getConfig(): ScheduleConfig {
    return { ...this.config };
  }

  /**
   * Get scheduler status
   */
  getStatus(): {
    isRunning: boolean;
    config: ScheduleConfig;
    lastExecution: Date | null;
    cyclesExecutedToday: number;
    executionCount: number;
  } {
    return {
      isRunning: this.isSchedulerRunning,
      config: this.getConfig(),
      lastExecution: this.lastExecutionTime,
      cyclesExecutedToday: this.cyclesExecutedToday,
      executionCount: this.executionHistory.length,
    };
  }

  /**
   * Get execution history
   */
  getExecutionHistory(limit: number = 50): ScheduleExecution[] {
    return this.executionHistory.slice(-limit);
  }

  /**
   * Get scheduler statistics
   */
  getStatistics(): {
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    successRate: number;
    cyclesExecutedToday: number;
    maxCyclesPerDay: number;
  } {
    const successful = this.executionHistory.filter((e) => e.status === 'completed').length;
    const failed = this.executionHistory.filter((e) => e.status === 'failed').length;
    const total = this.executionHistory.length;

    return {
      totalExecutions: total,
      successfulExecutions: successful,
      failedExecutions: failed,
      successRate: total > 0 ? (successful / total) * 100 : 0,
      cyclesExecutedToday: this.cyclesExecutedToday,
      maxCyclesPerDay: this.config.maxCyclesPerDay,
    };
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export const autonomousCycleScheduler = new AutonomousCycleScheduler();

// Auto-start on boot if configured
if (process.env.NODE_ENV === 'production') {
  autonomousCycleScheduler.start();
}

