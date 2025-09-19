/*
  Run a direct DB query and print results to console.
  Usage:
    node scripts/query-users.js            # uses backend/.env
    DB_SERVER=(localdb)\\MSSQLLocalDB node scripts/query-users.js
*/

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Use msnodesqlv8 (ODBC) which works with LocalDB
const sql = require('mssql/msnodesqlv8');

function normalizeServer(value) {
  if (!value) return value;
  // Trim wrapping single/double quotes if present
  let v = value.trim().replace(/^['"]|['"]$/g, '');
  return v;
}

(async () => {
  const server = normalizeServer(process.env.DB_SERVER) || '(localdb)\\MSSQLLocalDB';
  const database = process.env.DB_DATABASE || 'SrivaniQuizDB';

  const config = {
    driver: 'msnodesqlv8',
    server,
    database,
    options: {
      trustedConnection: true,
      trustServerCertificate: true,
      enableArithAbort: true,
      useUTC: false,
    },
    pool: { max: 5, min: 0, idleTimeoutMillis: 30000 },
  };

  console.log('=== Query Users (Direct DB Test) ===');
  console.log('Server  :', server);
  console.log('Database:', database);

  let pool;
  try {
    console.log('Connecting...');
    pool = await sql.connect(config);
    console.log('Connected. Running query...');

    const query = 'SELECT * FROM [dbo].[Users]';
    const result = await pool.request().query(query);

    console.log(`Rows returned: ${result.recordset.length}`);
    // Show up to 5 sample rows for readability
    const sample = result.recordset.slice(0, 5);
    console.log('Sample rows:', sample);
    
    console.log('Query complete.');
  } catch (err) {
    console.error('Query failed.');
    console.error('Error:', err && (err.message || err));
  } finally {
    try { await pool?.close(); } catch {}
  }
})();

