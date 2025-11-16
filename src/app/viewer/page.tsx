
// src/app/viewer/page.tsx
'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, AlertTriangle, Download, Gem, ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';

function PremiumDialog() {
    return (
        <AlertDialogContent>
            <AlertDialogHeader>
                <div className="flex justify-center mb-4">
                    <div className="p-4 bg-purple-100 rounded-full">
                        <Gem className="h-10 w-10 text-purple-600" />
                    </div>
                </div>
                <AlertDialogTitle className="text-center text-2xl font-bold">Devenez Premium</AlertDialogTitle>
                <AlertDialogDescription className="text-center">
                    Pour télécharger ce document, passez au mode Premium et accédez à des fonctionnalités exclusives !
                </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-2 text-center">
                <p><span className="font-bold">2000 XAF</span> / mois</p>
                <p><span className="font-bold">500 XAF</span> / semaine</p>
                <p><span className="font-bold">5,000 XAF</span> / année scolaire</p>
            </div>
            <AlertDialogFooter className="sm:flex-col sm:space-x-0 gap-2">
                 <p className="text-sm text-center text-muted-foreground">Contactez-nous pour activer votre abonnement :</p>
                 <Button asChild size="lg" className="w-full">
                    <a href="https://wa.me/237696191611?text=Bonjour,%20je%20souhaite%20activer%20mon%20abonnement%20Premium%20OnBuch." target="_blank" rel="noopener noreferrer">
                        Contacter via WhatsApp (691 12 84 22)
                    </a>
                 </Button>
                 <AlertDialogCancel>Annuler</AlertDialogCancel>
            </AlertDialogFooter>
        </AlertDialogContent>
    )
}

function DocViewer() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuth();
    const { toast } = useToast();
    const [isDownloading, setIsDownloading] = useState(false);

    const docUrl = searchParams.get('url');
    const docTitle = searchParams.get('title') || 'document';

    if (!docUrl) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-destructive p-4 text-center">
                <AlertTriangle className="h-12 w-12" />
                <h2 className="text-2xl font-semibold">URL du document manquante</h2>
                <p className="text-destructive/80">Impossible d'afficher le document car l'URL n'a pas été fournie.</p>
                <Button variant="outline" onClick={() => router.back()}>Retour</Button>
            </div>
        );
    }

    const isPdf = docUrl.toLowerCase().endsWith('.pdf');
    const isImage = ['.png', '.jpg', '.jpeg', '.gif', '.webp'].some(ext => docUrl.toLowerCase().endsWith(ext));
    const googleViewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(docUrl)}&embedded=true`;

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            const response = await fetch(docUrl);
            if (!response.ok) throw new Error(`Le téléchargement a échoué: ${response.statusText}`);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = docTitle || docUrl.split('/').pop() || 'download';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            toast({ title: "Téléchargement réussi", description: "Le document a été enregistré." });
        } catch (error: any) {
            toast({ title: "Erreur de téléchargement", description: "Ouverture dans un nouvel onglet pour sauvegarde manuelle.", variant: 'destructive' });
            window.open(docUrl, '_blank');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="h-screen w-screen flex flex-col bg-gray-100 dark:bg-gray-900">
            <header className="flex-shrink-0 bg-background p-2 px-4 shadow-sm z-10 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 min-w-0">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="font-semibold text-lg truncate" title={docTitle}>
                        {docTitle}
                    </h1>
                </div>
                 {user?.isPremium ? (
                     <Button onClick={handleDownload} disabled={isDownloading} size="sm">
                        {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                        Enregistrer
                    </Button>
                ) : (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                             <Button size="sm">
                                <Download className="mr-2 h-4 w-4" />
                                Enregistrer
                            </Button>
                        </AlertDialogTrigger>
                        <PremiumDialog />
                    </AlertDialog>
                )}
            </header>

            <main className="flex-grow min-h-0 bg-gray-200 dark:bg-gray-800">
                 {isImage ? (
                    <div className="w-full h-full flex items-center justify-center p-4">
                        <div className="relative w-full h-full">
                            <Image src={docUrl} alt={docTitle} layout="fill" objectFit="contain" />
                        </div>
                    </div>
                ) : (isPdf || docUrl.startsWith('http')) ? (
                     <iframe src={googleViewerUrl} className="w-full h-full" frameBorder="0" title={docTitle} />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-muted-foreground p-4 text-center">
                        <AlertTriangle className="h-12 w-12" />
                        <h2 className="text-2xl font-semibold">Format non pris en charge pour l'aperçu</h2>
                        <p>Ce type de fichier ne peut pas être prévisualisé directement. Vous pouvez le télécharger pour le consulter.</p>
                    </div>
                )}
            </main>
        </div>
    );
}

export default function ViewerPage() {
    return (
        <Suspense fallback={
            <div className="h-screen w-screen flex flex-col items-center justify-center gap-4 text-muted-foreground">
                <Loader2 className="h-12 w-12 animate-spin" />
                <p className="text-lg">Chargement du lecteur...</p>
            </div>
        }>
            <DocViewer />
        </Suspense>
    );
}
