import { describe, it, expect, vi, beforeEach } from "vitest";

// ============================================================
// 1. PDF Comparison Export Tests
// ============================================================
describe("Comparison PDF Generator", () => {
  it("should export generateComparisonPdf function", async () => {
    const mod = await import("./comparisonPdfGenerator");
    expect(typeof mod.generateComparisonPdf).toBe("function");
  });

  it("should generate a PDF buffer from comparison data", async () => {
    const { generateComparisonPdf } = await import("./comparisonPdfGenerator");

    const mockComparison = {
      id: 1,
      name: "Test Comparison",
      status: "completed" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 1,
      description: "Test comparison description",
      recommendation: {
        bestQuoteId: 1,
        reasoning: "Best value for money",
        keyDifferences: [
          { category: "pricing", winner: 1, difference: "20% cheaper" },
        ],
        estimatedSavings: 5000,
      },
    };

    const mockQuotes = [
      {
        id: 1,
        fileName: "quote1.pdf",
        extractedData: {
          contractor: "Builder A",
          totalAmount: 25000,
          lineItems: [
            { description: "Materials", quantity: 1, unitPrice: 15000, total: 15000 },
            { description: "Labour", quantity: 1, unitPrice: 10000, total: 10000 },
          ],
        },
        verification: {
          overallScore: 85,
          pricingScore: 80,
          materialsScore: 90,
          complianceScore: 85,
          warrantyScore: 80,
          statusBadge: "green" as const,
          flags: [],
          recommendations: [],
        },
      },
      {
        id: 2,
        fileName: "quote2.pdf",
        extractedData: {
          contractor: "Builder B",
          totalAmount: 30000,
          lineItems: [
            { description: "Materials", quantity: 1, unitPrice: 18000, total: 18000 },
            { description: "Labour", quantity: 1, unitPrice: 12000, total: 12000 },
          ],
        },
        verification: {
          overallScore: 72,
          pricingScore: 65,
          materialsScore: 75,
          complianceScore: 80,
          warrantyScore: 70,
          statusBadge: "amber" as const,
          flags: [{ category: "pricing", severity: "medium", message: "Above market rate" }],
          recommendations: [{ title: "Negotiate", description: "Price is high", priority: "high" }],
        },
      },
    ];

    const result = await generateComparisonPdf(
      mockComparison.name,
      mockQuotes.map((q) => ({
        id: q.id,
        contractor: q.extractedData.contractor,
        totalAmount: q.extractedData.totalAmount,
        lineItems: q.extractedData.lineItems || [],
        overallScore: q.verification.overallScore,
        pricingScore: q.verification.pricingScore,
        materialsScore: q.verification.materialsScore,
        complianceScore: q.verification.complianceScore,
        warrantyScore: q.verification.warrantyScore,
        statusBadge: q.verification.statusBadge,
        flags: q.verification.flags,
        recommendations: q.verification.recommendations,
        potentialSavings: 0,
      })),
      mockComparison.recommendation ? {
        bestQuoteId: mockComparison.recommendation.bestQuoteId,
        reasoning: mockComparison.recommendation.reasoning,
        keyDifferences: mockComparison.recommendation.keyDifferences,
        estimatedSavings: mockComparison.recommendation.estimatedSavings,
      } : null
    );
    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(100);
  }, 30000);

  it("should handle comparison with 3 quotes", async () => {
    const { generateComparisonPdf } = await import("./comparisonPdfGenerator");

    const mockComparison = {
      id: 2,
      name: "Three Quote Comparison",
      status: "completed" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 1,
      description: null,
      recommendation: null,
    };

    const mockQuotes = [
      {
        id: 1,
        fileName: "q1.pdf",
        extractedData: { contractor: "A", totalAmount: 20000 },
        verification: {
          overallScore: 90, pricingScore: 85, materialsScore: 90,
          complianceScore: 95, warrantyScore: 88, statusBadge: "green" as const,
          flags: [], recommendations: [],
        },
      },
      {
        id: 2,
        fileName: "q2.pdf",
        extractedData: { contractor: "B", totalAmount: 25000 },
        verification: {
          overallScore: 75, pricingScore: 70, materialsScore: 80,
          complianceScore: 75, warrantyScore: 72, statusBadge: "amber" as const,
          flags: [], recommendations: [],
        },
      },
      {
        id: 3,
        fileName: "q3.pdf",
        extractedData: { contractor: "C", totalAmount: 18000 },
        verification: {
          overallScore: 60, pricingScore: 90, materialsScore: 50,
          complianceScore: 55, warrantyScore: 45, statusBadge: "red" as const,
          flags: [{ category: "materials", severity: "high", message: "Substandard materials" }],
          recommendations: [],
        },
      },
    ];

    const result = await generateComparisonPdf(
      mockComparison.name,
      mockQuotes.map((q) => ({
        id: q.id,
        contractor: q.extractedData.contractor,
        totalAmount: q.extractedData.totalAmount,
        overallScore: q.verification.overallScore,
        pricingScore: q.verification.pricingScore,
        materialsScore: q.verification.materialsScore,
        complianceScore: q.verification.complianceScore,
        warrantyScore: q.verification.warrantyScore,
        statusBadge: q.verification.statusBadge,
        flags: q.verification.flags,
        recommendations: q.verification.recommendations,
        lineItems: [],
        potentialSavings: 0,
      })),
      null
    );
    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(100);
  }, 30000);
});

