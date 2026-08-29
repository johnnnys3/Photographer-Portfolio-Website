'use client';

import { useEffect, useState } from 'react';
import { X } from '@phosphor-icons/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PHOTOGRAPHER } from './siteIdentity';

interface NavigationProps {
  currentPage?: string;
  /** Home overlays the hero photograph; inner pages need their own ground. */
  overlay?: boolean;
}

const NAV_LINKS = [
  { label: 'Story', href: '/about' },
  { label: 'Work', href: '/galleries' },
  { label: 'Message', href: '/contact' },
];

const SOCIAL_LINKS = [
  { label: 'Instagram', href: '#' },
  { label: 'TikTok', href: '#' },
  { label: 'YouTube', href: '#' },
];

const EASE = 'cubic-bezier(0.76, 0, 0.24, 1)';

export function Navigation({ overlay = false }: NavigationProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Lock the page behind the drawer while it is open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const tone = overlay ? 'text-[#efeee9]' : 'text-foreground';
  const barTone = overlay ? 'bg-[#efeee9]' : 'bg-foreground';

  return (
    <>
      <header
        className={`absolute inset-x-0 top-0 z-30 flex items-start justify-between px-6 pt-6 sm:px-10 sm:pt-8 ${tone}`}
      >
        <Link
          href="/"
          className="anim-fade-up text-lg tracking-wide"
          style={{ animationDelay: '800ms' }}
        >
          {PHOTOGRAPHER.name.split(' ')[0]}
        </Link>

        <div className="flex items-start gap-16 lg:gap-24">
          <span
            className="anim-fade-up hidden text-sm sm:block"
            style={{ animationDelay: '900ms' }}
          >
            {new Date().getFullYear()}
          </span>

          <nav className="hidden flex-col gap-0.5 text-sm sm:flex">
            {NAV_LINKS.map((link, i) => (
              <Link
                key={link.label}
                href={link.href}
                className="anim-fade-up transition-opacity duration-300 hover:opacity-60"
                style={{ animationDelay: `${1000 + i * 80}ms` }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden flex-col gap-0.5 text-sm sm:flex">
            {SOCIAL_LINKS.map((link, i) => (
              <a
                key={link.label}
                href={link.href}
                className="anim-fade-up transition-opacity duration-300 hover:opacity-60"
                style={{ animationDelay: `${1150 + i * 80}ms` }}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </header>

      {/* Hamburger morphs into the close mark. */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? 'Close menu' : 'Open menu'}
        className="anim-fade-up absolute right-5 top-5 z-50 grid h-10 w-10 place-items-center sm:hidden"
        style={{ animationDelay: '900ms' }}
      >
        <span className="relative block h-4 w-6">
          <span
            className={`absolute left-0 block h-px w-6 ${open ? 'bg-[#efeee9]' : barTone}`}
            style={{
              top: open ? '50%' : '0',
              transform: open ? 'translateY(-50%) rotate(45deg)' : 'none',
              transition: `all 500ms ${EASE}`,
            }}
          />
          <span
            className={`absolute left-0 top-1/2 block h-px w-6 -translate-y-1/2 ${barTone}`}
            style={{ opacity: open ? 0 : 1, transition: 'opacity 300ms linear' }}
          />
          <span
            className={`absolute left-0 block h-px w-6 ${open ? 'bg-[#efeee9]' : barTone}`}
            style={{
              bottom: open ? 'auto' : '0',
              top: open ? '50%' : 'auto',
              transform: open ? 'translateY(-50%) rotate(-45deg)' : 'none',
              transition: `all 500ms ${EASE}`,
            }}
          />
        </span>
      </button>

      {/* Backdrop. */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-500 sm:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      {/* Right slide-in panel. */}
      <aside
        className={`fixed right-0 top-0 z-40 h-full w-[80%] max-w-sm bg-[#141414] px-8 py-10 text-[#efeee9] sm:hidden ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ transition: `transform 600ms ${EASE}` }}
        aria-hidden={!open}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close menu"
          className="absolute right-6 top-6"
          style={{
            transform: open ? 'rotate(0deg)' : 'rotate(90deg)',
            opacity: open ? 1 : 0,
            transition: 'transform 500ms ease, opacity 300ms ease',
            transitionDelay: open ? '300ms' : '0ms',
          }}
        >
          <X size={26} weight="light" />
        </button>

        <p
          className="text-xs uppercase tracking-[0.2em] text-[#efeee9]/50"
          style={{
            opacity: open ? 1 : 0,
            transform: open ? 'translateY(0)' : 'translateY(1rem)',
            transition: 'all 500ms ease',
            transitionDelay: open ? '250ms' : '0ms',
          }}
        >
          Site Index
        </p>
        <nav className="mt-6 flex flex-col gap-2">
          {NAV_LINKS.map((link, i) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-4xl tracking-[-0.03em]"
              style={{
                opacity: open ? 1 : 0,
                transform: open ? 'translateY(0)' : 'translateY(1.5rem)',
                transition: 'all 500ms ease',
                transitionDelay: open ? `${300 + i * 80}ms` : '0ms',
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <p
          className="mt-14 text-xs uppercase tracking-[0.2em] text-[#efeee9]/50"
          style={{
            opacity: open ? 1 : 0,
            transform: open ? 'translateY(0)' : 'translateY(1rem)',
            transition: 'all 500ms ease',
            transitionDelay: open ? '500ms' : '0ms',
          }}
        >
          Find Me
        </p>
        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {SOCIAL_LINKS.map((link, i) => (
            <a
              key={link.label}
              href={link.href}
              style={{
                opacity: open ? 1 : 0,
                transform: open ? 'translateY(0)' : 'translateY(1rem)',
                transition: 'all 500ms ease',
                transitionDelay: open ? `${550 + i * 60}ms` : '0ms',
              }}
            >
              {link.label}
            </a>
          ))}
        </div>
      </aside>
    </>
  );
}
