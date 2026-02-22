import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "./db";
import { notificationPreferences, users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  isNotificationEnabled,
  defaultPreferences,
} from "./notificationPreferencesDb";

describe("Notification Preferences", () => {
  let testUserId: number;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Create a test user
    await db.insert(users).values({
      openId: `test-notif-prefs-${Date.now()}`,
      name: "Test Notification User",
      email: "test-notif@example.com",
      loginMethod: "test",
    });

    // Get the test user ID
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, "test-notif@example.com"))
      .limit(1);
    testUserId = result[0].id;
  });

  afterAll(async () => {
    const db = await getDb();
    if (!db) return;

    // Clean up test data
    await db.delete(notificationPreferences).where(eq(notificationPreferences.userId, testUserId));
    await db.delete(users).where(eq(users.id, testUserId));
  });

  it("should create default preferences for new user", async () => {
    const prefs = await getNotificationPreferences(testUserId);

    expect(prefs).toBeDefined();
    expect(prefs.userId).toBe(testUserId);
    expect(prefs.emailEnabled).toBe(true);
    expect(prefs.emailDigestFrequency).toBe("instant");
    expect(prefs.pushEnabled).toBe(false);
  });

  it("should update email preferences", async () => {
    const updated = await updateNotificationPreferences(testUserId, {
      emailEnabled: false,
      emailDigestFrequency: "daily",
    });

    expect(updated.emailEnabled).toBe(false);
    expect(updated.emailDigestFrequency).toBe("daily");
  });

  it("should update push preferences", async () => {
    const updated = await updateNotificationPreferences(testUserId, {
      pushEnabled: true,
    });

    expect(updated.pushEnabled).toBe(true);
  });

  it("should update category preferences", async () => {
    const updated = await updateNotificationPreferences(testUserId, {
      categories: {
        verification_complete: true,
        unusual_pricing: false,
        compliance_warning: true,
        comparison_ready: false,
        contractor_review: true,
        system_alert: false,
      },
    });

    const categories = updated.categories as typeof defaultPreferences.categories;
    expect(categories?.unusual_pricing).toBe(false);
    expect(categories?.system_alert).toBe(false);
    expect(categories?.verification_complete).toBe(true);
  });

  it("should check if notification type is enabled", async () => {
    // First enable email notifications
    await updateNotificationPreferences(testUserId, {
      emailEnabled: true,
      categories: {
        verification_complete: true,
        unusual_pricing: false,
      },
    });

    const verificationEnabled = await isNotificationEnabled(testUserId, "verification_complete");
    const pricingEnabled = await isNotificationEnabled(testUserId, "unusual_pricing");

    expect(verificationEnabled).toBe(true);
    expect(pricingEnabled).toBe(false);
  });

  it("should return false when all delivery methods are disabled", async () => {
    await updateNotificationPreferences(testUserId, {
      emailEnabled: false,
      pushEnabled: false,
    });

    const isEnabled = await isNotificationEnabled(testUserId, "verification_complete");
    expect(isEnabled).toBe(false);
  });
});
