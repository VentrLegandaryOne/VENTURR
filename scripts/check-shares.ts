import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { sql } from "drizzle-orm";

async function main() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL as string);
  const db = drizzle(connection);
  
  const result = await db.execute(sql`SELECT * FROM shared_comparisons`);
  console.log("Shared comparisons:", JSON.stringify(result[0], null, 2));
  
  await connection.end();
  process.exit(0);
}

main().catch(console.error);
