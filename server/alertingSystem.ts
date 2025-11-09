/**
 * AUTOMATED ALERTING SYSTEM
 * 
 * Sends alerts for critical CI/validation events:
 * - Critical issues detected
 * - Healing failures
 * - Recovery attempts
 * - Escalations to admin
 * - System status changes
 */

import { z } from 'zod';

// ============================================================================
// TYPES
// ============================================================================

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type AlertChannel = 'email' | 'sms' | 'dashboard' | 'slack' | 'pagerduty';

export interface Alert {
  id: string;
  timestamp: Date;
  severity: AlertSeverity;
  title: string;
  description: string;
  details: Record<string, any>;
  channels: AlertChannel[];
  sent: boolean;
  sentAt?: Date;
  error?: string;
}

export interface AlertConfig {
  emailEnabled: boolean;
  emailRecipients: string[];
  smsEnabled: boolean;
  smsRecipients: string[];
  dashboardEnabled: boolean;
  slackEnabled: boolean;
  slackWebhookUrl?: string;
  pagerdutyEnabled: boolean;
  pagerdutyIntegrationKey?: string;
  criticalIssueThreshold: number; // % of critical issues to trigger alert
  healingFailureThreshold: number; // # of consecutive failures
  recoveryAttemptThreshold: number; // # of attempts before escalation
}

// ============================================================================
// ALERT MANAGER
// ============================================================================

export class AlertManager {
  private config: AlertConfig;
  private alerts: Alert[] = [];
  private alertHistory: Map<string, Alert[]> = new Map();
  private consecutiveFailures: number = 0;

  constructor(config: Partial<AlertConfig> = {}) {
    this.config = {
      emailEnabled: config.emailEnabled ?? true,
      emailRecipients: config.emailRecipients ?? ['admin@thomco.com.au'],
      smsEnabled: config.smsEnabled ?? true,
      smsRecipients: config.smsRecipients ?? ['+61412345678'],
      dashboardEnabled: config.dashboardEnabled ?? true,
      slackEnabled: config.slackEnabled ?? false,
      slackWebhookUrl: config.slackWebhookUrl,
      pagerdutyEnabled: config.pagerdutyEnabled ?? false,
      pagerdutyIntegrationKey: config.pagerdutyIntegrationKey,
      criticalIssueThreshold: config.criticalIssueThreshold ?? 10,
      healingFailureThreshold: config.healingFailureThreshold ?? 3,
      recoveryAttemptThreshold: config.recoveryAttemptThreshold ?? 3,
    };
  }

  /**
   * Send alert for critical issue
   */
  async alertCriticalIssue(
    component: string,
    rootCause: string,
    affectedSystems: string[],
    recommendations: string[]
  ): Promise<Alert> {
    const alert: Alert = {
      id: 'alert-' + Date.now(),
      timestamp: new Date(),
      severity: 'critical',
      title: `Critical Issue Detected: ${component}`,
      description: `${component} is experiencing a critical issue that requires immediate attention.`,
      details: {
        component,
        rootCause,
        affectedSystems,
        recommendations,
      },
      channels: this.getChannelsForSeverity('critical'),
      sent: false,
    };

    await this.sendAlert(alert);
    this.alerts.push(alert);
    this.storeInHistory(alert);

    return alert;
  }

  /**
   * Send alert for healing failure
   */
  async alertHealingFailure(
    component: string,
    action: string,
    error: string
  ): Promise<Alert> {
    this.consecutiveFailures++;

    const alert: Alert = {
      id: 'alert-' + Date.now(),
      timestamp: new Date(),
      severity: this.consecutiveFailures >= this.config.healingFailureThreshold ? 'critical' : 'high',
      title: `Healing Failed: ${component}`,
      description: `Automatic healing action failed for ${component}. Manual intervention may be required.`,
      details: {
        component,
        action,
        error,
        consecutiveFailures: this.consecutiveFailures,
      },
      channels: this.getChannelsForSeverity(
        this.consecutiveFailures >= this.config.healingFailureThreshold ? 'critical' : 'high'
      ),
      sent: false,
    };

    await this.sendAlert(alert);
    this.alerts.push(alert);
    this.storeInHistory(alert);

    return alert;
  }

  /**
   * Send alert for recovery attempt
   */
  async alertRecoveryAttempt(
    cycleId: string,
    attemptNumber: number,
    success: boolean,
    details: Record<string, any>
  ): Promise<Alert> {
    const alert: Alert = {
      id: 'alert-' + Date.now(),
      timestamp: new Date(),
      severity: attemptNumber >= this.config.recoveryAttemptThreshold ? 'critical' : 'high',
      title: `Recovery Attempt ${attemptNumber}: ${success ? 'Successful' : 'Failed'}`,
      description: `System recovery attempt ${attemptNumber} ${success ? 'succeeded' : 'failed'}.`,
      details: {
        cycleId,
        attemptNumber,
        success,
        ...details,
      },
      channels: this.getChannelsForSeverity(
        attemptNumber >= this.config.recoveryAttemptThreshold ? 'critical' : 'high'
      ),
      sent: false,
    };

    await this.sendAlert(alert);
    this.alerts.push(alert);
    this.storeInHistory(alert);

    // Reset consecutive failures on success
    if (success) {
      this.consecutiveFailures = 0;
    }

    return alert;
  }

