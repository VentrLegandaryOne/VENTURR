import { getDb } from "./db";
import { notifications, notificationPreferences } from "../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

export type NotificationType = "verification_complete" | "unusual_pricing" | "compliance_warning" | "comparison_ready" | "contractor_review" | "system_alert";

/**
 * Create a new notification
 */
export async function createNotification(data: {
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, any>;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");

  const result = await db.insert(notifications).values({
    userId: data.userId,
    type: data.type,
    title: data.title,
    message: data.message,
    actionUrl: data.link || null,
    metadata: data.metadata || null,
    isRead: false,
  });

  return result;
}

/**
 * Mark notification as read
 */
export async function markNotificationRead(notificationId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");

  await db
    .update(notifications)
    .set({ isRead: true, readAt: new Date() })
    .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)));

  return { success: true };
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsRead(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");

  await db
    .update(notifications)
    .set({ isRead: true, readAt: new Date() })
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));

  return { success: true };
}

/**
 * Get all notifications for a user
 */
export async function getNotificationsByUserId(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");

  const results = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);

  return results;
}

/**
 * Get unread notification count
 */
export async function getUnreadNotificationCount(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");

  const results = await db
    .select()
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));

  return results.length;
}

/**
 * Get notification preferences for a user
 */
export async function getNotificationPreferences(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");

  const results = await db
    .select()
    .from(notificationPreferences)
    .where(eq(notificationPreferences.userId, userId))
    .limit(1);

  if (results.length === 0) {
    // Create default preferences
    const defaultPrefs = {
      userId,
      emailEnabled: true,
      emailDigestFrequency: "instant" as const,
      pushEnabled: false,
      categories: {
        verification_complete: true,
        unusual_pricing: true,
        compliance_warning: true,
        comparison_ready: true,
        contractor_review: true,
        system_alert: true,
      },
    };

    await db.insert(notificationPreferences).values(defaultPrefs);
    return defaultPrefs;
  }

  return results[0];
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferences(
  userId: number,
  preferences: {
    emailEnabled?: boolean;
    emailDigestFrequency?: "instant" | "daily" | "weekly" | "never";
    pushEnabled?: boolean;
    categories?: {
      verification_complete?: boolean;
      unusual_pricing?: boolean;
      compliance_warning?: boolean;
      comparison_ready?: boolean;
      contractor_review?: boolean;
      system_alert?: boolean;
    };
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");

  const updateData: any = {};
  
  if (preferences.emailEnabled !== undefined) {
    updateData.emailEnabled = preferences.emailEnabled;
  }
  
  if (preferences.emailDigestFrequency !== undefined) {
    updateData.emailDigestFrequency = preferences.emailDigestFrequency;
  }
  
  if (preferences.pushEnabled !== undefined) {
    updateData.pushEnabled = preferences.pushEnabled;
  }
  
  if (preferences.categories) {
    updateData.categories = preferences.categories;
  }

  await db
    .update(notificationPreferences)
    .set(updateData)
    .where(eq(notificationPreferences.userId, userId));

  return { success: true };
}

/**
 * Delete old notifications (older than 30 days)
 */
export async function deleteOldNotifications() {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  await db
    .delete(notifications)
    .where(eq(notifications.createdAt, thirtyDaysAgo));

  return { success: true };
}
