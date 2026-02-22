/**
 * Free Quote Check Analysis Service
 * 
 * Provides a simplified analysis for free quote checks,
 * returning a traffic light result and one key insight.
 */

import { invokeLLM } from "./_core/llm";
import { updateQuoteStatus, getQuoteById } from "./db";

interface FreeCheckResult {
  trafficLight: "green" | "amber" | "red";
  insight: string;
  contractorName: string | null;
  totalAmount: number | null;
  workType: string | null;
}

/**
 * Analyze a quote for the free check feature
 * Returns a traffic light assessment and one free insight
 */
export async function analyzeQuoteForFreeCheck(
  quoteId: number,
  fileUrl: string,
  fileType: string
): Promise<FreeCheckResult> {
  try {
    // Update status to processing
    await updateQuoteStatus(quoteId, "processing", 25);

    // Prepare the content for LLM analysis
    const isImage = fileType.startsWith("image/");
    
    const systemPrompt = `You are an expert Australian construction quote analyst. 
Your task is to quickly assess a quote and provide:
1. A traffic light rating (green = fair price, amber = needs review, red = concerns)
2. One clear, helpful insight for the homeowner
3. Extract basic details from the quote

Be honest and helpful. Use Australian English. Be specific with numbers when possible.

Respond in JSON format:
{
  "trafficLight": "green" | "amber" | "red",
  "insight": "One clear sentence about the quote, e.g., 'This quote is 15% above the typical market rate for roof repairs in Sydney.'",
  "contractorName": "Name from quote or null",
  "totalAmount": number or null,
  "workType": "Type of work, e.g., Roofing, Plumbing, Electrical"
}`;

    const userContent = isImage
      ? [
          { type: "text" as const, text: "Please analyze this construction quote image and provide a quick assessment:" },
          { type: "image_url" as const, image_url: { url: fileUrl } }
        ]
      : [
          { type: "text" as const, text: `Please analyze this construction quote (PDF URL: ${fileUrl}) and provide a quick assessment. Extract what you can from the document.` }
        ];

    await updateQuoteStatus(quoteId, "processing", 50);

    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent as any }
      ],
      response_format: {
        type: "json_object"
      }
    });

    await updateQuoteStatus(quoteId, "processing", 75);

    // Parse the response with better error handling
    if (!response || !response.choices || !response.choices[0]) {
      console.error("[FreeCheck] Invalid LLM response structure:", JSON.stringify(response));
      throw new Error("Invalid response from analysis service");
    }
    
    const content = response.choices[0]?.message?.content;
    if (!content) {
      console.error("[FreeCheck] No content in LLM response");
      throw new Error("No response from analysis");
    }

    // Ensure content is a string before parsing
    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
    console.log("[FreeCheck] Raw LLM response:", contentStr.substring(0, 200));
    
    let result: FreeCheckResult;
    try {
      result = JSON.parse(contentStr) as FreeCheckResult;
    } catch (parseError) {
      console.error("[FreeCheck] Failed to parse JSON:", parseError);
      throw new Error("Failed to parse analysis response");
    }

    // Update quote status to completed
    await updateQuoteStatus(quoteId, "completed", 100);

    // Ensure we have valid values (convert empty strings/zeros to null)
    return {
      trafficLight: result.trafficLight || "amber",
      insight: result.insight || "We couldn't fully analyze this quote. Consider getting a detailed report for more information.",
      contractorName: result.contractorName && result.contractorName.trim() !== '' ? result.contractorName : null,
      totalAmount: result.totalAmount && result.totalAmount > 0 ? result.totalAmount : null,
      workType: result.workType && result.workType.trim() !== '' ? result.workType : "General"
    };

  } catch (error) {
    console.error("[FreeCheck] Analysis error:", error);
    
    // Update status to failed
    await updateQuoteStatus(quoteId, "failed", 0, String(error));

    // Return a safe default
    return {
      trafficLight: "amber",
      insight: "We had trouble analyzing this quote automatically. Upload a clearer image or try our detailed analysis for better results.",
      contractorName: null,
      totalAmount: null,
      workType: "General"
    };
  }
}

/**
 * Get market comparison insight
 * Used to generate the free insight based on extracted data
 */
function generateMarketInsight(
  totalAmount: number | null,
  workType: string | null,
  marketAverage: number
): string {
  if (!totalAmount || !workType) {
    return "Upload a clearer quote to get specific pricing insights.";
  }

  const percentDiff = ((totalAmount - marketAverage) / marketAverage) * 100;
  
  if (percentDiff > 20) {
    return `This ${workType.toLowerCase()} quote is ${Math.round(percentDiff)}% above the typical market rate. Consider getting additional quotes.`;
  } else if (percentDiff > 10) {
    return `This ${workType.toLowerCase()} quote is ${Math.round(percentDiff)}% above average, but within a reasonable range for quality work.`;
  } else if (percentDiff < -10) {
    return `This ${workType.toLowerCase()} quote is ${Math.abs(Math.round(percentDiff))}% below market average. Verify the scope includes everything you need.`;
  } else {
    return `This ${workType.toLowerCase()} quote is competitively priced, close to the market average for your area.`;
  }
}