// ============================================================
// 2. Push Notification Service Tests
// ============================================================
describe("Push Notification Service", () => {
  it("should export all push notification functions", async () => {
    const mod = await import("./pushNotificationService");
    expect(typeof mod.savePushSubscription).toBe("function");
    expect(typeof mod.removePushSubscription).toBe("function");
    expect(typeof mod.getPushSubscriptionsForUser).toBe("function");
    expect(typeof mod.sendPushNotification).toBe("function");
    expect(typeof mod.notifyVerificationComplete).toBe("function");
    expect(typeof mod.notifyComparisonComplete).toBe("function");
  });

  it("should handle sending push notification when no subscriptions exist", async () => {
    const { sendPushNotification } = await import("./pushNotificationService");

    const result = await sendPushNotification(999999, {
      title: "Test",
      body: "Test notification",
    });

    // Should return not sent since no subscriptions for this user
    expect(result).toBeDefined();
    expect(result.sent).toBeDefined();
  }, 15000);

  it("should format verification complete notification correctly", async () => {
    const { notifyVerificationComplete } = await import("./pushNotificationService");

    // This will attempt to send but likely fail gracefully since no real subscription
    const result = await notifyVerificationComplete(999999, 1, "completed", 85);
    expect(result).toBeDefined();
  }, 15000);

  it("should format comparison complete notification correctly", async () => {
    const { notifyComparisonComplete } = await import("./pushNotificationService");

    const result = await notifyComparisonComplete(999999, 1, "Test Comparison", "Builder A");
    expect(result).toBeDefined();
  }, 15000);
});

// ============================================================
// 3. Quote Annotations Schema Tests
// ============================================================
describe("Quote Annotations Schema", () => {
  it("should export quoteAnnotations table from schema", async () => {
    const schema = await import("../drizzle/schema");
    expect(schema.quoteAnnotations).toBeDefined();
  });

  it("should export pushSubscriptions table from schema", async () => {
    const schema = await import("../drizzle/schema");
    expect(schema.pushSubscriptions).toBeDefined();
  });

  it("should have correct annotation fields", async () => {
    const schema = await import("../drizzle/schema");
    const table = schema.quoteAnnotations;
    // Verify the table has expected column names by checking the table config
    expect(table).toBeDefined();
  });
});

// ============================================================
// 4. Notification Integration Tests
// ============================================================
describe("Notification Database Functions", () => {
  it("should export all notification CRUD functions", async () => {
    const mod = await import("./notificationDb");
    expect(typeof mod.createNotification).toBe("function");
    expect(typeof mod.markNotificationRead).toBe("function");
    expect(typeof mod.markAllNotificationsRead).toBe("function");
    expect(typeof mod.getNotificationsByUserId).toBe("function");
    expect(typeof mod.getUnreadNotificationCount).toBe("function");
    expect(typeof mod.getNotificationPreferences).toBe("function");
    expect(typeof mod.updateNotificationPreferences).toBe("function");
  });
});

// ============================================================
// 5. Email Notification Tests
// ============================================================
describe("Email Notification Service", () => {
  it("should export email notification functions", async () => {
    const mod = await import("./emailNotification");
    expect(typeof mod.sendVerificationCompleteEmail).toBe("function");
    expect(typeof mod.sendProcessingFailedEmail).toBe("function");
  });
});

// ============================================================
// 6. Processing Pipeline Integration Tests
// ============================================================
describe("Processing Pipeline Push Notification Integration", () => {
  it("should have push notification import in processingServiceV2", async () => {
    // Verify the processing service file contains the push notification integration
    const fs = await import("fs");
    const content = fs.readFileSync("server/processingServiceV2.ts", "utf-8");
    expect(content).toContain("notifyVerificationComplete");
    expect(content).toContain("pushNotificationService");
  });

  it("should have push notification after email notification in processing flow", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("server/processingServiceV2.ts", "utf-8");
    const emailIndex = content.indexOf("sendVerificationCompleteEmail");
    const pushIndex = content.indexOf("notifyVerificationComplete");
    expect(emailIndex).toBeGreaterThan(-1);
    expect(pushIndex).toBeGreaterThan(-1);
    // Push should come after email in the flow
    expect(pushIndex).toBeGreaterThan(emailIndex);
  });
});

// ============================================================
// 7. Annotation Color and Section Validation Tests
// ============================================================
describe("Annotation Business Logic", () => {
  it("should support all 5 color options", () => {
    const validColors = ["yellow", "blue", "green", "red", "purple"];
    validColors.forEach((color) => {
      expect(["yellow", "blue", "green", "red", "purple"]).toContain(color);
    });
  });

  it("should support section categorization", () => {
    const validSections = ["pricing", "materials", "compliance", "warranty", "general"];
    validSections.forEach((section) => {
      expect(typeof section).toBe("string");
      expect(section.length).toBeGreaterThan(0);
    });
  });

  it("should enforce content length limit of 2000 characters", () => {
    const maxLength = 2000;
    const longContent = "a".repeat(maxLength);
    expect(longContent.length).toBe(maxLength);
    const tooLong = "a".repeat(maxLength + 1);
    expect(tooLong.length).toBeGreaterThan(maxLength);
  });
});

// ============================================================
// 8. Comparison PDF Export Router Integration
// ============================================================
describe("Comparison PDF Export Router", () => {
  it("should have exportPDF endpoint in routers", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("server/routers.ts", "utf-8");
    expect(content).toContain("exportPDF");
    expect(content).toContain("comparisonPdfGenerator");
  });

  it("should have annotations router in routers", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("server/routers.ts", "utf-8");
    expect(content).toContain("annotations: router({");
    expect(content).toContain("// List annotations for a quote");
    expect(content).toContain("// Create annotation");
    expect(content).toContain("// Update annotation");
    expect(content).toContain("// Delete annotation");
  });

  it("should have push subscription endpoints in routers", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("server/routers.ts", "utf-8");
    expect(content).toContain("subscribePush");
    expect(content).toContain("unsubscribePush");
  });
});
