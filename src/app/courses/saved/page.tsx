// src/app/courses/saved/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getCourses, type Course } from "@/services/course-service";
import { ArrowRight, Search, Loader2, Bookmark, FolderHeart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from '@/hooks/use-auth';
import { toggleSavedCourse } from '@/services/user-service';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function SavedCoursesPage() {
  const { user, refreshUserProfile } = useAuth();
  const { toast } = useToast();
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const coursesData = await getCourses();
      setAllCourses(coursesData);
      setIsLoading(false);
    }
    fetchData();
  }, []);

  const savedCourses = useMemo(() => {
    const userSavedCourseIds = user?.profile?.savedCourses || [];
    return allCourses.filter(course => 
      userSavedCourseIds.includes(course.id) &&
      course.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allCourses, user, searchTerm]);
  
  const handleSaveCourse = async (courseId: string) => {
    if (!user) return;
    setIsSaving(courseId);
    try {
      const { saved } = await toggleSavedCourse(user.uid, courseId);
      await refreshUserProfile();
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
        <h1 className="text-4xl font-headline font-bold text-gray-800 dark:text-white flex items-center gap-3">
          <FolderHeart className="h-10 w-10 text-primary" />
          Mes Cours Sauvegardés
        </h1>
        <p className="text-muted-foreground mt-2">Retrouvez ici tous les cours que vous avez mis de côté pour les étudier plus tard.</p>
      </header>

      <Card>
        <CardHeader>
          <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Rechercher dans vos cours sauvegardés..." 
                className="pl-10" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
          </div>
        </CardHeader>
        <CardContent>
            {isLoading ? (
                 <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {savedCourses.length > 0 ? (
                        savedCourses.map((course) => (
                        <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col group">
                            <CardHeader className="p-0 relative">
                                <Image src={course.imageUrl} alt={course.title} width={400} height={200} className="w-full h-40 object-cover" data-ai-hint={course.imageHint} />
                                <Button
                                  size="icon"
                                  variant="secondary"
                                  className={cn(
                                    "absolute top-2 right-2 rounded-full h-8 w-8 transition-opacity",
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
                            <p>Vous n'avez aucun cours sauvegardé correspondant à votre recherche.</p>
                            <Button asChild variant="link" className="mt-2">
                                <Link href="/courses">Parcourir les cours</Link>
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
