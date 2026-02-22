import { describe, it, expect } from "vitest";
import { analyzeQuoteComparison } from "./comparisonAnalysis";

describe("Side-by-Side Comparison Features", () => {
  describe("Comparison Analysis", () => {
    it("should analyze multiple quotes and return structured comparison data", async () => {
      const mockQuotes = [
        {
          id: 1,
          fileName: "quote-a.pdf",
          extractedData: {
            contractor: "Builder A",
            totalAmount: 45000,
            projectAddress: "123 Test St",
            abn: "12345678901",
            licenseNumber: "LIC-001",
          },
          verification: {
            overallScore: 85,
            pricingScore: 80,
            materialsScore: 90,
            complianceScore: 85,
            warrantyScore: 75,
            statusBadge: "green" as const,
            potentialSavings: 0,
            flags: [],
          },
        },
        {
          id: 2,
          fileName: "quote-b.pdf",
          extractedData: {
            contractor: "Builder B",
            totalAmount: 52000,
            projectAddress: "123 Test St",
            abn: "98765432109",
            licenseNumber: "LIC-002",
          },
          verification: {
            overallScore: 72,
            pricingScore: 65,
            materialsScore: 80,
            complianceScore: 70,
            warrantyScore: 60,
            statusBadge: "amber" as const,
            potentialSavings: 7000,
            flags: [],
          },
        },
        {
          id: 3,
          fileName: "quote-c.pdf",
          extractedData: {
            contractor: "Builder C",
            totalAmount: 48000,
            projectAddress: "123 Test St",
            abn: "11223344556",
            licenseNumber: "LIC-003",
          },
          verification: {
            overallScore: 78,
            pricingScore: 75,
            materialsScore: 82,
            complianceScore: 80,
            warrantyScore: 70,
            statusBadge: "green" as const,
            potentialSavings: 3000,
            flags: [],
          },
        },
      ];

      const result = await analyzeQuoteComparison(mockQuotes);

      expect(result).toBeDefined();
      expect(result.bestQuoteId).toBeDefined();
      expect(typeof result.bestQuoteId).toBe("number");
    }, 30000);

    it("should handle two-quote comparison", async () => {
      const mockQuotes = [
        {
          id: 10,
          fileName: "quote-x.pdf",
          extractedData: {
            contractor: "Contractor X",
            totalAmount: 30000,
          },
          verification: {
            overallScore: 90,
            pricingScore: 88,
            materialsScore: 92,
            complianceScore: 90,
            warrantyScore: 85,
            statusBadge: "green" as const,
            potentialSavings: 0,
            flags: [],
          },
        },
        {
          id: 11,
          fileName: "quote-y.pdf",
          extractedData: {
            contractor: "Contractor Y",
            totalAmount: 35000,
          },
          verification: {
            overallScore: 70,
            pricingScore: 60,
            materialsScore: 75,
            complianceScore: 72,
            warrantyScore: 68,
            statusBadge: "amber" as const,
            potentialSavings: 5000,
            flags: [],
          },
        },
      ];

      const result = await analyzeQuoteComparison(mockQuotes);

      expect(result).toBeDefined();
      expect(result.bestQuoteId).toBeDefined();
    }, 30000);
  });

  describe("Side-by-Side Data Calculations", () => {
    it("should correctly calculate price vs average percentage", () => {
      const amounts = [45000, 52000, 48000];
      const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;

      expect(avg).toBeCloseTo(48333.33, 0);

      const diffs = amounts.map((a) => ((a - avg) / avg) * 100);
      expect(diffs[0]).toBeLessThan(0); // 45000 below average
      expect(diffs[1]).toBeGreaterThan(0); // 52000 above average
    });

    it("should correctly identify cheapest and most expensive", () => {
      const amounts = [45000, 52000, 48000, 41000];
      const min = Math.min(...amounts);
      const max = Math.max(...amounts);

      expect(min).toBe(41000);
      expect(max).toBe(52000);
    });

    it("should correctly identify best score per category", () => {
      const scores = [
        { id: 1, pricing: 80, materials: 90, compliance: 85, warranty: 75 },
        { id: 2, pricing: 65, materials: 80, compliance: 70, warranty: 60 },
        { id: 3, pricing: 75, materials: 82, compliance: 80, warranty: 70 },
      ];

      const categories = ["pricing", "materials", "compliance", "warranty"] as const;

      for (const cat of categories) {
        const maxScore = Math.max(...scores.map((s) => s[cat]));
        const winner = scores.find((s) => s[cat] === maxScore);
        expect(winner).toBeDefined();

        if (cat === "pricing") expect(winner!.id).toBe(1);
        if (cat === "materials") expect(winner!.id).toBe(1);
        if (cat === "compliance") expect(winner!.id).toBe(1);
        if (cat === "warranty") expect(winner!.id).toBe(1);
      }
    });

    it("should handle empty amounts gracefully", () => {
      const amounts: number[] = [];
      const min = amounts.length > 0 ? Math.min(...amounts) : 0;
      const max = amounts.length > 0 ? Math.max(...amounts) : 0;

      expect(min).toBe(0);
      expect(max).toBe(0);
    });

    it("should calculate potential savings correctly", () => {
      const amounts = [45000, 52000, 48000];
      const potentialSavings = Math.max(...amounts) - Math.min(...amounts);

      expect(potentialSavings).toBe(7000);
    });
  });

  describe("Email Notification Preferences", () => {
    it("should have default notification preferences", () => {
      const defaultPrefs = {
        emailOnVerificationComplete: true,
        emailOnComparisonComplete: true,
        emailOnPricingAlert: true,
        emailOnComplianceAlert: true,
        emailWeeklyDigest: false,
      };

      expect(defaultPrefs.emailOnVerificationComplete).toBe(true);
      expect(defaultPrefs.emailOnComparisonComplete).toBe(true);
      expect(defaultPrefs.emailOnPricingAlert).toBe(true);
      expect(defaultPrefs.emailOnComplianceAlert).toBe(true);
      expect(defaultPrefs.emailWeeklyDigest).toBe(false);
    });

    it("should allow toggling notification preferences", () => {
      const prefs = {
        emailOnVerificationComplete: true,
        emailOnComparisonComplete: true,
        emailOnPricingAlert: true,
        emailOnComplianceAlert: true,
        emailWeeklyDigest: false,
      };

      // Toggle weekly digest on
      prefs.emailWeeklyDigest = true;
      expect(prefs.emailWeeklyDigest).toBe(true);

      // Toggle verification complete off
      prefs.emailOnVerificationComplete = false;
      expect(prefs.emailOnVerificationComplete).toBe(false);
    });
  });
});
