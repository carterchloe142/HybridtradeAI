const http = require('http');

const tests = [
  {
    name: 'Invite Admin - No Token',
    path: '/api/admin/users/invite-admin',
    method: 'POST',
    body: { email: 'test@example.com' },
    expectedStatus: 401
  },
  {
    name: 'Promote User - No Token',
    path: '/api/admin/users/promote',
    method: 'POST',
    body: { userId: '123' },
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
      console.log('BODY:', data);
      if (res.statusCode === test.expectedStatus) {
        console.log('✅ PASS');
      } else {
        console.log(`❌ FAIL: Expected ${test.expectedStatus}, got ${res.statusCode}`);
      }
      runTest(index + 1);
    });
  });

  req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
    runTest(index + 1);
  });

  if (test.body) {
    req.write(JSON.stringify(test.body));
  }
  req.end();
}

runTest(0);
