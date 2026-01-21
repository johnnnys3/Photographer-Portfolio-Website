/**
 * MIGRATION NOTE:
 * Source: src/App.tsx (about page section)
 * Destination: app/about/page.tsx
 * This page converts the about page from state-based routing to Next.js App Router.
 * The AboutPage component logic is preserved exactly from the original implementation.
 * Any deviation is unintentional and should be flagged.
 */

'use client';

import { Navigation } from '@/components/Navigation';
import { AboutPage } from '@/components/AboutPage';
import { PageErrorBoundary, ComponentErrorBoundary } from '@/components/ErrorBoundary';

export default function About() {
  return (
    <div className="min-h-screen bg-white dark:bg-black w-full">
      {/* Navigation */}
      <ComponentErrorBoundary componentName="Navigation">
        <Navigation currentPage="about" />
      </ComponentErrorBoundary>

      {/* Page Content */}
      <PageErrorBoundary context="about">
        <AboutPage />
      </PageErrorBoundary>
    </div>
  );
}
