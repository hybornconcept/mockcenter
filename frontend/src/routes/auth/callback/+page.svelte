<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { dev } from '$app/environment';

  let message = $state('Signing you in...');
  let isError = $state(false);

  onMount(async () => {
    try {
      // In dev, use the Vite proxy (/api/*) so cookies are forwarded correctly.
      // In production, `/api` is on the same origin.
      const res = await fetch('/api/users/me', {
        credentials: 'include',
      });

      if (!res.ok) {
        // No session — OAuth may have failed or session cookie wasn't set
        message = 'Sign-in failed. Please try again.';
        isError = true;
        setTimeout(() => goto('/login'), 2500);
        return;
      }

      const { data: user } = await res.json();

      // Google users are always email-verified, but check anyway
      if (user?.emailVerified !== 'true') {
        goto(`/verify-email?email=${encodeURIComponent(user?.email ?? '')}`);
        return;
      }

      if (!user?.targetExam) {
        // First-time Google user — must complete onboarding
        goto('/register');
        return;
      }

      // Fully set up — go straight to dashboard
      goto('/dashboard');

    } catch (err) {
      console.error('[Auth Callback] Error:', err);
      message = 'Something went wrong. Redirecting to login...';
      isError = true;
      setTimeout(() => goto('/login'), 2500);
    }
  });
</script>

<div class="min-h-screen bg-[#f5f5f5] flex items-center justify-center font-sans">
  <div class="text-center space-y-4">
    {#if !isError}
      <!-- Spinner -->
      <div class="w-12 h-12 mx-auto rounded-full border-4 border-brand/20 border-t-brand animate-spin"></div>
      <p class="text-slate-600 font-medium text-sm">{message}</p>
    {:else}
      <!-- Error state -->
      <div class="w-12 h-12 mx-auto rounded-full bg-red-100 flex items-center justify-center text-red-500 text-2xl">✕</div>
      <p class="text-red-500 font-medium text-sm">{message}</p>
    {/if}
  </div>
</div>
