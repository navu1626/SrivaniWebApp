import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

// DB mode: 'local' for LocalDB (Windows LocalDB via msnodesqlv8), 'vps' for remote SQL Server
const DB_ENV = (process.env.DB_ENV || 'local').toLowerCase();

// Common names
const serverName = process.env.DB_SERVER || 'np:\\\.\pipe\\LOCALDB#2C77AFB6\\tsql\\query';
const databaseName = process.env.DB_DATABASE || process.env.DB_NAME || 'SrivaniQuizDB';

// Configuration objects for both modes. Keep local (msnodesqlv8) and vps (tedious) options available.
let poolConfig: any;

if (DB_ENV === 'vps') {
  // VPS / remote SQL Server (SQL Authentication)
  poolConfig = {
    user: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD || '',
    server: process.env.DB_SERVER || '127.0.0.1',
    database: process.env.DB_NAME || process.env.DB_DATABASE || databaseName,
    port: parseInt(process.env.DB_PORT || '1433', 10),
    options: {
      encrypt: (process.env.DB_ENCRYPT || 'false') === 'true',
      trustServerCertificate: (process.env.DB_TRUST_SERVER_CERTIFICATE || 'true') === 'true',
      enableArithAbort: true,
      // If you have instance name, you can set instanceName here
      // instanceName: process.env.DB_INSTANCE || undefined,
    },
    pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
  };
} else {
  // LocalDB via msnodesqlv8 (Windows). Uses trusted connection.
  // Keep settings compatible with previous implementation and allow Trusted Connection.
  poolConfig = {
    driver: 'msnodesqlv8',
    server: process.env.DB_SERVER || serverName,
    database: process.env.DB_DATABASE || databaseName,
    options: {
      trustedConnection: true,
      trustServerCertificate: true,
      enableArithAbort: true,
      useUTC: false,
    },
    pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
  };
}


// Connection pool
let pool: sql.ConnectionPool | null = null;

/**
 * Connect to the database
 */
export async function connectDatabase(): Promise<sql.ConnectionPool> {
  try {
    if (pool && pool.connected) {
      return pool;
    }

    console.log(`🔄 Connecting to SQL Server database (mode=${DB_ENV})...`);
    console.log(`📍 Server: ${process.env.DB_SERVER || serverName}`);
    console.log(`📍 Database: ${process.env.DB_NAME || process.env.DB_DATABASE || databaseName}`);

    if (DB_ENV === 'vps') {
      // Use default 'mssql' (tedious) driver for remote SQL Server with SQL auth
      pool = await sql.connect(poolConfig);
    } else {
      // For local Windows LocalDB, prefer msnodesqlv8 driver
      // Use require to dynamically import the msnodesqlv8 build
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const ms = require('mssql/msnodesqlv8');
      pool = await ms.connect(poolConfig);
    }

    console.log('✅ Database connection established successfully');

    // Test the connection
  const result = await (pool as sql.ConnectionPool).request().query('SELECT 1 as test');
  if (result.recordset && result.recordset[0] && result.recordset[0].test === 1) {
      console.log('✅ Database connection test passed');
    }

  return pool as sql.ConnectionPool;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

/**
 * Get the database connection pool
 */
export function getDatabase(): sql.ConnectionPool {
  if (!pool || !pool.connected) {
    throw new Error('Database not connected. Call connectDatabase() first.');
  }
  return pool;
}

/**
 * Close the database connection
 */
export async function closeDatabase(): Promise<void> {
  try {
    if (pool && pool.connected) {
      await pool.close();
      pool = null;
      console.log('✅ Database connection closed');
    }
  } catch (error) {
    console.error('❌ Error closing database connection:', error);
    throw error;
  }
}

/**
 * Execute a query with parameters
 */
export async function executeQuery<T = any>(
  query: string,
  params?: Record<string, any>
): Promise<sql.IResult<T>> {
  try {
    const db = getDatabase();
    const request = db.request();

    // Add parameters if provided
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        request.input(key, value);
      });
    }

    const result = await request.query(query);
    return result;
  } catch (error) {
    console.error('❌ Query execution failed:', error);
    throw error;
  }
}

/**
 * Execute a stored procedure with parameters
 */
export async function executeStoredProcedure<T = any>(
  procedureName: string,
  params?: Record<string, any>
): Promise<sql.IProcedureResult<T>> {
  try {
    const db = getDatabase();
    const request = db.request();

    // Add parameters if provided
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        request.input(key, value);
      });
    }

    const result = await request.execute(procedureName);
    return result;
  } catch (error) {
    console.error('❌ Stored procedure execution failed:', error);
    throw error;
  }
}

/**
 * Begin a transaction
 */
export async function beginTransaction(): Promise<sql.Transaction> {
  try {
    const db = getDatabase();
    const transaction = new sql.Transaction(db);
    await transaction.begin();
    return transaction;
  } catch (error) {
    console.error('❌ Failed to begin transaction:', error);
    throw error;
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  await closeDatabase();
});

process.on('SIGTERM', async () => {
  await closeDatabase();
});

export default {
  connectDatabase,
  getDatabase,
  closeDatabase,
  executeQuery,
  executeStoredProcedure,
  beginTransaction,
};
