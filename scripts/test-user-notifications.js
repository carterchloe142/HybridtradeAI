const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testUserNotifications() {
  console.log('--- Testing User Notifications ---');

  // 1. GET /api/user/notifications (Expect 401)
  try {
    const res = await fetch(`${BASE_URL}/api/user/notifications`);
    console.log(`[GET] /api/user/notifications - Status: ${res.status}`);
    if (res.status === 401) console.log('✅ Auth check passed');
    else console.log('❌ Auth check failed');
  } catch (e) {
    console.error('Error:', e.message);
  }

  // 2. POST /api/user/notifications/mark-read (Expect 401)
  try {
    const res = await fetch(`${BASE_URL}/api/user/notifications/mark-read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: ['123'] })
    });
    console.log(`[POST] /api/user/notifications/mark-read - Status: ${res.status}`);
    if (res.status === 401) console.log('✅ Auth check passed');
    else console.log('❌ Auth check failed');
  } catch (e) {
    console.error('Error:', e.message);
  }

  // 3. GET /api/user/notifications/stream (Expect 401)
  try {
    const res = await fetch(`${BASE_URL}/api/user/notifications/stream`);
    console.log(`[GET] /api/user/notifications/stream - Status: ${res.status}`);
    if (res.status === 401) console.log('✅ Auth check passed');
    else console.log('❌ Auth check failed');
  } catch (e) {
    console.error('Error:', e.message);
  }
}

testUserNotifications();
