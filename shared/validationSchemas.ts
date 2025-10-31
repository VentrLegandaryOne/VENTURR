import { z } from "zod";

/**
 * Comprehensive validation schemas for Venturr platform
 * Ensures data integrity across all forms and API endpoints
 */

// ============================================================================
// AUTHENTICATION SCHEMAS
// ============================================================================

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// ============================================================================
// ORGANIZATION SCHEMAS
// ============================================================================

export const createOrganizationSchema = z.object({
  name: z.string().min(2, "Organization name must be at least 2 characters").max(255),
  description: z.string().optional(),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
});

export const updateOrganizationSchema = createOrganizationSchema.partial();

// ============================================================================
// PROJECT SCHEMAS
// ============================================================================

export const createProjectSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  title: z.string().min(3, "Project title must be at least 3 characters").max(255),
  address: z.string().min(5, "Address must be at least 5 characters").optional(),
  clientName: z.string().max(255).optional(),
  clientEmail: z.string().email("Invalid email address").optional().or(z.literal("")),
  clientPhone: z.string().regex(/^[\d\s\-\+\(\)]+$/, "Invalid phone number").optional(),
  propertyType: z.enum(["residential", "commercial", "industrial"]).optional(),
  description: z.string().optional(),
});

export const updateProjectSchema = createProjectSchema.partial();

export const projectStatusSchema = z.enum([
  "draft",
  "quoted",
  "approved",
  "in_progress",
  "completed",
  "canceled",
]);

// ============================================================================
// MEASUREMENT SCHEMAS
// ============================================================================

export const createMeasurementSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  address: z.string().min(5, "Address is required"),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  roofArea: z.number().positive("Roof area must be positive").optional(),
  measurementNotes: z.string().optional(),
  drawingData: z.string().optional(),
  scale: z.string().optional(),
});

export const updateMeasurementSchema = createMeasurementSchema.partial();

// ============================================================================
// TAKEOFF SCHEMAS
// ============================================================================

export const createTakeoffSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  roofLength: z.string().regex(/^\d+(\.\d+)?$/, "Invalid length").optional(),
  roofWidth: z.string().regex(/^\d+(\.\d+)?$/, "Invalid width").optional(),
  roofArea: z.string().regex(/^\d+(\.\d+)?$/, "Invalid area").optional(),
  roofType: z.string().min(1, "Roof type is required"),
  roofPitch: z.string().optional(),
  wastePercentage: z.string().regex(/^\d+(\.\d+)?$/, "Invalid waste percentage").optional(),
  labourRate: z.string().regex(/^\d+(\.\d+)?$/, "Invalid labour rate").optional(),
  profitMargin: z.string().regex(/^\d+(\.\d+)?$/, "Invalid profit margin").optional(),
  includeGst: z.boolean().optional(),
  materials: z.array(z.object({
    materialId: z.string(),
    quantity: z.number().positive("Quantity must be positive"),
    unit: z.string(),
  })).optional(),
});

export const updateTakeoffSchema = createTakeoffSchema.partial();

// ============================================================================
// QUOTE SCHEMAS
// ============================================================================

export const quoteItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.number().positive("Quantity must be positive"),
  unit: z.string().min(1, "Unit is required"),
  unitPrice: z.number().positive("Unit price must be positive"),
  total: z.number().positive("Total must be positive").optional(),
});

export const createQuoteSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  items: z.array(quoteItemSchema).min(1, "At least one item is required"),
  terms: z.string().optional(),
  notes: z.string().optional(),
  validUntil: z.date().optional(),
  deposit: z.number().min(0, "Deposit cannot be negative").optional(),
});

export const updateQuoteSchema = createQuoteSchema.partial();

export const sendQuoteSchema = z.object({
  quoteId: z.string().min(1, "Quote ID is required"),
  recipientEmail: z.string().email("Invalid email address"),
  message: z.string().optional(),
});

// ============================================================================
// CLIENT SCHEMAS
// ============================================================================

export const createClientSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  name: z.string().min(2, "Client name must be at least 2 characters").max(255),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^[\d\s\-\+\(\)]+$/, "Invalid phone number").optional(),
  address: z.string().optional(),
  businessType: z.string().optional(),
  notes: z.string().optional(),
});

export const updateClientSchema = createClientSchema.partial();

// ============================================================================
// MATERIAL SCHEMAS
// ============================================================================

export const createMaterialSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  name: z.string().min(2, "Material name is required").max(255),
  category: z.string().min(1, "Category is required"),
  manufacturer: z.string().min(1, "Manufacturer is required"),
  profile: z.string().optional(),
  thickness: z.string().optional(),
  coating: z.string().optional(),
  pricePerUnit: z.string().regex(/^\d+(\.\d+)?$/, "Invalid price"),
  unit: z.string().min(1, "Unit is required"),
  coverWidth: z.string().optional(),
  minPitch: z.string().optional(),
  maxPitch: z.string().optional(),
});

export const updateMaterialSchema = createMaterialSchema.partial();

// ============================================================================
// COMPLIANCE SCHEMAS
// ============================================================================

export const complianceCheckSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  windRegion: z.enum(["A", "B", "C", "D"]).optional(),
  balRating: z.enum(["BAL-LOW", "BAL-12.5", "BAL-19", "BAL-29", "BAL-40", "BAL-FZ"]).optional(),
  coastalDistance: z.string().optional(),
  saltExposure: z.boolean().optional(),
  cycloneRisk: z.boolean().optional(),
});

// ============================================================================
// PAYMENT SCHEMAS
// ============================================================================

export const paymentSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  amount: z.number().positive("Amount must be positive"),
  currency: z.string().length(3, "Invalid currency code"),
  description: z.string().optional(),
});

export const subscriptionSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  plan: z.enum(["starter", "pro", "growth", "enterprise"]),
  billingCycle: z.enum(["monthly", "annual"]).optional(),
});

// ============================================================================
// FILE UPLOAD SCHEMAS
// ============================================================================

export const fileUploadSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  fileType: z.enum(["document", "image", "attachment", "export"]),
  maxSizeBytes: z.number().positive().optional(),
});

// ============================================================================
// SEARCH & FILTER SCHEMAS
// ============================================================================

export const searchSchema = z.object({
  query: z.string().min(1, "Search query is required").max(255),
  filters: z.object({
    status: z.string().optional(),
    dateFrom: z.date().optional(),
    dateTo: z.date().optional(),
    organizationId: z.string().optional(),
  }).optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

// ============================================================================
// PAGINATION SCHEMAS
// ============================================================================

export const paginationSchema = z.object({
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// ============================================================================
// EXPORT SCHEMAS
// ============================================================================

export const exportSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  format: z.enum(["csv", "xlsx", "pdf"]),
  dataType: z.enum(["projects", "quotes", "measurements", "clients", "materials"]),
  filters: z.object({
    dateFrom: z.date().optional(),
    dateTo: z.date().optional(),
    status: z.string().optional(),
  }).optional(),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type CreateMeasurementInput = z.infer<typeof createMeasurementSchema>;
export type CreateTakeoffInput = z.infer<typeof createTakeoffSchema>;
export type CreateQuoteInput = z.infer<typeof createQuoteSchema>;
export type CreateClientInput = z.infer<typeof createClientSchema>;
export type CreateMaterialInput = z.infer<typeof createMaterialSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
export type SubscriptionInput = z.infer<typeof subscriptionSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
export type ExportInput = z.infer<typeof exportSchema>;

