/**
 * VENTURR VALDT - Deterministic Quote Parser
 * 
 * This module provides reliable quote parsing using pattern matching
 * and structured extraction rules. No AI dependency required for core functionality.
 * 
 * Supports:
 * - PDF text extraction
 * - Common quote formats (itemized, lump sum, hybrid)
 * - Australian business number (ABN) validation
 * - License number extraction
 * - Contact information parsing
 */

// ============================================================================
// TYPES
// ============================================================================

export interface ParsedQuote {
  contractor: {
    name: string | null;
    abn: string | null;
    abnValid: boolean;
    licenseNumber: string | null;
    licenseType: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
  };
  project: {
    address: string | null;
    description: string | null;
    type: string | null;
  };
  pricing: {
    totalAmount: number | null; // cents
    gstAmount: number | null; // cents
    subtotal: number | null; // cents
    depositRequired: number | null; // cents
    paymentTerms: string | null;
  };
  dates: {
    quoteDate: string | null;
    validUntil: string | null;
    estimatedStart: string | null;
    estimatedDuration: string | null;
  };
  lineItems: ParsedLineItem[];
  warranty: {
    workmanship: string | null;
    materials: string | null;
    manufacturer: string | null;
  };
  rawText: string;
  confidence: number; // 0-100
  parsingNotes: string[];
}

export interface ParsedLineItem {
  description: string;
  quantity: number | null;
  unit: string | null;
  unitPrice: number | null; // cents
  total: number | null; // cents
  category: LineItemCategory;
  confidence: number;
}

export type LineItemCategory = 
  | "labor"
  | "materials"
  | "equipment"
  | "disposal"
  | "permits"
  | "contingency"
  | "margin"
  | "other";

// ============================================================================
// ABN VALIDATION
// Source: Australian Business Register validation algorithm
// ============================================================================

/**
 * Validate Australian Business Number (ABN)
 * Uses the official ATO checksum algorithm
 */
export function validateABN(abn: string): { valid: boolean; formatted: string | null } {
  // Remove spaces and non-digits
  const cleanABN = abn.replace(/\D/g, "");
  
  if (cleanABN.length !== 11) {
    return { valid: false, formatted: null };
  }
  
  // ABN validation weights
  const weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
  
  // Subtract 1 from first digit
  const digits = cleanABN.split("").map(Number);
  digits[0] -= 1;
  
  // Calculate weighted sum
  let sum = 0;
  for (let i = 0; i < 11; i++) {
    sum += digits[i] * weights[i];
  }
  
  // Valid if divisible by 89
  const valid = sum % 89 === 0;
  
  // Format as XX XXX XXX XXX
  const formatted = valid 
    ? `${cleanABN.slice(0, 2)} ${cleanABN.slice(2, 5)} ${cleanABN.slice(5, 8)} ${cleanABN.slice(8, 11)}`
    : null;
  
  return { valid, formatted };
}

// ============================================================================
// PATTERN MATCHERS
// ============================================================================

