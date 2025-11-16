import { Suspense } from 'react';
import { AiTutorClient } from "./ai-tutor-client";

export default function AiTutorPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full">Chargement du Tuteur IA...</div>}>
      <AiTutorClient />
    </Suspense>
  );
}
