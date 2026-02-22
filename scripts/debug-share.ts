import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { sql } from "drizzle-orm";

async function debugShare(shareToken: string) {
  const connection = await mysql.createConnection(process.env.DATABASE_URL as string);
  const db = drizzle(connection);
  
  console.log("1. Querying share record...");
  const result = await db.execute(sql`
    SELECT * FROM shared_comparisons WHERE share_token = ${shareToken}
  `);
  
  const rows = (result as any)[0] as any[];
  console.log("2. Rows found:", rows.length);
  
  if (rows.length === 0) {
    console.log("ERROR: No share found with token:", shareToken);
    await connection.end();
    return;
  }
  
  const share = rows[0];
  console.log("3. Share record:", share);
  
  // Check expiry
  console.log("4. Expires at:", share.expires_at);
  console.log("5. Current time:", new Date());
  
  if (share.expires_at) {
    const expiryDate = new Date(share.expires_at);
    const now = new Date();
    console.log("6. Expiry date parsed:", expiryDate);
    console.log("7. Is expired?", expiryDate < now);
  }
  
  // Parse contractor IDs
  const contractorIds = typeof share.contractor_ids === "string" 
    ? JSON.parse(share.contractor_ids) 
    : share.contractor_ids;
  console.log("8. Contractor IDs:", contractorIds);
  
  // Get contractors
  for (const contractorId of contractorIds) {
    const contractorResult = await db.execute(sql`
      SELECT id, name, business_name FROM contractors WHERE id = ${contractorId}
    `);
    const contractor = (contractorResult as any)[0]?.[0];
    console.log(`9. Contractor ${contractorId}:`, contractor);
  }
  
  await connection.end();
  console.log("10. Debug complete!");
}

const token = "fbf2917b7eead7b1a378183a56ce4f926062c48eededa24aaf0b13ddada034d3";
debugShare(token).catch(console.error);
