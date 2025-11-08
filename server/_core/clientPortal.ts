/**
 * Client Portal System
 * Public-facing portal for clients to view quotes, track progress, make payments, download documents
 */

export interface ClientPortalAccess {
  id: string;
  clientId: string;
  clientEmail: string;
  projectId: string;
  accessToken: string;
  expiresAt: Date;
  permissions: ('view_quote' | 'view_progress' | 'make_payment' | 'download_documents')[];
  createdAt: Date;
}

export interface ClientProjectView {
  id: string;
  title: string;
  address: string;
  status: 'draft' | 'quoted' | 'approved' | 'in_progress' | 'completed';
  progress: number; // 0-100
  startDate: Date;
  estimatedCompletion: Date;
  completedDate?: Date;
  description: string;
  images: string[];
  updates: ProjectUpdate[];
}

export interface ProjectUpdate {
  id: string;
  timestamp: Date;
  type: 'status_change' | 'milestone' | 'photo' | 'message' | 'document';
  title: string;
  description: string;
  data?: Record<string, any>;
}

export interface ClientQuoteView {
  id: string;
  quoteNumber: string;
  date: Date;
  validUntil: Date;
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected';
  items: QuoteItem[];
  terms: string;
  notes: string;
}

export interface QuoteItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface ClientPayment {
  id: string;
  projectId: string;
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  status: 'pending' | 'paid' | 'overdue';
  description: string;
  paymentMethod?: 'credit_card' | 'bank_transfer' | 'check';
}

export interface ClientDocument {
  id: string;
  projectId: string;
  name: string;
  type: 'quote' | 'contract' | 'invoice' | 'compliance' | 'photo' | 'other';
  uploadedAt: Date;
  fileSize: number;
  downloadUrl: string;
}

export interface ClientNotification {
  id: string;
  clientId: string;
  projectId: string;
  type: 'project_update' | 'quote_ready' | 'payment_due' | 'document_ready' | 'message';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
}

class ClientPortalManager {
  private portalAccess: Map<string, ClientPortalAccess> = new Map();
  private projectViews: Map<string, ClientProjectView> = new Map();
  private quoteViews: Map<string, ClientQuoteView> = new Map();
  private payments: Map<string, ClientPayment[]> = new Map();
  private documents: Map<string, ClientDocument[]> = new Map();
  private notifications: Map<string, ClientNotification[]> = new Map();
  private projectUpdates: Map<string, ProjectUpdate[]> = new Map();

  /**
   * Create portal access for client
   */
  public createPortalAccess(
    clientId: string,
    clientEmail: string,
    projectId: string,
    permissions: ClientPortalAccess['permissions'] = [
      'view_quote',
      'view_progress',
      'make_payment',
      'download_documents',
    ]
  ): ClientPortalAccess {
    const accessToken = this.generateAccessToken();
    const expiresAt = new Date(Date.now() + 365 * 86400000); // 1 year

    const access: ClientPortalAccess = {
      id: `access-${Date.now()}`,
      clientId,
      clientEmail,
      projectId,
      accessToken,
      expiresAt,
      permissions,
      createdAt: new Date(),
    };

    this.portalAccess.set(accessToken, access);

    console.log(`[ClientPortal] Portal access created for ${clientEmail}`);
    return access;
  }

  /**
   * Verify portal access token
   */
  public verifyAccessToken(token: string): ClientPortalAccess | null {
    const access = this.portalAccess.get(token);
    if (!access) return null;
    if (access.expiresAt < new Date()) return null;
    return access;
  }

  /**
   * Create project view for client
   */
  public createProjectView(
    projectId: string,
    title: string,
    address: string,
    description: string
  ): ClientProjectView {
    const view: ClientProjectView = {
      id: projectId,
      title,
      address,
      status: 'draft',
      progress: 0,
      startDate: new Date(),
      estimatedCompletion: new Date(Date.now() + 30 * 86400000),
      description,
      images: [],
      updates: [],
    };

    this.projectViews.set(projectId, view);
    this.projectUpdates.set(projectId, []);

    console.log(`[ClientPortal] Project view created: ${projectId}`);
    return view;
  }

  /**
   * Update project progress
   */
  public updateProjectProgress(projectId: string, progress: number, status?: string): boolean {
    const view = this.projectViews.get(projectId);
    if (!view) return false;

    view.progress = Math.min(100, Math.max(0, progress));
    if (status) {
      view.status = status as any;
    }

    // Add update
    const update: ProjectUpdate = {
      id: `update-${Date.now()}`,
      timestamp: new Date(),
      type: 'status_change',
      title: `Progress: ${progress}%`,
      description: `Project is now ${progress}% complete`,
    };

    this.projectUpdates.get(projectId)?.push(update);
    view.updates.push(update);

    console.log(`[ClientPortal] Project progress updated: ${projectId} - ${progress}%`);
    return true;
  }

  /**
   * Add project update
   */
  public addProjectUpdate(
    projectId: string,
    type: ProjectUpdate['type'],
    title: string,
    description: string,
    data?: Record<string, any>
  ): ProjectUpdate | null {
    const view = this.projectViews.get(projectId);
    if (!view) return null;

    const update: ProjectUpdate = {
      id: `update-${Date.now()}`,
      timestamp: new Date(),
      type,
      title,
      description,
      data,
    };

    this.projectUpdates.get(projectId)?.push(update);
    view.updates.push(update);

    // Create notification
    this.createNotification(
      view.id,
      'project_update',
      title,
      description,
      `/projects/${projectId}`
    );

    console.log(`[ClientPortal] Project update added: ${projectId}`);
    return update;
  }

