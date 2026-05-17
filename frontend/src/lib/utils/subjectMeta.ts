/**
 * Shared subject metadata utility.
 * Single source of truth for thumbnail images, colour themes, and subject categories.
 * Used by: start_practice/+page.server.ts, configure/+page.server.ts
 *
 * All keys use the canonical subject name as returned by the database.
 */

// ── Thumbnail filenames (files must exist in /static) ────────────────────────
export const THUMBNAIL_MAP: Record<string, string> = {
	Biology:                       '/BIOLOGY.png',
	Chemistry:                     '/CHEMISTRY.png',
	Physics:                       '/PHYSICS.png',
	Mathematics:                   '/MATHS.png',
	'Further Mathematics':         '/MATHS.png',
	'English Language':            '/ENGLISH.png',
	'Use of English':              '/use.png',
	Economics:                     '/ECONOMICS.png',
	Geography:                     '/GEOGRAPHY.png',
	Agriculture:                   '/AGRICULTURE.png',
	Commerce:                      '/COMMERCE.png',
	Government:                    '/GOVERNMENT.png',
	CRS:                           '/CRK.png',
	'Christian Religious Studies': '/CRK.png',
	IRS:                           '/CRK.png',
	'Islamic Religious Studies':   '/CRK.png',
	'Literature in English':       '/LITERATURE.png',
	Literature:                    '/LITERATURE.png',
	Accounting:                    '/COMMERCE.png',
	'Financial Accounting':        '/COMMERCE.png',
	History:                       '/GOVERNMENT.png',
};

// ── Tailwind colour theme per subject ────────────────────────────────────────
export interface SubjectColors {
	gradient: string;
	progress: string;
	badge: string;
	text: string;
	button: string;
}

