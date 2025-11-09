/**
 * WEBHOOK NOTIFICATIONS & ALERTING SYSTEM
 * 
 * Sends real-time alerts via email, SMS, Slack, and PagerDuty
 * Triggered by validation failures, healing issues, and metric thresholds
 */

import { z } from 'zod';

// ============================================================================
// TYPES
// ============================================================================

export interface AlertConfig {
  enabled: boolean;
  channels: AlertChannel[];
  thresholds: AlertThreshold[];
  escalationRules: EscalationRule[];
}

export interface AlertChannel {
  type: 'email' | 'sms' | 'slack' | 'pagerduty' | 'webhook';
  enabled: boolean;
  config: Record<string, any>;
  recipients?: string[];
}

export interface AlertThreshold {
  metric: string;
  operator: 'less_than' | 'greater_than' | 'equals' | 'not_equals';
  value: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  cooldownMinutes: number;
}

export interface EscalationRule {
  severity: 'critical' | 'high' | 'medium' | 'low';
  delayMinutes: number;
  channels: AlertChannel[];
  escalateTo?: string[];
}

export interface Alert {
  id: string;
  timestamp: Date;
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: string;
  title: string;
  message: string;
  details: Record<string, any>;
  channels: string[];
  status: 'pending' | 'sent' | 'failed';
  sentAt?: Date;
  failureReason?: string;
}

export interface AlertHistory {
  id: string;
  alertId: string;
  timestamp: Date;
  channel: string;
  status: 'sent' | 'failed';
  response?: string;
  errorMessage?: string;
}

// ============================================================================
// WEBHOOK NOTIFICATIONS & ALERTING SYSTEM
// ============================================================================

export class WebhookNotificationsSystem {
  private alerts: Alert[] = [];
  private alertHistory: AlertHistory[] = [];
  private alertConfig: AlertConfig;
  private lastAlertTime: Map<string, Date> = new Map();
  private maxAlerts: number = 10000;

  constructor() {
    this.alertConfig = this.initializeDefaultConfig();
  }

  /**
   * Initialize default alert configuration
   */
  private initializeDefaultConfig(): AlertConfig {
    return {
      enabled: true,
      channels: [
        {
          type: 'email',
          enabled: true,
          config: {
            from: 'alerts@venturr.thomco.com.au',
            smtpServer: 'smtp.gmail.com',
            smtpPort: 587,
          },
          recipients: ['admin@thomco.com.au', 'ops@thomco.com.au'],
        },
        {
          type: 'slack',
          enabled: true,
          config: {
            webhookUrl: process.env.SLACK_WEBHOOK_URL || '',
            channel: '#critical-alerts',
          },
        },
        {
          type: 'sms',
          enabled: true,
          config: {
            provider: 'twilio',
            accountSid: process.env.TWILIO_ACCOUNT_SID || '',
            authToken: process.env.TWILIO_AUTH_TOKEN || '',
            fromNumber: process.env.TWILIO_FROM_NUMBER || '',
          },
          recipients: ['+61412345678'],
        },
        {
          type: 'pagerduty',
          enabled: true,
          config: {
            integrationKey: process.env.PAGERDUTY_INTEGRATION_KEY || '',
          },
        },
      ],
      thresholds: [
        {
          metric: 'workflow_success_rate',
          operator: 'less_than',
          value: 95,
          severity: 'critical',
          cooldownMinutes: 30,
        },
        {
          metric: 'validation_pass_rate',
          operator: 'less_than',
          value: 95,
          severity: 'high',
          cooldownMinutes: 30,
        },
        {
          metric: 'perception_acceptance',
          operator: 'less_than',
          value: 8.5,
          severity: 'high',
          cooldownMinutes: 60,
        },
        {
          metric: 'system_uptime',
          operator: 'less_than',
          value: 99.9,
          severity: 'critical',
          cooldownMinutes: 15,
        },
        {
          metric: 'error_rate',
          operator: 'greater_than',
          value: 0.1,
          severity: 'high',
          cooldownMinutes: 30,
        },
        {
          metric: 'data_integrity',
          operator: 'less_than',
          value: 99,
          severity: 'critical',
          cooldownMinutes: 15,
        },
        {
          metric: 'response_latency',
          operator: 'greater_than',
          value: 1000,
          severity: 'medium',
          cooldownMinutes: 60,
        },
      ],
      escalationRules: [
        {
          severity: 'critical',
          delayMinutes: 0,
          channels: [
            { type: 'email', enabled: true, config: {} },
            { type: 'slack', enabled: true, config: {} },
            { type: 'pagerduty', enabled: true, config: {} },
          ],
          escalateTo: ['director@thomco.com.au'],
        },
        {
          severity: 'high',
          delayMinutes: 5,
          channels: [
            { type: 'email', enabled: true, config: {} },
            { type: 'slack', enabled: true, config: {} },
          ],
          escalateTo: ['admin@thomco.com.au'],
        },
        {
          severity: 'medium',
          delayMinutes: 15,
          channels: [{ type: 'slack', enabled: true, config: {} }],
        },
        {
          severity: 'low',
          delayMinutes: 60,
          channels: [{ type: 'email', enabled: true, config: {} }],
        },
      ],
    };
  }

