'use client';

import type { DatabaseImage } from '../lib/supabase';
import { PHOTOGRAPHER } from './siteIdentity';

interface EditorialHeroProps {
  backdrop?: DatabaseImage;
  portrait?: DatabaseImage;
}

const BACKDROP_FALLBACK = 'https://picsum.photos/seed/hero-backdrop-darkroom/1600/1000';
const PORTRAIT_FALLBACK = 'https://picsum.photos/seed/hero-portrait-standing/900/1300';

const FOOTER_LEFT = ['Visuals composer', 'Documentary photographer', 'Printing since 2013'];

export function EditorialHero({ backdrop, portrait }: EditorialHeroProps) {
  const [first, last] = PHOTOGRAPHER.name.split(' ');

  return (
    <section className="relative h-[100dvh] w-full overflow-hidden">
      {/* Full-bleed backdrop. */}
      <img
        src={backdrop?.url || BACKDROP_FALLBACK}
        alt=""
        fetchPriority="high"
        decoding="async"
        onError={(e) => {
          const el = e.currentTarget;
          if (el.dataset.fallback) return;
          el.dataset.fallback = '1';
          el.src = BACKDROP_FALLBACK;
        }}
        className="anim-fade-in absolute inset-0 h-full w-full object-cover"
      />
      {/* Scrim under the name so cream type holds against any backdrop. */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80" />

      {/* Giant name, running behind the portrait. */}
      <div
        className="anim-fade-up absolute inset-x-0 top-[16vh] z-10 overflow-hidden sm:top-[14vh]"
        style={{ animationDelay: '500ms' }}
      >
        <div className="marquee-name flex w-max whitespace-nowrap text-[16vh] font-medium leading-none tracking-[-0.03em] text-[#efeee9] sm:text-[26vh]">
          <span className="pr-[6vw]">
            {first} &mdash; {last}&nbsp;
          </span>
          <span className="pr-[6vw]">
            {first} &mdash; {last}&nbsp;
          </span>
        </div>
      </div>

      {/* Portrait sits over the name so the letters read behind its edges. */}
      <img
        src={portrait?.url || PORTRAIT_FALLBACK}
        alt="Portrait"
        decoding="async"
        onError={(e) => {
          const el = e.currentTarget;
          if (el.dataset.fallback) return;
          el.dataset.fallback = '1';
          el.src = PORTRAIT_FALLBACK;
        }}
        style={{
          animationDelay: '300ms',
          // Stands in for a true cutout: edges dissolve so the marquee shows through.
          WebkitMaskImage:
            'radial-gradient(72% 82% at 50% 62%, #000 52%, transparent 88%), linear-gradient(to top, #000 62%, transparent 100%)',
          maskImage:
            'radial-gradient(72% 82% at 50% 62%, #000 52%, transparent 88%), linear-gradient(to top, #000 62%, transparent 100%)',
          WebkitMaskComposite: 'source-in',
          maskComposite: 'intersect',
        }}
        className="anim-rise-in pointer-events-none absolute inset-0 z-20 h-full w-full object-cover"
      />

      {/* Second scrim, above the portrait, so the chrome keeps contrast at the edges. */}
      <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-b from-black/55 via-transparent to-black/75" />

      {/* Rule above the footer, drawn from the left. */}
      <div
        className="anim-line absolute inset-x-6 bottom-[5.5rem] z-30 h-0.5 bg-[#efeee9] sm:inset-x-10 sm:bottom-28"
        style={{ animationDelay: '1200ms' }}
      />

      <div className="absolute inset-x-0 bottom-0 z-30 flex items-end justify-between px-6 pb-5 text-xs leading-relaxed text-[#efeee9] sm:px-10 sm:pb-8 sm:text-sm">
        <div className="anim-fade-up" style={{ animationDelay: '1400ms' }}>
          {FOOTER_LEFT.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
        <div className="anim-fade-up text-right" style={{ animationDelay: '1550ms' }}>
          <p>Currently shooting</p>
          <p>Lagos and Accra</p>
        </div>
      </div>
    </section>
  );
}
