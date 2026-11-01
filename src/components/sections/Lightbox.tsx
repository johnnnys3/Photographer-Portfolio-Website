'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';

type Photo = { src: string; alt: string };

/** One photograph alone on the paper. ESC closes, ← / → move, focus stays on the Close button. */
export function Lightbox({
  photos,
  index,
  onIndex,
  onClose,
}: {
  photos: Photo[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const close = useRef<HTMLButtonElement>(null);
  const n = photos.length;
  const step = (d: number) => onIndex((index + d + n) % n);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    close.current?.focus();
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = '';
      opener?.focus();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'Tab') {
        // two buttons and the arrows: keep focus on the lightbox's own controls
        const all = [...document.querySelectorAll<HTMLElement>('[data-lightbox] button')];
        const at = all.indexOf(document.activeElement as HTMLElement);
        all[(at + (e.shiftKey ? all.length - 1 : 1)) % all.length].focus();
        e.preventDefault();
      } else return;
      if (e.key !== 'Tab') e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const p = photos[index];
  return (
    <div data-lightbox role="dialog" aria-modal="true" aria-label="Photograph" className="menu-in fixed inset-0 z-[60] bg-bg">
      <div className="absolute inset-x-(--edge) top-[var(--header-h)] bottom-[var(--header-h)]">
        <Image key={p.src} src={p.src} alt={p.alt} fill sizes="100vw" priority className="object-contain" />
      </div>
      <p className="absolute top-0 left-(--edge) flex h-(--header-h) items-center text-xs text-muted tabular-nums">
        {String(index + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
      </p>
      <button ref={close} type="button" onClick={onClose} className="ulink absolute top-0 right-(--edge) flex h-(--header-h) items-center">
        Close
      </button>
      {n > 1 && (
        <div className="absolute inset-x-(--edge) bottom-0 flex h-(--header-h) items-center justify-between text-muted">
          <button type="button" onClick={() => step(-1)} className="ulink min-h-11">
            ← Previous
          </button>
          <button type="button" onClick={() => step(1)} className="ulink min-h-11">
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
