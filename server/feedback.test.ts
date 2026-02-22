/**
 * Feedback System Tests
 * Tests for beta feedback collection functionality
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "./db";
import { feedback } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import {
  createFeedback,
  getFeedbackById,
  getFeedbackByUserId,
  getAllFeedback,
  updateFeedbackStatus,
  getFeedbackStats,
  deleteFeedback,
} from "./feedbackDb";

describe("Feedback System", () => {
  let testFeedbackId: number;
  const testUserId = 999999; // Test user ID

  beforeAll(async () => {
    // Clean up any existing test feedback
    const db = await getDb();
    if (db) {
      await db.delete(feedback).where(eq(feedback.userId, testUserId));
    }
  });

  afterAll(async () => {
    // Clean up test feedback
    const db = await getDb();
    if (db) {
      await db.delete(feedback).where(eq(feedback.userId, testUserId));
    }
  });

  describe("createFeedback", () => {
    it("should create a new feedback entry", async () => {
      const result = await createFeedback({
        userId: testUserId,
        type: "bug",
        category: "quote_upload",
        title: "Test Bug Report",
        description: "This is a test bug report for the feedback system.",
        rating: 4,
        pageUrl: "/upload",
        screenSize: "1920x1080",
      });

      expect(result).toBeDefined();
      expect(result.id).toBeGreaterThan(0);
      expect(result.type).toBe("bug");
      expect(result.category).toBe("quote_upload");
      expect(result.title).toBe("Test Bug Report");
      expect(result.rating).toBe(4);
      expect(result.status).toBe("new");

      testFeedbackId = result.id;
    });

    it("should create feedback without optional fields", async () => {
      const result = await createFeedback({
        userId: testUserId,
        type: "feature",
        category: "dashboard",
        title: "Feature Request",
        description: "A feature request without optional fields.",
      });

      expect(result).toBeDefined();
      expect(result.rating).toBeNull();
      expect(result.pageUrl).toBeNull();
    });

    it("should create feedback with all feedback types", async () => {
      const types = ["bug", "feature", "improvement", "general", "praise"] as const;
      
      for (const type of types) {
        const result = await createFeedback({
          userId: testUserId,
          type,
          category: "other",
          title: `Test ${type}`,
          description: `Testing ${type} feedback type.`,
        });
        
        expect(result.type).toBe(type);
      }
    });
  });

  describe("getFeedbackById", () => {
    it("should retrieve feedback by ID", async () => {
      const result = await getFeedbackById(testFeedbackId);

      expect(result).toBeDefined();
      expect(result?.id).toBe(testFeedbackId);
      expect(result?.title).toBe("Test Bug Report");
    });

    it("should return null for non-existent ID", async () => {
      const result = await getFeedbackById(999999999);
      expect(result).toBeNull();
    });
  });

  describe("getFeedbackByUserId", () => {
    it("should retrieve all feedback for a user", async () => {
      const results = await getFeedbackByUserId(testUserId);

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      
      // All results should belong to the test user
      results.forEach((fb) => {
        expect(fb.userId).toBe(testUserId);
      });
    });

    it("should return empty array for user with no feedback", async () => {
      const results = await getFeedbackByUserId(888888888);
      expect(results).toEqual([]);
    });
  });

  describe("getAllFeedback", () => {
    it("should retrieve all feedback with pagination", async () => {
      const result = await getAllFeedback({ limit: 10, offset: 0 });

      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      expect(result.total).toBeGreaterThan(0);
      expect(Array.isArray(result.items)).toBe(true);
    });

    it("should filter by status", async () => {
      const result = await getAllFeedback({ status: "new" });

      expect(result.items.every((fb) => fb.status === "new")).toBe(true);
    });

    it("should filter by type", async () => {
      const result = await getAllFeedback({ type: "bug" });

      expect(result.items.every((fb) => fb.type === "bug")).toBe(true);
    });

    it("should filter by category", async () => {
      const result = await getAllFeedback({ category: "quote_upload" });

      expect(result.items.every((fb) => fb.category === "quote_upload")).toBe(true);
    });
  });

  describe("updateFeedbackStatus", () => {
    it("should update feedback status", async () => {
      const result = await updateFeedbackStatus(
        testFeedbackId,
        "reviewing",
        "Looking into this issue"
      );

      expect(result).toBeDefined();
      expect(result?.status).toBe("reviewing");
      expect(result?.adminNotes).toBe("Looking into this issue");
    });

    it("should set resolvedAt when marking as resolved", async () => {
      const result = await updateFeedbackStatus(
        testFeedbackId,
        "resolved",
        "Issue has been fixed",
        1 // admin user id
      );

      expect(result).toBeDefined();
      expect(result?.status).toBe("resolved");
      expect(result?.resolvedAt).toBeDefined();
      expect(result?.resolvedBy).toBe(1);
    });
  });

  describe("getFeedbackStats", () => {
    it("should return feedback statistics", async () => {
      const stats = await getFeedbackStats();

      expect(stats).toBeDefined();
      expect(stats.total).toBeGreaterThan(0);
      expect(stats.byStatus).toBeDefined();
      expect(stats.byType).toBeDefined();
      expect(stats.byCategory).toBeDefined();
      
      // Verify all status keys exist
      expect(stats.byStatus).toHaveProperty("new");
      expect(stats.byStatus).toHaveProperty("reviewing");
      expect(stats.byStatus).toHaveProperty("in_progress");
      expect(stats.byStatus).toHaveProperty("resolved");
      expect(stats.byStatus).toHaveProperty("wont_fix");
      
      // Verify all type keys exist
      expect(stats.byType).toHaveProperty("bug");
      expect(stats.byType).toHaveProperty("feature");
      expect(stats.byType).toHaveProperty("improvement");
      expect(stats.byType).toHaveProperty("general");
      expect(stats.byType).toHaveProperty("praise");
    });
  });

  describe("deleteFeedback", () => {
    it("should delete feedback", async () => {
      // Create a feedback to delete
      const created = await createFeedback({
        userId: testUserId,
        type: "general",
        category: "other",
        title: "To be deleted",
        description: "This feedback will be deleted.",
      });

      const result = await deleteFeedback(created.id);
      expect(result).toBe(true);

      // Verify it's deleted
      const deleted = await getFeedbackById(created.id);
      expect(deleted).toBeNull();
    });

    it("should return false for non-existent feedback", async () => {
      const result = await deleteFeedback(999999999);
      expect(result).toBe(false);
    });
  });
});
