'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

export type StripPhoto = { src: string; alt: string; width: number; height: number; slug: string; title: string; place: string; year: string };

const shuffle = <T,>(a: T[]) => {
  const out = [...a];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

/**
 * Landing page: one horizontal strip of photographs, a fresh random order on every visit. It drifts on its own
 * (paused on hover, focus, or reduced motion), scrolls natively by touch or trackpad, and has arrows for a mouse.
 * The photograph nearest the centre is lit; the caption under it names the series and links into it.
 */
export function LandingStrip({ photos }: { photos: StripPhoto[] }) {
  // Server and first client render use the given order; the shuffle happens after mount so hydration matches.
  const [items, setItems] = useState(photos);
  const [ready, setReady] = useState(false);
  const [at, setAt] = useState(0);
  const [paused, setPaused] = useState(false);
  const strip = useRef<HTMLUListElement>(null);

  useEffect(() => {
    setItems(shuffle(photos));
    setReady(true);
  }, [photos]);

  const go = useCallback((to: number) => {
    const el = strip.current;
    const li = el?.children[(to + el.children.length) % el.children.length] as HTMLElement | undefined;
    if (!el || !li) return;
    el.scrollTo({ left: li.offsetLeft - (el.clientWidth - li.clientWidth) / 2, behavior: 'smooth' });
  }, []);

  // Light the photograph whose centre is nearest the middle of the strip.
  const onScroll = () => {
    const el = strip.current;
    if (!el) return;
    const mid = el.scrollLeft + el.clientWidth / 2;
    let best = 0;
    let dist = Infinity;
    Array.from(el.children).forEach((c, i) => {
      const li = c as HTMLElement;
      const d = Math.abs(li.offsetLeft + li.clientWidth / 2 - mid);
      if (d < dist) [best, dist] = [i, d];
    });
    setAt(best);
  };

  useEffect(() => {
    if (!ready || paused || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => {
      if (!document.hidden) go(at + 1);
    }, 4500);
    return () => clearInterval(t);
  }, [ready, paused, at, go]);

  const cur = items[at] ?? items[0];
  if (!cur) return null;

  return (
    <section
      aria-label="Selected photographs"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <ul
        ref={strip}
        onScroll={onScroll}
        className={`no-bar flex snap-x snap-mandatory items-center gap-4 overflow-x-auto px-[7.5vw] transition-opacity md:px-[calc(50vw-26svh)] duration-500 md:gap-8 ${ready ? 'opacity-100' : 'opacity-0'}`}
        style={{ height: 'clamp(280px, calc(100svh - var(--top-h) - 130px), 760px)' }}
      >
        {items.map((p, i) => (
          <li key={p.src} className="h-full max-w-[85vw] shrink-0 snap-center md:max-w-none">
            <Link
              href={`/work/${p.slug}`}
              tabIndex={i === at ? 0 : -1}
              aria-label={`${p.title}, ${p.place}`}
              className={`relative block h-full max-w-full transition-opacity duration-700 ${i === at ? 'opacity-100' : 'opacity-30 hover:opacity-60'}`}
              style={{ aspectRatio: p.width / p.height }}
            >
              <Image
                src={p.src}
                alt={p.alt}
                fill
                sizes="(min-width: 768px) 60svh, 80vw"
                priority={i < 3}
                className="object-cover"
              />
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-5 flex items-baseline justify-between gap-6 px-6 md:px-(--edge)">
        <p className="text-xs text-muted tabular-nums">
          {String(at + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
        </p>
        <Link href={`/work/${cur.slug}`} className="ulink min-w-0 truncate text-center">
          <span className="text-[14px] md:text-[16px]">{cur.title}</span>
          <span className="ml-3 text-xs text-muted">
            {cur.place}, {cur.year}
          </span>
        </Link>
        <div className="flex gap-4 text-sm">
          <button type="button" onClick={() => go(at - 1)} aria-label="Previous photograph" className="ulink">
            ←
          </button>
          <button type="button" onClick={() => go(at + 1)} aria-label="Next photograph" className="ulink">
            →
          </button>
        </div>
      </div>
    </section>
  );
}