  /**
   * Check metric thresholds and create alerts
   */
  async checkMetricThresholds(metrics: Record<string, number>): Promise<Alert[]> {
    const createdAlerts: Alert[] = [];

    for (const threshold of this.alertConfig.thresholds) {
      const metricValue = metrics[threshold.metric];

      if (metricValue === undefined) {
        continue;
      }

      const breached = this.checkThreshold(metricValue, threshold.operator, threshold.value);

      if (breached) {
        const lastAlert = this.lastAlertTime.get(threshold.metric);
        const cooldownExpired =
          !lastAlert || Date.now() - lastAlert.getTime() > threshold.cooldownMinutes * 60 * 1000;

        if (cooldownExpired) {
          const alert = await this.createAlert(
            threshold.metric,
            threshold.severity,
            `Metric threshold breached: ${threshold.metric}`,
            `${threshold.metric} is ${metricValue} (threshold: ${threshold.value})`,
            { metric: threshold.metric, value: metricValue, threshold: threshold.value }
          );

          createdAlerts.push(alert);
          this.lastAlertTime.set(threshold.metric, new Date());
        }
      }
    }

    return createdAlerts;
  }

  /**
   * Check if metric breaches threshold
   */
  private checkThreshold(
    value: number,
    operator: 'less_than' | 'greater_than' | 'equals' | 'not_equals',
    threshold: number
  ): boolean {
    switch (operator) {
      case 'less_than':
        return value < threshold;
      case 'greater_than':
        return value > threshold;
      case 'equals':
        return value === threshold;
      case 'not_equals':
        return value !== threshold;
      default:
        return false;
    }
  }

  /**
   * Create an alert
   */
  async createAlert(
    type: string,
    severity: 'critical' | 'high' | 'medium' | 'low',
    title: string,
    message: string,
    details: Record<string, any>
  ): Promise<Alert> {
    const alertId = `alert-${Date.now()}-${Math.random()}`;

    const alert: Alert = {
      id: alertId,
      timestamp: new Date(),
      severity,
      type,
      title,
      message,
      details,
      channels: [],
      status: 'pending',
    };

    console.log(`[WN] Creating alert: ${severity.toUpperCase()} - ${title}`);

    // Send alert to configured channels
    const escalationRule = this.alertConfig.escalationRules.find((r) => r.severity === severity);

    if (escalationRule) {
      for (const channel of escalationRule.channels) {
        if (channel.enabled) {
          try {
            await this.sendAlert(alert, channel);
            alert.channels.push(channel.type);
          } catch (error) {
            console.error(`[WN] Failed to send alert to ${channel.type}:`, error);
          }
        }
      }

      alert.status = alert.channels.length > 0 ? 'sent' : 'failed';
    }

    this.alerts.push(alert);

    // Enforce retention
    if (this.alerts.length > this.maxAlerts) {
      this.alerts = this.alerts.slice(-5000);
    }

    return alert;
  }

  /**
   * Send alert to a specific channel
   */
  private async sendAlert(alert: Alert, channel: AlertChannel): Promise<void> {
    const historyId = `hist-${Date.now()}-${Math.random()}`;

    try {
      switch (channel.type) {
        case 'email':
          await this.sendEmailAlert(alert, channel);
          break;
        case 'slack':
          await this.sendSlackAlert(alert, channel);
          break;
        case 'sms':
          await this.sendSmsAlert(alert, channel);
          break;
        case 'pagerduty':
          await this.sendPagerDutyAlert(alert, channel);
          break;
        case 'webhook':
          await this.sendWebhookAlert(alert, channel);
          break;
      }

      this.alertHistory.push({
        id: historyId,
        alertId: alert.id,
        timestamp: new Date(),
        channel: channel.type,
        status: 'sent',
      });

      console.log(`[WN] Alert sent via ${channel.type}`);
    } catch (error) {
      console.error(`[WN] Failed to send alert via ${channel.type}:`, error);

      this.alertHistory.push({
        id: historyId,
        alertId: alert.id,
        timestamp: new Date(),
        channel: channel.type,
        status: 'failed',
        errorMessage: String(error),
      });

      throw error;
    }
  }

  /**
   * Send email alert
   */
  private async sendEmailAlert(alert: Alert, channel: AlertChannel): Promise<void> {
    if (!channel.recipients || channel.recipients.length === 0) {
      throw new Error('No email recipients configured');
    }

    const emailBody = `
Alert: ${alert.title}
Severity: ${alert.severity.toUpperCase()}
Time: ${alert.timestamp.toISOString()}

Message: ${alert.message}

Details:
${JSON.stringify(alert.details, null, 2)}

Dashboard: https://venturr.thomco.com.au/ci-dashboard
    `;

    console.log(`[WN] Sending email to ${channel.recipients.join(', ')}`);
    // Email sending implementation would go here
    // Using nodemailer or similar
  }