export const SUBJECT_COLORS: Record<string, SubjectColors> = {
	'English Language':  { gradient: 'from-orange-100 to-amber-50',  progress: 'bg-orange-500',  badge: 'bg-orange-50 text-orange-700 border-orange-200',   text: 'text-orange-600',  button: 'bg-orange-600 hover:bg-orange-700 text-white'  },
	'Use of English':    { gradient: 'from-orange-100 to-amber-50',  progress: 'bg-orange-500',  badge: 'bg-orange-50 text-orange-700 border-orange-200',   text: 'text-orange-600',  button: 'bg-orange-600 hover:bg-orange-700 text-white'  },
	Mathematics:         { gradient: 'from-sky-100 to-blue-50',      progress: 'bg-sky-500',     badge: 'bg-sky-50 text-sky-700 border-sky-200',            text: 'text-sky-600',     button: 'bg-sky-600 hover:bg-sky-700 text-white'        },
	'Further Mathematics':{ gradient: 'from-sky-100 to-blue-50',    progress: 'bg-sky-500',     badge: 'bg-sky-50 text-sky-700 border-sky-200',            text: 'text-sky-600',     button: 'bg-sky-600 hover:bg-sky-700 text-white'        },
	Biology:             { gradient: 'from-emerald-100 to-green-50', progress: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: 'text-emerald-600', button: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
	Chemistry:           { gradient: 'from-blue-100 to-cyan-50',     progress: 'bg-blue-600',    badge: 'bg-blue-50 text-blue-700 border-blue-200',         text: 'text-blue-600',    button: 'bg-blue-600 hover:bg-blue-700 text-white'      },
	Physics:             { gradient: 'from-purple-100 to-indigo-50', progress: 'bg-violet-600',  badge: 'bg-violet-50 text-violet-700 border-violet-200',    text: 'text-violet-600',  button: 'bg-violet-600 hover:bg-violet-700 text-white'  },
	Economics:           { gradient: 'from-rose-100 to-pink-50',     progress: 'bg-rose-500',    badge: 'bg-rose-50 text-rose-700 border-rose-200',          text: 'text-rose-600',    button: 'bg-rose-600 hover:bg-rose-700 text-white'      },
	Geography:           { gradient: 'from-teal-100 to-emerald-50',  progress: 'bg-teal-500',    badge: 'bg-teal-50 text-teal-700 border-teal-200',          text: 'text-teal-600',    button: 'bg-teal-600 hover:bg-teal-700 text-white'      },
	Commerce:            { gradient: 'from-cyan-100 to-sky-50',      progress: 'bg-cyan-500',    badge: 'bg-cyan-50 text-cyan-700 border-cyan-200',          text: 'text-cyan-600',    button: 'bg-cyan-600 hover:bg-cyan-700 text-white'      },
	Agriculture:         { gradient: 'from-lime-100 to-green-50',    progress: 'bg-lime-600',    badge: 'bg-lime-50 text-lime-700 border-lime-200',          text: 'text-lime-700',    button: 'bg-lime-600 hover:bg-lime-700 text-white'      },
	Government:          { gradient: 'from-indigo-100 to-blue-50',   progress: 'bg-indigo-500',  badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',    text: 'text-indigo-600',  button: 'bg-indigo-600 hover:bg-indigo-700 text-white'  },
	History:             { gradient: 'from-amber-100 to-yellow-50',  progress: 'bg-amber-600',   badge: 'bg-amber-50 text-amber-700 border-amber-200',       text: 'text-amber-700',   button: 'bg-amber-600 hover:bg-amber-700 text-white'    },
	Accounting:          { gradient: 'from-cyan-100 to-sky-50',      progress: 'bg-cyan-500',    badge: 'bg-cyan-50 text-cyan-700 border-cyan-200',          text: 'text-cyan-600',    button: 'bg-cyan-600 hover:bg-cyan-700 text-white'      },
	'Financial Accounting': { gradient: 'from-cyan-100 to-sky-50',  progress: 'bg-cyan-500',    badge: 'bg-cyan-50 text-cyan-700 border-cyan-200',          text: 'text-cyan-600',    button: 'bg-cyan-600 hover:bg-cyan-700 text-white'      },
	Literature:          { gradient: 'from-fuchsia-100 to-pink-50',  progress: 'bg-fuchsia-500', badge: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200', text: 'text-fuchsia-600', button: 'bg-fuchsia-600 hover:bg-fuchsia-700 text-white' },
	'Literature in English': { gradient: 'from-fuchsia-100 to-pink-50', progress: 'bg-fuchsia-500', badge: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200', text: 'text-fuchsia-600', button: 'bg-fuchsia-600 hover:bg-fuchsia-700 text-white' },
	CRS:                 { gradient: 'from-amber-100 to-yellow-50',  progress: 'bg-amber-500',   badge: 'bg-amber-50 text-amber-700 border-amber-200',       text: 'text-amber-700',   button: 'bg-amber-600 hover:bg-amber-700 text-white'    },
	'Christian Religious Studies': { gradient: 'from-amber-100 to-yellow-50', progress: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700 border-amber-200', text: 'text-amber-700', button: 'bg-amber-600 hover:bg-amber-700 text-white' },
	IRS:                 { gradient: 'from-amber-100 to-yellow-50',  progress: 'bg-amber-500',   badge: 'bg-amber-50 text-amber-700 border-amber-200',       text: 'text-amber-700',   button: 'bg-amber-600 hover:bg-amber-700 text-white'    },
	'Islamic Religious Studies': { gradient: 'from-amber-100 to-yellow-50', progress: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700 border-amber-200', text: 'text-amber-700', button: 'bg-amber-600 hover:bg-amber-700 text-white' },
};

export const DEFAULT_COLORS: SubjectColors = {
	gradient: 'from-slate-100 to-gray-50',
	progress:  'bg-brand',
	badge:     'bg-brand/10 text-brand border-brand/20',
	text:      'text-brand',
	button:    'bg-brand hover:bg-[#2c520d] text-white',
};

// ── Subject → broad category (used for grouping cards on start_practice) ─────
export const CATEGORY_MAP: Record<string, string> = {
	Biology:                       'Sciences',
	Chemistry:                     'Sciences',
	Physics:                       'Sciences',
	Mathematics:                   'Sciences',
	'Further Mathematics':         'Sciences',
	Economics:                     'Commercial',
	Commerce:                      'Commercial',
	Accounting:                    'Commercial',
	'Financial Accounting':        'Commercial',
	Geography:                     'Arts',
	Government:                    'Arts',
	History:                       'Arts',
	Literature:                    'Arts',
	'Literature in English':       'Arts',
	CRS:                           'Arts',
	'Christian Religious Studies': 'Arts',
	IRS:                           'Arts',
	'Islamic Religious Studies':   'Arts',
	Agriculture:                   'Sciences',
	'English Language':            'General',
	'Use of English':              'General',
};

// ── Convenience resolver ──────────────────────────────────────────────────────
export function resolveSubjectMeta(name: string): {
	thumbnail: string | null;
	category: string;
	colors: SubjectColors;
} {
	return {
		thumbnail: THUMBNAIL_MAP[name] ?? null,
		category:  CATEGORY_MAP[name]  ?? 'General',
		colors:    SUBJECT_COLORS[name] ?? DEFAULT_COLORS,
	};
}
