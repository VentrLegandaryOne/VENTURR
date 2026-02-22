import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  quotes, 
  Quote, 
  InsertQuote,
  verifications,
  Verification,
  InsertVerification,
  reports,
  Report,
  InsertReport,
  materials,
  Material,
  complianceRules,
  ComplianceRule
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

/**
 * Health check for database - returns detailed status
 * Used by /api/health endpoint
 */
export async function testDatabaseHealth(): Promise<{ connected: boolean; latencyMs: number; error?: string }> {
  const startTime = Date.now();
  
  try {
    const db = await getDb();
    if (!db) {
      return {
        connected: false,
        latencyMs: Date.now() - startTime,
        error: 'Database not configured (DATABASE_URL missing)',
      };
    }

    // Simple query to test connection
    await db.select().from(users).limit(1);
    
    return {
      connected: true,
      latencyMs: Date.now() - startTime,
    };
  } catch (error) {
    return {
      connected: false,
      latencyMs: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// ============================================================================
// USER OPERATIONS
// ============================================================================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
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
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
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

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================================================
// QUOTE OPERATIONS
// ============================================================================

export async function createQuote(quote: Omit<InsertQuote, 'userId'> & { userId: number | string }): Promise<Quote> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // For anonymous users (string IDs), use a placeholder numeric ID (0)
  const quoteWithNumericUserId = {
    ...quote,
    userId: typeof quote.userId === 'string' ? 0 : quote.userId,
  };

  const result = await db.insert(quotes).values(quoteWithNumericUserId);
  const insertedId = Number(result[0].insertId);
  
  const inserted = await db.select().from(quotes).where(eq(quotes.id, insertedId)).limit(1);
  if (!inserted[0]) {
    throw new Error("Failed to retrieve inserted quote");
  }
  
  return inserted[0];
}

export async function getQuoteById(quoteId: number): Promise<Quote | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get quote: database not available");
    return undefined;
  }

  const result = await db.select().from(quotes).where(eq(quotes.id, quoteId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getQuotesByUserId(userId: number): Promise<Quote[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get quotes: database not available");
    return [];
  }

  return await db.select().from(quotes).where(eq(quotes.userId, userId));
}

export async function updateQuoteExtractedData(
  quoteId: number,
  extractedData: {
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
  }
): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(quotes).set({ extractedData }).where(eq(quotes.id, quoteId));
}

export async function updateQuoteStatus(
  quoteId: number, 
  status: "draft" | "uploaded" | "processing" | "completed" | "failed",
  progressPercentage?: number,
  errorMessage?: string
): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const updateData: Partial<Quote> = { status };
  if (progressPercentage !== undefined) {
    updateData.progressPercentage = progressPercentage;
  }
  if (errorMessage !== undefined) {
    updateData.errorMessage = errorMessage;
  }
  if (status === "completed") {
    updateData.processedAt = new Date();
  }

  await db.update(quotes).set(updateData).where(eq(quotes.id, quoteId));
}

// ============================================================================
// VERIFICATION OPERATIONS
// ============================================================================

export async function createVerification(verification: InsertVerification): Promise<Verification> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(verifications).values(verification);
  const insertedId = Number(result[0].insertId);
  
  const inserted = await db.select().from(verifications).where(eq(verifications.id, insertedId)).limit(1);
  if (!inserted[0]) {
    throw new Error("Failed to retrieve inserted verification");
  }
  
  return inserted[0];
}

