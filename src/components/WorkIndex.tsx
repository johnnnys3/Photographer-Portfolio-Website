'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { DatabaseImage } from '../lib/supabase';

interface WorkIndexProps {
  images: DatabaseImage[];
  onImageClick: (imageId: string) => void;
}

const FALLBACK_SEEDS = [
  'index-harmattan-dust',
  'index-long-room-sitter',
  'index-salt-coast-tide',
  'index-nightwork-street',
  'index-market-hands',
  'index-ceremony-veil',
  'index-rooftop-dusk',
  'index-window-rain',
  'index-backstage-mirror',
  'index-coastline-long',
  'index-profile-lowkey',
  'index-crowd-motion',
];

const FALLBACK: DatabaseImage[] = FALLBACK_SEEDS.map((seed, i) => ({
  id: `index-${i}`,
  filename: `${seed}.jpg`,
  url: `https://picsum.photos/seed/${seed}/900/1100`,
  title: seed.replace('index-', '').replace(/-/g, ' '),
  tags: [],
  gallery: 'archive',
  uploaded_at: '',
  photographer_id: '',
  width: 900,
  height: 1100,
}));

const mod = (n: number, m: number) => ((n % m) + m) % m;

// Supabase titles are upload filenames, so clean them into something exhibitable.
function displayTitle(raw: string | undefined, index: number) {
  const cleaned = (raw || '')
    .replace(/\.[a-z0-9]{2,4}$/i, '')
    .replace(/[-_]?unsplash$/i, '')
    .split(/[-_\s]+/)
    // Drop the random id tokens photo services append.
    .filter(
      (token) =>
        token.length > 0 &&
        !/^[a-z0-9]{8,}$/i.test(token) &&
        // Photo services append id fragments like "3tll" or "97hnjo".
        !(/\d/.test(token) && /[a-z]/i.test(token))
    )
    .join(' ')
    .trim();

  if (cleaned.length < 3) return `Untitled ${String(index + 1).padStart(2, '0')}`;
  return cleaned;
}

