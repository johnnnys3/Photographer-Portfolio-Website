'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Lightbox } from './Lightbox';

export type Photo = { src: string; alt: string; width: number; height: number; exif?: string; caption?: string };
type Props = {
  plate: string;
  title: string;
  place: string;
  year: string;
  statement: string;
  photos: Photo[];
  next: { slug: string; title: string } | null;
  credit: string;
};

/** Photo that fades in once decoded (also when it was already cached before hydration). */
function FadeImage({ photo, eager }: { photo: Photo; eager: boolean }) {
  const ref = useRef<HTMLImageElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (ref.current?.complete && ref.current.naturalWidth) setReady(true);
  }, []);
  return (
    <Image
      ref={ref}
      src={photo.src}
      alt={photo.alt}
      fill
      sizes="(min-width: 768px) 70vh, 76vw"
      loading={eager ? 'eager' : 'lazy'}
      draggable={false}
      onLoad={() => setReady(true)}
      className={`object-contain transition-opacity duration-[600ms] ${ready ? 'opacity-100' : 'opacity-0'}`}
    />
  );
}

/**
 * The walk-through: one row of photographs that scrolls sideways, on every screen size.
 * Desktop: the caption is fixed at the left; mouse wheel (smoothed), arrow keys (snap) and dragging scroll the row.
 * Phone: the caption is the first panel of the row, photos follow at ~76% width, and you swipe.
 */
