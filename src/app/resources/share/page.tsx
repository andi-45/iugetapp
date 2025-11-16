
// src/app/resources/share/page.tsx
'use client'

import { getResourceById, type Resource } from '@/services/resource-service';
import { notFound, useSearchParams } from 'next/navigation';
import { ShareRedirectClient } from './share-redirect-client';
import { Suspense, useEffect, useState } from 'react';
import { PageLoader } from '@/components/page-loader';


function ShareContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [resource, setResource] = useState<Resource | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
        getResourceById(id).then(data => {
            if(!data) notFound();
            setResource(data);
            setIsLoading(false);
        });
    } else {
      setIsLoading(false);
      notFound();
    }
  }, [id]);

  if (isLoading || !resource) {
    return <PageLoader />;
  }

  return <ShareRedirectClient resource={resource} />;
}

export default function SharePage() {
    return (
        <Suspense fallback={<PageLoader />}>
          <ShareContent />
        </Suspense>
      );
}
