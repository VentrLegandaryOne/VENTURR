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

// Project Tasks
export const projectTasks = mysqlTable("projectTasks", {
  id: varchar("id", { length: 64 }).primaryKey(),
  projectId: varchar("projectId", { length: 64 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["todo", "in_progress", "review", "completed", "blocked"]).default("todo").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  assignedTo: varchar("assignedTo", { length: 64 }),
  dueDate: timestamp("dueDate"),
  completedAt: timestamp("completedAt"),
  createdBy: varchar("createdBy", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type ProjectTask = typeof projectTasks.$inferSelect;
export type InsertProjectTask = typeof projectTasks.$inferInsert;

// Project Team Members
export const projectTeamMembers = mysqlTable("projectTeamMembers", {
  id: varchar("id", { length: 64 }).primaryKey(),
  projectId: varchar("projectId", { length: 64 }).notNull(),
  userId: varchar("userId", { length: 64 }).notNull(),
  role: mysqlEnum("role", ["lead", "worker", "supervisor", "inspector"]).default("worker").notNull(),
  joinedAt: timestamp("joinedAt").defaultNow(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type ProjectTeamMember = typeof projectTeamMembers.$inferSelect;
export type InsertProjectTeamMember = typeof projectTeamMembers.$inferInsert;

// Project Milestones
export const projectMilestones = mysqlTable("projectMilestones", {
  id: varchar("id", { length: 64 }).primaryKey(),
  projectId: varchar("projectId", { length: 64 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  targetDate: timestamp("targetDate").notNull(),
  completedDate: timestamp("completedDate"),
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "delayed"]).default("pending").notNull(),
  progress: varchar("progress", { length: 3 }).default("0"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type ProjectMilestone = typeof projectMilestones.$inferSelect;
export type InsertProjectMilestone = typeof projectMilestones.$inferInsert;

// Project Budget
export const projectBudgets = mysqlTable("projectBudgets", {
  id: varchar("id", { length: 64 }).primaryKey(),
  projectId: varchar("projectId", { length: 64 }).notNull(),
  budgetedAmount: varchar("budgetedAmount", { length: 20 }).notNull(),
  spentAmount: varchar("spentAmount", { length: 20 }).default("0"),
  remainingAmount: varchar("remainingAmount", { length: 20 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD"),
  lastUpdated: timestamp("lastUpdated").defaultNow().onUpdateNow(),
});

export type ProjectBudget = typeof projectBudgets.$inferSelect;
export type InsertProjectBudget = typeof projectBudgets.$inferInsert;

// Project Documents
export const projectDocuments = mysqlTable("projectDocuments", {
  id: varchar("id", { length: 64 }).primaryKey(),
  projectId: varchar("projectId", { length: 64 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["drawing", "specification", "permit", "report", "contract", "other"]).notNull(),
  fileUrl: text("fileUrl").notNull(),
  fileSize: varchar("fileSize", { length: 20 }),
  uploadedBy: varchar("uploadedBy", { length: 64 }).notNull(),
  uploadedAt: timestamp("uploadedAt").defaultNow(),
});

export type ProjectDocument = typeof projectDocuments.$inferSelect;
export type InsertProjectDocument = typeof projectDocuments.$inferInsert;

// INVENTORY MANAGEMENT TABLES

// Inventory Items
export const inventoryItems = mysqlTable("inventoryItems", {
  id: varchar("id", { length: 64 }).primaryKey(),
  organizationId: varchar("organizationId", { length: 64 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  sku: varchar("sku", { length: 100 }).notNull().unique(),
  category: varchar("category", { length: 100 }).notNull(),
  description: text("description"),
  unitPrice: varchar("unitPrice", { length: 20 }).notNull(),
  costPrice: varchar("costPrice", { length: 20 }).notNull(),
  currentStock: varchar("currentStock", { length: 20 }).default("0"),
  minimumStock: varchar("minimumStock", { length: 20 }).default("10"),
  maximumStock: varchar("maximumStock", { length: 20 }).default("1000"),
  reorderPoint: varchar("reorderPoint", { length: 20 }).default("20"),
  unit: varchar("unit", { length: 50 }).notNull(),
  supplier: varchar("supplier", { length: 255 }),
  lastRestockDate: timestamp("lastRestockDate"),
  createdBy: varchar("createdBy", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type InventoryItem = typeof inventoryItems.$inferSelect;
export type InsertInventoryItem = typeof inventoryItems.$inferInsert;

// Stock Movements (Transactions)
export const stockMovements = mysqlTable("stockMovements", {
  id: varchar("id", { length: 64 }).primaryKey(),
  inventoryItemId: varchar("inventoryItemId", { length: 64 }).notNull(),
  type: mysqlEnum("type", ["in", "out", "adjustment", "damage", "return"]).notNull(),
  quantity: varchar("quantity", { length: 20 }).notNull(),
  reason: varchar("reason", { length: 255 }),
  reference: varchar("reference", { length: 100 }),
  notes: text("notes"),
  createdBy: varchar("createdBy", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type StockMovement = typeof stockMovements.$inferSelect;
export type InsertStockMovement = typeof stockMovements.$inferInsert;

// Stock Alerts
export const stockAlerts = mysqlTable("stockAlerts", {
  id: varchar("id", { length: 64 }).primaryKey(),
  inventoryItemId: varchar("inventoryItemId", { length: 64 }).notNull(),
  alertType: mysqlEnum("alertType", ["low_stock", "overstock", "expired", "reorder_needed"]).notNull(),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).default("medium"),
  message: text("message").notNull(),
  isResolved: varchar("isResolved", { length: 5 }).default("false"),
  resolvedAt: timestamp("resolvedAt"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type StockAlert = typeof stockAlerts.$inferSelect;
export type InsertStockAlert = typeof stockAlerts.$inferInsert;

// Reorder Orders
export const reorderOrders = mysqlTable("reorderOrders", {
  id: varchar("id", { length: 64 }).primaryKey(),
  inventoryItemId: varchar("inventoryItemId", { length: 64 }).notNull(),
  organizationId: varchar("organizationId", { length: 64 }).notNull(),
  quantity: varchar("quantity", { length: 20 }).notNull(),
  status: mysqlEnum("status", ["pending", "ordered", "received", "canceled"]).default("pending"),
  orderDate: timestamp("orderDate").defaultNow(),
  expectedDelivery: timestamp("expectedDelivery"),
  actualDelivery: timestamp("actualDelivery"),
  supplier: varchar("supplier", { length: 255 }),
  cost: varchar("cost", { length: 20 }),
  notes: text("notes"),
  createdBy: varchar("createdBy", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type ReorderOrder = typeof reorderOrders.$inferSelect;
export type InsertReorderOrder = typeof reorderOrders.$inferInsert;

// CRM TABLES

// Enhanced Clients with CRM tracking
export const crmClients = mysqlTable("crmClients", {
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
  clientType: mysqlEnum("clientType", ["residential", "commercial", "industrial", "government"]).default("residential"),
  status: mysqlEnum("status", ["lead", "prospect", "active", "inactive", "vip"]).default("prospect"),
  totalSpent: varchar("totalSpent", { length: 20 }).default("0"),
  projectCount: varchar("projectCount", { length: 10 }).default("0"),
  lastProjectDate: timestamp("lastProjectDate"),
  preferredContactMethod: varchar("preferredContactMethod", { length: 50 }),
  notes: text("notes"),
  tags: text("tags"),
  createdBy: varchar("createdBy", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type CrmClient = typeof crmClients.$inferSelect;
export type InsertCrmClient = typeof crmClients.$inferInsert;

// Client Communication History
export const clientCommunications = mysqlTable("clientCommunications", {
  id: varchar("id", { length: 64 }).primaryKey(),
  clientId: varchar("clientId", { length: 64 }).notNull(),
  type: mysqlEnum("type", ["call", "email", "sms", "visit", "quote", "invoice", "note"]).notNull(),
  subject: varchar("subject", { length: 255 }),
  content: text("content"),
  outcome: varchar("outcome", { length: 100 }),
  nextFollowUp: timestamp("nextFollowUp"),
  createdBy: varchar("createdBy", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type ClientCommunication = typeof clientCommunications.$inferSelect;
export type InsertClientCommunication = typeof clientCommunications.$inferInsert;

// FINANCIAL MANAGEMENT TABLES

// Invoices
export const invoices = mysqlTable("invoices", {
  id: varchar("id", { length: 64 }).primaryKey(),
  organizationId: varchar("organizationId", { length: 64 }).notNull(),
  projectId: varchar("projectId", { length: 64 }),
  clientId: varchar("clientId", { length: 64 }).notNull(),
  invoiceNumber: varchar("invoiceNumber", { length: 50 }).notNull().unique(),
  status: mysqlEnum("status", ["draft", "sent", "viewed", "paid", "overdue", "canceled"]).default("draft"),
  subtotal: varchar("subtotal", { length: 20 }).notNull(),
  tax: varchar("tax", { length: 20 }).default("0"),
  total: varchar("total", { length: 20 }).notNull(),
  amountPaid: varchar("amountPaid", { length: 20 }).default("0"),
  dueDate: timestamp("dueDate"),
  paidDate: timestamp("paidDate"),
  currency: varchar("currency", { length: 3 }).default("AUD"),
  notes: text("notes"),
  items: text("items"),
  createdBy: varchar("createdBy", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;

// Expenses
export const expenses = mysqlTable("expenses", {
  id: varchar("id", { length: 64 }).primaryKey(),
  organizationId: varchar("organizationId", { length: 64 }).notNull(),
  projectId: varchar("projectId", { length: 64 }),
  category: mysqlEnum("category", ["materials", "labor", "equipment", "travel", "other"]).notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  amount: varchar("amount", { length: 20 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("AUD"),
  date: timestamp("date").notNull(),
  receipt: text("receipt"),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending"),
  createdBy: varchar("createdBy", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = typeof expenses.$inferInsert;

// Financial Reports
export const financialReports = mysqlTable("financialReports", {
  id: varchar("id", { length: 64 }).primaryKey(),
  organizationId: varchar("organizationId", { length: 64 }).notNull(),
  reportType: mysqlEnum("reportType", ["profit_loss", "cash_flow", "tax_summary", "project_profitability"]).notNull(),
  period: varchar("period", { length: 50 }).notNull(),
  totalRevenue: varchar("totalRevenue", { length: 20 }).default("0"),
  totalExpenses: varchar("totalExpenses", { length: 20 }).default("0"),
  netProfit: varchar("netProfit", { length: 20 }).default("0"),
  taxAmount: varchar("taxAmount", { length: 20 }).default("0"),
  data: text("data"),
  generatedAt: timestamp("generatedAt").defaultNow(),
});

export type FinancialReport = typeof financialReports.$inferSelect;
export type InsertFinancialReport = typeof financialReports.$inferInsert;

// Intelligent Insights & Recommendations
export const intelligentInsights = mysqlTable("intelligentInsights", {
  id: varchar("id", { length: 64 }).primaryKey(),
  organizationId: varchar("organizationId", { length: 64 }).notNull(),
  insightType: mysqlEnum("insightType", [
    "low_stock_warning",
    "project_overbudget",
    "overdue_invoice",
    "high_profit_opportunity",
    "team_utilization",
    "cash_flow_warning",
    "seasonal_trend",
    "cost_optimization"
  ]).notNull(),
  severity: mysqlEnum("severity", ["info", "warning", "critical"]).default("info"),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  recommendation: text("recommendation"),
  metadata: text("metadata"),
  isActionable: varchar("isActionable", { length: 5 }).default("true"),
  isResolved: varchar("isResolved", { length: 5 }).default("false"),
  createdAt: timestamp("createdAt").defaultNow(),
  resolvedAt: timestamp("resolvedAt"),
});

export type IntelligentInsight = typeof intelligentInsights.$inferSelect;
export type InsertIntelligentInsight = typeof intelligentInsights.$inferInsert;

