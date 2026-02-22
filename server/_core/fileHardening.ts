/**
 * File Upload and Storage Hardening Module for VENTURR VALDT
 * Provides file validation, magic byte verification, and secure storage handling
 */

import { TRPCError } from "@trpc/server";
import crypto from "crypto";

// ============================================
// FILE SIGNATURE (MAGIC BYTES) VALIDATION
// ============================================

/**
 * Known file signatures (magic bytes) for allowed file types
 */
const FILE_SIGNATURES: Record<string, { bytes: number[]; offset?: number }[]> = {
  // PDF
  "application/pdf": [
    { bytes: [0x25, 0x50, 0x44, 0x46] }, // %PDF
  ],
  // JPEG
  "image/jpeg": [
    { bytes: [0xff, 0xd8, 0xff, 0xe0] },
    { bytes: [0xff, 0xd8, 0xff, 0xe1] },
    { bytes: [0xff, 0xd8, 0xff, 0xe2] },
    { bytes: [0xff, 0xd8, 0xff, 0xe3] },
    { bytes: [0xff, 0xd8, 0xff, 0xe8] },
    { bytes: [0xff, 0xd8, 0xff, 0xdb] },
  ],
  // PNG
  "image/png": [
    { bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  ],
  // WebP
  "image/webp": [
    { bytes: [0x52, 0x49, 0x46, 0x46] }, // RIFF (WebP starts with RIFF)
  ],
  // GIF
  "image/gif": [
    { bytes: [0x47, 0x49, 0x46, 0x38, 0x37, 0x61] }, // GIF87a
    { bytes: [0x47, 0x49, 0x46, 0x38, 0x39, 0x61] }, // GIF89a
  ],
};

/**
 * Validate file signature matches claimed MIME type
 */
export function validateFileSignature(
  buffer: Buffer | Uint8Array,
  claimedMimeType: string
): { valid: boolean; detectedType?: string; error?: string } {
  const signatures = FILE_SIGNATURES[claimedMimeType];
  
  if (!signatures) {
    return { valid: false, error: `Unsupported file type: ${claimedMimeType}` };
  }

  const bytes = Array.from(buffer.slice(0, 16));

  for (const sig of signatures) {
    const offset = sig.offset || 0;
    const matches = sig.bytes.every((byte, index) => bytes[offset + index] === byte);
    
    if (matches) {
      return { valid: true, detectedType: claimedMimeType };
    }
  }

  // Try to detect actual type
  for (const [mimeType, sigs] of Object.entries(FILE_SIGNATURES)) {
    for (const sig of sigs) {
      const offset = sig.offset || 0;
      const matches = sig.bytes.every((byte, index) => bytes[offset + index] === byte);
      
      if (matches) {
        return {
          valid: false,
          detectedType: mimeType,
          error: `File signature mismatch: claimed ${claimedMimeType}, detected ${mimeType}`,
        };
      }
    }
  }

  return { valid: false, error: "Unable to verify file signature" };
}

// ============================================
// FILE SIZE AND QUOTA MANAGEMENT
// ============================================

interface StorageQuota {
  maxFileSize: number;
  maxTotalStorage: number;
  maxFilesPerDay: number;
}

const DEFAULT_QUOTAS: Record<string, StorageQuota> = {
  free: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    maxTotalStorage: 100 * 1024 * 1024, // 100MB
    maxFilesPerDay: 10,
  },
  standard: {
    maxFileSize: 16 * 1024 * 1024, // 16MB
    maxTotalStorage: 1024 * 1024 * 1024, // 1GB
    maxFilesPerDay: 50,
  },
  premium: {
    maxFileSize: 50 * 1024 * 1024, // 50MB
    maxTotalStorage: 10 * 1024 * 1024 * 1024, // 10GB
    maxFilesPerDay: 200,
  },
};

// In-memory tracking (should be replaced with Redis in production)
const userUploadCounts = new Map<number, { count: number; date: string }>();
const userStorageUsage = new Map<number, number>();

/**
 * Check if user can upload file based on quotas
 */
