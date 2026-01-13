const http = require('http');

const tests = [
  {
    name: 'Queue Stats - GET - No Token',
    path: '/api/admin/queue/stats',
    method: 'GET',
    expectedStatus: 401
  },
  {
    name: 'Queue Jobs - GET - No Token',
    path: '/api/admin/queue/jobs',
    method: 'GET',
    expectedStatus: 401
  },
  {
    name: 'Rate Limit Status - GET - No Token',
    path: '/api/admin/rate-limit/status',
    method: 'GET',
    expectedStatus: 401
  },
  {
    name: 'Retry Job - POST - No Token',
    path: '/api/admin/queue/job/123/retry',
    method: 'POST',
    expectedStatus: 401
  },
  {
    name: 'Delete Job - DELETE - No Token',
    path: '/api/admin/queue/job/123',
    method: 'DELETE',
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

  req.end();
}

runTest(0);
