import { mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Organization/Company tables
export const organizations = mysqlTable("organizations", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  ownerId: varchar("ownerId", { length: 64 }).notNull(),
  subscriptionPlan: mysqlEnum("subscriptionPlan", ["starter", "pro", "growth", "enterprise"]).default("starter").notNull(),
  subscriptionStatus: mysqlEnum("subscriptionStatus", ["active", "trialing", "canceled", "incomplete", "past_due"]).default("trialing").notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = typeof organizations.$inferInsert;

// Organization membership
export const memberships = mysqlTable("memberships", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  organizationId: varchar("organizationId", { length: 64 }).notNull(),
  role: mysqlEnum("role", ["owner", "admin", "member"]).default("member").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Membership = typeof memberships.$inferSelect;
export type InsertMembership = typeof memberships.$inferInsert;

// Projects table
export const projects = mysqlTable("projects", {
  id: varchar("id", { length: 64 }).primaryKey(),
  organizationId: varchar("organizationId", { length: 64 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  address: text("address"),
  clientName: varchar("clientName", { length: 255 }),
  clientEmail: varchar("clientEmail", { length: 320 }),
  clientPhone: varchar("clientPhone", { length: 50 }),
  propertyType: mysqlEnum("propertyType", ["residential", "commercial", "industrial"]).default("residential"),
  status: mysqlEnum("status", ["draft", "quoted", "approved", "in_progress", "completed", "canceled"]).default("draft").notNull(),
  // Environmental factors
  location: text("location"),
  coastalDistance: varchar("coastalDistance", { length: 20 }),
  windRegion: mysqlEnum("windRegion", ["A", "B", "C", "D"]),
  balRating: mysqlEnum("balRating", ["BAL-LOW", "BAL-12.5", "BAL-19", "BAL-29", "BAL-40", "BAL-FZ"]),
  saltExposure: varchar("saltExposure", { length: 10 }),
  cycloneRisk: varchar("cycloneRisk", { length: 10 }),
  createdBy: varchar("createdBy", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

// Takeoffs (material calculations)
export const takeoffs = mysqlTable("takeoffs", {
  id: varchar("id", { length: 64 }).primaryKey(),
  projectId: varchar("projectId", { length: 64 }).notNull(),
  roofLength: varchar("roofLength", { length: 20 }),
  roofWidth: varchar("roofWidth", { length: 20 }),
  roofArea: varchar("roofArea", { length: 20 }),
  roofType: varchar("roofType", { length: 100 }),
  roofPitch: varchar("roofPitch", { length: 50 }),
  wastePercentage: varchar("wastePercentage", { length: 10 }),
  labourRate: varchar("labourRate", { length: 20 }),
  profitMargin: varchar("profitMargin", { length: 10 }),
  includeGst: varchar("includeGst", { length: 10 }),
  materials: text("materials"),
  calculations: text("calculations"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Takeoff = typeof takeoffs.$inferSelect;
export type InsertTakeoff = typeof takeoffs.$inferInsert;

// Quotes
export const quotes = mysqlTable("quotes", {
  id: varchar("id", { length: 64 }).primaryKey(),
  projectId: varchar("projectId", { length: 64 }).notNull(),
  quoteNumber: varchar("quoteNumber", { length: 50 }).notNull(),
  version: varchar("version", { length: 10 }).default("1"),
  subtotal: varchar("subtotal", { length: 20 }).notNull(),
  gst: varchar("gst", { length: 20 }).notNull(),
  total: varchar("total", { length: 20 }).notNull(),
  deposit: varchar("deposit", { length: 20 }),
  validUntil: timestamp("validUntil"),
  status: mysqlEnum("status", ["draft", "sent", "viewed", "accepted", "rejected"]).default("draft").notNull(),
  items: text("items"),
  terms: text("terms"),
  notes: text("notes"),
  createdBy: varchar("createdBy", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = typeof quotes.$inferInsert;

// Site measurements
export const measurements = mysqlTable("measurements", {
  id: varchar("id", { length: 64 }).primaryKey(),
  projectId: varchar("projectId", { length: 64 }).notNull(),
  deviceId: varchar("deviceId", { length: 100 }),
  measurementData: text("measurementData"),
  drawingData: text("drawingData"),
  scale: varchar("scale", { length: 20 }),
  notes: text("notes"),
  createdBy: varchar("createdBy", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Measurement = typeof measurements.$inferSelect;
export type InsertMeasurement = typeof measurements.$inferInsert;

// Audit logs for compliance and debugging
export const auditLogs = mysqlTable("auditLogs", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  organizationId: varchar("organizationId", { length: 64 }),
  action: varchar("action", { length: 100 }).notNull(),
  resourceType: varchar("resourceType", { length: 100 }).notNull(),
  resourceId: varchar("resourceId", { length: 64 }).notNull(),
  changes: text("changes"),
  metadata: text("metadata"),
  ipAddress: varchar("ipAddress", { length: 50 }),
  userAgent: text("userAgent"),
  status: mysqlEnum("status", ["success", "failure"]).default("success").notNull(),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;


// Materials library
export const materials = mysqlTable("materials", {
  id: varchar("id", { length: 64 }).primaryKey(),
  organizationId: varchar("organizationId", { length: 64 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  manufacturer: varchar("manufacturer", { length: 100 }).notNull(),
  profile: varchar("profile", { length: 100 }).notNull(),
  thickness: varchar("thickness", { length: 50 }).notNull(),
  coating: varchar("coating", { length: 100 }).notNull(),
  pricePerUnit: varchar("pricePerUnit", { length: 20 }).notNull(),
  unit: varchar("unit", { length: 20 }).notNull(),
  coverWidth: varchar("coverWidth", { length: 20 }),
  minPitch: varchar("minPitch", { length: 20 }),
  maxSpan: varchar("maxSpan", { length: 20 }),
  description: text("description"),
  createdBy: varchar("createdBy", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type Material = typeof materials.$inferSelect;
export type InsertMaterial = typeof materials.$inferInsert;

// Clients table
export const clients = mysqlTable("clients", {
  id: varchar("id", { length: 64 }).primaryKey(),
  organizationId: varchar("organizationId", { length: 64 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  company: varchar("company", { length: 255 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  postcode: varchar("postcode", { length: 20 }),
  notes: text("notes"),
  tags: text("tags"), // JSON array of tags
  createdBy: varchar("createdBy", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

