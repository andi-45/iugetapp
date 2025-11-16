// src/app/admin/flashcards/page.tsx
'use client'

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, PlusCircle, Edit, Trash2, Loader2, Layers } from "lucide-react"
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { getFlashcardDecks, deleteFlashcardDeck, type FlashcardDeck } from "@/services/flashcard-service";


export default function AdminFlashcardsPage() {
    const [decks, setDecks] = useState<FlashcardDeck[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchDecks = async () => {
        setIsLoading(true);
        const items = await getFlashcardDecks({ includePrivate: true });
        setDecks(items);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchDecks();
    }, []);

    const handleDelete = async (id: string) => {
        try {
            await deleteFlashcardDeck(id);
            toast({ title: "Paquet supprimé", description: `Le paquet de flashcards a été supprimé.` });
            fetchDecks();
        } catch (error) {
            toast({ title: "Erreur", description: "Impossible de supprimer le paquet.", variant: "destructive" });
        }
    }

    return (
        <div className="flex-1 space-y-8">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-headline font-bold">Gestion des Flashcards</h1>
                    <p className="text-muted-foreground mt-2">
                        Créez et organisez des paquets de flashcards pour les élèves.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/admin/flashcards/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Créer un paquet
                    </Link>
                </Button>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>Liste des Paquets</CardTitle>
                    <CardDescription>
                        Gérez tous les paquets de flashcards (publics et privés).
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead><Layers className="h-5 w-5"/></TableHead>
                                <TableHead>Titre</TableHead>
                                <TableHead>Matière</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead>Cartes</TableHead>
                                <TableHead>
                                    <span className="sr-only">Actions</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center">
                                        <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                                    </TableCell>
                                </TableRow>
                            ) : decks.length > 0 ? decks.map((deck) => (
                                <TableRow key={deck.id}>
                                    <TableCell><Layers className="h-5 w-5 text-primary"/></TableCell>
                                    <TableCell className="font-medium">{deck.title}</TableCell>
                                    <TableCell>{deck.subjectName}</TableCell>
                                    <TableCell>
                                        <Badge variant={deck.isPublic ? 'default' : 'secondary'}>
                                            {deck.isPublic ? 'Public' : 'Privé'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{deck.cards.length}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/admin/flashcards/edit?id=${deck.id}`}><Edit className="mr-2 h-4 w-4" />Modifier</Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <div className="flex items-center w-full"><Trash2 className="mr-2 h-4 w-4" />Supprimer</div>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Cette action est irréversible et supprimera ce paquet de flashcards.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDelete(deck.id)}>
                                                                    Confirmer
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">Aucun paquet de flashcards trouvé.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
