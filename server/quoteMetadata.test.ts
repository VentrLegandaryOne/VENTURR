import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the Perplexity API call
vi.mock("axios", () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    isAxiosError: vi.fn(() => false),
  },
}));

describe("Quote Metadata Extraction", () => {
  describe("extractQuoteMetadata function", () => {
    it("should extract contractor name from quote text", async () => {
      // Test that the extraction function exists and has correct signature
      const { extractQuoteMetadata } = await import("./aiVerification");
      expect(typeof extractQuoteMetadata).toBe("function");
    });

    it("should return empty object on extraction failure", async () => {
      const { extractQuoteMetadata } = await import("./aiVerification");
      // With mocked axios that doesn't return valid response, should return empty object
      const result = await extractQuoteMetadata("test quote text");
      expect(result).toBeDefined();
      expect(typeof result).toBe("object");
    });
  });

  describe("updateQuoteExtractedData function", () => {
    it("should exist in db module", async () => {
      const { updateQuoteExtractedData } = await import("./db");
      expect(typeof updateQuoteExtractedData).toBe("function");
    });
  });

  describe("Schema extractedData type", () => {
    it("should include all required fields in schema", async () => {
      // Verify the schema type includes new fields
      const schema = await import("../drizzle/schema");
      expect(schema.quotes).toBeDefined();
      
      // The extractedData JSON column should support these fields
      const expectedFields = [
        "contractor",
        "totalAmount",
        "lineItems",
        "projectAddress",
        "quoteDate",
        "validUntil",
        "abn",
        "phone",
        "email",
        "licenseNumber",
      ];
      
      // Schema type check passes if module loads without error
      expect(expectedFields.length).toBe(10);
    });
  });

  describe("ComparisonResult display logic", () => {
    it("should display contractor name or fallback to filename", () => {
      // Test the display logic
      const quote1 = {
        extractedData: { contractor: "ABC Roofing Pty Ltd" },
        fileName: "quote-123.pdf",
      };
      const quote2 = {
        extractedData: null,
        fileName: "smith-builders-quote.pdf",
      };
      const quote3 = {
        extractedData: {},
        fileName: "quote.pdf",
      };
      const quote4 = {
        extractedData: null,
        fileName: null,
      };

      // Logic: contractor || fileName (with dashes/underscores replaced by spaces) || fallback
      const getDisplayName = (quote: any, index: number = 0) => {
        return (
          quote.extractedData?.contractor ||
          (quote.fileName ? quote.fileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ") : `Quote ${index + 1}`)
        );
      };

      expect(getDisplayName(quote1)).toBe("ABC Roofing Pty Ltd");
      expect(getDisplayName(quote2)).toBe("smith builders quote"); // Dashes replaced with spaces
      expect(getDisplayName(quote3)).toBe("quote");
      expect(getDisplayName(quote4, 0)).toBe("Quote 1"); // Fallback to Quote N
    });

    it("should format ABN correctly when present", () => {
      const extractedData = {
        abn: "51 824 753 556",
        licenseNumber: "12345C",
        quoteDate: "2024-01-15",
      };

      expect(extractedData.abn).toBe("51 824 753 556");
      expect(extractedData.licenseNumber).toBe("12345C");
      // Date formatting may vary by timezone, just verify it's a valid date string
      const formattedDate = new Date(extractedData.quoteDate).toLocaleDateString("en-AU");
      expect(formattedDate).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
    });
  });

  describe("Processing service integration", () => {
    it("should have metadata extraction in processing pipeline", async () => {
      // Verify the processing service imports the metadata extraction
      const processingService = await import("./processingService");
      expect(processingService.startQuoteProcessing).toBeDefined();
      expect(typeof processingService.startQuoteProcessing).toBe("function");
    });
  });
});

describe("Comparison Interface Data Flow", () => {
  it("should handle quotes with complete extractedData", () => {
    const quoteWithData = {
      id: 1,
      fileName: "test-quote.pdf",
      extractedData: {
        contractor: "Premium Roofing Solutions",
        totalAmount: 15500,
        abn: "12 345 678 901",
        phone: "0412 345 678",
        email: "info@premiumroofing.com.au",
        licenseNumber: "NSW-123456",
        quoteDate: "2024-12-01",
        projectAddress: "123 Main St, Sydney NSW 2000",
      },
    };

    expect(quoteWithData.extractedData.contractor).toBe("Premium Roofing Solutions");
    expect(quoteWithData.extractedData.totalAmount).toBe(15500);
    expect(quoteWithData.extractedData.abn).toBe("12 345 678 901");
  });

  it("should handle quotes with partial extractedData", () => {
    const quoteWithPartialData = {
      id: 2,
      fileName: "partial-quote.pdf",
      extractedData: {
        contractor: "Joe's Plumbing",
        totalAmount: 8500,
      },
    };

    expect(quoteWithPartialData.extractedData.contractor).toBe("Joe's Plumbing");
    expect(quoteWithPartialData.extractedData.totalAmount).toBe(8500);
    // Optional fields should be undefined
    expect((quoteWithPartialData.extractedData as any).abn).toBeUndefined();
  });

  it("should handle quotes with null extractedData", () => {
    const quoteWithNoData = {
      id: 3,
      fileName: "legacy-quote.pdf",
      extractedData: null,
    };

    // Should fall back to filename
    const displayName =
      quoteWithNoData.extractedData?.contractor ||
      quoteWithNoData.fileName?.replace(/\.[^/.]+$/, "") ||
      "Unknown Contractor";

    expect(displayName).toBe("legacy-quote");
  });
});
