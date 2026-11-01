import Link from 'next/link';
import { getSite } from '@/content/data';

export const metadata = { title: 'Page not found' };

export default async function NotFound() {
  const site = await getSite();
  return (
    <section className="flex min-h-[70svh] flex-col items-center justify-center px-(--edge) text-center">
      <h1 className="font-normal">{site.notFoundLine}</h1>
      <Link href="/" className="ulink mt-4 text-muted">
        Return home
      </Link>
    </section>
  );
}
