const http = require('http');

const endpoints = [
  // Auth Required Endpoints (Expect 401)
  { method: 'POST', path: '/api/user/deposit', body: { amount: 100, currency: 'USD' }, expect: 401 },
  { method: 'POST', path: '/api/user/invest', body: { amount: 100, planId: 'starter' }, expect: 401 },
  { method: 'GET', path: '/api/user/transactions', expect: 401 },
  { method: 'POST', path: '/api/user/transactions', body: { amount: 50, kind: 'withdraw' }, expect: 401 },
  { method: 'GET', path: '/api/user/support', expect: 401 },
  { method: 'POST', path: '/api/user/support', body: { subject: 'Test', message: 'Hello' }, expect: 401 },
  { method: 'GET', path: '/api/user/investments/summary', expect: 401 },
  { method: 'GET', path: '/api/user/proof/roi', expect: 401 },
  { method: 'GET', path: '/api/user/investments/123/simulation', expect: 401 },
  { method: 'GET', path: '/api/user/notifications', expect: 401 },
  { method: 'GET', path: '/api/user/notifications/stream', expect: 401 },
  
  // Public Endpoints (Expect 200)
  { method: 'GET', path: '/api/transparency/public', expect: 200 },
  { method: 'GET', path: '/api/transparency/published', expect: 200 },
  { method: 'GET', path: '/api/platform/stats', expect: 200 },
];

async function runTests() {
  console.log('Starting User API Tests...');
  let passed = 0;
  let failed = 0;

  for (const test of endpoints) {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: test.path,
      method: test.method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    await new Promise((resolve) => {
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          const expected = test.expect;
          
          if (res.statusCode === expected) {
            console.log(`✅ [${test.method}] ${test.path} - ${res.statusCode} (Expected)`);
            passed++;
          } else if (res.statusCode === 404) {
            console.log(`❌ [${test.method}] ${test.path} - 404 Not Found`);
            failed++;
          } else {
            console.log(`⚠️ [${test.method}] ${test.path} - ${res.statusCode} (Expected ${expected})`);
            // If we expect 200 but got 500 (e.g. Supabase error), we can inspect data
            if (res.statusCode === 500) {
               console.log(`   -> Error: ${data.substring(0, 100)}...`);
            }
            failed++;
          }
          resolve();
        });
      });

      req.on('error', (e) => {
        console.error(`❌ [${test.method}] ${test.path} - Network Error: ${e.message}`);
        failed++;
        resolve();
      });

      if (test.body) {
        req.write(JSON.stringify(test.body));
      }
      req.end();
    });
  }

  console.log(`\nTests Completed: ${passed} Passed, ${failed} Failed`);
}

runTests();
