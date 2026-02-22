import { z } from "zod";

/**
 * Quote Upload Validation
 * - File type: PDF, PNG, JPG only
 * - File size: Max 16MB
 */
export const quoteUploadSchema = z.object({
  fileName: z.string().min(1, "File name is required"),
  fileSize: z.number()
    .positive("File size must be positive")
    .max(16 * 1024 * 1024, "File size must not exceed 16MB"),
  mimeType: z.enum(["application/pdf", "image/png", "image/jpeg", "image/jpg"], {
    message: "File must be PDF, PNG, or JPG"
  }),
});

export type QuoteUploadInput = z.infer<typeof quoteUploadSchema>;

/**
 * Contractor Rating Validation
 * - Rating: 1-5 stars (required)
 * - Comment: Optional, max 500 characters
 */
export const contractorRatingSchema = z.object({
  contractorId: z.number().positive("Contractor ID is required"),
  rating: z.number()
    .int("Rating must be a whole number")
    .min(1, "Rating must be at least 1 star")
    .max(5, "Rating must be at most 5 stars"),
  comment: z.string()
    .max(500, "Comment must not exceed 500 characters")
    .optional()
    .or(z.literal("")),
  quoteId: z.number().positive().optional(),
});

export type ContractorRatingInput = z.infer<typeof contractorRatingSchema>;

/**
 * Notification Preferences Validation
 */
export const notificationPreferencesSchema = z.object({
  emailDigest: z.boolean(),
  pushEnabled: z.boolean(),
  categories: z.array(z.string()).optional(),
});

export type NotificationPreferencesInput = z.infer<typeof notificationPreferencesSchema>;

/**
 * Comparison Group Validation
 */
export const comparisonGroupSchema = z.object({
  name: z.string().min(1, "Comparison name is required").max(100, "Name must not exceed 100 characters"),
  quoteIds: z.array(z.number().positive())
    .min(2, "At least 2 quotes are required for comparison")
    .max(3, "Maximum 3 quotes can be compared at once"),
});

export type ComparisonGroupInput = z.infer<typeof comparisonGroupSchema>;

/**
 * Contractor Search Filters Validation
 */
export const contractorSearchSchema = z.object({
  query: z.string().optional(),
  minRating: z.number().min(0).max(5).optional(),
  maxRating: z.number().min(0).max(5).optional(),
  projectTypes: z.array(z.string()).optional(),
  location: z.string().optional(),
  radius: z.number().positive().optional(), // in kilometers
  verifiedOnly: z.boolean().optional(),
  limit: z.number().positive().max(100).default(20),
  offset: z.number().min(0).default(0),
});

export type ContractorSearchInput = z.infer<typeof contractorSearchSchema>;

/**
 * Helper function to format Zod validation errors
 */
export function formatZodError(error: z.ZodError): string {
  return error.issues.map((err: any) => `${err.path.join('.')}: ${err.message}`).join(', ');
}

/**
 * Enhanced File Upload Validation with Security Checks
 */
export const secureFileUploadSchema = z.object({
  fileName: z.string()
    .min(1, "File name is required")
    .max(255, "File name too long")
    .regex(/^[a-zA-Z0-9._\-\s]+$/, "File name contains invalid characters")
    .transform((val) => val.trim()),
  
  fileType: z.enum([
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
  ], { message: "Unsupported file type" }),
  
  fileSize: z.number()
    .positive("File size must be positive")
    .max(16 * 1024 * 1024, "File size must be less than 16MB")
    .min(100, "File size too small"),
  
  fileData: z.string()
    .min(1, "File data is required")
    .refine((data) => {
      try {
        return /^data:[a-z]+\/[a-z0-9\-\+\.]+;base64,/.test(data);
      } catch {
        return false;
      }
    }, "Invalid file data format"),
});

/**
 * Share Link Validation with Security Constraints
 */
export const shareLinkSchema = z.object({
  quoteId: z.number().int().positive(),
  accessLevel: z.enum(["view", "comment", "edit"]).optional().default("view"),
  expiresInDays: z.number()
    .int()
    .min(1, "Expiration must be at least 1 day")
    .max(90, "Expiration cannot exceed 90 days")
    .optional()
    .default(7),
});

/**
 * User Profile Validation
 */
export const userProfileSchema = z.object({
  name: z.string()
    .min(1, "Name is required")
    .max(100, "Name too long")
    .regex(/^[a-zA-Z\s\-']+$/, "Name contains invalid characters")
    .optional(),
  email: z.string()
    .email("Invalid email address")
    .max(255, "Email too long")
    .optional(),
  company: z.string()
    .max(200, "Company name too long")
    .optional(),
});

/**
 * Feedback Validation
 */
export const feedbackSchema = z.object({
  quoteId: z.number().int().positive(),
  rating: z.number()
    .int()
    .min(1, "Rating must be between 1 and 5")
    .max(5, "Rating must be between 1 and 5"),
  feedback: z.string()
    .max(1000, "Feedback too long")
    .optional(),
  category: z.enum(["accuracy", "speed", "usability", "features", "other"])
    .optional(),
});

/**
 * Sanitization Utilities
 */
export const sanitizeHtml = (input: string): string => {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
};

export const sanitizeFileName = (fileName: string): string => {
  return fileName
    .replace(/[^a-zA-Z0-9._\-\s]/g, "")
    .replace(/\s+/g, "_")
    .substring(0, 255);
};

export const validateFileExtension = (fileName: string, mimeType: string): boolean => {
  const ext = fileName.split(".").pop()?.toLowerCase();
  const validExtensions: Record<string, string[]> = {
    "application/pdf": ["pdf"],
    "image/jpeg": ["jpg", "jpeg"],
    "image/png": ["png"],
    "image/webp": ["webp"],
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ["xlsx"],
    "application/vnd.ms-excel": ["xls"],
  };
  return validExtensions[mimeType]?.includes(ext || "") || false;
};

/**
 * Rate Limiting Configuration
 */
export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export const rateLimitConfigs: Record<string, RateLimitConfig> = {
  upload: { windowMs: 60 * 60 * 1000, maxRequests: 10 },
  share: { windowMs: 60 * 1000, maxRequests: 5 },
  feedback: { windowMs: 60 * 1000, maxRequests: 3 },
  delete: { windowMs: 60 * 1000, maxRequests: 10 },
};

/**
 * Constants
 */
export const MAX_LENGTHS = {
  fileName: 255,
  email: 255,
  name: 100,
  company: 200,
  message: 500,
  feedback: 1000,
  searchQuery: 200,
} as const;

export const FILE_SIZE_LIMITS = {
  maxSize: 16 * 1024 * 1024,
  minSize: 100,
} as const;

export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
] as const;

export type AllowedMimeType = typeof ALLOWED_MIME_TYPES[number];
