'use client';

import type { SupabaseClient } from '@supabase/supabase-js';
import { useCallback, useEffect, useState } from 'react';
import { btn, btnDanger } from './adminUi';

type Enquiry = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  need: string | null;
  budget: string | null;
  wanted_date: string | null;
  message: string | null;
  handled: boolean;
};

/**
 * A notification list, not an inbox: each message is emailed to the owner, so this only shows who
 * wrote in and when. Details are tucked away behind "Show details" in case the email never arrives.
 */
export function EnquiriesPanel({ db, onChange }: { db: SupabaseClient; onChange: () => void }) {
  const [rows, setRows] = useState<Enquiry[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const { data, error } = await db.from('enquiries').select('*').order('created_at', { ascending: false });
    if (error) setError(error.message);
    else setRows(data as Enquiry[]);
    onChange();
  }, [db, onChange]);
  useEffect(() => {
    load();
  }, [load]);

  const seen = async (e: Enquiry) => {
    await db.from('enquiries').update({ handled: !e.handled }).eq('id', e.id);
    load();
  };
  const remove = async (e: Enquiry) => {
    if (!confirm(`Remove the notification from ${e.name}? The email you received is not affected.`)) return;
    await db.from('enquiries').delete().eq('id', e.id);
    load();
  };

  return (
    <div className="space-y-4">
      <p className="max-w-2xl rounded-(--radius-card) bg-surface p-4 text-[15px] text-muted">
        Every message is also sent to your email, where you can read and reply. This list simply lets you know when someone has written in.
      </p>
      {error && <p className="text-negative">{error}</p>}
      {!error && rows.length === 0 && <p className="text-[15px] text-muted">No messages yet.</p>}
      {rows.map((e) => (
        <article key={e.id} className={`brut-card p-5 ${e.handled ? 'opacity-60' : ''}`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-[20px] text-text">
              {!e.handled && <span className="mr-3 inline-block bg-accent px-2 py-0.5 align-middle font-mono text-[11px] tracking-wide text-on-accent uppercase">New</span>}
              {e.name} sent a message
            </h3>
            <span className="text-[14px] text-muted">{new Date(e.created_at).toLocaleString()}</span>
          </div>
          {e.need && <p className="mt-1 text-[14px] text-muted">About: {e.need}</p>}

          {open === e.id && (
            <div className="mt-4 space-y-1 border-t border-hairline pt-4 text-[15px] text-text">
              <p>
                <a href={`mailto:${e.email}`} className="underline">
                  {e.email}
                </a>
                {e.phone && ` · ${e.phone}`}
              </p>
              {(e.budget || e.wanted_date) && <p className="text-muted">{[e.budget, e.wanted_date].filter(Boolean).join(' · ')}</p>}
              {e.message && <p className="whitespace-pre-wrap text-muted">{e.message}</p>}
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => seen(e)} className={btn}>
              {e.handled ? 'Mark as new again' : 'Mark as seen'}
            </button>
            <button type="button" onClick={() => setOpen(open === e.id ? null : e.id)} className={btn}>
              {open === e.id ? 'Hide details' : 'Show details'}
            </button>
            <button type="button" onClick={() => remove(e)} className={btnDanger}>
              Remove
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
