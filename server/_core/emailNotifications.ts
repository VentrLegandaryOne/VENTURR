/**
 * Email Notification System
 * Email templates, project updates, notifications, scheduled delivery
 */

export type EmailType =
  | 'project_update'
  | 'quote_notification'
  | 'payment_reminder'
  | 'team_alert'
  | 'project_completed'
  | 'quote_accepted'
  | 'payment_received';

export interface EmailTemplate {
  id: string;
  type: EmailType;
  subject: string;
  htmlTemplate: string;
  textTemplate: string;
  variables: string[];
}

export interface EmailNotification {
  id: string;
  recipientEmail: string;
  recipientName: string;
  type: EmailType;
  subject: string;
  htmlContent: string;
  status: 'pending' | 'sent' | 'failed' | 'bounced';
  sentAt?: Date;
  failureReason?: string;
  createdAt: Date;
  scheduledFor?: Date;
  unsubscribeToken?: string;
}

export interface EmailSubscription {
  email: string;
  subscriptions: {
    projectUpdates: boolean;
    quoteNotifications: boolean;
    paymentReminders: boolean;
    teamAlerts: boolean;
  };
  unsubscribedAt?: Date;
}

class EmailNotificationManager {
  private templates: Map<string, EmailTemplate> = new Map();
  private notifications: Map<string, EmailNotification> = new Map();
  private subscriptions: Map<string, EmailSubscription> = new Map();
  private sentCount = 0;
  private failedCount = 0;

  constructor() {
    this.initializeTemplates();
  }

