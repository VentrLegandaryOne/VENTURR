import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  upsertSupplier,
  getOrganizationSuppliers,
  addSupplierPricing,
  getBestSupplierPricing,
  createPurchaseOrder,
  getOrganizationPurchaseOrders,
  autoGeneratePurchaseOrder,
  updatePurchaseOrderStatus,
  getPendingPurchaseOrders,
  getOverduePurchaseOrders,
} from "../db";
import { TRPCError } from "@trpc/server";

export const supplierRouter = router({
  // Upsert supplier
  upsertSupplier: protectedProcedure
    .input(
      z.object({
        id: z.string().optional(),
        organizationId: z.string(),
        name: z.string(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        country: z.string().optional(),
        leadTime: z.string().optional(),
        minimumOrderQuantity: z.string().optional(),
        paymentTerms: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await upsertSupplier(input.organizationId, input);

        if (!result.success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to save supplier",
          });
        }

        return {
          success: true,
          supplierId: result.supplierId,
          message: "Supplier saved successfully",
        };
      } catch (error) {
        console.error("[supplierRouter] Upsert supplier failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to save supplier",
        });
      }
    }),

  // Get organization suppliers
  getSuppliers: protectedProcedure
    .input(z.object({ organizationId: z.string() }))
    .query(async ({ input }) => {
      try {
        const suppliers = await getOrganizationSuppliers(input.organizationId);
        return {
          success: true,
          data: suppliers,
          count: suppliers.length,
        };
      } catch (error) {
        console.error("[supplierRouter] Get suppliers failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch suppliers",
        });
      }
    }),

  // Add supplier pricing
  addPricing: protectedProcedure
    .input(
      z.object({
        supplierId: z.string(),
        inventoryItemId: z.string(),
        price: z.number().min(0),
        minimumQuantity: z.number().min(1).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await addSupplierPricing(
          input.supplierId,
          input.inventoryItemId,
          input.price,
          input.minimumQuantity
        );

        if (!result.success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to add pricing",
          });
        }

        return {
          success: true,
          pricingId: result.pricingId,
          message: "Pricing added successfully",
        };
      } catch (error) {
        console.error("[supplierRouter] Add pricing failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to add supplier pricing",
        });
      }
    }),

  // Get best supplier pricing
  getBestPricing: protectedProcedure
    .input(
      z.object({
        inventoryItemId: z.string(),
        quantity: z.number().min(1),
      })
    )
    .query(async ({ input }) => {
      try {
        const pricing = await getBestSupplierPricing(input.inventoryItemId, input.quantity);

        if (!pricing) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "No supplier pricing found",
          });
        }

        return {
          success: true,
          data: pricing,
        };
      } catch (error) {
        console.error("[supplierRouter] Get best pricing failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch supplier pricing",
        });
      }
    }),

  // Create purchase order
  createPO: protectedProcedure
    .input(
      z.object({
        organizationId: z.string(),
        supplierId: z.string(),
        items: z.array(
          z.object({
            inventoryItemId: z.string(),
            quantity: z.number().min(1),
            unitPrice: z.number().min(0),
          })
        ),
        expectedDeliveryDate: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await createPurchaseOrder(
          input.organizationId,
          input.supplierId,
          input.items,
          ctx.user.id,
          input.expectedDeliveryDate
        );

        if (!result.success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create purchase order",
          });
        }

        return {
          success: true,
          poId: result.poId,
          poNumber: result.poNumber,
          message: `Purchase Order ${result.poNumber} created`,
        };
      } catch (error) {
        console.error("[supplierRouter] Create PO failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create purchase order",
        });
      }
    }),

  // Get purchase orders
  getPurchaseOrders: protectedProcedure
    .input(z.object({ organizationId: z.string() }))
    .query(async ({ input }) => {
      try {
        const pos = await getOrganizationPurchaseOrders(input.organizationId);
        return {
          success: true,
          data: pos,
          count: pos.length,
        };
      } catch (error) {
        console.error("[supplierRouter] Get POs failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch purchase orders",
        });
      }
    }),

  // Auto-generate purchase order
  autoGeneratePO: protectedProcedure
    .input(
      z.object({
        organizationId: z.string(),
        inventoryItemId: z.string(),
        reorderQuantity: z.number().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await autoGeneratePurchaseOrder(
          input.organizationId,
          input.inventoryItemId,
          input.reorderQuantity,
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
          poId: result.poId,
          message: result.message,
        };
      } catch (error) {
        console.error("[supplierRouter] Auto-generate PO failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to auto-generate purchase order",
        });
      }
    }),

  // Update purchase order status
  updatePOStatus: protectedProcedure
    .input(
      z.object({
        poId: z.string(),
        status: z.enum(["draft", "sent", "confirmed", "shipped", "received", "canceled"]),
        actualDeliveryDate: z.date().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await updatePurchaseOrderStatus(
          input.poId,
          input.status,
          input.actualDeliveryDate
        );

        if (!result.success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update status",
          });
        }

        return {
          success: true,
          message: `Purchase order status updated to ${input.status}`,
        };
      } catch (error) {
        console.error("[supplierRouter] Update PO status failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update purchase order status",
        });
      }
    }),

  // Get pending purchase orders
  getPendingPOs: protectedProcedure
    .input(z.object({ organizationId: z.string() }))
    .query(async ({ input }) => {
      try {
        const pos = await getPendingPurchaseOrders(input.organizationId);
        return {
          success: true,
          data: pos,
          count: pos.length,
        };
      } catch (error) {
        console.error("[supplierRouter] Get pending POs failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch pending purchase orders",
        });
      }
    }),

  // Get overdue purchase orders
  getOverduePOs: protectedProcedure
    .input(z.object({ organizationId: z.string() }))
    .query(async ({ input }) => {
      try {
        const pos = await getOverduePurchaseOrders(input.organizationId);
        return {
          success: true,
          data: pos,
          count: pos.length,
          hasOverdue: pos.length > 0,
        };
      } catch (error) {
        console.error("[supplierRouter] Get overdue POs failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch overdue purchase orders",
        });
      }
    }),
});

