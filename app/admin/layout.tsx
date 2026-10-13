import type { Metadata } from 'next';

// Private area: kept out of search results (robots.txt also disallows it).
export const metadata: Metadata = { title: 'Admin', robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
