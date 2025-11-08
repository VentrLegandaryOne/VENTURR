/**
 * Webhook System
 * Event subscriptions, webhook management, real-time notifications
 */

export interface WebhookEvent {
  id: string;
  type: 'project.created' | 'project.updated' | 'quote.sent' | 'payment.received' | 'project.completed';
  data: Record<string, unknown>;
  timestamp: Date;
}

export interface WebhookSubscription {
  id: string;
  developerId: string;
  url: string;
  events: string[];
  isActive: boolean;
  createdAt: Date;
  lastTriggeredAt?: Date;
  failureCount: number;
  maxRetries: number;
}

export interface WebhookDelivery {
  id: string;
  subscriptionId: string;
  eventId: string;
  status: 'pending' | 'success' | 'failed' | 'retry';
  statusCode?: number;
  response?: string;
  attemptCount: number;
  nextRetryAt?: Date;
  timestamp: Date;
}

class WebhookSystemManager {
  private subscriptions: Map<string, WebhookSubscription> = new Map();
  private deliveries: Map<string, WebhookDelivery> = new Map();
  private eventQueue: WebhookEvent[] = [];

  constructor() {
    // Start processing queue every 5 seconds
    setInterval(() => this.processEventQueue(), 5000);
  }

  /**
   * Create webhook subscription
   */
  public createSubscription(
    developerId: string,
    url: string,
    events: string[]
  ): WebhookSubscription {
    const subscriptionId = `sub-${Date.now()}`;

    const subscription: WebhookSubscription = {
      id: subscriptionId,
      developerId,
      url,
      events,
      isActive: true,
      createdAt: new Date(),
      failureCount: 0,
      maxRetries: 3,
    };

    this.subscriptions.set(subscriptionId, subscription);

    console.log(`[Webhook] Subscription created: ${subscriptionId}`);
    return subscription;
  }

  /**
   * Update webhook subscription
   */
  public updateSubscription(
    subscriptionId: string,
    updates: Partial<WebhookSubscription>
  ): boolean {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) return false;

