/**
 * Knowledge Base Verification System Tests
 * 
 * Tests the deterministic verification engine that replaces AI dependencies
 */

import { describe, it, expect } from "vitest";

describe("Knowledge Base Verification System", () => {
  
  describe("Australian Standards Knowledge Base", () => {
    it("should export AUSTRALIAN_STANDARDS constant", async () => {
      const { AUSTRALIAN_STANDARDS } = await import("./knowledgeBase/australianStandards");
      expect(AUSTRALIAN_STANDARDS).toBeDefined();
      expect(Array.isArray(AUSTRALIAN_STANDARDS)).toBe(true);
      expect(AUSTRALIAN_STANDARDS.length).toBeGreaterThan(0);
    });

    it("should have required fields for each standard", async () => {
      const { AUSTRALIAN_STANDARDS } = await import("./knowledgeBase/australianStandards");
      
      AUSTRALIAN_STANDARDS.forEach(standard => {
        expect(standard.id).toBeDefined();
        expect(standard.title).toBeDefined();
        expect(standard.currentVersion).toBeDefined();
        expect(standard.relevance).toBeDefined();
        expect(standard.keyRequirements).toBeDefined();
        expect(Array.isArray(standard.keyRequirements)).toBe(true);
      });
    });

    it("should export HB39_REQUIREMENTS for roofing compliance", async () => {
      const { HB39_REQUIREMENTS } = await import("./knowledgeBase/australianStandards");
      expect(HB39_REQUIREMENTS).toBeDefined();
      expect(Array.isArray(HB39_REQUIREMENTS)).toBe(true);
      expect(HB39_REQUIREMENTS.length).toBeGreaterThan(0);
    });

    it("should export NCC_2022_REQUIREMENTS for building code compliance", async () => {
      const { NCC_2022_REQUIREMENTS } = await import("./knowledgeBase/australianStandards");
      expect(NCC_2022_REQUIREMENTS).toBeDefined();
      expect(Array.isArray(NCC_2022_REQUIREMENTS)).toBe(true);
    });

    it("should export WIND_REGIONS for location-based compliance", async () => {
      const { WIND_REGIONS } = await import("./knowledgeBase/australianStandards");
      expect(WIND_REGIONS).toBeDefined();
      expect(typeof WIND_REGIONS).toBe("object");
    });

    it("should export ROOFING_MATERIALS with specifications", async () => {
      const { ROOFING_MATERIALS } = await import("./knowledgeBase/australianStandards");
      expect(ROOFING_MATERIALS).toBeDefined();
      expect(Array.isArray(ROOFING_MATERIALS)).toBe(true);
    });
  });

  describe("Quote Parser", () => {
    it("should export parseQuoteText function", async () => {
      const { parseQuoteText } = await import("./knowledgeBase/quoteParser");
      expect(typeof parseQuoteText).toBe("function");
    });

    it("should parse a simple quote text", async () => {
      const { parseQuoteText } = await import("./knowledgeBase/quoteParser");
      
      const quoteText = `
        QUOTE
        ABC Roofing Pty Ltd
        ABN: 12 345 678 901
        License: 123456C
        
        Re: Roof Replacement
        123 Main Street, Sydney NSW 2000
        
        Labour: $5,000
        Materials: $3,000
        Total: $8,000 (inc GST)
        
        Warranty: 10 years workmanship
      `;
      
      const result = parseQuoteText(quoteText);
      
      expect(result).toBeDefined();
      expect(result.contractor).toBeDefined();
      expect(result.lineItems).toBeDefined();
      expect(Array.isArray(result.lineItems)).toBe(true);
    });

    it("should extract ABN from quote text", async () => {
      const { parseQuoteText } = await import("./knowledgeBase/quoteParser");
      
      const quoteText = "Company: Test Co\nABN: 12 345 678 901\nTotal: $5,000";
      const result = parseQuoteText(quoteText);
      
      expect(result.contractor.abn).toBeDefined();
    });

    it("should extract total amount from quote text", async () => {
      const { parseQuoteText } = await import("./knowledgeBase/quoteParser");
      
      const quoteText = "Quote Total: $15,500.00 including GST";
      const result = parseQuoteText(quoteText);
      
      expect(result.pricing.totalAmount).toBeGreaterThan(0);
    });

    it("should detect trade type from quote content", async () => {
      const { parseQuoteText } = await import("./knowledgeBase/quoteParser");
      
      const roofingQuote = "Roof replacement, Colorbond sheets, ridge capping, gutters";
      const result = parseQuoteText(roofingQuote);
      
      // Project type should be detected from content
      expect(result.project).toBeDefined();
    });

    it("should validate ABN format", async () => {
      const { validateABN } = await import("./knowledgeBase/quoteParser");
      
      // Valid ABN
      const validResult = validateABN("51 824 753 556");
      expect(validResult.valid).toBe(true);
      
      // Invalid ABN
      const invalidResult = validateABN("12 345 678 901");
      expect(invalidResult.valid).toBe(false);
    });
  });

  describe("Market Rate Engine", () => {
    it("should export calculateRoofingMarketRate function", async () => {
      const { calculateRoofingMarketRate } = await import("./knowledgeBase/marketRateEngine");
      expect(typeof calculateRoofingMarketRate).toBe("function");
    });

    it("should return a market rate for roofing work", async () => {
      const { calculateRoofingMarketRate } = await import("./knowledgeBase/marketRateEngine");
      
      const rate = calculateRoofingMarketRate(
        "replacement",
        150,
        "nsw",
        true
      );
      
      expect(rate).toBeDefined();
      expect(rate.rate).toBeGreaterThan(0);
      expect(rate.breakdown).toBeDefined();
      expect(rate.breakdown.labor).toBeGreaterThan(0);
    });

    it("should apply regional adjustment for non-metro areas", async () => {
      const { calculateRoofingMarketRate } = await import("./knowledgeBase/marketRateEngine");
      
      const metroRate = calculateRoofingMarketRate(
        "replacement",
        150,
        "nsw",
        true
      );
      
      const regionalRate = calculateRoofingMarketRate(
        "replacement",
        150,
        "nsw",
        false
      );
      
      // Regional rates should be different (typically higher due to travel)
      expect(regionalRate.rate).not.toBe(metroRate.rate);
    });

    it("should include source citation in rate response", async () => {
      const { calculateRoofingMarketRate } = await import("./knowledgeBase/marketRateEngine");
      
      const rate = calculateRoofingMarketRate(
        "replacement",
        100,
        "vic",
        true
      );
      
      expect(rate.source).toBeDefined();
      expect(rate.source.length).toBeGreaterThan(0);
    });
  });

  describe("Compliance Engine", () => {
    it("should export calculateComplianceScore function", async () => {
      const { calculateComplianceScore } = await import("./knowledgeBase/complianceEngine");
      expect(typeof calculateComplianceScore).toBe("function");
    });

    it("should check compliance for a parsed quote", async () => {
      const { calculateComplianceScore } = await import("./knowledgeBase/complianceEngine");
      const { parseQuoteText } = await import("./knowledgeBase/quoteParser");
      
      const quoteText = `
        Roofing Quote
        ABN: 51 824 753 556
        License: 123456C
        Materials: Colorbond steel sheets
        Warranty: 10 years
        Total: $15,000
      `;
      
      const parsedQuote = parseQuoteText(quoteText);
      const compliance = await calculateComplianceScore(parsedQuote);
      
      expect(compliance).toBeDefined();
      expect(compliance.overall).toBeGreaterThanOrEqual(0);
      expect(compliance.overall).toBeLessThanOrEqual(100);
      expect(compliance.breakdown).toBeDefined();
    });

    it("should flag quotes without warranty information", async () => {
      const { calculateComplianceScore } = await import("./knowledgeBase/complianceEngine");
      const { parseQuoteText } = await import("./knowledgeBase/quoteParser");
      
      const quoteText = "Simple quote without warranty. Total: $5,000";
      const parsedQuote = parseQuoteText(quoteText);
      const compliance = await calculateComplianceScore(parsedQuote);
      
      expect(compliance.breakdown.warranty.score).toBeLessThan(100);
    });

    it("should include standard references in compliance findings", async () => {
      const { calculateComplianceScore } = await import("./knowledgeBase/complianceEngine");
      const { parseQuoteText } = await import("./knowledgeBase/quoteParser");
      
      const quoteText = `
        Roofing Quote
        Materials: Colorbond 0.42mm BMT
        Total: $10,000
      `;
      
      const parsedQuote = parseQuoteText(quoteText);
      const compliance = await calculateComplianceScore(parsedQuote);
      
      expect(compliance.breakdown.compliance.standardsChecked).toBeDefined();
      expect(Array.isArray(compliance.breakdown.compliance.standardsChecked)).toBe(true);
    });
  });

  describe("Report Generator", () => {
    it("should export generateVerificationReport function", async () => {
      const { generateVerificationReport } = await import("./knowledgeBase/reportGenerator");
      expect(typeof generateVerificationReport).toBe("function");
    });

    it("should generate a structured report", async () => {
      const { generateVerificationReport } = await import("./knowledgeBase/reportGenerator");
      const { parseQuoteText } = await import("./knowledgeBase/quoteParser");
      const { calculateComplianceScore } = await import("./knowledgeBase/complianceEngine");
      
      const quoteText = `
        ABC Roofing Pty Ltd
        ABN: 51 824 753 556
        Roof replacement - $15,000
        Warranty: 10 years
      `;
      
      const parsedQuote = parseQuoteText(quoteText);
      const compliance = await calculateComplianceScore(parsedQuote);
      
      const report = generateVerificationReport(
        parsedQuote,
        compliance,
        1,
        "test-quote.pdf",
        150,
        "NSW"
      );
      
      expect(report).toBeDefined();
      expect(report.id).toBeDefined();
      expect(report.summary).toBeDefined();
      expect(report.summary.overallScore).toBeDefined();
      expect(report.summary.riskLevel).toBeDefined();
    });

    it("should include citations in report", async () => {
      const { generateVerificationReport } = await import("./knowledgeBase/reportGenerator");
      const { parseQuoteText } = await import("./knowledgeBase/quoteParser");
      const { calculateComplianceScore } = await import("./knowledgeBase/complianceEngine");
      
      const quoteText = "Roofing work - $10,000";
      const parsedQuote = parseQuoteText(quoteText);
      const compliance = await calculateComplianceScore(parsedQuote);
      
      const report = generateVerificationReport(
        parsedQuote,
        compliance,
        1,
        "test-quote.pdf",
        100,
        "NSW"
      );
      
      expect(report.citations).toBeDefined();
      expect(Array.isArray(report.citations)).toBe(true);
    });
  });

  describe("Verification Service Integration", () => {
    it("should export VERIFICATION_SERVICE constant", async () => {
      const { VERIFICATION_SERVICE } = await import("./knowledgeBase/verificationService");
      expect(VERIFICATION_SERVICE).toBeDefined();
      expect(VERIFICATION_SERVICE.name).toBe("VENTURR VALDT Knowledge Base");
    });

    it("should export processQuote function", async () => {
      const { processQuote } = await import("./knowledgeBase/verificationService");
      expect(typeof processQuote).toBe("function");
    });

    it("should process a quote and return verification result", async () => {
      const { processQuote } = await import("./knowledgeBase/verificationService");
      
      const result = await processQuote({
        quoteId: 999999, // Test ID
        rawText: `
          Test Roofing Company
          ABN: 51 824 753 556
          License: 123456C
          
          Roof Replacement Quote
          Address: 123 Test St, Sydney NSW 2000
          
          Labour: $8,000
          Materials: $5,000
          Total: $13,000 inc GST
          
          Warranty: 10 years workmanship, 25 years materials
        `,
        fileName: "test-quote.pdf"
      });
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.quoteId).toBe(999999);
      expect(result.parsedQuote).toBeDefined();
      expect(result.complianceScore).toBeDefined();
      expect(result.complianceScore.overall).toBeGreaterThanOrEqual(0);
      expect(result.complianceScore.overall).toBeLessThanOrEqual(100);
      expect(result.report).toBeDefined();
    });

    it("should handle empty quote text gracefully", async () => {
      const { processQuote } = await import("./knowledgeBase/verificationService");
      
      const result = await processQuote({
        quoteId: 999998,
        rawText: "",
        fileName: "empty.pdf"
      });
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true); // Should still succeed with low scores
      expect(result.complianceScore.overall).toBeLessThan(50); // Low score for empty
    });

    it("should detect risk level based on compliance score", async () => {
      const { processQuote } = await import("./knowledgeBase/verificationService");
      
      const result = await processQuote({
        quoteId: 999997,
        rawText: `
          Professional Roofing Co
          ABN: 51 824 753 556
          License: 123456C
          
          Complete roof replacement
          Materials: Colorbond 0.48mm BMT steel
          Labour: $12,000
          Materials: $8,000
          Total: $20,000
          
          Warranty: 10 years workmanship
          Insurance: $20M public liability
        `,
        fileName: "good-quote.pdf"
      });
      
      expect(result.complianceScore.riskLevel).toBeDefined();
      expect(["low", "medium", "high", "critical"]).toContain(result.complianceScore.riskLevel);
    });
  });
});
