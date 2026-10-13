/**
 * The single description of everything an owner can edit, page by page.
 *
 * - The public site reads each page's values with `resolvePage` (saved values over these defaults).
 * - The admin draws its forms from the same definitions, so a field added here appears in both.
 *
 * Saved content lives in `site_content` rows named `cms_<page>` as { [section]: { [field]: value } }.
 * Wherever text says {name}, {shortName}, {city}, {country}, {email} or {phone}, the site fills in
 * the owner's details automatically (see `fill`).
 */

export type PageKey = 'global' | 'exhibitions' | 'publications' | 'about' | 'contact';

type Base = { key: string; label: string; help?: string };
export type Field =
  | (Base & { type: 'text' | 'textarea' | 'url' | 'email' | 'color'; default: string; placeholder?: string })
  | (Base & { type: 'number'; default: number })
  | (Base & { type: 'toggle'; default: boolean })
  | (Base & { type: 'select'; default: string; options: { value: string; label: string }[] })
  | (Base & { type: 'image'; default: { src: string; alt: string }; maxEdge?: number })
  | (Base & { type: 'strings'; default: string[]; itemLabel: string; multiline?: boolean })
  | (Base & { type: 'list'; default: Record<string, unknown>[]; itemLabel: string; titleKey: string; fields: Field[] })
  | (Base & { type: 'project'; default: string });