    Object.assign(subscription, updates);
    console.log(`[Webhook] Subscription updated: ${subscriptionId}`);
    return true;
  }

  /**
   * Delete webhook subscription
   */
  public deleteSubscription(subscriptionId: string): boolean {
    const deleted = this.subscriptions.delete(subscriptionId);
    if (deleted) {
      console.log(`[Webhook] Subscription deleted: ${subscriptionId}`);
    }
    return deleted;
  }

  /**
   * Get developer subscriptions
   */
  public getDeveloperSubscriptions(developerId: string): WebhookSubscription[] {
    return Array.from(this.subscriptions.values()).filter(
      (s) => s.developerId === developerId
    );
  }

  /**
   * Trigger webhook event
   */
  public async triggerEvent(event: WebhookEvent): Promise<void> {
    this.eventQueue.push(event);
    console.log(`[Webhook] Event queued: ${event.type}`);
  }

  /**
   * Process event queue
   */
  private async processEventQueue(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const event = this.eventQueue.shift();
    if (!event) return;

    // Find matching subscriptions
    const matchingSubscriptions = Array.from(this.subscriptions.values()).filter(
      (s) => s.isActive && s.events.includes(event.type)
    );

    for (const subscription of matchingSubscriptions) {
      await this.deliverWebhook(subscription, event);
    }
  }

  /**
   * Deliver webhook to endpoint
   */
  private async deliverWebhook(
    subscription: WebhookSubscription,
    event: WebhookEvent
  ): Promise<void> {
    const deliveryId = `del-${Date.now()}`;

    const delivery: WebhookDelivery = {
      id: deliveryId,
      subscriptionId: subscription.id,
      eventId: event.id,
      status: 'pending',
      attemptCount: 0,
      timestamp: new Date(),
    };

    this.deliveries.set(deliveryId, delivery);

    await this.attemptDelivery(delivery, subscription, event);
  }

  /**
   * Attempt webhook delivery with retries
   */
  private async attemptDelivery(
    delivery: WebhookDelivery,
    subscription: WebhookSubscription,
    event: WebhookEvent
  ): Promise<void> {
    delivery.attemptCount++;

    try {
      const response = await fetch(subscription.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': this.generateSignature(event),
          'X-Webhook-Event': event.type,
          'X-Webhook-Delivery': delivery.id,
        },
        body: JSON.stringify(event),
        timeout: 10000,
      });

      delivery.statusCode = response.status;
      delivery.response = await response.text();

      if (response.ok) {
        delivery.status = 'success';
        subscription.lastTriggeredAt = new Date();
        subscription.failureCount = 0;
        console.log(`[Webhook] Delivery successful: ${delivery.id}`);
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      delivery.status = 'failed';
      subscription.failureCount++;

      if (delivery.attemptCount < subscription.maxRetries) {
        // Schedule retry with exponential backoff
        const delayMs = Math.pow(2, delivery.attemptCount) * 1000;
        delivery.status = 'retry';
        delivery.nextRetryAt = new Date(Date.now() + delayMs);

        console.log(
          `[Webhook] Delivery failed, retrying in ${delayMs}ms: ${delivery.id}`
        );

        setTimeout(() => {
          this.attemptDelivery(delivery, subscription, event);
        }, delayMs);
      } else {
        console.log(`[Webhook] Delivery failed after ${delivery.attemptCount} attempts: ${delivery.id}`);

        // Disable subscription after too many failures
        if (subscription.failureCount >= 5) {
          subscription.isActive = false;
          console.log(`[Webhook] Subscription disabled due to repeated failures: ${subscription.id}`);
        }
      }
    }
  }

  /**
   * Generate webhook signature
   */
  private generateSignature(event: WebhookEvent): string {
    const payload = JSON.stringify(event);
    // In production, use HMAC-SHA256 with secret key
    return `sha256=${Buffer.from(payload).toString('hex')}`;
  }

  /**
   * Get delivery history
   */
  public getDeliveryHistory(subscriptionId: string, limit: number = 50): WebhookDelivery[] {
    return Array.from(this.deliveries.values())
      .filter((d) => d.subscriptionId === subscriptionId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Get webhook statistics
   */
  public getWebhookStatistics() {
    const totalSubscriptions = this.subscriptions.size;
    const activeSubscriptions = Array.from(this.subscriptions.values()).filter(
      (s) => s.isActive
    ).length;
    const totalDeliveries = this.deliveries.size;

    const deliveriesByStatus = {
      success: 0,
      failed: 0,
      pending: 0,
      retry: 0,
    };

    for (const delivery of this.deliveries.values()) {
      deliveriesByStatus[delivery.status]++;
    }

    const successRate =
      totalDeliveries > 0
        ? ((deliveriesByStatus.success / totalDeliveries) * 100).toFixed(2)
        : '0.00';

    return {
      totalSubscriptions,
      activeSubscriptions,
      totalDeliveries,
      deliveriesByStatus,
      successRate: parseFloat(successRate),
      queuedEvents: this.eventQueue.length,
    };
  }

  /**
   * Test webhook endpoint
   */
  public async testWebhook(subscriptionId: string): Promise<boolean> {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) return false;

    const testEvent: WebhookEvent = {
      id: `test-${Date.now()}`,
      type: 'project.created',
      data: {
        id: 'test-project',
        name: 'Test Project',
        status: 'draft',
      },
      timestamp: new Date(),
    };

    try {
      const response = await fetch(subscription.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Test': 'true',
        },
        body: JSON.stringify(testEvent),
        timeout: 5000,
      });

      return response.ok;
    } catch (error) {
      console.error(`[Webhook] Test failed for ${subscriptionId}:`, error);
      return false;
    }
  }

  /**
   * Emit event (public method for internal use)
   */
  public async emitEvent(
    type: WebhookEvent['type'],
    data: Record<string, unknown>
  ): Promise<void> {
    const event: WebhookEvent = {
      id: `evt-${Date.now()}`,
      type,
      data,
      timestamp: new Date(),
    };

    await this.triggerEvent(event);
  }
}

// Export singleton instance
export const webhookSystemManager = new WebhookSystemManager();

