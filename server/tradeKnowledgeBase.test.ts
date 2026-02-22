/**
 * Trade Knowledge Base Tests
 * Tests the comprehensive trade industry knowledge base functionality
 */

import { describe, it, expect } from "vitest";
import {
  getBestPracticesForTrade,
  getSOPsForTrade,
  getCommonDefectsForTrade,
  getQualityBenchmarksForTrade,
  searchBestPractices,
  getWarrantyInfoForTrade,
  TRADE_KNOWLEDGE_BASE,
  ELECTRICAL_BEST_PRACTICES,
  PLUMBING_BEST_PRACTICES,
  ROOFING_BEST_PRACTICES,
  BUILDING_BEST_PRACTICES,
  INDUSTRY_SOPS,
  TradeType,
} from "./tradeKnowledgeBase";

describe("Trade Knowledge Base", () => {
  describe("getBestPracticesForTrade", () => {
    it("should return electrical best practices", () => {
      const practices = getBestPracticesForTrade("electrical");
      expect(practices.length).toBeGreaterThan(0);
      expect(practices[0].trade).toBe("electrical");
      expect(practices[0].standardReferences).toBeDefined();
      expect(practices[0].standardReferences.length).toBeGreaterThan(0);
    });

    it("should return plumbing best practices", () => {
      const practices = getBestPracticesForTrade("plumbing");
      expect(practices.length).toBeGreaterThan(0);
      expect(practices[0].trade).toBe("plumbing");
    });

    it("should return roofing best practices", () => {
      const practices = getBestPracticesForTrade("roofing");
      expect(practices.length).toBeGreaterThan(0);
      expect(practices[0].trade).toBe("roofing");
    });

    it("should return building best practices", () => {
      const practices = getBestPracticesForTrade("building");
      expect(practices.length).toBeGreaterThan(0);
      expect(practices[0].trade).toBe("building");
    });

    it("should return empty array for non-existent trade", () => {
      const practices = getBestPracticesForTrade("nonexistent" as TradeType);
      expect(practices).toEqual([]);
    });
  });

  describe("getSOPsForTrade", () => {
    it("should return electrical SOPs", () => {
      const sops = getSOPsForTrade("electrical");
      expect(sops.length).toBeGreaterThan(0);
      expect(sops[0].trade).toBe("electrical");
      expect(sops[0].steps).toBeDefined();
      expect(sops[0].steps.length).toBeGreaterThan(0);
    });

    it("should return plumbing SOPs", () => {
      const sops = getSOPsForTrade("plumbing");
      expect(sops.length).toBeGreaterThan(0);
      expect(sops[0].trade).toBe("plumbing");
    });

    it("should return roofing SOPs", () => {
      const sops = getSOPsForTrade("roofing");
      expect(sops.length).toBeGreaterThan(0);
      expect(sops[0].trade).toBe("roofing");
    });

    it("should have valid SOP structure", () => {
      const sops = getSOPsForTrade("electrical");
      const sop = sops[0];
      expect(sop.id).toBeDefined();
      expect(sop.title).toBeDefined();
      expect(sop.purpose).toBeDefined();
      expect(sop.scope).toBeDefined();
      expect(sop.safetyRequirements).toBeDefined();
      expect(sop.qualityChecks).toBeDefined();
      expect(sop.documentation).toBeDefined();
    });
  });

  describe("getCommonDefectsForTrade", () => {
    it("should return common defects for electrical trade", () => {
      const defects = getCommonDefectsForTrade("electrical");
      expect(defects.length).toBeGreaterThan(0);
      expect(typeof defects[0]).toBe("string");
    });

    it("should return common defects for plumbing trade", () => {
      const defects = getCommonDefectsForTrade("plumbing");
      expect(defects.length).toBeGreaterThan(0);
    });

    it("should return common defects for roofing trade", () => {
      const defects = getCommonDefectsForTrade("roofing");
      expect(defects.length).toBeGreaterThan(0);
    });
  });

  describe("getQualityBenchmarksForTrade", () => {
    it("should return quality benchmarks for electrical trade", () => {
      const benchmarks = getQualityBenchmarksForTrade("electrical");
      expect(benchmarks.length).toBeGreaterThan(0);
      expect(benchmarks[0].metric).toBeDefined();
      expect(benchmarks[0].acceptableRange).toBeDefined();
      expect(benchmarks[0].measurementMethod).toBeDefined();
    });

    it("should return quality benchmarks for plumbing trade", () => {
      const benchmarks = getQualityBenchmarksForTrade("plumbing");
      expect(benchmarks.length).toBeGreaterThan(0);
    });

    it("should return quality benchmarks for roofing trade", () => {
      const benchmarks = getQualityBenchmarksForTrade("roofing");
      expect(benchmarks.length).toBeGreaterThan(0);
    });
  });

  describe("searchBestPractices", () => {
    it("should find practices containing 'RCD'", () => {
      const results = searchBestPractices("RCD");
      expect(results.length).toBeGreaterThan(0);
      // RCD is an electrical term
      expect(results.some(r => r.trade === "electrical")).toBe(true);
    });

    it("should find practices containing 'hot water'", () => {
      const results = searchBestPractices("hot water");
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.trade === "plumbing")).toBe(true);
    });

    it("should find practices containing 'Colorbond'", () => {
      const results = searchBestPractices("Colorbond");
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.trade === "roofing")).toBe(true);
    });

    it("should find practices by standard reference", () => {
      const results = searchBestPractices("AS/NZS 3000");
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.trade === "electrical")).toBe(true);
    });

    it("should return empty array for non-matching keyword", () => {
      const results = searchBestPractices("xyznonexistent123");
      expect(results).toEqual([]);
    });
  });

  describe("getWarrantyInfoForTrade", () => {
    it("should return warranty info for electrical trade", () => {
      const warranties = getWarrantyInfoForTrade("electrical");
      expect(warranties.length).toBeGreaterThan(0);
      expect(warranties[0].minimumPeriod).toBeDefined();
      expect(warranties[0].coverage).toBeDefined();
      expect(warranties[0].exclusions).toBeDefined();
    });

    it("should return warranty info for plumbing trade", () => {
      const warranties = getWarrantyInfoForTrade("plumbing");
      expect(warranties.length).toBeGreaterThan(0);
    });

    it("should return warranty info for roofing trade", () => {
      const warranties = getWarrantyInfoForTrade("roofing");
      expect(warranties.length).toBeGreaterThan(0);
    });

    it("should include statutory requirements", () => {
      const warranties = getWarrantyInfoForTrade("electrical");
      expect(warranties[0].statutoryRequirements).toBeDefined();
      expect(warranties[0].statutoryRequirements.length).toBeGreaterThan(0);
    });
  });

  describe("TRADE_KNOWLEDGE_BASE", () => {
    it("should have all major trades defined", () => {
      expect(TRADE_KNOWLEDGE_BASE.electrical).toBeDefined();
      expect(TRADE_KNOWLEDGE_BASE.plumbing).toBeDefined();
      expect(TRADE_KNOWLEDGE_BASE.roofing).toBeDefined();
      expect(TRADE_KNOWLEDGE_BASE.building).toBeDefined();
      expect(TRADE_KNOWLEDGE_BASE.hvac).toBeDefined();
      expect(TRADE_KNOWLEDGE_BASE.painting).toBeDefined();
      expect(TRADE_KNOWLEDGE_BASE.tiling).toBeDefined();
      expect(TRADE_KNOWLEDGE_BASE.concreting).toBeDefined();
      expect(TRADE_KNOWLEDGE_BASE.landscaping).toBeDefined();
    });

    it("should have best practices for each trade", () => {
      Object.values(TRADE_KNOWLEDGE_BASE).forEach(tradeData => {
        expect(tradeData.bestPractices).toBeDefined();
        expect(Array.isArray(tradeData.bestPractices)).toBe(true);
      });
    });

    it("should have SOPs for each trade", () => {
      Object.values(TRADE_KNOWLEDGE_BASE).forEach(tradeData => {
        expect(tradeData.sops).toBeDefined();
        expect(Array.isArray(tradeData.sops)).toBe(true);
      });
    });
  });

  describe("Best Practices Data Quality", () => {
    it("should have valid Australian Standard references", () => {
      const allPractices = [
        ...ELECTRICAL_BEST_PRACTICES,
        ...PLUMBING_BEST_PRACTICES,
        ...ROOFING_BEST_PRACTICES,
        ...BUILDING_BEST_PRACTICES,
      ];

      allPractices.forEach(practice => {
        expect(practice.standardReferences.length).toBeGreaterThan(0);
        // Check that at least one reference contains AS or NCC
        const hasValidRef = practice.standardReferences.some(
          ref => ref.includes("AS") || ref.includes("NCC") || ref.includes("SA HB") || ref.includes("SafeWork")
        );
        expect(hasValidRef).toBe(true);
      });
    });

    it("should have valid effective dates", () => {
      const allPractices = [
        ...ELECTRICAL_BEST_PRACTICES,
        ...PLUMBING_BEST_PRACTICES,
        ...ROOFING_BEST_PRACTICES,
      ];

      allPractices.forEach(practice => {
        expect(practice.effectiveDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        const date = new Date(practice.effectiveDate);
        expect(date.getFullYear()).toBeGreaterThanOrEqual(2000);
        expect(date.getFullYear()).toBeLessThanOrEqual(2030);
      });
    });

    it("should have non-empty requirements", () => {
      const allPractices = [
        ...ELECTRICAL_BEST_PRACTICES,
        ...PLUMBING_BEST_PRACTICES,
        ...ROOFING_BEST_PRACTICES,
      ];

      allPractices.forEach(practice => {
        expect(practice.requirements.length).toBeGreaterThan(0);
        practice.requirements.forEach(req => {
          expect(req.length).toBeGreaterThan(0);
        });
      });
    });

    it("should have quality benchmarks with measurement methods", () => {
      const allPractices = [
        ...ELECTRICAL_BEST_PRACTICES,
        ...PLUMBING_BEST_PRACTICES,
        ...ROOFING_BEST_PRACTICES,
      ];

      allPractices.forEach(practice => {
        expect(practice.qualityBenchmarks.length).toBeGreaterThan(0);
        practice.qualityBenchmarks.forEach(benchmark => {
          expect(benchmark.metric).toBeDefined();
          expect(benchmark.acceptableRange).toBeDefined();
          expect(benchmark.measurementMethod).toBeDefined();
        });
      });
    });
  });

  describe("SOPs Data Quality", () => {
    it("should have numbered steps", () => {
      INDUSTRY_SOPS.forEach(sop => {
        expect(sop.steps.length).toBeGreaterThan(0);
        sop.steps.forEach((step, index) => {
          expect(step.stepNumber).toBe(index + 1);
          expect(step.action).toBeDefined();
          expect(step.details).toBeDefined();
        });
      });
    });

    it("should have safety requirements", () => {
      INDUSTRY_SOPS.forEach(sop => {
        expect(sop.safetyRequirements.length).toBeGreaterThan(0);
      });
    });

    it("should have quality checks", () => {
      INDUSTRY_SOPS.forEach(sop => {
        expect(sop.qualityChecks.length).toBeGreaterThan(0);
      });
    });

    it("should have documentation requirements", () => {
      INDUSTRY_SOPS.forEach(sop => {
        expect(sop.documentation.length).toBeGreaterThan(0);
      });
    });
  });
});

