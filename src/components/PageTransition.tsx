'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import gsap from 'gsap';

const BARS = 5;

// Staircase wipe: bars sweep up right-to-left to cover the page, route changes, bars clear.
export function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const pending = useRef(false);
  const fallback = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const reveal = () => {
    if (!pending.current) return;
    pending.current = false;
    clearTimeout(fallback.current);
    gsap.to('.page-wipe-bar', {
      yPercent: -100,
      duration: 0.5,
      ease: 'power3.inOut',
      stagger: { each: 0.06, from: 'end' },
      onComplete: () => {
        gsap.set('.page-wipe-bar', { yPercent: 100 });
      },
    });
  };

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.set('.page-wipe-bar', { yPercent: 100 });
    gsap.set('.page-wipe-root', { visibility: 'visible' });

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement | null)?.closest('a');
      if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;
      if (url.pathname.startsWith('/api')) return;

      e.preventDefault();
      if (pending.current) return;
      pending.current = true;
      gsap.to('.page-wipe-bar', {
        yPercent: 0,
        duration: 0.5,
        ease: 'power3.inOut',
        stagger: { each: 0.06, from: 'end' },
        onComplete: () => {
          router.push(url.pathname + url.search + url.hash);
          // Safety net if the route never resolves
          fallback.current = setTimeout(reveal, 3000);
        },
      });
    };

    document.addEventListener('click', onClick, true);
    return () => {
      document.removeEventListener('click', onClick, true);
      clearTimeout(fallback.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  useEffect(reveal, [pathname]);

  return (
    <div aria-hidden className="page-wipe-root invisible pointer-events-none fixed inset-0 z-[90] flex overflow-hidden">
      {Array.from({ length: BARS }, (_, i) => (
        <div key={i} className="page-wipe-bar h-full flex-1 bg-[#FE2F00]" />
      ))}
    </div>
  );
}