export function WorkIndex({ images, onImageClick }: WorkIndexProps) {
  const items = (images.length >= 6 ? images : FALLBACK).slice(0, 12);
  const count = items.length;

  const [active, setActive] = useState(0);
  const [armed, setArmed] = useState(false);
  const [entered, setEntered] = useState(false);

  const stage = useRef<HTMLDivElement>(null);
  const cellRefs = useRef<(HTMLDivElement | null)[]>([]);
  // Scroll lives outside React so the rAF loop never triggers a re-render.
  const target = useRef(0);
  const current = useRef(0);
  const step = useRef(1);
  const activeRef = useRef(0);


  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 120);
    return () => clearTimeout(t);
  }, []);

  // Measure one cell so the wrap maths follow the real layout at any viewport.
  useEffect(() => {
    const measure = () => {
      const el = cellRefs.current[0];
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const next = rect.width;
      if (next > 0) step.current = next;
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [count]);

  // Single animation loop: eases toward the target and writes transforms directly.
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frame = 0;

    const tick = () => {
      const ease = reduce ? 1 : 0.09;
      current.current += (target.current - current.current) * ease;

      const span = step.current * count;
      if (span > 0) {
        cellRefs.current.forEach((el, i) => {
          if (!el) return;
          // Wrap each cell into the window centred on the playhead.
          const raw = i * step.current - current.current;
          const offset = mod(raw + span / 2, span) - span / 2;
          el.style.transform = `translate3d(${offset}px, -50%, 0)`;
          const distance = Math.abs(offset) / step.current;
          el.style.opacity = String(Math.max(0.25, 1 - distance * 0.35));
        });

        const next = mod(Math.round(current.current / step.current), count);
        if (next !== activeRef.current) {
          activeRef.current = next;
          setActive(next);
        }
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [count]);

  // Wheel drives the strip instead of the document.
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      target.current += e.deltaY;
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  // Pointer drag, so trackpads and touch reach the same control.
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    let dragging = false;
    let last = 0;

    const down = (e: PointerEvent) => {
      dragging = true;
      last = e.clientX;
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      const now = e.clientX;
      target.current -= now - last;
      last = now;
    };
    const up = () => {
      dragging = false;
    };

    el.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => {
      el.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, []);

  const goTo = useCallback(
    (index: number) => {
      const span = step.current * count;
      if (!span) return;
      // Travel the short way round rather than unwinding the whole strip.
      const delta = mod(index * step.current - target.current + span / 2, span) - span / 2;
      target.current += delta;
    },
    [count]
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      target.current += step.current;
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      target.current -= step.current;
    }
  };

  return (
    <>
    <section
      ref={stage}
      tabIndex={0}
      onKeyDown={onKeyDown}
      aria-label="Work index"
      className="relative hidden h-[100dvh] w-full touch-none overflow-hidden outline-none lg:block"
    >
      {/* The strip itself. */}
      <div
        className={`absolute inset-0 z-10 transition-opacity duration-1000 ${
          entered ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {items.map((item, i) => (
          <div
            key={item.id}
            ref={(el) => {
              cellRefs.current[i] = el;
            }}
            className="absolute left-1/2 top-1/2 h-[76vh] w-[38vw] overflow-hidden bg-secondary will-change-transform"
            style={{ marginLeft: '-19vw' }}
          >
            {/* Clicking the centred frame opens it; a neighbour glides into place first. */}
            <button
              type="button"
              onClick={() => (i === active ? onImageClick(item.id) : goTo(i))}
              onMouseEnter={() => i === active && setArmed(true)}
              onMouseLeave={() => setArmed(false)}
              onFocus={() => i === active && setArmed(true)}
              onBlur={() => setArmed(false)}
              aria-label={
                i === active
                  ? `Open ${displayTitle(item.title, i)}`
                  : `Bring ${displayTitle(item.title, i)} into view`
              }
              className="absolute inset-0 z-10 h-full w-full cursor-pointer"
            />
            <img
              src={item.url}
              alt={displayTitle(item.title, i)}
              draggable={false}
              loading={i < 4 ? 'eager' : 'lazy'}
              decoding="async"
              onError={(e) => {
                const el = e.currentTarget;
                if (el.dataset.fallback) return;
                el.dataset.fallback = '1';
                el.src = FALLBACK[i % FALLBACK.length].url;
              }}
              className="h-full w-full select-none object-cover"
            />
          </div>
        ))}
      </div>

      {/* Playhead: the click target that opens whatever frame is centred. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 z-30 grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center"
      >
        <span
          className={`grid place-items-center transition-all duration-300 ${
            armed
              ? 'h-[18px] w-[18px] border border-[#F2EDE4]'
              : 'h-[7px] w-[7px] border border-transparent'
          }`}
        >
          <span
            className={`bg-[#F2EDE4] transition-all duration-300 ${
              armed ? 'h-[8px] w-[8px]' : 'h-[7px] w-[7px]'
            }`}
          />
        </span>
        <span
          className={`pointer-events-none absolute left-full ml-3 whitespace-nowrap text-[11px] uppercase tracking-[0.14em] text-[#F2EDE4] transition-opacity duration-300 ${
            armed ? 'opacity-100' : 'opacity-0'
          }`}
        >
          Open frame
        </span>
      </span>

      <p className="pointer-events-none absolute bottom-8 left-8 z-20 text-[11px] uppercase tracking-[0.14em] opacity-35">
        Scroll or drag
      </p>
      <p className="absolute bottom-8 right-8 z-20 text-[11px] uppercase tracking-[0.14em] opacity-35">
        {String(active + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
      </p>
    </section>

    {/* Below lg there is no wheel to drive, so the index becomes a plain scrolling list. */}
    <div className="px-5 pb-16 pt-28 lg:hidden">
      <p className="text-[11px] uppercase tracking-[0.14em] opacity-35">Index</p>
      <ul className="mt-8 grid gap-10">
        {items.map((item, i) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onImageClick(item.id)}
              className="w-full text-left"
            >
              <img
                src={item.url}
                alt={displayTitle(item.title, i)}
                loading={i < 2 ? 'eager' : 'lazy'}
                decoding="async"
                onError={(e) => {
                  const el = e.currentTarget;
                  if (el.dataset.fallback) return;
                  el.dataset.fallback = '1';
                  el.src = FALLBACK[i % FALLBACK.length].url;
                }}
                className="aspect-[4/5] w-full object-cover"
              />
              <span className="mt-3 flex items-baseline gap-4 text-[11px] uppercase tracking-[0.14em]">
                <span className="tabular-nums opacity-35">{String(i + 1).padStart(2, '0')}/</span>
                <span>{displayTitle(item.title, i)}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
    </>
  );
}
