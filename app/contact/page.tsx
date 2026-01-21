/**
 * MIGRATION NOTE:
 * Source: src/App.tsx (contact page section)
 * Destination: app/contact/page.tsx
 * This page converts the contact page from state-based routing to Next.js App Router.
 * The ContactPage component logic is preserved exactly from the original implementation.
 * Any deviation is unintentional and should be flagged.
 */

'use client';

import { Navigation } from '@/components/Navigation';
import { ContactPage } from '@/components/ContactPage';
import { PageErrorBoundary, ComponentErrorBoundary } from '@/components/ErrorBoundary';

export default function Contact() {
  return (
    <div className="min-h-screen bg-white dark:bg-black w-full">
      {/* Navigation */}
      <ComponentErrorBoundary componentName="Navigation">
        <Navigation currentPage="contact" />
      </ComponentErrorBoundary>

      {/* Page Content */}
      <PageErrorBoundary context="contact">
        <ContactPage />
      </PageErrorBoundary>
    </div>
  );
}
