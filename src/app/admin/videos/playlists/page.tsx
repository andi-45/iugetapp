// src/app/admin/videos/playlists/page.tsx
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
import { getPlaylists, deletePlaylist, type Playlist, getAuthors, type Author } from "@/services/video-service" 
import { MoreHorizontal, PlusCircle, Edit, Trash2, Loader2, Youtube, Link as LinkIcon } from "lucide-react"
import { PlaylistForm } from "./playlist-form";
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
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

type FormState = {
  mode: 'add' | 'edit';
  isOpen: boolean;
  playlist?: Playlist | null;
}

export default function AdminPlaylistsPage() {
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [authors, setAuthors] = useState<Author[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [formState, setFormState] = useState<FormState>({ mode: 'add', isOpen: false });
    const { toast } = useToast();

    const fetchData = async () => {
        setIsLoading(true);
        const [playlistsData, authorsData] = await Promise.all([getPlaylists(), getAuthors()]);
        setPlaylists(playlistsData);
        setAuthors(authorsData);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenForm = (mode: FormState['mode'], playlist?: Playlist) => {
        setFormState({ mode, playlist, isOpen: true });
    }

    const handleCloseForm = (refresh: boolean) => {
        setFormState({ ...formState, isOpen: false });
        if (refresh) {
            fetchData();
        }
    }
    
    const handleDelete = async (id: string, name: string) => {
        try {
            await deletePlaylist(id);
            toast({ title: "Playlist supprimée", description: `La playlist "${name}" a été supprimée.` });
            fetchData();
        } catch (error) {
            toast({ title: "Erreur", description: "Impossible de supprimer la playlist.", variant: "destructive" });
        }
    }

    const getAuthorName = (authorId: string) => {
        return authors.find(a => a.id === authorId)?.name || 'Inconnu';
    }

    return (
        <div className="flex-1 space-y-8">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-headline font-bold">Gestion des Playlists</h1>
                    <p className="text-muted-foreground mt-2">
                        Ajoutez ou modifiez les playlists de vidéos YouTube.
                    </p>
                </div>
                <Button onClick={() => handleOpenForm('add')}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Ajouter une playlist
                </Button>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>Liste des Playlists</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-24">Image</TableHead>
                                <TableHead>Nom</TableHead>
                                <TableHead>Auteur</TableHead>
                                <TableHead>Langue</TableHead>
                                <TableHead>
                                    <span className="sr-only">Actions</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">
                                        <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                                    </TableCell>
                                </TableRow>
                            ) : playlists.length > 0 ? (
                                playlists.map((playlist) => (
                                    <TableRow key={playlist.id}>
                                        <TableCell>
                                            <Image src={playlist.imageUrl} alt={playlist.name} width={80} height={45} className="rounded-md object-cover" />
                                        </TableCell>
                                        <TableCell className="font-medium">{playlist.name}</TableCell>
                                        <TableCell>{getAuthorName(playlist.authorId)}</TableCell>
                                        <TableCell><Badge variant="outline">{playlist.language}</Badge></TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button size="icon" variant="ghost">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                     {playlist.url && (
                                                        <DropdownMenuItem asChild>
                                                            <Link href={playlist.url} target="_blank" rel="noopener noreferrer"><LinkIcon className="mr-2 h-4 w-4" />Voir sur YouTube</Link>
                                                        </DropdownMenuItem>
                                                     )}
                                                    <DropdownMenuItem onSelect={() => handleOpenForm('edit', playlist)}>
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
                                                                Cette action est irréversible et supprimera la playlist "{playlist.name}".
                                                            </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDelete(playlist.id, playlist.name)}>
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
                                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                                        Aucune playlist trouvée.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {formState.isOpen && (
                <PlaylistForm
                    mode={formState.mode}
                    isOpen={formState.isOpen}
                    onClose={handleCloseForm}
                    playlist={formState.playlist}
                    authors={authors}
                />
            )}
        </div>
    )
}
