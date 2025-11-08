import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  addProjectCost,
  getProjectCosts,
  calculateProjectTotalCosts,
  updateProjectBudgetTracking,
  updateProjectProfitability,
  getProjectProfitabilitySummary,
  getProjectBudgetTracking,
  getProjectCostBreakdown,
  checkBudgetAlerts,
} from "../db";
import { TRPCError } from "@trpc/server";

export const profitabilityRouter = router({
  // Add project cost
  addCost: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        costType: z.enum(["material", "labor", "equipment", "subcontractor", "other"]),
        description: z.string(),
        amount: z.number().min(0),
        quantity: z.number().optional(),
        unitPrice: z.number().optional(),
        allocationId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await addProjectCost(
          input.projectId,
          input.costType,
          input.description,
          input.amount,
          {
            quantity: input.quantity,
            unitPrice: input.unitPrice,
            allocationId: input.allocationId,
          },
          ctx.user.id
        );

        if (!result.success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to add project cost",
          });
        }

        return {
          success: true,
          costId: result.costId,
          message: "Cost added successfully",
        };
      } catch (error) {
        console.error("[profitabilityRouter] Add cost failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to add project cost",
        });
      }
    }),

  // Get project costs
  getProjectCosts: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ input }) => {
      try {
        const costs = await getProjectCosts(input.projectId);
        return {
          success: true,
          data: costs,
          count: costs.length,
        };
      } catch (error) {
        console.error("[profitabilityRouter] Get costs failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch project costs",
        });
      }
    }),

  // Get total project costs
  getTotalCosts: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ input }) => {
      try {
        const total = await calculateProjectTotalCosts(input.projectId);
        return {
          success: true,
          total,
        };
      } catch (error) {
        console.error("[profitabilityRouter] Get total costs failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to calculate total costs",
        });
      }
    }),

  // Update budget tracking
  updateBudgetTracking: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        budgetedAmount: z.number().min(0),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await updateProjectBudgetTracking(
          input.projectId,
          input.budgetedAmount
        );

        if (!result.success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update budget tracking",
          });
        }

        return {
          success: true,
          message: "Budget tracking updated",
        };
      } catch (error) {
        console.error("[profitabilityRouter] Update budget tracking failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update budget tracking",
        });
      }
    }),

  // Get profitability summary
  getProfitabilitySummary: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ input }) => {
      try {
        const summary = await getProjectProfitabilitySummary(input.projectId);
        
        if (!summary) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Profitability data not found",
          });
        }

        return {
          success: true,
          data: summary,
        };
      } catch (error) {
        console.error("[profitabilityRouter] Get profitability summary failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch profitability summary",
        });
      }
    }),

  // Get budget tracking
  getBudgetTracking: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ input }) => {
      try {
        const tracking = await getProjectBudgetTracking(input.projectId);
        
        if (!tracking) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Budget tracking not found",
          });
        }

        return {
          success: true,
          data: tracking,
        };
      } catch (error) {
        console.error("[profitabilityRouter] Get budget tracking failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch budget tracking",
        });
      }
    }),

  // Get cost breakdown
  getCostBreakdown: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ input }) => {
      try {
        const breakdown = await getProjectCostBreakdown(input.projectId);
        return {
          success: true,
          data: breakdown,
        };
      } catch (error) {
        console.error("[profitabilityRouter] Get cost breakdown failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch cost breakdown",
        });
      }
    }),

  // Check for budget alerts
  checkAlerts: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ input }) => {
      try {
        const alerts = await checkBudgetAlerts(input.projectId);
        return {
          success: true,
          data: alerts,
          hasAlerts: alerts.length > 0,
        };
      } catch (error) {
        console.error("[profitabilityRouter] Check alerts failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to check budget alerts",
        });
      }
    }),

  // Update profitability (recalculate)
  updateProfitability: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const result = await updateProjectProfitability(input.projectId);

        if (!result.success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update profitability",
          });
        }

        return {
          success: true,
          message: "Profitability updated",
        };
      } catch (error) {
        console.error("[profitabilityRouter] Update profitability failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update profitability",
        });
      }
    }),
});

