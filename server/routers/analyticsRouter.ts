import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  recordAnalyticsMetric,
  updateKPIDashboard,
  getKPIDashboard,
  recordRevenueTrend,
  getRevenueTrends,
  getAnalyticsMetricsByType,
  calculateProfitabilityTrend,
  getTopPerformingProjects,
  getUnderperformingProjects,
} from "../db";
import { TRPCError } from "@trpc/server";

export const analyticsRouter = router({
  // Record metric
  recordMetric: protectedProcedure
    .input(
      z.object({
        organizationId: z.string(),
        metricType: z.string(),
        metricName: z.string(),
        metricValue: z.number(),
        period: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await recordAnalyticsMetric(
          input.organizationId,
          input.metricType,
          input.metricName,
          input.metricValue,
          input.period
        );

        if (!result.success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to record metric",
          });
        }

        return {
          success: true,
          metricId: result.metricId,
          message: "Metric recorded",
        };
      } catch (error) {
        console.error("[analyticsRouter] Record metric failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to record analytics metric",
        });
      }
    }),

  // Update KPI dashboard
  updateKPIDashboard: protectedProcedure
    .input(z.object({ organizationId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const result = await updateKPIDashboard(input.organizationId);

        if (!result.success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update KPI dashboard",
          });
        }

        return {
          success: true,
          message: "KPI dashboard updated",
        };
      } catch (error) {
        console.error("[analyticsRouter] Update KPI dashboard failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update KPI dashboard",
        });
      }
    }),

  // Get KPI dashboard
  getKPIDashboard: protectedProcedure
    .input(z.object({ organizationId: z.string() }))
    .query(async ({ input }) => {
      try {
        const kpi = await getKPIDashboard(input.organizationId);

        if (!kpi) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "KPI dashboard not found",
          });
        }

        return {
          success: true,
          data: kpi,
        };
      } catch (error) {
        console.error("[analyticsRouter] Get KPI dashboard failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch KPI dashboard",
        });
      }
    }),

  // Record revenue trend
  recordRevenueTrend: protectedProcedure
    .input(
      z.object({
        organizationId: z.string(),
        month: z.string(),
        revenue: z.number().min(0),
        costs: z.number().min(0),
        projectCount: z.number().min(0),
        projectedRevenue: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await recordRevenueTrend(
          input.organizationId,
          input.month,
          input.revenue,
          input.costs,
          input.projectCount,
          input.projectedRevenue
        );

        if (!result.success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to record revenue trend",
          });
        }

        return {
          success: true,
          trendId: result.trendId,
          message: "Revenue trend recorded",
        };
      } catch (error) {
        console.error("[analyticsRouter] Record revenue trend failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to record revenue trend",
        });
      }
    }),

  // Get revenue trends
  getRevenueTrends: protectedProcedure
    .input(
      z.object({
        organizationId: z.string(),
        months: z.number().min(1).max(60).optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const trends = await getRevenueTrends(input.organizationId, input.months);
        return {
          success: true,
          data: trends,
          count: trends.length,
        };
      } catch (error) {
        console.error("[analyticsRouter] Get revenue trends failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch revenue trends",
        });
      }
    }),

  // Get metrics by type
  getMetricsByType: protectedProcedure
    .input(
      z.object({
        organizationId: z.string(),
        metricType: z.string(),
        period: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const metrics = await getAnalyticsMetricsByType(
          input.organizationId,
          input.metricType,
          input.period
        );
        return {
          success: true,
          data: metrics,
          count: metrics.length,
        };
      } catch (error) {
        console.error("[analyticsRouter] Get metrics by type failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch metrics",
        });
      }
    }),

  // Calculate profitability trend
  getProfitabilityTrend: protectedProcedure
    .input(z.object({ organizationId: z.string() }))
    .query(async ({ input }) => {
      try {
        const trend = await calculateProfitabilityTrend(input.organizationId);

        if (!trend) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to calculate profitability trend",
          });
        }

        return {
          success: true,
          data: trend,
        };
      } catch (error) {
        console.error("[analyticsRouter] Get profitability trend failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to calculate profitability trend",
        });
      }
    }),

  // Get top performing projects
  getTopProjects: protectedProcedure
    .input(
      z.object({
        organizationId: z.string(),
        limit: z.number().min(1).max(50).optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const projects = await getTopPerformingProjects(input.organizationId, input.limit);
        return {
          success: true,
          data: projects,
          count: projects.length,
        };
      } catch (error) {
        console.error("[analyticsRouter] Get top projects failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch top performing projects",
        });
      }
    }),

  // Get underperforming projects
  getUnderperformingProjects: protectedProcedure
    .input(
      z.object({
        organizationId: z.string(),
        limit: z.number().min(1).max(50).optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const projects = await getUnderperformingProjects(input.organizationId, input.limit);
        return {
          success: true,
          data: projects,
          count: projects.length,
          hasUnderperforming: projects.length > 0,
        };
      } catch (error) {
        console.error("[analyticsRouter] Get underperforming projects failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch underperforming projects",
        });
      }
    }),
});

