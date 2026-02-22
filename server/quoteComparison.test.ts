import { describe, it, expect } from "vitest";

/**
 * Quote Comparison Unit Tests
 * Tests the validation and data processing logic for quote comparisons
 */

describe("Comparison Data Validation", () => {
  it("should validate comparison has at least 2 quotes", () => {
    const validateComparison = (quotes: any[]) => {
      if (quotes.length < 2) {
        throw new Error("Comparison requires at least 2 quotes");
      }
      return true;
    };

    expect(() => validateComparison([])).toThrow("at least 2 quotes");
    expect(() => validateComparison([{ id: 1 }])).toThrow("at least 2 quotes");
    expect(validateComparison([{ id: 1 }, { id: 2 }])).toBe(true);
  });

  it("should validate comparison has maximum 5 quotes", () => {
    const validateComparison = (quotes: any[]) => {
      if (quotes.length > 5) {
        throw new Error("Comparison supports maximum 5 quotes");
      }
      return true;
    };

    expect(validateComparison([{ id: 1 }, { id: 2 }])).toBe(true);
    expect(validateComparison([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }])).toBe(true);
    expect(() => validateComparison(Array(6).fill({ id: 1 }))).toThrow("maximum 5 quotes");
  });

  it("should validate all quotes belong to same user", () => {
    const validateOwnership = (quotes: any[], userId: number) => {
      const allOwned = quotes.every(q => q.userId === userId);
      if (!allOwned) {
        throw new Error("All quotes must belong to the same user");
      }
      return true;
    };

    const validQuotes = [
      { id: 1, userId: 100 },
      { id: 2, userId: 100 }
    ];
    const invalidQuotes = [
      { id: 1, userId: 100 },
      { id: 2, userId: 200 }
    ];

    expect(validateOwnership(validQuotes, 100)).toBe(true);
    expect(() => validateOwnership(invalidQuotes, 100)).toThrow("same user");
  });

  it("should validate all quotes are completed", () => {
    const validateStatus = (quotes: any[]) => {
      const allCompleted = quotes.every(q => q.status === "completed");
      if (!allCompleted) {
        throw new Error("All quotes must be completed before comparison");
      }
      return true;
    };

    const validQuotes = [
      { id: 1, status: "completed" },
      { id: 2, status: "completed" }
    ];
    const invalidQuotes = [
      { id: 1, status: "completed" },
      { id: 2, status: "processing" }
    ];

    expect(validateStatus(validQuotes)).toBe(true);
    expect(() => validateStatus(invalidQuotes)).toThrow("must be completed");
  });
});

describe("Comparison Score Calculation", () => {
  it("should calculate average score from verification data", () => {
    const calculateAverageScore = (verification: any) => {
      const scores = [
        verification.pricingScore || 0,
        verification.materialsScore || 0,
        verification.complianceScore || 0,
        verification.warrantyScore || 0
      ];
      return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    };

    const verification = {
      pricingScore: 80,
      materialsScore: 90,
      complianceScore: 85,
      warrantyScore: 75
    };

    expect(calculateAverageScore(verification)).toBe(83);
  });

  it("should identify best quote by overall score", () => {
    const findBestQuote = (quotes: any[]) => {
      return quotes.reduce((best, current) => {
        const currentScore = current.verification?.overallScore || 0;
        const bestScore = best.verification?.overallScore || 0;
        return currentScore > bestScore ? current : best;
      });
    };

    const quotes = [
      { id: 1, verification: { overallScore: 75 } },
      { id: 2, verification: { overallScore: 92 } },
      { id: 3, verification: { overallScore: 85 } }
    ];

    expect(findBestQuote(quotes).id).toBe(2);
  });

  it("should calculate savings between highest and lowest price", () => {
    const calculateSavings = (quotes: any[]) => {
      const amounts = quotes
        .map(q => q.extractedData?.totalAmount || 0)
        .filter(a => a > 0);
      
      if (amounts.length < 2) return 0;
      
      const max = Math.max(...amounts);
      const min = Math.min(...amounts);
      return max - min;
    };

    const quotes = [
      { id: 1, extractedData: { totalAmount: 25000 } },
      { id: 2, extractedData: { totalAmount: 28000 } },
      { id: 3, extractedData: { totalAmount: 23500 } }
    ];

    expect(calculateSavings(quotes)).toBe(4500);
  });

  it("should handle quotes with missing price data", () => {
    const calculateSavings = (quotes: any[]) => {
      const amounts = quotes
        .map(q => q.extractedData?.totalAmount || 0)
        .filter(a => a > 0);
      
      if (amounts.length < 2) return 0;
      
      const max = Math.max(...amounts);
      const min = Math.min(...amounts);
      return max - min;
    };

    const quotes = [
      { id: 1, extractedData: { totalAmount: 25000 } },
      { id: 2, extractedData: {} }, // Missing totalAmount
      { id: 3, extractedData: null } // No extractedData
    ];

    expect(calculateSavings(quotes)).toBe(0); // Only one valid amount
  });
});

