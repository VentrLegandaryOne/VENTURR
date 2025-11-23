/**
 * Database Connection Pooling
 * 
 * Implements connection pooling to reduce database connection overhead
 * and improve query performance
 */

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { ENV } from "./env";

let pool: mysql.Pool | null = null;
let db: ReturnType<typeof drizzle> | null = null;

/**
 * Get or create database connection pool
 */
export function getPool(): mysql.Pool {
  if (!pool && ENV.databaseUrl) {
    console.log('[DB Pool] Creating connection pool...');
    
    pool = mysql.createPool({
      uri: ENV.databaseUrl,
      connectionLimit: 10, // Maximum number of connections
      queueLimit: 0, // Unlimited queue
      waitForConnections: true,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
      // Connection timeout
      connectTimeout: 10000, // 10 seconds
      // SSL configuration
      ssl: {
        rejectUnauthorized: true,
      },
    });

    // Handle pool errors
    pool.on('connection', () => {
      console.log('[DB Pool] New connection established');
    });

    // Log pool statistics periodically (development only)
    if (process.env.NODE_ENV === 'development') {
      setInterval(() => {
        if (pool) {
          console.log('[DB Pool] Stats:', {
            total: (pool as any)._allConnections?.length || 0,
            free: (pool as any)._freeConnections?.length || 0,
            queue: (pool as any)._connectionQueue?.length || 0,
          });
        }
      }, 60000); // Every minute
    }
  }

  if (!pool) {
    throw new Error('Database connection pool not initialized');
  }

  return pool;
}

/**
 * Get Drizzle instance with connection pool
 */
export function getPooledDb() {
  if (!db) {
    const pool = getPool();
    db = drizzle(pool) as any;
  }
  return db;
}

/**
 * Execute query with connection from pool
 */
export async function executeQuery<T>(
  query: (connection: mysql.PoolConnection) => Promise<T>
): Promise<T> {
  const pool = getPool();
  const connection = await pool.getConnection();
  
  try {
    return await query(connection);
  } finally {
    connection.release();
  }
}

/**
 * Execute transaction with connection from pool
 */
export async function executeTransaction<T>(
  transaction: (connection: mysql.PoolConnection) => Promise<T>
): Promise<T> {
  const pool = getPool();
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    const result = await transaction(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Close connection pool
 */
export async function closePool(): Promise<void> {
  if (pool) {
    console.log('[DB Pool] Closing connection pool...');
    await pool.end();
    pool = null;
    db = null;
  }
}

/**
 * Get pool statistics
 */
export function getPoolStats() {
  if (!pool) {
    return null;
  }

  return {
    total: (pool as any)._allConnections?.length || 0,
    free: (pool as any)._freeConnections?.length || 0,
    queue: (pool as any)._connectionQueue?.length || 0,
  };
}

// Handle process termination
process.on('SIGINT', async () => {
  await closePool();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closePool();
  process.exit(0);
});

