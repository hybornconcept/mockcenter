# MockCenter — Google OAuth Configuration

> **IMPORTANT SECURITY RULES:**
> - NEVER commit your `client_secret` to Git
> - NEVER share your `client_secret` in any chat, document, or screenshot
> - ONLY store secrets in `.env` (local) or Cloudflare secrets (production)
> - Your `.env` file must be in `.gitignore` — never committed

---

## Google Cloud Project Details

| Field | Value |
|---|---|
| Project name | mockcenter |
| Project ID | mockcenter-492721 |
| Client ID | 75226877255-emkm5raifci52u17s27jro68srbacj95.apps.googleusercontent.com |
| Client Secret | stored in `.env` only — never written here |

---

## Authorised JavaScript Origins

These are set in Google Cloud Console → APIs & Services → Credentials → your OAuth client:

| Environment | URI |
|---|---|
| Frontend dev | http://localhost:5173 |
| Backend dev | http://localhost:8787 |
| Frontend production | https://examenow.ng — add when deploying |
| Backend production | https://api.examenow.ng — add when deploying |

---

## Authorised Redirect URIs

These are the URLs Google sends the user back to after they sign in:

| Environment | URI |
|---|---|
| Local dev | http://localhost:8787/api/auth/callback/google |
| Production | https://api.examenow.ng/api/auth/callback/google — add when deploying |

---

## Google Auth URIs (from downloaded config)

| Field | Value |
|---|---|
| auth_uri | https://accounts.google.com/o/oauth2/auth |
| token_uri | https://oauth2.googleapis.com/token |
| auth_provider_x509_cert_url | https://www.googleapis.com/oauth2/v1/certs |

> You do not need to use these directly. Better Auth handles them internally.
> They are listed here for reference only.

---

## How to store your credentials

### Local development — examenow-backend/.env

```env
GOOGLE_CLIENT_ID=75226877255-emkm5raifci52u17s27jro68srbacj95.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-new-secret-here
```

Replace your-new-secret-here with the new secret you generated after resetting.

---

### Production — Cloudflare secrets (run in terminal when deploying)

```bash
npx wrangler secret put GOOGLE_CLIENT_ID
# paste: 75226877255-emkm5raifci52u17s27jro68srbacj95.apps.googleusercontent.com

npx wrangler secret put GOOGLE_CLIENT_SECRET
# paste: your production secret
```

---

## What to add in Google Console when going to production

Go to console.cloud.google.com → APIs & Services → Credentials →
click your OAuth client → add these entries:

Authorised JavaScript origins — add:
```
https://examenow.ng
https://api.examenow.ng
```

Authorised redirect URIs — add:
```
https://api.examenow.ng/api/auth/callback/google
```

Do NOT remove the localhost entries — keep them so local dev still works.

---

## How it connects to your backend

Your src/lib/auth.ts already reads these from env:

```typescript
socialProviders: {
  google: {
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
  },
},
```

No other configuration needed. Better Auth handles the full OAuth flow automatically.

---

## Full OAuth flow (what happens when user clicks "Continue with Google")

```
User clicks "Continue with Google" on frontend
        ↓
Frontend redirects to:
http://localhost:8787/api/auth/sign-in/social?provider=google&callbackURL=http://localhost:5173/auth/callback
        ↓
Better Auth redirects user to Google login page
        ↓
User signs in with their Google account
        ↓
Google redirects back to:
http://localhost:8787/api/auth/callback/google
        ↓
Better Auth exchanges the code for tokens
        ↓
Better Auth creates or links the user in your DB
        ↓
User is redirected to:
http://localhost:5173/auth/callback
        ↓
Frontend /auth/callback page checks /api/users/me
        ↓
targetExam is null   → redirect to /register (complete onboarding)
targetExam exists    → redirect to /dashboard
```

---

## SvelteKit Callback Page

### Create `src/routes/auth/callback/+page.svelte`

This page handles the redirect after Google signs the user in.
It checks the user state and sends them to the right place.

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  let message = 'Signing you in...';

  onMount(async () => {
    try {
      const res = await fetch('http://localhost:8787/api/users/me', {
        credentials: 'include',
      });

      if (!res.ok) {
        // Session not found — send back to login
        goto('/login');
        return;
      }

      const { data: user } = await res.json();

      if (user.emailVerified !== 'true') {
        // Should not happen for Google users but handle it anyway
        goto('/verify-email');
        return;
      }

      if (!user.targetExam) {
        // New Google user — needs to complete onboarding
        goto('/register');
        return;
      }

      // Fully onboarded — go to dashboard
      goto('/dashboard');

    } catch (err) {
      message = 'Something went wrong. Redirecting to login...';
      setTimeout(() => goto('/login'), 2000);
    }
  });
</script>

<div style="display:flex; justify-content:center; align-items:center; height:100vh;">
  <p>{message}</p>
</div>
```

---

### Create `src/routes/auth/callback/+page.ts`

This disables SSR for this page since it runs client-side only:

```typescript
export const ssr = false;
```

---

### Update your folder structure

Add this to the routes you already have:

```
src/routes/
│
├── (auth)/
│   ├── login/
│   ├── register/
│   └── forgot-password/
│
├── auth/
│   └── callback/
│       ├── +page.svelte    ← handles Google redirect
│       └── +page.ts        ← disables SSR
│
├── (app)/
│   └── dashboard/
│
└── verify-email/
```

> Note: `auth/callback/` is OUTSIDE the `(auth)` group intentionally.
> It should not be redirected away by the `(auth)/+layout.ts` guard
> since the user is mid-login when they land here.
