# Google OAuth Setup Guide

If "Sign up with Google" is not working, it is usually due to one of three configuration steps missing in Supabase or Google Cloud Console.

## 1. Google Cloud Console Configuration

1.  Go to [Google Cloud Console](https://console.cloud.google.com/).
2.  Select your project (or create one).
3.  Go to **APIs & Services** > **Credentials**.
4.  Find your **OAuth 2.0 Client ID** (or create one for Web Application).
5.  **Authorized JavaScript Origins**:
    *   `https://wdlcttgfwoejqynlylpv.supabase.co` (Your Supabase URL)
    *   `https://hybridtradeai.com`
    *   `https://hybrid-trade-ai-omega.vercel.app`
6.  **Authorized Redirect URIs** (CRITICAL):
    *   `https://wdlcttgfwoejqynlylpv.supabase.co/auth/v1/callback`
    *   **Note:** It must be the *Supabase* URL, not your app URL.

## 2. Supabase Dashboard Configuration

1.  Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2.  Navigate to **Authentication** > **Providers**.
3.  Select **Google**.
4.  Ensure **Enable Sign in with Google** is ON.
5.  Paste the **Client ID** and **Client Secret** from Google Cloud Console.
6.  Click **Save**.

## 3. Supabase URL Configuration (The most common fix)

1.  Navigate to **Authentication** > **URL Configuration**.
2.  **Site URL**: Set this to your production URL: `https://hybridtradeai.com`
3.  **Redirect URLs**: Add **ALL** of the following:
    *   `https://hybridtradeai.com/auth/callback`
    *   `https://hybrid-trade-ai-omega.vercel.app/auth/callback`
    *   `http://localhost:3000/auth/callback` (for local testing)
4.  Click **Save**.

## 4. Verification

After saving these settings, try signing up with Google again.
*   If you see a Google "400 redirect_uri_mismatch" error, Step 1 or Step 3 is incorrect.
*   If you see "AuthApiError: invalid_request", Step 2 might be wrong.
