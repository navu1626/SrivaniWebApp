const sql = require('mssql');

const config = {
  server: '(localdb)\\MSSQLLocalDB',
  database: 'master',
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

async function testConnection() {
  try {
    console.log('🔄 Testing database connection...');
    
    const pool = await sql.connect(config);
    console.log('✅ Connected to SQL Server');
    
    // Check if SrivaniQuizDB exists
    const result = await pool.request().query(`
      SELECT name FROM sys.databases WHERE name = 'SrivaniQuizDB'
    `);
    
    if (result.recordset.length > 0) {
      console.log('✅ SrivaniQuizDB database exists');
      
      // Connect to SrivaniQuizDB and check tables
      await pool.close();
      
      const dbConfig = { ...config, database: 'SrivaniQuizDB' };
      const dbPool = await sql.connect(dbConfig);
      
      const tables = await dbPool.request().query(`
        SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_TYPE = 'BASE TABLE' 
        ORDER BY TABLE_NAME
      `);
      
      console.log('✅ Tables in SrivaniQuizDB:');
      tables.recordset.forEach(table => {
        console.log(`   📋 ${table.TABLE_NAME}`);
      });
      
      await dbPool.close();
    } else {
      console.log('⚠️ SrivaniQuizDB database does not exist');
      console.log('🔄 Creating database...');
      
      await pool.request().query('CREATE DATABASE SrivaniQuizDB');
      console.log('✅ SrivaniQuizDB database created');
      
      await pool.close();
    }
    
    console.log('✅ Database test completed successfully');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  }
}

testConnection();
