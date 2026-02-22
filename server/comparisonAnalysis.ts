import { invokeLLM } from "./_core/llm";
import type { Quote, Verification } from "../drizzle/schema";

interface ComparisonResult {
  bestQuoteId: number;
  reasoning: string;
  keyDifferences: Array<{
    category: string;
    winner: number;
    difference: string;
  }>;
  estimatedSavings: number;
  detailedAnalysis: {
    pricing: string;
    materials: string;
    compliance: string;
    warranty: string;
  };
}

/**
 * Analyze multiple quotes and provide AI-powered recommendation
 */
export async function analyzeQuoteComparison(
  quotes: Array<Quote & { verification?: Verification }>,
): Promise<ComparisonResult> {
  // Prepare comparison data for AI
  const quotesData = quotes.map((q, index) => ({
    id: q.id,
    label: `Quote ${index + 1}`,
    contractor: q.extractedData?.contractor || "Unknown",
    totalAmount: q.extractedData?.totalAmount || 0,
    overallScore: q.verification?.overallScore || 0,
    pricingScore: q.verification?.pricingScore || 0,
    materialsScore: q.verification?.materialsScore || 0,
    complianceScore: q.verification?.complianceScore || 0,
    warrantyScore: q.verification?.warrantyScore || 0,
    potentialSavings: q.verification?.potentialSavings || 0,
    statusBadge: q.verification?.statusBadge || "amber",
    flags: q.verification?.flags || [],
    recommendations: q.verification?.recommendations || [],
  }));

  const prompt = `You are an expert construction quote analyst. Compare the following ${quotes.length} quotes and provide a comprehensive recommendation.

${JSON.stringify(quotesData, null, 2)}

Analyze:
1. **Pricing**: Which quote offers the best value? Consider total cost, market rates, and potential savings.
2. **Materials**: Which quote specifies better quality materials and compliance?
3. **Compliance**: Which quote has the highest compliance score and fewer red flags?
4. **Warranty**: Which quote offers better warranty terms?

Provide your analysis in the following JSON format:
{
  "bestQuoteId": <id of the best quote>,
  "reasoning": "<2-3 sentence summary of why this quote is recommended>",
  "keyDifferences": [
    {
      "category": "pricing|materials|compliance|warranty",
      "winner": <quote id>,
      "difference": "<brief explanation>"
    }
  ],
  "estimatedSavings": <amount in dollars if user chooses best quote vs highest quote>,
  "detailedAnalysis": {
    "pricing": "<detailed pricing comparison>",
    "materials": "<detailed materials comparison>",
    "compliance": "<detailed compliance comparison>",
    "warranty": "<detailed warranty comparison>"
  }
}`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a construction quote comparison expert. Always respond with valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "quote_comparison",
          strict: true,
          schema: {
            type: "object",
            properties: {
              bestQuoteId: { type: "integer" },
              reasoning: { type: "string" },
              keyDifferences: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    category: { type: "string" },
                    winner: { type: "integer" },
                    difference: { type: "string" },
                  },
                  required: ["category", "winner", "difference"],
                  additionalProperties: false,
                },
              },
              estimatedSavings: { type: "integer" },
              detailedAnalysis: {
                type: "object",
                properties: {
                  pricing: { type: "string" },
                  materials: { type: "string" },
                  compliance: { type: "string" },
                  warranty: { type: "string" },
                },
                required: ["pricing", "materials", "compliance", "warranty"],
                additionalProperties: false,
              },
            },
            required: [
              "bestQuoteId",
              "reasoning",
              "keyDifferences",
              "estimatedSavings",
              "detailedAnalysis",
            ],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    if (typeof content !== 'string') {
      throw new Error('Invalid response format');
    }
    const result = JSON.parse(content);

    return result as ComparisonResult;
  } catch (error) {
    console.error("[ComparisonAnalysis] Error:", error);
    
    // Fallback: Simple score-based recommendation
    const sortedByScore = [...quotes].sort((a, b) => {
      const scoreA = a.verification?.overallScore || 0;
      const scoreB = b.verification?.overallScore || 0;
      return scoreB - scoreA;
    });

    const bestQuote = sortedByScore[0];
    const worstQuote = sortedByScore[sortedByScore.length - 1];
    
    const savings = 
      (worstQuote.extractedData?.totalAmount || 0) - 
      (bestQuote.extractedData?.totalAmount || 0);

    return {
      bestQuoteId: bestQuote.id,
      reasoning: `Quote ${quotes.findIndex(q => q.id === bestQuote.id) + 1} has the highest overall verification score (${bestQuote.verification?.overallScore || 0}/100) and offers the best value.`,
      keyDifferences: [
        {
          category: "pricing",
          winner: bestQuote.id,
          difference: `Best overall score with potential savings of $${savings.toLocaleString()}`,
        },
      ],
      estimatedSavings: savings,
      detailedAnalysis: {
        pricing: "Analysis temporarily unavailable. Please try again.",
        materials: "Analysis temporarily unavailable. Please try again.",
        compliance: "Analysis temporarily unavailable. Please try again.",
        warranty: "Analysis temporarily unavailable. Please try again.",
      },
    };
  }
}
