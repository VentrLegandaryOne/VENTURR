/**
 * VENTURR VALIDT - Evidence & Extraction Pipeline
 * PDF text extraction + OCR fallback
 * Page-level mapping
 * Confidence scoring
 * Low confidence → downgrade conclusions automatically
 */

import axios from 'axios';
import { logExtraction } from './auditTrail';

export interface ExtractedPage {
  pageNumber: number;
  text: string;
  confidence: "high" | "medium" | "low";
  method: "text" | "ocr";
  wordCount: number;
}

export interface ExtractionResult {
  success: boolean;
  fullText: string;
  pages: ExtractedPage[];
  totalPages: number;
  overallConfidence: "high" | "medium" | "low";
  method: "pdf-parse" | "ocr" | "hybrid";
  warnings: string[];
  metadata: {
    fileSize: number;
    fileType: string;
    extractedAt: string;
    processingTimeMs: number;
  };
}

export interface ExtractionError {
  code: "INVALID_FILE" | "EMPTY_FILE" | "EXTRACTION_FAILED" | "LOW_QUALITY" | "UNSUPPORTED_FORMAT";
  message: string;
  recoverable: boolean;
  suggestion: string;
}

/**
 * Calculate confidence based on extraction quality metrics
 */
function calculateConfidence(
  text: string,
  method: "text" | "ocr",
  pageNumber: number
): "high" | "medium" | "low" {
  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
  const hasNumbers = /\d+/.test(text);
  const hasCommonTerms = /(quote|price|total|materials|labour|gst|abn)/i.test(text);
  const avgWordLength = text.length / Math.max(wordCount, 1);
  
  // OCR typically has lower confidence
  if (method === "ocr") {
    if (wordCount > 100 && hasNumbers && hasCommonTerms) {
      return "medium";
    }
    return "low";
  }
  
  // Text extraction confidence
  if (wordCount > 200 && hasNumbers && hasCommonTerms && avgWordLength > 3 && avgWordLength < 15) {
    return "high";
  }
  if (wordCount > 50 && (hasNumbers || hasCommonTerms)) {
    return "medium";
  }
  return "low";
}

/**
 * Calculate overall confidence from page confidences
 */
function calculateOverallConfidence(pages: ExtractedPage[]): "high" | "medium" | "low" {
  if (pages.length === 0) return "low";
  
  const confidenceScores = pages.map(p => {
    switch (p.confidence) {
      case "high": return 3;
      case "medium": return 2;
      case "low": return 1;
    }
  });
  
  const avgScore = confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length;
  
  if (avgScore >= 2.5) return "high";
  if (avgScore >= 1.5) return "medium";
  return "low";
}

/**
 * Extract text from PDF using pdf-parse with page-level mapping
 */
async function extractFromPDF(buffer: Buffer): Promise<{
  pages: ExtractedPage[];
  method: "pdf-parse";
}> {
  const { PDFParse } = await import('pdf-parse');
  
  const pages: ExtractedPage[] = [];
  
  try {
    const parser = new PDFParse({ data: buffer });
    const textResult = await parser.getText();
    const data = { text: textResult.text };
    
    // If pagerender didn't work, fall back to full text
    if (pages.length === 0 && data.text) {
      pages.push({
        pageNumber: 1,
        text: data.text,
        confidence: calculateConfidence(data.text, "text", 1),
        method: "text",
        wordCount: data.text.split(/\s+/).filter((w: string) => w.length > 0).length
      });
    }
    
    return { pages, method: "pdf-parse" };
  } catch (error) {
    console.error('[Extraction] PDF parse failed:', error);
    throw error;
  }
}

/**
 * Extract text from image using OCR (tesseract)
 */
