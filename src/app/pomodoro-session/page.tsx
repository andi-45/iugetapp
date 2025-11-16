// src/app/pomodoro-session/page.tsx
import { Suspense } from 'react';
import { PageLoader } from '@/components/page-loader';
import { PomodoroClient } from './pomodoro-client';

export default function PomodoroPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <PomodoroClient />
    </Suspense>
  );
}
