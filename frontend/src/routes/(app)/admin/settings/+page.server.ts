import type { PageServerLoad, Actions } from './$types';
import { adminFetch } from '$lib/server/adminApi';
import { fail } from '@sveltejs/kit';

const SECTIONS = [
  { id: 'general',       label: 'General',          iconType: 'home',           group: 'Platform' },
  { id: 'branding',      label: 'Branding',         iconType: 'palette',        group: 'Platform' },
  { id: 'credits',       label: 'Credits & billing', iconType: 'zap',           group: 'Platform' },
  { id: 'scoring',       label: 'Scoring rules',    iconType: 'target',         group: 'Platform' },
  { id: 'notifications', label: 'Notifications',    iconType: 'bell',           group: 'Platform' },
  { id: 'storage',       label: 'Cloudflare R2',    iconType: 'cloud',          group: 'Integrations' },
  { id: 'database',      label: 'Database',         iconType: 'database',       group: 'Integrations' },
  { id: 'api',           label: 'API & webhooks',   iconType: 'key',            group: 'Integrations' },
  { id: 'email',         label: 'Email & SMS',      iconType: 'mail',           group: 'Integrations' },
  { id: 'appearance',    label: 'Appearance',       iconType: 'monitor',        group: 'Admin prefs' },
  { id: 'admins',        label: 'Admin accounts',   iconType: 'shield',         group: 'Admin prefs' },
  { id: 'danger',        label: 'Danger zone',      iconType: 'alert-triangle', group: 'Admin prefs' },
];

/** Structural defaults — used only when DB has nothing for a key. */
const FIELD_DEFAULTS = {
  branding: {
    primaryColor: '#3B6D11', headerBg: '#ffffff', accentColor: '#639922',
    fontFamily: 'System default (-apple-system)', fontSize: '14px (default)', darkMode: true,
  },
  storage: {
    bucketName: 'question-images',
    publicUrl: 'https://pub-abc123.r2.dev/',
    autoCompress: true, maxSize: 5,
    accountId: '', accessKey: '', secretKey: '',
  },
  database: { maxConnections: 20, timeout: 5000, autoBackup: true },
  api: { keys: [], webhooks: [] },
  email: {
    from: { name: 'MockCenter', email: 'noreply@mockcenter.ng' },
    sms: { provider: 'Termii', senderId: 'MockCenter' },
  },
  appearance: {
    theme: 'light', compactSidebar: false, liveActivity: true,
    confirmDelete: true, shortcuts: true, rowsPerPage: 12,
  },
};

export const load: PageServerLoad = async ({ fetch, platform }) => {
  // Load settings, credit packages, and media count in parallel
  const [settingsResult, packagesResult, dashResult] = await Promise.all([
    adminFetch<Record<string, Record<string, unknown>>>(fetch, '/settings'),
    adminFetch<any[]>(fetch, '/credits/packages'),
    adminFetch<{ kpi: { totalMedia: number } }>(fetch, '/dashboard'),
  ]);

  // Parse ADMIN_EMAILS from environment for the admin accounts section
  const rawAdminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim()).filter(Boolean);
  const adminEmails: string[] = rawAdminEmails.length ? rawAdminEmails : [];

  const mediaCount: number | null = dashResult.ok ? (dashResult.data.kpi?.totalMedia ?? null) : null;

  const dbSettings = settingsResult.ok ? settingsResult.data : {};

  // Map live credit packages to the bundles format used by the UI
  const liveBundles = packagesResult.ok
    ? packagesResult.data.map((pkg: any) => ({
        id: pkg.id,
        label: pkg.name,
        credits: pkg.credits,
        price: `₦${Number(pkg.priceNgn).toLocaleString()}`,
        priceNgn: pkg.priceNgn,
        isActive: pkg.isActive ?? true,
      }))
    : [];

  const settings = {
    general: {
      name: 'MockCenter',
      supportEmail: 'support@mockcenter.ng',
      platformUrl: 'https://mockcenter.ng',
      adminUrl: 'https://mockcenter.ng/admin',
      tagline: 'JAMB · WAEC · NECO — Ace your exams with MockCenter',
      maintenanceMode: false,
      openRegistration: true,
      emailVerification: true,
      trialCredits: true,
      trialAmount: 20,
      ...(dbSettings.general ?? {}),
    },
    scoring: {
      correct: 1, wrong: 0, skipped: 0,
      negativeMarking: false, negativeAmount: 0.25,
      showScoreImmediately: true, showCorrectAnswers: true, showExplanations: true,
      examTypes: [] as string[],
      grades: [
        { label: 'A', min: 75, color: '#3B6D11' },
        { label: 'B', min: 60, color: '#639922' },
        { label: 'C', min: 50, color: '#BA7517' },
        { label: 'D', min: 40, color: '#854F0B' },
        { label: 'F', min: 0,  color: '#A32D2D' },
      ],
      ...(dbSettings.scoring ?? {}),
    },
    credits: {
      // Live bundles from creditPackages table
      bundles: liveBundles,
      // Credit rules from platform_settings (with sensible defaults)
      rules: {
        perQuestion: 1, perMock: 10, referralBonus: 50, dailyBonus: 5,
        ...((dbSettings.credits as any) ?? {}),
      },
      payment: { gateway: 'Paystack', currency: 'NGN (₦)' },
    },
    branding:   { ...FIELD_DEFAULTS.branding,   ...(dbSettings.branding   ?? {}) },
    storage:    { ...FIELD_DEFAULTS.storage,    ...(dbSettings.storage    ?? {}) },
    database:   { ...FIELD_DEFAULTS.database,   ...(dbSettings.database   ?? {}) },
    api:        { ...FIELD_DEFAULTS.api,        ...(dbSettings.api        ?? {}) },
    email:      { ...FIELD_DEFAULTS.email,      ...(dbSettings.email      ?? {}) },
    appearance: { ...FIELD_DEFAULTS.appearance, ...(dbSettings.appearance ?? {}) },
  };

  const kpiTotals = dashResult.ok
    ? { totalUsers: dashResult.data.kpi?.totalUsers ?? 0, totalQuestions: dashResult.data.kpi?.totalQuestions ?? 0 }
    : null;

  return { settings, sections: SECTIONS, adminEmails, mediaCount, kpiTotals };
};

