import { notifyOwner } from "./_core/notification";

interface EmailOptions {
  to: string;
  subject: string;
  body: string;
  html?: string;
  attachmentUrl?: string;
}

interface SendGridEmailParams {
  personalizations: Array<{
    to: Array<{ email: string; name?: string }>;
    subject: string;
  }>;
  from: { email: string; name?: string };
  content: Array<{ type: string; value: string }>;
}

/**
 * Check if SendGrid is configured
 */
function isSendGridConfigured(): boolean {
  return Boolean(
    process.env.SENDGRID_API_KEY && 
    process.env.SENDGRID_FROM_EMAIL
  );
}

/**
 * Send email via SendGrid API
 */
async function sendViaSendGrid(options: EmailOptions): Promise<boolean> {
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL;
  const fromName = process.env.SENDGRID_FROM_NAME || 'Venturr Platform';

  if (!apiKey || !fromEmail) {
    console.error('SendGrid configuration missing');
    return false;
  }

  const emailPayload: SendGridEmailParams = {
    personalizations: [
      {
        to: [{ email: options.to }],
        subject: options.subject,
      },
    ],
    from: { email: fromEmail, name: fromName },
    content: [
      {
        type: options.html ? 'text/html' : 'text/plain',
        value: options.html || options.body,
      },
    ],
  };

  // Add plain text version if HTML is provided
  if (options.html) {
    emailPayload.content.unshift({
      type: 'text/plain',
      value: options.body,
    });
  }

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    if (response.ok || response.status === 202) {
      console.log(`Email sent successfully to ${options.to}`);
      return true;
    } else {
      const errorText = await response.text();
      console.error(`SendGrid API error (${response.status}): ${errorText}`);
      return false;
    }
  } catch (error) {
    console.error('SendGrid request failed:', error);
    return false;
  }
}

/**
 * Send email using SendGrid (production) or notification fallback (development)
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const { to, subject, body, attachmentUrl } = options;

  // Use SendGrid if configured
  if (isSendGridConfigured()) {
    const success = await sendViaSendGrid(options);
    if (success) {
      return true;
    }
    // Fall through to notification fallback on failure
    console.warn('SendGrid delivery failed, falling back to notification');
  }

  // Fallback: notify owner (development/testing)
  const content = `
Email to: ${to}
Subject: ${subject}

${body}

${attachmentUrl ? `Attachment: ${attachmentUrl}` : ''}
  `.trim();

  const success = await notifyOwner({
    title: `Email: ${subject}`,
    content,
  });

  return success;
}

/**
 * Generate HTML email template
 */
function generateHtmlEmail(bodyText: string, title: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Venturr Platform</h1>
  </div>
  <div class="content">
    ${bodyText.split('\n\n').map(p => `<p>${escapeHtml(p)}</p>`).join('')}
  </div>
  <div class="footer">
    <p>This is an automated message from Venturr Platform.</p>
    <p>&copy; ${new Date().getFullYear()} Venturr. All rights reserved.</p>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, char => htmlEntities[char] || char);
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
    html: generateHtmlEmail(body, subject),
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
    html: generateHtmlEmail(body, subject),
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
    html: generateHtmlEmail(body, subject),
  });
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(
  userEmail: string,
  userName: string,
  verificationLink: string
): Promise<boolean> {
  const subject = "Verify your Venturr account";
  
  const body = `Dear ${userName},

Thank you for signing up for Venturr Platform!

Please verify your email address by clicking the link below:

${verificationLink}

This link will expire in 24 hours.

If you did not create an account, please ignore this email.

Best regards,
The Venturr Team
  `.trim();

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subject)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Venturr Platform</h1>
  </div>
  <div class="content">
    <p>Dear ${escapeHtml(userName)},</p>
    <p>Thank you for signing up for Venturr Platform!</p>
    <p>Please verify your email address by clicking the button below:</p>
    <p style="text-align: center;">
      <a href="${escapeHtml(verificationLink)}" class="button">Verify Email Address</a>
    </p>
    <p>Or copy this link: <a href="${escapeHtml(verificationLink)}">${escapeHtml(verificationLink)}</a></p>
    <p>This link will expire in 24 hours.</p>
    <p>If you did not create an account, please ignore this email.</p>
  </div>
  <div class="footer">
    <p>This is an automated message from Venturr Platform.</p>
    <p>&copy; ${new Date().getFullYear()} Venturr. All rights reserved.</p>
  </div>
</body>
</html>
  `.trim();

  return await sendEmail({
    to: userEmail,
    subject,
    body,
    html,
  });
}

