// src/app/courses/details/page.tsx
'use client'

import { notFound, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Book, FileText, BarChart3, Layers, GraduationCap, Eye, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { getCourseById, type Course } from '@/services/course-service';
import { Suspense, useEffect, useState } from 'react';

function CourseContent({ course }: { course: Course }) {
  const viewerUrl = `/viewer?url=${encodeURIComponent(course.pdfUrl)}&title=${encodeURIComponent(course.title)}`;

  return (
    <div className="md:col-span-2 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileText /> Fichier du Cours</CardTitle>
          <CardDescription>Aperçu du document principal du cours.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted rounded-lg p-4 flex items-center justify-between">
            <p className="font-mono text-sm break-all">{course.title}.pdf</p>
            <Button variant="secondary" size="sm" asChild>
              <Link href={viewerUrl}>
                <Eye className="mr-2 h-4 w-4" />
                Ouvrir le cours
              </Link>
            </Button>
          </div>
          <div className="mt-4 aspect-video bg-secondary rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">(Cliquer sur "Ouvrir" pour voir le document)</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BarChart3 /> Statistiques</CardTitle>
          <CardDescription>Données sur l'engagement et l'utilisation de ce cours.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Les graphiques de statistiques seront affichés ici.</p>
        </CardContent>
      </Card>
    </div>
  );
}

function CourseDetailPageContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
        getCourseById(id).then(data => {
            if(!data) notFound();
            setCourse(data);
            setIsLoading(false);
        })
    } else {
        setIsLoading(false);
    }
  }, [id]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin" /></div>;
  }

  if (!id || !course) {
    return notFound();
  }

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8">
      <header>
        <Button asChild variant="outline" size="sm" className="mb-4">
          <Link href="/courses">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la liste des cours
          </Link>
        </Button>
        <div className="flex items-center gap-4">
          <Image
            src={course.imageUrl}
            alt={course.title}
            width={80}
            height={80}
            className="rounded-lg border bg-muted"
            data-ai-hint={course.imageHint}
          />
          <div>
            <h1 className="text-4xl font-headline font-bold">{course.title}</h1>
            <p className="text-muted-foreground mt-1">{course.description}</p>
          </div>
        </div>
      </header>

      <div className="grid md:grid-cols-3 gap-8">
        <Suspense fallback={<div>Chargement du contenu du cours...</div>}>
          <CourseContent course={course} />
        </Suspense>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm flex items-center gap-2 mb-2"><Book /> Statut</h4>
                <Badge variant={course.status === 'published' ? 'default' : 'secondary'}>
                  {course.status === 'published' ? 'Publié' : 'Brouillon'}
                </Badge>
              </div>
              <div>
                <h4 className="font-semibold text-sm flex items-center gap-2 mb-2"><GraduationCap /> Matière</h4>
                <Badge variant="outline">{course.subjectName}</Badge>
              </div>
              <div>
                <h4 className="font-semibold text-sm flex items-center gap-2 mb-2"><Layers /> Classes</h4>
                <div className="flex flex-wrap gap-1">
                  {course.classes.map(c => <Badge key={c} variant="secondary">{c}</Badge>)}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-sm flex items-center gap-2 mb-2"><Layers /> Séries</h4>
                <div className="flex flex-wrap gap-1">
                  {course.series.map(s => <Badge key={s} variant="outline">{s.toUpperCase()}</Badge>)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function CourseDetailPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-64"><Loader2 className="animate-spin" /></div>}>
            <CourseDetailPageContent />
        </Suspense>
    )
}
