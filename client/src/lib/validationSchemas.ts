import { z } from "zod";

// Common field schemas
export const emailSchema = z.string().email("Invalid email address");
export const phoneSchema = z.string().regex(/^[\d\s\-\+\(\)]+$/, "Invalid phone number");
export const addressSchema = z.string().min(5, "Address must be at least 5 characters");
export const urlSchema = z.string().url("Invalid URL").optional().or(z.literal(""));
export const currencySchema = z.number().min(0, "Must be positive");
export const percentageSchema = z.number().min(0, "Must be 0 or higher").max(100, "Must be 100 or lower");

// Project Management Schemas
export const projectCreateSchema = z.object({
  title: z.string().min(3, "Project title must be at least 3 characters"),
  description: z.string().optional(),
  clientName: z.string().min(2, "Client name required"),
  clientEmail: emailSchema,
  clientPhone: phoneSchema,
  address: addressSchema,
  budget: currencySchema,
  deadline: z.date().min(new Date(), "Deadline must be in the future"),
  projectType: z.enum(["residential", "commercial", "industrial"]),
  status: z.enum(["draft", "measuring", "quoting", "quoted", "accepted", "in_progress", "completed"]).default("draft"),
});

export type ProjectCreate = z.infer<typeof projectCreateSchema>;

// Site Measurement Schemas
export const measurementSchema = z.object({
  projectId: z.string().min(1, "Project ID required"),
  roofArea: z.number().min(0, "Roof area must be positive"),
  roofPitch: z.number().min(0, "Roof pitch must be positive"),
  measurementDate: z.date(),
  notes: z.string().optional(),
  drawingData: z.string().optional(),
  scale: z.number().min(0.1, "Scale must be at least 0.1"),
});

export type Measurement = z.infer<typeof measurementSchema>;

// Quote Generator Schemas
export const quoteLineItemSchema = z.object({
  description: z.string().min(1, "Description required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unitPrice: currencySchema,
  unit: z.string().min(1, "Unit required"),
});

export const quoteSchema = z.object({
  projectId: z.string().min(1, "Project ID required"),
  clientName: z.string().min(2, "Client name required"),
  clientEmail: emailSchema,
  lineItems: z.array(quoteLineItemSchema).min(1, "At least one line item required"),
  laborCost: currencySchema,
  markup: percentageSchema.default(25),
  tax: percentageSchema.default(10),
  notes: z.string().optional(),
  validUntil: z.date().min(new Date(), "Valid until date must be in the future"),
});

export type Quote = z.infer<typeof quoteSchema>;

// Client CRM Schemas
export const clientSchema = z.object({
  name: z.string().min(2, "Client name must be at least 2 characters"),
  email: emailSchema,
  phone: phoneSchema,
  address: addressSchema.optional(),
  company: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export type Client = z.infer<typeof clientSchema>;

// Financial Schemas
export const invoiceSchema = z.object({
  projectId: z.string().min(1, "Project ID required"),
  clientName: z.string().min(2, "Client name required"),
  clientEmail: emailSchema,
  invoiceNumber: z.string().min(1, "Invoice number required"),
  issueDate: z.date(),
  dueDate: z.date().min(new Date(), "Due date must be in the future"),
  lineItems: z.array(quoteLineItemSchema).min(1, "At least one line item required"),
  tax: percentageSchema.default(10),
  notes: z.string().optional(),
  paymentTerms: z.enum(["net15", "net30", "net45", "net60"]).default("net30"),
});

export type Invoice = z.infer<typeof invoiceSchema>;

// Expense Schemas
export const expenseSchema = z.object({
  projectId: z.string().optional(),
  description: z.string().min(1, "Description required"),
  amount: currencySchema,
  category: z.enum(["materials", "labor", "equipment", "travel", "other"]),
  date: z.date(),
  receipt: z.string().optional(),
  notes: z.string().optional(),
});

export type Expense = z.infer<typeof expenseSchema>;

// Team Member Schemas
export const teamMemberSchema = z.object({
  name: z.string().min(2, "Team member name required"),
  email: emailSchema,
  phone: phoneSchema,
  role: z.enum(["supervisor", "worker", "admin", "manager"]),
  skills: z.array(z.string()).optional(),
  hourlyRate: currencySchema.optional(),
});

export type TeamMember = z.infer<typeof teamMemberSchema>;

// Material/Inventory Schemas
export const materialSchema = z.object({
  name: z.string().min(1, "Material name required"),
  sku: z.string().min(1, "SKU required"),
  description: z.string().optional(),
  quantity: z.number().min(0, "Quantity must be non-negative"),
  unit: z.string().min(1, "Unit required"),
  unitCost: currencySchema,
  reorderPoint: z.number().min(0, "Reorder point must be non-negative"),
  supplier: z.string().optional(),
});

export type Material = z.infer<typeof materialSchema>;

// Compliance Schemas
export const complianceCheckSchema = z.object({
  projectId: z.string().min(1, "Project ID required"),
  standard: z.enum(["AS1562.1", "AS/NZS1170.2", "AS3959", "NCC2022"]),
  requirement: z.string().min(1, "Requirement description required"),
  status: z.enum(["compliant", "non_compliant", "pending_review"]),
  notes: z.string().optional(),
  documentUrl: urlSchema,
});

export type ComplianceCheck = z.infer<typeof complianceCheckSchema>;

// Login/Auth Schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type Login = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  companyName: z.string().min(2, "Company name required"),
  fullName: z.string().min(2, "Full name required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type Signup = z.infer<typeof signupSchema>;

