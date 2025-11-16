// src/app/admin/resources/page.tsx
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
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, PlusCircle, Edit, Trash2, Loader2, FileText, FileArchive, Image as ImageIcon, Video } from "lucide-react"
import { ResourceForm } from "./resource-form";
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
import type { Resource } from "@/services/resource-service";
import { getResources, deleteResource } from "@/services/resource-service";

type FormState = {
  mode: 'add' | 'edit';
  isOpen: boolean;
  resource?: Resource | null;
}

const getFileIcon = (type: string) => {
    switch (type.toUpperCase()) {
        case 'PDF': return <FileText className="h-5 w-5 text-red-500" />;
        case 'WORD': return <FileText className="h-5 w-5 text-blue-500" />;
        case 'VIDEO': return <Video className="h-5 w-5 text-purple-500" />;
        case 'IMAGE': return <ImageIcon className="h-5 w-5 text-green-500" />;
        default: return <FileText className="h-5 w-5 text-muted-foreground" />;
    }
}


export default function AdminResourcesPage() {
    const [resources, setResources] = useState<Resource[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [formState, setFormState] = useState<FormState>({ mode: 'add', isOpen: false });
    const { toast } = useToast();

    const fetchResources = async () => {
        setIsLoading(true);
        const data = await getResources();
        setResources(data);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchResources();
    }, []);

    const handleOpenForm = (mode: FormState['mode'], resource?: Resource) => {
        setFormState({ mode, resource, isOpen: true });
    }

    const handleCloseForm = (refresh: boolean) => {
        setFormState({ ...formState, isOpen: false });
        if (refresh) {
            fetchResources();
        }
    }
    
    const handleDeleteResource = async (resourceId: string, resourceTitle: string) => {
        try {
            await deleteResource(resourceId);
            toast({ title: "Ressource supprimée", description: `La ressource "${resourceTitle}" a été supprimée.` });
            fetchResources();
        } catch (error) {
            toast({ title: "Erreur", description: "Impossible de supprimer la ressource.", variant: "destructive" });
        }
    }

    return (
        <div className="flex-1 space-y-8">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-headline font-bold">Gestion des Ressources</h1>
                    <p className="text-muted-foreground mt-2">
                        Ajoutez, modifiez ou supprimez des documents et fichiers.
                    </p>
                </div>
                <Button onClick={() => handleOpenForm('add')}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Ajouter une ressource
                </Button>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>Bibliothèque de Ressources</CardTitle>
                    <CardDescription>
                        Gérez tous les fichiers téléchargeables pour les étudiants.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">Type</TableHead>
                                <TableHead>Titre</TableHead>
                                <TableHead>Matière</TableHead>
                                <TableHead className="hidden md:table-cell">Classes</TableHead>
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
                            ) : resources.map((resource) => (
                                <TableRow key={resource.id}>
                                    <TableCell className="font-medium">{getFileIcon(resource.type)}</TableCell>
                                    <TableCell className="font-medium">{resource.title}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{resource.subjectName}</Badge>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        <div className="flex gap-1 flex-wrap">
                                            {resource.classes.map(c => <Badge key={c} variant="secondary">{c}</Badge>)}
                                        </div>
                                    </TableCell>
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
                                                <DropdownMenuItem onSelect={() => handleOpenForm('edit', resource)}>
                                                    <Edit className="mr-2 h-4 w-4" /> Modifier
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
                                                                Cette action est irréversible et supprimera la ressource "{resource.title}".
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDeleteResource(resource.id, resource.title)}>
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

            {formState.isOpen && (
                <ResourceForm
                    mode={formState.mode}
                    isOpen={formState.isOpen}
                    onClose={handleCloseForm}
                    resource={formState.resource}
                />
            )}
        </div>
    )
}
