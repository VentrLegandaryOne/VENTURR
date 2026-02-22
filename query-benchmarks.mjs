import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

const [rows] = await connection.execute('SELECT * FROM price_benchmarks LIMIT 10');
console.log(JSON.stringify(rows, null, 2));

await connection.end();
