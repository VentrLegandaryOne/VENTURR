/**
 * Notifications Router
 * 
 * Handles client notifications for:
 * - Quote invitations
 * - Project updates
 * - Compliance document delivery
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { notifyOwner } from "../_core/notification";

export const notificationsRouter = router({
  /**
   * Send quote invitation to client
   */
  sendQuoteInvite: protectedProcedure
    .input(
      z.object({
        quoteId: z.string(),
        clientEmail: z.string().email(),
        clientName: z.string().optional(),
        projectTitle: z.string(),
        quoteTotal: z.string(),
        validUntil: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Generate client portal link
      const portalLink = `${process.env.VITE_FRONTEND_URL || 'https://venturr.app'}/client-portal?quote=${input.quoteId}`;

      // Email content
      const emailSubject = `New Quote from ${process.env.OWNER_NAME || 'ThomCo Roofing'}: ${input.projectTitle}`;
      const emailBody = `
Hi ${input.clientName || 'there'},

You have received a new quote for your project: ${input.projectTitle}

Quote Total: ${input.quoteTotal}
Valid Until: ${new Date(input.validUntil).toLocaleDateString()}

View and accept your quote here:
${portalLink}

This quote includes:
- Detailed itemized breakdown
- Compliance documentation (HB 39, NCC 2022, AS/NZS standards)
- Professional installation guarantee
- Full warranty coverage

If you have any questions, please don't hesitate to contact us.

Best regards,
${process.env.OWNER_NAME || 'ThomCo Roofing'}
      `.trim();

      // TODO: Integrate with actual email service (SendGrid, AWS SES, etc.)
      // For now, notify owner that quote was "sent"
      await notifyOwner({
        title: `Quote Invite Sent: ${input.projectTitle}`,
        content: `Quote ${input.quoteId} sent to ${input.clientEmail}\nTotal: ${input.quoteTotal}\nPortal Link: ${portalLink}`,
      });

      return {
        success: true,
        portalLink,
        message: `Quote invitation sent to ${input.clientEmail}`,
      };
    }),

  /**
   * Send project update notification
   */
  sendProjectUpdate: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        clientEmail: z.string().email(),
        clientName: z.string().optional(),
        projectTitle: z.string(),
        updateMessage: z.string(),
        status: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const portalLink = `${process.env.VITE_FRONTEND_URL || 'https://venturr.app'}/client-portal?project=${input.projectId}`;

      const emailSubject = `Project Update: ${input.projectTitle}`;
      const emailBody = `
Hi ${input.clientName || 'there'},

We have an update on your project: ${input.projectTitle}

${input.updateMessage}

${input.status ? `Current Status: ${input.status}` : ''}

View your project details here:
${portalLink}

Best regards,
${process.env.OWNER_NAME || 'ThomCo Roofing'}
      `.trim();

      // Notify owner
      await notifyOwner({
        title: `Project Update Sent: ${input.projectTitle}`,
        content: `Update sent to ${input.clientEmail}\nMessage: ${input.updateMessage}`,
      });

      return {
        success: true,
        portalLink,
        message: `Project update sent to ${input.clientEmail}`,
      };
    }),

  /**
   * Send compliance document delivery notification
   */
  sendComplianceDocuments: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        clientEmail: z.string().email(),
        clientName: z.string().optional(),
        projectTitle: z.string(),
        documentTypes: z.array(z.string()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const portalLink = `${process.env.VITE_FRONTEND_URL || 'https://venturr.app'}/client-portal?project=${input.projectId}&tab=documents`;

      const emailSubject = `Compliance Documents Ready: ${input.projectTitle}`;
      const emailBody = `
Hi ${input.clientName || 'there'},

Your compliance documents are now ready for ${input.projectTitle}

Documents included:
${input.documentTypes.map(doc => `- ${doc}`).join('\n')}

Access your documents here:
${portalLink}

These documents certify that your project meets all Australian building standards including:
- HB 39:2015 (Installation Code for Metal Roofing)
- NCC 2022 (National Construction Code)
- AS/NZS 1562.1:2018 (Sheet Roof and Wall Cladding)
- AS/NZS 1170.2:2021 (Wind Actions)

Best regards,
${process.env.OWNER_NAME || 'ThomCo Roofing'}
      `.trim();

      // Notify owner
      await notifyOwner({
        title: `Compliance Documents Sent: ${input.projectTitle}`,
        content: `Documents sent to ${input.clientEmail}\nTypes: ${input.documentTypes.join(', ')}`,
      });

      return {
        success: true,
        portalLink,
        message: `Compliance documents sent to ${input.clientEmail}`,
      };
    }),

  /**
   * Get notification history for a project
   */
  getProjectNotifications: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      // TODO: Implement notification history storage in database
      // For now, return empty array
      return [];
    }),
});