  /**
   * Initialize email templates
   */
  private initializeTemplates(): void {
    // Project Update Template
    this.templates.set('project_update', {
      id: 'project_update',
      type: 'project_update',
      subject: 'Project Update: {{projectName}}',
      htmlTemplate: `
        <h2>Project Update</h2>
        <p>Hello {{clientName}},</p>
        <p>Your project <strong>{{projectName}}</strong> has been updated.</p>
        <p><strong>Status:</strong> {{projectStatus}}</p>
        <p><strong>Progress:</strong> {{projectProgress}}%</p>
        <p><strong>Update:</strong> {{updateMessage}}</p>
        <p><a href="{{projectLink}}">View Project Details</a></p>
        <hr>
        <p>Best regards,<br>Venturr Team</p>
      `,
      textTemplate: `
Project Update

Hello {{clientName}},

Your project {{projectName}} has been updated.

Status: {{projectStatus}}
Progress: {{projectProgress}}%
Update: {{updateMessage}}

View Project: {{projectLink}}

Best regards,
Venturr Team
      `,
      variables: ['clientName', 'projectName', 'projectStatus', 'projectProgress', 'updateMessage', 'projectLink'],
    });

    // Quote Notification Template
    this.templates.set('quote_notification', {
      id: 'quote_notification',
      type: 'quote_notification',
      subject: 'Your Quote is Ready: {{projectName}}',
      htmlTemplate: `
        <h2>Quote Ready for Review</h2>
        <p>Hello {{clientName}},</p>
        <p>Your quote for <strong>{{projectName}}</strong> is ready for review.</p>
        <p><strong>Quote Number:</strong> {{quoteNumber}}</p>
        <p><strong>Amount:</strong> ${{quoteAmount}}</p>
        <p><strong>Valid Until:</strong> {{validUntil}}</p>
        <p><a href="{{quoteLink}}">View Quote</a></p>
        <p>If you have any questions, please don't hesitate to contact us.</p>
        <hr>
        <p>Best regards,<br>Venturr Team</p>
      `,
      textTemplate: `
Quote Ready for Review

Hello {{clientName}},

Your quote for {{projectName}} is ready for review.

Quote Number: {{quoteNumber}}
Amount: ${{quoteAmount}}
Valid Until: {{validUntil}}

View Quote: {{quoteLink}}

If you have any questions, please contact us.

Best regards,
Venturr Team
      `,
      variables: ['clientName', 'projectName', 'quoteNumber', 'quoteAmount', 'validUntil', 'quoteLink'],
    });

    // Payment Reminder Template
    this.templates.set('payment_reminder', {
      id: 'payment_reminder',
      type: 'payment_reminder',
      subject: 'Payment Reminder: {{projectName}}',
      htmlTemplate: `
        <h2>Payment Reminder</h2>
        <p>Hello {{clientName}},</p>
        <p>This is a friendly reminder that payment is due for <strong>{{projectName}}</strong>.</p>
        <p><strong>Amount Due:</strong> ${{paymentAmount}}</p>
        <p><strong>Due Date:</strong> {{dueDate}}</p>
        <p><strong>Days Remaining:</strong> {{daysRemaining}}</p>
        <p><a href="{{paymentLink}}">Make Payment</a></p>
        <hr>
        <p>Best regards,<br>Venturr Team</p>
      `,
      textTemplate: `
Payment Reminder

Hello {{clientName}},

This is a friendly reminder that payment is due for {{projectName}}.

Amount Due: ${{paymentAmount}}
Due Date: {{dueDate}}
Days Remaining: {{daysRemaining}}

Make Payment: {{paymentLink}}

Best regards,
Venturr Team
      `,
      variables: ['clientName', 'projectName', 'paymentAmount', 'dueDate', 'daysRemaining', 'paymentLink'],
    });

    // Team Alert Template
    this.templates.set('team_alert', {
      id: 'team_alert',
      type: 'team_alert',
      subject: 'Team Alert: {{alertTitle}}',
      htmlTemplate: `
        <h2>Team Alert</h2>
        <p>Hello {{teamMemberName}},</p>
        <p><strong>{{alertTitle}}</strong></p>
        <p>{{alertMessage}}</p>
        <p><strong>Priority:</strong> {{priority}}</p>
        <p><a href="{{actionLink}}">Take Action</a></p>
        <hr>
        <p>Best regards,<br>Venturr Team</p>
      `,
      textTemplate: `
Team Alert

Hello {{teamMemberName}},

{{alertTitle}}

{{alertMessage}}

Priority: {{priority}}

Take Action: {{actionLink}}

Best regards,
Venturr Team
      `,
      variables: ['teamMemberName', 'alertTitle', 'alertMessage', 'priority', 'actionLink'],
    });

    // Project Completed Template
    this.templates.set('project_completed', {
      id: 'project_completed',
      type: 'project_completed',
      subject: 'Project Completed: {{projectName}}',
      htmlTemplate: `
        <h2>Project Completed</h2>
        <p>Hello {{clientName}},</p>
        <p>We're pleased to inform you that your project <strong>{{projectName}}</strong> has been completed!</p>
        <p><strong>Completion Date:</strong> {{completionDate}}</p>
        <p><a href="{{projectLink}}">View Final Details</a></p>
        <p>Thank you for choosing Venturr. We look forward to working with you again!</p>
        <hr>
        <p>Best regards,<br>Venturr Team</p>
      `,
      textTemplate: `
Project Completed

Hello {{clientName}},

We're pleased to inform you that your project {{projectName}} has been completed!

Completion Date: {{completionDate}}

View Final Details: {{projectLink}}

Thank you for choosing Venturr!

Best regards,
Venturr Team
      `,
      variables: ['clientName', 'projectName', 'completionDate', 'projectLink'],
    });
  }

  /**
   * Send email notification
   */
  public async sendEmail(
    recipientEmail: string,
    recipientName: string,
    type: EmailType,
    variables: Record<string, string>
  ): Promise<EmailNotification | null> {
    // Check subscription
    const subscription = this.subscriptions.get(recipientEmail);
    if (subscription && subscription.unsubscribedAt) {
      console.log(`[Email] Recipient unsubscribed: ${recipientEmail}`);
      return null;
    }

    const template = this.templates.get(type);
    if (!template) {
      console.error(`[Email] Template not found: ${type}`);
      return null;
    }

    // Replace variables in template
    let subject = template.subject;
    let htmlContent = template.htmlTemplate;

    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      subject = subject.replace(placeholder, value);
      htmlContent = htmlContent.replace(placeholder, value);
    }

    const notification: EmailNotification = {
      id: `email-${Date.now()}`,
      recipientEmail,
      recipientName,
      type,
      subject,
      htmlContent,
      status: 'pending',
      createdAt: new Date(),
      unsubscribeToken: this.generateUnsubscribeToken(),
    };

    this.notifications.set(notification.id, notification);

    // Simulate sending email
    this.simulateSendEmail(notification);