  /**
   * Send alert for escalation to admin
   */
  async alertEscalation(
    cycleId: string,
    reason: string,
    diagnostics: any[],
    recommendations: string[]
  ): Promise<Alert> {
    const alert: Alert = {
      id: 'alert-' + Date.now(),
      timestamp: new Date(),
      severity: 'critical',
      title: 'ESCALATION: Manual Intervention Required',
      description: 'System has escalated to admin due to repeated failures. Immediate action required.',
      details: {
        cycleId,
        reason,
        diagnosticsCount: diagnostics.length,
        recommendations,
      },
      channels: ['email', 'sms', 'dashboard', 'pagerduty'],
      sent: false,
    };

    await this.sendAlert(alert);
    this.alerts.push(alert);
    this.storeInHistory(alert);

    return alert;
  }

  /**
   * Send alert for system status change
   */
  async alertStatusChange(
    fromStatus: string,
    toStatus: string,
    details: Record<string, any>
  ): Promise<Alert> {
    const severityMap: Record<string, AlertSeverity> = {
      healthy: 'info',
      degraded: 'medium',
      critical: 'critical',
      recovering: 'high',
      recovered: 'info',
    };

    const alert: Alert = {
      id: 'alert-' + Date.now(),
      timestamp: new Date(),
      severity: severityMap[toStatus] || 'medium',
      title: `System Status Changed: ${fromStatus} → ${toStatus}`,
      description: `System status has changed from ${fromStatus} to ${toStatus}.`,
      details: {
        fromStatus,
        toStatus,
        ...details,
      },
      channels: this.getChannelsForSeverity(severityMap[toStatus] || 'medium'),
      sent: false,
    };

    await this.sendAlert(alert);
    this.alerts.push(alert);
    this.storeInHistory(alert);

    return alert;
  }

  /**
   * Send alert for perception score drop
   */
  async alertPerceptionScoreDrop(
    archetype: string,
    previousScore: number,
    currentScore: number,
    threshold: number
  ): Promise<Alert | null> {
    if (currentScore >= threshold) {
      return null; // No alert if above threshold
    }

    const alert: Alert = {
      id: 'alert-' + Date.now(),
      timestamp: new Date(),
      severity: currentScore < 5 ? 'critical' : 'high',
      title: `Perception Score Drop: ${archetype}`,
      description: `Acceptance score for ${archetype} has dropped below threshold.`,
      details: {
        archetype,
        previousScore,
        currentScore,
        threshold,
        drop: (previousScore - currentScore).toFixed(2),
      },
      channels: this.getChannelsForSeverity(currentScore < 5 ? 'critical' : 'high'),
      sent: false,
    };

    await this.sendAlert(alert);
    this.alerts.push(alert);
    this.storeInHistory(alert);

    return alert;
  }

  /**
   * Get channels for severity level
   */
  private getChannelsForSeverity(severity: AlertSeverity): AlertChannel[] {
    const channels: AlertChannel[] = [];

    if (this.config.dashboardEnabled) {
      channels.push('dashboard');
    }

    if (severity === 'critical') {
      if (this.config.emailEnabled) channels.push('email');
      if (this.config.smsEnabled) channels.push('sms');
      if (this.config.pagerdutyEnabled) channels.push('pagerduty');
      if (this.config.slackEnabled) channels.push('slack');
    } else if (severity === 'high') {
      if (this.config.emailEnabled) channels.push('email');
      if (this.config.slackEnabled) channels.push('slack');
    } else if (severity === 'medium') {
      if (this.config.emailEnabled) channels.push('email');
    }

    return channels;
  }

  /**
   * Send alert through configured channels
   */
  private async sendAlert(alert: Alert): Promise<void> {
    try {
      for (const channel of alert.channels) {
        try {
          await this.sendViaChannel(alert, channel);
        } catch (error) {
          console.error(`[Alerting] Failed to send via ${channel}:`, error);
        }
      }

      alert.sent = true;
      alert.sentAt = new Date();
    } catch (error) {
      alert.error = String(error);
      console.error('[Alerting] Failed to send alert:', error);
    }
  }

