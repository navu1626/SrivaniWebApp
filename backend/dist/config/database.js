"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = connectDatabase;
exports.getDatabase = getDatabase;
exports.closeDatabase = closeDatabase;
exports.executeQuery = executeQuery;
exports.executeStoredProcedure = executeStoredProcedure;
exports.beginTransaction = beginTransaction;
const mssql_1 = __importDefault(require("mssql"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const DB_ENV = (process.env.DB_ENV || 'local').toLowerCase();
const serverName = process.env.DB_SERVER || 'np:\\\.\pipe\\LOCALDB#2C77AFB6\\tsql\\query';
const databaseName = process.env.DB_DATABASE || process.env.DB_NAME || 'SrivaniQuizDB';
let poolConfig;
if (DB_ENV === 'vps') {
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
        },
        pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
    };
}
else {
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
let pool = null;
async function connectDatabase() {
    try {
        if (pool && pool.connected) {
            return pool;
        }
        console.log(`🔄 Connecting to SQL Server database (mode=${DB_ENV})...`);
        console.log(`📍 Server: ${process.env.DB_SERVER || serverName}`);
        console.log(`📍 Database: ${process.env.DB_NAME || process.env.DB_DATABASE || databaseName}`);
        if (DB_ENV === 'vps') {
            pool = await mssql_1.default.connect(poolConfig);
        }
        else {
            const ms = require('mssql/msnodesqlv8');
            pool = await ms.connect(poolConfig);
        }
        console.log('✅ Database connection established successfully');
        const result = await pool.request().query('SELECT 1 as test');
        if (result.recordset && result.recordset[0] && result.recordset[0].test === 1) {
            console.log('✅ Database connection test passed');
        }
        return pool;
    }
    catch (error) {
        console.error('❌ Database connection failed:', error);
        throw error;
    }
}
function getDatabase() {
    if (!pool || !pool.connected) {
        throw new Error('Database not connected. Call connectDatabase() first.');
    }
    return pool;
}
async function closeDatabase() {
    try {
        if (pool && pool.connected) {
            await pool.close();
            pool = null;
            console.log('✅ Database connection closed');
        }
    }
    catch (error) {
        console.error('❌ Error closing database connection:', error);
        throw error;
    }
}
async function executeQuery(query, params) {
    try {
        const db = getDatabase();
        const request = db.request();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                request.input(key, value);
            });
        }
        const result = await request.query(query);
        return result;
    }
    catch (error) {
        console.error('❌ Query execution failed:', error);
        throw error;
    }
}
async function executeStoredProcedure(procedureName, params) {
    try {
        const db = getDatabase();
        const request = db.request();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                request.input(key, value);
            });
        }
        const result = await request.execute(procedureName);
        return result;
    }
    catch (error) {
        console.error('❌ Stored procedure execution failed:', error);
        throw error;
    }
}
async function beginTransaction() {
    try {
        const db = getDatabase();
        const transaction = new mssql_1.default.Transaction(db);
        await transaction.begin();
        return transaction;
    }
    catch (error) {
        console.error('❌ Failed to begin transaction:', error);
        throw error;
    }
}
process.on('SIGINT', async () => {
    await closeDatabase();
});
process.on('SIGTERM', async () => {
    await closeDatabase();
});
exports.default = {
    connectDatabase,
    getDatabase,
    closeDatabase,
    executeQuery,
    executeStoredProcedure,
    beginTransaction,
};
//# sourceMappingURL=database.js.map