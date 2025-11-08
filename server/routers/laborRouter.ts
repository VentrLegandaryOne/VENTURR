import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  submitLaborTimesheet,
  getProjectLaborTimesheets,
  approveLaborTimesheet,
  updateLaborCostsSummary,
  getProjectLaborCostsSummary,
  getUserLaborTimesheets,
  calculateLaborVariance,
  getPendingTimesheets,
} from "../db";
import { TRPCError } from "@trpc/server";

export const laborRouter = router({
  // Submit labor timesheet
  submitTimesheet: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        date: z.date(),
        hoursWorked: z.number().min(0.5).max(24),
        hourlyRate: z.number().min(0),
        taskDescription: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await submitLaborTimesheet(
          input.projectId,
          ctx.user.id,
          input.date,
          input.hoursWorked,
          input.hourlyRate,
          input.taskDescription
        );

        if (!result.success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to submit timesheet",
          });
        }

        return {
          success: true,
          timesheetId: result.timesheetId,
          message: "Timesheet submitted successfully",
        };
      } catch (error) {
        console.error("[laborRouter] Submit timesheet failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to submit labor timesheet",
        });
      }
    }),

  // Get project labor timesheets
  getProjectTimesheets: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ input }) => {
      try {
        const timesheets = await getProjectLaborTimesheets(input.projectId);
        return {
          success: true,
          data: timesheets,
          count: timesheets.length,
        };
      } catch (error) {
        console.error("[laborRouter] Get project timesheets failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch project timesheets",
        });
      }
    }),

  // Approve labor timesheet
  approveTimesheet: protectedProcedure
    .input(z.object({ timesheetId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const result = await approveLaborTimesheet(input.timesheetId);

        if (!result.success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to approve timesheet",
          });
        }

        return {
          success: true,
          message: "Timesheet approved",
        };
      } catch (error) {
        console.error("[laborRouter] Approve timesheet failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to approve labor timesheet",
        });
      }
    }),

  // Get labor costs summary
  getLaborCostsSummary: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ input }) => {
      try {
        const summary = await getProjectLaborCostsSummary(input.projectId);

        if (!summary) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Labor costs summary not found",
          });
        }

        return {
          success: true,
          data: summary,
        };
      } catch (error) {
        console.error("[laborRouter] Get labor costs summary failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch labor costs summary",
        });
      }
    }),

  // Get user labor timesheets
  getUserTimesheets: protectedProcedure
    .input(
      z.object({
        projectId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const timesheets = await getUserLaborTimesheets(ctx.user.id, input.projectId);
        return {
          success: true,
          data: timesheets,
          count: timesheets.length,
        };
      } catch (error) {
        console.error("[laborRouter] Get user timesheets failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch user timesheets",
        });
      }
    }),

  // Calculate labor variance
  calculateVariance: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        budgetedHours: z.number().min(0),
      })
    )
    .query(async ({ input }) => {
      try {
        const variance = await calculateLaborVariance(input.projectId, input.budgetedHours);
        return {
          success: true,
          data: variance,
        };
      } catch (error) {
        console.error("[laborRouter] Calculate variance failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to calculate labor variance",
        });
      }
    }),

  // Get pending timesheets for approval
  getPendingTimesheets: protectedProcedure
    .input(
      z.object({
        projectId: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const pending = await getPendingTimesheets(input.projectId);
        return {
          success: true,
          data: pending,
          count: pending.length,
          hasPending: pending.length > 0,
        };
      } catch (error) {
        console.error("[laborRouter] Get pending timesheets failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch pending timesheets",
        });
      }
    }),

  // Update labor costs summary (recalculate)
  updateCostsSummary: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const result = await updateLaborCostsSummary(input.projectId);

        if (!result.success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update costs summary",
          });
        }

        return {
          success: true,
          message: "Labor costs summary updated",
        };
      } catch (error) {
        console.error("[laborRouter] Update costs summary failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update labor costs summary",
        });
      }
    }),
});

