import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  createInvoice,
  getInvoice,
  getOrganizationInvoices,
  updateInvoice,
  createExpense,
  getOrganizationExpenses,
  createFinancialReport,
  getFinancialReports,
  createIntelligentInsight,
  getActiveInsights,
  resolveInsight,
  getProject,
  getProjectTakeoffs,
  getProjectQuotes,
} from "../db";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";

export const financialRouter = router({
  // INVOICES
  invoices: router({
    list: protectedProcedure
      .input(z.object({ organizationId: z.string().min(1) }))
      .query(async ({ input }) => {
        try {
          const invoices = await getOrganizationInvoices(input.organizationId);
          return { success: true, data: invoices };
        } catch (error) {
          console.error("Error fetching invoices:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch invoices",
          });
        }
      }),

    get: protectedProcedure
      .input(z.object({ invoiceId: z.string().min(1) }))
      .query(async ({ input }) => {
        try {
          const invoice = await getInvoice(input.invoiceId);
          if (!invoice) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Invoice not found",
            });
          }
          return { success: true, data: invoice };
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          console.error("Error fetching invoice:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch invoice",
          });
        }
      }),

    create: protectedProcedure
      .input(
        z.object({
          organizationId: z.string().min(1),
          projectId: z.string().optional(),
          clientId: z.string().min(1),
          subtotal: z.string().min(1),
          tax: z.string().default("0"),
          total: z.string().min(1),
          dueDate: z.date(),
          currency: z.string().default("AUD"),
          items: z.string().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const invoiceNumber = `INV-${Date.now()}`;
          
          const invoice = await createInvoice({
            id: `inv_${nanoid()}`,
            organizationId: input.organizationId,
            projectId: input.projectId,
            clientId: input.clientId,
            invoiceNumber,
            subtotal: input.subtotal,
            tax: input.tax,
            total: input.total,
            amountPaid: "0",
            dueDate: input.dueDate,
            currency: input.currency,
            status: "draft",
            items: input.items,
            notes: input.notes,
            createdBy: ctx.user.id,
            createdAt: new Date(),
            updatedAt: new Date(),
            paidDate: null,
          });

          return { success: true, data: invoice };
        } catch (error) {
          console.error("Error creating invoice:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create invoice",
          });
        }
      }),

    update: protectedProcedure
      .input(
        z.object({
          invoiceId: z.string().min(1),
          status: z.enum(["draft", "sent", "viewed", "paid", "overdue", "canceled"]).optional(),
          amountPaid: z.string().optional(),
          paidDate: z.date().optional(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const { invoiceId, ...updates } = input;
          await updateInvoice(invoiceId, {
            ...updates,
            updatedAt: new Date(),
          });
          const updated = await getInvoice(invoiceId);
          return { success: true, data: updated };
        } catch (error) {
          console.error("Error updating invoice:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update invoice",
          });
        }
      }),

    // Auto-generate from project
    generateFromProject: protectedProcedure
      .input(
        z.object({
          organizationId: z.string().min(1),
          projectId: z.string().min(1),
          clientId: z.string().min(1),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const project = await getProject(input.projectId);
          if (!project) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Project not found",
            });
          }

          const quotes = await getProjectQuotes(input.projectId);
          const lastQuote = quotes[quotes.length - 1];
          
          if (!lastQuote) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "No quote found for project",
            });
          }

          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + 30);

          const invoice = await createInvoice({
            id: `inv_${nanoid()}`,
            organizationId: input.organizationId,
            projectId: input.projectId,
            clientId: input.clientId,
            invoiceNumber: `INV-${Date.now()}`,
            subtotal: lastQuote.subtotal,
            tax: lastQuote.gst,
            total: lastQuote.total,
            amountPaid: "0",
            dueDate,
            currency: "AUD",
            status: "draft",
            items: lastQuote.items,
            notes: `Invoice for project: ${project.title}`,
            createdBy: ctx.user.id,
            createdAt: new Date(),
            updatedAt: new Date(),
            paidDate: null,
          });

          return { success: true, data: invoice, message: "Invoice auto-generated from project quote" };
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          console.error("Error generating invoice from project:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to generate invoice",
          });
        }
      }),
  }),

  // EXPENSES
  expenses: router({
    list: protectedProcedure
      .input(z.object({ organizationId: z.string().min(1) }))
      .query(async ({ input }) => {
        try {
          const expenses = await getOrganizationExpenses(input.organizationId);
          return { success: true, data: expenses };
        } catch (error) {
          console.error("Error fetching expenses:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch expenses",
          });
        }
      }),

    create: protectedProcedure
      .input(
        z.object({
          organizationId: z.string().min(1),
          projectId: z.string().optional(),
          category: z.enum(["materials", "labor", "equipment", "travel", "other"]),
          description: z.string().min(1),
          amount: z.string().min(1),
          currency: z.string().default("AUD"),
          date: z.date(),
          receipt: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const expense = await createExpense({
            id: `exp_${nanoid()}`,
            organizationId: input.organizationId,
            projectId: input.projectId,
            category: input.category,
            description: input.description,
            amount: input.amount,
            currency: input.currency,
            date: input.date,
            receipt: input.receipt,
            status: "pending",
            createdBy: ctx.user.id,
            createdAt: new Date(),
          });

          return { success: true, data: expense };
        } catch (error) {
          console.error("Error creating expense:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create expense",
          });
        }
      }),
  }),

  // FINANCIAL REPORTS
  reports: router({
    list: protectedProcedure
      .input(z.object({ organizationId: z.string().min(1) }))
      .query(async ({ input }) => {
        try {
          const reports = await getFinancialReports(input.organizationId);
          return { success: true, data: reports };
        } catch (error) {
          console.error("Error fetching reports:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch reports",
          });
        }
      }),

    generateMonthly: protectedProcedure
      .input(z.object({ organizationId: z.string().min(1), month: z.number(), year: z.number() }))
      .mutation(async ({ input }) => {
        try {
          const invoices = await getOrganizationInvoices(input.organizationId);
          const expenses = await getOrganizationExpenses(input.organizationId);

          const monthInvoices = invoices.filter((inv) => {
            const invDate = new Date(inv.createdAt);
            return invDate.getMonth() === input.month - 1 && invDate.getFullYear() === input.year;
          });

          const monthExpenses = expenses.filter((exp) => {
            const expDate = new Date(exp.date);
            return expDate.getMonth() === input.month - 1 && expDate.getFullYear() === input.year;
          });

          const totalRevenue = monthInvoices.reduce((sum, inv) => sum + parseInt(inv.total || "0"), 0);
          const totalExpenses = monthExpenses.reduce((sum, exp) => sum + parseInt(exp.amount || "0"), 0);
          const netProfit = totalRevenue - totalExpenses;
          const taxAmount = netProfit * 0.1; // 10% GST

          const report = await createFinancialReport({
            id: `report_${nanoid()}`,
            organizationId: input.organizationId,
            reportType: "profit_loss",
            period: `${input.month}/${input.year}`,
            totalRevenue: totalRevenue.toString(),
            totalExpenses: totalExpenses.toString(),
            netProfit: netProfit.toString(),
            taxAmount: taxAmount.toString(),
            data: JSON.stringify({
              invoiceCount: monthInvoices.length,
              expenseCount: monthExpenses.length,
              avgInvoiceValue: monthInvoices.length > 0 ? (totalRevenue / monthInvoices.length).toFixed(2) : 0,
            }),
            generatedAt: new Date(),
          });

          return { success: true, data: report };
        } catch (error) {
          console.error("Error generating report:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to generate report",
          });
        }
      }),
  }),

  // INTELLIGENT INSIGHTS
  insights: router({
    list: protectedProcedure
      .input(z.object({ organizationId: z.string().min(1) }))
      .query(async ({ input }) => {
        try {
          const insights = await getActiveInsights(input.organizationId);
          return { success: true, data: insights };
        } catch (error) {
          console.error("Error fetching insights:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch insights",
          });
        }
      }),

    resolve: protectedProcedure
      .input(z.object({ insightId: z.string().min(1) }))
      .mutation(async ({ input }) => {
        try {
          await resolveInsight(input.insightId);
          return { success: true };
        } catch (error) {
          console.error("Error resolving insight:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to resolve insight",
          });
        }
      }),
  }),

  // DASHBOARD STATS
  stats: protectedProcedure
    .input(z.object({ organizationId: z.string().min(1) }))
    .query(async ({ input }) => {
      try {
        const invoices = await getOrganizationInvoices(input.organizationId);
        const expenses = await getOrganizationExpenses(input.organizationId);

        const totalRevenue = invoices.reduce((sum, inv) => sum + parseInt(inv.total || "0"), 0);
        const totalExpenses = expenses.reduce((sum, exp) => sum + parseInt(exp.amount || "0"), 0);
        const netProfit = totalRevenue - totalExpenses;
        const paidInvoices = invoices.filter((inv) => inv.status === "paid");
        const unpaidAmount = invoices.reduce((sum, inv) => {
          if (inv.status !== "paid") {
            return sum + (parseInt(inv.total || "0") - parseInt(inv.amountPaid || "0"));
          }
          return sum;
        }, 0);

        return {
          success: true,
          data: {
            totalRevenue: totalRevenue.toString(),
            totalExpenses: totalExpenses.toString(),
            netProfit: netProfit.toString(),
            profitMargin: totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(2) : "0",
            invoiceCount: invoices.length,
            paidInvoices: paidInvoices.length,
            unpaidAmount: unpaidAmount.toString(),
            avgInvoiceValue: invoices.length > 0 ? (totalRevenue / invoices.length).toFixed(2) : "0",
          },
        };
      } catch (error) {
        console.error("Error fetching financial stats:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch financial stats",
        });
      }
    }),
});

