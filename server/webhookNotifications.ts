/**
 * Webhook Notifications Service
 * Sends alerts to Slack/Discord when health checks detect degraded services
 */

import { ENV } from './_core/env';

export interface HealthCheckAlert {
  status: 'healthy' | 'degraded' | 'critical';
  timestamp: string;
  services: {
    database: { status: 'up' | 'down'; latencyMs: number; error?: string };
    redis: { status: 'up' | 'down'; latencyMs: number; error?: string; optional: boolean };
    storage: { status: 'up' | 'down'; latencyMs: number; error?: string };
  };
  totalLatencyMs: number;
}

export interface WebhookConfig {
  type: 'slack' | 'discord';
  url: string;
  enabled: boolean;
  alertOnDegraded: boolean;
  alertOnCritical: boolean;
}

/**
 * In-memory webhook configurations
 * In production, these should be stored in the database
 */
const webhookConfigs: Map<string, WebhookConfig> = new Map();

/**
 * Initialize default webhooks from environment variables
 */
export function initializeWebhooks(): void {
  const slackWebhook = process.env.SLACK_WEBHOOK_URL;
  const discordWebhook = process.env.DISCORD_WEBHOOK_URL;

  if (slackWebhook) {
    webhookConfigs.set('slack-default', {
      type: 'slack',
      url: slackWebhook,
      enabled: true,
      alertOnDegraded: true,
      alertOnCritical: true,
    });
    console.log('[Webhooks] Slack webhook initialized');
  }

  if (discordWebhook) {
    webhookConfigs.set('discord-default', {
      type: 'discord',
      url: discordWebhook,
      enabled: true,
      alertOnDegraded: true,
      alertOnCritical: true,
    });
    console.log('[Webhooks] Discord webhook initialized');
  }
}

/**
 * Register a new webhook configuration
 */
export function registerWebhook(id: string, config: WebhookConfig): void {
  webhookConfigs.set(id, config);
  console.log(`[Webhooks] Registered webhook: ${id}`);
}

/**
 * Unregister a webhook configuration
 */
export function unregisterWebhook(id: string): void {
  webhookConfigs.delete(id);
  console.log(`[Webhooks] Unregistered webhook: ${id}`);
}

/**
 * Get all registered webhooks
 */
export function getWebhooks(): Map<string, WebhookConfig> {
  return new Map(webhookConfigs);
}

/**
 * Format health check alert for Slack
 */
function formatSlackMessage(alert: HealthCheckAlert): Record<string, unknown> {
  const statusColor = alert.status === 'healthy' ? '#36a64f' : alert.status === 'degraded' ? '#ff9900' : '#ff0000';
  const statusEmoji = alert.status === 'healthy' ? '✅' : alert.status === 'degraded' ? '⚠️' : '🚨';

  const fields: Array<{ title: string; value: string; short: boolean }> = [
    {
      title: 'Status',
      value: `${statusEmoji} ${alert.status.toUpperCase()}`,
      short: true,
    },
    {
      title: 'Total Latency',
      value: `${alert.totalLatencyMs}ms`,
      short: true,
    },
    {
      title: 'Database',
      value: `${alert.services.database.status === 'up' ? '✅' : '❌'} ${alert.services.database.latencyMs}ms${alert.services.database.error ? ` - ${alert.services.database.error}` : ''}`,
      short: false,
    },
    {
      title: 'Redis',
      value: `${alert.services.redis.status === 'up' ? '✅' : '❌'} ${alert.services.redis.latencyMs}ms (optional)${alert.services.redis.error ? ` - ${alert.services.redis.error}` : ''}`,
      short: false,
    },
    {
      title: 'Storage (S3)',
      value: `${alert.services.storage.status === 'up' ? '✅' : '❌'} ${alert.services.storage.latencyMs}ms${alert.services.storage.error ? ` - ${alert.services.storage.error}` : ''}`,
      short: false,
    },
  ];

  return {
    attachments: [
      {
        color: statusColor,
        title: `VENTURR VALDT Health Check Alert`,
        fields,
        ts: Math.floor(new Date(alert.timestamp).getTime() / 1000),
      },
    ],
  };
}

/**
 * Format health check alert for Discord
 */
