'use client';

import { createContext, useContext } from 'react';
import type { SiteSettings } from '@/content/types';

const Ctx = createContext<SiteSettings | null>(null);

/** Hands the (Supabase-backed) site settings, fetched once in the root layout, to client components. */
export function SiteProvider({ site, children }: { site: SiteSettings; children: React.ReactNode }) {
  return <Ctx.Provider value={site}>{children}</Ctx.Provider>;
}

export function useSite(): SiteSettings {
  const s = useContext(Ctx);
  if (!s) throw new Error('useSite must be used inside <SiteProvider>');
  return s;
}
