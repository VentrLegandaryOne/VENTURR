import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json, bigint, index } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * VALIDT Public Trust Engine - Certification Log
 * Stores certification records for document verification
 */
export const certificationLog = mysqlTable("certification_log", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 64 }).notNull().unique(), // VALIDT-2025-XXXXXX
  documentType: varchar("document_type", { length: 128 }).notNull(),
  projectName: varchar("project_name", { length: 256 }),
  certifiedBy: varchar("certified_by", { length: 256 }).notNull(),
  certificationDate: timestamp("certification_date").notNull(),
  complianceStatus: mysqlEnum("compliance_status", ["compliant", "non-compliant", "pending"]).notNull(),
  originalDocumentUrl: text("original_document_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type CertificationLog = typeof certificationLog.$inferSelect;
export type InsertCertificationLog = typeof certificationLog.$inferInsert;

/**
 * VALIDT Public Trust Engine - Compliance Rules Library
 * Searchable database of Australian building codes and regulations
 */
export const complianceRulesLibrary = mysqlTable("compliance_rules_library", {
  id: int("id").autoincrement().primaryKey(),
  ruleId: varchar("rule_id", { length: 64 }).notNull().unique(), // NCC-RP-001
  category: mysqlEnum("category", ["building_code", "safety", "supplier_spec"]).notNull(),
  trade: mysqlEnum("trade", ["roofing", "plumbing", "electrical", "general"]).notNull(),
  state: mysqlEnum("state", ["nsw", "vic", "qld", "sa", "wa", "tas", "nt", "act", "national"]).notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  summary: text("summary").notNull(),
  fullText: text("full_text"),
  nccReference: varchar("ncc_reference", { length: 128 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type ComplianceRule = typeof complianceRulesLibrary.$inferSelect;
export type InsertComplianceRule = typeof complianceRulesLibrary.$inferInsert;

/**
 * Shared reports table for collaboration
 */
export const sharedReports = mysqlTable("shared_reports", {
  id: int("id").autoincrement().primaryKey(),
  quoteId: int("quote_id").notNull(),
  shareToken: varchar("share_token", { length: 64 }).notNull().unique(),
  sharedBy: int("shared_by").notNull(), // user id
  sharedWith: varchar("shared_with", { length: 320 }), // email address
  accessLevel: mysqlEnum("access_level", ["view", "comment", "negotiate"]).default("view").notNull(),
  expiresAt: timestamp("expires_at"),
  viewCount: int("view_count").default(0).notNull(),
  lastViewedAt: timestamp("last_viewed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type SharedReport = typeof sharedReports.$inferSelect;
export type InsertSharedReport = typeof sharedReports.$inferInsert;

/**
 * Comments table for collaboration
 */
export const comments = mysqlTable("comments", {
  id: int("id").autoincrement().primaryKey(),
  quoteId: int("quote_id").notNull(),
  userId: int("user_id").notNull(),
  section: varchar("section", { length: 64 }).notNull(), // pricing, materials, compliance, warranty
  content: text("content").notNull(),
  parentId: int("parent_id"), // for threaded replies
  isResolved: int("is_resolved").default(0).notNull(), // 0 or 1 for boolean
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Comment = typeof comments.$inferSelect;
export type InsertComment = typeof comments.$inferInsert;

/**
 * Negotiations table for tracking price negotiations
 */
export const negotiations = mysqlTable("negotiations", {
  id: int("id").autoincrement().primaryKey(),
  quoteId: int("quote_id").notNull(),
  proposedBy: int("proposed_by").notNull(), // user id
  originalPrice: int("original_price").notNull(),
  proposedPrice: int("proposed_price").notNull(),
  status: mysqlEnum("status", ["pending", "accepted", "rejected", "countered"]).default("pending").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Negotiation = typeof negotiations.$inferSelect;
export type InsertNegotiation = typeof negotiations.$inferInsert;

/**
 * Quotes table for storing uploaded quote files and metadata
 */
export const quotes = mysqlTable("quotes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // References users.id
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileKey: varchar("fileKey", { length: 500 }).notNull(), // S3 file key
  fileUrl: text("fileUrl").notNull(), // S3 file URL
  fileType: varchar("fileType", { length: 50 }), // e.g., "application/pdf", "image/jpeg"
  fileSize: int("fileSize"), // in bytes
  extractedData: json("extractedData").$type<{
    contractor?: string;
    totalAmount?: number;
    lineItems?: Array<{ description: string; quantity: number; unitPrice: number; total: number }>;
    projectAddress?: string;
    quoteDate?: string;
    validUntil?: string;
    abn?: string;
    phone?: string;
    email?: string;
    licenseNumber?: string;
  }>(), // Parsed quote data
  status: mysqlEnum("status", ["draft", "uploaded", "processing", "completed", "failed"]).default("uploaded").notNull(),
  progressPercentage: int("progressPercentage").default(0).notNull(),
  errorMessage: text("errorMessage"), // Error details if status is "failed"
  isDraft: int("isDraft").default(0).notNull(), // 0 = false, 1 = true (for boolean)
  isFreeCheck: int("isFreeCheck").default(0).notNull(), // 0 = false, 1 = true (for free quote checks)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  processedAt: timestamp("processedAt"),
});

export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = typeof quotes.$inferInsert;

/**
 * Verifications table - stores verification results for quotes
 */
export const verifications = mysqlTable("verifications", {
  id: int("id").autoincrement().primaryKey(),
  quoteId: int("quoteId").notNull().unique(), // References quotes.id (one-to-one)
  
  // Overall scores (0-100)
  overallScore: int("overallScore").notNull(),
  pricingScore: int("pricingScore").notNull(),
  materialsScore: int("materialsScore").notNull(),
  complianceScore: int("complianceScore").notNull(),
  warrantyScore: int("warrantyScore").notNull(),
  
  // Status badge (Green/Amber/Red)
  statusBadge: mysqlEnum("statusBadge", ["green", "amber", "red"]).notNull(),
  
  // Detailed findings for each category
  pricingDetails: json("pricingDetails").$type<{
    marketRate?: number;
    quotedRate?: number;
    variance?: number; // percentage
    findings?: Array<{ item: string; status: "verified" | "flagged"; message: string }>;
  }>(),
  
  materialsDetails: json("materialsDetails").$type<{
    findings?: Array<{ 
      material: string; 
      specified: string; 
      status: "verified" | "flagged"; 
      message: string;
      supplier?: string;
    }>;
  }>(),
  
  complianceDetails: json("complianceDetails").$type<{
    findings?: Array<{ 
      requirement: string; 
      status: "compliant" | "non-compliant" | "needs-review"; 
      message: string;
      reference?: string; // e.g., "HB-39 Section 4.2"
    }>;
  }>(),
  
  warrantyDetails: json("warrantyDetails").$type<{
    findings?: Array<{ 
      item: string; 
      warrantyTerm: string; 
      status: "verified" | "flagged"; 
      message: string;
    }>;
  }>(),
  
  // Flags and recommendations
  flags: json("flags").$type<Array<{
    category: "pricing" | "materials" | "compliance" | "warranty";
    severity: "high" | "medium" | "low";
    message: string;
  }>>(),
  
  recommendations: json("recommendations").$type<Array<{
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
  }>>(),
  
  // Potential savings calculated from pricing analysis
  potentialSavings: int("potentialSavings").default(0),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Verification = typeof verifications.$inferSelect;
export type InsertVerification = typeof verifications.$inferInsert;

/**
 * Reports table - stores generated PDF reports
 */
export const reports = mysqlTable("reports", {
  id: int("id").autoincrement().primaryKey(),
  verificationId: int("verificationId").notNull().unique(), // References verifications.id (one-to-one)
  pdfKey: varchar("pdfKey", { length: 500 }).notNull(), // S3 file key
  pdfUrl: text("pdfUrl").notNull(), // S3 file URL
  pdfSize: int("pdfSize"), // in bytes
  
  // Sharing functionality
  sharedWith: json("sharedWith").$type<Array<{
    email: string;
    sharedAt: string; // ISO timestamp
    accessToken?: string; // Optional token for public access
  }>>(),
  
  downloadCount: int("downloadCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt"), // Optional expiration for shared reports
});

export type Report = typeof reports.$inferSelect;
export type InsertReport = typeof reports.$inferInsert;

/**
 * Materials table - reference data for material specifications and pricing
 */
export const materials = mysqlTable("materials", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(), // e.g., "roofing", "cladding", "guttering"
  supplier: varchar("supplier", { length: 255 }), // e.g., "Lysaght", "Metroll", "Stramit"
  specifications: json("specifications").$type<{
    material?: string; // e.g., "Colorbond Steel"
    thickness?: string; // e.g., "0.42mm BMT"
    profile?: string; // e.g., "Corrugated", "Trimdek"
    coating?: string; // e.g., "Zincalume", "Galvanized"
    color?: string;
  }>(),
  unitPrice: int("unitPrice"), // in cents (e.g., 4500 = $45.00)
  unit: varchar("unit", { length: 50 }), // e.g., "per meter", "per sheet", "per unit"
  installationRequirements: text("installationRequirements"),
  complianceNotes: text("complianceNotes"), // Relevant compliance standards
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Material = typeof materials.$inferSelect;
export type InsertMaterial = typeof materials.$inferInsert;

/**
 * Compliance rules table - regulatory requirements and building codes
 */
export const complianceRules = mysqlTable("complianceRules", {
  id: int("id").autoincrement().primaryKey(),
  ruleCode: varchar("ruleCode", { length: 100 }).notNull().unique(), // e.g., "HB39-4.2", "NCC-3.5.1"
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 100 }).notNull(), // e.g., "roofing", "safety", "structural"
  authority: varchar("authority", { length: 255 }).notNull(), // e.g., "HB-39", "NCC", "NSW Building Commission"
  applicableRegions: json("applicableRegions").$type<Array<string>>(), // e.g., ["NSW", "VIC", "QLD"]
  requirements: json("requirements").$type<Array<{
    requirement: string;
    mandatory: boolean;
    checkpoints?: Array<string>;
  }>>(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OldComplianceRule = typeof complianceRules.$inferSelect;
export type InsertOldComplianceRule = typeof complianceRules.$inferInsert;

// NOTE: Old complianceRules table deprecated - use complianceRulesLibrary for VALIDT public trust engine


/**
 * Comparison groups table - for batch quote comparisons
 */
export const comparisonGroups = mysqlTable("comparison_groups", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(), // References users.id
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["draft", "analyzing", "completed"]).default("draft").notNull(),
  recommendation: json("recommendation").$type<{
    bestQuoteId?: number;
    reasoning?: string;
    keyDifferences?: Array<{ category: string; winner: number; difference: string }>;
    estimatedSavings?: number;
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type ComparisonGroup = typeof comparisonGroups.$inferSelect;
export type InsertComparisonGroup = typeof comparisonGroups.$inferInsert;

/**
 * Comparison items table - links quotes to comparison groups
 */
export const comparisonItems = mysqlTable("comparison_items", {
  id: int("id").autoincrement().primaryKey(),
  groupId: int("group_id").notNull(), // References comparison_groups.id
  quoteId: int("quote_id").notNull(), // References quotes.id
  position: int("position").notNull(), // Display order (1, 2, 3)
  label: varchar("label", { length: 100 }), // e.g., "Option A", "Contractor 1"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ComparisonItem = typeof comparisonItems.$inferSelect;
export type InsertComparisonItem = typeof comparisonItems.$inferInsert;

/**
 * Notifications table - for in-app and email notifications
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(), // References users.id
  type: mysqlEnum("type", [
    "verification_complete",
    "unusual_pricing",
    "compliance_warning",
    "comparison_ready",
    "contractor_review",
    "system_alert"
  ]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  actionUrl: varchar("action_url", { length: 500 }), // Link to relevant page
  actionLabel: varchar("action_label", { length: 100 }), // e.g., "View Report", "Review Quote"
  metadata: json("metadata").$type<{
    quoteId?: number;
    verificationId?: number;
    comparisonId?: number;
    contractorId?: number;
    severity?: "info" | "warning" | "critical";
  }>(),
  isRead: boolean("is_read").default(false).notNull(),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Notification preferences table - user notification settings
 */
export const notificationPreferences = mysqlTable("notification_preferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().unique(), // References users.id
  emailEnabled: boolean("email_enabled").default(true).notNull(),
  emailDigestFrequency: mysqlEnum("email_digest_frequency", ["instant", "daily", "weekly", "never"]).default("instant").notNull(),
  pushEnabled: boolean("push_enabled").default(false).notNull(),
  categories: json("categories").$type<{
    verification_complete?: boolean;
    unusual_pricing?: boolean;
    compliance_warning?: boolean;
    comparison_ready?: boolean;
    contractor_review?: boolean;
    system_alert?: boolean;
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type NotificationPreference = typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreference = typeof notificationPreferences.$inferInsert;

/**
 * Contractors table - contractor profiles and information
 */
export const contractors = mysqlTable("contractors", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  businessName: varchar("business_name", { length: 255 }),
  abn: varchar("abn", { length: 20 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  website: varchar("website", { length: 500 }),
  address: text("address"),
  specialties: json("specialties").$type<Array<string>>(), // e.g., ["roofing", "cladding", "guttering"]
  serviceAreas: json("service_areas").$type<Array<string>>(), // e.g., ["Sydney", "NSW", "Blue Mountains"]
  licenseNumber: varchar("license_number", { length: 100 }),
  insuranceVerified: boolean("insurance_verified").default(false).notNull(),
  isVerified: boolean("is_verified").default(false).notNull(), // Verified by VENTURR
  avgScore: int("avg_score").default(0).notNull(), // Average rating (0-100)
  totalReviews: int("total_reviews").default(0).notNull(),
  totalProjects: int("total_projects").default(0).notNull(),
  totalValue: int("total_value").default(0).notNull(), // Total project value in cents
  badges: json("badges").$type<Array<{
    type: "verified" | "top_rated" | "responsive" | "value" | "quality";
    earnedAt: string;
  }>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Contractor = typeof contractors.$inferSelect;
export type InsertContractor = typeof contractors.$inferInsert;

/**
 * Contractor reviews table - user reviews and ratings for contractors
 */
export const contractorReviews = mysqlTable("contractor_reviews", {
  id: int("id").autoincrement().primaryKey(),
  contractorId: int("contractor_id").notNull(), // References contractors.id
  userId: int("user_id").notNull(), // References users.id
  quoteId: int("quote_id"), // Optional reference to verified quote
  rating: int("rating").notNull(), // 1-5 stars
  qualityScore: int("quality_score"), // 0-100
  valueScore: int("value_score"), // 0-100
  communicationScore: int("communication_score"), // 0-100
  timelinessScore: int("timeliness_score"), // 0-100
  title: varchar("title", { length: 255 }),
  comment: text("comment"),
  projectType: varchar("project_type", { length: 100 }), // e.g., "Roof Replacement", "Gutter Installation"
  projectValue: int("project_value"), // in cents
  projectDate: timestamp("project_date"),
  isVerified: boolean("is_verified").default(false).notNull(), // Verified by quote system
  wouldRecommend: boolean("would_recommend").default(true).notNull(),
  contractorResponse: text("contractor_response"),
  contractorResponseAt: timestamp("contractor_response_at"),
  helpfulCount: int("helpful_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type ContractorReview = typeof contractorReviews.$inferSelect;
export type InsertContractorReview = typeof contractorReviews.$inferInsert;

/**
 * Contractor projects table - project history for contractors
 */
export const contractorProjects = mysqlTable("contractor_projects", {
  id: int("id").autoincrement().primaryKey(),
  contractorId: int("contractor_id").notNull(), // References contractors.id
  projectType: varchar("project_type", { length: 100 }).notNull(),
  projectValue: int("project_value").notNull(), // in cents
  completedDate: timestamp("completed_date").notNull(),
  location: varchar("location", { length: 255 }),
  description: text("description"),
  images: json("images").$type<Array<{ url: string; caption?: string }>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ContractorProject = typeof contractorProjects.$inferSelect;
export type InsertContractorProject = typeof contractorProjects.$inferInsert;

/**
 * Quote templates table - pre-built templates for common construction projects
 */
export const quoteTemplates = mysqlTable("quote_templates", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(), // e.g., "Roofing", "Kitchen", "Bathroom"
  description: text("description").notNull(),
  specifications: json("specifications").$type<{
    materials: string[];
    dimensions: string;
    workmanship: string;
    duration: string;
    standards: string[];
  }>().notNull(),
  complianceRequirements: json("compliance_requirements").$type<{
    buildingCode: string;
    standards: string[];
    permits: string;
    insurance: string;
    licensing: string;
  }>().notNull(),
  estimatedCost: bigint("estimated_cost", { mode: "number" }).notNull(), // in cents
  usageCount: int("usage_count").default(0).notNull(), // Track how many times template is used
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type QuoteTemplate = typeof quoteTemplates.$inferSelect;
export type InsertQuoteTemplate = typeof quoteTemplates.$inferInsert;

/**
 * User templates table - custom templates created by users from their verified quotes
 */
export const userTemplates = mysqlTable("user_templates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(), // References users.id
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }).notNull(), // e.g., "Roofing", "Kitchen", "Bathroom"
  
  // Template from verified quote
  sourceQuoteId: int("source_quote_id"), // References quotes.id (optional)
  
  // Specifications
  specifications: json("specifications").$type<{
    materials: string;
    workmanship: string;
    duration: string;
    standards: string[];
  }>().notNull(),
  
  // Compliance requirements
  complianceRequirements: json("compliance_requirements").$type<{
    buildingCode: string;
    standards: string[];
    permits: string;
    insurance: string;
    licensing: string;
  }>().notNull(),
  
  estimatedCost: bigint("estimated_cost", { mode: "number" }).notNull(), // in cents
  usageCount: int("usage_count").default(0).notNull(),
  
  // Sharing
  isPublic: boolean("is_public").default(false).notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type UserTemplate = typeof userTemplates.$inferSelect;
export type InsertUserTemplate = typeof userTemplates.$inferInsert;

/**
 * Contractor performance metrics table - tracks contractor performance over time
 */
export const contractorPerformanceMetrics = mysqlTable("contractor_performance_metrics", {
  id: int("id").autoincrement().primaryKey(),
  contractorId: int("contractor_id").notNull(), // References contractors.id
  
  // Accuracy metrics
  quoteAccuracyScore: int("quote_accuracy_score").default(0).notNull(), // 0-100, based on quote vs actual cost
  averageVariance: int("average_variance").default(0).notNull(), // Average % difference between quote and actual
  
  // Compliance metrics
  complianceScore: int("compliance_score").default(0).notNull(), // 0-100, based on verification results
  complianceIssuesCount: int("compliance_issues_count").default(0).notNull(),
  
  // Response metrics
  averageResponseTime: int("average_response_time").default(0).notNull(), // in hours
  responseRate: int("response_rate").default(0).notNull(), // 0-100 percentage
  
  // Project completion metrics
  completionRate: int("completion_rate").default(0).notNull(), // 0-100 percentage
  onTimeDeliveryRate: int("on_time_delivery_rate").default(0).notNull(), // 0-100 percentage
  
  // Quality metrics
  averageRating: int("average_rating").default(0).notNull(), // 0-500 (5.00 stars * 100)
  totalReviews: int("total_reviews").default(0).notNull(),
  
  // Volume metrics
  totalQuotesSubmitted: int("total_quotes_submitted").default(0).notNull(),
  totalProjectsCompleted: int("total_projects_completed").default(0).notNull(),
  
  // Time period
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type ContractorPerformanceMetric = typeof contractorPerformanceMetrics.$inferSelect;
export type InsertContractorPerformanceMetric = typeof contractorPerformanceMetrics.$inferInsert;

/**
 * Quote comparison alerts table - tracks pricing outliers and compliance gaps
 */
export const comparisonAlerts = mysqlTable("comparison_alerts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(), // References users.id
  comparisonGroupId: int("comparison_group_id").notNull(), // References comparison_groups.id
  
  alertType: mysqlEnum("alert_type", ["pricing_outlier", "compliance_gap", "missing_info", "recommendation"]).notNull(),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).notNull(),
  
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  
  // Alert details
  details: json("details").$type<{
    quoteIds?: number[];
    variance?: number; // percentage
    complianceIssues?: string[];
    recommendation?: string;
  }>(),
  
  // Notification status
  emailSent: boolean("email_sent").default(false).notNull(),
  emailSentAt: timestamp("email_sent_at"),
  smsSent: boolean("sms_sent").default(false).notNull(),
  smsSentAt: timestamp("sms_sent_at"),
  
  // User interaction
  isRead: boolean("is_read").default(false).notNull(),
  readAt: timestamp("read_at"),
  isDismissed: boolean("is_dismissed").default(false).notNull(),
  dismissedAt: timestamp("dismissed_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type ComparisonAlert = typeof comparisonAlerts.$inferSelect;
export type InsertComparisonAlert = typeof comparisonAlerts.$inferInsert;

/**
 * Review photos table - photos uploaded with contractor reviews
 */
export const reviewPhotos = mysqlTable("review_photos", {
  id: int("id").autoincrement().primaryKey(),
  reviewId: int("review_id").notNull(), // References contractor_reviews.id
  photoUrl: text("photo_url").notNull(),
  caption: varchar("caption", { length: 255 }),
  displayOrder: int("display_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ReviewPhoto = typeof reviewPhotos.$inferSelect;
export type InsertReviewPhoto = typeof reviewPhotos.$inferInsert;

/**
 * Price benchmarks table - regional price data for common project types
 */
export const priceBenchmarks = mysqlTable("price_benchmarks", {
  id: int("id").autoincrement().primaryKey(),
  projectType: varchar("project_type", { length: 100 }).notNull(),
  region: varchar("region", { length: 100 }).notNull(), // e.g., "NSW", "VIC", "QLD"
  avgCost: bigint("avg_cost", { mode: "number" }).notNull(), // in cents
  minCost: bigint("min_cost", { mode: "number" }).notNull(), // in cents
  maxCost: bigint("max_cost", { mode: "number" }).notNull(), // in cents
  sampleSize: int("sample_size").notNull(), // Number of quotes used for benchmark
  confidenceScore: int("confidence_score").notNull(), // 0-100, based on sample size and data quality
  lastUpdated: timestamp("last_updated").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PriceBenchmark = typeof priceBenchmarks.$inferSelect;
export type InsertPriceBenchmark = typeof priceBenchmarks.$inferInsert;

/**
 * Contractor portfolio projects table - showcase completed projects with before/after photos
 */
export const portfolioProjects = mysqlTable("portfolio_projects", {
  id: int("id").autoincrement().primaryKey(),
  contractorId: int("contractor_id").notNull(), // References contractors.id
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  projectType: varchar("project_type", { length: 100 }).notNull(), // e.g., "Roof Replacement", "Kitchen Renovation"
  location: varchar("location", { length: 255 }), // e.g., "Sydney, NSW"
  beforePhotoUrl: text("before_photo_url"),
  afterPhotoUrl: text("after_photo_url").notNull(),
  additionalPhotos: json("additional_photos").$type<Array<{
    url: string;
    caption?: string;
  }>>(),
  completionDate: timestamp("completion_date"),
  projectCost: bigint("project_cost", { mode: "number" }), // in cents
  duration: int("duration"), // in days
  clientTestimonial: text("client_testimonial"),
  displayOrder: int("display_order").default(0).notNull(),
  isPublic: boolean("is_public").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type PortfolioProject = typeof portfolioProjects.$inferSelect;
export type InsertPortfolioProject = typeof portfolioProjects.$inferInsert;

/**
 * Contractor certifications table - professional certifications, licenses, and qualifications
 */
export const contractorCertifications = mysqlTable("contractor_certifications", {
  id: int("id").autoincrement().primaryKey(),
  contractorId: int("contractor_id").notNull(), // References contractors.id
  name: varchar("name", { length: 255 }).notNull(), // e.g., "Licensed Builder", "Master Roofer"
  issuingBody: varchar("issuing_body", { length: 255 }).notNull(), // e.g., "NSW Fair Trading", "MBA"
  certificateNumber: varchar("certificate_number", { length: 100 }),
  issueDate: timestamp("issue_date"),
  expiryDate: timestamp("expiry_date"),
  certificateUrl: text("certificate_url"), // S3 URL to certificate document/image
  isVerified: boolean("is_verified").default(false).notNull(), // Verified by VENTURR
  category: mysqlEnum("category", ["license", "insurance", "qualification", "membership", "award"]).notNull(),
  displayOrder: int("display_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type ContractorCertification = typeof contractorCertifications.$inferSelect;
export type InsertContractorCertification = typeof contractorCertifications.$inferInsert;

/**
 * Contractor comparisons table - tracks which contractors a user has selected for comparison
 * Simple many-to-many relationship between users and contractors
 */
export const contractorComparisons = mysqlTable("contractor_comparisons", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(), // References users.id
  contractorId: int("contractor_id").notNull(), // References contractors.id
  addedAt: timestamp("added_at").defaultNow().notNull(),
});

export type ContractorComparison = typeof contractorComparisons.$inferSelect;
export type InsertContractorComparison = typeof contractorComparisons.$inferInsert;


/**
 * Quote Comparisons table - groups of quotes being compared
 */
export const quoteComparisons = mysqlTable("quote_comparisons", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(), // References users.id
  name: varchar("name", { length: 255 }).notNull(), // e.g., "Roof Replacement Quotes"
  projectType: varchar("project_type", { length: 100 }), // e.g., "Roofing", "Kitchen"
  projectAddress: text("project_address"),
  status: mysqlEnum("status", ["draft", "completed", "archived"]).default("draft").notNull(),
  
  // Comparison results (calculated after all quotes are verified)
  recommendedQuoteId: int("recommended_quote_id"), // The quote with best overall value
  comparisonResults: json("comparison_results").$type<{
    summary: string;
    bestValue: { quoteId: number; reason: string };
    bestPricing: { quoteId: number; score: number };
    bestMaterials: { quoteId: number; score: number };
    bestCompliance: { quoteId: number; score: number };
    bestWarranty: { quoteId: number; score: number };
    warnings: Array<{ quoteId: number; message: string }>;
  }>(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type QuoteComparison = typeof quoteComparisons.$inferSelect;
export type InsertQuoteComparison = typeof quoteComparisons.$inferInsert;

/**
 * Quote Comparison Items table - individual quotes in a comparison
 */
export const quoteComparisonItems = mysqlTable("quote_comparison_items", {
  id: int("id").autoincrement().primaryKey(),
  comparisonId: int("comparison_id").notNull(), // References quote_comparisons.id
  quoteId: int("quote_id").notNull(), // References quotes.id
  displayOrder: int("display_order").default(0).notNull(),
  
  // Category rankings within this comparison (1 = best)
  pricingRank: int("pricing_rank"),
  materialsRank: int("materials_rank"),
  complianceRank: int("compliance_rank"),
  warrantyRank: int("warranty_rank"),
  overallRank: int("overall_rank"),
  
  // Value indicators
  isRecommended: boolean("is_recommended").default(false).notNull(),
  isBestValue: boolean("is_best_value").default(false).notNull(),
  isCheapest: boolean("is_cheapest").default(false).notNull(),
  
  notes: text("notes"), // User notes about this quote
  addedAt: timestamp("added_at").defaultNow().notNull(),
});

export type QuoteComparisonItem = typeof quoteComparisonItems.$inferSelect;
export type InsertQuoteComparisonItem = typeof quoteComparisonItems.$inferInsert;

/**
 * Shared Comparisons table - for sharing comparison results
 */
export const sharedComparisons = mysqlTable("shared_comparisons", {
  id: int("id").autoincrement().primaryKey(),
  comparisonId: int("comparison_id").notNull(), // References quote_comparisons.id
  shareToken: varchar("share_token", { length: 64 }).notNull().unique(),
  sharedBy: int("shared_by").notNull(), // user id
  sharedWith: varchar("shared_with", { length: 320 }), // email address
  accessLevel: mysqlEnum("access_level", ["view", "comment"]).default("view").notNull(),
  expiresAt: timestamp("expires_at"),
  viewCount: int("view_count").default(0).notNull(),
  lastViewedAt: timestamp("last_viewed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type SharedComparison = typeof sharedComparisons.$inferSelect;
export type InsertSharedComparison = typeof sharedComparisons.$inferInsert;


/**
 * Upload Analytics
 * Tracks upload performance, success rates, and error patterns
 */
export const uploadAnalytics = mysqlTable("upload_analytics", {
  id: int("id").autoincrement().primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  quoteId: int("quote_id"), // References quotes.id
  fileName: varchar("file_name", { length: 500 }).notNull(),
  fileSize: int("file_size").notNull(), // bytes
  fileType: varchar("file_type", { length: 100 }).notNull(),
  uploadStartedAt: bigint("upload_started_at", { mode: "number" }).notNull(),
  uploadCompletedAt: bigint("upload_completed_at", { mode: "number" }),
  processingStartedAt: bigint("processing_started_at", { mode: "number" }),
  processingCompletedAt: bigint("processing_completed_at", { mode: "number" }),
  status: mysqlEnum("status", ["uploading", "processing", "completed", "failed"]).default("uploading").notNull(),
  errorType: varchar("error_type", { length: 255 }),
  errorMessage: text("error_message"),
  uploadDurationMs: int("upload_duration_ms"),
  processingDurationMs: int("processing_duration_ms"),
  totalDurationMs: int("total_duration_ms"),
  retryCount: int("retry_count").default(0).notNull(),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
}, (table) => ({
  userIdIdx: index("upload_analytics_user_id_idx").on(table.userId),
  quoteIdIdx: index("upload_analytics_quote_id_idx").on(table.quoteId),
  statusIdx: index("upload_analytics_status_idx").on(table.status),
  createdAtIdx: index("upload_analytics_created_at_idx").on(table.createdAt),
  errorTypeIdx: index("upload_analytics_error_type_idx").on(table.errorType),
}));

export type UploadAnalytics = typeof uploadAnalytics.$inferSelect;
export type InsertUploadAnalytics = typeof uploadAnalytics.$inferInsert;

/**
 * Terms Acceptance Tracking
 * Tracks which version of terms each user has accepted
 */
export const termsAcceptance = mysqlTable("terms_acceptance", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  termsVersion: varchar("terms_version", { length: 32 }).notNull(), // e.g., "v1.0"
  acceptedAt: timestamp("accepted_at").defaultNow().notNull(),
  ipAddress: varchar("ip_address", { length: 45 }), // Support IPv6
  userAgent: text("user_agent"),
}, (table) => ({
  userIdIdx: index("user_id_idx").on(table.userId),
  versionIdx: index("version_idx").on(table.termsVersion),
}));

export type TermsAcceptance = typeof termsAcceptance.$inferSelect;
export type InsertTermsAcceptance = typeof termsAcceptance.$inferInsert;


/**
 * Beta Feedback Collection
 * Collects user feedback during beta testing phase
 */
export const feedback = mysqlTable("feedback", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id"), // Optional - can be anonymous
  
  // Feedback type and category
  type: mysqlEnum("type", ["bug", "feature", "improvement", "general", "praise"]).notNull(),
  category: mysqlEnum("category", [
    "quote_upload", 
    "verification", 
    "comparison", 
    "market_rates", 
    "credentials", 
    "reports", 
    "dashboard", 
    "mobile", 
    "performance", 
    "other"
  ]).notNull(),
  
  // Feedback content
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description").notNull(),
  
  // User satisfaction (1-5 stars)
  rating: int("rating"), // 1-5
  
  // Context information
  pageUrl: varchar("page_url", { length: 500 }),
  userAgent: text("user_agent"),
  screenSize: varchar("screen_size", { length: 32 }), // e.g., "1920x1080"
  
  // Screenshot attachment (S3)
  screenshotKey: varchar("screenshot_key", { length: 500 }),
  screenshotUrl: text("screenshot_url"),
  
  // Admin response
  status: mysqlEnum("status", ["new", "reviewing", "in_progress", "resolved", "wont_fix"]).default("new").notNull(),
  adminNotes: text("admin_notes"),
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: int("resolved_by"), // admin user id
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("feedback_user_id_idx").on(table.userId),
  typeIdx: index("feedback_type_idx").on(table.type),
  statusIdx: index("feedback_status_idx").on(table.status),
  createdAtIdx: index("feedback_created_at_idx").on(table.createdAt),
}));

export type Feedback = typeof feedback.$inferSelect;
export type InsertFeedback = typeof feedback.$inferInsert;


/**
 * Subscriptions table - tracks user subscription plans
 */
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(), // References users.id
  
  // Plan details
  planType: mysqlEnum("plan_type", ["single_report", "household", "tradie_verified"]).notNull(),
  status: mysqlEnum("status", ["active", "cancelled", "expired", "past_due"]).default("active").notNull(),
  
  // Pricing
  priceInCents: int("price_in_cents").notNull(), // Store as cents to avoid floating point issues
  currency: varchar("currency", { length: 3 }).default("AUD").notNull(),
  billingCycle: mysqlEnum("billing_cycle", ["one_time", "monthly", "yearly"]).notNull(),
  
  // Dates
  startDate: timestamp("start_date").defaultNow().notNull(),
  endDate: timestamp("end_date"),
  cancelledAt: timestamp("cancelled_at"),
  
  // Payment provider
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
  
  // Usage tracking (for household plan)
  checksUsed: int("checks_used").default(0).notNull(),
  checksLimit: int("checks_limit"), // null = unlimited
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("subscriptions_user_id_idx").on(table.userId),
  statusIdx: index("subscriptions_status_idx").on(table.status),
  planTypeIdx: index("subscriptions_plan_type_idx").on(table.planType),
}));

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

/**
 * Payments table - tracks individual payment transactions
 */
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(), // References users.id
  subscriptionId: int("subscription_id"), // References subscriptions.id (null for one-time)
  quoteId: int("quote_id"), // For single report purchases
  
  // Payment details
  amountInCents: int("amount_in_cents").notNull(),
  currency: varchar("currency", { length: 3 }).default("AUD").notNull(),
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).default("pending").notNull(),
  
  // Payment method
  paymentMethod: mysqlEnum("payment_method", ["card", "paypal", "bank_transfer"]).default("card").notNull(),
  
  // Stripe details
  stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 255 }),
  stripeChargeId: varchar("stripe_charge_id", { length: 255 }),
  
  // Receipt
  receiptUrl: text("receipt_url"),
  receiptNumber: varchar("receipt_number", { length: 64 }),
  
  // Refund tracking
  refundedAt: timestamp("refunded_at"),
  refundReason: text("refund_reason"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("payments_user_id_idx").on(table.userId),
  subscriptionIdIdx: index("payments_subscription_id_idx").on(table.subscriptionId),
  statusIdx: index("payments_status_idx").on(table.status),
}));

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

/**
 * Report Purchases table - tracks single report purchases
 */
export const reportPurchases = mysqlTable("report_purchases", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id"), // Can be null for anonymous purchases
  email: varchar("email", { length: 320 }).notNull(), // Email to send report to
  quoteId: int("quote_id").notNull(), // References quotes.id
  paymentId: int("payment_id"), // References payments.id
  
  // Purchase details
  priceInCents: int("price_in_cents").notNull(),
  currency: varchar("currency", { length: 3 }).default("AUD").notNull(),
  
  // Access
  accessToken: varchar("access_token", { length: 64 }).notNull().unique(), // For anonymous access
  accessExpiresAt: timestamp("access_expires_at"), // null = never expires
  
  // Delivery
  reportDeliveredAt: timestamp("report_delivered_at"),
  downloadCount: int("download_count").default(0).notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  emailIdx: index("report_purchases_email_idx").on(table.email),
  quoteIdIdx: index("report_purchases_quote_id_idx").on(table.quoteId),
  accessTokenIdx: index("report_purchases_access_token_idx").on(table.accessToken),
}));

export type ReportPurchase = typeof reportPurchases.$inferSelect;
export type InsertReportPurchase = typeof reportPurchases.$inferInsert;

/**
 * Tradie Verification table - tracks tradie verified status
 */
export const tradieVerification = mysqlTable("tradie_verification", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(), // References users.id
  contractorId: int("contractor_id"), // References contractors.id
  
  // Verification status
  status: mysqlEnum("status", ["pending", "verified", "suspended", "rejected"]).default("pending").notNull(),
  verifiedAt: timestamp("verified_at"),
  
  // Badge details
  badgeCode: varchar("badge_code", { length: 64 }).unique(), // e.g., "VV-2025-12345"
  badgeExpiresAt: timestamp("badge_expires_at"),
  
  // Business details
  businessName: varchar("business_name", { length: 255 }).notNull(),
  abn: varchar("abn", { length: 20 }).notNull(),
  licenseNumber: varchar("license_number", { length: 100 }),
  insuranceProvider: varchar("insurance_provider", { length: 255 }),
  insuranceExpiresAt: timestamp("insurance_expires_at"),
  
  // Subscription link
  subscriptionId: int("subscription_id"), // References subscriptions.id
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("tradie_verification_user_id_idx").on(table.userId),
  statusIdx: index("tradie_verification_status_idx").on(table.status),
  badgeCodeIdx: index("tradie_verification_badge_code_idx").on(table.badgeCode),
}));

export type TradieVerification = typeof tradieVerification.$inferSelect;
export type InsertTradieVerification = typeof tradieVerification.$inferInsert;


/**
 * Push Subscriptions table - stores browser push notification subscriptions
 */
export const pushSubscriptions = mysqlTable("push_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  endpoint: text("endpoint").notNull(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  userAgent: varchar("user_agent", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("push_sub_user_id_idx").on(table.userId),
}));
export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type InsertPushSubscription = typeof pushSubscriptions.$inferInsert;

/**
 * Quote Annotations table - user notes on individual quotes
 */
export const quoteAnnotations = mysqlTable("quote_annotations", {
  id: int("id").autoincrement().primaryKey(),
  quoteId: int("quote_id").notNull(),
  userId: int("user_id").notNull(),
  content: text("content").notNull(),
  section: varchar("section", { length: 64 }),
  color: varchar("color", { length: 20 }).default("yellow"),
  isPinned: boolean("is_pinned").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  quoteIdIdx: index("annotation_quote_id_idx").on(table.quoteId),
  userIdIdx: index("annotation_user_id_idx").on(table.userId),
}));
export type QuoteAnnotation = typeof quoteAnnotations.$inferSelect;
export type InsertQuoteAnnotation = typeof quoteAnnotations.$inferInsert;
