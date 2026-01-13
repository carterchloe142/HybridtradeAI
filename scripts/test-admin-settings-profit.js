const http = require('http');

const tests = [
  {
    name: 'Settings - No Token',
    path: '/api/admin/settings',
    method: 'POST',
    body: { key: 'test', value: '123' },
    expectedStatus: 401
  },
  {
    name: 'Profit Engine - GET - No Token',
    path: '/api/admin/profit-engine',
    method: 'GET',
    expectedStatus: 401
  },
  {
    name: 'Profit Engine - POST - No Token',
    path: '/api/admin/profit-engine',
    method: 'POST',
    body: { fee_percent: 10 },
    expectedStatus: 401
  }
];

function runTest(index) {
  if (index >= tests.length) return;
  const test = tests[index];

  console.log(`--- Testing ${test.name} ---`);
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: test.path,
    method: test.method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => { data += chunk; });

    res.on('end', () => {
      // console.log('BODY:', data); // Body might be HTML error if 404
      if (res.statusCode === test.expectedStatus) {
        console.log('✅ PASS');
      } else {
        console.log(`❌ FAIL: Expected ${test.expectedStatus}, got ${res.statusCode}`);
        if (res.statusCode === 404) {
             console.log('NOTE: 404 means the endpoint was not found (file might be missing or build needed).');
        }
      }
      runTest(index + 1);
    });
  });

  req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
    console.log('Is the server running on port 3000?');
    // runTest(index + 1); // Stop on connection error
  });

  if (test.body) {
    req.write(JSON.stringify(test.body));
  }
  req.end();
}

runTest(0);
