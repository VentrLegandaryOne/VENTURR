import { getDb } from "./db";
import { pushSubscriptions } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

/**
 * Save a push subscription for a user
 */
export async function savePushSubscription(
  userId: number,
  subscription: {
    endpoint: string;
    keys: { p256dh: string; auth: string };
  },
  userAgent?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if this endpoint already exists for this user
  const existing = await db
    .select()
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.userId, userId));

  // Remove old subscriptions for this user (one active subscription per user)
  if (existing.length > 0) {
    await db
      .delete(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, userId));
  }

  // Insert new subscription
  await db.insert(pushSubscriptions).values({
    userId,
    endpoint: subscription.endpoint,
    p256dh: subscription.keys.p256dh,
    auth: subscription.keys.auth,
    userAgent: userAgent || null,
  });

  return { success: true };
}

/**
 * Remove a push subscription for a user
 */
export async function removePushSubscription(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .delete(pushSubscriptions)
    .where(eq(pushSubscriptions.userId, userId));

  return { success: true };
}

/**
 * Get push subscriptions for a user
 */
export async function getPushSubscriptionsForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.userId, userId));
}

/**
 * Send a push notification to a user via their stored subscriptions.
 * Uses the built-in notification API as a relay since we don't have VAPID keys.
 * Falls back to in-app notification creation.
 */
export async function sendPushNotification(
  userId: number,
  payload: {
    title: string;
    body: string;
    url?: string;
    tag?: string;
    icon?: string;
  }
) {
  const subscriptions = await getPushSubscriptionsForUser(userId);

  if (subscriptions.length === 0) {
    return { sent: false, reason: "no_subscriptions" };
  }

  // Since we can't send web push without VAPID keys in this environment,
  // we create an in-app notification that the frontend polls for.
  // The frontend service worker will show a browser notification when
  // it detects new unread notifications via polling.
  try {
    const { createNotification } = await import("./notificationDb");
    await createNotification({
      userId,
      type: "system_alert",
      title: payload.title,
      message: payload.body,
      link: payload.url,
      metadata: {
        isPush: true,
        tag: payload.tag,
      },
    });
    return { sent: true, method: "in_app_with_poll" };
  } catch (error) {
    console.error("[Push] Failed to create notification:", error);
    return { sent: false, reason: "creation_failed" };
  }
}

/**
 * Send push notification to a user when their quote verification completes
 */
export async function notifyVerificationComplete(
  userId: number,
  quoteId: number,
  status: "completed" | "failed",
  overallScore?: number
) {
  const title = status === "completed"
    ? "Quote Verification Complete"
    : "Quote Verification Failed";

  const body = status === "completed"
    ? `Your quote has been verified with a score of ${overallScore || 0}/100. View your detailed report now.`
    : "There was an issue verifying your quote. Please try uploading again.";

  return await sendPushNotification(userId, {
    title,
    body,
    url: `/report/${quoteId}`,
    tag: `verification-${quoteId}`,
  });
}

/**
 * Send push notification when comparison analysis completes
 */
export async function notifyComparisonComplete(
  userId: number,
  comparisonId: number,
  comparisonName: string,
  bestContractor?: string
) {
  const body = bestContractor
    ? `Analysis complete for "${comparisonName}". ${bestContractor} is the recommended choice.`
    : `Analysis complete for "${comparisonName}". View the detailed comparison now.`;

  return await sendPushNotification(userId, {
    title: "Comparison Analysis Ready",
    body,
    url: `/comparison/${comparisonId}`,
    tag: `comparison-${comparisonId}`,
  });
}
