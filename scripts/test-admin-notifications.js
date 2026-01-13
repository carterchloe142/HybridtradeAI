const http = require('http');

const tests = [
  {
    name: 'Notifications - GET - No Token',
    path: '/api/admin/notifications',
    method: 'GET',
    expectedStatus: 401
  },
  {
    name: 'Notifications - POST Mark Read - No Token',
    path: '/api/admin/notifications/mark-read',
    method: 'POST',
    body: { ids: ['123'] },
    expectedStatus: 401
  },
  {
    name: 'Notifications - GET Global - No Token',
    path: '/api/admin/notifications?scope=global',
    method: 'GET',
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
      // console.log('BODY:', data);
      if (res.statusCode === test.expectedStatus) {
        console.log('✅ PASS');
      } else {
        console.log(`❌ FAIL: Expected ${test.expectedStatus}, got ${res.statusCode}`);
        if (res.statusCode === 404) {
             console.log('NOTE: 404 means the endpoint was not found.');
        }
      }
      runTest(index + 1);
    });
  });

  req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
    console.log('Is the server running on port 3000?');
  });

  if (test.body) {
    req.write(JSON.stringify(test.body));
  }
  req.end();
}

runTest(0);
