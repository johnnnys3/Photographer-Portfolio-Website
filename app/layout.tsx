/**
 * MIGRATION NOTE:
 * Source: index.html + src/main.tsx
 * Destination: app/layout.tsx
 * This layout converts the HTML template and React root structure to Next.js App Router layout.
 * The body structure and meta tags are preserved from the original HTML.
 * Any deviation is unintentional and should be flagged.
 */

import './globals.css';
import { Metadata, Viewport } from 'next';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AuthProvider } from '@/contexts/AuthContext';
import { DataProvider } from '@/contexts/DataContext';

export const metadata: Metadata = {
  title: 'Photographer Portfolio Website',
  // Content-Security-Policy is handled in next.config.js headers
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
  maximumScale: 5.0,
  userScalable: true,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white dark:bg-black w-full transition-colors duration-300">
        <ErrorBoundary context="Application Root">
          <AuthProvider>
            <DataProvider>
              {children}
            </DataProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
