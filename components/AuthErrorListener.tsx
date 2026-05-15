'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Listens for authentication errors in the URL hash (common with Supabase OAuth/Magic Link failures)
 * and redirects the user to the login page with a clean error message.
 */
export default function AuthErrorListener() {
  const router = useRouter();

  useEffect(() => {
    // Check hash for Supabase errors
    // URL format example: /#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired
    if (typeof window === 'undefined') return;

    const hash = window.location.hash;
    if (!hash || (!hash.includes('error=') && !hash.includes('type=recovery'))) return;

    // Parse hash parameters
    // Note: hash includes '#', so substring(1) removes it
    const params = new URLSearchParams(hash.substring(1));
    const error = params.get('error');
    const errorCode = params.get('error_code');
    const errorDescription = params.get('error_description');
    
    const accessToken = params.get('access_token');
    const type = params.get('type');

    // Check if it's a successful recovery that got dropped on the wrong page (e.g. root)
    if (!error && !errorCode && accessToken && type === 'recovery') {
      if (!window.location.pathname.includes('/auth/callback')) {
        // Forward the hash to the callback page to complete the sign-in and redirect
        router.push(`/auth/callback${hash}`);
        return;
      }
    }

    if (error || errorCode || errorDescription) {
      // Clear hash to prevent loops or persistent error states on reload
      // Using history.replaceState to modify URL without reloading
      const newUrl = window.location.pathname + window.location.search;
      window.history.replaceState({}, '', newUrl);

      const looksLikeRecoveryError =
        errorCode === 'otp_expired' ||
        /reset|recovery|password/i.test(`${error || ''} ${errorDescription || ''}`);
      const target = looksLikeRecoveryError ? '/auth/forgot-password' : '/auth/login';
      
      // Construct query params for the login page
      const q = new URLSearchParams();
      if (errorDescription) q.set('error', errorDescription.replace(/\+/g, ' '));
      else if (error) q.set('error', error);
      
      if (errorCode) q.set('code', errorCode);

      // Redirect
      router.push(`${target}?${q.toString()}`);
    }
  }, [router]);

  return null;
}
