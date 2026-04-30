<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { toast } from 'svelte-sonner';

  let message = $state('Signing you in...');
  let isError = $state(false);

  onMount(async () => {
    try {
      const res = await fetch('/api/users/me', {
        credentials: 'include',
      });

      if (!res.ok) {
        isError = true;
        message = 'Sign-in failed. Please try again.';
        toast.error('Sign-in failed', { description: 'Please try again or use email login.' });
        setTimeout(() => goto('/login'), 2500);
        return;
      }

      const { data: user } = await res.json();

      // Admin users go straight to /admin
      if (user?.isAdmin) {
        goto('/admin');
        return;
      }

      // New Google users who haven't completed onboarding
      if (!user?.targetExam) {
        goto('/onboarding');
        return;
      }

      // Fully set up regular user — go to dashboard
      toast.success('Signed in!', { description: 'Welcome back.' });
      goto('/dashboard');

    } catch (err) {
      console.error('[Auth Callback] Error:', err);
      isError = true;
      message = 'Something went wrong. Redirecting to login...';
      toast.error('Authentication error', { description: 'Something went wrong. Please try again.' });
      setTimeout(() => goto('/login'), 2500);
    }
  });
</script>

<div class="min-h-screen bg-[#f5f5f5] flex items-center justify-center font-sans">
  <div class="text-center space-y-4">
    {#if !isError}
      <div class="w-12 h-12 mx-auto rounded-full border-4 border-brand/20 border-t-brand animate-spin"></div>
      <p class="text-slate-600 font-medium text-sm">{message}</p>
    {:else}
      <div class="w-12 h-12 mx-auto rounded-full bg-red-100 flex items-center justify-center text-red-500 text-2xl">✕</div>
      <p class="text-red-500 font-medium text-sm">{message}</p>
    {/if}
  </div>
</div>
