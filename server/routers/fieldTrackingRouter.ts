import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  logFieldActivity,
  getProjectFieldActivities,
  queueOfflineData,
  getPendingOfflineData,
  markOfflineDataSynced,
  getProjectActivitySummary,
} from "../db";
import { TRPCError } from "@trpc/server";

export const fieldTrackingRouter = router({
  // Log field activity (material usage, photos, GPS, issues)
  logActivity: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        activityType: z.enum(["material_usage", "task_completion", "photo_capture", "location_update", "issue_report"]),
        allocationId: z.string().optional(),
        description: z.string().optional(),
        quantity: z.number().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        photoUrl: z.string().optional(),
        offlineSync: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await logFieldActivity(
          input.projectId,
          input.activityType,
          {
            allocationId: input.allocationId,
            description: input.description,
            quantity: input.quantity,
            latitude: input.latitude,
            longitude: input.longitude,
            photoUrl: input.photoUrl,
            offlineSync: input.offlineSync,
          },
          ctx.user.id
        );

        if (!result.success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: result.message,
          });
        }

        return {
          success: true,
          activityId: result.activityId,
          message: result.message,
        };
      } catch (error) {
        console.error("[fieldTrackingRouter] Log activity failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to log field activity",
        });
      }
    }),

  // Get field activities for a project
  getProjectActivities: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ input }) => {
      try {
        const activities = await getProjectFieldActivities(input.projectId);
        return {
          success: true,
          data: activities,
          count: activities.length,
        };
      } catch (error) {
        console.error("[fieldTrackingRouter] Get activities failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch field activities",
        });
      }
    }),

  // Queue offline data for sync
  queueOfflineData: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        dataType: z.string(),
        payload: z.any(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await queueOfflineData(
          ctx.user.id,
          input.projectId,
          input.dataType,
          input.payload
        );

        if (!result.success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to queue offline data",
          });
        }

        return {
          success: true,
          queueId: result.queueId,
          message: "Data queued for sync",
        };
      } catch (error) {
        console.error("[fieldTrackingRouter] Queue offline data failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to queue offline data",
        });
      }
    }),

  // Get pending offline data
  getPendingOfflineData: protectedProcedure.query(async ({ ctx }) => {
    try {
      const pending = await getPendingOfflineData(ctx.user.id);
      return {
        success: true,
        data: pending,
        count: pending.length,
      };
    } catch (error) {
      console.error("[fieldTrackingRouter] Get pending offline data failed:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch pending offline data",
      });
    }
  }),

  // Mark offline data as synced
  markSynced: protectedProcedure
    .input(z.object({ queueId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const result = await markOfflineDataSynced(input.queueId);

        if (!result.success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to mark data as synced",
          });
        }

        return {
          success: true,
          message: "Data marked as synced",
        };
      } catch (error) {
        console.error("[fieldTrackingRouter] Mark synced failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to mark data as synced",
        });
      }
    }),

  // Get activity summary for project
  getActivitySummary: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ input }) => {
      try {
        const summary = await getProjectActivitySummary(input.projectId);
        return {
          success: true,
          data: summary,
        };
      } catch (error) {
        console.error("[fieldTrackingRouter] Get activity summary failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch activity summary",
        });
      }
    }),

  // Sync all pending offline data (called when connection restored)
  syncAllOfflineData: protectedProcedure
    .input(
      z.object({
        queueIds: z.array(z.string()),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const results = [];
        for (const queueId of input.queueIds) {
          const result = await markOfflineDataSynced(queueId);
          results.push({ queueId, synced: result.success });
        }

        const successCount = results.filter(r => r.synced).length;
        return {
          success: true,
          message: `Synced ${successCount} of ${results.length} items`,
          results,
        };
      } catch (error) {
        console.error("[fieldTrackingRouter] Sync all offline data failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to sync offline data",
        });
      }
    }),
});

