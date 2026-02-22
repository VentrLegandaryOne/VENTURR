/**
 * Tests for Validation Rules
 * Based on real Thomco Roofing quote analysis
 */

import { describe, it, expect } from "vitest";
import {
  calculatePricingScore,
  calculateComplianceScore,
  calculateWarrantyScore,
  calculateTransparencyScore,
  checkMaterialCompleteness,
  detectProjectType,
  extractWarrantyYears,
  MARKET_RATES_2024,
  WARRANTY_BENCHMARKS
} from "./validationRules";

describe("Pricing Validation", () => {
  it("should score acceptable pricing within market range", () => {
    // QU0156: $100/lm guttering is within $55-$160 range
    const result = calculatePricingScore(2000, 20, "lm", "guttering");
    expect(result.status).toBe("acceptable");
    expect(result.score).toBeGreaterThan(70);
  });

  it("should flag significantly overpriced quotes", () => {
    // QU0163: $170.50/lm is 127% above typical
    const result = calculatePricingScore(3410, 20, "lm", "guttering");
    expect(result.status).toBe("critical");
    expect(result.variance).toBeGreaterThan(50);
    expect(result.score).toBeLessThan(50);
  });

  it("should flag moderately overpriced quotes for review", () => {
    // Test with 18% above market (within review threshold 15-20%)
    // $118/lm when typical is $100/lm = 18% variance
    const result = calculatePricingScore(2360, 20, "lm", "guttering");
    expect(result.status).toBe("review");
    expect(result.variance).toBeGreaterThan(15);
    expect(result.variance).toBeLessThan(20);
  });

  it("should flag suspiciously low pricing", () => {
    // 50% below market rate
    const result = calculatePricingScore(1000, 20, "lm", "guttering");
    expect(result.status).toBe("suspicious");
    expect(result.message).toContain("quality concerns");
  });

  it("should handle unknown item types gracefully", () => {
    const result = calculatePricingScore(5000, 10, "each", "unknownType" as any);
    expect(result.status).toBe("unknown");
    expect(result.score).toBe(50);
  });
});

describe("Compliance Validation", () => {
  it("should identify missing NCC 2022 reference", () => {
    // Based on Thomco analysis: 0% of quotes referenced NCC 2022
    const result = calculateComplianceScore(
      ["HB 39:2015", "AS/NZS 1562.1"],
      "metal-roofing"
    );
    expect(result.missingMandatory).toContain("NCC 2022");
  });

  it("should score quotes with all mandatory references highly", () => {
    const result = calculateComplianceScore(
      ["NCC 2022", "HB 39:2015", "SafeWork NSW", "AS 1397"],
      "metal-roofing"
    );
    expect(result.missingMandatory).toHaveLength(0);
    expect(result.score).toBeGreaterThan(70);
  });

  it("should handle guttering-specific compliance", () => {
    const result = calculateComplianceScore(
      ["NCC 2022", "SafeWork NSW", "AS/NZS 3500.3"],
      "guttering"
    );
    expect(result.score).toBeGreaterThan(50);
  });

  it("should identify all missing standards", () => {
    const result = calculateComplianceScore([], "metal-roofing");
    expect(result.missingMandatory.length).toBeGreaterThan(0);
    expect(result.score).toBe(0);
  });
});

describe("Warranty Validation", () => {
  it("should flag below-standard workmanship warranty", () => {
    // QU0156 and QU0173: 5 years workmanship
    const result = calculateWarrantyScore(5, 10);
    expect(result.workmanshipStatus).toBe("below-standard");
    expect(result.score).toBeLessThan(50);
  });

  it("should recognize standard warranty terms", () => {
    // QU0163, QU0166: 10 years workmanship
    const result = calculateWarrantyScore(10, 20);
    expect(result.workmanshipStatus).toBe("standard");
    expect(result.materialsStatus).toBe("standard");
    expect(result.score).toBeGreaterThanOrEqual(80);
  });

  it("should handle missing warranty specifications", () => {
    // QU0173: Materials warranty not specified
    const result = calculateWarrantyScore(5, null);
    expect(result.materialsStatus).toBe("not-specified");
    expect(result.message).toContain("below industry standard");
  });

  it("should score premium warranties highly", () => {
    const result = calculateWarrantyScore(15, 25);
    expect(result.workmanshipStatus).toBe("premium");
    expect(result.materialsStatus).toBe("premium");
    expect(result.score).toBe(100);
  });
});