describe("Enhanced LLM Prompts", () => {
  it("should detect electrical trade from quote text", async () => {
    const { detectTradeFromQuote } = await import("./enhancedLLMPrompts");
    
    expect(detectTradeFromQuote("switchboard upgrade with RCD")).toBe("electrical");
    expect(detectTradeFromQuote("new power points installation")).toBe("electrical");
    expect(detectTradeFromQuote("solar panel system")).toBe("electrical");
  });

  it("should detect plumbing trade from quote text", async () => {
    const { detectTradeFromQuote } = await import("./enhancedLLMPrompts");
    
    expect(detectTradeFromQuote("hot water system replacement")).toBe("plumbing");
    expect(detectTradeFromQuote("bathroom renovation plumbing")).toBe("plumbing");
    expect(detectTradeFromQuote("drainage repair")).toBe("plumbing");
  });

  it("should detect roofing trade from quote text", async () => {
    const { detectTradeFromQuote } = await import("./enhancedLLMPrompts");
    
    expect(detectTradeFromQuote("Colorbond roof replacement")).toBe("roofing");
    expect(detectTradeFromQuote("gutter installation")).toBe("roofing");
    expect(detectTradeFromQuote("roof flashing repair")).toBe("roofing");
  });

  it("should detect HVAC trade from quote text", async () => {
    const { detectTradeFromQuote } = await import("./enhancedLLMPrompts");
    
    expect(detectTradeFromQuote("split system air conditioning")).toBe("hvac");
    expect(detectTradeFromQuote("ducted heating installation")).toBe("hvac");
  });

  it("should generate trade context", async () => {
    const { generateTradeContext } = await import("./enhancedLLMPrompts");
    
    const context = generateTradeContext("electrical");
    expect(context).toContain("ELECTRICAL");
    expect(context).toContain("Best Practices");
    expect(context).toContain("Quality Benchmarks");
    expect(context).toContain("Common Defects");
  });

  it("should generate enhanced pricing prompt", async () => {
    const { enhancedPricingPrompt } = await import("./enhancedLLMPrompts");
    
    const prompt = enhancedPricingPrompt("Test quote for electrical work", "electrical", "NSW");
    expect(prompt).toContain("electrical");
    expect(prompt).toContain("NSW");
    expect(prompt).toContain("ELECTRICAL TRADE EXPERTISE");
    expect(prompt).toContain("JSON");
  });

  it("should generate enhanced compliance prompt", async () => {
    const { enhancedCompliancePrompt } = await import("./enhancedLLMPrompts");
    
    const prompt = enhancedCompliancePrompt("Test quote for plumbing work", "plumbing", "VIC");
    expect(prompt).toContain("plumbing");
    expect(prompt).toContain("VIC");
    expect(prompt).toContain("compliance");
  });
});
