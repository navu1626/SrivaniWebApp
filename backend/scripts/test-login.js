// Simple end-to-end login test using builtin fetch (Node 18+)
// Usage: node scripts/test-login.js [baseUrl]
// baseUrl defaults to http://localhost:3005

const baseUrl = process.argv[2] || process.env.BASE_URL || 'http://localhost:3005';

const creds = [
  { label: 'Admin', email: 'admin@srivani.com', password: 'admin123' },
  { label: 'User',  email: 'user@srivani.com',  password: 'user123'  },
];

async function healthCheck() {
  try {
    const res = await fetch(`${baseUrl}/health`, { method: 'GET' });
    const ok = res.ok;
    const text = await res.text().catch(() => '');
    console.log(`\n[Health] GET ${baseUrl}/health -> ${res.status} ${res.statusText}`);
    if (!ok) console.log(text);
    return ok;
  } catch (err) {
    console.error(`[Health] Failed to connect to ${baseUrl}/health`);
    console.error(err.message || err);
    return false;
  }
}

async function login(email, password) {
  try {
    const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const json = await res.json().catch(() => ({}));
    const ok = res.ok && json?.success !== false;
    return { ok, status: res.status, json };
  } catch (err) {
    return { ok: false, error: err.message || String(err) };
  }
}

(async () => {
  console.log(`\n=== SrivaniQuiz Backend Login Test ===`);
  console.log(`Base URL: ${baseUrl}`);

  const healthy = await healthCheck();
  if (!healthy) {
    console.log('\n❌ Backend health check failed. Make sure the server is running.');
    console.log('   Try: cd backend && npm run dev');
    process.exit(1);
  }

  for (const c of creds) {
    console.log(`\n[Login] Testing ${c.label} (${c.email})`);
    const result = await login(c.email, c.password);
    if (result.ok) {
      const user = result.json?.user || result.json?.data || {};
      console.log(`✅ ${c.label} login OK -> status ${result.status}`);
      console.log(`   User: ${user.Email || user.email || 'N/A'} | Role: ${user.Role || user.role || 'N/A'}`);
    } else {
      console.log(`❌ ${c.label} login FAILED`);
      if (result.status) console.log(`   HTTP ${result.status}`);
      if (result.json?.message) console.log(`   Message: ${result.json.message}`);
      if (result.json?.error) console.log(`   Error: ${result.json.error}`);
      if (result.error) console.log(`   Err: ${result.error}`);
      console.log(`   Hint: If message is 'Database not connected', fix DB config and restart backend.`);
    }
  }

  console.log('\n=== Test complete ===\n');
})();

