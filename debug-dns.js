
const dns = require('dns');

const domains = [
  'wdlcttgfwoejqynlylpv.supabase.co',
  'db.wdlcttgfwoejqynlylpv.supabase.co'
];

domains.forEach(domain => {
  dns.lookup(domain, (err, address, family) => {
    if (err) {
      console.log(`Error resolving ${domain}:`, err.code);
    } else {
      console.log(`Resolved ${domain} to ${address} (IPv${family})`);
    }
  });
});
