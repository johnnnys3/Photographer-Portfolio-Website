'use client';

import { useEffect, useState } from 'react';

export function CustomCursor() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [label, setLabel] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isTouch || reducedMotion) return;
    setEnabled(true);
    document.body.style.cursor = 'none';

    const handleMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      const target = (e.target as HTMLElement)?.closest('[data-cursor]');
      setLabel(target ? target.getAttribute('data-cursor') : null);
    };

    window.addEventListener('mousemove', handleMove);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      document.body.style.cursor = '';
    };
  }, []);

  if (!enabled) return null;

  return (
    <div
      className="pointer-events-none fixed z-[100] flex items-center justify-center transition-[width,height] duration-200 ease-out"
      style={{
        left: pos.x,
        top: pos.y,
        transform: 'translate(-50%, -50%)',
        width: label ? 64 : 8,
        height: label ? 64 : 8,
      }}
    >
      <div
        className={`rounded-full flex items-center justify-center transition-opacity duration-200 w-full h-full ${
          label ? 'opacity-100 bg-[#FE2F00]' : 'opacity-40 bg-black dark:bg-white'
        }`}
      >
        {label && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-white">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
