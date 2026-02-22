import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { sql } from 'drizzle-orm';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

const results = await db.execute(sql`
  SELECT 
    (SELECT COUNT(*) FROM contractors) as contractors,
    (SELECT COUNT(*) FROM quotes) as quotes,
    (SELECT COUNT(*) FROM verifications) as verifications,
    (SELECT COUNT(*) FROM portfolio_projects) as portfolio_projects,
    (SELECT COUNT(*) FROM contractor_certifications) as certifications,
    (SELECT COUNT(*) FROM price_benchmarks) as price_benchmarks,
    (SELECT COUNT(*) FROM market_rates) as market_rates
`);

console.log('Database counts:', results[0][0]);
await connection.end();
