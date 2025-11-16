// src/app/ia-tools/chat/page.tsx
'use client';

import { Suspense } from 'react';
import { AgentChatClient } from "./agent-chat-client";
import { PageLoader } from '@/components/page-loader';

export default function AgentChatPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <AgentChatClient />
    </Suspense>
  );
}
