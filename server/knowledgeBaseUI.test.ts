/**
 * Tests for Knowledge Base Explorer UI and Report Integration
 * 
 * Tests the knowledge base functions that power the Knowledge Base Explorer page
 * and the integration of knowledge base data into verification reports.
 */

import { describe, it, expect } from "vitest";
import {
  getBestPracticesForTrade,
  getSOPsForTrade,
  getCommonDefectsForTrade,
  getQualityBenchmarksForTrade,
  searchBestPractices,
  getWarrantyInfoForTrade,
  TradeType,
} from "./tradeKnowledgeBase";

describe("Knowledge Base Explorer UI Functions", () => {
  describe("getBestPracticesForTrade", () => {
    it("should return best practices for electrical trade", () => {
      const result = getBestPracticesForTrade("electrical");
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      
      // Check structure of first practice
      const practice = result[0];
      expect(practice).toHaveProperty("title");
      expect(practice).toHaveProperty("description");
      expect(practice).toHaveProperty("category");
      expect(practice).toHaveProperty("requirements");
      expect(practice).toHaveProperty("standardReferences");
      expect(Array.isArray(practice.requirements)).toBe(true);
      expect(Array.isArray(practice.standardReferences)).toBe(true);
    });

    it("should return best practices for plumbing trade", () => {
      const result = getBestPracticesForTrade("plumbing");
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it("should return best practices for roofing trade", () => {
      const result = getBestPracticesForTrade("roofing");
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe("getSOPsForTrade", () => {
    it("should return SOPs for electrical trade", () => {
      const result = getSOPsForTrade("electrical");
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      
      // Check structure of first SOP
      const sop = result[0];
      expect(sop).toHaveProperty("title");
      expect(sop).toHaveProperty("purpose");
      expect(sop).toHaveProperty("scope");
      expect(sop).toHaveProperty("steps");
      expect(sop).toHaveProperty("safetyRequirements");
      expect(sop).toHaveProperty("qualityChecks");
      expect(Array.isArray(sop.steps)).toBe(true);
    });

    it("should return SOPs for plumbing trade", () => {
      const result = getSOPsForTrade("plumbing");
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe("getCommonDefectsForTrade", () => {
    it("should return common defects for electrical trade", () => {
      const result = getCommonDefectsForTrade("electrical");
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(typeof result[0]).toBe("string");
    });

    it("should return common defects for plumbing trade", () => {
      const result = getCommonDefectsForTrade("plumbing");
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe("getQualityBenchmarksForTrade", () => {
    it("should return quality benchmarks for electrical trade", () => {
      const result = getQualityBenchmarksForTrade("electrical");
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      
      // Check structure of first benchmark
      const benchmark = result[0];
      expect(benchmark).toHaveProperty("metric");
      expect(benchmark).toHaveProperty("acceptableRange");
      expect(benchmark).toHaveProperty("measurementMethod");
    });

    it("should return quality benchmarks for plumbing trade", () => {
      const result = getQualityBenchmarksForTrade("plumbing");
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe("getWarrantyInfoForTrade", () => {
    it("should return warranty info for electrical trade", () => {
      const result = getWarrantyInfoForTrade("electrical");
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      
      // Check structure of warranty info
      const warranty = result[0];
      expect(warranty).toHaveProperty("minimumPeriod");
      expect(warranty).toHaveProperty("coverage");
      expect(warranty).toHaveProperty("exclusions");
      expect(warranty).toHaveProperty("statutoryRequirements");
      expect(Array.isArray(warranty.coverage)).toBe(true);
      expect(Array.isArray(warranty.exclusions)).toBe(true);
    });

    it("should return warranty info for plumbing trade", () => {
      const result = getWarrantyInfoForTrade("plumbing");
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe("searchBestPractices", () => {
    it("should search across all trades for a keyword", () => {
      const result = searchBestPractices("safety");
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      // Safety is a common term, should find results
      expect(result.length).toBeGreaterThan(0);
    });

    it("should return results with trade, title, and description", () => {
      const result = searchBestPractices("wiring");
      
      if (result.length > 0) {
        const item = result[0];
        expect(item).toHaveProperty("trade");
        expect(item).toHaveProperty("title");
        expect(item).toHaveProperty("description");
      }
    });

    it("should return empty array for non-matching keyword", () => {
      const result = searchBestPractices("xyznonexistent123");
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });

  describe("All supported trades", () => {
    const trades: TradeType[] = [
      "electrical",
      "plumbing", 
      "roofing",
      "building",
      "hvac",
      "painting",
      "tiling",
      "concreting",
      "landscaping",
      "glazing"
    ];

    trades.forEach((trade) => {
      it(`should return data for ${trade} trade`, () => {
        const practices = getBestPracticesForTrade(trade);
        const sops = getSOPsForTrade(trade);
        const defects = getCommonDefectsForTrade(trade);
        const benchmarks = getQualityBenchmarksForTrade(trade);
        const warranties = getWarrantyInfoForTrade(trade);

        // All should return arrays (may be empty for some trades)
        expect(Array.isArray(practices)).toBe(true);
        expect(Array.isArray(sops)).toBe(true);
        expect(Array.isArray(defects)).toBe(true);
        expect(Array.isArray(benchmarks)).toBe(true);
        expect(Array.isArray(warranties)).toBe(true);
      });
    });
  });
});

describe("Knowledge Base Data Quality", () => {
  it("should have Australian Standards references in best practices", () => {
    const practices = getBestPracticesForTrade("electrical");
    
    // Check that at least some practices reference Australian Standards
    const hasStandardRefs = practices.some(p => 
      p.standardReferences.some(ref => 
        ref.includes("AS") || ref.includes("NCC") || ref.includes("HB")
      )
    );
    
    expect(hasStandardRefs).toBe(true);
  });

  it("should have safety requirements in SOPs", () => {
    const sops = getSOPsForTrade("electrical");
    
    // Check that SOPs have safety requirements
    const hasSafetyReqs = sops.some(sop => 
      sop.safetyRequirements && sop.safetyRequirements.length > 0
    );
    
    expect(hasSafetyReqs).toBe(true);
  });

  it("should have quality checks in SOPs", () => {
    const sops = getSOPsForTrade("plumbing");
    
    // Check that SOPs have quality checks
    const hasQualityChecks = sops.some(sop => 
      sop.qualityChecks && sop.qualityChecks.length > 0
    );
    
    expect(hasQualityChecks).toBe(true);
  });

  it("should have measurement methods in quality benchmarks", () => {
    const benchmarks = getQualityBenchmarksForTrade("electrical");
    
    if (benchmarks.length > 0) {
      const hasMeasurementMethods = benchmarks.every(b => 
        b.measurementMethod && b.measurementMethod.length > 0
      );
      
      expect(hasMeasurementMethods).toBe(true);
    }
  });

  it("should have statutory requirements in warranty info", () => {
    const warranties = getWarrantyInfoForTrade("electrical");
    
    if (warranties.length > 0) {
      const hasStatutoryReqs = warranties.some(w => 
        w.statutoryRequirements && w.statutoryRequirements.length > 0
      );
      
      expect(hasStatutoryReqs).toBe(true);
    }
  });
});
