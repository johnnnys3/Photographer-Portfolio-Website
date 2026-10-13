'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSite } from '@/components/SiteProvider';
import { LiveClock } from './LiveClock';

const isActive = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

/**
 * Editorial header, the same on every screen: a left-aligned serif wordmark (two lines on desktop) with the
 * photographer's local time under it, and the pages listed in plain text at the right. There is no menu
 * button. It scrolls away with the page.
 */
export function Header({ links }: { links: { href: string; label: string }[] }) {
  const site = useSite();
  const pathname = usePathname();

  return (
    <header data-site-chrome className="absolute inset-x-0 top-0 z-50 flex items-start justify-between gap-4 px-(--edge) pt-6 md:pt-8">
      <div>
        <Link href="/" className="block whitespace-nowrap text-[16px] font-bold uppercase leading-none tracking-[-0.01em] md:text-[22px]">
          {site.name.trim()}
        </Link>
        <p className="mt-2 text-[12px] text-muted tabular-nums md:mt-3 md:text-[13px]">
          <LiveClock />
        </p>
      </div>

      <nav aria-label="Primary">
        <ul className="flex flex-col gap-1 pt-1 text-[14px] max-md:text-right md:gap-1.5 md:pt-1.5 md:text-[15px]">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                aria-current={isActive(pathname, href) ? 'page' : undefined}
                className="ulink text-muted uppercase tracking-[0.04em] aria-[current=page]:text-text aria-[current=page]:before:content-['—_']"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