export const actions: Actions = {
  /** Save a single setting key → value. Called per-field or per-section save. */
  saveSetting: async ({ request, fetch }) => {
    const form  = await request.formData();
    const key   = form.get('key')?.toString();
    const value = form.get('value')?.toString();

    if (!key) return fail(400, { error: 'Missing key' });

    // Parse value: try JSON first (handles booleans/numbers/objects), fallback to string
    let parsed: unknown = value;
    try { parsed = JSON.parse(value ?? ''); } catch { /* keep as string */ }

    const result = await adminFetch(fetch, '/settings', {
      method: 'PATCH',
      body: JSON.stringify({ key, value: parsed }),
    });

    if (!result.ok) return fail(500, { error: result.error });
    return { success: true };
  },

  /** Create a new credit package */
  createPackage: async ({ request, fetch }) => {
    const form = await request.formData();
    const name     = form.get('name')?.toString();
    const credits  = Number(form.get('credits'));
    const priceNgn = Number(form.get('priceNgn'));

    if (!name || !credits || !priceNgn)
      return fail(400, { error: 'Name, credits, and price are required' });

    const result = await adminFetch(fetch, '/credits/packages', {
      method: 'POST',
      body: JSON.stringify({ name, credits, priceNgn, isActive: true }),
    });
    if (!result.ok) return fail(500, { error: result.error });
    return { success: true };
  },

  /** Update an existing credit package */
  updatePackage: async ({ request, fetch }) => {
    const form = await request.formData();
    const id       = form.get('id')?.toString();
    const name     = form.get('name')?.toString();
    const credits  = form.get('credits') ? Number(form.get('credits')) : undefined;
    const priceNgn = form.get('priceNgn') ? Number(form.get('priceNgn')) : undefined;

    if (!id) return fail(400, { error: 'Package ID required' });

    const patch: Record<string, unknown> = {};
    if (name)     patch.name     = name;
    if (credits)  patch.credits  = credits;
    if (priceNgn) patch.priceNgn = priceNgn;

    const result = await adminFetch(fetch, `/credits/packages/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
    if (!result.ok) return fail(500, { error: result.error });
    return { success: true };
  },

  /** Delete a credit package */
  deletePackage: async ({ request, fetch }) => {
    const form = await request.formData();
    const id = form.get('id')?.toString();
    if (!id) return fail(400, { error: 'Package ID required' });

    const result = await adminFetch(fetch, `/credits/packages/${id}`, { method: 'DELETE' });
    if (!result.ok) return fail(500, { error: result.error });
    return { success: true };
  },
};
