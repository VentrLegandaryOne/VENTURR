import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  createWorkflowAutomation,
  getOrganizationWorkflows,
  getActiveWorkflows,
  updateWorkflow,
  disableWorkflow,
  logWorkflowExecution,
  getWorkflowExecutionLogs,
  getFailedWorkflowExecutions,
  getWorkflowStatistics,
  deleteWorkflow,
  getWorkflowsByTrigger,
} from "../db";
import { TRPCError } from "@trpc/server";

export const workflowRouter = router({
  // Create workflow
  create: protectedProcedure
    .input(
      z.object({
        organizationId: z.string(),
        name: z.string(),
        trigger: z.string(),
        action: z.string(),
        triggerCondition: z.string().optional(),
        actionData: z.string().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await createWorkflowAutomation(
          input.organizationId,
          input.name,
          input.trigger,
          input.action,
          input.triggerCondition,
          input.actionData,
          input.description
        );

        if (!result.success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create workflow",
          });
        }

        return {
          success: true,
          workflowId: result.workflowId,
          message: `Workflow "${input.name}" created`,
        };
      } catch (error) {
        console.error("[workflowRouter] Create workflow failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create workflow automation",
        });
      }
    }),

  // Get organization workflows
  getWorkflows: protectedProcedure
    .input(z.object({ organizationId: z.string() }))
    .query(async ({ input }) => {
      try {
        const workflows = await getOrganizationWorkflows(input.organizationId);
        return {
          success: true,
          data: workflows,
          count: workflows.length,
        };
      } catch (error) {
        console.error("[workflowRouter] Get workflows failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch workflows",
        });
      }
    }),

  // Get active workflows
  getActiveWorkflows: protectedProcedure
    .input(z.object({ organizationId: z.string() }))
    .query(async ({ input }) => {
      try {
        const workflows = await getActiveWorkflows(input.organizationId);
        return {
          success: true,
          data: workflows,
          count: workflows.length,
        };
      } catch (error) {
        console.error("[workflowRouter] Get active workflows failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch active workflows",
        });
      }
    }),

  // Update workflow
  update: protectedProcedure
    .input(
      z.object({
        workflowId: z.string(),
        name: z.string().optional(),
        trigger: z.string().optional(),
        action: z.string().optional(),
        triggerCondition: z.string().optional(),
        actionData: z.string().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { workflowId, ...updates } = input;
        const result = await updateWorkflow(workflowId, updates);

        if (!result.success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update workflow",
          });
        }

        return {
          success: true,
          message: "Workflow updated",
        };
      } catch (error) {
        console.error("[workflowRouter] Update workflow failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update workflow",
        });
      }
    }),

  // Disable workflow
  disable: protectedProcedure
    .input(z.object({ workflowId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const result = await disableWorkflow(input.workflowId);

        if (!result.success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to disable workflow",
          });
        }

        return {
          success: true,
          message: "Workflow disabled",
        };
      } catch (error) {
        console.error("[workflowRouter] Disable workflow failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to disable workflow",
        });
      }
    }),

  // Log execution
  logExecution: protectedProcedure
    .input(
      z.object({
        workflowId: z.string(),
        organizationId: z.string(),
        status: z.enum(["pending", "running", "success", "failed"]),
        triggeredBy: z.string().optional(),
        result: z.string().optional(),
        errorMessage: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await logWorkflowExecution(
          input.workflowId,
          input.organizationId,
          input.status,
          input.triggeredBy,
          input.result,
          input.errorMessage
        );

        if (!result.success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to log execution",
          });
        }

        return {
          success: true,
          logId: result.logId,
        };
      } catch (error) {
        console.error("[workflowRouter] Log execution failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to log workflow execution",
        });
      }
    }),

  // Get execution logs
  getExecutionLogs: protectedProcedure
    .input(
      z.object({
        workflowId: z.string(),
        limit: z.number().min(1).max(100).optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const logs = await getWorkflowExecutionLogs(input.workflowId, input.limit);
        return {
          success: true,
          data: logs,
          count: logs.length,
        };
      } catch (error) {
        console.error("[workflowRouter] Get execution logs failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch execution logs",
        });
      }
    }),

  // Get failed executions
  getFailedExecutions: protectedProcedure
    .input(
      z.object({
        organizationId: z.string(),
        limit: z.number().min(1).max(100).optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const logs = await getFailedWorkflowExecutions(input.organizationId, input.limit);
        return {
          success: true,
          data: logs,
          count: logs.length,
          hasFailures: logs.length > 0,
        };
      } catch (error) {
        console.error("[workflowRouter] Get failed executions failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch failed executions",
        });
      }
    }),

  // Get statistics
  getStatistics: protectedProcedure
    .input(z.object({ organizationId: z.string() }))
    .query(async ({ input }) => {
      try {
        const stats = await getWorkflowStatistics(input.organizationId);

        if (!stats) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to calculate statistics",
          });
        }

        return {
          success: true,
          data: stats,
        };
      } catch (error) {
        console.error("[workflowRouter] Get statistics failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch workflow statistics",
        });
      }
    }),

  // Delete workflow
  delete: protectedProcedure
    .input(z.object({ workflowId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const result = await deleteWorkflow(input.workflowId);

        if (!result.success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to delete workflow",
          });
        }

        return {
          success: true,
          message: "Workflow deleted",
        };
      } catch (error) {
        console.error("[workflowRouter] Delete workflow failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete workflow",
        });
      }
    }),

  // Get workflows by trigger
  getByTrigger: protectedProcedure
    .input(
      z.object({
        organizationId: z.string(),
        trigger: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const workflows = await getWorkflowsByTrigger(input.organizationId, input.trigger);
        return {
          success: true,
          data: workflows,
          count: workflows.length,
        };
      } catch (error) {
        console.error("[workflowRouter] Get by trigger failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch workflows by trigger",
        });
      }
    }),
});

