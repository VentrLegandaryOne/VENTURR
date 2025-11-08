/**
 * Real-Time Synchronization System
 * WebSocket-based real-time updates for chat, notifications, and project changes
 */

import { EventEmitter } from 'events';

export interface RealtimeEvent {
  id: string;
  type: 'chat.message' | 'notification' | 'project.update' | 'quote.update' | 'payment.update';
  userId: string;
  data: Record<string, unknown>;
  timestamp: Date;
}

export interface RealtimeSubscription {
  userId: string;
  channels: Set<string>;
  isActive: boolean;
  lastHeartbeat: Date;
}

class RealtimeSyncManager extends EventEmitter {
  private subscriptions: Map<string, RealtimeSubscription> = new Map();
  private eventHistory: Map<string, RealtimeEvent[]> = new Map();
  private maxHistorySize = 100;

  constructor() {
    super();
    // Heartbeat check every 30 seconds
    setInterval(() => this.checkHeartbeats(), 30000);
  }

  /**
   * Subscribe user to channels
   */
  public subscribe(userId: string, channels: string[]): void {
    let subscription = this.subscriptions.get(userId);

    if (!subscription) {
      subscription = {
        userId,
        channels: new Set(channels),
        isActive: true,
        lastHeartbeat: new Date(),
      };
    } else {
      channels.forEach((ch) => subscription!.channels.add(ch));
    }

    this.subscriptions.set(userId, subscription);
    console.log(`[RealtimeSync] User subscribed: ${userId} to channels: ${channels.join(', ')}`);
  }

  /**
   * Unsubscribe user from channels
   */
  public unsubscribe(userId: string, channels?: string[]): void {
    const subscription = this.subscriptions.get(userId);
    if (!subscription) return;

    if (channels) {
      channels.forEach((ch) => subscription.channels.delete(ch));
    } else {
      subscription.isActive = false;
    }

    if (subscription.channels.size === 0) {
      this.subscriptions.delete(userId);
    }

    console.log(`[RealtimeSync] User unsubscribed: ${userId}`);
  }

  /**
   * Broadcast event to subscribed users
   */
  public broadcast(event: RealtimeEvent, channel: string): void {
    const subscribers = Array.from(this.subscriptions.values()).filter(
      (sub) => sub.isActive && sub.channels.has(channel)
    );

    for (const subscriber of subscribers) {
      this.emit(`user:${subscriber.userId}`, event);
    }

    // Store in history
    this.storeEventHistory(channel, event);

    console.log(
      `[RealtimeSync] Broadcast ${event.type} to ${subscribers.length} users on channel: ${channel}`
    );
  }

  /**
   * Send event to specific user
   */
  public sendToUser(userId: string, event: RealtimeEvent): void {
    const subscription = this.subscriptions.get(userId);
    if (!subscription || !subscription.isActive) return;

    this.emit(`user:${userId}`, event);
    console.log(`[RealtimeSync] Event sent to user: ${userId}`);
  }

  /**
   * Store event in history
   */
  private storeEventHistory(channel: string, event: RealtimeEvent): void {
    if (!this.eventHistory.has(channel)) {
      this.eventHistory.set(channel, []);
    }

    const history = this.eventHistory.get(channel)!;
    history.push(event);

    // Keep only recent events
    if (history.length > this.maxHistorySize) {
      history.shift();
    }
  }

  /**
   * Get event history for channel
   */
  public getEventHistory(channel: string, limit: number = 50): RealtimeEvent[] {
    const history = this.eventHistory.get(channel) || [];
    return history.slice(-limit);
  }

  /**
   * Check heartbeats and remove inactive subscriptions
   */
  private checkHeartbeats(): void {
    const now = new Date();
    const timeout = 5 * 60 * 1000; // 5 minutes

    for (const [userId, subscription] of this.subscriptions.entries()) {
      const timeSinceHeartbeat = now.getTime() - subscription.lastHeartbeat.getTime();

      if (timeSinceHeartbeat > timeout) {
        this.subscriptions.delete(userId);
        console.log(`[RealtimeSync] Inactive subscription removed: ${userId}`);
      }
    }
  }

  /**
   * Update heartbeat for user
   */
  public heartbeat(userId: string): void {
    const subscription = this.subscriptions.get(userId);
    if (subscription) {
      subscription.lastHeartbeat = new Date();
    }
  }

  /**
   * Get active subscriptions count
   */
  public getActiveSubscriptionsCount(): number {
    return this.subscriptions.size;
  }

  /**
   * Get subscription info
   */
  public getSubscriptionInfo(userId: string): RealtimeSubscription | null {
    return this.subscriptions.get(userId) || null;
  }

  /**
   * Emit chat message event
   */
  public emitChatMessage(
    userId: string,
    channelId: string,
    message: string,
    attachments?: string[]
  ): void {
    const event: RealtimeEvent = {
      id: `msg-${Date.now()}`,
      type: 'chat.message',
      userId,
      data: {
        channelId,
        message,
        attachments,
      },
      timestamp: new Date(),
    };

    this.broadcast(event, `chat:${channelId}`);
  }

  /**
   * Emit notification event
   */
  public emitNotification(
    userId: string,
    title: string,
    content: string,
    type: string
  ): void {
    const event: RealtimeEvent = {
      id: `notif-${Date.now()}`,
      type: 'notification',
      userId,
      data: {
        title,
        content,
        notificationType: type,
      },
      timestamp: new Date(),
    };

    this.sendToUser(userId, event);
  }

  /**
   * Emit project update event
   */
  public emitProjectUpdate(
    projectId: string,
    field: string,
    oldValue: unknown,
    newValue: unknown
  ): void {
    const event: RealtimeEvent = {
      id: `proj-${Date.now()}`,
      type: 'project.update',
      userId: 'system',
      data: {
        projectId,
        field,
        oldValue,
        newValue,
      },
      timestamp: new Date(),
    };

    this.broadcast(event, `project:${projectId}`);
  }

  /**
   * Emit quote update event
   */
  public emitQuoteUpdate(quoteId: string, status: string): void {
    const event: RealtimeEvent = {
      id: `quote-${Date.now()}`,
      type: 'quote.update',
      userId: 'system',
      data: {
        quoteId,
        status,
      },
      timestamp: new Date(),
    };

    this.broadcast(event, `quote:${quoteId}`);
  }

  /**
   * Emit payment update event
   */
  public emitPaymentUpdate(paymentId: string, status: string, amount: number): void {
    const event: RealtimeEvent = {
      id: `pay-${Date.now()}`,
      type: 'payment.update',
      userId: 'system',
      data: {
        paymentId,
        status,
        amount,
      },
      timestamp: new Date(),
    };

    this.broadcast(event, `payment:${paymentId}`);
  }

  /**
   * Get statistics
   */
  public getStatistics() {
    const activeSubscriptions = this.subscriptions.size;
    const totalChannels = new Set(
      Array.from(this.subscriptions.values()).flatMap((s) => Array.from(s.channels))
    ).size;
    const totalEvents = Array.from(this.eventHistory.values()).reduce(
      (sum, events) => sum + events.length,
      0
    );

    return {
      activeSubscriptions,
      totalChannels,
      totalEvents,
      timestamp: new Date(),
    };
  }
}

// Export singleton instance
export const realtimeSyncManager = new RealtimeSyncManager();

