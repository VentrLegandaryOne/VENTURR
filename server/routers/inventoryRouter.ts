import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  createInventoryItem,
  getInventoryItem,
  getOrganizationInventory,
  updateInventoryItem,
  recordStockMovement,
  getItemStockMovements,
  createStockAlert,
  getActiveAlerts,
  resolveStockAlert,
  createReorderOrder,
  getOrganizationReorderOrders,
  getPendingReorderOrders,
  updateReorderOrder,
} from "../db";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";

export const inventoryRouter = router({
  // INVENTORY ITEMS
  items: router({
    list: protectedProcedure
      .input(z.object({ organizationId: z.string().min(1) }))
      .query(async ({ input }) => {
        try {
          const items = await getOrganizationInventory(input.organizationId);
          return { success: true, data: items };
        } catch (error) {
          console.error("Error fetching inventory items:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch inventory items",
          });
        }
      }),

    get: protectedProcedure
      .input(z.object({ itemId: z.string().min(1) }))
      .query(async ({ input }) => {
        try {
          const item = await getInventoryItem(input.itemId);
          if (!item) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Inventory item not found",
            });
          }
          return { success: true, data: item };
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          console.error("Error fetching inventory item:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch inventory item",
          });
        }
      }),

    create: protectedProcedure
      .input(
        z.object({
          organizationId: z.string().min(1),
          name: z.string().min(1, "Name required"),
          sku: z.string().min(1, "SKU required"),
          category: z.string().min(1, "Category required"),
          unitPrice: z.string().min(1, "Unit price required"),
          costPrice: z.string().min(1, "Cost price required"),
          unit: z.string().min(1, "Unit required"),
          description: z.string().optional(),
          supplier: z.string().optional(),
          minimumStock: z.string().default("10"),
          maximumStock: z.string().default("1000"),
          reorderPoint: z.string().default("20"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const item = await createInventoryItem({
            id: `inv_${nanoid()}`,
            organizationId: input.organizationId,
            name: input.name,
            sku: input.sku,
            category: input.category,
            unitPrice: input.unitPrice,
            costPrice: input.costPrice,
            unit: input.unit,
            description: input.description,
            supplier: input.supplier,
            minimumStock: input.minimumStock,
            maximumStock: input.maximumStock,
            reorderPoint: input.reorderPoint,
            currentStock: "0",
            createdBy: ctx.user.id,
            createdAt: new Date(),
            updatedAt: new Date(),
            lastRestockDate: null,
          });
          return { success: true, data: item };
        } catch (error) {
          console.error("Error creating inventory item:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create inventory item",
          });
        }
      }),

    update: protectedProcedure
      .input(
        z.object({
          itemId: z.string().min(1),
          name: z.string().optional(),
          unitPrice: z.string().optional(),
          costPrice: z.string().optional(),
          minimumStock: z.string().optional(),
          maximumStock: z.string().optional(),
          reorderPoint: z.string().optional(),
          supplier: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const { itemId, ...updates } = input;
          await updateInventoryItem(itemId, {
            ...updates,
            updatedAt: new Date(),
          });
          const updated = await getInventoryItem(itemId);
          return { success: true, data: updated };
        } catch (error) {
          console.error("Error updating inventory item:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update inventory item",
          });
        }
      }),
  }),

  // STOCK MOVEMENTS
  movements: router({
    list: protectedProcedure
      .input(z.object({ itemId: z.string().min(1) }))
      .query(async ({ input }) => {
        try {
          const movements = await getItemStockMovements(input.itemId);
          return { success: true, data: movements };
        } catch (error) {
          console.error("Error fetching stock movements:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch stock movements",
          });
        }
      }),

    record: protectedProcedure
      .input(
        z.object({
          itemId: z.string().min(1),
          type: z.enum(["in", "out", "adjustment", "damage", "return"]),
          quantity: z.string().min(1, "Quantity required"),
          reason: z.string().optional(),
          reference: z.string().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const item = await getInventoryItem(input.itemId);
          if (!item) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Inventory item not found",
            });
          }

          // Record the movement
          const movement = await recordStockMovement({
            id: `mov_${nanoid()}`,
            inventoryItemId: input.itemId,
            type: input.type,
            quantity: input.quantity,
            reason: input.reason,
            reference: input.reference,
            notes: input.notes,
            createdBy: ctx.user.id,
            createdAt: new Date(),
          });

          // Update inventory stock
          const currentStock = parseInt(item.currentStock || "0");
          const qty = parseInt(input.quantity);
          let newStock = currentStock;

          if (input.type === "in" || input.type === "return") {
            newStock = currentStock + qty;
          } else if (input.type === "out" || input.type === "damage") {
            newStock = Math.max(0, currentStock - qty);
          }

          await updateInventoryItem(input.itemId, {
            currentStock: newStock.toString(),
            lastRestockDate: input.type === "in" ? new Date() : undefined,
          });

          // Check if alert should be created
          if (newStock <= parseInt(item.reorderPoint || "20")) {
            await createStockAlert({
              id: `alert_${nanoid()}`,
              inventoryItemId: input.itemId,
              alertType: "reorder_needed",
              severity: "high",
              message: `Stock level for ${item.name} is below reorder point`,
              isResolved: "false",
              createdAt: new Date(),
              resolvedAt: null,
            });
          }

          return { success: true, data: movement };
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          console.error("Error recording stock movement:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to record stock movement",
          });
        }
      }),
  }),

  // STOCK ALERTS
  alerts: router({
    list: protectedProcedure
      .input(z.object({ organizationId: z.string().min(1) }))
      .query(async ({ input }) => {
        try {
          const alerts = await getActiveAlerts(input.organizationId);
          return { success: true, data: alerts };
        } catch (error) {
          console.error("Error fetching stock alerts:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch stock alerts",
          });
        }
      }),

    resolve: protectedProcedure
      .input(z.object({ alertId: z.string().min(1) }))
      .mutation(async ({ input }) => {
        try {
          await resolveStockAlert(input.alertId);
          return { success: true };
        } catch (error) {
          console.error("Error resolving alert:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to resolve alert",
          });
        }
      }),
  }),

  // REORDER ORDERS
  reorders: router({
    list: protectedProcedure
      .input(z.object({ organizationId: z.string().min(1) }))
      .query(async ({ input }) => {
        try {
          const orders = await getOrganizationReorderOrders(input.organizationId);
          return { success: true, data: orders };
        } catch (error) {
          console.error("Error fetching reorder orders:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch reorder orders",
          });
        }
      }),

    pending: protectedProcedure
      .input(z.object({ organizationId: z.string().min(1) }))
      .query(async ({ input }) => {
        try {
          const orders = await getPendingReorderOrders(input.organizationId);
          return { success: true, data: orders };
        } catch (error) {
          console.error("Error fetching pending reorder orders:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch pending reorder orders",
          });
        }
      }),

    create: protectedProcedure
      .input(
        z.object({
          organizationId: z.string().min(1),
          itemId: z.string().min(1),
          quantity: z.string().min(1, "Quantity required"),
          supplier: z.string().optional(),
          cost: z.string().optional(),
          expectedDelivery: z.date().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const order = await createReorderOrder({
            id: `reorder_${nanoid()}`,
            organizationId: input.organizationId,
            inventoryItemId: input.itemId,
            quantity: input.quantity,
            supplier: input.supplier,
            cost: input.cost,
            expectedDelivery: input.expectedDelivery,
            notes: input.notes,
            status: "pending",
            orderDate: new Date(),
            actualDelivery: null,
            createdBy: ctx.user.id,
            createdAt: new Date(),
          });
          return { success: true, data: order };
        } catch (error) {
          console.error("Error creating reorder order:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create reorder order",
          });
        }
      }),

    update: protectedProcedure
      .input(
        z.object({
          orderId: z.string().min(1),
          status: z.enum(["pending", "ordered", "received", "canceled"]).optional(),
          actualDelivery: z.date().optional(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const { orderId, ...updates } = input;
          await updateReorderOrder(orderId, updates);
          return { success: true };
        } catch (error) {
          console.error("Error updating reorder order:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update reorder order",
          });
        }
      }),
  }),

  // DASHBOARD STATS
  stats: protectedProcedure
    .input(z.object({ organizationId: z.string().min(1) }))
    .query(async ({ input }) => {
      try {
        const items = await getOrganizationInventory(input.organizationId);
        const alerts = await getActiveAlerts(input.organizationId);
        const reorders = await getPendingReorderOrders(input.organizationId);

        const totalValue = items.reduce((sum, item) => {
          return sum + (parseInt(item.unitPrice || "0") * parseInt(item.currentStock || "0"));
        }, 0);

        const lowStockCount = items.filter(
          (item) => parseInt(item.currentStock || "0") <= parseInt(item.minimumStock || "10")
        ).length;

        return {
          success: true,
          data: {
            totalItems: items.length,
            totalValue: totalValue.toString(),
            activeAlerts: alerts.length,
            lowStockItems: lowStockCount,
            pendingReorders: reorders.length,
            averageStockValue: items.length > 0 ? (totalValue / items.length).toString() : "0",
          },
        };
      } catch (error) {
        console.error("Error fetching inventory stats:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch inventory stats",
        });
      }
    }),
});