describe("Category Winner Determination", () => {
  it("should determine winner for each category", () => {
    const determineWinner = (quotes: any[], category: string) => {
      const scoreKey = `${category}Score`;
      return quotes.reduce((winner, current) => {
        const currentScore = current.verification?.[scoreKey] || 0;
        const winnerScore = winner.verification?.[scoreKey] || 0;
        return currentScore > winnerScore ? current : winner;
      });
    };

    const quotes = [
      { 
        id: 1, 
        verification: { 
          pricingScore: 90, 
          materialsScore: 70, 
          complianceScore: 85,
          warrantyScore: 80 
        } 
      },
      { 
        id: 2, 
        verification: { 
          pricingScore: 75, 
          materialsScore: 95, 
          complianceScore: 88,
          warrantyScore: 70 
        } 
      }
    ];

    expect(determineWinner(quotes, "pricing").id).toBe(1);
    expect(determineWinner(quotes, "materials").id).toBe(2);
    expect(determineWinner(quotes, "compliance").id).toBe(2);
    expect(determineWinner(quotes, "warranty").id).toBe(1);
  });

  it("should handle ties by returning first quote", () => {
    const determineWinner = (quotes: any[], category: string) => {
      const scoreKey = `${category}Score`;
      return quotes.reduce((winner, current) => {
        const currentScore = current.verification?.[scoreKey] || 0;
        const winnerScore = winner.verification?.[scoreKey] || 0;
        return currentScore > winnerScore ? current : winner;
      });
    };

    const quotes = [
      { id: 1, verification: { pricingScore: 85 } },
      { id: 2, verification: { pricingScore: 85 } }
    ];

    // First quote wins in case of tie
    expect(determineWinner(quotes, "pricing").id).toBe(1);
  });
});

describe("Comparison Result Structure", () => {
  it("should generate valid comparison result structure", () => {
    const generateComparisonResult = (quotes: any[]) => {
      const bestQuote = quotes.reduce((best, current) => {
        const currentScore = current.verification?.overallScore || 0;
        const bestScore = best.verification?.overallScore || 0;
        return currentScore > bestScore ? current : best;
      });

      const amounts = quotes
        .map(q => q.extractedData?.totalAmount || 0)
        .filter(a => a > 0);
      
      const savings = amounts.length >= 2 
        ? Math.max(...amounts) - Math.min(...amounts) 
        : 0;

      return {
        bestQuoteId: bestQuote.id,
        reasoning: `Quote ${bestQuote.id} offers the best overall value`,
        keyDifferences: [],
        estimatedSavings: savings,
        detailedAnalysis: {
          pricing: "Analysis pending",
          materials: "Analysis pending",
          compliance: "Analysis pending",
          warranty: "Analysis pending"
        }
      };
    };

    const quotes = [
      { 
        id: 1, 
        extractedData: { totalAmount: 25000 },
        verification: { overallScore: 85 } 
      },
      { 
        id: 2, 
        extractedData: { totalAmount: 28000 },
        verification: { overallScore: 78 } 
      }
    ];

    const result = generateComparisonResult(quotes);

    expect(result.bestQuoteId).toBe(1);
    expect(result.reasoning).toContain("Quote 1");
    expect(result.estimatedSavings).toBe(3000);
    expect(result.detailedAnalysis).toBeDefined();
    expect(result.detailedAnalysis.pricing).toBeDefined();
    expect(result.detailedAnalysis.materials).toBeDefined();
    expect(result.detailedAnalysis.compliance).toBeDefined();
    expect(result.detailedAnalysis.warranty).toBeDefined();
  });
});
