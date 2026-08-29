'use client';

import { useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Plus, ArrowUpRight } from '@phosphor-icons/react';
import { EditorialHero } from './EditorialHero';
import { PHOTOGRAPHER } from './siteIdentity';
import Link from 'next/link';
import { useData } from '../contexts/DataContext';
import type { DatabaseImage } from '../lib/supabase';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const FALLBACK_IMAGES: DatabaseImage[] = [
  'harmattan-portrait-window',
  'lagos-rooftop-dusk',
  'studio-profile-lowkey',
  'market-hands-detail',
  'ceremony-veil-light',
  'coastline-long-exposure',
  'backstage-mirror-frame',
  'nightbus-window-rain',
].map((seed, i) => ({
  id: `fallback-${i}`,
  filename: `${seed}.jpg`,
  url: `https://picsum.photos/seed/${seed}/800/1000`,
  title: 'Untitled frame',
  tags: [],
  gallery: 'portraits',
  uploaded_at: '',
  photographer_id: '',
  width: 800,
  height: 1000,
}));

// Three recent bodies of work, shown as slab rows.
const RECENT = [
  {
    title: 'Harmattan',
    place: 'Kano',
    year: '2025',
    frames: 42,
    body: 'Six weeks photographing the dry season, shot on a single 50mm through dust light.',
    seed: 'series-harmattan-dust',
  },
  {
    title: 'The Long Room',
    place: 'Lagos',
    year: '2025',
    frames: 28,
    body: 'Studio portraits made over one winter, one lamp, no fill, sitters asked to stay still.',
    seed: 'series-long-room-studio',
  },
  {
    title: 'Salt Coast',
    place: 'Elmina',
    year: '2024',
    frames: 36,
    body: 'Fishermen and the tide line at first light, printed warm to hold the haze.',
    seed: 'series-salt-coast-tide',
  },
];

// Pinned chapters: each one is a series, on a tonal step from graphite down to black.
const CHAPTERS = [
  {
    n: '01',
    title: 'Harmattan',
    place: 'Kano, Nigeria',
    year: '2025',
    note: 'Dust light,',
    rest: 'and the two hours a day it holds still.',
    meta: ['42 frames', 'Silver gelatin'],
    tone: '#2A2622',
    seed: 'chapter-harmattan-wide',
  },
  {
    n: '02',
    title: 'The Long Room',
    place: 'Lagos, Nigeria',
    year: '2025',
    note: 'One lamp, no fill,',
    rest: 'and whatever the sitter decided to give.',
    meta: ['28 frames', 'Studio'],
    tone: '#1C1917',
    seed: 'chapter-long-room-portrait',
  },
  {
    n: '03',
    title: 'Salt Coast',
    place: 'Elmina, Ghana',
    year: '2024',
    note: 'First light on the tide line,',
    rest: 'printed warm to keep the haze in.',
    meta: ['36 frames', 'Colour negative'],
    tone: '#131110',
    seed: 'chapter-salt-coast-boats',
  },
  {
    n: '04',
    title: 'Nightwork',
    place: 'Accra, Ghana',
    year: '2023',
    note: 'Everything after midnight,',
    rest: 'handheld, pushed two stops.',
    meta: ['31 frames', 'Push processed'],
    tone: '#0A0908',
    seed: 'chapter-nightwork-street',
  },
];

const INFO = [
  {
    q: 'Are prints available?',
    a: 'Yes. Most frames are available as archival pigment prints in three sizes, editioned to fifteen and signed on the verso.',
  },
  {
    q: 'Do you take commissions?',
    a: 'A few each year, for editorial, portrait and documentary work. Send the outline and the dates and I will tell you honestly if it is a fit.',
  },
  {
    q: 'What do you shoot on?',
    a: 'A 35mm rangefinder for personal work and a medium format digital back for commissions. Almost everything here is one prime lens.',
  },
  {
    q: 'Can I licence an existing image?',
    a: 'Usually. Licensing is priced by usage and territory, and the archive holds work not shown on this site.',
  },
  {
    q: 'Where can the work be seen in print?',
    a: 'Harmattan ran as a portfolio in two publications this year, and Salt Coast is held in one private collection.',
  },
];

