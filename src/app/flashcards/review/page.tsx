// src/app/flashcards/review/page.tsx
'use client';

import { Suspense, useEffect, useState, useRef, useCallback } from 'react';
import { notFound, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Check, Loader2, RotateCw, Shuffle, X } from 'lucide-react';
import { getFlashcardDeckById, type FlashcardDeck, type Card as Flashcard, getUserProgress, updateUserProgress, addPointsForActivity } from '@/services/flashcard-service';
import { getSubjectIcon } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { addHistoryItem } from '@/services/history-service';

function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function ReviewContent() {
    const searchParams = useSearchParams();
    const { user } = useAuth();
    const id = searchParams.get('id');

    const [deck, setDeck] = useState<FlashcardDeck | null>(null);
    const [reviewCards, setReviewCards] = useState<Flashcard[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [progress, setProgress] = useState<Record<string, 'learning' | 'mastered'>>({});
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    
    // State to prevent spamming answer buttons
    const [isAnswering, setIsAnswering] = useState(false);

    const fetchDeckData = useCallback(() => {
        if (id && user) {
            setIsLoading(true);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            Promise.all([
                getFlashcardDeckById(id),
                getUserProgress(user.uid, id)
            ]).then(([deckData, progressData]) => {
                if (!deckData) {
                    notFound();
                    return;
                }
                setDeck(deckData);
                setReviewCards(shuffleArray(deckData.cards));
                setProgress(progressData);
                setCurrentIndex(0);
                setIsFlipped(false);
                setIsAnswering(false);
                setIsLoading(false);
                
                // Add to history
                addHistoryItem(user.uid, {
                    type: 'flashcard',
                    title: `Révision: ${deckData.title}`,
                    link: `/flashcards/review?id=${deckData.id}`
                });
            });
        }
    }, [id, user]);

    useEffect(() => {
        fetchDeckData();
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [fetchDeckData]);

    const handleAnswer = async (knewIt: boolean) => {
        if (!user || !deck || isAnswering) return;

        setIsAnswering(true); // Disable buttons
        const currentCard = reviewCards[currentIndex];
        const newStatus = knewIt ? 'mastered' : 'learning';
        
        // Optimistically update progress
        setProgress(prev => ({...prev, [currentCard.id]: newStatus}));

        // Update progress in the background
        await updateUserProgress(user.uid, deck.id, currentCard.id, newStatus);
        
        // Add points if the user mastered the card
        if (newStatus === 'mastered') {
            await addPointsForActivity(user.uid, 'flashcard_review');
        }

        // Flip the card to show the answer
        setIsFlipped(true);

        // After a delay, move to the next card
        timeoutRef.current = setTimeout(() => {
            setIsFlipped(false); // Flip back for the next card
            if (currentIndex < reviewCards.length - 1) {
                setCurrentIndex(currentIndex + 1);
            } else {
                // End of session, reshuffle
                handleShuffle();
            }
            setIsAnswering(false); // Re-enable buttons
        }, 1500); // 1.5 second delay to see the answer
    };
    
    const handleShuffle = () => {
        if(!deck) return;
        setReviewCards(shuffleArray(deck.cards));
        setCurrentIndex(0);
        setIsFlipped(false);
        setIsAnswering(false);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }
    
    if (isLoading) {
        return <div className="flex-1 flex justify-center items-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!deck) {
        notFound();
    }

    const currentCard = reviewCards[currentIndex];
    const SubjectIcon = getSubjectIcon(deck.subjectName);

    const masteredCount = Object.values(progress).filter(status => status === 'mastered').length;
    const progressPercentage = (masteredCount / deck.cards.length) * 100;

    return (
        <div className="flex-1 flex flex-col space-y-4 md:space-y-6 p-4 md:p-8">
             <header>
                <div className="flex items-start justify-between">
                    <div>
                        <Button asChild variant="outline" size="sm" className="mb-4">
                            <Link href="/flashcards">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Retour aux paquets
                            </Link>
                        </Button>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-secondary rounded-lg"><SubjectIcon className="h-8 w-8 text-secondary-foreground" /></div>
                            <div>
                                <h2 className="text-base font-semibold text-primary">{deck.subjectName}</h2>
                                <h1 className="text-3xl md:text-4xl font-headline font-bold">{deck.title}</h1>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <Button variant="outline" onClick={handleShuffle}><Shuffle className="mr-2 h-4 w-4" /> Mélanger</Button>
                    </div>
                </div>
            </header>

            <div className="w-full max-w-2xl mx-auto">
                <Progress value={progressPercentage} className="h-2 mb-2"/>
                <p className="text-xs text-muted-foreground text-center">{masteredCount} / {deck.cards.length} maîtrisées</p>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center">
                <div className="w-full max-w-2xl h-80" style={{ perspective: '1000px' }}>
                    <div 
                        className={cn("w-full h-full relative transition-transform duration-700", isFlipped && "rotate-y-180")}
                        style={{ transformStyle: 'preserve-3d' }}
                    >
                        {/* Question Side */}
                        <Card className="absolute w-full h-full" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
                           <CardContent className="flex items-center justify-center h-full p-6 text-center">
                               <p className="text-2xl font-semibold">{currentCard?.question}</p>
                           </CardContent>
                        </Card>
                        

                        {/* Answer Side */}
                         <Card className="absolute w-full h-full bg-secondary" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                            <CardContent className="flex items-center justify-center h-full p-6 text-center">
                                <p className="text-xl">{currentCard?.answer}</p>
                            </CardContent>
                         </Card>
                    </div>
                </div>

                <div className="mt-8 flex w-full max-w-2xl justify-around gap-4">
                     <Button variant="destructive" size="lg" className="w-40 h-16 text-base" onClick={() => handleAnswer(false)} disabled={isAnswering}>
                        <X className="mr-2 h-5 w-5"/> À revoir
                    </Button>
                     <Button variant="default" size="lg" className="w-40 h-16 text-base bg-green-600 hover:bg-green-700" onClick={() => handleAnswer(true)} disabled={isAnswering}>
                        <Check className="mr-2 h-5 w-5"/> Je sais
                    </Button>
                </div>
            </div>

            <style jsx>{`
                .rotate-y-180 { transform: rotateY(180deg); }
            `}</style>
        </div>
    );
}

export default function ReviewPage() {
    return (
        <Suspense fallback={<div className="flex-1 flex justify-center items-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <ReviewContent />
        </Suspense>
    );
}
