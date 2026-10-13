import { getSite } from '@/content/data';
import { SocialIcon } from './SocialIcon';

/** Editorial footer: © on the left, a way back up on the right. Pushed to the bottom of the screen (see the layout). */
export async function SiteFooter() {
  const site = await getSite();
  return (
    <footer data-site-chrome className="mt-auto flex items-baseline justify-between px-(--edge) pt-24 pb-6 text-xs text-muted">
      <span>
        © {site.name} {new Date().getFullYear()}
      </span>
      {/* fixed, so it is on screen on every page, on the same right edge as the menu */}
      <nav aria-label="Social" className="fixed right-(--edge) bottom-5 z-40 flex items-center gap-5 text-text md:bottom-7">
        {site.socials.map(({ label, href }) => (
          <a key={href} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label} className="ulink">
            <SocialIcon label={label} />
          </a>
        ))}
      </nav>
    </footer>
  );
}
