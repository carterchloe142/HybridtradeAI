const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/admin/kyc',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
};

console.log('--- Testing /api/admin/kyc Security ---');

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('BODY:', data);
    
    if (res.statusCode === 401) {
      console.log('PASS: Endpoint correctly rejected request without token.');
    } else {
      console.log('FAIL: Endpoint did not return 401 for missing token.');
    }
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.end();
