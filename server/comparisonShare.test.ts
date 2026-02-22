import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { sql } from "drizzle-orm";

// Mock database connection
let connection: mysql.Connection;
let db: ReturnType<typeof drizzle>;

beforeAll(async () => {
  connection = await mysql.createConnection(process.env.DATABASE_URL as string);
  db = drizzle(connection);
});

afterAll(async () => {
  await connection.end();
});

describe("Comparison Share", () => {
  it("should create a share link with valid data", async () => {
    const { createComparisonShare } = await import("./comparisonShareDb");
    
    const result = await createComparisonShare({
      userId: 1,
      contractorIds: [1, 2],
      title: "Test Comparison",
      notes: "Test notes",
      expiresInDays: 7,
    });
    
    expect(result).toBeDefined();
    expect(result.shareToken).toBeDefined();
    expect(result.shareToken.length).toBe(64);
    expect(result.contractorIds).toEqual([1, 2]);
    expect(result.title).toBe("Test Comparison");
    
    // Clean up
    await db.execute(sql`DELETE FROM shared_comparisons WHERE share_token = ${result.shareToken}`);
  });

  it("should retrieve a shared comparison by token", async () => {
    const { createComparisonShare, getSharedComparison } = await import("./comparisonShareDb");
    
    // Create a share first
    const created = await createComparisonShare({
      userId: 1,
      contractorIds: [1, 2],
      title: "Retrieve Test",
      expiresInDays: 7,
    });
    
    // Retrieve it
    const retrieved = await getSharedComparison(created.shareToken);
    
    expect(retrieved).toBeDefined();
    expect(retrieved?.shareToken).toBe(created.shareToken);
    expect(retrieved?.title).toBe("Retrieve Test");
    expect(retrieved?.contractorIds).toEqual([1, 2]);
    
    // Clean up
    await db.execute(sql`DELETE FROM shared_comparisons WHERE share_token = ${created.shareToken}`);
  });

  it("should return null for expired share links", async () => {
    const { getSharedComparison } = await import("./comparisonShareDb");
    
    // Create an expired share directly in DB
    const expiredToken = "expired_test_token_" + Date.now();
    await db.execute(sql`
      INSERT INTO shared_comparisons (user_id, share_token, contractor_ids, title, expires_at, created_at)
      VALUES (1, ${expiredToken}, '[1,2]', 'Expired Test', DATE_SUB(NOW(), INTERVAL 1 DAY), NOW())
    `);
    
    // Try to retrieve it
    const result = await getSharedComparison(expiredToken);
    
    expect(result).toBeNull();
    
    // Clean up
    await db.execute(sql`DELETE FROM shared_comparisons WHERE share_token = ${expiredToken}`);
  });

  it("should return null for non-existent share token", async () => {
    const { getSharedComparison } = await import("./comparisonShareDb");
    
    const result = await getSharedComparison("non_existent_token_12345");
    
    expect(result).toBeNull();
  });

  it("should increment view count when retrieving share", async () => {
    const { createComparisonShare, getSharedComparison } = await import("./comparisonShareDb");
    
    // Create a share
    const created = await createComparisonShare({
      userId: 1,
      contractorIds: [1],
      title: "View Count Test",
      expiresInDays: 7,
    });
    
    // Retrieve it multiple times
    await getSharedComparison(created.shareToken);
    await getSharedComparison(created.shareToken);
    const final = await getSharedComparison(created.shareToken);
    
    expect(final?.viewCount).toBeGreaterThanOrEqual(3);
    
    // Clean up
    await db.execute(sql`DELETE FROM shared_comparisons WHERE share_token = ${created.shareToken}`);
  });

  it("should get detailed contractor data for shared comparison", { timeout: 10000 }, async () => {
    const { createComparisonShare, getSharedComparisonDetails } = await import("./comparisonShareDb");
    
    // Create a share with real contractor IDs
    const created = await createComparisonShare({
      userId: 1,
      contractorIds: [30001], // Test Contractor
      title: "Details Test",
      expiresInDays: 7,
    });
    
    // Get detailed data
    const details = await getSharedComparisonDetails(created.shareToken);
    
    expect(details).toBeDefined();
    expect(details?.contractors).toBeDefined();
    expect(details?.contractors?.length).toBe(1);
    
    // Check first contractor has expected fields
    const firstContractor = details?.contractors?.[0];
    expect(firstContractor?.name).toBeDefined();
    expect(firstContractor?.businessName).toBeDefined();
    
    // Clean up
    await db.execute(sql`DELETE FROM shared_comparisons WHERE share_token = ${created.shareToken}`);
  });
});
