/**
 * Real-Time Notifications System
 * WebSocket-based push notifications for all user events
 */

import { Server as SocketIOServer, Socket } from 'socket.io';
import { z } from 'zod';

export type NotificationType = 
  | 'quote_accepted'
  | 'quote_rejected'
  | 'project_created'
  | 'project_completed'
  | 'team_member_added'
  | 'comment_added'
  | 'measurement_updated'
  | 'payment_received'
  | 'system_alert'
  | 'feature_update';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

export interface NotificationPreferences {
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  inAppNotifications: boolean;
  notificationTypes: Record<NotificationType, boolean>;
  quietHours?: { start: string; end: string };
}

// Validation schemas
const NotificationSchema = z.object({
  userId: z.string(),
  type: z.enum([
    'quote_accepted',
    'quote_rejected',
    'project_created',
    'project_completed',
    'team_member_added',
    'comment_added',
    'measurement_updated',
    'payment_received',
    'system_alert',
    'feature_update',
  ]),
  title: z.string(),
  message: z.string(),
  data: z.record(z.any()).optional(),
});

// Notification System Manager
export class NotificationSystem {
  private io: SocketIOServer;
  private notifications: Map<string, Notification[]> = new Map(); // userId -> notifications
  private preferences: Map<string, NotificationPreferences> = new Map(); // userId -> preferences
  private subscriptions: Map<string, Set<string>> = new Map(); // userId -> socketIds

  constructor(io: SocketIOServer) {
    this.io = io;
    this.setupEventHandlers();
  }

  /**
   * Setup WebSocket event handlers
   */
  private setupEventHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      // User subscribes to notifications
      socket.on('subscribe-notifications', (data: { userId: string }) => {
        this.handleSubscribe(socket, data.userId);
      });

      // User unsubscribes from notifications
      socket.on('unsubscribe-notifications', (data: { userId: string }) => {
        this.handleUnsubscribe(socket, data.userId);
      });

      // User marks notification as read
      socket.on('mark-notification-read', (data: { notificationId: string }) => {
        this.handleMarkAsRead(socket, data.notificationId);
      });

      // User marks all notifications as read
      socket.on('mark-all-read', (data: { userId: string }) => {
        this.handleMarkAllAsRead(socket, data.userId);
      });

      // User deletes notification
      socket.on('delete-notification', (data: { notificationId: string }) => {
        this.handleDeleteNotification(socket, data.notificationId);
      });

      // User updates notification preferences
      socket.on('update-preferences', (data: NotificationPreferences) => {
        this.handleUpdatePreferences(socket, data);
      });

