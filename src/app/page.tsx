// src/app/page.tsx
import { DashboardClient } from '@/app/dashboard-client';
import { Suspense } from 'react';
import { PageLoader } from '@/components/page-loader';

export default function DashboardPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <DashboardClient />
    </Suspense>
  );
}