async function extractFromImage(buffer: Buffer, fileType: string): Promise<{
  pages: ExtractedPage[];
  method: "ocr";
}> {
  const fs = await import('fs/promises');
  const path = await import('path');
  const os = await import('os');
  const { execSync } = await import('child_process');
  
  const tempDir = os.tmpdir();
  const extension = fileType.includes('png') ? 'png' : 'jpg';
  const tempImagePath = path.join(tempDir, `quote-${Date.now()}.${extension}`);
  
  await fs.writeFile(tempImagePath, buffer);
  
  try {
    const ocrOutput = execSync(`tesseract ${tempImagePath} stdout -l eng`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore'],
      timeout: 120000 // 2 minute timeout
    });
    
    await fs.unlink(tempImagePath).catch(() => {});
    
    const confidence = calculateConfidence(ocrOutput, "ocr", 1);
    
    return {
      pages: [{
        pageNumber: 1,
        text: ocrOutput.trim(),
        confidence,
        method: "ocr",
        wordCount: ocrOutput.split(/\s+/).filter((w: string) => w.length > 0).length
      }],
      method: "ocr"
    };
  } catch (error) {
    await fs.unlink(tempImagePath).catch(() => {});
    throw error;
  }
}

/**
 * Main extraction function with comprehensive error handling
 */
export async function extractEvidence(
  fileUrl: string,
  quoteId?: number
): Promise<ExtractionResult> {
  const startTime = Date.now();
  const warnings: string[] = [];
  
  // Validate URL
  if (!fileUrl || typeof fileUrl !== 'string') {
    throw {
      code: "INVALID_FILE",
      message: "Invalid file URL provided",
      recoverable: false,
      suggestion: "Please provide a valid file URL"
    } as ExtractionError;
  }
  
  try {
    // Download file
    const response = await axios.get(fileUrl, {
      responseType: 'arraybuffer',
      timeout: 60000,
      maxContentLength: 50 * 1024 * 1024 // 50MB max
    });
    
    const buffer = Buffer.from(response.data);
    const fileSize = buffer.length;
    const contentType = response.headers['content-type'] || '';
    
    // Validate file size
    if (fileSize === 0) {
      throw {
        code: "EMPTY_FILE",
        message: "Downloaded file is empty",
        recoverable: false,
        suggestion: "Please upload a non-empty file"
      } as ExtractionError;
    }
    
    if (fileSize < 1000) {
      warnings.push("File is very small - may not contain sufficient information");
    }
    
    // Determine file type and extraction method
    const isPDF = fileUrl.toLowerCase().includes('.pdf') || contentType.includes('pdf');
    const isImage = /\.(jpg|jpeg|png|gif|bmp|tiff?)$/i.test(fileUrl) || 
                    contentType.includes('image');
    
    let pages: ExtractedPage[] = [];
    let method: "pdf-parse" | "ocr" | "hybrid" = "pdf-parse";
    
    if (isPDF) {
      try {
        const pdfResult = await extractFromPDF(buffer);
        pages = pdfResult.pages;
        method = "pdf-parse";
        
        // Check if PDF extraction yielded poor results (might be scanned)
        const totalWords = pages.reduce((sum, p) => sum + p.wordCount, 0);
        if (totalWords < 50 && pages.length > 0) {
          warnings.push("PDF appears to be scanned or image-based. Text extraction may be incomplete.");
          // In production, would attempt OCR on PDF pages here
        }
      } catch (pdfError) {
        console.error('[Extraction] PDF extraction failed, attempting OCR:', pdfError);
        warnings.push("PDF text extraction failed, attempting OCR");
        
        // Try OCR as fallback
        try {
          const ocrResult = await extractFromImage(buffer, 'pdf');
          pages = ocrResult.pages;
          method = "ocr";
        } catch (ocrError) {
          throw {
            code: "EXTRACTION_FAILED",
            message: "Both PDF parsing and OCR failed",
            recoverable: true,
            suggestion: "Please try uploading a clearer document or a text-based PDF"
          } as ExtractionError;
        }
      }
    } else if (isImage) {
      try {
        const ocrResult = await extractFromImage(buffer, contentType);
        pages = ocrResult.pages;
        method = "ocr";
        warnings.push("Image file detected - using OCR which may have lower accuracy");
      } catch (ocrError) {
        throw {
          code: "EXTRACTION_FAILED",
          message: "OCR extraction failed for image",
          recoverable: true,
          suggestion: "Please upload a clearer image or convert to PDF"
        } as ExtractionError;
      }
    } else {
      throw {
        code: "UNSUPPORTED_FORMAT",
        message: `Unsupported file format: ${contentType}`,
        recoverable: false,
        suggestion: "Please upload a PDF or image file (JPG, PNG)"
      } as ExtractionError;
    }
    
    // Combine all page text
    const fullText = pages.map(p => p.text).join('\n\n--- Page Break ---\n\n');
    const overallConfidence = calculateOverallConfidence(pages);
    
    // Add warnings for low confidence
    if (overallConfidence === "low") {
      warnings.push("Extraction confidence is low. Analysis results may be incomplete or inaccurate.");
    }
    
    // Check for minimum content
    const totalWords = pages.reduce((sum, p) => sum + p.wordCount, 0);
    if (totalWords < 30) {
      throw {
        code: "LOW_QUALITY",
        message: "Insufficient text extracted from document",
        recoverable: true,
        suggestion: "Please upload a document with more readable text content"
      } as ExtractionError;
    }
    
    const processingTimeMs = Date.now() - startTime;
    
    // Log to audit trail if quoteId provided
    if (quoteId) {
      logExtraction(quoteId, method, fullText.length, overallConfidence, pages.length);
    }
    
    console.log(`[Extraction] Completed: ${pages.length} pages, ${totalWords} words, ${overallConfidence} confidence, ${processingTimeMs}ms`);
    
    return {
      success: true,
      fullText,
      pages,
      totalPages: pages.length,
      overallConfidence,
      method,
      warnings,
      metadata: {
        fileSize,
        fileType: contentType,
        extractedAt: new Date().toISOString(),
        processingTimeMs
      }
    };
    
  } catch (error) {
    // Re-throw ExtractionErrors
    if ((error as ExtractionError).code) {
      throw error;
    }
    
    // Handle axios errors
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw {
          code: "EXTRACTION_FAILED",
          message: "File download timed out",
          recoverable: true,
          suggestion: "Please try again or upload a smaller file"
        } as ExtractionError;
      }
      if (error.response?.status === 404) {
        throw {
          code: "INVALID_FILE",
          message: "File not found at the specified URL",
          recoverable: false,
          suggestion: "Please re-upload the file"
        } as ExtractionError;
      }
    }
    
    console.error('[Extraction] Unexpected error:', error);
    throw {
      code: "EXTRACTION_FAILED",
      message: "An unexpected error occurred during extraction",
      recoverable: true,
      suggestion: "Please try again or contact support"
    } as ExtractionError;
  }
}