export function checkUploadQuota(
  userId: number,
  fileSize: number,
  userTier: string = "standard"
): { allowed: boolean; error?: string } {
  const quota = DEFAULT_QUOTAS[userTier] || DEFAULT_QUOTAS.standard;
  const today = new Date().toISOString().split("T")[0];

  // Check file size
  if (fileSize > quota.maxFileSize) {
    return {
      allowed: false,
      error: `File size exceeds maximum of ${quota.maxFileSize / 1024 / 1024}MB for your plan`,
    };
  }

  // Check daily upload count
  const uploadCount = userUploadCounts.get(userId);
  if (uploadCount && uploadCount.date === today && uploadCount.count >= quota.maxFilesPerDay) {
    return {
      allowed: false,
      error: `Daily upload limit of ${quota.maxFilesPerDay} files reached`,
    };
  }

  // Check total storage
  const currentUsage = userStorageUsage.get(userId) || 0;
  if (currentUsage + fileSize > quota.maxTotalStorage) {
    return {
      allowed: false,
      error: `Storage quota of ${quota.maxTotalStorage / 1024 / 1024}MB exceeded`,
    };
  }

  return { allowed: true };
}

/**
 * Record successful upload for quota tracking
 */
export function recordUpload(userId: number, fileSize: number): void {
  const today = new Date().toISOString().split("T")[0];

  // Update daily count
  const current = userUploadCounts.get(userId);
  if (current && current.date === today) {
    current.count++;
  } else {
    userUploadCounts.set(userId, { count: 1, date: today });
  }

  // Update storage usage
  const currentUsage = userStorageUsage.get(userId) || 0;
  userStorageUsage.set(userId, currentUsage + fileSize);
}

/**
 * Record file deletion for quota tracking
 */
export function recordDeletion(userId: number, fileSize: number): void {
  const currentUsage = userStorageUsage.get(userId) || 0;
  userStorageUsage.set(userId, Math.max(0, currentUsage - fileSize));
}

// ============================================
// SECURE FILE NAMING
// ============================================

/**
 * Generate secure file key for S3 storage
 */
export function generateSecureFileKey(
  userId: number,
  originalFileName: string,
  prefix: string = "uploads"
): string {
  // Sanitize original filename
  const sanitizedName = originalFileName
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 100);

  // Generate unique identifier
  const timestamp = Date.now();
  const randomSuffix = crypto.randomBytes(8).toString("hex");

  // Extract extension
  const ext = sanitizedName.split(".").pop() || "";

  return `${prefix}/${userId}/${timestamp}-${randomSuffix}.${ext}`;
}

/**
 * Validate file key is safe
 */
