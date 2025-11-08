import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import {
  allocateMaterialToProject,
  getProjectAllocations,
  updateMaterialUsage,
  completeAllocation,
  getAvailableInventory,
  checkAllocationConflicts,
} from "../db";
import { TRPCError } from "@trpc/server";

export const materialAllocationRouter = router({
  // Allocate materials to a project
  allocate: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        inventoryItemId: z.string(),
        quantity: z.number().min(1, "Quantity must be at least 1"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await allocateMaterialToProject(
          input.projectId,
          input.inventoryItemId,
          input.quantity,
          ctx.user.id
        );

        if (!result.success) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: result.message,
          });
        }

        return {
          success: true,
          message: result.message,
          allocation: result.allocation,
        };
      } catch (error) {
        console.error("[materialAllocationRouter] Allocation failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to allocate materials",
        });
      }
    }),

  // Get allocations for a project
  getProjectAllocations: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ input }) => {
      try {
        const allocations = await getProjectAllocations(input.projectId);
        return {
          success: true,
          data: allocations,
          count: allocations.length,
        };
      } catch (error) {
        console.error("[materialAllocationRouter] Get allocations failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch allocations",
        });
      }
    }),

  // Update material usage during project
  updateUsage: protectedProcedure
    .input(
      z.object({
        allocationId: z.string(),
        usedQuantity: z.number().min(0, "Used quantity cannot be negative"),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await updateMaterialUsage(
          input.allocationId,
          input.usedQuantity
        );

        if (!result.success) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: result.message,
          });
        }

        return { success: true, message: result.message };
      } catch (error) {
        console.error("[materialAllocationRouter] Update usage failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update material usage",
        });
      }
    }),

  // Complete allocation and return unused materials
  complete: protectedProcedure
    .input(
      z.object({
        allocationId: z.string(),
        finalUsedQuantity: z.number().min(0, "Final quantity cannot be negative"),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await completeAllocation(
          input.allocationId,
          input.finalUsedQuantity
        );

        if (!result.success) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: result.message,
          });
        }

        return {
          success: true,
          message: result.message,
          returnedQuantity: result.returnedQuantity,
        };
      } catch (error) {
        console.error("[materialAllocationRouter] Complete allocation failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to complete allocation",
        });
      }
    }),

  // Get available inventory for allocation
  getAvailable: protectedProcedure
    .input(z.object({ inventoryItemId: z.string() }))
    .query(async ({ input }) => {
      try {
        const available = await getAvailableInventory(input.inventoryItemId);

        if (!available) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Inventory item not found",
          });
        }

        return {
          success: true,
          data: available,
        };
      } catch (error) {
        console.error("[materialAllocationRouter] Get available failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch available inventory",
        });
      }
    }),

  // Check for allocation conflicts
  checkConflicts: protectedProcedure
    .input(z.object({ organizationId: z.string() }))
    .query(async ({ input }) => {
      try {
        const conflicts = await checkAllocationConflicts(input.organizationId);

        return {
          success: true,
          data: conflicts,
          hasConflicts: conflicts.length > 0,
          conflictCount: conflicts.length,
        };
      } catch (error) {
        console.error("[materialAllocationRouter] Check conflicts failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to check allocation conflicts",
        });
      }
    }),
});

