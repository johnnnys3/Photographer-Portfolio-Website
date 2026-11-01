import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Bebas_Neue } from 'next/font/google';
import { getNavLinks, getSite } from '@/content/data';
import { SiteProvider } from '@/components/SiteProvider';
import { Header } from '@/components/layout/Header';
import { SiteFooter } from '@/components/layout/SiteFooter';

// Content comes from Supabase; pages are static and refresh at most once a minute (or on admin save).
export const revalidate = 60;

// One typeface for the whole site, the same one as the name in the header.
const sans = Bebas_Neue({ subsets: ['latin'], weight: '400', variable: '--nf-sans', display: 'swap' });

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  return {
    metadataBase: new URL(site.url),
    openGraph: { type: 'website', siteName: site.name },
    twitter: { card: 'summary_large_image' },
    title: { default: `${site.name} — Photographer`, template: `%s — ${site.name}` },
    description:
      site.seoDescription ||
      `${site.name} is a photographer based in ${site.city}, ${site.country}. Selected series, exhibitions and publications.`,
  };
}

export const viewport: Viewport = { themeColor: '#FCFCFA' };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [site, links] = await Promise.all([getSite(), getNavLinks()]);

  return (
    <html lang="en" className={sans.variable} suppressHydrationWarning>
      <head>
        {/* Ask AI crawlers not to train on the photographs */}
        <meta name="robots" content="noai, noimageai" />
      </head>
      <body className="flex min-h-svh flex-col">
        <SiteProvider site={site}>
          <a href="#main" className="skip-link">
            Skip to content
          </a>
          <Header links={links} />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </SiteProvider>
      </body>
    </html>
  );
}
