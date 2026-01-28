
require('dotenv').config({ path: '.env.local' });

console.log('Checking Supabase Configuration...');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not Set');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not Set');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'Set' : 'Not Set');
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'Set' : 'Not Set');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not Set');

if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.log('Attempting to connect...');
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    supabase.from('User').select('count', { count: 'exact', head: true }).then(({ count, error }) => {
        if (error) {
            console.error('Connection failed:', error.message);
        } else {
            console.log('Connection successful! User count:', count);
        }
    }).catch(err => {
        console.error('Connection error:', err);
    });
} else {
    console.log('Cannot attempt connection: Missing credentials.');
}
