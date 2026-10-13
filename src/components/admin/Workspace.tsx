'use client';

import type { SupabaseClient } from '@supabase/supabase-js';
import { useCallback, useEffect, useRef, useState } from 'react';
import { PAGE_BY_KEY, type PageKey } from '@/content/cms';
import { EnquiriesPanel } from './EnquiriesPanel';
import { PageEditor } from './PageEditor';
import { ProjectsPanel } from './ProjectsPanel';
import { StoragePanel } from './StoragePanel';

type View = PageKey | 'projects' | 'enquiries' | 'storage';

const GROUPS: { title: string; items: { view: View; label: string }[] }[] = [
  {
    title: 'Pages',
    items: [
      { view: 'exhibitions', label: 'Exhibitions' },
      { view: 'publications', label: 'Publications' },
      { view: 'about', label: 'About' },
      { view: 'contact', label: 'Contact' },
    ],
  },
  {
    title: 'Whole site',
    items: [
      { view: 'global', label: 'Name, places & emails' },
    ],
  },
  {
    title: 'Manage',
    items: [
      { view: 'projects', label: 'Series & photos' },
      { view: 'enquiries', label: 'Messages' },
      { view: 'storage', label: 'Storage space' },
    ],
  },
];

const TITLES: Record<string, { title: string; blurb: string }> = {
  projects: { title: 'Series & photos', blurb: 'Each series is one walk-through gallery. Set its title, place, date and statement, upload its photos, and tick "Show on the home page" for the series whose cover should appear in the home slideshow.' },
  storage: { title: 'Storage space', blurb: 'How much of your free storage your photos use, and tools to keep it small.' },
  enquiries: { title: 'Messages', blurb: 'A heads-up each time someone writes to you through the Contact page.' },
};

/** Signed-in admin: a sidebar with one entry per page, and the editor for whichever is chosen. */
export function Workspace({ db, userId }: { db: SupabaseClient; userId: string }) {
  const [view, setView] = useState<View>('projects');
  const [projects, setProjects] = useState<{ slug: string; title: string }[]>([]);
  const [unread, setUnread] = useState(0);
  const dirty = useRef(false);
  const onDirty = useCallback((d: boolean) => void (dirty.current = d), []);

  // How many messages have not been marked as seen: shown as a badge and a banner.
  const loadUnread = useCallback(async () => {
    const { count } = await db.from('enquiries').select('id', { count: 'exact', head: true }).eq('handled', false);
    setUnread(count ?? 0);
  }, [db]);
  useEffect(() => {
    loadUnread();
    const t = window.setInterval(loadUnread, 60_000);
    return () => clearInterval(t);
  }, [loadUnread, view]);

  // Project list for "link to a project" choices; refreshed whenever you move around.
  useEffect(() => {
    db.from('galleries')
      .select('slug, name')
      .not('slug', 'is', null)
      .order('sort_order')
      .then(({ data }) => setProjects((data ?? []).map((p: { slug: string; name: string }) => ({ slug: p.slug, title: p.name }))));
  }, [db, view]);

  const go = (v: View) => {
    if (v === view) return;
    if (dirty.current && !confirm('You have changes that are not saved. Leave this page without saving?')) return;
    dirty.current = false;
    setView(v);
  };

  const page = view in PAGE_BY_KEY ? PAGE_BY_KEY[view as PageKey] : null;
  const head = page ? { title: page.title === 'Site-wide' ? 'Name, places & emails' : page.title, blurb: page.blurb } : TITLES[view];

  return (
    <div className="mt-8 grid gap-8 md:grid-cols-[230px_1fr]">
      <nav aria-label="Admin sections" className="md:sticky md:top-4 md:self-start">
        <div className="flex gap-6 overflow-x-auto pb-2 md:block md:space-y-6 md:overflow-visible">
          {GROUPS.map((g) => (
            <div key={g.title} className="shrink-0">
              <p className="mb-2 hidden text-[12px] tracking-wide text-muted uppercase md:block">{g.title}</p>
              <ul className="flex gap-1 md:block md:space-y-1">
                {g.items.map((it) => (
                  <li key={it.view}>
                    <button
                      type="button"
                      aria-current={view === it.view ? 'page' : undefined}
                      onClick={() => go(it.view)}
                      className={`min-h-11 w-full rounded-(--radius-card) px-3 text-left text-[16px] whitespace-nowrap ${view === it.view ? 'bg-text text-bg' : 'text-text hover:bg-surface'}`}
                    >
                      {it.label}
                      {it.view === 'enquiries' && unread > 0 && (
                        <span className="ml-2 inline-block min-w-5 bg-accent px-1.5 text-center text-[12px] text-on-accent">{unread}</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </nav>

      <section className="min-w-0">
        <h2 className="text-[28px] leading-tight text-text">{head.title}</h2>
        <p className="mt-1 mb-6 max-w-2xl text-[15px] text-muted">{head.blurb}</p>
        {unread > 0 && view !== 'enquiries' && (
          <div role="status" className="brut-card mb-6 flex flex-wrap items-center justify-between gap-3 p-4">
            <p className="text-[16px] text-text">
              You have {unread} new {unread === 1 ? 'message' : 'messages'} from your contact page.
            </p>
            <button type="button" onClick={() => go('enquiries')} className="brut-btn">
              See who wrote →
            </button>
          </div>
        )}
        {page && <PageEditor key={page.key} db={db} page={page} projects={projects} onDirty={onDirty} />}
        {view === 'projects' && <ProjectsPanel db={db} userId={userId} />}
        {view === 'storage' && <StoragePanel db={db} />}
        {view === 'enquiries' && <EnquiriesPanel db={db} onChange={loadUnread} />}
      </section>
    </div>
  );
}
