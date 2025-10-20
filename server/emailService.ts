import { notifyOwner } from "./_core/notification";

interface EmailOptions {
  to: string;
  subject: string;
  body: string;
  attachmentUrl?: string;
}

/**
 * Send email using the built-in notification system
 * For now, this notifies the owner. In production, this would integrate with
 * an email service provider like SendGrid, AWS SES, or Resend
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const { to, subject, body, attachmentUrl } = options;

  // Format the notification content
  const content = `
Email to: ${to}
Subject: ${subject}

${body}

${attachmentUrl ? `Attachment: ${attachmentUrl}` : ''}
  `.trim();

  // Send notification to owner
  const success = await notifyOwner({
    title: `Email: ${subject}`,
    content,
  });

  return success;
}

/**
 * Send quote email to client
 */
export async function sendQuoteEmail(
  clientEmail: string,
  clientName: string,
  projectTitle: string,
  quoteNumber: string,
  total: string,
  pdfUrl?: string
): Promise<boolean> {
  const subject = `Quote ${quoteNumber} - ${projectTitle}`;
  
  const body = `Dear ${clientName},

Thank you for your interest in ThomCo Roofing services.

Please find attached your quotation for the ${projectTitle} project.

Quote Number: ${quoteNumber}
Total Amount: $${total} (inc. GST)

This quotation is valid for 30 days from the date of issue.

If you have any questions or would like to proceed with this quote, please don't hesitate to contact us.

Best regards,
ThomCo Roofing Team

---
This is an automated message. Please do not reply directly to this email.
  `.trim();

  return await sendEmail({
    to: clientEmail,
    subject,
    body,
    attachmentUrl: pdfUrl,
  });
}

/**
 * Send project status update email
 */
export async function sendProjectUpdateEmail(
  clientEmail: string,
  clientName: string,
  projectTitle: string,
  status: string,
  message: string
): Promise<boolean> {
  const subject = `Project Update: ${projectTitle}`;
  
  const body = `Dear ${clientName},

We wanted to update you on the status of your project: ${projectTitle}

Current Status: ${status}

${message}

If you have any questions, please feel free to contact us.

Best regards,
ThomCo Roofing Team
  `.trim();

  return await sendEmail({
    to: clientEmail,
    subject,
    body,
  });
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(
  userEmail: string,
  userName: string
): Promise<boolean> {
  const subject = "Welcome to Venturr Platform";
  
  const body = `Dear ${userName},

Welcome to the Venturr Platform!

We're excited to have you on board. Our AI-powered operating system for trade businesses will help you streamline quoting, compliance, scheduling, and material ordering.

Here's what you can do to get started:

1. Create your first project
2. Use the Site Measurement tool to capture accurate dimensions
3. Generate quotes with our Roofing Takeoff Calculator
4. Send professional quotes to your clients

If you need any assistance, our support team is here to help.

Best regards,
The Venturr Team
  `.trim();

  return await sendEmail({
    to: userEmail,
    subject,
    body,
  });
}

