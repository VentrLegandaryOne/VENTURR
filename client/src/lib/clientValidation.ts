/**
 * Client-Side Validation Utilities
 * Provides comprehensive input validation before server submission
 */

/**
 * File type magic numbers (file signatures)
 * Used to validate actual file content, not just extensions
 */
const FILE_SIGNATURES: Record<string, number[][]> = {
  "application/pdf": [[0x25, 0x50, 0x44, 0x46]], // %PDF
  "image/jpeg": [
    [0xFF, 0xD8, 0xFF, 0xE0], // JFIF
    [0xFF, 0xD8, 0xFF, 0xE1], // Exif
    [0xFF, 0xD8, 0xFF, 0xE2], // Canon
  ],
  "image/png": [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
  "image/webp": [[0x52, 0x49, 0x46, 0x46]], // RIFF
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
    [0x50, 0x4B, 0x03, 0x04], // ZIP format
  ],
  "application/vnd.ms-excel": [
    [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1], // OLE2
  ],
};

/**
 * Validate file type using magic numbers
 * More secure than checking file extensions
 */
export async function validateFileType(
  file: File,
  allowedTypes: string[]
): Promise<{ valid: boolean; detectedType?: string; error?: string }> {
  try {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // Check against all allowed types
    for (const mimeType of allowedTypes) {
      const signatures = FILE_SIGNATURES[mimeType];
      if (!signatures) continue;

      for (const signature of signatures) {
        const matches = signature.every((byte, index) => bytes[index] === byte);
        if (matches) {
          // Verify file extension matches MIME type
          const expectedExtensions = getExtensionsForMimeType(mimeType);
          const actualExtension = file.name.split(".").pop()?.toLowerCase();

          if (actualExtension && expectedExtensions.includes(actualExtension)) {
            return { valid: true, detectedType: mimeType };
          } else {
            return {
              valid: false,
              error: `File extension .${actualExtension} doesn't match content type ${mimeType}`,
            };
          }
        }
      }
    }

    return {
      valid: false,
      error: "File type not allowed or corrupted",
    };
  } catch (error) {
    return {
      valid: false,
      error: "Failed to read file",
    };
  }
}

/**
 * Get file extensions for a MIME type
 */
function getExtensionsForMimeType(mimeType: string): string[] {
  const extensionMap: Record<string, string[]> = {
    "application/pdf": ["pdf"],
    "image/jpeg": ["jpg", "jpeg"],
    "image/png": ["png"],
    "image/webp": ["webp"],
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ["xlsx"],
    "application/vnd.ms-excel": ["xls"],
  };
  return extensionMap[mimeType] || [];
}

/**
 * Sanitize text input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  const div = document.createElement("div");
  div.textContent = input;
  return div.innerHTML;
}

/**
 * Validate Australian Business Number (ABN)
 */
export function validateABN(abn: string): { valid: boolean; error?: string } {
  // Remove spaces and hyphens
  const cleanABN = abn.replace(/[\s-]/g, "");

  // Check length
  if (cleanABN.length !== 11) {
    return { valid: false, error: "ABN must be 11 digits" };
  }

  // Check if all characters are digits
  if (!/^\d+$/.test(cleanABN)) {
    return { valid: false, error: "ABN must contain only digits" };
  }

  // Validate using ABN algorithm
  const weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
  let sum = 0;

  for (let i = 0; i < 11; i++) {
    const digit = parseInt(cleanABN[i]);
    const weight = weights[i];
    const value = i === 0 ? digit - 1 : digit;
    sum += value * weight;
  }

  if (sum % 89 !== 0) {
    return { valid: false, error: "Invalid ABN checksum" };
  }

  return { valid: true };
}

/**
 * Validate Australian phone number
 */
export function validateAustralianPhone(
  phone: string
): { valid: boolean; error?: string } {
  // Remove spaces, hyphens, and parentheses
  const cleanPhone = phone.replace(/[\s\-()]/g, "");

  // Check for international prefix
  const hasInternationalPrefix = cleanPhone.startsWith("+61") || cleanPhone.startsWith("61");
  const phoneWithoutPrefix = hasInternationalPrefix
    ? cleanPhone.replace(/^\+?61/, "0")
    : cleanPhone;

  // Australian phone numbers start with 0 and have 10 digits
  if (!/^0[2-478]\d{8}$/.test(phoneWithoutPrefix)) {
    return {
      valid: false,
      error: "Invalid Australian phone number format",
    };
  }

  return { valid: true };
}

