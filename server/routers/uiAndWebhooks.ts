/**
 * tRPC Routers for UI Authentication and Webhook Management
 */

import { z } from 'zod';
import { publicProcedure, protectedProcedure, router } from '../_core/trpc';
import { webhookSystemManager } from '../_core/webhookSystem';

export const uiAndWebhooksRouter = router({
  // ============ UI AUTHENTICATION ROUTES ============

  ui: router({
    // Password reset request
    requestPasswordReset: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        // In production, send reset email
        console.log(`[UI] Password reset requested for: ${input.email}`);

        return {
          success: true,
          message: 'Password reset email sent. Check your inbox.',
        };
      }),

    // Verify password reset token
    verifyResetToken: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(({ input }) => {
        // In production, validate token from database
        const isValid = input.token.length > 0;

        return {
          valid: isValid,
          message: isValid ? 'Token is valid' : 'Token is invalid or expired',
        };
      }),

    // Reset password with token
    resetPassword: publicProcedure
      .input(
        z.object({
          token: z.string(),
          newPassword: z.string().min(8),
          confirmPassword: z.string(),
        })
      )
      .mutation(({ input }) => {
        if (input.newPassword !== input.confirmPassword) {
          return {
            success: false,
            error: 'Passwords do not match',
          };
        }

        // In production, update password in database
        console.log(`[UI] Password reset completed`);

        return {
          success: true,
          message: 'Password has been reset successfully',
        };
      }),

    // Verify email address
    verifyEmail: publicProcedure
      .input(z.object({ email: z.string().email(), code: z.string() }))
      .mutation(({ input }) => {
        // In production, validate code from database
        const isValid = input.code.length === 6;

        if (!isValid) {
          return {
            success: false,
            error: 'Invalid verification code',
          };
        }

        console.log(`[UI] Email verified: ${input.email}`);

        return {
          success: true,
          message: 'Email verified successfully',
        };
      }),

    // Resend verification email
    resendVerificationEmail: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(({ input }) => {
        // In production, send verification email
        console.log(`[UI] Verification email resent to: ${input.email}`);

        return {
          success: true,
          message: 'Verification email sent',
        };
      }),
  }),

  // ============ WEBHOOK MANAGEMENT ROUTES ============

  webhooks: router({
    // Create webhook subscription
    createSubscription: protectedProcedure
      .input(
        z.object({
          url: z.string().url(),
          events: z.array(
            z.enum([
              'project.created',
              'project.updated',
              'quote.sent',
              'payment.received',
              'project.completed',
            ])
          ),
        })
      )
      .mutation(({ ctx, input }) => {
        const developerId = `dev-${ctx.user.id}`;
        const subscription = webhookSystemManager.createSubscription(
          developerId,
          input.url,
          input.events
        );

        return {
          success: true,
          subscription: {
            id: subscription.id,
            url: subscription.url,
            events: subscription.events,
            isActive: subscription.isActive,
            createdAt: subscription.createdAt,
          },
        };
      }),

    // Update webhook subscription
    updateSubscription: protectedProcedure
      .input(
        z.object({
          subscriptionId: z.string(),
          url: z.string().url().optional(),
          events: z.array(z.string()).optional(),
          isActive: z.boolean().optional(),
        })
      )
      .mutation(({ input }) => {
        const success = webhookSystemManager.updateSubscription(
          input.subscriptionId,
          input
        );

        return {
          success,
          message: success ? 'Subscription updated' : 'Subscription not found',
        };
      }),

    // Delete webhook subscription
    deleteSubscription: protectedProcedure
      .input(z.object({ subscriptionId: z.string() }))
      .mutation(({ input }) => {
        const success = webhookSystemManager.deleteSubscription(input.subscriptionId);

        return {
          success,
          message: success ? 'Subscription deleted' : 'Subscription not found',
        };
      }),

    // Get developer subscriptions
    getSubscriptions: protectedProcedure.query(({ ctx }) => {
      const developerId = `dev-${ctx.user.id}`;
      const subscriptions = webhookSystemManager.getDeveloperSubscriptions(developerId);

      return subscriptions.map((s) => ({
        id: s.id,
        url: s.url,
        events: s.events,
        isActive: s.isActive,
        createdAt: s.createdAt,
        lastTriggeredAt: s.lastTriggeredAt,
        failureCount: s.failureCount,
      }));
    }),

    // Get delivery history
    getDeliveryHistory: protectedProcedure
      .input(z.object({ subscriptionId: z.string(), limit: z.number().optional() }))
      .query(({ input }) => {
        const deliveries = webhookSystemManager.getDeliveryHistory(
          input.subscriptionId,
          input.limit
        );

        return deliveries.map((d) => ({
          id: d.id,
          status: d.status,
          statusCode: d.statusCode,
          attemptCount: d.attemptCount,
          timestamp: d.timestamp,
          nextRetryAt: d.nextRetryAt,
        }));
      }),

    // Test webhook endpoint
    testWebhook: protectedProcedure
      .input(z.object({ subscriptionId: z.string() }))
      .mutation(async ({ input }) => {
        const success = await webhookSystemManager.testWebhook(input.subscriptionId);

        return {
          success,
          message: success ? 'Webhook test successful' : 'Webhook test failed',
        };
      }),

    // Get webhook statistics
    getStatistics: protectedProcedure.query(({ ctx }) => {
      if (ctx.user.role !== 'admin') {
        return null;
      }

      return webhookSystemManager.getWebhookStatistics();
    }),

    // Get available events
    getAvailableEvents: publicProcedure.query(() => {
      return [
        {
          id: 'project.created',
          name: 'Project Created',
          description: 'Triggered when a new project is created',
        },
        {
          id: 'project.updated',
          name: 'Project Updated',
          description: 'Triggered when a project is updated',
        },
        {
          id: 'quote.sent',
          name: 'Quote Sent',
          description: 'Triggered when a quote is sent to a client',
        },
        {
          id: 'payment.received',
          name: 'Payment Received',
          description: 'Triggered when a payment is received',
        },
        {
          id: 'project.completed',
          name: 'Project Completed',
          description: 'Triggered when a project is marked as completed',
        },
      ];
    }),
  }),
});