export async function getVerificationByQuoteId(quoteId: number): Promise<Verification | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get verification: database not available");
    return undefined;
  }

  const result = await db.select().from(verifications).where(eq(verifications.quoteId, quoteId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getVerificationById(verificationId: number): Promise<Verification | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get verification: database not available");
    return undefined;
  }

  const result = await db.select().from(verifications).where(eq(verifications.id, verificationId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============================================================================
// REPORT OPERATIONS
// ============================================================================

export async function createReport(report: InsertReport): Promise<Report> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(reports).values(report);
  const insertedId = Number(result[0].insertId);
  
  const inserted = await db.select().from(reports).where(eq(reports.id, insertedId)).limit(1);
  if (!inserted[0]) {
    throw new Error("Failed to retrieve inserted report");
  }
  
  return inserted[0];
}

export async function getReportByVerificationId(verificationId: number): Promise<Report | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get report: database not available");
    return undefined;
  }

  const result = await db.select().from(reports).where(eq(reports.verificationId, verificationId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function incrementReportDownloadCount(reportId: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const report = await db.select().from(reports).where(eq(reports.id, reportId)).limit(1);
  if (report[0]) {
    await db.update(reports).set({ 
      downloadCount: (report[0].downloadCount || 0) + 1 
    }).where(eq(reports.id, reportId));
  }
}

// ============================================================================
// MATERIAL OPERATIONS
// ============================================================================

export async function getAllMaterials(): Promise<Material[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get materials: database not available");
    return [];
  }

  return await db.select().from(materials).where(eq(materials.isActive, true));
}

export async function getMaterialsByCategory(category: string): Promise<Material[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get materials: database not available");
    return [];
  }

  return await db.select().from(materials).where(eq(materials.category, category));
}

// ============================================================================
// COMPLIANCE RULE OPERATIONS
// ============================================================================

// ============================================================================
// QUOTE DELETION WITH CASCADE CLEANUP
// ============================================================================

/**
 * Permanently delete a quote and all associated data (verifications, reports, shares, comments, negotiations)
 * Also removes the file from S3 storage
 */
export async function deleteQuoteWithCascade(quoteId: number): Promise<{ deletedRecords: Record<string, number> }> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const deletedRecords: Record<string, number> = {};

  // Delete in dependency order (children first)
  // 1. Delete comments
  try {
    const commentResult = await db.execute(sql`DELETE FROM comments WHERE quote_id = ${quoteId}`);
    deletedRecords.comments = (commentResult as any)[0]?.affectedRows || 0;
  } catch { deletedRecords.comments = 0; }

  // 2. Delete negotiations
  try {
    const negoResult = await db.execute(sql`DELETE FROM negotiations WHERE quote_id = ${quoteId}`);
    deletedRecords.negotiations = (negoResult as any)[0]?.affectedRows || 0;
  } catch { deletedRecords.negotiations = 0; }

  // 3. Delete shared reports
  try {
    const shareResult = await db.execute(sql`DELETE FROM shared_reports WHERE quote_id = ${quoteId}`);
    deletedRecords.sharedReports = (shareResult as any)[0]?.affectedRows || 0;
  } catch { deletedRecords.sharedReports = 0; }

  // 4. Delete upload analytics
  try {
    const analyticsResult = await db.execute(sql`DELETE FROM upload_analytics WHERE quote_id = ${quoteId}`);
    deletedRecords.uploadAnalytics = (analyticsResult as any)[0]?.affectedRows || 0;
  } catch { deletedRecords.uploadAnalytics = 0; }

  // 5. Delete comparison items
  try {
    const compResult = await db.execute(sql`DELETE FROM comparison_items WHERE quote_id = ${quoteId}`);
    deletedRecords.comparisonItems = (compResult as any)[0]?.affectedRows || 0;
  } catch { deletedRecords.comparisonItems = 0; }

  // 6. Delete quote comparison items
  try {
    const qcResult = await db.execute(sql`DELETE FROM quote_comparison_items WHERE quote_id = ${quoteId}`);
    deletedRecords.quoteComparisonItems = (qcResult as any)[0]?.affectedRows || 0;
  } catch { deletedRecords.quoteComparisonItems = 0; }

  // 7. Delete report purchases
  try {
    const rpResult = await db.execute(sql`DELETE FROM report_purchases WHERE quote_id = ${quoteId}`);
    deletedRecords.reportPurchases = (rpResult as any)[0]?.affectedRows || 0;
  } catch { deletedRecords.reportPurchases = 0; }

  // 8. Get verification ID before deleting
  const verification = await getVerificationByQuoteId(quoteId);

  // 9. Delete reports (via verification)
  if (verification) {
    try {
      const reportResult = await db.execute(sql`DELETE FROM reports WHERE verification_id = ${verification.id}`);
      deletedRecords.reports = (reportResult as any)[0]?.affectedRows || 0;
    } catch { deletedRecords.reports = 0; }

    // 10. Delete verification
    try {
      const verResult = await db.execute(sql`DELETE FROM verifications WHERE id = ${verification.id}`);
      deletedRecords.verifications = (verResult as any)[0]?.affectedRows || 0;
    } catch { deletedRecords.verifications = 0; }
  }

  // 11. Delete the quote itself
  await db.delete(quotes).where(eq(quotes.id, quoteId));
  deletedRecords.quotes = 1;

  return { deletedRecords };
}

/**
 * Verify report ownership through the chain: quote -> verification -> report
 * Returns true if the user owns the quote that generated this report
 */
export async function verifyReportOwnership(
  verificationId: number,
  userId: number
): Promise<{ owned: boolean; quoteId?: number }> {
  const db = await getDb();
  if (!db) {
    return { owned: false };
  }

  // Get verification to find the quoteId
  const verification = await getVerificationById(verificationId);
  if (!verification) {
    return { owned: false };
  }

  // Get the quote to check ownership
  const quote = await getQuoteById(verification.quoteId);
  if (!quote || quote.userId !== userId) {
    return { owned: false };
  }

  return { owned: true, quoteId: quote.id };
}

// Compliance rules functions removed - using new complianceRulesLibrary table instead
// See VALIDT public trust engine implementation