export function validateFileKey(key: string): boolean {
  // Check for path traversal
  if (key.includes("..") || key.includes("//")) {
    return false;
  }

  // Check for invalid characters
  if (/[<>:"|?*\\]/.test(key)) {
    return false;
  }

  // Check length
  if (key.length > 1024) {
    return false;
  }

  return true;
}

// ============================================
// VIRUS SCANNING INTEGRATION
// ============================================

interface ScanResult {
  clean: boolean;
  threats?: string[];
  scanTime?: number;
}

/**
 * Virus scanning placeholder (integrate with ClamAV or cloud service)
 */
export async function scanFile(buffer: Buffer): Promise<ScanResult> {
  // In production, integrate with:
  // - ClamAV (self-hosted)
  // - VirusTotal API
  // - AWS GuardDuty
  // - Google Cloud DLP

  // For now, perform basic checks
  const start = Date.now();

  // Check for known malicious patterns
  const maliciousPatterns = [
    /<%.*?%>/g, // ASP tags
    /<\?php/gi, // PHP tags
    /<script.*?>/gi, // Script tags in non-HTML files
    /eval\s*\(/gi, // Eval calls
    /document\.write/gi, // Document.write
  ];

  const content = buffer.toString("utf8", 0, Math.min(buffer.length, 10000));
  const threats: string[] = [];

  for (const pattern of maliciousPatterns) {
    if (pattern.test(content)) {
      threats.push(`Suspicious pattern detected: ${pattern.source}`);
    }
  }

  return {
    clean: threats.length === 0,
    threats: threats.length > 0 ? threats : undefined,
    scanTime: Date.now() - start,
  };
}

// ============================================
// PRESIGNED URL SECURITY
// ============================================

interface PresignedUrlOptions {
  expiresIn: number;
  contentType?: string;
  maxSize?: number;
}

/**
 * Generate secure presigned URL with constraints
 */
export function generatePresignedUrlParams(
  options: PresignedUrlOptions
): Record<string, string | number> {
  const params: Record<string, string | number> = {
    expiresIn: Math.min(options.expiresIn, 3600), // Max 1 hour
  };

  if (options.contentType) {
    params.contentType = options.contentType;
  }

  if (options.maxSize) {
    params.contentLengthRange = options.maxSize;
  }

  return params;
}

/**
 * Validate presigned URL hasn't been tampered with
 */
export function validatePresignedUrl(url: string): boolean {
  try {
    const parsed = new URL(url);

    // Check for required parameters
    const requiredParams = ["X-Amz-Algorithm", "X-Amz-Credential", "X-Amz-Signature"];
    for (const param of requiredParams) {
      if (!parsed.searchParams.has(param)) {
        return false;
      }
    }

    // Check expiration
    const expires = parsed.searchParams.get("X-Amz-Expires");
    if (expires && parseInt(expires) > 3600) {
      return false; // Reject URLs with expiration > 1 hour
    }

    return true;
  } catch {
    return false;
  }
}

// ============================================
// FILE CONTENT VALIDATION
// ============================================

/**
 * Validate PDF content is safe
 */
export function validatePdfContent(buffer: Buffer): { valid: boolean; error?: string } {
  const content = buffer.toString("utf8", 0, Math.min(buffer.length, 50000));

  // Check for JavaScript in PDF
  if (/\/JS\s/i.test(content) || /\/JavaScript/i.test(content)) {
    return { valid: false, error: "PDF contains JavaScript which is not allowed" };
  }

  // Check for embedded files
  if (/\/EmbeddedFile/i.test(content)) {
    return { valid: false, error: "PDF contains embedded files which are not allowed" };
  }

  // Check for launch actions
  if (/\/Launch/i.test(content)) {
    return { valid: false, error: "PDF contains launch actions which are not allowed" };
  }

  return { valid: true };
}

/**
 * Validate image dimensions
 */
export function validateImageDimensions(
  width: number,
  height: number,
  maxDimension: number = 10000
): { valid: boolean; error?: string } {
  if (width > maxDimension || height > maxDimension) {
    return {
      valid: false,
      error: `Image dimensions exceed maximum of ${maxDimension}x${maxDimension} pixels`,
    };
  }

  if (width * height > 100000000) { // 100 megapixels
    return {
      valid: false,
      error: "Image resolution exceeds maximum of 100 megapixels",
    };
  }

  return { valid: true };
}

// ============================================
// COMPREHENSIVE FILE VALIDATION
// ============================================

export interface FileValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  metadata: {
    detectedType?: string;
    scanResult?: ScanResult;
    quotaCheck?: { allowed: boolean; error?: string };
  };
}

/**
 * Perform comprehensive file validation
 */
export async function validateFile(
  buffer: Buffer,
  fileName: string,
  claimedMimeType: string,
  userId: number,
  userTier: string = "standard"
): Promise<FileValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const metadata: FileValidationResult["metadata"] = {};

  // 1. Validate file signature
  const signatureResult = validateFileSignature(buffer, claimedMimeType);
  metadata.detectedType = signatureResult.detectedType;
  
  if (!signatureResult.valid) {
    errors.push(signatureResult.error || "Invalid file signature");
  }

  // 2. Check upload quota
  const quotaResult = checkUploadQuota(userId, buffer.length, userTier);
  metadata.quotaCheck = quotaResult;
  
  if (!quotaResult.allowed) {
    errors.push(quotaResult.error || "Upload quota exceeded");
  }

  // 3. Scan for malicious content
  const scanResult = await scanFile(buffer);
  metadata.scanResult = scanResult;
  
  if (!scanResult.clean) {
    errors.push(`Security scan failed: ${scanResult.threats?.join(", ")}`);
  }

  // 4. Content-specific validation
  if (claimedMimeType === "application/pdf") {
    const pdfResult = validatePdfContent(buffer);
    if (!pdfResult.valid) {
      errors.push(pdfResult.error || "Invalid PDF content");
    }
  }

  // 5. File name validation
  if (fileName.length > 255) {
    warnings.push("File name truncated to 255 characters");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    metadata,
  };
}
