// src/app/admin/flashcards/edit/page.tsx
'use client'

import { notFound, useSearchParams } from 'next/navigation';
import { getFlashcardDeckById, type FlashcardDeck } from '@/services/flashcard-service';
import { FlashcardForm } from '../flashcard-form';
import { useEffect, useState, Suspense } from 'react';
import { Loader2 } from 'lucide-react';


function EditDeckContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const [deck, setDeck] = useState<FlashcardDeck | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if(id) {
            getFlashcardDeckById(id).then(data => {
                if(!data) notFound();
                setDeck(data);
                setIsLoading(false);
            });
        } else {
            setIsLoading(false);
        }
    }, [id]);

    if(isLoading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin" /></div>;
    }
    
    if(!id || !deck) {
        return notFound();
    }

    return (
        <div className="flex-1 space-y-8">
            <header>
                <h1 className="text-4xl font-headline font-bold">Modifier le Paquet</h1>
                <p className="text-muted-foreground mt-2">
                    Mettez à jour les informations pour : "{deck.title}"
                </p>
            </header>
            <FlashcardForm deck={deck} />
        </div>
    )
}

export default function EditFlashcardDeckPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-64"><Loader2 className="animate-spin" /></div>}>
            <EditDeckContent />
        </Suspense>
    )
}
