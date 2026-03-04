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
    if (!hash || !hash.includes('error=')) return;

    // Parse hash parameters
    // Note: hash includes '#', so substring(1) removes it
    const params = new URLSearchParams(hash.substring(1));
    const error = params.get('error');
    const errorCode = params.get('error_code');
    const errorDescription = params.get('error_description');

    if (error || errorCode || errorDescription) {
      // Clear hash to prevent loops or persistent error states on reload
      // Using history.replaceState to modify URL without reloading
      const newUrl = window.location.pathname + window.location.search;
      window.history.replaceState({}, '', newUrl);

      // Determine redirection target
      // If it's a password recovery flow failure, maybe send them back to forgot-password?
      // But login is safer as a general fallback.
      const target = '/auth/login';
      
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
