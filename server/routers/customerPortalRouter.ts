import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import {
  generateCustomerPortalAccess,
  verifyCustomerPortalAccess,
  createCustomerInvoice,
  getClientInvoices,
  updateInvoiceStatus,
  addCustomerDocument,
  getProjectCustomerDocuments,
  getCustomerPortalDashboard,
  getOverdueInvoices,
  sendInvoiceToCustomer,
} from "../db";
import { TRPCError } from "@trpc/server";

export const customerPortalRouter = router({
  // Generate portal access token
  generateAccess: protectedProcedure
    .input(
      z.object({
        organizationId: z.string(),
        clientId: z.string(),
        expiresInDays: z.number().min(1).max(3650).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await generateCustomerPortalAccess(
          input.organizationId,
          input.clientId,
          input.expiresInDays
        );

        if (!result.success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to generate portal access",
          });
        }

        return {
          success: true,
          accessToken: result.accessToken,
          message: "Portal access generated",
        };
      } catch (error) {
        console.error("[customerPortalRouter] Generate access failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate portal access",
        });
      }
    }),

  // Verify portal access (public endpoint)
  verifyAccess: publicProcedure
    .input(z.object({ accessToken: z.string() }))
    .query(async ({ input }) => {
      try {
        const access = await verifyCustomerPortalAccess(input.accessToken);

        if (!access) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid or expired access token",
          });
        }

        return {
          success: true,
          clientId: access.clientId,
          organizationId: access.organizationId,
        };
      } catch (error) {
        console.error("[customerPortalRouter] Verify access failed:", error);
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid or expired access token",
        });
      }
    }),

  // Create customer invoice
  createInvoice: protectedProcedure
    .input(
      z.object({
        organizationId: z.string(),
        clientId: z.string(),
        projectId: z.string(),
        amount: z.number().min(0),
        dueDate: z.date().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await createCustomerInvoice(
          input.organizationId,
          input.clientId,
          input.projectId,
          input.amount,
          input.dueDate,
          input.notes
        );

        if (!result.success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create invoice",
          });
        }

        return {
          success: true,
          invoiceId: result.invoiceId,
          invoiceNumber: result.invoiceNumber,
          message: `Invoice ${result.invoiceNumber} created`,
        };
      } catch (error) {
        console.error("[customerPortalRouter] Create invoice failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create customer invoice",
        });
      }
    }),

  // Get client invoices
  getInvoices: protectedProcedure
    .input(z.object({ clientId: z.string() }))
    .query(async ({ input }) => {
      try {
        const invoices = await getClientInvoices(input.clientId);
        return {
          success: true,
          data: invoices,
          count: invoices.length,
        };
      } catch (error) {
        console.error("[customerPortalRouter] Get invoices failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch invoices",
        });
      }
    }),

  // Update invoice status
  updateInvoiceStatus: protectedProcedure
    .input(
      z.object({
        invoiceId: z.string(),
        status: z.enum(["draft", "sent", "viewed", "overdue", "paid", "canceled"]),
        paidDate: z.date().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await updateInvoiceStatus(input.invoiceId, input.status, input.paidDate);

        if (!result.success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update invoice status",
          });
        }

        return {
          success: true,
          message: `Invoice status updated to ${input.status}`,
        };
      } catch (error) {
        console.error("[customerPortalRouter] Update invoice status failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update invoice status",
        });
      }
    }),

  // Add customer document
  addDocument: protectedProcedure
    .input(
      z.object({
        organizationId: z.string(),
        clientId: z.string(),
        projectId: z.string(),
        documentName: z.string(),
        documentType: z.string(),
        fileUrl: z.string(),
        fileSize: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await addCustomerDocument(
          input.organizationId,
          input.clientId,
          input.projectId,
          input.documentName,
          input.documentType,
          input.fileUrl,
          input.fileSize
        );

        if (!result.success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to add document",
          });
        }

        return {
          success: true,
          documentId: result.documentId,
          message: "Document added successfully",
        };
      } catch (error) {
        console.error("[customerPortalRouter] Add document failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to add customer document",
        });
      }
    }),

  // Get project documents
  getDocuments: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        clientId: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const documents = await getProjectCustomerDocuments(input.projectId, input.clientId);
        return {
          success: true,
          data: documents,
          count: documents.length,
        };
      } catch (error) {
        console.error("[customerPortalRouter] Get documents failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch documents",
        });
      }
    }),

  // Get portal dashboard
  getDashboard: protectedProcedure
    .input(z.object({ clientId: z.string() }))
    .query(async ({ input }) => {
      try {
        const result = await getCustomerPortalDashboard(input.clientId);

        if (!result.success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch dashboard",
          });
        }

        return {
          success: true,
          data: result.data,
        };
      } catch (error) {
        console.error("[customerPortalRouter] Get dashboard failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch portal dashboard",
        });
      }
    }),

  // Get overdue invoices
  getOverdueInvoices: protectedProcedure
    .input(z.object({ organizationId: z.string() }))
    .query(async ({ input }) => {
      try {
        const invoices = await getOverdueInvoices(input.organizationId);
        return {
          success: true,
          data: invoices,
          count: invoices.length,
          hasOverdue: invoices.length > 0,
        };
      } catch (error) {
        console.error("[customerPortalRouter] Get overdue invoices failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch overdue invoices",
        });
      }
    }),

  // Send invoice to customer
  sendInvoice: protectedProcedure
    .input(z.object({ invoiceId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const result = await sendInvoiceToCustomer(input.invoiceId);

        if (!result.success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to send invoice",
          });
        }

        return {
          success: true,
          message: "Invoice sent to customer",
        };
      } catch (error) {
        console.error("[customerPortalRouter] Send invoice failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send invoice to customer",
        });
      }
    }),
});

