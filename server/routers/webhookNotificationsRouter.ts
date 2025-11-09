/**
 * WEBHOOK NOTIFICATIONS ROUTER
 * 
 * tRPC procedures for alert management and configuration
 */

import { protectedProcedure, router } from '../_core/trpc';
import { z } from 'zod';
import { webhookNotifications } from '../webhookNotifications';

export const webhookNotificationsRouter = router({
  /**
   * Check metric thresholds and create alerts
   */
  checkMetricThresholds: protectedProcedure
    .input(z.record(z.number()))
    .mutation(async ({ input }) => {
      const alerts = await webhookNotifications.checkMetricThresholds(input);

      return {
        alertsCreated: alerts.length,
        alerts: alerts.map((a) => ({
          id: a.id,
          severity: a.severity,
          type: a.type,
          title: a.title,
          channels: a.channels,
        })),
      };
    }),

  /**
   * Create a custom alert
   */
  createAlert: protectedProcedure
    .input(
      z.object({
        type: z.string(),
        severity: z.enum(['critical', 'high', 'medium', 'low']),
        title: z.string(),
        message: z.string(),
        details: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const alert = await webhookNotifications.createAlert(
        input.type,
        input.severity,
        input.title,
        input.message,
        input.details || {}
      );

      return {
        id: alert.id,
        severity: alert.severity,
        title: alert.title,
        status: alert.status,
        channels: alert.channels,
      };
    }),

  /**
   * Get recent alerts
   */
  getRecentAlerts: protectedProcedure
    .input(z.object({ limit: z.number().optional() }).optional())
    .query(({ input }) => {
      const alerts = webhookNotifications.getRecentAlerts(input?.limit || 100);

      return alerts.map((a) => ({
        id: a.id,
        timestamp: a.timestamp,
        severity: a.severity,
        type: a.type,
        title: a.title,
        message: a.message,
        status: a.status,
        channels: a.channels,
      }));
    }),

  /**
   * Get alerts by severity
   */
  getAlertsBySeverity: protectedProcedure
    .input(
      z.object({
        severity: z.enum(['critical', 'high', 'medium', 'low']),
        limit: z.number().optional(),
      })
    )
    .query(({ input }) => {
      const alerts = webhookNotifications.getAlertsBySeverity(input.severity, input.limit || 50);

      return alerts.map((a) => ({
        id: a.id,
        timestamp: a.timestamp,
        severity: a.severity,
        type: a.type,
        title: a.title,
        message: a.message,
        status: a.status,
      }));
    }),

  /**
   * Get alert history
   */
  getAlertHistory: protectedProcedure
    .input(z.object({ limit: z.number().optional() }).optional())
    .query(({ input }) => {
      const history = webhookNotifications.getAlertHistory(input?.limit || 100);

      return history.map((h) => ({
        id: h.id,
        alertId: h.alertId,
        timestamp: h.timestamp,
        channel: h.channel,
        status: h.status,
        errorMessage: h.errorMessage,
      }));
    }),

  /**
   * Get alert statistics
   */
  getAlertStatistics: protectedProcedure.query(() => {
    const stats = webhookNotifications.getAlertStatistics();

    return {
      totalAlerts: stats.totalAlerts,
      criticalAlerts: stats.criticalAlerts,
      highAlerts: stats.highAlerts,
      mediumAlerts: stats.mediumAlerts,
      lowAlerts: stats.lowAlerts,
      sentAlerts: stats.sentAlerts,
      failedAlerts: stats.failedAlerts,
      successRate: stats.successRate.toFixed(1),
    };
  }),

  /**
   * Get alert configuration
   */
  getAlertConfig: protectedProcedure.query(() => {
    const config = webhookNotifications.getAlertConfig();

    return {
      enabled: config.enabled,
      channelsCount: config.channels.length,
      thresholdsCount: config.thresholds.length,
      escalationRulesCount: config.escalationRules.length,
      channels: config.channels.map((c) => ({
        type: c.type,
        enabled: c.enabled,
        recipientCount: c.recipients?.length || 0,
      })),
    };
  }),

  /**
   * Update alert configuration
   */
  updateAlertConfig: protectedProcedure
    .input(
      z.object({
        enabled: z.boolean().optional(),
        channels: z
          .array(
            z.object({
              type: z.enum(['email', 'sms', 'slack', 'pagerduty', 'webhook']),
              enabled: z.boolean(),
              recipients: z.array(z.string()).optional(),
            })
          )
          .optional(),
      })
    )
    .mutation(({ input }) => {
      webhookNotifications.updateAlertConfig({
        enabled: input.enabled,
        channels: input.channels as any,
      });

      return {
        success: true,
        message: 'Alert configuration updated',
      };
    }),
});

