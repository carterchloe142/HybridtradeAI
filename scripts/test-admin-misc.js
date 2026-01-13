const http = require('http');

const tests = [
  {
    name: 'Health - GET - No Token',
    path: '/api/admin/health',
    method: 'GET',
    expectedStatus: 401
  },
  {
    name: 'Proof Config - GET - No Token',
    path: '/api/admin/proof-config',
    method: 'GET',
    expectedStatus: 401
  },
  {
    name: 'Privacy Config - GET - No Token',
    path: '/api/admin/por-privacy-config',
    method: 'GET',
    expectedStatus: 401
  },
  {
    name: 'Transparency - GET - Public',
    path: '/api/transparency',
    method: 'GET',
    expectedStatus: 200
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
        } else if (res.statusCode === 500) {
             console.log('NOTE: 500 means internal server error (maybe DB connection failed).');
             console.log('BODY:', data);
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