export function HomePage() {
  const { images } = useData();
  const root = useRef<HTMLElement>(null);
  const [openInfo, setOpenInfo] = useState<number | null>(0);
  const pool = images.length >= 8 ? images : FALLBACK_IMAGES;

  useGSAP(
    () => {
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 34,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%' },
        });
      });

      // Chapters pin so each series holds the screen before the next slides over it.
      const panels = gsap.utils.toArray<HTMLElement>('[data-chapter]');
      panels.forEach((panel, i) => {
        if (i === panels.length - 1) return;
        ScrollTrigger.create({
          trigger: panel,
          start: 'top top',
          endTrigger: panels[panels.length - 1],
          end: 'top top',
          pin: true,
          pinSpacing: false,
        });
        gsap.to(panel.querySelector('[data-chapter-inner]'), {
          scale: 0.94,
          opacity: 0.25,
          ease: 'none',
          scrollTrigger: {
            trigger: panels[i + 1],
            start: 'top bottom',
            end: 'top top',
            scrub: true,
          },
        });
      });
    },
    { scope: root }
  );

  return (
    <main ref={root} className="overflow-x-clip">
      <EditorialHero backdrop={pool[0]} portrait={pool[1]} />

      {/* Recent work: rail label, hairline, oversized statement, then slab rows. */}
      <section className="mx-auto max-w-[1400px] px-5 py-24 lg:px-8 lg:py-32">
        <div className="grid gap-8 lg:grid-cols-[220px_1fr] lg:gap-16">
          <p className="text-[15px] text-muted-foreground">Recent work</p>
          <h2
            data-reveal
            className="max-w-[16ch] text-balance text-[9vw] font-medium leading-[0.92] tracking-[-0.04em] lg:border-l lg:border-border lg:pl-16 lg:text-[5vw]"
          >
            Long looks at one place at a time.
          </h2>
        </div>

        <div className="mt-16 grid gap-4">
          {RECENT.map((series) => (
            <article
              key={series.title}
              data-reveal
              className="grid items-center gap-8 rounded-[28px] bg-secondary p-6 lg:grid-cols-[0.85fr_1.15fr] lg:p-10"
            >
              <div>
                <p className="text-[13px] uppercase tracking-[0.16em] text-accent">
                  {series.place} {series.year}
                </p>
                <h3 className="mt-5 text-4xl font-medium leading-[1.02] tracking-[-0.03em] lg:text-[3.2rem]">
                  {series.title}
                </h3>
                <p className="mt-4 max-w-[46ch] leading-relaxed text-muted-foreground">{series.body}</p>
                <Link
                  href="/galleries"
                  className="mt-7 inline-flex items-center gap-2 text-[15px] text-foreground underline-offset-4 hover:underline"
                >
                  View series
                  <ArrowUpRight size={17} />
                </Link>
              </div>
              <img
                src={`https://picsum.photos/seed/${series.seed}/1200/760`}
                alt=""
                loading="lazy"
                decoding="async"
                className="aspect-[16/10] w-full rounded-[20px] object-cover"
              />
            </article>
          ))}
        </div>
      </section>

      {/* Chapters intro. */}
      <section className="mx-auto max-w-[1400px] px-5 pb-16 pt-8 lg:px-8 lg:pb-24">
        <div className="grid gap-6 lg:grid-cols-2 lg:items-end">
          <h2
            data-reveal
            className="max-w-[14ch] text-balance text-[10vw] font-medium leading-[0.92] tracking-[-0.04em] lg:text-[5vw]"
          >
            Four bodies of work.
          </h2>
          <p className="max-w-[42ch] leading-relaxed text-muted-foreground lg:justify-self-end lg:text-right">
            Each one shot over months, in one place, on one lens.
          </p>
        </div>
      </section>

      {/* Pinned chapters, stepping graphite down to black. */}
      <section>
        {CHAPTERS.map((chapter) => (
          <article
            key={chapter.n}
            data-chapter
            className="step-panel flex min-h-[100dvh] flex-col justify-center px-5 py-20 text-[#F2EDE4] lg:px-8"
            style={{ ['--step-color' as string]: chapter.tone }}
          >
            <div data-chapter-inner className="mx-auto w-full max-w-[1400px]">
              <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
                <div>
                  <p className="text-[13px] uppercase tracking-[0.22em] text-[#C8791E]">
                    {chapter.place} {chapter.year}
                  </p>

                  <div className="mt-6 flex items-start justify-between gap-6">
                    <h3 className="max-w-[11ch] text-balance text-[13vw] font-medium leading-[0.9] tracking-[-0.045em] lg:text-[4.6vw]">
                      {chapter.title}
                    </h3>
                    <span className="text-[13vw] font-medium leading-[0.8] tracking-[-0.05em] text-[#F2EDE4]/25 lg:text-[5vw]">
                      {chapter.n}
                    </span>
                  </div>

                  <div className="mt-10 grid border-t border-[#F2EDE4]/20 sm:grid-cols-2">
                    {chapter.meta.map((m, mi) => (
                      <p
                        key={m}
                        className={`py-4 text-[15px] text-[#F2EDE4]/75 sm:py-5 ${
                          mi === 0 ? 'sm:border-r sm:border-[#F2EDE4]/20 sm:pr-8' : 'sm:pl-8'
                        }`}
                      >
                        {m}
                      </p>
                    ))}
                  </div>

                  <p className="mt-8 max-w-[32ch] text-2xl leading-[1.25] tracking-[-0.02em] text-[#F2EDE4]/45 lg:text-[1.8rem]">
                    <span className="text-[#F2EDE4]">{chapter.note} </span>
                    {chapter.rest}
                  </p>

                  <Link
                    href="/galleries"
                    className="mt-10 inline-flex w-fit items-center gap-2 rounded-full border border-[#F2EDE4]/30 px-7 py-3.5 text-[15px] font-medium text-[#F2EDE4] transition-colors hover:bg-[#F2EDE4] hover:text-[#0E0D0C]"
                  >
                    View series
                    <ArrowUpRight size={17} />
                  </Link>
                </div>

                <img
                  src={`https://picsum.photos/seed/${chapter.seed}/1100/1300`}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="aspect-[4/5] w-full rounded-[20px] object-cover lg:aspect-[5/6]"
                />
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* Information: rail label, oversized headline, disclosure rows. */}
      <section className="mx-auto max-w-[1400px] px-5 py-24 lg:px-8 lg:py-32">
        <div className="grid gap-8 lg:grid-cols-[220px_1fr] lg:gap-16">
          <p className="text-[15px] text-muted-foreground">Information</p>
          <div className="lg:border-l lg:border-border lg:pl-16">
            <h2
              data-reveal
              className="max-w-[15ch] text-balance text-[10vw] font-medium leading-[0.92] tracking-[-0.04em] lg:text-[5vw]"
            >
              Prints, commissions, licensing.
            </h2>

            <ul className="mt-16">
              {INFO.map((item, i) => {
                const open = openInfo === i;
                return (
                  <li key={item.q} className="border-t border-border last:border-b">
                    <button
                      type="button"
                      onClick={() => setOpenInfo(open ? null : i)}
                      aria-expanded={open}
                      className="flex w-full items-center justify-between gap-6 py-6 text-left text-lg tracking-[-0.01em] lg:text-xl"
                    >
                      {item.q}
                      <Plus
                        size={20}
                        className={`shrink-0 text-muted-foreground transition-transform duration-300 ${
                          open ? 'rotate-45' : ''
                        }`}
                      />
                    </button>
                    <div
                      className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                        open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="max-w-[62ch] pb-7 leading-relaxed text-muted-foreground">{item.a}</p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      <footer className="px-3 pb-3">
        <div className="rounded-[32px] bg-secondary px-6 py-14 lg:px-12 lg:py-20">
          <div className="mx-auto grid max-w-[1400px] gap-14 lg:grid-cols-[1.4fr_1fr]">
            <p className="text-[11vw] font-medium leading-[0.85] tracking-[-0.045em] lg:text-[5.5vw]">
              {PHOTOGRAPHER.name}
            </p>
            <div className="grid grid-cols-2 gap-8 text-[15px] lg:justify-self-end">
              <ul className="space-y-3">
                <li>
                  <Link href="/galleries" className="text-muted-foreground hover:text-foreground">
                    Work
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-muted-foreground hover:text-foreground">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-muted-foreground hover:text-foreground">
                    Contact
                  </Link>
                </li>
              </ul>
              <ul className="space-y-3">
                <li>
                  <Link href="/contact" className="text-muted-foreground hover:text-foreground">
                    Prints
                  </Link>
                </li>
                <li>
                  <Link href="/galleries" className="text-muted-foreground hover:text-foreground">
                    Archive
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mx-auto mt-16 flex max-w-[1400px] flex-col gap-2 text-[13px] text-muted-foreground md:flex-row md:justify-between">
            <p>© {new Date().getFullYear()} {PHOTOGRAPHER.name}. All rights reserved.</p>
            <p>Open to commissions.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
