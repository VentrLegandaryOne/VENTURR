/**
 * WebSocket Server for Real-Time Notifications
 * Handles real-time updates for chatbot escalations, app installations, pricing changes
 */

import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { getDb } from '../db';

export interface NotificationEvent {
  id: string;
  type: 'chatbot_escalation' | 'app_installed' | 'pricing_alert' | 'review_submitted' | 'app_approved';
  userId: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  timestamp: Date;
  read: boolean;
}

export interface WebSocketContext {
  userId: string;
  socketId: string;
  connectedAt: Date;
}

class WebSocketManager {
  private io: SocketIOServer | null = null;
  private userSockets: Map<string, Set<string>> = new Map();
  private notifications: Map<string, NotificationEvent[]> = new Map();
  private eventSubscribers: Map<string, Set<(event: NotificationEvent) => void>> = new Map();

  /**
   * Initialize WebSocket server
   */
  public initialize(httpServer: HTTPServer): SocketIOServer {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || '*',
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });

    this.setupEventHandlers();
    console.log('[WebSocket] Server initialized');

    return this.io;
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    if (!this.io) return;

    this.io.on('connection', (socket: Socket) => {
      console.log(`[WebSocket] Client connected: ${socket.id}`);

      // User authentication
      socket.on('authenticate', (userId: string) => {
        this.handleUserAuthentication(socket, userId);
      });

      // Subscribe to notifications
      socket.on('subscribe', (channel: string) => {
        this.handleSubscribe(socket, channel);
      });

      // Unsubscribe from notifications
      socket.on('unsubscribe', (channel: string) => {
        this.handleUnsubscribe(socket, channel);
      });

      // Request notification history
      socket.on('request_history', (userId: string) => {
        this.handleHistoryRequest(socket, userId);
      });

      // Mark notification as read
      socket.on('mark_read', (notificationId: string) => {
        this.handleMarkAsRead(socket, notificationId);
      });

      // Disconnect handler
      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });

      // Error handler
      socket.on('error', (error: Error) => {
        console.error(`[WebSocket] Socket error: ${error.message}`);
      });
    });
  }

  /**
   * Handle user authentication
   */
  private handleUserAuthentication(socket: Socket, userId: string): void {
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }

    this.userSockets.get(userId)!.add(socket.id);
    socket.data.userId = userId;

    console.log(`[WebSocket] User authenticated: ${userId} (${socket.id})`);

    // Send acknowledgment
    socket.emit('authenticated', { userId, socketId: socket.id });

    // Send pending notifications
    const notifications = this.notifications.get(userId) || [];
    socket.emit('notifications_sync', notifications);
  }

  /**
   * Handle subscription to notification channel
   */
  private handleSubscribe(socket: Socket, channel: string): void {
    socket.join(channel);
    console.log(`[WebSocket] Socket ${socket.id} subscribed to ${channel}`);
  }

  /**
   * Handle unsubscription from notification channel
   */
  private handleUnsubscribe(socket: Socket, channel: string): void {
    socket.leave(channel);
    console.log(`[WebSocket] Socket ${socket.id} unsubscribed from ${channel}`);
  }

  /**
   * Handle notification history request
   */
  private handleHistoryRequest(socket: Socket, userId: string): void {
    const notifications = this.notifications.get(userId) || [];
    socket.emit('notification_history', notifications);
  }

  /**
   * Handle mark notification as read
   */
  private handleMarkAsRead(socket: Socket, notificationId: string): void {
    const userId = socket.data.userId;
    if (!userId) return;

    const notifications = this.notifications.get(userId) || [];
    const notification = notifications.find((n) => n.id === notificationId);

    if (notification) {
      notification.read = true;
      socket.emit('notification_marked_read', { notificationId });
    }
  }

  /**
   * Handle user disconnect
   */
  private handleDisconnect(socket: Socket): void {
    const userId = socket.data.userId;

    if (userId) {
      const sockets = this.userSockets.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          this.userSockets.delete(userId);
        }
      }
    }

    console.log(`[WebSocket] Client disconnected: ${socket.id}`);
  }

  /**
   * Broadcast notification to user(s)
   */
  public broadcastNotification(
    event: NotificationEvent,
    targetUserIds?: string[]
  ): void {
    if (!this.io) return;

    const userIds = targetUserIds || [event.userId];

    userIds.forEach((userId) => {
      // Store notification
      if (!this.notifications.has(userId)) {
        this.notifications.set(userId, []);
      }
      this.notifications.get(userId)!.push(event);

      // Emit to connected sockets
      const sockets = this.userSockets.get(userId);
      if (sockets) {
        sockets.forEach((socketId) => {
          this.io!.to(socketId).emit('notification', event);
        });
      }

      // Broadcast to channel
      this.io.to(`user:${userId}`).emit('notification', event);
    });

    console.log(`[WebSocket] Notification broadcasted: ${event.type} to ${userIds.length} user(s)`);
  }

  /**
   * Emit chatbot escalation event
   */
  public emitChatbotEscalation(
    sessionId: string,
    userId: string,
    reason: string
  ): void {
    const event: NotificationEvent = {
      id: `escalation-${Date.now()}`,
      type: 'chatbot_escalation',
      userId,
      title: 'Chat Escalated',
      message: `A customer support chat has been escalated to the support team. Reason: ${reason}`,
      data: { sessionId, reason },
      timestamp: new Date(),
      read: false,
    };

    this.broadcastNotification(event, [userId, 'admin']);
  }

  /**
   * Emit app installation event
   */
  public emitAppInstalled(
    appId: string,
    userId: string,
    appName: string
  ): void {
    const event: NotificationEvent = {
      id: `app-install-${Date.now()}`,
      type: 'app_installed',
      userId,
      title: 'App Installed',
      message: `${appName} has been successfully installed and is ready to use.`,
      data: { appId, appName },
      timestamp: new Date(),
      read: false,
    };

    this.broadcastNotification(event, [userId]);
  }

  /**
   * Emit pricing alert event
   */
  public emitPricingAlert(
    userId: string,
    recommendation: string,
    projectedIncrease: number
  ): void {
    const event: NotificationEvent = {
      id: `pricing-alert-${Date.now()}`,
      type: 'pricing_alert',
      userId,
      title: 'Pricing Recommendation',
      message: `New pricing recommendation available. Projected revenue increase: ${projectedIncrease}%`,
      data: { recommendation, projectedIncrease },
      timestamp: new Date(),
      read: false,
    };

    this.broadcastNotification(event, [userId]);
  }

  /**
   * Emit review submitted event (for admin)
   */
  public emitReviewSubmitted(
    reviewId: string,
    appName: string,
    userName: string,
    rating: number
  ): void {
    const event: NotificationEvent = {
      id: `review-${Date.now()}`,
      type: 'review_submitted',
      userId: 'admin',
      title: 'New Review Submitted',
      message: `${userName} left a ${rating}-star review for ${appName}`,
      data: { reviewId, appName, userName, rating },
      timestamp: new Date(),
      read: false,
    };

    this.broadcastNotification(event, ['admin']);
  }

  /**
   * Emit app approved event
   */
  public emitAppApproved(
    appId: string,
    developerId: string,
    appName: string
  ): void {
    const event: NotificationEvent = {
      id: `app-approved-${Date.now()}`,
      type: 'app_approved',
      userId: developerId,
      title: 'App Approved',
      message: `Your app "${appName}" has been approved and is now available in the marketplace.`,
      data: { appId, appName },
      timestamp: new Date(),
      read: false,
    };

    this.broadcastNotification(event, [developerId]);
  }

  /**
   * Get connected users count
   */
  public getConnectedUsersCount(): number {
    return this.userSockets.size;
  }

  /**
   * Get user socket count
   */
  public getUserSocketCount(userId: string): number {
    return this.userSockets.get(userId)?.size || 0;
  }

  /**
   * Get notification count for user
   */
  public getNotificationCount(userId: string): number {
    return (this.notifications.get(userId) || []).length;
  }

  /**
   * Get unread notification count for user
   */
  public getUnreadNotificationCount(userId: string): number {
    return (this.notifications.get(userId) || []).filter((n) => !n.read).length;
  }

  /**
   * Clear notifications for user
   */
  public clearNotifications(userId: string): void {
    this.notifications.delete(userId);
  }
}

// Export singleton instance
export const wsManager = new WebSocketManager();

