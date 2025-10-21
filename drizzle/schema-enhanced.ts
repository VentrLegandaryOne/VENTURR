import { mysqlEnum, mysqlTable, text, timestamp, varchar, int, decimal, boolean, json, index } from "drizzle-orm/mysql-core";

/**
 * Enhanced Venturr Database Schema
 * Strengthened architecture based on workflow simulation analysis and VENTURR AGI requirements
 */

// ============================================================================
// CORE USER & ORGANIZATION TABLES
// ============================================================================

export const users = mysqlTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow(),
});

export const organizations = mysqlTable("organizations", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  abn: varchar("abn", { length: 20 }),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  address: text("address"),
  subscriptionTier: mysqlEnum("subscriptionTier", ["starter", "pro", "enterprise"]).default("starter"),
  subscriptionStatus: mysqlEnum("subscriptionStatus", ["active", "trial", "expired", "cancelled"]).default("trial"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export const memberships = mysqlTable("memberships", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  organizationId: varchar("organizationId", { length: 64 }).notNull(),
  role: mysqlEnum("role", ["owner", "admin", "member"}).default("member").notNull(),
  joinedAt: timestamp("joinedAt").defaultNow(),
});

// ============================================================================
// PROJECT MANAGEMENT TABLES
// ============================================================================

export const projects = mysqlTable("projects", {
  id: varchar("id", { length: 64 }).primaryKey(),
  organizationId: varchar("organizationId", { length: 64 }).notNull(),
  projectNumber: varchar("projectNumber", { length: 50 }),
  name: varchar("name", { length: 255 }).notNull(),
  clientName: varchar("clientName", { length: 255 }).notNull(),
  clientEmail: varchar("clientEmail", { length: 320 }),
  clientPhone: varchar("clientPhone", { length: 20 }),
  propertyAddress: text("propertyAddress"),
  propertyType: varchar("propertyType", { length: 100 }),
  status: mysqlEnum("status", ["draft", "active", "quoted", "approved", "in_progress", "completed", "cancelled"]).default("draft"),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium"),
  notes: text("notes"),
  createdBy: varchar("createdBy", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
  completedAt: timestamp("completedAt"),
}, (table) => ({
  orgIdx: index("org_idx").on(table.organizationId),
  statusIdx: index("status_idx").on(table.status),
}));

export const projectTemplates = mysqlTable("projectTemplates", {
  id: varchar("id", { length: 64 }).primaryKey(),
  organizationId: varchar("organizationId", { length: 64 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  projectType: varchar("projectType", { length: 100 }),
  templateData: json("templateData"),
  isPublic: boolean("isPublic").default(false),
  usageCount: int("usageCount").default(0),
  createdBy: varchar("createdBy", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

// ============================================================================
// MATERIALS & PRODUCTS TABLES
// ============================================================================

export const materials = mysqlTable("materials", {
  id: varchar("id", { length: 64 }).primaryKey(),
  manufacturer: varchar("manufacturer", { length: 100 }).notNull(),
  productName: varchar("productName", { length: 255 }).notNull(),
  category: mysqlEnum("category", ["roofing_sheet", "fastener", "flashing", "insulation", "accessory"]).notNull(),
  profile: varchar("profile", { length: 100 }),
  bmt: decimal("bmt", { precision: 4, scale: 2 }),
  coverWidth: decimal("coverWidth", { precision: 5, scale: 2 }),
  minPitch: int("minPitch"),
  pricePerUnit: decimal("pricePerUnit", { precision: 10, scale: 2 }).notNull(),
  unit: varchar("unit", { length: 20 }).default("m²"),
  windRating: varchar("windRating", { length: 50 }),
  coastalSuitable: boolean("coastalSuitable").default(false),
  balRatings: json("balRatings"), // Array of BAL ratings
  complianceStandards: json("complianceStandards"), // Array of standards
  specifications: json("specifications"), // Detailed specs
  installationNotes: text("installationNotes"),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
}, (table) => ({
  categoryIdx: index("category_idx").on(table.category),
  manufacturerIdx: index("manufacturer_idx").on(table.manufacturer),
}));

export const materialFavorites = mysqlTable("materialFavorites", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  materialId: varchar("materialId", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const materialUsageHistory = mysqlTable("materialUsageHistory", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  materialId: varchar("materialId", { length: 64 }).notNull(),
  projectId: varchar("projectId", { length: 64 }),
  usedAt: timestamp("usedAt").defaultNow(),
});

// ============================================================================
// CALCULATIONS & TAKEOFFS TABLES
// ============================================================================

export const takeoffs = mysqlTable("takeoffs", {
  id: varchar("id", { length: 64 }).primaryKey(),
  projectId: varchar("projectId", { length: 64 }).notNull(),
  name: varchar("name", { length: 255 }),
  roofType: varchar("roofType", { length: 100 }),
  roofLength: decimal("roofLength", { precision: 10, scale: 2 }),
  roofWidth: decimal("roofWidth", { precision: 10, scale: 2 }),
  roofPitch: int("roofPitch"),
  roofArea: decimal("roofArea", { precision: 10, scale: 2 }),
  materialId: varchar("materialId", { length: 64 }),
  materialCost: decimal("materialCost", { precision: 10, scale: 2 }),
  laborCost: decimal("laborCost", { precision: 10, scale: 2 }),
  totalCost: decimal("totalCost", { precision: 10, scale: 2 }),
  wastePercentage: int("wastePercentage").default(10),
  calculationData: json("calculationData"), // Full calculation breakdown
  environmentalData: json("environmentalData"), // Environmental assessment
  complianceData: json("complianceData"), // Compliance verification
  createdBy: varchar("createdBy", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
}, (table) => ({
  projectIdx: index("project_idx").on(table.projectId),
}));

export const takeoffTemplates = mysqlTable("takeoffTemplates", {
  id: varchar("id", { length: 64 }).primaryKey(),
  organizationId: varchar("organizationId", { length: 64 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  roofType: varchar("roofType", { length: 100 }),
  templateData: json("templateData"),
  isPublic: boolean("isPublic").default(false),
  usageCount: int("usageCount").default(0),
  createdBy: varchar("createdBy", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

// ============================================================================
// QUOTES & LINE ITEMS TABLES
// ============================================================================

export const quotes = mysqlTable("quotes", {
  id: varchar("id", { length: 64 }).primaryKey(),
  projectId: varchar("projectId", { length: 64 }).notNull(),
  quoteNumber: varchar("quoteNumber", { length: 50 }),
  title: varchar("title", { length: 255 }),
  clientName: varchar("clientName", { length: 255 }),
  clientEmail: varchar("clientEmail", { length: 320 }),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }),
  gst: decimal("gst", { precision: 10, scale: 2 }),
  total: decimal("total", { precision: 10, scale: 2 }),
  terms: text("terms"),
  notes: text("notes"),
  validUntil: timestamp("validUntil"),
  status: mysqlEnum("status", ["draft", "sent", "viewed", "accepted", "rejected", "expired"]).default("draft"),
  sentAt: timestamp("sentAt"),
  viewedAt: timestamp("viewedAt"),
  respondedAt: timestamp("respondedAt"),
  pdfUrl: varchar("pdfUrl", { length: 500 }),
  createdBy: varchar("createdBy", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
}, (table) => ({
  projectIdx: index("project_idx").on(table.projectId),
  statusIdx: index("status_idx").on(table.status),
}));

export const quoteLineItems = mysqlTable("quoteLineItems", {
  id: varchar("id", { length: 64 }).primaryKey(),
  quoteId: varchar("quoteId", { length: 64 }).notNull(),
  description: text("description").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  unit: varchar("unit", { length: 20 }).default("m²"),
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  materialId: varchar("materialId", { length: 64 }),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow(),
}, (table) => ({
  quoteIdx: index("quote_idx").on(table.quoteId),
}));

export const quoteTemplates = mysqlTable("quoteTemplates", {
  id: varchar("id", { length: 64 }).primaryKey(),
  organizationId: varchar("organizationId", { length: 64 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  lineItems: json("lineItems"), // Array of line item templates
  terms: text("terms"),
  isPublic: boolean("isPublic").default(false),
  usageCount: int("usageCount").default(0),
  createdBy: varchar("createdBy", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

// ============================================================================
// SITE MEASUREMENTS & DRAWINGS TABLES
// ============================================================================

export const measurements = mysqlTable("measurements", {
  id: varchar("id", { length: 64 }).primaryKey(),
  projectId: varchar("projectId", { length: 64 }).notNull(),
  name: varchar("name", { length: 255 }),
  location: varchar("location", { length: 255 }),
  measurementType: varchar("measurementType", { length: 100 }),
  drawingData: json("drawingData"), // Canvas drawing data
  measurements: json("measurements"), // Array of measurement points
  photos: json("photos"), // Array of photo URLs
  notes: text("notes"),
  scale: decimal("scale", { precision: 10, scale: 2 }),
  createdBy: varchar("createdBy", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
}, (table) => ({
  projectIdx: index("project_idx").on(table.projectId),
}));

export const drawingPresets = mysqlTable("drawingPresets", {
  id: varchar("id", { length: 64 }).primaryKey(),
  organizationId: varchar("organizationId", { length: 64 }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  presetType: varchar("presetType", { length: 100 }), // e.g., "gable_roof", "hip_roof", "valley"
  drawingData: json("drawingData"),
  isPublic: boolean("isPublic").default(false),
  usageCount: int("usageCount").default(0),
  createdBy: varchar("createdBy", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow(),
});

// ============================================================================
// IMPORT/EXPORT & DATA MANAGEMENT TABLES
// ============================================================================

export const importJobs = mysqlTable("importJobs", {
  id: varchar("id", { length: 64 }).primaryKey(),
  organizationId: varchar("organizationId", { length: 64 }).notNull(),
  importType: mysqlEnum("importType", ["materials", "projects", "quotes", "clients"]).notNull(),
  fileName: varchar("fileName", { length: 255 }),
  fileUrl: varchar("fileUrl", { length: 500 }),
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending"),
  totalRecords: int("totalRecords"),
  processedRecords: int("processedRecords").default(0),
  successfulRecords: int("successfulRecords").default(0),
  failedRecords: int("failedRecords").default(0),
  errors: json("errors"), // Array of error messages
  result: json("result"), // Import result summary
  createdBy: varchar("createdBy", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  completedAt: timestamp("completedAt"),
}, (table) => ({
  orgIdx: index("org_idx").on(table.organizationId),
  statusIdx: index("status_idx").on(table.status),
}));

export const exportJobs = mysqlTable("exportJobs", {
  id: varchar("id", { length: 64 }).primaryKey(),
  organizationId: varchar("organizationId", { length: 64 }).notNull(),
  exportType: mysqlEnum("exportType", ["materials", "projects", "quotes", "reports"]).notNull(),
  format: mysqlEnum("format", ["csv", "excel", "json", "pdf"]).notNull(),
  filters: json("filters"), // Export filters/criteria
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending"),
  fileUrl: varchar("fileUrl", { length: 500 }),
  recordCount: int("recordCount"),
  createdBy: varchar("createdBy", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  completedAt: timestamp("completedAt"),
}, (table) => ({
  orgIdx: index("org_idx").on(table.organizationId),
  statusIdx: index("status_idx").on(table.status),
}));

// ============================================================================
// COMPLIANCE & STANDARDS TABLES
// ============================================================================

export const complianceStandards = mysqlTable("complianceStandards", {
  id: varchar("id", { length: 64 }).primaryKey(),
  code: varchar("code", { length: 50 }).notNull(), // e.g., "AS 1562.1"
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }),
  description: text("description"),
  requirements: json("requirements"), // Array of requirements
  applicableRegions: json("applicableRegions"),
  effectiveDate: timestamp("effectiveDate"),
  documentUrl: varchar("documentUrl", { length: 500 }),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export const complianceChecks = mysqlTable("complianceChecks", {
  id: varchar("id", { length: 64 }).primaryKey(),
  projectId: varchar("projectId", { length: 64 }).notNull(),
  standardId: varchar("standardId", { length: 64 }).notNull(),
  checkType: varchar("checkType", { length: 100 }),
  status: mysqlEnum("status", ["pending", "passed", "failed", "not_applicable"]).default("pending"),
  checkData: json("checkData"),
  notes: text("notes"),
  checkedBy: varchar("checkedBy", { length: 64 }),
  checkedAt: timestamp("checkedAt"),
}, (table) => ({
  projectIdx: index("project_idx").on(table.projectId),
}));

// ============================================================================
// ACTIVITY & AUDIT TABLES
// ============================================================================

export const activityLog = mysqlTable("activityLog", {
  id: varchar("id", { length: 64 }).primaryKey(),
  organizationId: varchar("organizationId", { length: 64 }).notNull(),
  userId: varchar("userId", { length: 64 }).notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entityType", { length: 100 }),
  entityId: varchar("entityId", { length: 64 }),
  metadata: json("metadata"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow(),
}, (table) => ({
  orgIdx: index("org_idx").on(table.organizationId),
  userIdx: index("user_idx").on(table.userId),
  actionIdx: index("action_idx").on(table.action),
}));

// ============================================================================
// TYPES
// ============================================================================

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = typeof organizations.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;
export type Material = typeof materials.$inferSelect;
export type InsertMaterial = typeof materials.$inferInsert;
export type Takeoff = typeof takeoffs.$inferSelect;
export type InsertTakeoff = typeof takeoffs.$inferInsert;
export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = typeof quotes.$inferInsert;
export type QuoteLineItem = typeof quoteLineItems.$inferSelect;
export type InsertQuoteLineItem = typeof quoteLineItems.$inferInsert;
export type Measurement = typeof measurements.$inferSelect;
export type InsertMeasurement = typeof measurements.$inferInsert;
export type ImportJob = typeof importJobs.$inferSelect;
export type InsertImportJob = typeof importJobs.$inferInsert;
export type ExportJob = typeof exportJobs.$inferSelect;
export type InsertExportJob = typeof exportJobs.$inferInsert;

