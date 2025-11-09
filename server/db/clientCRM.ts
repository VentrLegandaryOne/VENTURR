/**
 * Client CRM Database Layer
 * Complete CRUD operations for client management
 */

import { drizzle } from "drizzle-orm/mysql2";
import { eq, like, and, desc, asc } from "drizzle-orm";
import { mysqlTable, varchar, text, timestamp, int, boolean, decimal, index } from "drizzle-orm/mysql-core";

// Client CRM Tables
export const clients = mysqlTable("clients", {
  id: varchar("id", { length: 64 }).primaryKey(),
  organizationId: varchar("organizationId", { length: 64 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  company: varchar("company", { length: 255 }),
  address: text("address"),
  suburb: varchar("suburb", { length: 100 }),
  postcode: varchar("postcode", { length: 10 }),
  state: varchar("state", { length: 3 }),
  country: varchar("country", { length: 100 }).default("Australia"),
  notes: text("notes"),
  tags: text("tags"), // JSON array of tags
  clientType: varchar("clientType", { length: 50 }).default("residential"), // residential, commercial, industrial
  status: varchar("status", { length: 50 }).default("active"), // active, inactive, prospect
  preferredContact: varchar("preferredContact", { length: 50 }).default("email"), // email, phone, sms
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
  lastContactedAt: timestamp("lastContactedAt"),
  nextFollowUpAt: timestamp("nextFollowUpAt"),
}, (table) => ({
  orgIdIdx: index("idx_clients_org_id").on(table.organizationId),
  emailIdx: index("idx_clients_email").on(table.email),
  statusIdx: index("idx_clients_status").on(table.status),
}));

export const clientCommunications = mysqlTable("client_communications", {
  id: varchar("id", { length: 64 }).primaryKey(),
  clientId: varchar("clientId", { length: 64 }).notNull(),
  communicationType: varchar("communicationType", { length: 50 }).notNull(), // email, phone, sms, meeting, site_visit
  subject: varchar("subject", { length: 255 }),
  message: text("message"),
  sentBy: varchar("sentBy", { length: 64 }).notNull(),
  communicationDate: timestamp("communicationDate").defaultNow(),
  nextActionRequired: boolean("nextActionRequired").default(false),
  nextActionDate: timestamp("nextActionDate"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow(),
}, (table) => ({
  clientIdIdx: index("idx_comm_client_id").on(table.clientId),
  dateIdx: index("idx_comm_date").on(table.communicationDate),
}));

export const clientProjects = mysqlTable("client_projects", {
  id: varchar("id", { length: 64 }).primaryKey(),
  clientId: varchar("clientId", { length: 64 }).notNull(),
  projectId: varchar("projectId", { length: 64 }).notNull(),
  projectName: varchar("projectName", { length: 255 }).notNull(),
  projectType: varchar("projectType", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  quoteValue: decimal("quoteValue", { precision: 12, scale: 2 }),
  invoiceValue: decimal("invoiceValue", { precision: 12, scale: 2 }),
  paidAmount: decimal("paidAmount", { precision: 12, scale: 2 }).default("0"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow(),
}, (table) => ({
  clientIdIdx: index("idx_proj_client_id").on(table.clientId),
  projectIdIdx: index("idx_proj_project_id").on(table.projectId),
}));

export const clientNotes = mysqlTable("client_notes", {
  id: varchar("id", { length: 64 }).primaryKey(),
  clientId: varchar("clientId", { length: 64 }).notNull(),
  noteType: varchar("noteType", { length: 50 }).notNull(), // general, preference, issue, opportunity
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  priority: varchar("priority", { length: 20 }).default("normal"), // low, normal, high, urgent
  createdBy: varchar("createdBy", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
}, (table) => ({
  clientIdIdx: index("idx_notes_client_id").on(table.clientId),
  priorityIdx: index("idx_notes_priority").on(table.priority),
}));

/**
 * Create new client
 */
export async function createClient(
  db: any,
  organizationId: string,
  clientData: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    address?: string;
    suburb?: string;
    postcode?: string;
    state?: string;
    clientType?: string;
    preferredContact?: string;
  }
) {
  const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  await db.insert(clients).values({
    id: clientId,
    organizationId,
    name: clientData.name,
    email: clientData.email,
    phone: clientData.phone,
    company: clientData.company,
    address: clientData.address,
    suburb: clientData.suburb,
    postcode: clientData.postcode,
    state: clientData.state,
    clientType: clientData.clientType || "residential",
    preferredContact: clientData.preferredContact || "email",
    status: "active",
  });

  return clientId;
}

/**
 * Get client by ID
 */
export async function getClient(db: any, clientId: string) {
  const result = await db
    .select()
    .from(clients)
    .where(eq(clients.id, clientId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

/**
 * Search clients by name or email
 */
export async function searchClients(
  db: any,
  organizationId: string,
  query: string,
  limit: number = 10
) {
  return await db
    .select()
    .from(clients)
    .where(
      and(
        eq(clients.organizationId, organizationId),
        like(clients.name, `%${query}%`)
      )
    )
    .limit(limit);
}

/**
 * Get all clients for organization
 */
export async function getOrganizationClients(
  db: any,
  organizationId: string,
  filters?: {
    status?: string;
    clientType?: string;
    sortBy?: "name" | "createdAt" | "lastContactedAt";
    sortOrder?: "asc" | "desc";
  }
) {
  let query = db.select().from(clients).where(eq(clients.organizationId, organizationId));

  if (filters?.status) {
    query = query.where(eq(clients.status, filters.status));
  }

  if (filters?.clientType) {
    query = query.where(eq(clients.clientType, filters.clientType));
  }

  if (filters?.sortBy) {
    const sortColumn = clients[filters.sortBy as keyof typeof clients];
    const sortFn = filters.sortOrder === "desc" ? desc : asc;
    query = query.orderBy(sortFn(sortColumn));
  }

  return await query;
}

/**
 * Update client information
 */
export async function updateClient(
  db: any,
  clientId: string,
  updates: Partial<typeof clients.$inferInsert>
) {
  await db
    .update(clients)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(clients.id, clientId));

  return getClient(db, clientId);
}

/**
 * Add communication record
 */
export async function addCommunication(
  db: any,
  clientId: string,
  communicationData: {
    communicationType: string;
    subject?: string;
    message?: string;
    sentBy: string;
    nextActionRequired?: boolean;
    nextActionDate?: Date;
    notes?: string;
  }
) {
  const commId = `comm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  await db.insert(clientCommunications).values({
    id: commId,
    clientId,
    communicationType: communicationData.communicationType,
    subject: communicationData.subject,
    message: communicationData.message,
    sentBy: communicationData.sentBy,
    nextActionRequired: communicationData.nextActionRequired || false,
    nextActionDate: communicationData.nextActionDate,
    notes: communicationData.notes,
  });

  return commId;
}

/**
 * Get client communication history
 */
export async function getClientCommunications(
  db: any,
  clientId: string,
  limit: number = 50
) {
  return await db
    .select()
    .from(clientCommunications)
    .where(eq(clientCommunications.clientId, clientId))
    .orderBy(desc(clientCommunications.communicationDate))
    .limit(limit);
}

/**
 * Get client project history
 */
export async function getClientProjects(
  db: any,
  clientId: string
) {
  return await db
    .select()
    .from(clientProjects)
    .where(eq(clientProjects.clientId, clientId))
    .orderBy(desc(clientProjects.createdAt));
}

/**
 * Add client project
 */
export async function addClientProject(
  db: any,
  clientId: string,
  projectData: {
    projectId: string;
    projectName: string;
    projectType: string;
    status: string;
    quoteValue?: number;
    invoiceValue?: number;
  }
) {
  const projId = `cproj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  await db.insert(clientProjects).values({
    id: projId,
    clientId,
    projectId: projectData.projectId,
    projectName: projectData.projectName,
    projectType: projectData.projectType,
    status: projectData.status,
    quoteValue: projectData.quoteValue,
    invoiceValue: projectData.invoiceValue,
  });

  return projId;
}

/**
 * Add client note
 */
export async function addClientNote(
  db: any,
  clientId: string,
  noteData: {
    noteType: string;
    title: string;
    content: string;
    priority?: string;
    createdBy: string;
  }
) {
  const noteId = `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  await db.insert(clientNotes).values({
    id: noteId,
    clientId,
    noteType: noteData.noteType,
    title: noteData.title,
    content: noteData.content,
    priority: noteData.priority || "normal",
    createdBy: noteData.createdBy,
  });

  return noteId;
}

/**
 * Get client notes
 */
export async function getClientNotes(
  db: any,
  clientId: string,
  filters?: {
    noteType?: string;
    priority?: string;
  }
) {
  let query = db.select().from(clientNotes).where(eq(clientNotes.clientId, clientId));

  if (filters?.noteType) {
    query = query.where(eq(clientNotes.noteType, filters.noteType));
  }

  if (filters?.priority) {
    query = query.where(eq(clientNotes.priority, filters.priority));
  }

  return await query.orderBy(desc(clientNotes.createdAt));
}

/**
 * Get client summary
 */
export async function getClientSummary(db: any, clientId: string) {
  const client = await getClient(db, clientId);
  if (!client) return null;

  const communications = await getClientCommunications(db, clientId, 10);
  const projects = await getClientProjects(db, clientId);
  const notes = await getClientNotes(db, clientId);

  // Calculate client metrics
  const totalProjects = projects.length;
  const completedProjects = projects.filter((p: any) => p.status === "completed").length;
  const totalValue = projects.reduce((sum: number, p: any) => sum + (p.invoiceValue || 0), 0);
  const totalPaid = projects.reduce((sum: number, p: any) => sum + (p.paidAmount || 0), 0);

  return {
    client,
    communications,
    projects,
    notes,
    metrics: {
      totalProjects,
      completedProjects,
      totalValue,
      totalPaid,
      outstandingBalance: totalValue - totalPaid,
    },
  };
}

/**
 * Get clients due for follow-up
 */
export async function getClientsForFollowUp(
  db: any,
  organizationId: string
) {
  const now = new Date();

  return await db
    .select()
    .from(clients)
    .where(
      and(
        eq(clients.organizationId, organizationId),
        eq(clients.status, "active")
      )
    )
    .orderBy(asc(clients.nextFollowUpAt));
}

/**
 * Delete client
 */
export async function deleteClient(db: any, clientId: string) {
  await db.delete(clients).where(eq(clients.id, clientId));
}

/**
 * Get client statistics
 */
export async function getClientStatistics(
  db: any,
  organizationId: string
) {
  const allClients = await getOrganizationClients(db, organizationId);

  const activeClients = allClients.filter((c: any) => c.status === "active").length;
  const inactiveClients = allClients.filter((c: any) => c.status === "inactive").length;
  const prospectClients = allClients.filter((c: any) => c.status === "prospect").length;

  const residentialClients = allClients.filter((c: any) => c.clientType === "residential").length;
  const commercialClients = allClients.filter((c: any) => c.clientType === "commercial").length;
  const industrialClients = allClients.filter((c: any) => c.clientType === "industrial").length;

  return {
    totalClients: allClients.length,
    activeClients,
    inactiveClients,
    prospectClients,
    byType: {
      residential: residentialClients,
      commercial: commercialClients,
      industrial: industrialClients,
    },
  };
}