  /**
   * Create quote view for client
   */
  public createQuoteView(
    quoteId: string,
    quoteNumber: string,
    items: QuoteItem[],
    subtotal: number,
    tax: number,
    terms: string,
    notes: string
  ): ClientQuoteView {
    const total = subtotal + tax;
    const validUntil = new Date(Date.now() + 30 * 86400000);

    const quote: ClientQuoteView = {
      id: quoteId,
      quoteNumber,
      date: new Date(),
      validUntil,
      subtotal,
      tax,
      total,
      status: 'sent',
      items,
      terms,
      notes,
    };

    this.quoteViews.set(quoteId, quote);

    console.log(`[ClientPortal] Quote view created: ${quoteId}`);
    return quote;
  }

  /**
   * Update quote status
   */
  public updateQuoteStatus(quoteId: string, status: ClientQuoteView['status']): boolean {
    const quote = this.quoteViews.get(quoteId);
    if (!quote) return false;

    quote.status = status;

    console.log(`[ClientPortal] Quote status updated: ${quoteId} - ${status}`);
    return true;
  }

  /**
   * Create payment record
   */
  public createPayment(
    projectId: string,
    amount: number,
    dueDate: Date,
    description: string
  ): ClientPayment {
    const payment: ClientPayment = {
      id: `payment-${Date.now()}`,
      projectId,
      amount,
      dueDate,
      status: 'pending',
      description,
    };

    if (!this.payments.has(projectId)) {
      this.payments.set(projectId, []);
    }
    this.payments.get(projectId)!.push(payment);

    // Create notification
    this.createNotification(
      projectId,
      'payment_due',
      'Payment Due',
      `Payment of $${(amount / 100).toFixed(2)} is due on ${dueDate.toLocaleDateString()}`,
      `/projects/${projectId}/payments`
    );

    console.log(`[ClientPortal] Payment created: ${payment.id}`);
    return payment;
  }

  /**
   * Record payment
   */
  public recordPayment(paymentId: string, paymentMethod: string): boolean {
    for (const [, payments] of this.payments) {
      const payment = payments.find((p) => p.id === paymentId);
      if (payment) {
        payment.status = 'paid';
        payment.paidDate = new Date();
        payment.paymentMethod = paymentMethod as any;

        console.log(`[ClientPortal] Payment recorded: ${paymentId}`);
        return true;
      }
    }
    return false;
  }

  /**
   * Add document
   */
  public addDocument(
    projectId: string,
    name: string,
    type: ClientDocument['type'],
    fileSize: number,
    downloadUrl: string
  ): ClientDocument {
    const document: ClientDocument = {
      id: `doc-${Date.now()}`,
      projectId,
      name,
      type,
      uploadedAt: new Date(),
      fileSize,
      downloadUrl,
    };

    if (!this.documents.has(projectId)) {
      this.documents.set(projectId, []);
    }
    this.documents.get(projectId)!.push(document);

    // Create notification
    this.createNotification(
      projectId,
      'document_ready',
      'New Document Available',
      `${name} is now available for download`,
      `/projects/${projectId}/documents`
    );

    console.log(`[ClientPortal] Document added: ${document.id}`);
    return document;
  }

  /**
   * Create notification
   */
  private createNotification(
    projectId: string,
    type: ClientNotification['type'],
    title: string,
    message: string,
    actionUrl?: string
  ): ClientNotification {
    const notification: ClientNotification = {
      id: `notif-${Date.now()}`,
      clientId: `client-${projectId}`,
      projectId,
      type,
      title,
      message,
      read: false,
      createdAt: new Date(),
      actionUrl,
    };

    if (!this.notifications.has(projectId)) {
      this.notifications.set(projectId, []);
    }
    this.notifications.get(projectId)!.push(notification);

    return notification;
  }

  /**
   * Get project view
   */
  public getProjectView(projectId: string): ClientProjectView | undefined {
    return this.projectViews.get(projectId);
  }

  /**
   * Get quote view
   */
  public getQuoteView(quoteId: string): ClientQuoteView | undefined {
    return this.quoteViews.get(quoteId);
  }

  /**
   * Get project payments
   */
  public getProjectPayments(projectId: string): ClientPayment[] {
    return this.payments.get(projectId) || [];
  }

  /**
   * Get project documents
   */
  public getProjectDocuments(projectId: string): ClientDocument[] {
    return this.documents.get(projectId) || [];
  }

  /**
   * Get project notifications
   */
  public getProjectNotifications(projectId: string): ClientNotification[] {
    return this.notifications.get(projectId) || [];
  }

  /**
   * Mark notification as read
   */
  public markNotificationAsRead(notificationId: string): boolean {
    for (const [, notifications] of this.notifications) {
      const notification = notifications.find((n) => n.id === notificationId);
      if (notification) {
        notification.read = true;
        return true;
      }
    }
    return false;
  }

  /**
   * Get portal statistics
   */
  public getPortalStatistics() {
    let totalProjects = 0;
    let activeProjects = 0;
    let totalPaymentsPending = 0;
    let totalDocuments = 0;
    let unreadNotifications = 0;

    for (const [, project] of this.projectViews) {
      totalProjects++;
      if (project.status === 'in_progress') {
        activeProjects++;
      }
    }

    for (const [, payments] of this.payments) {
      for (const payment of payments) {
        if (payment.status === 'pending') {
          totalPaymentsPending += payment.amount;
        }
      }
    }

    for (const [, documents] of this.documents) {
      totalDocuments += documents.length;
    }

    for (const [, notifications] of this.notifications) {
      unreadNotifications += notifications.filter((n) => !n.read).length;
    }

    return {
      totalProjects,
      activeProjects,
      totalPaymentsPending: totalPaymentsPending / 100,
      totalDocuments,
      unreadNotifications,
    };
  }

  /**
   * Generate access token
   */
  private generateAccessToken(): string {
    return `portal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const clientPortalManager = new ClientPortalManager();