    console.log(`[Email] Notification queued: ${notification.id}`);
    return notification;
  }

  /**
   * Schedule email for later delivery
   */
  public scheduleEmail(
    recipientEmail: string,
    recipientName: string,
    type: EmailType,
    variables: Record<string, string>,
    scheduledFor: Date
  ): EmailNotification | null {
    const template = this.templates.get(type);
    if (!template) return null;

    let subject = template.subject;
    let htmlContent = template.htmlTemplate;

    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      subject = subject.replace(placeholder, value);
      htmlContent = htmlContent.replace(placeholder, value);
    }

    const notification: EmailNotification = {
      id: `email-${Date.now()}`,
      recipientEmail,
      recipientName,
      type,
      subject,
      htmlContent,
      status: 'pending',
      createdAt: new Date(),
      scheduledFor,
      unsubscribeToken: this.generateUnsubscribeToken(),
    };

    this.notifications.set(notification.id, notification);

    console.log(`[Email] Notification scheduled: ${notification.id} for ${scheduledFor.toISOString()}`);
    return notification;
  }

  /**
   * Subscribe/unsubscribe from notifications
   */
  public updateSubscription(
    email: string,
    subscriptions: Partial<EmailSubscription['subscriptions']>
  ): void {
    let subscription = this.subscriptions.get(email);

    if (!subscription) {
      subscription = {
        email,
        subscriptions: {
          projectUpdates: true,
          quoteNotifications: true,
          paymentReminders: true,
          teamAlerts: true,
        },
      };
    }

    subscription.subscriptions = { ...subscription.subscriptions, ...subscriptions };
    this.subscriptions.set(email, subscription);

    console.log(`[Email] Subscription updated: ${email}`);
  }

  /**
   * Unsubscribe from all emails
   */
  public unsubscribe(email: string): void {
    let subscription = this.subscriptions.get(email);

    if (!subscription) {
      subscription = {
        email,
        subscriptions: {
          projectUpdates: false,
          quoteNotifications: false,
          paymentReminders: false,
          teamAlerts: false,
        },
      };
    }

    subscription.unsubscribedAt = new Date();
    this.subscriptions.set(email, subscription);

    console.log(`[Email] Unsubscribed: ${email}`);
  }

  /**
   * Get email notification status
   */
  public getNotificationStatus(notificationId: string): EmailNotification | undefined {
    return this.notifications.get(notificationId);
  }

  /**
   * Get notifications for recipient
   */
  public getNotificationsByRecipient(recipientEmail: string): EmailNotification[] {
    return Array.from(this.notifications.values()).filter((n) => n.recipientEmail === recipientEmail);
  }

  /**
   * Simulate sending email
   */
  private simulateSendEmail(notification: EmailNotification): void {
    // In production, use SendGrid, AWS SES, or similar
    setTimeout(() => {
      const success = Math.random() > 0.05; // 95% success rate

      if (success) {
        notification.status = 'sent';
        notification.sentAt = new Date();
        this.sentCount++;
        console.log(`[Email] Sent: ${notification.id} to ${notification.recipientEmail}`);
      } else {
        notification.status = 'failed';
        notification.failureReason = 'SMTP connection failed';
        this.failedCount++;
        console.log(`[Email] Failed: ${notification.id}`);
      }
    }, 1000);
  }

  /**
   * Generate unsubscribe token
   */
  private generateUnsubscribeToken(): string {
    return `unsub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get email statistics
   */
  public getEmailStatistics() {
    const totalNotifications = this.notifications.size;
    const sentNotifications = Array.from(this.notifications.values()).filter((n) => n.status === 'sent').length;
    const failedNotifications = Array.from(this.notifications.values()).filter((n) => n.status === 'failed').length;
    const pendingNotifications = Array.from(this.notifications.values()).filter((n) => n.status === 'pending').length;

    return {
      totalNotifications,
      sentNotifications,
      failedNotifications,
      pendingNotifications,
      successRate: totalNotifications > 0 ? (sentNotifications / totalNotifications) * 100 : 0,
      totalSubscribers: this.subscriptions.size,
      activeSubscribers: Array.from(this.subscriptions.values()).filter((s) => !s.unsubscribedAt).length,
    };
  }
}

// Export singleton instance
export const emailNotificationManager = new EmailNotificationManager();

