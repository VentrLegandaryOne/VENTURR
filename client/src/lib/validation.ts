/**
 * Validation utilities for Australian business data
 */

/**
 * Validate email address format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate and format Australian phone number
 * Accepts: 0412345678, 04 1234 5678, (04) 1234 5678, +61 412 345 678
 * Returns formatted: 0412 345 678
 */
export function validateAustralianPhone(phone: string): { valid: boolean; formatted?: string } {
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // Handle international format (+61)
  if (cleaned.startsWith('+61')) {
    const number = cleaned.substring(3);
    if (number.length === 9 && number.startsWith('4')) {
      return {
        valid: true,
        formatted: `0${number.substring(0, 3)} ${number.substring(3, 6)} ${number.substring(6)}`,
      };
    }
  }
  
  // Handle local format (04...)
  if (cleaned.startsWith('04') && cleaned.length === 10) {
    return {
      valid: true,
      formatted: `${cleaned.substring(0, 4)} ${cleaned.substring(4, 7)} ${cleaned.substring(7)}`,
    };
  }
  
  // Handle landline (02, 03, 07, 08)
  if (cleaned.length === 10 && /^0[2378]/.test(cleaned)) {
    return {
      valid: true,
      formatted: `${cleaned.substring(0, 2)} ${cleaned.substring(2, 6)} ${cleaned.substring(6)}`,
    };
  }
  
  return { valid: false };
}

/**
 * Validate Australian Business Number (ABN)
 * 11 digits with weighted checksum
 */
export function validateABN(abn: string): boolean {
  // Remove spaces and hyphens
  const cleaned = abn.replace(/[\s-]/g, '');
  
  // Must be 11 digits
  if (!/^\d{11}$/.test(cleaned)) {
    return false;
  }
  
  // Apply weighting and checksum algorithm
  const weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
  let sum = 0;
  
  // Subtract 1 from first digit
  const digits = cleaned.split('').map(Number);
  digits[0] -= 1;
  
  // Calculate weighted sum
  for (let i = 0; i < 11; i++) {
    sum += digits[i] * weights[i];
  }
  
  // Valid if sum is divisible by 89
  return sum % 89 === 0;
}

/**
 * Format ABN for display
 * Input: 12345678901
 * Output: 12 345 678 901
 */
export function formatABN(abn: string): string {
  const cleaned = abn.replace(/[\s-]/g, '');
  if (cleaned.length !== 11) return abn;
  
  return `${cleaned.substring(0, 2)} ${cleaned.substring(2, 5)} ${cleaned.substring(5, 8)} ${cleaned.substring(8)}`;
}

/**
 * Validate Australian postcode (4 digits)
 */
export function validatePostcode(postcode: string): boolean {
  return /^\d{4}$/.test(postcode);
}

/**
 * Validate required field
 */
export function validateRequired(value: string | undefined | null): boolean {
  return value !== undefined && value !== null && value.trim().length > 0;
}

/**
 * Validate URL format
 */
export function validateURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate numeric value
 */
export function validateNumber(value: string, min?: number, max?: number): boolean {
  const num = parseFloat(value);
  if (isNaN(num)) return false;
  if (min !== undefined && num < min) return false;
  if (max !== undefined && num > max) return false;
  return true;
}

/**
 * Get validation error message
 */
export function getValidationError(field: string, type: 'required' | 'email' | 'phone' | 'abn' | 'postcode' | 'url' | 'number'): string {
  const messages = {
    required: `${field} is required`,
    email: `Please enter a valid email address`,
    phone: `Please enter a valid Australian phone number`,
    abn: `Please enter a valid 11-digit ABN`,
    postcode: `Please enter a valid 4-digit postcode`,
    url: `Please enter a valid URL`,
    number: `Please enter a valid number`,
  };
  
  return messages[type];
}