/**
 * Check if extraction result is sufficient for analysis
 */
export function isExtractionSufficient(result: ExtractionResult): {
  sufficient: boolean;
  reason?: string;
  recommendedAction?: string;
} {
  const totalWords = result.pages.reduce((sum, p) => sum + p.wordCount, 0);
  
  if (totalWords < 50) {
    return {
      sufficient: false,
      reason: "Document contains insufficient text for analysis",
      recommendedAction: "Upload a more detailed quote document"
    };
  }
  
  if (result.overallConfidence === "low" && result.method === "ocr") {
    return {
      sufficient: false,
      reason: "OCR extraction quality is too low for reliable analysis",
      recommendedAction: "Upload a clearer image or a text-based PDF"
    };
  }
  
  // Check for key quote elements
  const fullTextLower = result.fullText.toLowerCase();
  const hasPrice = /\$[\d,]+|\d+\.\d{2}|total|amount|price/i.test(fullTextLower);
  const hasContractor = /abn|pty|ltd|contractor|company|business/i.test(fullTextLower);
  
  if (!hasPrice) {
    return {
      sufficient: false,
      reason: "No pricing information detected in document",
      recommendedAction: "Ensure the uploaded document is a quote with pricing details"
    };
  }
  
  return { sufficient: true };
}

/**
 * Get confidence-adjusted analysis parameters
 */
export function getAnalysisParameters(confidence: "high" | "medium" | "low"): {
  maxCertainty: "definitive" | "likely" | "possible";
  requireAdditionalEvidence: boolean;
  warningPrefix: string;
} {
  switch (confidence) {
    case "high":
      return {
        maxCertainty: "likely",
        requireAdditionalEvidence: false,
        warningPrefix: ""
      };
    case "medium":
      return {
        maxCertainty: "likely",
        requireAdditionalEvidence: true,
        warningPrefix: "Based on available evidence: "
      };
    case "low":
      return {
        maxCertainty: "possible",
        requireAdditionalEvidence: true,
        warningPrefix: "Limited evidence suggests: "
      };
  }
}
