
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
import { getSubjects, deleteSubject, type Subject } from "@/services/subject-service" 
import { MoreHorizontal, PlusCircle, Edit, Trash2, Loader2, GraduationCap } from "lucide-react"
import { SubjectForm } from "./subject-form";
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

type FormState = {
  mode: 'add' | 'edit';
  isOpen: boolean;
  subject?: Subject | null;
}

export default function AdminSubjectsPage() {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [formState, setFormState] = useState<FormState>({ mode: 'add', isOpen: false });
    const { toast } = useToast();

    const fetchSubjects = async () => {
        setIsLoading(true);
        const data = await getSubjects();
        setSubjects(data);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchSubjects();
    }, []);

    const handleOpenForm = (mode: FormState['mode'], subject?: Subject) => {
        setFormState({ mode, subject, isOpen: true });
    }

    const handleCloseForm = (refresh: boolean) => {
        setFormState({ ...formState, isOpen: false });
        if (refresh) {
            fetchSubjects();
        }
    }
    
    const handleDeleteSubject = async (subjectId: string, subjectName: string) => {
        const result = await deleteSubject(subjectId);
        if (result.success) {
            toast({ title: "Matière supprimée", description: `La matière "${subjectName}" a été supprimée.` });
            fetchSubjects();
        } else {
            toast({ title: "Erreur", description: result.message, variant: "destructive" });
        }
    }

    return (
        <div className="flex-1 space-y-8">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-headline font-bold">Gestion des Matières</h1>
                    <p className="text-muted-foreground mt-2">
                        Ajoutez, modifiez ou supprimez les matières proposées sur la plateforme.
                    </p>
                </div>
                <Button onClick={() => handleOpenForm('add')}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Ajouter une matière
                </Button>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>Liste des Matières</CardTitle>
                    <CardDescription>
                        Gérez toutes les matières disponibles. Ces données sont lues depuis votre base de données Firestore.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nom de la matière</TableHead>
                                <TableHead className="hidden md:table-cell">Nombre de cours</TableHead>
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
                            ) : subjects.length > 0 ? (
                                subjects.map((subject) => (
                                    <TableRow key={subject.id}>
                                        <TableCell className="font-medium flex items-center gap-2">
                                            <GraduationCap className="h-5 w-5 text-muted-foreground" />
                                            {subject.name}
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">{subject.courseCount}</TableCell>
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
                                                    <DropdownMenuItem onSelect={() => handleOpenForm('edit', subject)}>
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
                                                                Cette action est irréversible et supprimera la matière "{subject.name}".
                                                            </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDeleteSubject(subject.id, subject.name)}>
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
                                        Aucune matière trouvée. Cliquez sur "Ajouter une matière" pour commencer.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {formState.isOpen && (
                <SubjectForm
                    mode={formState.mode}
                    isOpen={formState.isOpen}
                    onClose={handleCloseForm}
                    subject={formState.subject}
                />
            )}
        </div>
    )
}