/**
 * Validate email address
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return { valid: false, error: "Invalid email format" };
  }

  // Check for common typos in domain
  const domain = email.split("@")[1].toLowerCase();
  const commonDomains = ["gmail.com", "outlook.com", "hotmail.com", "yahoo.com"];
  const typos: Record<string, string> = {
    "gmial.com": "gmail.com",
    "gmai.com": "gmail.com",
    "outlok.com": "outlook.com",
    "hotmial.com": "hotmail.com",
  };

  if (typos[domain]) {
    return {
      valid: false,
      error: `Did you mean ${typos[domain]}?`,
    };
  }

  return { valid: true };
}

/**
 * Validate Australian postcode
 */
export function validatePostcode(
  postcode: string,
  state?: string
): { valid: boolean; error?: string } {
  const cleanPostcode = postcode.trim();

  if (!/^\d{4}$/.test(cleanPostcode)) {
    return { valid: false, error: "Postcode must be 4 digits" };
  }

  const code = parseInt(cleanPostcode);

  // Validate against state if provided
  if (state) {
    const stateRanges: Record<string, [number, number][]> = {
      NSW: [
        [1000, 2599],
        [2619, 2899],
        [2921, 2999],
      ],
      VIC: [
        [3000, 3999],
        [8000, 8999],
      ],
      QLD: [
        [4000, 4999],
        [9000, 9999],
      ],
      SA: [[5000, 5999]],
      WA: [
        [6000, 6797],
        [6800, 6999],
      ],
      TAS: [[7000, 7999]],
      ACT: [
        [200, 299],
        [2600, 2618],
        [2900, 2920],
      ],
      NT: [[800, 999]],
    };

    const ranges = stateRanges[state.toUpperCase()];
    if (ranges) {
      const inRange = ranges.some(([min, max]) => code >= min && code <= max);
      if (!inRange) {
        return {
          valid: false,
          error: `Postcode ${postcode} is not valid for ${state}`,
        };
      }
    }
  }

  return { valid: true };
}

/**
 * Validate currency amount (AUD)
 */
export function validateCurrency(
  amount: string
): { valid: boolean; value?: number; error?: string } {
  // Remove currency symbols and spaces
  const cleanAmount = amount.replace(/[$,\s]/g, "");

  // Check if valid number
  const value = parseFloat(cleanAmount);
  if (isNaN(value)) {
    return { valid: false, error: "Invalid amount" };
  }

  // Check if positive
  if (value < 0) {
    return { valid: false, error: "Amount must be positive" };
  }

  // Check if reasonable (max $10M for quotes)
  if (value > 10000000) {
    return {
      valid: false,
      error: "Amount exceeds maximum ($10,000,000)",
    };
  }

  // Check decimal places (max 2 for AUD)
  if (!/^\d+(\.\d{1,2})?$/.test(cleanAmount)) {
    return {
      valid: false,
      error: "Amount can have maximum 2 decimal places",
    };
  }

  return { valid: true, value };
}

/**
 * Validate file size
 */
export function validateFileSize(
  file: File,
  maxSizeMB: number = 16
): { valid: boolean; error?: string } {
  const maxBytes = maxSizeMB * 1024 * 1024;

  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: "File is empty",
    };
  }

  return { valid: true };
}

/**
 * Comprehensive form validation
 */
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => { valid: boolean; error?: string };
}

export function validateForm(
  data: Record<string, any>,
  rules: Record<string, ValidationRule>
): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field];

    // Required check
    if (rule.required && (!value || value.toString().trim() === "")) {
      errors[field] = "This field is required";
      continue;
    }

    // Skip other validations if field is empty and not required
    if (!value) continue;

    const stringValue = value.toString();

    // Min length
    if (rule.minLength && stringValue.length < rule.minLength) {
      errors[field] = `Minimum length is ${rule.minLength} characters`;
      continue;
    }

    // Max length
    if (rule.maxLength && stringValue.length > rule.maxLength) {
      errors[field] = `Maximum length is ${rule.maxLength} characters`;
      continue;
    }

    // Pattern
    if (rule.pattern && !rule.pattern.test(stringValue)) {
      errors[field] = "Invalid format";
      continue;
    }

    // Custom validation
    if (rule.custom) {
      const result = rule.custom(value);
      if (!result.valid) {
        errors[field] = result.error || "Invalid value";
      }
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
