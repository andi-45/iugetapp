// src/app/admin/videos/authors/page.tsx
'use client'

import { useState, useEffect } from "react";
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
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { getAuthors, deleteAuthor, type Author } from "@/services/video-service" 
import { MoreHorizontal, PlusCircle, Edit, Trash2, Loader2 } from "lucide-react"
import { AuthorForm } from "./author-form";
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
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type FormState = {
  mode: 'add' | 'edit';
  isOpen: boolean;
  author?: Author | null;
}

export default function AdminAuthorsPage() {
    const [authors, setAuthors] = useState<Author[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [formState, setFormState] = useState<FormState>({ mode: 'add', isOpen: false });
    const { toast } = useToast();

    const fetchAuthors = async () => {
        setIsLoading(true);
        const data = await getAuthors();
        setAuthors(data);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchAuthors();
    }, []);

    const handleOpenForm = (mode: FormState['mode'], author?: Author) => {
        setFormState({ mode, author, isOpen: true });
    }

    const handleCloseForm = (refresh: boolean) => {
        setFormState({ ...formState, isOpen: false });
        if (refresh) {
            fetchAuthors();
        }
    }
    
    const handleDelete = async (id: string, name: string) => {
        try {
            await deleteAuthor(id);
            toast({ title: "Auteur supprimé", description: `L'auteur "${name}" a été supprimé.` });
            fetchAuthors();
        } catch (error) {
            toast({ title: "Erreur", description: "Impossible de supprimer l'auteur.", variant: "destructive" });
        }
    }

    return (
        <div className="flex-1 space-y-8">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-headline font-bold">Gestion des Auteurs Vidéos</h1>
                    <p className="text-muted-foreground mt-2">
                        Ajoutez ou modifiez les créateurs de contenu vidéo.
                    </p>
                </div>
                <Button onClick={() => handleOpenForm('add')}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Ajouter un auteur
                </Button>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>Liste des Auteurs</CardTitle>
                    <CardDescription>
                        Gérez les profils des auteurs de vidéos.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-16">Image</TableHead>
                                <TableHead>Nom</TableHead>
                                <TableHead>
                                    <span className="sr-only">Actions</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center">
                                        <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                                    </TableCell>
                                </TableRow>
                            ) : authors.length > 0 ? (
                                authors.map((author) => (
                                    <TableRow key={author.id}>
                                        <TableCell>
                                            <Avatar>
                                                <AvatarImage src={author.imageUrl} alt={author.name} />
                                                <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                        </TableCell>
                                        <TableCell className="font-medium">{author.name}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button size="icon" variant="ghost">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onSelect={() => handleOpenForm('edit', author)}>
                                                        <Edit className="mr-2 h-4 w-4" /> Modifier
                                                    </DropdownMenuItem>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                                                <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                                                            </DropdownMenuItem>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Cette action est irréversible et supprimera l'auteur "{author.name}".
                                                            </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDelete(author.id, author.name)}>
                                                                Confirmer
                                                            </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                                        Aucun auteur trouvé.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {formState.isOpen && (
                <AuthorForm
                    mode={formState.mode}
                    isOpen={formState.isOpen}
                    onClose={handleCloseForm}
                    author={formState.author}
                />
            )}
        </div>
    )
}