const PATTERNS = {
  // ABN patterns
  abn: /\b(?:ABN|A\.B\.N\.?)\s*:?\s*(\d{2}\s?\d{3}\s?\d{3}\s?\d{3})\b/i,
  abnAlt: /\b(\d{2}\s?\d{3}\s?\d{3}\s?\d{3})\b/g,
  
  // License patterns (state-specific)
  licenseNSW: /\b(?:Lic(?:ence|ense)?|License)\s*(?:No\.?|Number|#)?\s*:?\s*(\d{5,8}[A-Z]?)\b/i,
  licenseQLD: /\b(?:QBCC|BSA)\s*(?:Lic(?:ence|ense)?|License)?\s*(?:No\.?|Number|#)?\s*:?\s*(\d{6,8})\b/i,
  licenseVIC: /\b(?:VBA|RBP)\s*(?:Reg(?:istration)?|Lic(?:ence|ense)?)?\s*(?:No\.?|Number|#)?\s*:?\s*([A-Z]{2,3}\d{5,7})\b/i,
  
  // Contact patterns
  phone: /\b(?:Ph(?:one)?|Tel|Mobile|M|T)\s*:?\s*((?:\+?61|0)[2-9]\d{8}|\d{4}\s?\d{3}\s?\d{3})\b/i,
  email: /\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/i,
  
  // Address patterns
  address: /\b(\d{1,5}\s+[A-Za-z\s]+(?:Street|St|Road|Rd|Avenue|Ave|Drive|Dr|Court|Ct|Place|Pl|Lane|Ln|Way|Crescent|Cres|Boulevard|Blvd|Circuit|Cct|Close|Cl)[,\s]+[A-Za-z\s]+[,\s]+(?:NSW|VIC|QLD|SA|WA|TAS|NT|ACT)\s*\d{4})\b/i,
  
  // Money patterns
  money: /\$\s*([\d,]+(?:\.\d{2})?)/g,
  moneyTotal: /(?:Total|Grand\s*Total|Amount\s*Due|Quote\s*Total|TOTAL)\s*:?\s*\$?\s*([\d,]+(?:\.\d{2})?)/i,
  moneyGST: /(?:GST|G\.S\.T\.)\s*(?:Included|Inc\.?)?\s*:?\s*\$?\s*([\d,]+(?:\.\d{2})?)/i,
  moneySubtotal: /(?:Sub\s*-?\s*Total|Subtotal|Ex\s*GST)\s*:?\s*\$?\s*([\d,]+(?:\.\d{2})?)/i,
  moneyDeposit: /(?:Deposit|Down\s*Payment)\s*(?:Required)?\s*:?\s*\$?\s*([\d,]+(?:\.\d{2})?)/i,
  
  // Date patterns
  date: /\b(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})\b/g,
  dateQuote: /(?:Quote\s*Date|Date|Dated)\s*:?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
  dateValid: /(?:Valid\s*(?:Until|To)|Expires?|Expiry)\s*:?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
  
  // Warranty patterns
  warrantyWork: /(?:Workmanship|Labour|Labor)\s*(?:Warranty|Guarantee)\s*:?\s*(\d+\s*(?:year|yr|month|mth)s?)/i,
  warrantyMaterials: /(?:Material|Product)\s*(?:Warranty|Guarantee)\s*:?\s*(\d+\s*(?:year|yr|month|mth)s?)/i,
  
  // Line item patterns
  lineItem: /^(.+?)\s+(\d+(?:\.\d+)?)\s*(sqm|m2|lm|m|ea|each|hrs?|hours?|days?|set|lot|item)?\s*[@x×]\s*\$?([\d,]+(?:\.\d{2})?)\s*(?:=|:)?\s*\$?([\d,]+(?:\.\d{2})?)?$/gim,
  lineItemSimple: /^(.+?)\s+\$?([\d,]+(?:\.\d{2})?)$/gim
};

// ============================================================================
// CATEGORY DETECTION
// ============================================================================

const CATEGORY_KEYWORDS: Record<LineItemCategory, string[]> = {
  labor: [
    "labour", "labor", "installation", "install", "fitting", "fit",
    "workmanship", "tradesman", "plumber", "electrician", "carpenter",
    "roofer", "tiler", "painter", "hours", "days", "man-hours"
  ],
  materials: [
    "colorbond", "zincalume", "steel", "metal", "sheet", "roofing",
    "gutter", "downpipe", "flashing", "ridge", "valley", "sarking",
    "insulation", "timber", "battens", "screws", "fasteners", "nails",
    "sealant", "silicone", "membrane", "tile", "cement"
  ],
  equipment: [
    "scaffold", "scaffolding", "crane", "lift", "hoist", "equipment",
    "hire", "rental", "machinery", "tools", "safety"
  ],
  disposal: [
    "disposal", "removal", "waste", "rubbish", "skip", "bin",
    "asbestos", "demolition", "demo", "strip", "strip-out"
  ],
  permits: [
    "permit", "council", "approval", "certification", "inspection",
    "compliance", "engineering", "structural"
  ],
  contingency: [
    "contingency", "allowance", "provisional", "PC", "prime cost",
    "variation", "unforeseen"
  ],
  margin: [
    "margin", "profit", "overhead", "admin", "administration",
    "management", "supervision", "project management"
  ],
  other: []
};

function categorizeLineItem(description: string): LineItemCategory {
  const lowerDesc = description.toLowerCase();
  
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(keyword => lowerDesc.includes(keyword))) {
      return category as LineItemCategory;
    }
  }
  
  return "other";
}

