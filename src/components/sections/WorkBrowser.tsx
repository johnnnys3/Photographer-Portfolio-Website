'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { growCover } from '@/lib/coverTransition';

export type SeriesCard = {
  plate: string;
  ratio: number; // width / height of the first photograph (it is also the cover)
  frames: { src: string; alt: string }[];
  slug: string;
  title: string;
  place: string;
  year: string;
  count: number;
  cover: { src: string; alt: string };
};

export type TypedPhoto = { src: string; alt: string; width: number; height: number; type: string; slug: string; title: string };
export type PhotoType = { value: string; label: string };

type View = 'grid' | 'type' | 'index';

/**
 * One rule for every grid on this page (By project and By type): always three across, filled left to right,
 * row by row, with the middle column sitting a little lower for rhythm.
 */
const GRID = 'grid grid-cols-3 items-start gap-x-3 gap-y-8 md:gap-x-7 md:gap-y-14';
// The caption under every photograph, the same in "By project" and "By type".
const LABEL = 'mt-2 block truncate text-xs text-muted';
const STAGGER ='[&:nth-child(3n+2)]:mt-8 md:[&:nth-child(3n+2)]:mt-16';

/** A 4:5 cover. Hovering it with a mouse flips quickly through more photographs of the project. */
function Cover({ s, priority }: { s: SeriesCard; priority: boolean }) {
  const [at, setAt] = useState(-1); // -1 = the cover itself
  const timer = useRef(0);
  const start = () => {
    if (!s.frames.length || !matchMedia('(hover: hover) and (prefers-reduced-motion: no-preference)').matches) return;
    clearInterval(timer.current); // never leave an earlier flip running
    setAt(0);
    timer.current = window.setInterval(() => setAt((i) => (i + 1) % s.frames.length), 450);
  };
  const stop = () => {
    clearInterval(timer.current);
    setAt(-1);
  };
  useEffect(() => () => clearInterval(timer.current), []);

  const sizes = '(min-width: 900px) 272px, (min-width: 640px) 30vw, 100vw';
  return (
    <span
      onMouseEnter={start}
      onMouseLeave={stop}
      className="relative block aspect-[4/5] w-full overflow-hidden transition-opacity duration-200 group-hover:opacity-85"
    >
      <Image src={s.cover.src} alt={s.cover.alt} fill sizes={sizes} priority={priority} className="object-cover" />
      {s.frames.map((f, k) => (
        <Image
          key={f.src}
          src={f.src}
          alt=""
          aria-hidden
          fill
          sizes={sizes}
          loading="lazy"
          className={`object-cover transition-opacity duration-150 ${at === k ? 'opacity-100' : 'opacity-0'}`}
        />
      ))}
    </span>
  );
}

/**
 * Three ways in: by project (4:5 covers), by type (every photograph of one type, whatever series it
 * belongs to; a click opens its series) and a hairline Index table with a cursor-following preview.
 */
export function WorkBrowser({ series, photos, types }: { series: SeriesCard[]; photos: TypedPhoto[]; types: PhotoType[] }) {
  const [view, setView] = useState<View>('grid');
  const [type, setType] = useState('all');
  const [peek, setPeek] = useState<{ card: SeriesCard; x: number; y: number } | null>(null);
  const router = useRouter();
  // A random photograph picks the project, so projects with more photographs come up a little more often.
  const surprise = () => {
    const slug = (photos.length ? photos[Math.floor(Math.random() * photos.length)] : series[Math.floor(Math.random() * series.length)]).slug;
    router.push(`/work/${slug}`);
  };

  const tab = (v: View, label: string) => (
    <button
      type="button"
      aria-pressed={view === v}
      onClick={() => setView(v)}
      className={`ulink ${view === v ? 'text-text' : 'text-muted'}`}
    >
      {label}
    </button>
  );
  const sep = (
    <span aria-hidden className="text-muted">
      /
    </span>
  );
  const shown = type === 'all' ? photos : photos.filter((p) => p.type === type);

  return (
    <div className="mx-auto max-w-[1180px]">
      <div className="mb-10 flex justify-center gap-2 text-xs">
        {tab('grid', 'By project')}
        {sep}
        {types.length > 0 && (
          <>
            {tab('type', 'By type')}
            {sep}
          </>
        )}
        {tab('index', 'Index')}
        {series.length > 1 && (
          <>
            {sep}
            <button type="button" onClick={surprise} className="ulink text-muted">
              Surprise me
            </button>
          </>
        )}
      </div>

      {view === 'grid' && (
        <ul className={GRID}>
          {series.map((s, k) => (
            <li key={s.slug} className={STAGGER}>
              <Link href={`/work/${s.slug}`} onClick={(e) => growCover(e, s.ratio)} className="group block">
                <Cover s={s} priority={k < 3} />
                <span className={LABEL}>{s.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {view === 'type' && (
        <>
          <div className="mb-8 flex flex-wrap justify-center gap-x-5 gap-y-1">
            {[{ value: 'all', label: 'All' }, ...types].map((t) => (
              <button
                key={t.value}
                type="button"
                aria-pressed={type === t.value}
                onClick={() => setType(t.value)}
                className={`ulink ${type === t.value ? 'text-text' : 'text-muted'}`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <ul className={GRID}>
            {shown.map((p) => (
              <li key={p.src} className={STAGGER}>
                <Link href={`/work/${p.slug}`} className="group block" title={p.title}>
                  <Image
                    src={p.src}
                    alt={p.alt}
                    width={p.width}
                    height={p.height}
                    sizes="(min-width: 900px) 380px, 33vw"
                    className="h-auto w-full transition-opacity duration-200 group-hover:opacity-85"
                  />
                  <span className={LABEL}>{p.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}

      {view === 'index' && (
        <div onMouseLeave={() => setPeek(null)}>
          <div className="grid grid-cols-[2fr_2fr_1fr_1fr] gap-4 pb-3 text-xs text-muted">
            <span>Title</span>
            <span>Place</span>
            <span>Year</span>
            <span className="text-right">Images</span>
          </div>
          <ul>
            {series.map((s) => (
              <li key={s.slug} className="border-t border-hairline last:border-b">
                <Link
                  href={`/work/${s.slug}`}
                  onMouseMove={(e) => setPeek({ card: s, x: e.clientX, y: e.clientY })}
                  className="grid grid-cols-[2fr_2fr_1fr_1fr] gap-4 py-3 transition-opacity duration-200 hover:opacity-60"
                >
                  <span>{s.title}</span>
                  <span>{s.place}</span>
                  <span>{s.year}</span>
                  <span className="text-right">{s.count}</span>
                </Link>
              </li>
            ))}
          </ul>
          {peek && (
            <Image
              src={peek.card.cover.src}
              alt=""
              width={180}
              height={225}
              aria-hidden
              className="pointer-events-none fixed z-30 hidden h-[225px] w-[180px] object-cover md:block"
              style={{ left: peek.x + 24, top: peek.y + 16 }}
            />
          )}
        </div>
      )}
    </div>
  );
}