function formatDiscordMessage(alert: HealthCheckAlert): Record<string, unknown> {
  const statusColor = alert.status === 'healthy' ? 3394815 : alert.status === 'degraded' ? 16776960 : 16711680;
  const statusEmoji = alert.status === 'healthy' ? '✅' : alert.status === 'degraded' ? '⚠️' : '🚨';

  const fields = [
    {
      name: 'Status',
      value: `${statusEmoji} ${alert.status.toUpperCase()}`,
      inline: true,
    },
    {
      name: 'Total Latency',
      value: `${alert.totalLatencyMs}ms`,
      inline: true,
    },
    {
      name: 'Database',
      value: `${alert.services.database.status === 'up' ? '✅' : '❌'} ${alert.services.database.latencyMs}ms${alert.services.database.error ? `\n${alert.services.database.error}` : ''}`,
      inline: false,
    },
    {
      name: 'Redis',
      value: `${alert.services.redis.status === 'up' ? '✅' : '❌'} ${alert.services.redis.latencyMs}ms (optional)${alert.services.redis.error ? `\n${alert.services.redis.error}` : ''}`,
      inline: false,
    },
    {
      name: 'Storage (S3)',
      value: `${alert.services.storage.status === 'up' ? '✅' : '❌'} ${alert.services.storage.latencyMs}ms${alert.services.storage.error ? `\n${alert.services.storage.error}` : ''}`,
      inline: false,
    },
  ];

  return {
    embeds: [
      {
        title: 'VENTURR VALDT Health Check Alert',
        color: statusColor,
        fields,
        timestamp: alert.timestamp,
      },
    ],
  };
}

/**
 * Send webhook notification
 */
async function sendWebhookNotification(
  config: WebhookConfig,
  alert: HealthCheckAlert
): Promise<{ success: boolean; error?: string }> {
  try {
    const payload =
      config.type === 'slack'
        ? formatSlackMessage(alert)
        : formatDiscordMessage(alert);

    const response = await fetch(config.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(
        `[Webhooks] Failed to send ${config.type} notification: ${response.status} ${error}`
      );
      return {
        success: false,
        error: `HTTP ${response.status}: ${error}`,
      };
    }

    console.log(`[Webhooks] Successfully sent ${config.type} notification`);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[Webhooks] Error sending ${config.type} notification:`, errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Broadcast health check alert to all configured webhooks
 */
export async function broadcastHealthAlert(alert: HealthCheckAlert): Promise<{
  totalSent: number;
  successful: number;
  failed: number;
  results: Array<{ webhookId: string; success: boolean; error?: string }>;
}> {
  const results: Array<{ webhookId: string; success: boolean; error?: string }> = [];
  let successful = 0;
  let failed = 0;

  for (const [webhookId, config] of Array.from(webhookConfigs.entries())) {
    if (!config.enabled) {
      console.log(`[Webhooks] Skipping disabled webhook: ${webhookId}`);
      continue;
    }

    // Check if we should alert based on status
    if (alert.status === 'degraded' && !config.alertOnDegraded) {
      console.log(`[Webhooks] Skipping degraded alert for webhook: ${webhookId}`);
      continue;
    }

    if (alert.status === 'critical' && !config.alertOnCritical) {
      console.log(`[Webhooks] Skipping critical alert for webhook: ${webhookId}`);
      continue;
    }

    const result = await sendWebhookNotification(config, alert);
    results.push({
      webhookId,
      success: result.success,
      error: result.error,
    });

    if (result.success) {
      successful++;
    } else {
      failed++;
    }
  }

  return {
    totalSent: webhookConfigs.size,
    successful,
    failed,
    results,
  };
}

/**
 * Test webhook connectivity
 */
export async function testWebhook(webhookId: string): Promise<{ success: boolean; error?: string }> {
  const config = webhookConfigs.get(webhookId);
  if (!config) {
    return {
      success: false,
      error: `Webhook not found: ${webhookId}`,
    };
  }

  const testAlert: HealthCheckAlert = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: { status: 'up', latencyMs: 5 },
      redis: { status: 'up', latencyMs: 2, optional: true },
      storage: { status: 'up', latencyMs: 8 },
    },
    totalLatencyMs: 15,
  };

  return await sendWebhookNotification(config, testAlert);
}

/**
 * Get webhook statistics
 */
export function getWebhookStats(): {
  total: number;
  enabled: number;
  disabled: number;
  byType: Record<string, number>;
} {
  const stats = {
    total: webhookConfigs.size,
    enabled: 0,
    disabled: 0,
    byType: {} as Record<string, number>,
  };

  for (const config of Array.from(webhookConfigs.values())) {
    if (config.enabled) {
      stats.enabled++;
    } else {
      stats.disabled++;
    }

    stats.byType[config.type] = (stats.byType[config.type] || 0) + 1;
  }

  return stats;
}
