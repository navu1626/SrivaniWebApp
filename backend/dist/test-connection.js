"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./config/database");
dotenv_1.default.config();
async function testDatabaseConnection() {
    try {
        console.log('🔄 Testing database connection...');
        await (0, database_1.connectDatabase)();
        console.log('✅ Database connection successful');
        const result = await (0, database_1.executeQuery)('SELECT GETDATE() as CurrentTime, @@VERSION as Version');
        console.log('✅ Test query successful');
        console.log('📅 Current Time:', result.recordset[0].CurrentTime);
        console.log('🗄️ SQL Server Version:', result.recordset[0].Version.split('\n')[0]);
        const dbCheck = await (0, database_1.executeQuery)(`
      SELECT name FROM sys.databases WHERE name = 'SrivaniQuizDB'
    `);
        if (dbCheck.recordset.length > 0) {
            console.log('✅ SrivaniQuizDB database exists');
            const tableCheck = await (0, database_1.executeQuery)(`
        SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_TYPE = 'BASE TABLE' 
        ORDER BY TABLE_NAME
      `);
            if (tableCheck.recordset.length > 0) {
                console.log('✅ Database tables found:');
                tableCheck.recordset.forEach((table) => {
                    console.log(`   📋 ${table.TABLE_NAME}`);
                });
            }
            else {
                console.log('⚠️ No tables found in database. Run the schema deployment script.');
            }
        }
        else {
            console.log('⚠️ SrivaniQuizDB database does not exist. Run the schema deployment script.');
        }
        await (0, database_1.closeDatabase)();
        console.log('✅ Database connection test completed successfully');
    }
    catch (error) {
        console.error('❌ Database connection test failed:', error);
        process.exit(1);
    }
}
testDatabaseConnection();
//# sourceMappingURL=test-connection.js.map