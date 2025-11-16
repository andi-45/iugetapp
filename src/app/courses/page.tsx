
// src/app/courses/page.tsx
'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { getCourses, type Course } from "@/services/course-service";
import { ArrowRight, ListFilter, Search, Loader2, Bookmark } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from '@/hooks/use-auth';
import { getSubjects } from '@/services/subject-service';
import type { Subject } from '@/services/subject-service';
import { toggleSavedCourse } from '@/services/user-service';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function CoursesPage() {
  const { user, refreshUserProfile } = useAuth();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    const [coursesData, subjectsData] = await Promise.all([
      getCourses(),
      getSubjects()
    ]);

    const userClass = user.profile?.schoolClass;
    const userSeries = user.profile?.series;

    // Filter courses based on user's class and series
    const userCourses = coursesData.filter(course => {
      return course.status === 'published' &&
             course.classes.includes(userClass || '') &&
             course.series.includes(userSeries || '');
    });

    setCourses(userCourses);
    setSubjects(subjectsData);
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSubject = !selectedSubject || course.subjectName === selectedSubject;
      return matchesSearch && matchesSubject;
    });
  }, [courses, searchTerm, selectedSubject]);
  
  const handleClearFilters = () => {
    setSelectedSubject(null);
    setSearchTerm("");
  };

  const getSubjectLabel = () => {
    if (!selectedSubject) return "Filtrer par matière";
    const subject = subjects.find(s => s.name === selectedSubject);
    return subject?.name || "Filtrer par matière";
  }

  const handleSaveCourse = async (courseId: string) => {
    if (!user) return;
    setIsSaving(courseId);
    try {
      const { saved } = await toggleSavedCourse(user.uid, courseId);
      await refreshUserProfile(); // Met à jour le contexte utilisateur
      toast({
        title: saved ? "Cours sauvegardé" : "Sauvegarde annulée",
        description: saved ? "Ce cours a été ajouté à vos favoris." : "Ce cours a été retiré de vos favoris.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier la sauvegarde du cours.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(null);
    }
  }
  
  const isCourseSaved = (courseId: string) => {
    return user?.profile?.savedCourses?.includes(courseId);
  }

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8">
      <header>
        <h1 className="text-4xl font-headline font-bold text-gray-800 dark:text-white">Vos Cours</h1>
        <p className="text-muted-foreground mt-2">Voici les cours disponibles pour votre classe de {user?.profile?.schoolClass} ({user?.profile?.series?.toUpperCase()}).</p>
      </header>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="Rechercher un cours..." 
                  className="pl-10" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="flex flex-wrap gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                            <ListFilter className="mr-2 h-4 w-4" />
                            {getSubjectLabel()}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        {subjects.map(s => (
                            <DropdownMenuItem key={s.id} onSelect={() => setSelectedSubject(s.name)}>
                                {s.name}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
                {(selectedSubject || searchTerm) && (
                    <Button variant="ghost" onClick={handleClearFilters}>Réinitialiser</Button>
                )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
            {isLoading ? (
                 <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredCourses.length > 0 ? (
                        filteredCourses.map((course) => (
                        <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col group">
                            <CardHeader className="p-0 relative">
                                <Image src={course.imageUrl} alt={course.title} width={400} height={200} className="w-full h-40 object-cover" data-ai-hint={course.imageHint} />
                                <Button
                                  size="icon"
                                  variant="secondary"
                                  className={cn(
                                    "absolute top-2 right-2 rounded-full h-8 w-8 transition-opacity opacity-0 group-hover:opacity-100",
                                    isCourseSaved(course.id) && "opacity-100"
                                  )}
                                  onClick={() => handleSaveCourse(course.id)}
                                  disabled={isSaving === course.id}
                                  aria-label="Sauvegarder le cours"
                                >
                                  {isSaving === course.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Bookmark className={cn("h-4 w-4", isCourseSaved(course.id) && "fill-primary text-primary")} />
                                  )}
                                </Button>
                            </CardHeader>
                            <CardContent className="p-4 flex flex-col flex-grow">
                            <CardTitle className="font-headline text-xl mb-2">{course.title}</CardTitle>
                            <CardDescription className="flex-grow">{course.description}</CardDescription>
                            <Button asChild variant="secondary" className="mt-4 w-full">
                                <Link href={`/courses/details?id=${course.id}`}>Aller au cours <ArrowRight className="ml-2 h-4 w-4" /></Link>
                            </Button>
                            </CardContent>
                        </Card>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-16 text-muted-foreground">
                            <p>Aucun cours ne correspond à vos critères pour le moment.</p>
                        </div>
                    )}
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
