import dotenv from 'dotenv';
import { connectDatabase, executeQuery, closeDatabase } from './config/database';

// Load environment variables
dotenv.config();

async function testDatabaseConnection() {
  try {
    console.log('🔄 Testing database connection...');
    
    // Connect to database
    await connectDatabase();
    console.log('✅ Database connection successful');
    
    // Test query
    const result = await executeQuery('SELECT GETDATE() as CurrentTime, @@VERSION as Version');
    console.log('✅ Test query successful');
    console.log('📅 Current Time:', result.recordset[0].CurrentTime);
    console.log('🗄️ SQL Server Version:', result.recordset[0].Version.split('\n')[0]);
    
    // Test if database exists
    const dbCheck = await executeQuery(`
      SELECT name FROM sys.databases WHERE name = 'SrivaniQuizDB'
    `);
    
    if (dbCheck.recordset.length > 0) {
      console.log('✅ SrivaniQuizDB database exists');
      
      // Check if tables exist
      const tableCheck = await executeQuery(`
        SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_TYPE = 'BASE TABLE' 
        ORDER BY TABLE_NAME
      `);
      
      if (tableCheck.recordset.length > 0) {
        console.log('✅ Database tables found:');
        tableCheck.recordset.forEach((table: any) => {
          console.log(`   📋 ${table.TABLE_NAME}`);
        });
      } else {
        console.log('⚠️ No tables found in database. Run the schema deployment script.');
      }
    } else {
      console.log('⚠️ SrivaniQuizDB database does not exist. Run the schema deployment script.');
    }
    
    await closeDatabase();
    console.log('✅ Database connection test completed successfully');
    
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    process.exit(1);
  }
}

// Run the test
testDatabaseConnection();
