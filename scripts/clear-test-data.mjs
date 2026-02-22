import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { sql } from 'drizzle-orm';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

console.log('🧹 Clearing test data from database...\n');

// Clear in order to respect foreign key constraints
const tables = [
  'contractor_reviews',
  'contractor_certifications', 
  'portfolio_projects',
  'verifications',
  'quotes',
  'contractors',
  'comparison_items',
  'comparison_groups',
  'notifications',
  'upload_analytics'
];

for (const table of tables) {
  try {
    const result = await db.execute(sql.raw(`DELETE FROM ${table}`));
    console.log(`✅ Cleared ${table}: ${result[0].affectedRows || 0} rows deleted`);
  } catch (error) {
    console.log(`⚠️ Skipped ${table}: ${error.message}`);
  }
}

// Verify counts after clearing
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

console.log('\n📊 Database counts after clearing:');
console.log(results[0][0]);

console.log('\n✅ Test data cleared successfully!');
console.log('📌 Kept: price_benchmarks and market_rates (legitimate market data)');

await connection.end();
