// src/app/admin/structure/page.tsx
'use client'

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Edit, Trash2, Loader2, X } from "lucide-react";
import { Badge } from '@/components/ui/badge';
import type { SchoolClass, Series } from '@/services/school-structure-service';
import { getSchoolStructure, deleteClass, removeSeriesFromClass } from '@/services/school-structure-service';
import { StructureForm } from './structure-form';
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

type FormState = {
  mode: 'addClass' | 'editClass' | 'addSeries';
  isOpen: boolean;
  classData?: SchoolClass | null;
}

export default function AdminStructurePage() {
  const [structure, setStructure] = useState<SchoolClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formState, setFormState] = useState<FormState>({ mode: 'addClass', isOpen: false });

  const fetchStructure = async () => {
    setIsLoading(true);
    const data = await getSchoolStructure();
    setStructure(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchStructure();
  }, []);

  const handleOpenForm = (mode: FormState['mode'], classData?: SchoolClass) => {
    setFormState({ mode, classData, isOpen: true });
  }

  const handleCloseForm = (refresh: boolean) => {
    setFormState({ ...formState, isOpen: false });
    if (refresh) {
      fetchStructure();
    }
  }
  
  const handleDeleteSeries = async (classId: string, series: Series) => {
    await removeSeriesFromClass(classId, series);
    fetchStructure();
  };
  
  const handleDeleteClass = async (classId: string) => {
    await deleteClass(classId);
    fetchStructure();
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin h-8 w-8" /></div>;
  }

  return (
    <div className="flex-1 space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-headline font-bold">Structure Scolaire</h1>
          <p className="text-muted-foreground mt-2">
            Gérez les classes et les séries disponibles sur la plateforme.
          </p>
        </div>
        <Button onClick={() => handleOpenForm('addClass')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Ajouter une classe
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {structure.map((schoolClass) => (
          <Card key={schoolClass.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{schoolClass.name}</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleOpenForm('editClass', schoolClass)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                     <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                     </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Cette action est irréversible et supprimera la classe "{schoolClass.name}" ainsi que toutes ses séries.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteClass(schoolClass.id)}>
                        Confirmer la suppression
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>Séries disponibles pour cette classe :</CardDescription>
              <div className="mt-4 space-y-2">
                {schoolClass.series.length > 0 ? (
                  schoolClass.series.map((s) => (
                    <div key={s.value} className="flex items-center justify-between bg-secondary p-2 rounded-md">
                        <Badge variant="secondary">{s.label} ({s.value})</Badge>
                        <AlertDialog>
                           <AlertDialogTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-6 w-6">
                                    <X className="h-4 w-4" />
                                </Button>
                           </AlertDialogTrigger>
                           <AlertDialogContent>
                             <AlertDialogHeader>
                               <AlertDialogTitle>Supprimer la série ?</AlertDialogTitle>
                               <AlertDialogDescription>
                                 Êtes-vous sûr de vouloir supprimer la série "{s.label}" de la classe "{schoolClass.name}" ?
                               </AlertDialogDescription>
                             </AlertDialogHeader>
                             <AlertDialogFooter>
                               <AlertDialogCancel>Annuler</AlertDialogCancel>
                               <AlertDialogAction onClick={() => handleDeleteSeries(schoolClass.id, s)}>
                                 Confirmer
                               </AlertDialogAction>
                             </AlertDialogFooter>
                           </AlertDialogContent>
                        </AlertDialog>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-2">Aucune série définie.</p>
                )}
              </div>
              <Button variant="outline" size="sm" className="w-full mt-4" onClick={() => handleOpenForm('addSeries', schoolClass)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Ajouter une série
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {formState.isOpen && (
        <StructureForm
          mode={formState.mode}
          isOpen={formState.isOpen}
          onClose={handleCloseForm}
          classData={formState.classData}
        />
      )}
    </div>
  );
}
