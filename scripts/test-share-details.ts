import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { sql } from "drizzle-orm";

async function getSharedComparisonDetails(shareToken: string) {
  const connection = await mysql.createConnection(process.env.DATABASE_URL as string);
  const db = drizzle(connection);
  
  // Get share record
  const shareResult = await db.execute(sql`
    SELECT * FROM shared_comparisons WHERE share_token = ${shareToken}
  `);
  
  const rows = (shareResult as any)[0] as any[];
  console.log("Share record:", rows[0]);
  
  if (rows.length === 0) {
    console.log("No share found");
    await connection.end();
    return null;
  }
  
  const share = rows[0];
  const contractorIds = typeof share.contractor_ids === "string" 
    ? JSON.parse(share.contractor_ids) 
    : share.contractor_ids;
  
  console.log("Contractor IDs:", contractorIds);
  
  // Get contractors
  for (const contractorId of contractorIds) {
    const contractorResult = await db.execute(sql`
      SELECT * FROM contractors WHERE id = ${contractorId}
    `);
    console.log(`Contractor ${contractorId}:`, (contractorResult as any)[0]?.[0]);
  }
  
  await connection.end();
}

const token = "fbf2917b7eead7b1a378183a56ce4f926062c48eededa24aaf0b13ddada034d3";
getSharedComparisonDetails(token).catch(console.error);
