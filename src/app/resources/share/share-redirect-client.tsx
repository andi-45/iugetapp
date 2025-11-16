
// src/app/resources/share/share-redirect-client.tsx
'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Resource } from '@/services/resource-service';
import { VideoResourceViewer } from '@/app/resources/video-resource-viewer';
import { PageLoader } from '@/components/page-loader';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface ShareRedirectClientProps {
  resource: Resource;
}

export function ShareRedirectClient({ resource }: ShareRedirectClientProps) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (user) {
        if (resource.type !== 'VIDEO') {
          const viewerUrl = `/viewer?url=${encodeURIComponent(resource.url)}&title=${encodeURIComponent(resource.title)}`;
          router.replace(viewerUrl);
        } else {
          // If it's a video, we will render the VideoResourceViewer directly
          setIsReady(true);
        }
      } else {
        // If not logged in, we are ready to show the login alert
        setIsReady(true);
      }
    }
  }, [user, loading, resource, router]);


  if (!isReady || loading) {
    return <PageLoader />;
  }

  // If user is authenticated and it's a video, render the viewer which handles its own dialog
  if (user && resource.type === 'VIDEO') {
    return (
       <div className="h-screen w-screen bg-background flex items-center justify-center">
         <VideoResourceViewer resource={resource} defaultOpen={true} />
      </div>
    );
  }

  // If user is not authenticated, show login wall
  if (!user) {
     return (
        <div className="h-screen w-screen bg-secondary">
            <AlertDialog open={true}>
                <AlertDialogContent>
                    <AlertDialogHeader className="text-center items-center">
                        <div className="p-4 bg-primary/10 rounded-full">
                            <Lock className="h-8 w-8 text-primary" />
                        </div>
                        <AlertDialogTitle>Contenu Exclusif</AlertDialogTitle>
                        <AlertDialogDescription>
                            Cette ressource est uniquement accessible aux utilisateurs de OnBuch.
                            Veuillez vous connecter pour y accéder.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex flex-col gap-2">
                        <Button asChild>
                            <Link href={`/login?redirect=/resources/share?id=${resource.id}`}>Se connecter</Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link href="/">Retour à l'accueil</Link>
                        </Button>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </div>
      );
  }

  // Fallback loader while redirecting for non-video types
  return <PageLoader />;
}
