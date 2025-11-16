// src/app/flashcards/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getFlashcardDecks, type FlashcardDeck } from "@/services/flashcard-service";
import { Layers, ListFilter, Search, Loader2, PlusCircle, BookCopy, Lock, Gem, Phone } from "lucide-react";
import { useAuth } from '@/hooks/use-auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSubjectIcon } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { UserFlashcardForm } from './user-flashcard-form'; // Simplified form for users
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from "@/components/ui/alert-dialog";

function DeckItem({ deck, onClick, disabled = false }: { deck: FlashcardDeck, onClick: () => void, disabled?: boolean }) {
    const Icon = getSubjectIcon(deck.subjectName);

    return (
        <Card 
            className="h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col data-[disabled=true]:opacity-50 data-[disabled=true]:pointer-events-none cursor-pointer" 
            data-disabled={disabled}
            onClick={onClick}
        >
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-full">
                        <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-lg font-headline">{deck.title}</CardTitle>
                        <CardDescription>{deck.subjectName}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-grow flex items-end justify-between">
                <Badge variant="secondary">{deck.cards.length} cartes</Badge>
                {!deck.isPublic && <Badge variant="outline">Privé</Badge>}
            </CardContent>
            {disabled && <div className="absolute inset-0 bg-background/60 flex items-center justify-center rounded-lg"><Lock className="h-8 w-8 text-foreground"/></div>}
        </Card>
    );
}

function PremiumPaywallDialog({ isOpen, onOpenChange }: { isOpen: boolean, onOpenChange: (open: boolean) => void }) {
    const whatsappUrl = `https://wa.me/237696191611?text=${encodeURIComponent("Bonjour, je suis intéressé par l'abonnement Premium OnBuch pour accéder aux flashcards.")}`;

    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <div className="flex justify-center mb-4">
                        <div className="p-4 bg-purple-100 rounded-full">
                            <Gem className="h-10 w-10 text-purple-600" />
                        </div>
                    </div>
                    <AlertDialogTitle className="text-center">Accès Premium Requis</AlertDialogTitle>
                    <AlertDialogDescription className="text-center">
                        Pour réviser ce paquet de flashcards, passez au mode Premium et débloquez toutes nos ressources exclusives !
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-col gap-2">
                    <Button asChild size="lg" className="w-full">
                        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                            <Phone className="mr-2 h-4 w-4"/> Devenir Premium
                        </a>
                    </Button>
                    <AlertDialogCancel>Plus tard</AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}


export default function FlashcardsPage() {
    const { user } = useAuth();
    const [allDecks, setAllDecks] = useState<FlashcardDeck[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isPaywallOpen, setPaywallOpen] = useState(false);

    const fetchDecks = useCallback(async () => {
        if (!user || !user.profile) return;
        setIsLoading(true);
        try {
            const decks = await getFlashcardDecks({ 
                forUserClass: { schoolClass: user.profile.schoolClass, series: user.profile.series },
                userId: user.uid,
            });
            setAllDecks(decks);
        } catch (error) {
            console.error("Failed to fetch decks:", error);
        } finally {
            setIsLoading(false);
        }
    }, [user]);
    
    useEffect(() => {
        fetchDecks();
    }, [fetchDecks]);

    const handleDeckClick = (deck: FlashcardDeck) => {
        if (deck.createdBy === user?.uid || user?.isPremium) {
            // Redirect to review page for private decks or if user is premium
            window.location.href = `/flashcards/review?id=${deck.id}`;
        } else {
            // Show paywall for public decks if user is not premium
            setPaywallOpen(true);
        }
    };
    
    const publicDecks = allDecks.filter(d => d.isPublic && d.createdBy !== user?.uid);
    const myDecks = allDecks.filter(d => d.createdBy === user?.uid);

    const filteredPublicDecks = publicDecks.filter(d => d.title.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredMyDecks = myDecks.filter(d => d.title.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="flex-1 space-y-8 p-4 md:p-8">
            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-headline font-bold text-gray-800 dark:text-white flex items-center gap-3">
                        <Layers className="h-10 w-10 text-primary"/>
                        Flashcards
                    </h1>
                    <p className="text-muted-foreground mt-2">Créez, révisez et maîtrisez vos cours avec des cartes mémoire.</p>
                </div>
                <Dialog open={isCreateModalOpen} onOpenChange={setCreateModalOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Créer un paquet
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                        <DialogHeader>
                            <DialogTitle>Créer un nouveau paquet de Flashcards</DialogTitle>
                            <DialogDescription>
                                Remplissez les détails et ajoutez vos cartes. Ce paquet sera privé par défaut.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="max-h-[70vh] overflow-y-auto p-1">
                           <UserFlashcardForm
                             onFinished={() => {
                                 setCreateModalOpen(false);
                                 fetchDecks(); // Refresh the lists
                             }}
                           />
                        </div>
                    </DialogContent>
                </Dialog>
            </header>

            <div className="relative w-full md:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                    placeholder="Rechercher un paquet..." 
                    className="pl-10" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <Tabs defaultValue="public" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="public">Paquets Publics</TabsTrigger>
                    <TabsTrigger value="my-decks">Mes Paquets</TabsTrigger>
                </TabsList>
                <TabsContent value="public" className="mt-6">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredPublicDecks.length > 0 ? filteredPublicDecks.map(deck => (
                                <DeckItem key={deck.id} deck={deck} onClick={() => handleDeckClick(deck)} />
                            )) : (
                                <div className="col-span-full text-center py-16 text-muted-foreground">
                                    <p>Aucun paquet public trouvé pour votre classe.</p>
                                </div>
                            )}
                        </div>
                    )}
                </TabsContent>
                <TabsContent value="my-decks" className="mt-6">
                     {isLoading ? (
                        <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>
                     ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredMyDecks.length > 0 ? filteredMyDecks.map(deck => (
                                <DeckItem key={deck.id} deck={deck} onClick={() => handleDeckClick(deck)} />
                            )) : (
                                <div className="col-span-full text-center py-16 text-muted-foreground">
                                    <p>Vous n'avez pas encore créé de paquets.</p>
                                    <Button variant="link" onClick={() => setCreateModalOpen(true)}>Créer votre premier paquet</Button>
                                </div>
                            )}
                        </div>
                     )}
                </TabsContent>
            </Tabs>
            <PremiumPaywallDialog isOpen={isPaywallOpen} onOpenChange={setPaywallOpen} />
        </div>
    );
}
