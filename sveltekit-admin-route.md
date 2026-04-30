# SvelteKit Admin Route Architecture

## Put `admin` inside `(app)` ✅

Given a **speed-first** priority, nesting `admin` inside the existing `(app)` route group is the right call.

---

## Performance Reasons

- One shared layout load = fewer layout re-evaluations when navigating
- `(app)/+layout.svelte` auth check runs **once** for both app and admin users — no duplicate guard logic
- Shared layout means shared data fetching (user session, etc.) is cached across all child routes

---

## Recommended Structure

```
routes/
  (app)/
    +layout.svelte      ← single auth guard for everything
    (app-routes)/
    admin/
      +layout.svelte    ← admin-specific role check only
      +page.svelte
      users/
      settings/
```

---

## The Key Insight: Layer Guards, Don't Duplicate Them

| Layout | Responsibility |
|---|---|
| `(app)/+layout.svelte` | Checks **"is user logged in?"** |
| `admin/+layout.svelte` | Checks **"is user an admin role?"** |

The auth session is **fetched once** and passed down via `$page.data`, not re-fetched per route group.

---

## Only Make `admin` Its Own Route Group If:

- Admin has a **completely different layout/shell** (different nav, sidebar, etc.) that shares zero UI with `(app)`
- You want **separate bundle splitting** for admin *(valid, but SvelteKit handles this via dynamic imports anyway)*

---

## Bottom Line

For speed: **`(app)/admin/`** wins.

> One auth lifecycle → shared layout data → less redundant server work.
> Add a thin role-check layout inside `admin/` for the permission layer.