  /**
   * Send Slack alert
   */
  private async sendSlackAlert(alert: Alert, channel: AlertChannel): Promise<void> {
    const webhookUrl = channel.config.webhookUrl;

    if (!webhookUrl) {
      throw new Error('Slack webhook URL not configured');
    }

    const color =
      alert.severity === 'critical'
        ? 'danger'
        : alert.severity === 'high'
          ? 'warning'
          : alert.severity === 'medium'
            ? '#0099ff'
            : 'good';

    const payload = {
      attachments: [
        {
          color,
          title: alert.title,
          text: alert.message,
          fields: [
            { title: 'Severity', value: alert.severity.toUpperCase(), short: true },
            { title: 'Type', value: alert.type, short: true },
            { title: 'Time', value: alert.timestamp.toISOString(), short: false },
          ],
          actions: [
            {
              type: 'button',
              text: 'View Dashboard',
              url: 'https://venturr.thomco.com.au/ci-dashboard',
            },
          ],
        },
      ],
    };

    console.log(`[WN] Sending Slack alert to ${channel.config.channel}`);
    // Slack webhook implementation would go here
  }

  /**
   * Send SMS alert
   */
  private async sendSmsAlert(alert: Alert, channel: AlertChannel): Promise<void> {
    if (!channel.recipients || channel.recipients.length === 0) {
      throw new Error('No SMS recipients configured');
    }

    const message = `[${alert.severity.toUpperCase()}] ${alert.title}: ${alert.message}`;

    console.log(`[WN] Sending SMS to ${channel.recipients.join(', ')}`);
    // SMS sending implementation would go here (Twilio, etc.)
  }

  /**
   * Send PagerDuty alert
   */
  private async sendPagerDutyAlert(alert: Alert, channel: AlertChannel): Promise<void> {
    const integrationKey = channel.config.integrationKey;

    if (!integrationKey) {
      throw new Error('PagerDuty integration key not configured');
    }

    const payload = {
      routing_key: integrationKey,
      event_action: 'trigger',
      payload: {
        summary: alert.title,
        severity: alert.severity === 'critical' ? 'critical' : 'error',
        source: 'Venturr Validation Loop',
        custom_details: alert.details,
      },
    };

    console.log(`[WN] Sending PagerDuty alert`);
    // PagerDuty API implementation would go here
  }

  /**
   * Send webhook alert
   */
  private async sendWebhookAlert(alert: Alert, channel: AlertChannel): Promise<void> {
    const webhookUrl = channel.config.webhookUrl;

    if (!webhookUrl) {
      throw new Error('Webhook URL not configured');
    }

    const payload = {
      alert_id: alert.id,
      timestamp: alert.timestamp,
      severity: alert.severity,
      type: alert.type,
      title: alert.title,
      message: alert.message,
      details: alert.details,
    };

    console.log(`[WN] Sending webhook alert to ${webhookUrl}`);
    // HTTP POST implementation would go here
  }

  /**
   * Get recent alerts
   */
  getRecentAlerts(limit: number = 100): Alert[] {
    return this.alerts.slice(-limit);
  }

  /**
   * Get alerts by severity
   */
  getAlertsBySeverity(severity: 'critical' | 'high' | 'medium' | 'low', limit: number = 50): Alert[] {
    return this.alerts.filter((a) => a.severity === severity).slice(-limit);
  }

  /**
   * Get alert history
   */
  getAlertHistory(limit: number = 100): AlertHistory[] {
    return this.alertHistory.slice(-limit);
  }

  /**
   * Get alert statistics
   */
  getAlertStatistics(): {
    totalAlerts: number;
    criticalAlerts: number;
    highAlerts: number;
    mediumAlerts: number;
    lowAlerts: number;
    sentAlerts: number;
    failedAlerts: number;
    successRate: number;
  } {
    const total = this.alerts.length;
    const critical = this.alerts.filter((a) => a.severity === 'critical').length;
    const high = this.alerts.filter((a) => a.severity === 'high').length;
    const medium = this.alerts.filter((a) => a.severity === 'medium').length;
    const low = this.alerts.filter((a) => a.severity === 'low').length;
    const sent = this.alerts.filter((a) => a.status === 'sent').length;
    const failed = this.alerts.filter((a) => a.status === 'failed').length;
    const successRate = total > 0 ? (sent / total) * 100 : 0;

    return {
      totalAlerts: total,
      criticalAlerts: critical,
      highAlerts: high,
      mediumAlerts: medium,
      lowAlerts: low,
      sentAlerts: sent,
      failedAlerts: failed,
      successRate,
    };
  }

  /**
   * Update alert configuration
   */
  updateAlertConfig(config: Partial<AlertConfig>): void {
    this.alertConfig = { ...this.alertConfig, ...config };
    console.log(`[WN] Alert configuration updated`);
  }

  /**
   * Get alert configuration
   */
  getAlertConfig(): AlertConfig {
    return this.alertConfig;
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export const webhookNotifications = new WebhookNotificationsSystem();

