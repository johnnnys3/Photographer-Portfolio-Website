'use client';

import { Navigation } from '@/components/Navigation';
import { HomePage } from '@/components/HomePage';
import { PageErrorBoundary, ComponentErrorBoundary } from '@/components/ErrorBoundary';

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-background">
      {/* The header sits over the hero photograph, so it renders in cream. */}
      <ComponentErrorBoundary componentName="Navigation">
        <Navigation currentPage="home" overlay />
      </ComponentErrorBoundary>

      <PageErrorBoundary context="home">
        <HomePage />
      </PageErrorBoundary>
    </div>
  );
}