  /**
   * Send alert via specific channel
   */
  private async sendViaChannel(alert: Alert, channel: AlertChannel): Promise<void> {
    switch (channel) {
      case 'email':
        await this.sendEmail(alert);
        break;
      case 'sms':
        await this.sendSMS(alert);
        break;
      case 'dashboard':
        await this.sendDashboard(alert);
        break;
      case 'slack':
        await this.sendSlack(alert);
        break;
      case 'pagerduty':
        await this.sendPagerDuty(alert);
        break;
    }
  }

  /**
   * Send email alert
   */
  private async sendEmail(alert: Alert): Promise<void> {
    console.log(`[Alerting] Sending email to ${this.config.emailRecipients.join(', ')}`);
    console.log(`[Alerting] Subject: ${alert.title}`);
    console.log(`[Alerting] Body: ${alert.description}`);

    // In production, use email service like SendGrid, AWS SES, etc.
    // Example:
    // await emailService.send({
    //   to: this.config.emailRecipients,
    //   subject: alert.title,
    //   body: this.formatEmailBody(alert),
    // });
  }

  /**
   * Send SMS alert
   */
  private async sendSMS(alert: Alert): Promise<void> {
    console.log(`[Alerting] Sending SMS to ${this.config.smsRecipients.join(', ')}`);
    console.log(`[Alerting] Message: ${alert.title}`);

    // In production, use SMS service like Twilio, AWS SNS, etc.
    // Example:
    // await smsService.send({
    //   to: this.config.smsRecipients,
    //   message: this.formatSMSMessage(alert),
    // });
  }

  /**
   * Send dashboard notification
   */
  private async sendDashboard(alert: Alert): Promise<void> {
    console.log(`[Alerting] Posting to dashboard: ${alert.title}`);

    // In production, store in database for dashboard display
    // or use WebSocket to push to connected clients
  }

  /**
   * Send Slack message
   */
  private async sendSlack(alert: Alert): Promise<void> {
    if (!this.config.slackWebhookUrl) {
      console.warn('[Alerting] Slack webhook URL not configured');
      return;
    }

    console.log(`[Alerting] Sending Slack message to ${this.config.slackWebhookUrl}`);

    // In production, actually post to Slack
    // Example:
    // await fetch(this.config.slackWebhookUrl, {
    //   method: 'POST',
    //   body: JSON.stringify(this.formatSlackMessage(alert)),
    // });
  }

  /**
   * Send PagerDuty incident
   */
  private async sendPagerDuty(alert: Alert): Promise<void> {
    if (!this.config.pagerdutyIntegrationKey) {
      console.warn('[Alerting] PagerDuty integration key not configured');
      return;
    }

    console.log(`[Alerting] Creating PagerDuty incident`);

    // In production, actually create PagerDuty incident
    // Example:
    // await fetch('https://events.pagerduty.com/v2/enqueue', {
    //   method: 'POST',
    //   body: JSON.stringify(this.formatPagerDutyEvent(alert)),
    // });
  }

  /**
   * Store alert in history
   */
  private storeInHistory(alert: Alert): void {
    const key = alert.title;
    if (!this.alertHistory.has(key)) {
      this.alertHistory.set(key, []);
    }
    this.alertHistory.get(key)!.push(alert);
  }

  /**
   * Get recent alerts
   */
  getRecentAlerts(limit: number = 10): Alert[] {
    return this.alerts.slice(-limit);
  }

  /**
   * Get alert history for specific alert type
   */
  getAlertHistory(title: string): Alert[] {
    return this.alertHistory.get(title) || [];
  }

  /**
   * Get all alerts
   */
  getAllAlerts(): Alert[] {
    return this.alerts;
  }

  /**
   * Clear alerts older than specified time
   */
  clearOldAlerts(ageMs: number): number {
    const cutoffTime = Date.now() - ageMs;
    const beforeCount = this.alerts.length;

    this.alerts = this.alerts.filter((alert) => alert.timestamp.getTime() > cutoffTime);

    return beforeCount - this.alerts.length;
  }

  /**
   * Get alert statistics
   */
  getStatistics(): {
    total: number;
    bySeverity: Record<AlertSeverity, number>;
    sent: number;
    failed: number;
  } {
    const bySeverity: Record<AlertSeverity, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0,
    };

    let sent = 0;
    let failed = 0;

    for (const alert of this.alerts) {
      bySeverity[alert.severity]++;
      if (alert.sent) {
        sent++;
      } else if (alert.error) {
        failed++;
      }
    }

    return {
      total: this.alerts.length,
      bySeverity,
      sent,
      failed,
    };
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export const alertManager = new AlertManager({
  emailEnabled: true,
  emailRecipients: ['admin@thomco.com.au', 'director@thomco.com.au'],
  smsEnabled: true,
  smsRecipients: ['+61412345678'],
  dashboardEnabled: true,
  slackEnabled: false,
  pagerdutyEnabled: false,
  criticalIssueThreshold: 10,
  healingFailureThreshold: 3,
  recoveryAttemptThreshold: 3,
});