// ============================================================================
// PARSING FUNCTIONS
// ============================================================================

/**
 * Parse money string to cents
 */
function parseMoney(value: string | null): number | null {
  if (!value) return null;
  const cleaned = value.replace(/[$,\s]/g, "");
  const amount = parseFloat(cleaned);
  if (isNaN(amount)) return null;
  return Math.round(amount * 100); // Convert to cents
}

/**
 * Parse date string to ISO format
 */
function parseDate(value: string | null): string | null {
  if (!value) return null;
  
  // Try common Australian date formats
  const parts = value.split(/[\/\-\.]/);
  if (parts.length !== 3) return null;
  
  let day = parseInt(parts[0]);
  let month = parseInt(parts[1]);
  let year = parseInt(parts[2]);
  
  // Handle 2-digit years
  if (year < 100) {
    year += year > 50 ? 1900 : 2000;
  }
  
  // Validate
  if (day < 1 || day > 31 || month < 1 || month > 12) return null;
  
  return `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
}

/**
 * Extract line items from text
 */
function extractLineItems(text: string): ParsedLineItem[] {
  const items: ParsedLineItem[] = [];
  const lines = text.split("\n");
  
  for (const line of lines) {
    // Skip empty lines and headers
    if (!line.trim() || line.length < 10) continue;
    
    // Try detailed line item pattern
    const detailedMatch = line.match(/^(.+?)\s+(\d+(?:\.\d+)?)\s*(sqm|m2|lm|m|ea|each|hrs?|hours?|days?|set|lot|item)?\s*[@x×]\s*\$?([\d,]+(?:\.\d{2})?)\s*(?:=|:)?\s*\$?([\d,]+(?:\.\d{2})?)?$/i);
    
    if (detailedMatch) {
      const [, description, qty, unit, unitPrice, total] = detailedMatch;
      items.push({
        description: description.trim(),
        quantity: parseFloat(qty),
        unit: unit?.toLowerCase() || null,
        unitPrice: parseMoney(unitPrice),
        total: parseMoney(total) || (parseMoney(unitPrice) ? Math.round(parseMoney(unitPrice)! * parseFloat(qty)) : null),
        category: categorizeLineItem(description),
        confidence: 90
      });
      continue;
    }
    
    // Try simple line item pattern (description + price)
    const simpleMatch = line.match(/^(.+?)\s+\$?([\d,]+(?:\.\d{2})?)$/);
    if (simpleMatch && simpleMatch[1].length > 5) {
      const [, description, price] = simpleMatch;
      // Skip if description looks like a header or total
      if (!/^(total|subtotal|gst|deposit|balance)/i.test(description.trim())) {
        items.push({
          description: description.trim(),
          quantity: 1,
          unit: "item",
          unitPrice: parseMoney(price),
          total: parseMoney(price),
          category: categorizeLineItem(description),
          confidence: 70
        });
      }
    }
  }
  
  return items;
}

/**
 * Detect project type from text
 */
function detectProjectType(text: string): string | null {
  const lowerText = text.toLowerCase();
  
  const projectTypes = [
    { type: "Roof Replacement", keywords: ["re-roof", "reroof", "roof replacement", "new roof"] },
    { type: "Roof Repair", keywords: ["roof repair", "roof fix", "leak repair", "patch"] },
    { type: "Gutter Replacement", keywords: ["gutter replacement", "new gutters", "gutter install"] },
    { type: "Roof Restoration", keywords: ["roof restoration", "roof clean", "roof paint", "recoat"] },
    { type: "Asbestos Removal", keywords: ["asbestos", "fibro", "hazmat"] },
    { type: "Kitchen Renovation", keywords: ["kitchen", "cabinetry", "benchtop"] },
    { type: "Bathroom Renovation", keywords: ["bathroom", "ensuite", "shower", "toilet"] },
    { type: "Electrical Work", keywords: ["electrical", "wiring", "switchboard", "powerpoint"] },
    { type: "Plumbing Work", keywords: ["plumbing", "pipes", "hot water", "drainage"] }
  ];
  
  for (const { type, keywords } of projectTypes) {
    if (keywords.some(kw => lowerText.includes(kw))) {
      return type;
    }
  }
  
  return null;
}

/**
 * Main quote parsing function
 */
export function parseQuoteText(text: string): ParsedQuote {
  const parsingNotes: string[] = [];
  let confidence = 100;
  
  // Extract ABN
  let abn: string | null = null;
  let abnValid = false;
  const abnMatch = text.match(PATTERNS.abn);
  if (abnMatch) {
    const validation = validateABN(abnMatch[1]);
    abn = validation.formatted || abnMatch[1].replace(/\s/g, "");
    abnValid = validation.valid;
    if (!abnValid) {
      parsingNotes.push("ABN found but failed validation check");
      confidence -= 10;
    }
  } else {
    parsingNotes.push("No ABN found in quote");
    confidence -= 15;
  }
  
  // Extract license number
  let licenseNumber: string | null = null;
  let licenseType: string | null = null;
  
  const licenseNSW = text.match(PATTERNS.licenseNSW);
  const licenseQLD = text.match(PATTERNS.licenseQLD);
  const licenseVIC = text.match(PATTERNS.licenseVIC);
  
  if (licenseNSW) {
    licenseNumber = licenseNSW[1];
    licenseType = "NSW Fair Trading";
  } else if (licenseQLD) {
    licenseNumber = licenseQLD[1];
    licenseType = "QBCC";
  } else if (licenseVIC) {
    licenseNumber = licenseVIC[1];
    licenseType = "VBA";
  } else {
    parsingNotes.push("No license number found");
    confidence -= 10;
  }
  
  // Extract contact info
  const phoneMatch = text.match(PATTERNS.phone);
  const emailMatch = text.match(PATTERNS.email);
  const addressMatch = text.match(PATTERNS.address);
  
  // Extract pricing
  const totalMatch = text.match(PATTERNS.moneyTotal);
  const gstMatch = text.match(PATTERNS.moneyGST);
  const subtotalMatch = text.match(PATTERNS.moneySubtotal);
  const depositMatch = text.match(PATTERNS.moneyDeposit);
  
  const totalAmount = parseMoney(totalMatch?.[1] || null);
  if (!totalAmount) {
    parsingNotes.push("Could not extract total amount");
    confidence -= 20;
  }
  
  // Extract dates
  const quoteDateMatch = text.match(PATTERNS.dateQuote);
  const validUntilMatch = text.match(PATTERNS.dateValid);
  
  // Extract warranty
  const warrantyWorkMatch = text.match(PATTERNS.warrantyWork);
  const warrantyMaterialsMatch = text.match(PATTERNS.warrantyMaterials);
  
  // Extract line items
  const lineItems = extractLineItems(text);
  if (lineItems.length === 0) {
    parsingNotes.push("No itemized breakdown found - quote may be lump sum");
    confidence -= 10;
  }
  
  // Detect project type
  const projectType = detectProjectType(text);
  
  // Try to extract contractor name (usually at top of document)
  const lines = text.split("\n").filter(l => l.trim());
  const contractorName = lines.length > 0 ? lines[0].trim() : null;
  
  return {
    contractor: {
      name: contractorName,
      abn,
      abnValid,
      licenseNumber,
      licenseType,
      phone: phoneMatch?.[1] || null,
      email: emailMatch?.[1] || null,
      address: addressMatch?.[1] || null
    },
    project: {
      address: addressMatch?.[1] || null,
      description: null,
      type: projectType
    },
    pricing: {
      totalAmount,
      gstAmount: parseMoney(gstMatch?.[1] || null),
      subtotal: parseMoney(subtotalMatch?.[1] || null),
      depositRequired: parseMoney(depositMatch?.[1] || null),
      paymentTerms: null
    },
    dates: {
      quoteDate: parseDate(quoteDateMatch?.[1] || null),
      validUntil: parseDate(validUntilMatch?.[1] || null),
      estimatedStart: null,
      estimatedDuration: null
    },
    lineItems,
    warranty: {
      workmanship: warrantyWorkMatch?.[1] || null,
      materials: warrantyMaterialsMatch?.[1] || null,
      manufacturer: null
    },
    rawText: text,
    confidence,
    parsingNotes
  };
}

// ============================================================================
// EXPORT
// ============================================================================

export const QUOTE_PARSER = {
  parseQuoteText,
  validateABN,
  categorizeLineItem,
  extractLineItems,
  detectProjectType
};
