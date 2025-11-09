/**
 * Real-Time Synchronization Engine
 * WebSocket-based real-time updates for all data changes
 */

import { EventEmitter } from "events";

interface SyncEvent {
  id: string;
  type: "create" | "update" | "delete";
  entity: string; // project, client, task, material, etc.
  entityId: string;
  organizationId: string;
  userId: string;
  timestamp: Date;
  data: any;
  version: number;
}

interface SyncSubscription {
  userId: string;
  organizationId: string;
  entities: string[]; // Types of entities to sync
  callback: (event: SyncEvent) => void;
}

class SyncEngine extends EventEmitter {
  private subscriptions: Map<string, SyncSubscription> = new Map();
  private eventLog: SyncEvent[] = [];
  private eventVersion: number = 0;
  private maxLogSize: number = 10000;

  constructor() {
    super();
  }

  /**
   * Subscribe to real-time updates
   */
  subscribe(
    userId: string,
    organizationId: string,
    entities: string[],
    callback: (event: SyncEvent) => void
  ): string {
    const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    this.subscriptions.set(subscriptionId, {
      userId,
      organizationId,
      entities,
      callback,
    });

    console.log(`[Sync] User ${userId} subscribed to ${entities.join(", ")}`);

    return subscriptionId;
  }

  /**
   * Unsubscribe from updates
   */
  unsubscribe(subscriptionId: string): void {
    this.subscriptions.delete(subscriptionId);
    console.log(`[Sync] Subscription ${subscriptionId} removed`);
  }

  /**
   * Publish a sync event
   */
  async publishEvent(event: Omit<SyncEvent, "id" | "version">): Promise<void> {
    const syncEvent: SyncEvent = {
      ...event,
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      version: ++this.eventVersion,
      timestamp: new Date(),
    };

    // Store in event log
    this.eventLog.push(syncEvent);
    if (this.eventLog.length > this.maxLogSize) {
      this.eventLog.shift();
    }

    // Notify subscribers
    this.subscriptions.forEach((subscription, subscriptionId) => {
      // Only notify if organization matches and entity type is subscribed
      if (
        subscription.organizationId === syncEvent.organizationId &&
        subscription.entities.includes(syncEvent.entity)
      ) {
        try {
          subscription.callback(syncEvent);
        } catch (error) {
          console.error(`[Sync] Error notifying subscriber ${subscriptionId}:`, error);
        }
      }
    });

    // Emit for external listeners
    this.emit("event", syncEvent);
  }

  /**
   * Publish project update
   */
  async publishProjectUpdate(
    projectId: string,
    organizationId: string,
    userId: string,
    data: any,
    type: "create" | "update" | "delete" = "update"
  ): Promise<void> {
    await this.publishEvent({
      type,
      entity: "project",
      entityId: projectId,
      organizationId,
      userId,
      data,
    });
  }

  /**
   * Publish task update
   */
  async publishTaskUpdate(
    taskId: string,
    projectId: string,
    organizationId: string,
    userId: string,
    data: any,
    type: "create" | "update" | "delete" = "update"
  ): Promise<void> {
    await this.publishEvent({
      type,
      entity: "task",
      entityId: taskId,
      organizationId,
      userId,
      data: {
        ...data,
        projectId,
      },
    });
  }

  /**
   * Publish client update
   */
  async publishClientUpdate(
    clientId: string,
    organizationId: string,
    userId: string,
    data: any,
    type: "create" | "update" | "delete" = "update"
  ): Promise<void> {
    await this.publishEvent({
      type,
      entity: "client",
      entityId: clientId,
      organizationId,
      userId,
      data,
    });
  }

  /**
   * Publish inventory update
   */
  async publishInventoryUpdate(
    itemId: string,
    organizationId: string,
    userId: string,
    data: any,
    type: "create" | "update" | "delete" = "update"
  ): Promise<void> {
    await this.publishEvent({
      type,
      entity: "inventory",
      entityId: itemId,
      organizationId,
      userId,
      data,
    });
  }

  /**
   * Publish financial update
   */
  async publishFinancialUpdate(
    invoiceId: string,
    organizationId: string,
    userId: string,
    data: any,
    type: "create" | "update" | "delete" = "update"
  ): Promise<void> {
    await this.publishEvent({
      type,
      entity: "invoice",
      entityId: invoiceId,
      organizationId,
      userId,
      data,
    });
  }

  /**
   * Get events since version
   */
  getEventsSince(version: number): SyncEvent[] {
    return this.eventLog.filter((event) => event.version > version);
  }

  /**
   * Get events for entity
   */
  getEventsForEntity(entity: string, entityId: string): SyncEvent[] {
    return this.eventLog.filter(
      (event) => event.entity === entity && event.entityId === entityId
    );
  }

  /**
   * Get events for organization
   */
  getEventsForOrganization(organizationId: string, since?: number): SyncEvent[] {
    return this.eventLog.filter(
      (event) =>
        event.organizationId === organizationId &&
        (!since || event.version > since)
    );
  }

  /**
   * Get current version
   */
  getCurrentVersion(): number {
    return this.eventVersion;
  }

  /**
   * Get subscription count
   */
  getSubscriptionCount(): number {
    return this.subscriptions.size;
  }

  /**
   * Get event log size
   */
  getEventLogSize(): number {
    return this.eventLog.length;
  }

  /**
   * Clear old events
   */
  clearOldEvents(olderThanMinutes: number): number {
    const cutoffTime = new Date(Date.now() - olderThanMinutes * 60 * 1000);
    const initialLength = this.eventLog.length;

    this.eventLog = this.eventLog.filter((event) => event.timestamp > cutoffTime);

    const removed = initialLength - this.eventLog.length;
    console.log(`[Sync] Cleared ${removed} events older than ${olderThanMinutes} minutes`);

    return removed;
  }
}

// Global sync engine instance
let syncEngineInstance: SyncEngine | null = null;

/**
 * Get or create sync engine instance
 */
export function getSyncEngine(): SyncEngine {
  if (!syncEngineInstance) {
    syncEngineInstance = new SyncEngine();

    // Clear old events every hour
    setInterval(() => {
      syncEngineInstance?.clearOldEvents(60);
    }, 60 * 60 * 1000);
  }

  return syncEngineInstance;
}

/**
 * Sync middleware for tRPC mutations
 */
export function syncMiddleware(
  entity: string,
  type: "create" | "update" | "delete" = "update"
) {
  return async (opts: any) => {
    const result = await opts.next();

    // Extract context
    const { ctx } = opts;
    if (ctx?.user?.id && ctx?.user?.organizationId) {
      const syncEngine = getSyncEngine();

      // Publish sync event
      await syncEngine.publishEvent({
        type,
        entity,
        entityId: result?.id || "",
        organizationId: ctx.user.organizationId,
        userId: ctx.user.id,
        data: result,
      });
    }

    return result;
  };
}

export default SyncEngine;