      // Disconnect
      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });
    });
  }

  /**
   * Send notification to user
   */
  async sendNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    data?: Record<string, any>
  ): Promise<Notification> {
    // Validate notification
    const validated = NotificationSchema.parse({
      userId,
      type,
      title,
      message,
      data,
    });

    // Check preferences
    const preferences = this.preferences.get(userId);
    if (preferences && !preferences.notificationTypes[type]) {
      console.log(`[Notifications] Skipping ${type} for ${userId} (disabled)`);
      return this.createNotification(userId, type, title, message, data);
    }

    // Check quiet hours
    if (preferences?.quietHours) {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      if (currentTime >= preferences.quietHours.start && currentTime <= preferences.quietHours.end) {
        console.log(`[Notifications] Skipping ${type} for ${userId} (quiet hours)`);
        return this.createNotification(userId, type, title, message, data);
      }
    }

    // Create notification
    const notification = this.createNotification(userId, type, title, message, data);

    // Store notification
    if (!this.notifications.has(userId)) {
      this.notifications.set(userId, []);
    }
    this.notifications.get(userId)!.push(notification);

    // Send to subscribed sockets
    const socketIds = this.subscriptions.get(userId);
    if (socketIds) {
      socketIds.forEach(socketId => {
        this.io.to(socketId).emit('notification', notification);
      });
    }

    // Send email if enabled
    if (preferences?.emailNotifications) {
      await this.sendEmailNotification(userId, notification);
    }

    return notification;
  }

  /**
   * Send bulk notifications
   */
  async sendBulkNotifications(
    userIds: string[],
    type: NotificationType,
    title: string,
    message: string,
    data?: Record<string, any>
  ): Promise<Notification[]> {
    const notifications: Notification[] = [];

    for (const userId of userIds) {
      const notification = await this.sendNotification(userId, type, title, message, data);
      notifications.push(notification);
    }

    return notifications;
  }

  /**
   * Get user notifications
   */
  getUserNotifications(userId: string, limit: number = 50): Notification[] {
    const notifications = this.notifications.get(userId) || [];
    return notifications.slice(-limit);
  }

  /**
   * Get unread notifications count
   */
  getUnreadCount(userId: string): number {
    const notifications = this.notifications.get(userId) || [];
    return notifications.filter(n => !n.read).length;
  }

  /**
   * Handle user subscription
   */
  private handleSubscribe(socket: Socket, userId: string): void {
    if (!this.subscriptions.has(userId)) {
      this.subscriptions.set(userId, new Set());
    }
    this.subscriptions.get(userId)!.add(socket.id);

    // Send existing notifications
    const notifications = this.getUserNotifications(userId);
    socket.emit('notifications-list', { notifications });

    // Send unread count
    const unreadCount = this.getUnreadCount(userId);
    socket.emit('unread-count', { count: unreadCount });

    console.log(`[Notifications] User ${userId} subscribed`);
  }

  /**
   * Handle user unsubscription
   */
  private handleUnsubscribe(socket: Socket, userId: string): void {
    this.subscriptions.get(userId)?.delete(socket.id);
    console.log(`[Notifications] User ${userId} unsubscribed`);
  }

  /**
   * Handle mark as read
   */
  private handleMarkAsRead(socket: Socket, notificationId: string): void {
    this.notifications.forEach(notifications => {
      const notification = notifications.find(n => n.id === notificationId);
      if (notification) {
        notification.read = true;
      }
    });
  }

  /**
   * Handle mark all as read
   */
  private handleMarkAllAsRead(socket: Socket, userId: string): void {
    const notifications = this.notifications.get(userId);
    if (notifications) {
      notifications.forEach(n => {
        n.read = true;
      });
    }
  }

  /**
   * Handle delete notification
   */
  private handleDeleteNotification(socket: Socket, notificationId: string): void {
    this.notifications.forEach(notifications => {
      const index = notifications.findIndex(n => n.id === notificationId);
      if (index >= 0) {
        notifications.splice(index, 1);
      }
    });
  }

  /**
   * Handle update preferences
   */
  private handleUpdatePreferences(socket: Socket, preferences: NotificationPreferences): void {
    this.preferences.set(preferences.userId, preferences);
    socket.emit('preferences-updated', { success: true });
  }

  /**
   * Handle disconnect
   */
  private handleDisconnect(socket: Socket): void {
    this.subscriptions.forEach(socketIds => {
      socketIds.delete(socket.id);
    });
  }

  /**
   * Create notification object
   */
  private createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    data?: Record<string, any>
  ): Notification {
    return {
      id: `notif-${Date.now()}-${Math.random()}`,
      userId,
      type,
      title,
      message,
      data,
      read: false,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    };
  }

  /**
   * Send email notification (placeholder)
   */
  private async sendEmailNotification(userId: string, notification: Notification): Promise<void> {
    // In real implementation, would send email via SendGrid, AWS SES, etc.
    console.log(`[Email] Sending ${notification.type} to ${userId}`);
  }

  /**
   * Get IO instance
   */
  getIO(): SocketIOServer {
    return this.io;
  }
}

// Export singleton instance
let notificationSystem: NotificationSystem | null = null;

export function initializeNotifications(io: SocketIOServer): NotificationSystem {
  if (!notificationSystem) {
    notificationSystem = new NotificationSystem(io);
  }
  return notificationSystem;
}

export function getNotificationSystem(): NotificationSystem | null {
  return notificationSystem;
}

