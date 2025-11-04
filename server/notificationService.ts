import { getDb } from './db';
import { sendCommentNotification, sendMentionNotification } from './emailService';

export interface Notification {
  id: string;
  userId: string;
  type: 'comment' | 'mention' | 'project_update' | 'quote_sent' | 'system';
  title: string;
  message: string;
  resourceType?: string;
  resourceId?: string;
  isRead: boolean;
  createdAt: Date;
}

export async function createNotification(
  userId: string,
  type: Notification['type'],
  title: string,
  message: string,
  resourceType?: string,
  resourceId?: string
): Promise<Notification | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const notification: Notification = {
      id: crypto.randomUUID(),
      userId,
      type,
      title,
      message,
      resourceType,
      resourceId,
      isRead: false,
      createdAt: new Date(),
    };

    // Store in database
    await db.insert(notificationsTable).values(notification);

    // Send email for important notifications
    if (type === 'mention' || type === 'comment') {
      const user = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, userId),
      });

      if (user?.email) {
        if (type === 'mention') {
          await sendMentionNotification(
            user.email,
            user.name || 'User',
            'Someone',
            resourceType || 'resource',
            resourceId || '',
            message
          );
        }
      }
    }

    return notification;
  } catch (error) {
    console.error('[Notification] Failed to create:', error);
    return null;
  }
}

export async function getNotifications(
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<Notification[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.query.notifications.findMany({
      where: (notifications, { eq }) => eq(notifications.userId, userId),
      limit,
      offset,
      orderBy: (notifications, { desc }) => [desc(notifications.createdAt)],
    });
  } catch (error) {
    console.error('[Notification] Failed to fetch:', error);
    return [];
  }
}

export async function markAsRead(notificationId: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.update(notificationsTable)
      .set({ isRead: true })
      .where(eq(notificationsTable.id, notificationId));
    return true;
  } catch (error) {
    console.error('[Notification] Failed to mark as read:', error);
    return false;
  }
}

export async function markAllAsRead(userId: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.update(notificationsTable)
      .set({ isRead: true })
      .where(eq(notificationsTable.userId, userId));
    return true;
  } catch (error) {
    console.error('[Notification] Failed to mark all as read:', error);
    return false;
  }
}

export async function deleteNotification(notificationId: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.delete(notificationsTable)
      .where(eq(notificationsTable.id, notificationId));
    return true;
  } catch (error) {
    console.error('[Notification] Failed to delete:', error);
    return false;
  }
}

export async function getUnreadCount(userId: string): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  try {
    const result = await db.query.notifications.findMany({
      where: (notifications, { and, eq }) =>
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        ),
    });
    return result.length;
  } catch (error) {
    console.error('[Notification] Failed to get unread count:', error);
    return 0;
  }
}
