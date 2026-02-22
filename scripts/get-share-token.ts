import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { sql } from "drizzle-orm";

async function main() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  const db = drizzle(connection);
  
  const result = await db.execute(sql`SELECT share_token FROM shared_comparisons ORDER BY created_at DESC LIMIT 1`);
  console.log("Share token:", JSON.stringify(result[0]));
  
  await connection.end();
  process.exit(0);
}

main().catch(console.error);
