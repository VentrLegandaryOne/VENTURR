/**
 * Customer Portal & Self-Service System
 * Client projects, payments, documents, progress tracking, white-label customization
 */

import { EventEmitter } from 'events';

export interface ClientProject {
  id: string;
  clientId: string;
  title: string;
  description: string;
  status: 'quote' | 'accepted' | 'in_progress' | 'completed' | 'archived';
  quoteAmount: number;
  finalAmount?: number;
  startDate?: Date;
  completionDate?: Date;
  progress: number; // 0-100
  documents: string[];
  payments: string[];
  updates: Array<{
    date: Date;
    message: string;
    type: 'status' | 'payment' | 'document' | 'comment';
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientPayment {
  id: string;
  projectId: string;
  clientId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  method: 'credit_card' | 'bank_transfer' | 'check';
  dueDate: Date;
  paidDate?: Date;
  invoiceUrl?: string;
  receiptUrl?: string;
}

export interface ClientDocument {
  id: string;
  projectId: string;
  clientId: string;
  type: 'quote' | 'contract' | 'invoice' | 'receipt' | 'report' | 'other';
  title: string;
  url: string;
  uploadedAt: Date;
  expiresAt?: Date;
}

export interface ClientNotification {
  id: string;
  clientId: string;
  projectId?: string;
  type: 'project_update' | 'payment_due' | 'document_ready' | 'message';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

class CustomerPortalManager extends EventEmitter {
  private clientProjects: Map<string, ClientProject> = new Map();
  private clientPayments: Map<string, ClientPayment> = new Map();
  private clientDocuments: Map<string, ClientDocument> = new Map();
  private clientNotifications: Map<string, ClientNotification> = new Map();
  private portalSettings: Map<string, any> = new Map();

  constructor() {
    super();
    this.startPaymentReminders();
  }

  /**
   * Start payment reminder scheduler
   */
  private startPaymentReminders(): void {
    // Check for due payments daily
    setInterval(() => {
      const now = new Date();

      for (const payment of this.clientPayments.values()) {
        if (
          payment.status === 'pending' &&
          payment.dueDate < now &&
          payment.dueDate > new Date(now.getTime() - 24 * 60 * 60 * 1000)
        ) {
          this.emit('payment:overdue', payment);
        }
      }
    }, 24 * 60 * 60 * 1000);

    console.log('[CustomerPortal] Payment reminder scheduler started');
  }

  /**
   * Create client project
   */
  public createClientProject(
    clientId: string,
    title: string,
    description: string,
    quoteAmount: number
  ): string {
    const projectId = `project-${Date.now()}`;
    const project: ClientProject = {
      id: projectId,
      clientId,
      title,
      description,
      status: 'quote',
      quoteAmount,
      progress: 0,
      documents: [],
      payments: [],
      updates: [
        {
          date: new Date(),
          message: 'Quote created',
          type: 'status',
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.clientProjects.set(projectId, project);
    this.emit('project:created', project);

    console.log(`[CustomerPortal] Client project created: ${projectId}`);

    return projectId;
  }

  /**
   * Get client project
   */
  public getClientProject(projectId: string): ClientProject | null {
    return this.clientProjects.get(projectId) || null;
  }

  /**
   * List client projects
   */
  public listClientProjects(clientId: string, status?: string): ClientProject[] {
    let projects = Array.from(this.clientProjects.values()).filter((p) => p.clientId === clientId);

    if (status) {
      projects = projects.filter((p) => p.status === status);
    }

    return projects.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Update project status
   */
  public updateProjectStatus(projectId: string, newStatus: ClientProject['status']): void {
    const project = this.clientProjects.get(projectId);
    if (!project) {
      throw new Error(`Project not found: ${projectId}`);
    }

    const oldStatus = project.status;
    project.status = newStatus;
    project.updatedAt = new Date();

    project.updates.push({
      date: new Date(),
      message: `Status changed from ${oldStatus} to ${newStatus}`,
      type: 'status',
    });

    this.emit('project:updated', project);

    console.log(`[CustomerPortal] Project status updated: ${projectId} (${oldStatus} -> ${newStatus})`);
  }

  /**
   * Update project progress
   */
  public updateProjectProgress(projectId: string, progress: number): void {
    const project = this.clientProjects.get(projectId);
    if (!project) {
      throw new Error(`Project not found: ${projectId}`);
    }

    project.progress = Math.min(100, Math.max(0, progress));
    project.updatedAt = new Date();

    this.emit('project:progress', { projectId, progress: project.progress });

    console.log(`[CustomerPortal] Project progress updated: ${projectId} (${project.progress}%)`);
  }

  /**
   * Create payment
   */
  public createPayment(
    projectId: string,
    clientId: string,
    amount: number,
    dueDate: Date,
    method: 'credit_card' | 'bank_transfer' | 'check' = 'credit_card'
  ): string {
    const paymentId = `payment-${Date.now()}`;
    const payment: ClientPayment = {
      id: paymentId,
      projectId,
      clientId,
      amount,
      status: 'pending',
      method,
      dueDate,
    };

    this.clientPayments.set(paymentId, payment);

    // Add to project
    const project = this.clientProjects.get(projectId);
    if (project) {
      project.payments.push(paymentId);
      project.updates.push({
        date: new Date(),
        message: `Payment of $${amount} requested`,
        type: 'payment',
      });
    }

    this.emit('payment:created', payment);

    console.log(`[CustomerPortal] Payment created: ${paymentId} ($${amount})`);

    return paymentId;
  }

  /**
   * Get payment
   */
  public getPayment(paymentId: string): ClientPayment | null {
    return this.clientPayments.get(paymentId) || null;
  }

  /**
   * List client payments
   */
  public listClientPayments(clientId: string, status?: string): ClientPayment[] {
    let payments = Array.from(this.clientPayments.values()).filter((p) => p.clientId === clientId);

    if (status) {
      payments = payments.filter((p) => p.status === status);
    }

    return payments.sort((a, b) => b.dueDate.getTime() - a.dueDate.getTime());
  }

  /**
   * Mark payment as completed
   */
  public completePayment(paymentId: string, receiptUrl?: string): void {
    const payment = this.clientPayments.get(paymentId);
    if (!payment) {
      throw new Error(`Payment not found: ${paymentId}`);
    }

    payment.status = 'completed';
    payment.paidDate = new Date();
    if (receiptUrl) {
      payment.receiptUrl = receiptUrl;
    }

    const project = this.clientProjects.get(payment.projectId);
    if (project) {
      project.updates.push({
        date: new Date(),
        message: `Payment of $${payment.amount} received`,
        type: 'payment',
      });
    }

    this.emit('payment:completed', payment);

    console.log(`[CustomerPortal] Payment completed: ${paymentId}`);
  }

  /**
   * Upload document
   */
  public uploadDocument(
    projectId: string,
    clientId: string,
    type: ClientDocument['type'],
    title: string,
    url: string,
    expiresAt?: Date
  ): string {
    const documentId = `doc-${Date.now()}`;
    const document: ClientDocument = {
      id: documentId,
      projectId,
      clientId,
      type,
      title,
      url,
      uploadedAt: new Date(),
      expiresAt,
    };

    this.clientDocuments.set(documentId, document);

    // Add to project
    const project = this.clientProjects.get(projectId);
    if (project) {
      project.documents.push(documentId);
      project.updates.push({
        date: new Date(),
        message: `Document "${title}" uploaded`,
        type: 'document',
      });
    }

    this.emit('document:uploaded', document);

    console.log(`[CustomerPortal] Document uploaded: ${documentId}`);

    return documentId;
  }

  /**
   * Get document
   */
  public getDocument(documentId: string): ClientDocument | null {
    return this.clientDocuments.get(documentId) || null;
  }

  /**
   * List project documents
   */
  public listProjectDocuments(projectId: string): ClientDocument[] {
    return Array.from(this.clientDocuments.values())
      .filter((d) => d.projectId === projectId && (!d.expiresAt || d.expiresAt > new Date()))
      .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
  }

  /**
   * Send notification to client
   */
  public sendNotification(
    clientId: string,
    type: ClientNotification['type'],
    title: string,
    message: string,
    projectId?: string
  ): string {
    const notificationId = `notif-${Date.now()}`;
    const notification: ClientNotification = {
      id: notificationId,
      clientId,
      projectId,
      type,
      title,
      message,
      read: false,
      createdAt: new Date(),
    };

    this.clientNotifications.set(notificationId, notification);
    this.emit('notification:sent', notification);

    console.log(`[CustomerPortal] Notification sent: ${notificationId}`);

    return notificationId;
  }

  /**
   * Get client notifications
   */
  public getClientNotifications(clientId: string, unreadOnly: boolean = false): ClientNotification[] {
    let notifications = Array.from(this.clientNotifications.values()).filter(
      (n) => n.clientId === clientId
    );

    if (unreadOnly) {
      notifications = notifications.filter((n) => !n.read);
    }

    return notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Mark notification as read
   */
  public markNotificationAsRead(notificationId: string): void {
    const notification = this.clientNotifications.get(notificationId);
    if (notification) {
      notification.read = true;
    }
  }

  /**
   * Get portal statistics
   */
  public getStatistics(clientId?: string) {
    let projects = Array.from(this.clientProjects.values());
    let payments = Array.from(this.clientPayments.values());
    let documents = Array.from(this.clientDocuments.values());

    if (clientId) {
      projects = projects.filter((p) => p.clientId === clientId);
      payments = payments.filter((p) => p.clientId === clientId);
      documents = documents.filter((d) => d.clientId === clientId);
    }

    const completedPayments = payments.filter((p) => p.status === 'completed');
    const totalPaid = completedPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalPending = payments
      .filter((p) => p.status === 'pending')
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      totalProjects: projects.length,
      projectsByStatus: {
        quote: projects.filter((p) => p.status === 'quote').length,
        accepted: projects.filter((p) => p.status === 'accepted').length,
        in_progress: projects.filter((p) => p.status === 'in_progress').length,
        completed: projects.filter((p) => p.status === 'completed').length,
      },
      totalPayments: payments.length,
      completedPayments: completedPayments.length,
      totalPaid,
      totalPending,
      totalDocuments: documents.length,
      timestamp: new Date(),
    };
  }
}

// Export singleton instance
export const customerPortalManager = new CustomerPortalManager();