export type Section = { key: string; title: string; help?: string; fields: Field[] };
export type PageDef = { key: PageKey; title: string; blurb: string; path: string; sections: Section[] };
/** Values for one page. Loosely typed on purpose: the field definitions above are the source of truth. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PageValues = Record<string, Record<string, any>>;

const TIMEZONES = [
  'Africa/Accra', 'Africa/Lagos', 'Africa/Nairobi', 'Africa/Johannesburg', 'Africa/Cairo', 'Europe/London', 'Europe/Paris',
  'Europe/Berlin', 'Europe/Madrid', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'America/Toronto', 'America/Sao_Paulo', 'Asia/Dubai', 'Asia/Kolkata', 'Asia/Singapore', 'Asia/Tokyo', 'Australia/Sydney',
].map((z) => ({ value: z, label: z.replace('_', ' ') }));

const CATEGORY_OPTIONS = [
  { value: 'portraits', label: 'Portraits' },
  { value: 'editorial', label: 'Editorial' },
  { value: 'events', label: 'Events' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'landscapes', label: 'Landscapes' },
];
export { CATEGORY_OPTIONS };

export const PAGES: PageDef[] = [
  // ---------------------------------------------------------------- site-wide
  {
    key: 'global',
    title: 'Site-wide',
    blurb: 'Things that appear on every page: your name, where you are based, contact details and the footer.',
    path: '/',
    sections: [
      {
        key: 'brand',
        title: 'Name',
        fields: [
          { type: 'text', key: 'name', label: 'Your name', help: 'Shown in capitals in the middle of the header.', default: 'Alex Morrow' },
          { type: 'text', key: 'shortName', label: 'First name', default: 'Alex' },
        ],
      },
      {
        key: 'contact',
        title: 'Where you are & how to reach you',
        fields: [
          { type: 'text', key: 'city', label: 'City A', help: 'Also used for the live clock on the Contact page.', default: 'Accra' },
          { type: 'text', key: 'country', label: 'Country of city A', default: 'Ghana' },
          { type: 'text', key: 'city2', label: 'City B (optional)', help: 'Leave empty if you live in one place.', default: '' },
          { type: 'select', key: 'timezone', label: 'Time zone of city A', options: TIMEZONES, default: 'Africa/Accra' },
          { type: 'email', key: 'email', label: 'Studio email', help: 'Shown on the Contact page. Messages from the contact form are also delivered here.', default: 'hello@example.com' },
          { type: 'email', key: 'printsEmail', label: 'Prints email (optional)', help: 'Shown on the Contact page. Leave empty to hide it.', default: '' },
        ],
      },
      {
        key: 'social',
        title: 'Social links',
        help: 'Shown on the About page.',
        fields: [
          {
            type: 'list', key: 'accounts', label: 'Links', itemLabel: 'link', titleKey: 'label',
            fields: [
              { type: 'text', key: 'label', label: 'Name', placeholder: 'Instagram', default: '' },
              { type: 'url', key: 'url', label: 'Web address', placeholder: 'https://instagram.com/yourname', default: '' },
            ],
            default: [],
          },
        ],
      },
      {
        key: 'seo',
        title: 'Search engines & sharing',
        help: 'How the site appears in Google and when a link is shared.',
        fields: [
          { type: 'url', key: 'siteUrl', label: 'Your website address', help: 'For example https://yourname.com (no slash at the end).', placeholder: 'https://yourname.com', default: '' },
          { type: 'textarea', key: 'description', label: 'One-sentence description of you', help: 'Shown under your name in Google. Leave empty and one is written for you.', default: '' },
        ],
      },
      {
        key: 'notfound',
        title: 'Page-not-found message',
        fields: [{ type: 'text', key: 'line', label: 'Message', default: "This page doesn't exist." }],
      },
    ],
  },

  // -------------------------------------------------------------- exhibitions
  {
    key: 'exhibitions',
    title: 'Exhibitions',
    blurb: 'Shows you have been part of. They are grouped by year, newest first.',
    path: '/exhibitions',
    sections: [
      {
        key: 'list',
        title: 'Exhibitions',
        fields: [
          {
            type: 'list', key: 'items', label: 'Exhibitions', itemLabel: 'exhibition', titleKey: 'title',
            fields: [
              { type: 'text', key: 'title', label: 'Title', default: '' },
              { type: 'text', key: 'year', label: 'Year', placeholder: '2025', default: '' },
              { type: 'text', key: 'venue', label: 'Venue', default: '' },
              { type: 'text', key: 'city', label: 'City', default: '' },
              { type: 'text', key: 'country', label: 'Country', default: '' },
              { type: 'select', key: 'type', label: 'Type', options: [{ value: 'solo', label: 'Solo exhibition' }, { value: 'group', label: 'Group exhibition' }], default: 'solo' },
              { type: 'project', key: 'series', label: 'Linked series (optional)', default: '' },
              { type: 'image', key: 'image1', maxEdge: 1200, label: 'Photo of the show (optional)', help: 'An installation view or a poster.', default: { src: '', alt: '' } },
              { type: 'image', key: 'image2', maxEdge: 1200, label: 'Second photo (optional)', default: { src: '', alt: '' } },
            ],
            default: [
              { title: 'Quiet Hours', year: '2026', venue: 'Placeholder Gallery', city: 'Accra', country: 'Ghana', type: 'solo', series: 'quiet-hours' },
              { title: 'Harbour Lights', year: '2025', venue: 'Placeholder Museum', city: 'Tema', country: 'Ghana', type: 'group', series: 'harbour-lights' },
              { title: 'Open Air', year: '2025', venue: 'Placeholder Space', city: 'Lagos', country: 'Nigeria', type: 'group', series: '' },
              { title: 'Material World', year: '2024', venue: 'Placeholder Hall', city: 'Kumasi', country: 'Ghana', type: 'solo', series: 'material-world' },
            ],
          },
        ],
      },
    ],
  },

  // ------------------------------------------------------------- publications
  {
    key: 'publications',
    title: 'Publications',
    blurb: 'Books, magazines and zines your work has appeared in. Grouped by year, newest first.',
    path: '/publications',
    sections: [
      {
        key: 'list',
        title: 'Publications',
        fields: [
          {
            type: 'list', key: 'items', label: 'Publications', itemLabel: 'publication', titleKey: 'title',
            fields: [
              { type: 'text', key: 'title', label: 'Title', default: '' },
              { type: 'text', key: 'year', label: 'Year', placeholder: '2025', default: '' },
              { type: 'text', key: 'publisher', label: 'Publisher', default: '' },
              { type: 'text', key: 'date', label: 'Date', placeholder: 'November 2025', default: '' },
              { type: 'url', key: 'link', label: 'Link (optional)', default: '' },
              { type: 'image', key: 'cover', maxEdge: 600, label: 'Cover (optional)', default: { src: '', alt: '' } },
            ],
            default: [{ title: 'Harbour Lights', year: '2025', publisher: 'Placeholder Magazine', date: 'November 2025', link: '', cover: { src: '', alt: '' } }],
          },
        ],
      },
    ],
  },

  // -------------------------------------------------------------------- about
  {
    key: 'about',
    title: 'About',
    blurb: 'Your portrait, biography and the lists shown beside it. Empty lists are hidden.',
    path: '/about',
    sections: [
      {
        key: 'portrait',
        title: 'Portrait',
        fields: [
          { type: 'image', key: 'image', maxEdge: 1200, label: 'Portrait of you', help: 'Uploaded here only; nothing is taken from your portfolio. Leave empty for no portrait.', default: { src: '', alt: '' } },
        ],
      },
      {
        key: 'biography',
        title: 'Biography',
        fields: [
          {
            type: 'strings', key: 'paragraphs', label: 'Paragraphs', itemLabel: 'paragraph', multiline: true,
            help: 'The first sentence of the first paragraph is set large. Use {shortName}, {city}, {country} to fill in your details.',
            default: [
              'I photograph people and places as they really are: the light, the pause, the half-second nobody else noticed.',
              '{shortName} lives between {city} and elsewhere, and works wherever the story is. Placeholder text: replace it in the admin.',
            ],
          },
        ],
      },
      {
        key: 'lists',
        title: 'Lists',
        help: 'One item per line. Add a link as "Name | https://…". Leave a list empty to hide it.',
        fields: [
          { type: 'strings', key: 'awards', label: 'Awards', itemLabel: 'award', default: [] },
          { type: 'strings', key: 'press', label: 'Selected press', itemLabel: 'item', default: [] },
          { type: 'strings', key: 'talks', label: 'Talks', itemLabel: 'talk', default: [] },
          { type: 'strings', key: 'clients', label: 'Selected clients', itemLabel: 'client', default: [] },
          { type: 'strings', key: 'residencies', label: 'Residencies', itemLabel: 'residency', default: [] },
          { type: 'strings', key: 'collections', label: 'Collections', itemLabel: 'collection', default: [] },
        ],
      },
      {
        key: 'cv',
        title: 'CV',
        fields: [{ type: 'url', key: 'url', label: 'Link to your CV (PDF, optional)', default: '' }],
      },
    ],
  },

  // ------------------------------------------------------------------ contact
  {
    key: 'contact',
    title: 'Contact',
    blurb: 'The sentence at the top, and the optional enquiry form.',
    path: '/contact',
    sections: [
      {
        key: 'page',
        title: 'Opening line',
        fields: [
          { type: 'text', key: 'line', label: 'Sentence', help: '{city} and {city2} are filled in from Site-wide.', default: 'Living between {city} & {city2}. Working worldwide.' },
        ],
      },
      {
        key: 'form',
        title: 'Enquiry form',
        fields: [
          { type: 'toggle', key: 'show', label: 'Show the form', default: true },
          { type: 'strings', key: 'subjects', label: 'Subject choices', itemLabel: 'choice', default: ['Commission', 'Prints', 'Press', 'Other'] },
          { type: 'text', key: 'success', label: 'Message after sending', default: "Thank you, I'll reply soon." },
        ],
      },
    ],
  },
];

export const PAGE_BY_KEY = Object.fromEntries(PAGES.map((p) => [p.key, p])) as Record<PageKey, PageDef>;
export const rowName = (key: PageKey) => `cms_${key}`;

// ----------------------------------------------------------------- resolving

/** A fresh, independent copy of a field's default value. */
export const cloneDefault = <T>(v: T): T => JSON.parse(JSON.stringify(v));

