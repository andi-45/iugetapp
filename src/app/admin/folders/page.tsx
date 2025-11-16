
// src/app/admin/folders/page.tsx
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
import { MoreHorizontal, PlusCircle, Edit, Trash2, Folder, Loader2 } from "lucide-react"
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
import { getResourceFolders, deleteResourceFolder, type ResourceFolder } from "@/services/resource-folder-service";


export default function AdminFoldersPage() {
    const [folders, setFolders] = useState<ResourceFolder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchFolders = async () => {
        setIsLoading(true);
        const items = await getResourceFolders();
        setFolders(items);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchFolders();
    }, []);

    const handleDelete = async (id: string, title: string) => {
        try {
            await deleteResourceFolder(id);
            toast({ title: "Dossier supprimé", description: `Le dossier "${title}" a été supprimé.` });
            fetchFolders();
        } catch (error) {
            toast({ title: "Erreur", description: "Impossible de supprimer le dossier.", variant: "destructive" });
        }
    }

    return (
        <div className="flex-1 space-y-8">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-headline font-bold">Gestion des Dossiers</h1>
                    <p className="text-muted-foreground mt-2">
                        Organisez les ressources en dossiers thématiques pour les étudiants.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/admin/folders/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Ajouter un dossier
                    </Link>
                </Button>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>Liste des Dossiers</CardTitle>
                    <CardDescription>
                        Gérez les collections de ressources.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12"><Folder className="h-5 w-5"/></TableHead>
                                <TableHead>Titre</TableHead>
                                <TableHead>Classe</TableHead>
                                <TableHead>Série</TableHead>
                                <TableHead>Ressources</TableHead>
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
                            ) : folders.map((folder) => (
                                <TableRow key={folder.id}>
                                    <TableCell><Folder className="h-5 w-5 text-primary"/></TableCell>
                                    <TableCell className="font-medium">{folder.title}</TableCell>
                                    <TableCell>{folder.class}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{folder.series.toUpperCase()}</Badge>
                                    </TableCell>
                                    <TableCell>{folder.resourceIds.length}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Toggle menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/admin/folders/edit?id=${folder.id}`}><Edit className="mr-2 h-4 w-4" />Modifier</Link>
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
                                                                Cette action est irréversible et supprimera le dossier "{folder.title}". Les ressources à l'intérieur ne seront pas supprimées.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDelete(folder.id, folder.title)}>
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
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
