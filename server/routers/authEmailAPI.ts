/**
 * tRPC Routers for Authentication, Email Notifications, and API Documentation
 */

import { z } from 'zod';
import { publicProcedure, protectedProcedure, router } from '../_core/trpc';
import { authRBACManager } from '../_core/authenticationRBAC';
import { emailNotificationManager } from '../_core/emailNotifications';
import { apiDocumentationManager } from '../_core/apiDocumentation';

export const authEmailAPIRouter = router({
  // ============ AUTHENTICATION ROUTES ============

  auth: router({
    signup: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          password: z.string().min(8),
          name: z.string().min(2),
          organizationName: z.string().min(2),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const result = await authRBACManager.signup({
            email: input.email,
            password: input.password,
            name: input.name,
            organizationName: input.organizationName,
          });

          return {
            success: true,
            user: {
              id: result.user.id,
              email: result.user.email,
              name: result.user.name,
              role: result.user.role,
            },
            tokens: {
              accessToken: result.tokens.token,
              refreshToken: result.tokens.refreshToken,
              expiresAt: result.tokens.expiresAt,
            },
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Signup failed',
          };
        }
      }),

    login: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          password: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const result = await authRBACManager.login({
            email: input.email,
            password: input.password,
          });

          return {
            success: true,
            user: {
              id: result.user.id,
              email: result.user.email,
              name: result.user.name,
              role: result.user.role,
            },
            tokens: {
              accessToken: result.tokens.token,
              refreshToken: result.tokens.refreshToken,
              expiresAt: result.tokens.expiresAt,
            },
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Login failed',
          };
        }
      }),

    refreshToken: publicProcedure
      .input(z.object({ refreshToken: z.string() }))
      .mutation(({ input }) => {
        const tokens = authRBACManager.refreshToken(input.refreshToken);

        if (!tokens) {
          return { success: false, error: 'Invalid refresh token' };
        }

        return {
          success: true,
          tokens: {
            accessToken: tokens.token,
            refreshToken: tokens.refreshToken,
            expiresAt: tokens.expiresAt,
          },
        };
      }),

    getCurrentUser: protectedProcedure.query(({ ctx }) => {
      const user = authRBACManager.getUser(ctx.user.id);

      if (!user) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        permissions: user.permissions,
      };
    }),

    updateRole: protectedProcedure
      .input(
        z.object({
          userId: z.string(),
          newRole: z.enum(['admin', 'manager', 'team_member', 'client']),
        })
      )
      .mutation(({ input, ctx }) => {
        // Only admins can update roles
        if (ctx.user.role !== 'admin') {
          return { success: false, error: 'Unauthorized' };
        }

        const success = authRBACManager.updateUserRole(input.userId, input.newRole);

        return {
          success,
          message: success ? `User role updated to ${input.newRole}` : 'Failed to update role',
        };
      }),

    getAuthStatistics: protectedProcedure.query(({ ctx }) => {
      if (ctx.user.role !== 'admin') {
        return null;
      }

      return authRBACManager.getAuthStatistics();
    }),
  }),

  // ============ EMAIL NOTIFICATION ROUTES ============

  email: router({
    sendNotification: protectedProcedure
      .input(
        z.object({
          recipientEmail: z.string().email(),
          recipientName: z.string(),
          type: z.enum([
            'project_update',
            'quote_notification',
            'payment_reminder',
            'team_alert',
            'project_completed',
            'quote_accepted',
            'payment_received',
          ]),
          variables: z.record(z.string()),
        })
      )
      .mutation(async ({ input }) => {
        const notification = await emailNotificationManager.sendEmail(
          input.recipientEmail,
          input.recipientName,
          input.type,
          input.variables
        );

        return {
          success: !!notification,
          notificationId: notification?.id,
          message: notification ? 'Email queued for sending' : 'Failed to queue email',
        };
      }),

    scheduleNotification: protectedProcedure
      .input(
        z.object({
          recipientEmail: z.string().email(),
          recipientName: z.string(),
          type: z.enum([
            'project_update',
            'quote_notification',
            'payment_reminder',
            'team_alert',
            'project_completed',
            'quote_accepted',
            'payment_received',
          ]),
          variables: z.record(z.string()),
          scheduledFor: z.date(),
        })
      )
      .mutation(({ input }) => {
        const notification = emailNotificationManager.scheduleEmail(
          input.recipientEmail,
          input.recipientName,
          input.type,
          input.variables,
          input.scheduledFor
        );

        return {
          success: !!notification,
          notificationId: notification?.id,
          message: notification ? 'Email scheduled' : 'Failed to schedule email',
        };
      }),

    updateSubscription: protectedProcedure
      .input(
        z.object({
          email: z.string().email(),
          subscriptions: z.object({
            projectUpdates: z.boolean().optional(),
            quoteNotifications: z.boolean().optional(),
            paymentReminders: z.boolean().optional(),
            teamAlerts: z.boolean().optional(),
          }),
        })
      )
      .mutation(({ input }) => {
        emailNotificationManager.updateSubscription(input.email, input.subscriptions);

        return {
          success: true,
          message: 'Email preferences updated',
        };
      }),

    unsubscribe: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(({ input }) => {
        emailNotificationManager.unsubscribe(input.email);

        return {
          success: true,
          message: 'Successfully unsubscribed from all emails',
        };
      }),

    getNotificationStatus: protectedProcedure
      .input(z.object({ notificationId: z.string() }))
      .query(({ input }) => {
        const notification = emailNotificationManager.getNotificationStatus(input.notificationId);

        return notification || null;
      }),

    getEmailStatistics: protectedProcedure.query(({ ctx }) => {
      if (ctx.user.role !== 'admin') {
        return null;
      }

      return emailNotificationManager.getEmailStatistics();
    }),
  }),

  // ============ API DOCUMENTATION ROUTES ============

  api: router({
    registerDeveloper: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          organization: z.string(),
        })
      )
      .mutation(({ input, ctx }) => {
        const account = apiDocumentationManager.registerDeveloper(
          input.name,
          ctx.user.email,
          input.organization
        );

        return {
          success: true,
          account: {
            id: account.id,
            apiKey: account.apiKey,
            apiSecret: account.apiSecret,
            rateLimitTier: account.rateLimitTier,
            requestsLimit: account.requestsLimit,
          },
        };
      }),

    createAPIKey: protectedProcedure
      .input(z.object({ name: z.string() }))
      .mutation(({ input, ctx }) => {
        // In production, get developerId from user profile
        const developerId = `dev-${ctx.user.id}`;
        const apiKey = apiDocumentationManager.createAPIKey(developerId, input.name);

        if (!apiKey) {
          return { success: false, error: 'Failed to create API key' };
        }

        return {
          success: true,
          apiKey: {
            id: apiKey.id,
            key: apiKey.key,
            secret: apiKey.secret,
            name: apiKey.name,
          },
        };
      }),

    getEndpoint: publicProcedure
      .input(z.object({ endpointId: z.string() }))
      .query(({ input }) => {
        return apiDocumentationManager.getEndpoint(input.endpointId);
      }),

    getAllEndpoints: publicProcedure.query(() => {
      return apiDocumentationManager.getAllEndpoints();
    }),

    getEndpointsByCategory: publicProcedure
      .input(z.object({ category: z.string() }))
      .query(({ input }) => {
        return apiDocumentationManager.getEndpointsByCategory(input.category);
      }),

    checkRateLimit: protectedProcedure.query(({ ctx }) => {
      const developerId = `dev-${ctx.user.id}`;
      return apiDocumentationManager.checkRateLimit(developerId);
    }),

    getAPIStatistics: protectedProcedure.query(({ ctx }) => {
      if (ctx.user.role !== 'admin') {
        return null;
      }

      return apiDocumentationManager.getAPIStatistics();
    }),
  }),
});

