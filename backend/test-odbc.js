const sql = require('mssql/msnodesqlv8');

const connectionString = 'Driver={ODBC Driver 17 for SQL Server};Server=(localdb)\\MSSQLLocalDB;Database=SrivaniQuizDB;Trusted_Connection=Yes;TrustServerCertificate=Yes;';

(async () => {
  try {
    console.log('Connecting to LocalDB via ODBC...');
    const pool = await sql.connect(connectionString);
    console.log('Connected!');

    const res = await pool.request().query('SELECT TOP 1 name FROM sys.databases');
    console.log('Query OK. Sample row:', res.recordset[0]);

    const users = await pool.request().query('SELECT TOP 1 Email FROM Users');
    console.log('Users sample:', users.recordset);

    await pool.close();
    console.log('Closed.');
    process.exit(0);
  } catch (err) {
    console.error('ODBC test error:', err);
    process.exit(1);
  }
})();

