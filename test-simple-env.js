// Simple test to check environment
console.log('=== Environment Check ===');
console.log('PAYSTACK_SECRET_KEY exists:', !!process.env.PAYSTACK_SECRET_KEY);

if (process.env.PAYSTACK_SECRET_KEY) {
  console.log('Key starts with:', process.env.PAYSTACK_SECRET_KEY.substring(0, 15) + '...');
  console.log('Key length:', process.env.PAYSTACK_SECRET_KEY.length);
} else {
  console.log('❌ No Paystack key found!');
}