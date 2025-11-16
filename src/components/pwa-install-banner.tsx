// src/components/pwa-install-banner.tsx
'use client'

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from './ui/button';
import { Share, X, Smartphone, Apple } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"

export function PWAInstallBanner() {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [isVisible, setIsVisible] = useState(false);
  const [isIosInstallDialogOpen, setIosInstallDialogOpen] = useState(false);

  useEffect(() => {
    // This component is now disabled, so we don't run the logic.
    // If you want to re-enable it, remove the early return.
    return;

    /*
    if (typeof window !== 'undefined') {
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        
        if (isMobile && !isStandalone && pathname === '/') {
            const timer = setTimeout(() => setIsVisible(true), 5000); 
            return () => clearTimeout(timer);
        }
    }
    
    setIsVisible(false);
    */

  }, [isMobile, pathname]);
  
  const handleAndroidDownload = () => {
    window.location.href = '/OnBuchApp.apk';
  };

  const handleIosInstall = () => {
    setIosInstallDialogOpen(true);
  };
  
  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-lg z-[999] bg-background border shadow-lg rounded-lg p-3 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
        <div className="flex-1">
            <h4 className="font-semibold text-sm">Installer l'application OnBuch</h4>
            <p className="text-xs text-muted-foreground">Accès rapide et expérience hors ligne.</p>
        </div>
        <div className="flex items-center gap-2">
            <Button size="icon" className="rounded-full bg-[#3DDC84] hover:bg-[#3DDC84]/90" onClick={handleAndroidDownload}>
              <Smartphone className="h-6 w-6" />
            </Button>
            <Button size="icon" className="rounded-full bg-black hover:bg-black/90" onClick={handleIosInstall}>
              <Apple className="h-6 w-6" />
            </Button>
        </div>
        <Button variant="ghost" size="icon" onClick={handleDismiss} className="h-7 w-7 rounded-full">
            <X className="h-4 w-4" />
        </Button>
      </div>

      <AlertDialog open={isIosInstallDialogOpen} onOpenChange={setIosInstallDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Installer OnBuch sur iOS</AlertDialogTitle>
            <AlertDialogDescription>
              Pour installer l'application sur votre appareil Apple, suivez ces étapes simples :
            </AlertDialogDescription>
          </AlertDialogHeader>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Appuyez sur l'icône de partage <Share className="inline-block h-4 w-4 mx-1" /> dans la barre d'outils de Safari.</li>
            <li>Faites défiler vers le bas et sélectionnez <strong>"Ajouter à l'écran d'accueil"</strong>.</li>
            <li>Confirmez en appuyant sur "Ajouter".</li>
          </ol>
          <AlertDialogFooter>
            <AlertDialogCancel>Fermer</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
