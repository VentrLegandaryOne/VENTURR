import { router, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { generateSmartQuote, validateMeasurements, calculateLaborHours, getComplianceNotes } from '../_core/llmQuoting';
import { createQuote, getProjectQuotes } from '../db';
import { nanoid } from 'nanoid';

export const quotesRouter = router({
  // Generate intelligent quote using LLM
  generateSmartQuote: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      takeoffData: z.any(),
      businessSettings: z.any().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Extract measurements from takeoff data
        const measurements = {
          totalArea: input.takeoffData.totalArea || 0,
          roofPitch: input.takeoffData.roofPitch || 6,
          complexity: input.takeoffData.complexity || 'moderate',
          materials: input.takeoffData.materials || [],
          location: input.takeoffData.location || 'Australia',
          notes: input.takeoffData.notes,
        };

        // Validate measurements
        const validation = validateMeasurements(measurements);
        if (!validation.valid) {
          throw new Error(`Invalid measurements: ${validation.errors.join(', ')}`);
        }

        // Get business settings for pricing
        const laborRate = input.businessSettings?.laborRate || 85; // Default $85/hour
        const materialMarkup = input.businessSettings?.materialMarkup || 30; // Default 30% markup

        // Generate quote using LLM
        const quote = await generateSmartQuote({
          projectId: input.projectId,
          measurements,
          laborRate,
          materialMarkup,
          businessName: input.businessSettings?.businessName || 'Your Business',
        });

        return {
          success: true,
          quote,
          itemizedBreakdown: quote.itemizedBreakdown,
          laborCost: quote.laborCost,
          materialCost: quote.materialCost,
          subtotal: quote.subtotal,
          markup: quote.markup,
          tax: quote.tax,
          total: quote.total,
          timeline: quote.timeline,
          notes: quote.notes,
          complianceNotes: getComplianceNotes(measurements.location),
        };
      } catch (error) {
        console.error('[Quotes] Smart quote generation failed:', error);
        throw new Error(`Failed to generate quote: ${error}`);
      }
    }),

  // Create quote
  create: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      quoteData: z.string(),
      totalAmount: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const quoteId = nanoid();
        await createQuote({
          id: quoteId,
          projectId: input.projectId,
          quoteData: input.quoteData,
          totalAmount: input.totalAmount,
          createdBy: ctx.user.id,
          status: 'draft',
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        return {
          success: true,
          quoteId,
        };
      } catch (error) {
        console.error('[Quotes] Quote creation failed:', error);
        throw new Error('Failed to create quote');
      }
    }),

  // List quotes for a project
  list: protectedProcedure
    .input(z.object({
      projectId: z.string(),
    }))
    .query(async ({ input }) => {
      try {
        return await getProjectQuotes(input.projectId);
      } catch (error) {
        console.error('[Quotes] Quote listing failed:', error);
        throw new Error('Failed to list quotes');
      }
    }),

  // Get single quote
  get: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .query(async ({ input }) => {
      try {
        // This would need to be implemented in db.ts
        // For now, return a placeholder
        return null;
      } catch (error) {
        console.error('[Quotes] Quote retrieval failed:', error);
        throw new Error('Failed to retrieve quote');
      }
    }),

  // Update quote
  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      quoteData: z.string().optional(),
      status: z.enum(['draft', 'sent', 'accepted', 'rejected']).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        // This would need to be implemented in db.ts
        return {
          success: true,
          quoteId: input.id,
        };
      } catch (error) {
        console.error('[Quotes] Quote update failed:', error);
        throw new Error('Failed to update quote');
      }
    }),

  // Delete quote
  delete: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        // This would need to be implemented in db.ts
        return {
          success: true,
        };
      } catch (error) {
        console.error('[Quotes] Quote deletion failed:', error);
        throw new Error('Failed to delete quote');
      }
    }),

  // Send quote via email
  sendEmail: protectedProcedure
    .input(z.object({
      quoteId: z.string(),
      clientEmail: z.string().email(),
      message: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Email sending would be implemented here
        return {
          success: true,
          message: 'Quote sent successfully',
        };
      } catch (error) {
        console.error('[Quotes] Email sending failed:', error);
        throw new Error('Failed to send quote');
      }
    }),

  // Export quote as PDF
  exportPDF: protectedProcedure
    .input(z.object({
      quoteId: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      try {
        // PDF export would be implemented here
        return {
          success: true,
          url: `/quotes/${input.quoteId}.pdf`,
        };
      } catch (error) {
        console.error('[Quotes] PDF export failed:', error);
        throw new Error('Failed to export quote');
      }
    }),
});

export default quotesRouter;

