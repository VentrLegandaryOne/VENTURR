import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { notificationPreferences, type InsertNotificationPreference } from "../drizzle/schema";

/**
 * Default notification preferences for new users
 */
export const defaultPreferences = {
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
  quietHoursEnabled: false,
  quietHoursStart: "22:00",
  quietHoursEnd: "08:00",
  quietHoursDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as string[],
};

/**
 * Get notification preferences for a user
 * Creates default preferences if none exist
 */
export async function getNotificationPreferences(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(notificationPreferences)
    .where(eq(notificationPreferences.userId, userId))
    .limit(1);

  if (result.length === 0) {
    // Create default preferences for new user
    await db.insert(notificationPreferences).values({
      userId,
      ...defaultPreferences,
    });

    // Return the newly created preferences
    const newResult = await db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, userId))
      .limit(1);

    return newResult[0];
  }

  return result[0];
}

/**
 * Update notification preferences for a user
 */
export async function updateNotificationPreferences(
  userId: number,
  updates: Partial<{
    emailEnabled: boolean;
    emailDigestFrequency: "instant" | "daily" | "weekly" | "never";
    pushEnabled: boolean;
    categories: {
      verification_complete?: boolean;
      unusual_pricing?: boolean;
      compliance_warning?: boolean;
      comparison_ready?: boolean;
      contractor_review?: boolean;
      system_alert?: boolean;
    };
    quietHoursEnabled: boolean;
    quietHoursStart: string;
    quietHoursEnd: string;
    quietHoursDays: string[];
  }>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Ensure preferences exist
  await getNotificationPreferences(userId);

  // Update preferences
  await db
    .update(notificationPreferences)
    .set(updates)
    .where(eq(notificationPreferences.userId, userId));

  // Return updated preferences
  return getNotificationPreferences(userId);
}

/**
 * Check if a specific notification type is enabled for a user
 */
export async function isNotificationEnabled(
  userId: number,
  notificationType: keyof typeof defaultPreferences.categories
): Promise<boolean> {
  const prefs = await getNotificationPreferences(userId);
  
  if (!prefs.emailEnabled && !prefs.pushEnabled) {
    return false;
  }

  const categories = prefs.categories as typeof defaultPreferences.categories | null;
  if (!categories) {
    return true; // Default to enabled if no categories set
  }

  return categories[notificationType] !== false;
}

/**
 * Get users who have a specific notification type enabled
 * Useful for batch notifications
 */
export async function getUsersWithNotificationEnabled(
  notificationType: keyof typeof defaultPreferences.categories
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const allPrefs = await db.select().from(notificationPreferences);

  return allPrefs.filter((pref) => {
    if (!pref.emailEnabled && !pref.pushEnabled) {
      return false;
    }

    const categories = pref.categories as typeof defaultPreferences.categories | null;
    if (!categories) {
      return true;
    }

    return categories[notificationType] !== false;
  });
}

/**
 * Check if current time is within quiet hours for a user
 */
export async function isInQuietHours(userId: number): Promise<boolean> {
  const prefs = await getNotificationPreferences(userId);
  
  // Check if quiet hours is enabled
  const quietHoursEnabled = (prefs as any).quietHoursEnabled;
  if (!quietHoursEnabled) {
    return false;
  }

  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  
  // Check if current day is in quiet hours days
  const quietHoursDays = ((prefs as any).quietHoursDays as string[]) || defaultPreferences.quietHoursDays;
  if (!quietHoursDays.includes(currentDay)) {
    return false;
  }

  // Parse quiet hours times
  const startTime = (prefs as any).quietHoursStart || defaultPreferences.quietHoursStart;
  const endTime = (prefs as any).quietHoursEnd || defaultPreferences.quietHoursEnd;
  
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  const currentHour = now.getHours();
  const currentMin = now.getMinutes();
  const currentMinutes = currentHour * 60 + currentMin;
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  // Handle overnight quiet hours (e.g., 22:00 - 08:00)
  if (startMinutes > endMinutes) {
    // Quiet hours span midnight
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  } else {
    // Quiet hours within same day
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  }
}

/**
 * Check if notification should be sent (not in quiet hours and type is enabled)
 */
export async function shouldSendNotification(
  userId: number,
  notificationType: keyof typeof defaultPreferences.categories
): Promise<boolean> {
  const isEnabled = await isNotificationEnabled(userId, notificationType);
  if (!isEnabled) return false;

  const inQuietHours = await isInQuietHours(userId);
  return !inQuietHours;
}
