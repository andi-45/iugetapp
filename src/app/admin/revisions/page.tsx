// src/app/admin/revisions/page.tsx
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
import { MoreHorizontal, PlusCircle, Edit, Trash2, Loader2, BookCopy } from "lucide-react"
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
import { getRevisions, deleteRevision, type Revision } from "@/services/revision-service";


export default function AdminRevisionsPage() {
    const [revisions, setRevisions] = useState<Revision[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchRevisions = async () => {
        setIsLoading(true);
        const items = await getRevisions();
        setRevisions(items);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchRevisions();
    }, []);

    const handleDelete = async (id: string) => {
        try {
            await deleteRevision(id);
            toast({ title: "Révision supprimée", description: `La fiche de révision a été supprimée.` });
            fetchRevisions();
        } catch (error) {
            toast({ title: "Erreur", description: "Impossible de supprimer la révision.", variant: "destructive" });
        }
    }

    return (
        <div className="flex-1 space-y-8">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-headline font-bold">Gestion des Révisions</h1>
                    <p className="text-muted-foreground mt-2">
                        Créez et organisez les chapitres et ressources pour les révisions des élèves.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/admin/revisions/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Créer une révision
                    </Link>
                </Button>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>Liste des Fiches de Révision</CardTitle>
                    <CardDescription>
                        Chaque fiche est liée à une matière et contient des chapitres.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12"><BookCopy className="h-5 w-5"/></TableHead>
                                <TableHead>Matière</TableHead>
                                <TableHead>Classes</TableHead>
                                <TableHead>Séries</TableHead>
                                <TableHead>Chapitres</TableHead>
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
                            ) : revisions.length > 0 ? revisions.map((revision) => (
                                <TableRow key={revision.id}>
                                    <TableCell><BookCopy className="h-5 w-5 text-primary"/></TableCell>
                                    <TableCell className="font-medium">{revision.subjectName}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-1 flex-wrap">
                                            {revision.classes.map(c => <Badge key={c} variant="secondary">{c}</Badge>)}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                         <div className="flex gap-1 flex-wrap">
                                            {revision.series.map(s => <Badge key={s} variant="outline">{s.toUpperCase()}</Badge>)}
                                        </div>
                                    </TableCell>
                                    <TableCell>{revision.chapters.length}</TableCell>
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
                                                    <Link href={`/admin/revisions/edit?id=${revision.id}`}><Edit className="mr-2 h-4 w-4" />Modifier</Link>
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
                                                                    Cette action est irréversible et supprimera la fiche de révision de {revision.subjectName}.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDelete(revision.id)}>
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
                                    <TableCell colSpan={6} className="h-24 text-center">Aucune révision trouvée.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
