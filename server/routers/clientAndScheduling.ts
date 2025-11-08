/**
 * tRPC Routers for Client Portal, Scheduling, and Mobile Admin Dashboard
 */

import { z } from 'zod';
import { publicProcedure, protectedProcedure, router } from '../_core/trpc';
import { clientPortalManager } from '../_core/clientPortal';
import { advancedSchedulingManager } from '../_core/advancedScheduling';

export const clientAndSchedulingRouter = router({
  // ============ CLIENT PORTAL ROUTERS ============

  clientPortal: router({
    // Create portal access
    createAccess: protectedProcedure
      .input(
        z.object({
          clientId: z.string(),
          clientEmail: z.string().email(),
          projectId: z.string(),
          permissions: z.array(z.string()).optional(),
        })
      )
      .mutation(({ input }) => {
        return clientPortalManager.createPortalAccess(
          input.clientId,
          input.clientEmail,
          input.projectId,
          input.permissions as any
        );
      }),

    // Verify access token
    verifyAccess: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(({ input }) => {
        const access = clientPortalManager.verifyAccessToken(input.token);
        return { valid: !!access, access };
      }),

    // Get project view
    getProject: publicProcedure
      .input(z.object({ projectId: z.string() }))
      .query(({ input }) => {
        return clientPortalManager.getProjectView(input.projectId);
      }),

    // Get quote view
    getQuote: publicProcedure
      .input(z.object({ quoteId: z.string() }))
      .query(({ input }) => {
        return clientPortalManager.getQuoteView(input.quoteId);
      }),

    // Get payments
    getPayments: publicProcedure
      .input(z.object({ projectId: z.string() }))
      .query(({ input }) => {
        return clientPortalManager.getProjectPayments(input.projectId);
      }),

    // Get documents
    getDocuments: publicProcedure
      .input(z.object({ projectId: z.string() }))
      .query(({ input }) => {
        return clientPortalManager.getProjectDocuments(input.projectId);
      }),

    // Get notifications
    getNotifications: publicProcedure
      .input(z.object({ projectId: z.string() }))
      .query(({ input }) => {
        return clientPortalManager.getProjectNotifications(input.projectId);
      }),

    // Mark notification as read
    markNotificationRead: publicProcedure
      .input(z.object({ notificationId: z.string() }))
      .mutation(({ input }) => {
        const success = clientPortalManager.markNotificationAsRead(input.notificationId);
        return { success };
      }),

    // Get portal statistics
    getStatistics: protectedProcedure.query(() => {
      return clientPortalManager.getPortalStatistics();
    }),
  }),

  // ============ SCHEDULING ROUTERS ============

  scheduling: router({
    // Schedule project
    scheduleProject: protectedProcedure
      .input(
        z.object({
          projectId: z.string(),
          title: z.string(),
          startDate: z.date(),
          endDate: z.date(),
          assignedTeam: z.array(z.string()),
          priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
        })
      )
      .mutation(({ input }) => {
        return advancedSchedulingManager.scheduleProject(
          input.projectId,
          input.title,
          input.startDate,
          input.endDate,
          input.assignedTeam,
          input.priority
        );
      }),

    // Add milestone
    addMilestone: protectedProcedure
      .input(
        z.object({
          projectId: z.string(),
          name: z.string(),
          dueDate: z.date(),
          assignedTo: z.string(),
          description: z.string(),
        })
      )
      .mutation(({ input }) => {
        return advancedSchedulingManager.addMilestone(
          input.projectId,
          input.name,
          input.dueDate,
          input.assignedTo,
          input.description
        );
      }),

    // Allocate team member
    allocateTeamMember: protectedProcedure
      .input(
        z.object({
          projectId: z.string(),
          teamMemberId: z.string(),
          role: z.string(),
          allocationPercentage: z.number(),
          startDate: z.date(),
          endDate: z.date(),
        })
      )
      .mutation(({ input }) => {
        return advancedSchedulingManager.allocateTeamMember(
          input.projectId,
          input.teamMemberId,
          input.role,
          input.allocationPercentage,
          input.startDate,
          input.endDate
        );
      }),

    // Register team member
    registerTeamMember: protectedProcedure
      .input(
        z.object({
          memberId: z.string(),
          name: z.string(),
          role: z.string(),
          skills: z.array(z.string()).optional(),
          certifications: z.array(z.string()).optional(),
        })
      )
      .mutation(({ input }) => {
        return advancedSchedulingManager.registerTeamMember(
          input.memberId,
          input.name,
          input.role,
          input.skills,
          input.certifications
        );
      }),

    // Get project schedule
    getProjectSchedule: protectedProcedure
      .input(z.object({ projectId: z.string() }))
      .query(({ input }) => {
        return advancedSchedulingManager.getProjectSchedule(input.projectId);
      }),

    // Get team member schedule
    getTeamMemberSchedule: protectedProcedure
      .input(z.object({ memberId: z.string() }))
      .query(({ input }) => {
        return advancedSchedulingManager.getTeamMemberSchedule(input.memberId);
      }),

    // Get timeline visualization
    getTimeline: protectedProcedure
      .input(z.object({ projectId: z.string() }))
      .query(({ input }) => {
        return advancedSchedulingManager.getTimelineVisualization(input.projectId);
      }),

    // Get scheduling conflicts
    getConflicts: protectedProcedure
      .input(z.object({ projectId: z.string() }))
      .query(({ input }) => {
        return advancedSchedulingManager.getSchedulingConflicts(input.projectId);
      }),

    // Optimize resource allocation
    optimizeResources: protectedProcedure
      .input(z.object({ projectId: z.string() }))
      .mutation(({ input }) => {
        return advancedSchedulingManager.optimizeResourceAllocation(input.projectId);
      }),

    // Get team workload
    getTeamWorkload: protectedProcedure.query(() => {
      return advancedSchedulingManager.getTeamWorkload();
    }),

    // Get scheduling statistics
    getStatistics: protectedProcedure.query(() => {
      return advancedSchedulingManager.getSchedulingStatistics();
    }),
  }),

  // ============ MOBILE ADMIN DASHBOARD ROUTERS ============

  mobileAdmin: router({
    // Get admin metrics
    getMetrics: protectedProcedure.query(({ ctx }) => {
      // In production, fetch from database
      return {
        activeProjects: 12,
        teamMembers: 8,
        pendingApprovals: 5,
        revenue: 45230,
        teamUtilization: 87,
        projectCompletion: 78,
      };
    }),

    // Get team list
    getTeamList: protectedProcedure.query(() => {
      // In production, fetch from database
      return [
        {
          id: '1',
          name: 'John Smith',
          role: 'Lead Roofer',
          status: 'busy',
          workload: 95,
          projects: 3,
        },
        {
          id: '2',
          name: 'Sarah Johnson',
          role: 'Estimator',
          status: 'available',
          workload: 75,
          projects: 2,
        },
      ];
    }),

    // Get pending approvals
    getPendingApprovals: protectedProcedure.query(() => {
      // In production, fetch from database
      return [
        {
          id: '1',
          type: 'quote',
          title: 'Smith Residence - Roof Replacement',
          requestedBy: 'Sarah Johnson',
          amount: 15000,
          createdAt: new Date(Date.now() - 3600000),
          priority: 'high',
        },
      ];
    }),

    // Approve request
    approveRequest: protectedProcedure
      .input(z.object({ requestId: z.string(), notes: z.string().optional() }))
      .mutation(({ input, ctx }) => {
        console.log(`[MobileAdmin] Request approved: ${input.requestId} by ${ctx.user.id}`);
        return { success: true };
      }),

    // Reject request
    rejectRequest: protectedProcedure
      .input(z.object({ requestId: z.string(), reason: z.string() }))
      .mutation(({ input, ctx }) => {
        console.log(`[MobileAdmin] Request rejected: ${input.requestId} by ${ctx.user.id}`);
        return { success: true };
      }),

    // Get notifications
    getNotifications: protectedProcedure.query(() => {
      // In production, fetch from database
      return [
        {
          id: '1',
          type: 'alert',
          title: 'Team Overload Alert',
          message: 'John Smith is overallocated (95% workload)',
          read: false,
          createdAt: new Date(Date.now() - 1800000),
        },
      ];
    }),

    // Mark notification as read
    markNotificationRead: protectedProcedure
      .input(z.object({ notificationId: z.string() }))
      .mutation(({ input }) => {
        console.log(`[MobileAdmin] Notification marked as read: ${input.notificationId}`);
        return { success: true };
      }),

    // Get dashboard summary
    getSummary: protectedProcedure.query(({ ctx }) => {
      return {
        user: ctx.user,
        metrics: {
          activeProjects: 12,
          teamMembers: 8,
          pendingApprovals: 5,
          revenue: 45230,
        },
        recentActivity: [
          {
            type: 'project_completed',
            title: 'Williams Residential',
            timestamp: new Date(Date.now() - 7200000),
          },
          {
            type: 'quote_accepted',
            title: 'Smith Residence - $15,000',
            timestamp: new Date(Date.now() - 3600000),
          },
        ],
      };
    }),
  }),
});

