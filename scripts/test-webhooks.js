const http = require('http');
const crypto = require('crypto');

const BASE_URL = 'http://localhost:3000';
const NOWPAYMENTS_SECRET = 'test_ipn_secret';
const PAYSTACK_SECRET = 'test_paystack_secret';

async function testNowPayments() {
  console.log('Testing NOWPayments Webhook...');
  
  const body = {
    payment_status: 'finished',
    payment_id: '5973356801',
    pay_address: '0x123...',
    price_amount: '100',
    price_currency: 'usd',
    pay_amount: '0.05',
    pay_currency: 'eth',
    order_id: 'TX-TEST-123', // This should be a valid transaction ID in DB if we want full success, but here we test endpoint logic
    order_description: 'Test Deposit',
    ipn_id: 'ipn_123',
    created_at: '2020-12-12T12:12:12.000Z',
    updated_at: '2020-12-12T12:12:12.000Z',
    purchase_id: '123',
    outcome_amount: '100',
    outcome_currency: 'usd'
  };

  // Sort and sign
  const sortedString = Object.keys(body)
    .sort()
    .map(key => `${key}=${body[key]}`)
    .join('&');
    
  const signature = crypto.createHmac('sha512', NOWPAYMENTS_SECRET)
    .update(sortedString)
    .digest('hex');

  try {
    const res = await fetch(`${BASE_URL}/api/webhooks/nowpayments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-nowpayments-sig': signature
      },
      body: JSON.stringify(body)
    });

    console.log(`NOWPayments Status: ${res.status}`);
    const text = await res.text();
    console.log(`Response: ${text}`);
    if (res.status === 200) console.log('✅ NOWPayments Test Passed');
    else console.log('❌ NOWPayments Test Failed');

  } catch (e) {
    console.error('NOWPayments Error:', e.message);
  }
}

async function testPaystack() {
  console.log('\nTesting Paystack Webhook...');

  const body = {
    event: 'charge.success',
    data: {
      reference: 'TX-TEST-456',
      amount: 500000, // 5000.00
      currency: 'NGN',
      status: 'success',
      customer: {
        email: 'test@example.com'
      }
    }
  };

  const signature = crypto.createHmac('sha512', PAYSTACK_SECRET)
    .update(JSON.stringify(body))
    .digest('hex');

  try {
    const res = await fetch(`${BASE_URL}/api/webhooks/paystack`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-paystack-signature': signature
      },
      body: JSON.stringify(body)
    });

    console.log(`Paystack Status: ${res.status}`);
    const text = await res.text();
    console.log(`Response: ${text}`);
    if (res.status === 200) console.log('✅ Paystack Test Passed');
    else console.log('❌ Paystack Test Failed');

  } catch (e) {
    console.error('Paystack Error:', e.message);
  }
}

async function run() {
  await testNowPayments();
  await testPaystack();
}

run();
