/**
 * Authorization utilities for ownership verification and access control
 */

import { TRPCError } from "@trpc/server";
import { getQuoteById } from "../db";
import { getComparisonGroupById } from "../comparisonDb";

/**
 * Verify that a quote belongs to the specified user
 */
export async function verifyQuoteOwnership(quoteId: number, userId: number): Promise<void> {
  const quote = await getQuoteById(quoteId);
  
  if (!quote) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Quote not found",
    });
  }
  
  if (quote.userId !== userId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You do not have permission to access this quote",
    });
  }
}

/**
 * Verify that a comparison belongs to the specified user
 */
export async function verifyComparisonOwnership(comparisonId: number, userId: number): Promise<void> {
  const comparison = await getComparisonGroupById(comparisonId);
  
  if (!comparison) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Comparison not found",
    });
  }
  
  if (comparison.userId !== userId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You do not have permission to access this comparison",
    });
  }
}

/**
 * Verify that a resource belongs to the specified user (generic)
 */
export async function verifyResourceOwnership<T extends { userId: number }>(
  resource: T | null | undefined,
  userId: number,
  resourceName: string = "resource"
): Promise<T> {
  if (!resource) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `${resourceName.charAt(0).toUpperCase() + resourceName.slice(1)} not found`,
    });
  }
  
  if (resource.userId !== userId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `You do not have permission to access this ${resourceName}`,
    });
  }
  
  return resource;
}

/**
 * Check if user is admin
 */
export function requireAdmin(userRole: string): void {
  if (userRole !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }
}

/**
 * Validate file upload
 */
export function validateFileUpload(file: {
  fileName: string;
  fileSize?: number;
  mimeType?: string;
}): void {
  const MAX_FILE_SIZE = 16 * 1024 * 1024; // 16MB
  const ALLOWED_MIME_TYPES = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];
  
  // Validate file size
  if (file.fileSize && file.fileSize > MAX_FILE_SIZE) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    });
  }
  
  // Validate MIME type
  if (file.mimeType && !ALLOWED_MIME_TYPES.includes(file.mimeType)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `File type ${file.mimeType} is not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(", ")}`,
    });
  }
  
  // Validate file name
  const fileName = file.fileName.toLowerCase();
  const hasValidExtension = [".pdf", ".jpg", ".jpeg", ".png", ".webp"].some(ext => 
    fileName.endsWith(ext)
  );
  
  if (!hasValidExtension) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Invalid file extension. Allowed: PDF, JPG, JPEG, PNG, WEBP",
    });
  }
  
  // Check for path traversal attempts
  if (fileName.includes("..") || fileName.includes("/") || fileName.includes("\\")) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Invalid file name",
    });
  }
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Validate pagination parameters
 */
export function validatePagination(params: { limit?: number; offset?: number }) {
  const MAX_LIMIT = 100;
  
  if (params.limit && (params.limit < 1 || params.limit > MAX_LIMIT)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Limit must be between 1 and ${MAX_LIMIT}`,
    });
  }
  
  if (params.offset && params.offset < 0) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Offset must be non-negative",
    });
  }
}