export function SeriesGallery({ plate, title, place, year, statement, photos, next, credit }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const moved = useRef(false);
  const [desktop, setDesktop] = useState(false);
  const [current, setCurrent] = useState(0);
  const [box, setBox] = useState<number | null>(null);
  const boxOpen = useRef(false);
  boxOpen.current = box !== null;

  useEffect(() => {
    const mq = matchMedia('(min-width: 768px)');
    const on = () => setDesktop(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  useEffect(() => {
    const el = scroller.current;
    const host = root.current;
    if (!el || !host) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const items = () => [...el.querySelectorAll<HTMLElement>('[data-item]')].filter((i) => i.offsetWidth > 0);
    const max = () => el.scrollWidth - el.clientWidth;
    let target = el.scrollLeft;
    let anim = 0;

    // Progress line and counter follow any scrolling: wheel, keys, dragging or a touch swipe.
    const onScroll = () => {
      if (!anim) target = el.scrollLeft;
      bar.current!.style.transform = `scaleX(${max() > 0 ? el.scrollLeft / max() : 0})`;
      const at = items().filter((i) => i.offsetLeft <= el.scrollLeft + 40).length - 1;
      setCurrent(Math.max(0, Math.min(photos.length - 1, at)));
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    const cleanups: (() => void)[] = [() => el.removeEventListener('scroll', onScroll)];

    if (desktop) {
      // Ease toward `target` (lerp 0.12); at least 1px a frame so it always arrives.
      const tick = () => {
        const d = target - el.scrollLeft;
        if (Math.abs(d) < 1) {
          el.scrollLeft = target;
          anim = 0;
          return;
        }
        el.scrollLeft += Math.abs(d * 0.12) < 1 ? Math.sign(d) : d * 0.12;
        anim = requestAnimationFrame(tick);
      };
      const moveTo = (x: number) => {
        target = Math.max(0, Math.min(max(), x));
        if (reduce) el.scrollLeft = target;
        else if (!anim) anim = requestAnimationFrame(tick);
      };

      const onWheel = (e: WheelEvent) => {
        if (e.ctrlKey || boxOpen.current) return;
        e.preventDefault();
        const d = (Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX) * (e.deltaMode === 1 ? 16 : 1);
        moveTo((anim ? target : el.scrollLeft) + d);
      };

      const onKey = (e: KeyboardEvent) => {
        if (e.metaKey || e.ctrlKey || e.altKey || boxOpen.current) return;
        const at = el.scrollLeft;
        if (e.key === 'ArrowRight') {
          const n = items().find((i) => i.offsetLeft > at + 4);
          moveTo(n ? n.offsetLeft : max());
        } else if (e.key === 'ArrowLeft') {
          const p = items().filter((i) => i.offsetLeft < at - 4).pop();
          moveTo(p ? p.offsetLeft : 0);
        } else return;
        e.preventDefault();
      };

      // Mouse drag; a drag must not count as a click on a photograph.
      let from: { x: number; left: number } | null = null;
      const down = (e: PointerEvent) => {
        if (e.pointerType !== 'mouse' || e.button !== 0) return;
        from = { x: e.clientX, left: el.scrollLeft };
        moved.current = false;
      };
      const move = (e: PointerEvent) => {
        if (!from) return;
        const dx = e.clientX - from.x;
        if (!moved.current && Math.abs(dx) > 5) {
          moved.current = true;
          el.setPointerCapture(e.pointerId);
          el.style.cursor = 'grabbing';
        }
        if (moved.current) {
          cancelAnimationFrame(anim);
          anim = 0;
          el.scrollLeft = from.left - dx;
        }
      };
      const up = () => {
        from = null;
        el.style.cursor = '';
      };

      host.addEventListener('wheel', onWheel, { passive: false });
      window.addEventListener('keydown', onKey);
      el.addEventListener('pointerdown', down);
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerup', up);
      el.addEventListener('pointercancel', up);
      cleanups.push(() => {
        cancelAnimationFrame(anim);
        host.removeEventListener('wheel', onWheel);
        window.removeEventListener('keydown', onKey);
        el.removeEventListener('pointerdown', down);
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerup', up);
        el.removeEventListener('pointercancel', up);
      });
    }
    return () => cleanups.forEach((c) => c());
  }, [desktop, photos.length]);

  const counter = `${String(current + 1).padStart(2, '0')} / ${String(photos.length).padStart(2, '0')}`;
  const plateLine = <p className="mb-2 text-xs text-muted max-md:text-text">No. {plate}</p>;
  const details = (
    <>
      <p className="mt-3 text-muted max-md:text-text">{place}</p>
      <p className="text-muted max-md:text-text">{year}</p>
      {statement && <p className="mt-4 max-w-[280px] whitespace-pre-line">{statement}</p>}
    </>
  );

  return (
    <>
      <div ref={root} className="fixed inset-0 z-30 bg-bg">
        {/* Desktop: caption fixed at the left */}
        <aside className="absolute inset-y-0 left-(--edge) hidden w-[280px] flex-col justify-center md:flex">
          {plateLine}
          <h1 className="serif blur-in !text-[clamp(22px,2.6vw,34px)] !leading-[1.1]">{title}</h1>
          {details}
          <p className="mt-8 text-xs text-muted tabular-nums" aria-hidden>
            {counter}
          </p>
        </aside>

        <div
          ref={scroller}
          className="no-bar absolute inset-x-0 top-[172px] bottom-[88px] flex items-center gap-6 overflow-x-auto overflow-y-hidden px-(--edge) md:top-(--header-h) md:right-[170px] md:left-[calc(var(--edge)+280px+56px)] md:gap-(--gallery-gap) md:p-0"
        >
          {/* Phone: caption is the first panel of the row */}
          <div data-item className="flex h-full w-[calc(100vw-2*var(--edge))] flex-none flex-col justify-center pl-[36%] md:hidden">
            {plateLine}
            <h1 className="serif blur-in !leading-[1.1]">{title}</h1>
            {details}
          </div>

          {photos.map((p, k) => {
            const landscape = p.width > p.height;
            return (
              <figure
                key={`${p.src}-${k}`}
                data-item
                className={`relative w-[76vw] max-h-[calc(100svh-296px)] flex-none md:w-auto md:max-h-none ${landscape ? 'md:h-[calc((100svh-230px)*0.55)]' : 'md:h-[calc(100svh-230px)]'}`}
                style={{ aspectRatio: `${p.width} / ${p.height}` }}
              >
                <button
                  type="button"
                  aria-label={`Open photograph ${k + 1} of ${photos.length}: ${p.alt}`}
                  onClick={() => !moved.current && setBox(k)}
                  className="absolute inset-0 block md:cursor-grab"
                >
                  <FadeImage photo={p} eager={k < 4} />
                </button>
                {/* the photograph's own caption (e.g. "for Schon! Magazine"), small and centred under it */}
                {p.caption && (
                  <figcaption className="pointer-events-none absolute inset-x-0 top-full pt-3 text-center text-xs text-muted">{p.caption}</figcaption>
                )}
              </figure>
            );
          })}

          <div data-item className="flex w-[76vw] flex-none flex-col justify-center gap-4 md:w-[min(480px,40vw)] md:pl-10">
            {next && (
              <Link href={`/work/${next.slug}`} className="ulink block">
                <span className="block text-muted max-md:text-text">Next series →</span>
                <span className="serif mt-2 block">{next.title}</span>
              </Link>
            )}
            <Link href="/work" className="ulink text-muted max-md:text-text">
              Back to work
            </Link>
          </div>
        </div>

        {/* camera details of the photograph in view (entered per photo in the admin) */}
        <p className="fixed inset-x-0 bottom-[56px] min-h-4 text-center text-xs text-muted tabular-nums" aria-live="polite">
          {photos[current]?.exif}
        </p>
        <div
          className="fixed right-(--edge) bottom-[44px] left-(--edge) h-px bg-hairline md:left-[calc(var(--edge)+280px+56px)]"
          aria-hidden
        >
          <div ref={bar} className="h-px origin-left bg-text" style={{ transform: 'scaleX(0)' }} />
        </div>
        <p className="fixed bottom-4 left-(--edge) text-xs text-muted">{credit}</p>
      </div>

      {box !== null && <Lightbox photos={photos} index={box} onIndex={setBox} onClose={() => setBox(null)} />}
    </>
  );
}