describe("Transparency Scoring", () => {
  it("should penalize lump sum quotes", () => {
    // QU0163, QU0173: Single line item
    const result = calculateTransparencyScore(1, false, false, false);
    expect(result.level).toBe("opaque");
    expect(result.score).toBeLessThan(20);
  });

  it("should reward detailed breakdowns", () => {
    // QU0166: 8 line items
    const result = calculateTransparencyScore(8, true, true, true);
    expect(result.level).toBe("comprehensive");
    expect(result.score).toBeGreaterThan(80);
  });

  it("should score partial breakdowns appropriately", () => {
    const result = calculateTransparencyScore(4, true, false, true);
    expect(result.level).toBe("detailed");
    expect(result.score).toBeGreaterThan(50);
  });
});

describe("Material Completeness", () => {
  it("should identify missing Colorbond specifications", () => {
    const result = checkMaterialCompleteness([
      {
        name: "Colorbond Steel",
        specs: { color: "Deep Ocean" } // Missing profile and BMT
      }
    ]);
    expect(result.missingSpecs.length).toBeGreaterThan(0);
    expect(result.missingSpecs[0].missing).toContain("profile");
    expect(result.missingSpecs[0].missing).toContain("bmt");
  });

  it("should accept complete material specifications", () => {
    const result = checkMaterialCompleteness([
      {
        name: "Colorbond Ultra",
        specs: { profile: "Trimdek", color: "Deep Ocean", bmt: 0.55 }
      }
    ]);
    expect(result.missingSpecs).toHaveLength(0);
    expect(result.score).toBe(100);
  });

  it("should check fixing specifications", () => {
    const result = checkMaterialCompleteness([
      {
        name: "Roof Screws",
        specs: { material: "Stainless Steel" } // Missing class
      }
    ]);
    expect(result.missingSpecs[0].missing).toContain("class");
  });
});

describe("Project Type Detection", () => {
  it("should detect metal roofing projects", () => {
    expect(detectProjectType("Full re-roof with Colorbond")).toBe("metal-roofing");
    expect(detectProjectType("New roof installation")).toBe("metal-roofing");
  });

  it("should detect guttering projects", () => {
    expect(detectProjectType("Gutter replacement")).toBe("guttering");
    expect(detectProjectType("New downpipes and fascia")).toBe("guttering");
  });

  it("should detect repair projects", () => {
    expect(detectProjectType("Roof repair and re-screw")).toBe("repairs");
    expect(detectProjectType("Fix leaking roof")).toBe("repairs");
  });

  it("should default to general for ambiguous projects", () => {
    expect(detectProjectType("Building maintenance")).toBe("general");
  });
});

describe("Warranty Year Extraction", () => {
  it("should extract warranty years from various formats", () => {
    expect(extractWarrantyYears("10 year warranty")).toBe(10);
    expect(extractWarrantyYears("warranty of 5 years")).toBe(5);
    expect(extractWarrantyYears("15 yrs guarantee")).toBe(15);
    expect(extractWarrantyYears("Warranty: 7 years")).toBe(7);
  });

  it("should return null when no warranty found", () => {
    expect(extractWarrantyYears("No warranty mentioned")).toBeNull();
    expect(extractWarrantyYears("")).toBeNull();
  });
});

describe("Market Rates Data", () => {
  it("should have valid market rate ranges", () => {
    for (const [key, rates] of Object.entries(MARKET_RATES_2024)) {
      expect(rates.min).toBeLessThan(rates.max);
      expect(rates.typical).toBeGreaterThanOrEqual(rates.min);
      expect(rates.typical).toBeLessThanOrEqual(rates.max);
      expect(rates.unit).toBeTruthy();
    }
  });

  it("should have realistic Sydney metro rates", () => {
    // Based on Thomco analysis
    expect(MARKET_RATES_2024.guttering.typical).toBe(100);
    expect(MARKET_RATES_2024.guttering.max).toBe(160);
    expect(MARKET_RATES_2024.laborRate.typical).toBe(80);
  });
});

describe("Warranty Benchmarks", () => {
  it("should have logical warranty thresholds", () => {
    expect(WARRANTY_BENCHMARKS.workmanship.belowStandard)
      .toBeLessThan(WARRANTY_BENCHMARKS.workmanship.minimum);
    expect(WARRANTY_BENCHMARKS.workmanship.minimum)
      .toBeLessThan(WARRANTY_BENCHMARKS.workmanship.standard);
    expect(WARRANTY_BENCHMARKS.workmanship.standard)
      .toBeLessThan(WARRANTY_BENCHMARKS.workmanship.premium);
  });
});