/** A new, empty item for a list field (every sub-field at its default). */
export const newItem = (fields: Field[]): Record<string, unknown> =>
  Object.fromEntries(fields.map((f) => [f.key, cloneDefault(f.default)]));

/** Use the saved value if it has the right shape, otherwise the default. Never throws on bad data. */
export function resolveField(f: Field, saved: unknown): unknown {
  switch (f.type) {
    case 'toggle':
      return typeof saved === 'boolean' ? saved : f.default;
    case 'number':
      return typeof saved === 'number' && Number.isFinite(saved) ? saved : f.default;
    case 'image': {
      const s = saved as { src?: unknown; alt?: unknown } | undefined;
      return s && typeof s.src === 'string' ? { src: s.src, alt: typeof s.alt === 'string' ? s.alt : '' } : cloneDefault(f.default);
    }
    case 'strings':
      return Array.isArray(saved) && saved.every((x) => typeof x === 'string') ? saved : cloneDefault(f.default);
    case 'list':
      return Array.isArray(saved)
        ? saved.map((item) => resolveFields(f.fields, item))
        : cloneDefault(f.default).map((item) => resolveFields(f.fields, item));
    default:
      return typeof saved === 'string' ? saved : f.default;
  }
}

const resolveFields = (fields: Field[], saved: unknown) => {
  const s = (saved && typeof saved === 'object' ? saved : {}) as Record<string, unknown>;
  return Object.fromEntries(fields.map((f) => [f.key, resolveField(f, s[f.key])]));
};

/** Saved content for one page, over the defaults. Unknown or malformed data is ignored. */
export function resolvePage(page: PageDef, saved: unknown): PageValues {
  const s = (saved && typeof saved === 'object' ? saved : {}) as Record<string, unknown>;
  return Object.fromEntries(page.sections.map((sec) => [sec.key, resolveFields(sec.fields, s[sec.key])]));
}

export type Vars = { name: string; shortName: string; city: string; city2: string; country: string; email: string };

/** Replace {name}, {shortName}, {city}, {city2}, {country}, {email} in owner-written text. */
export const fill = (text: string, v: Vars) => text.replace(/\{(name|shortName|city|city2|country|email)\}/g, (_, k: keyof Vars) => v[k]);
