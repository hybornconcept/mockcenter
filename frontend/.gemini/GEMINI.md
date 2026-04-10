Put everything below into a **single Antigravity workspace rule file** called `GEMINI.md`, inside a `.gemini` folder at the **root of your SvelteKit project** (path: `your-project/.gemini/GEMINI.md`). [atamel](https://atamel.dev/posts/2025/11-25_customize_antigravity_rules_workflows/)

Antigravity will auto-apply it as **workspace rules** for that project. [antigravity](https://antigravity.codes/blog/user-rules)

***

```md
# Antigravity Workspace Rules – shadcn-svelte + Svelte 5 + SvelteKit (Antigravity Mode)

You are an antigravity frontend specialist.
Stack: shadcn-svelte (Bits UI), Svelte 5 runes, SvelteKit 2, Tailwind.
Goals: code brevity, performance, clarity. Avoid boilerplate and over-engineering.

## 1. General style

- Always prefer **short, direct** solutions.
- Max 50–70 lines per component unless explicitly asked for more.
- No comments unless user asks.
- No unused imports, no dead code, no TODOs.
- Use good naming but keep names short.

## 2. Svelte 5 runes (no legacy syntax)

Use Svelte 5 runes instead of legacy `$:` and `export let`.[web:25][web:21]

Preferred patterns:

- State: `let count = $state(0);`
- Derived: `let doubled = $derived(count * 2);`
- Effects: `$effect(() => { /* side effect */ });`
- Props: `let { item } = $props();`
- Bindable props when needed: `let { value = $bindable() } = $props();`

Rules:

- Do NOT use `export let`.
- Avoid `$:` labels; use `$derived` and `$effect`.
- Prefer simple local state with runes; only use stores if state is truly global.

## 3. SvelteKit structure

Project structure (assume default SvelteKit 2):[web:21][web:22]

- Routes live in `src/routes`.
- Shared UI components in `src/lib/components`.
- shadcn-svelte components in `src/lib/components/ui`.
- Utilities in `src/lib/utils` only if reused 3+ times.

Routing rules:

- Use `+page.svelte` / `+layout.svelte` for UI.
- Use `+page.ts` / `+layout.ts` / `+page.server.ts` for data loading.
- Default to server `load` (SSR) instead of client fetch.

Example pattern:

```ts
// src/routes/example/+page.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const items = await getItems();
  return { items };
};
```

```svelte
<!-- src/routes/example/+page.svelte -->
<script lang="ts">
  let { data } = $props();
</script>

<div class="container mx-auto p-6 space-y-4">
  {#each data.items as item (item.id)}
    <Item {item} />
  {/each}
</div>
```

## 4. Tailwind usage

Use Tailwind for all styling.[web:9][web:12]

- Prefer utility classes in `class=""` directly.
- Keep class lists short and intentional.
- Use common layout patterns:

  - `container mx-auto p-6`
  - `flex items-center justify-between gap-4`
  - `space-y-4` for vertical spacing
  - `grid gap-4` for grids

- No complex custom CSS unless explicitly required.

If project uses Tailwind v4:

- Main CSS imports Tailwind via `@import "tailwindcss";` in `src/app.css` (or equivalent).[web:9]
- Use `@theme` in CSS for design tokens; do not ask to edit old-style config.

## 5. shadcn-svelte rules

Use shadcn-svelte components by default for UI primitives.[web:11][web:25][web:26]

Assume components live under:

- `src/lib/components/ui`
- Import path: `$lib/components/ui/<component>`

Rules:

- Prefer:

  - `Button` for buttons and CTAs
  - `Input`, `Textarea`, `Select`, `Checkbox`, `Switch` for form controls
  - `Card`, `Dialog`, `Sheet`, `Popover`, `DropdownMenu`, `Tabs` for layout/UX
  - `Label`, `Form` components for accessible forms

- Use Tailwind classes via `class` prop to tweak spacing, layout, minor visuals.
- Do NOT re‑implement shadcn primitives from scratch.
- Do NOT add custom wrappers unless there is clear duplication.

Example:

```svelte
<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  let { label = 'Submit' } = $props();
  let loading = $state(false);
</script>

<Button class="w-full" disabled={loading}>
  {loading ? 'Saving...' : label}
</Button>
```

## 6. Forms and actions

Prefer SvelteKit form actions with progressive enhancement.[web:21][web:22]

Defaults:

- Use `<form method="POST" use:enhance>` where appropriate.
- Use shadcn form controls inside the form.
- Show minimal feedback (e.g. disable button, basic message) without over‑engineering.

Example:

```svelte
<script lang="ts">
  import { enhance } from '$app/forms';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';

  let pending = $state(false);
</script>

<form
  method="POST"
  use:enhance={{ pending: (v) => pending = v }}
  class="space-y-4 max-w-sm"
>
  <div class="space-y-1">
    <Label for="email">Email</Label>
    <Input id="email" name="email" type="email" required />
  </div>

  <Button type="submit" class="w-full" disabled={pending}>
    {pending ? 'Submitting...' : 'Submit'}
  </Button>
</form>
```

## 7. Brevity and performance rules

Brevity:

- Prefer one small component per file.
- Avoid deeply nested DOM structure.
- Remove anything not needed to satisfy the user request.
- No generic abstractions unless the user asks for a reusable pattern.

Performance:

- Use SSR where possible; avoid unnecessary client fetch.
- Avoid large third‑party libraries unless explicitly requested.
- Prefer small, composable components over giant pages.

## 8. Example screen pattern

When asked to build a typical page (dashboard, settings, list, etc.), use this baseline shape:

```svelte
<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  let { data } = $props();
</script>

<section class="container mx-auto p-6 space-y-6">
  <header class="flex items-center justify-between">
    <h1 class="text-2xl font-semibold">{data.title}</h1>
    <Button on:click={data.onPrimaryClick}>New</Button>
  </header>

  <div class="space-y-4">
    {#each data.items as item (item.id)}
      <Card class="p-4 flex items-center justify-between">
        <div>
          <h2 class="font-medium">{item.label}</h2>
          {#if item.description}
            <p class="text-sm text-muted-foreground">{item.description}</p>
          {/if}
        </div>
        {#if item.action}
          <Button variant="outline" size="sm" on:click={() => item.action(item)}>
            View
          </Button>
        {/if}
      </Card>
    {/each}
  </div>
</section>
```

This should be adapted and shortened as needed for each task.

## 9. How to respond in this workspace

- Assume this stack: shadcn-svelte, Svelte 5, SvelteKit 2, Tailwind.
- Default to TypeScript for `.ts` files and `lang="ts"` in `<script>` blocks.
- Generate the smallest number of files and the smallest amount of code that fully solves the request.
- When user asks for a new UI or feature, output only:

  - The Svelte components (`+page.svelte`, local components).
  - Any necessary `+page.ts` / `+page.server.ts`.
  - Minimal supportive types/utilities if required.

- Do not generate tests, docs, or comments unless explicitly requested.
```

