import { eq, and, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  projects, 
  InsertProject,
  takeoffs,
  InsertTakeoff,
  quotes,
  InsertQuote,
  measurements,
  InsertMeasurement,
  clients,
  InsertClient,

  organizations,
  InsertOrganization,
  memberships,
  InsertMembership
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============================================================================
// USER MANAGEMENT
// ============================================================================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.id) {
    throw new Error("User ID is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      id: user.id,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role === undefined) {
      if (user.id === ENV.ownerId) {
        user.role = 'admin';
        values.role = 'admin';
        updateSet.role = 'admin';
      }
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUser(id: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================================================
// ORGANIZATION MANAGEMENT
// ============================================================================

export async function createOrganization(org: InsertOrganization) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(organizations).values(org);
  return org;
}

export async function getOrganization(orgId: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(organizations).where(eq(organizations.id, orgId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateOrganization(orgId: string, updates: Partial<InsertOrganization>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(organizations).set(updates).where(eq(organizations.id, orgId));
}

export async function getUserOrganizations(userId: string) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select({ organization: organizations })
    .from(memberships)
    .innerJoin(organizations, eq(memberships.organizationId, organizations.id))
    .where(eq(memberships.userId, userId));
  
  return result.map(r => r.organization);
}

// ============================================================================
// PROJECT MANAGEMENT
// ============================================================================

export async function createProject(project: InsertProject) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(projects).values(project);
  return project;
}

export async function getProject(projectId: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getOrganizationProjects(organizationId: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(projects)
    .where(eq(projects.organizationId, organizationId))
    .orderBy(desc(projects.createdAt));
}

export async function updateProject(projectId: string, updates: Partial<InsertProject>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(projects).set(updates).where(eq(projects.id, projectId));
}

export async function deleteProject(projectId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(projects).where(eq(projects.id, projectId));
}

// ============================================================================
// TAKEOFF MANAGEMENT
// ============================================================================

export async function createTakeoff(takeoff: InsertTakeoff) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(takeoffs).values(takeoff);
  return takeoff;
}

export async function getProjectTakeoffs(projectId: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(takeoffs)
    .where(eq(takeoffs.projectId, projectId))
    .orderBy(desc(takeoffs.createdAt));
}

export async function updateTakeoff(takeoffId: string, updates: Partial<InsertTakeoff>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(takeoffs).set(updates).where(eq(takeoffs.id, takeoffId));
}

// ============================================================================
// QUOTE MANAGEMENT
// ============================================================================

export async function createQuote(quote: InsertQuote) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(quotes).values(quote);
  return quote;
}

export async function getQuote(quoteId: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(quotes).where(eq(quotes.id, quoteId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getProjectQuotes(projectId: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(quotes)
    .where(eq(quotes.projectId, projectId))
    .orderBy(desc(quotes.createdAt));
}

export async function updateQuote(quoteId: string, updates: Partial<InsertQuote>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(quotes).set(updates).where(eq(quotes.id, quoteId));
}

// ============================================================================
// MEASUREMENT MANAGEMENT
// ============================================================================

export async function createMeasurement(measurement: InsertMeasurement) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(measurements).values(measurement);
  return measurement;
}

export async function getMeasurement(measurementId: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(measurements).where(eq(measurements.id, measurementId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getProjectMeasurements(projectId: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(measurements)
    .where(eq(measurements.projectId, projectId))
    .orderBy(desc(measurements.createdAt));
}

export async function updateMeasurement(measurementId: string, updates: Partial<InsertMeasurement>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(measurements).set(updates).where(eq(measurements.id, measurementId));
}

export async function deleteMeasurement(measurementId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(measurements).where(eq(measurements.id, measurementId));
}

// ============================================================================
// CLIENT MANAGEMENT
// ============================================================================

export async function createClient(client: InsertClient) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(clients).values(client);
  return client;
}

export async function getClient(clientId: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(clients).where(eq(clients.id, clientId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getOrganizationClients(organizationId: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(clients)
    .where(eq(clients.organizationId, organizationId))
    .orderBy(desc(clients.createdAt));
}

export async function updateClient(clientId: string, updates: Partial<InsertClient>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(clients).set(updates).where(eq(clients.id, clientId));
}

export async function deleteClient(clientId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(clients).where(eq(clients.id, clientId));
}

// Settings management temporarily disabled

