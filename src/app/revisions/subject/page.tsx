// src/app/revisions/subject/page.tsx
'use client'

import { Suspense, useEffect, useState } from 'react';
import { notFound, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BookCheck, FolderOpen, Loader2 } from 'lucide-react';
import { getRevisionById, type Revision } from '@/services/revision-service';
import { getSubjectIcon } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

function SubjectRevisionsContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const [revision, setRevision] = useState<Revision | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if(id) {
            getRevisionById(id).then(data => {
                if(!data) notFound();
                setRevision(data);
                setIsLoading(false);
            });
        } else {
            setIsLoading(false);
        }
    }, [id]);

    if (isLoading) {
        return <div className="flex-1 flex justify-center items-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!id || !revision) {
        notFound();
    }
    
    const Icon = getSubjectIcon(revision.subjectName);

    return (
        <div className="flex-1 space-y-8 p-4 md:p-8">
            <header>
                <Button asChild variant="outline" size="sm" className="mb-4">
                    <Link href="/revisions">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Toutes les matières
                    </Link>
                </Button>
                <div className="flex items-center gap-4">
                     
                    <div>
                        <h1 className="text-4xl font-headline font-bold">{revision.subjectName}</h1>
                        <p className="text-muted-foreground mt-1">Liste des chapitres de révision.</p>
                    </div>
                </div>
            </header>

            {revision.chapters.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {revision.chapters.map((chapter, index) => (
                        <Link key={chapter.id} href={`/revisions/chapter?revisionId=${revision.id}&chapterId=${chapter.id}`} legacyBehavior>
                           <a className="block">
                             <Card className="h-full hover:shadow-md hover:border-primary/50 transition-all">
                                 <CardHeader className="flex-row items-center gap-4">
                                     <div className="flex-shrink-0">
                                         <BookCheck className="h-8 w-8 text-primary" />
                                     </div>
                                     <div>
                                         <CardTitle>Chapitre {index + 1}</CardTitle>
                                         <CardDescription>{chapter.title}</CardDescription>
                                     </div>
                                 </CardHeader>
                                 <CardContent>
                                    <Badge variant="outline">{chapter.resourceIds.length} ressource{chapter.resourceIds.length > 1 ? 's' : ''}</Badge>
                                 </CardContent>
                             </Card>
                            </a>
                        </Link>
                    ))}
                </div>
            ) : (
                <Card className="border-dashed text-center">
                    <CardContent className="p-8">
                        <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="font-semibold">Aucun chapitre</h3>
                        <p className="text-muted-foreground text-sm">Les chapitres pour cette matière seront bientôt disponibles.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

export default function SubjectRevisionsPage() {
    return (
        <Suspense fallback={<div className="flex-1 flex justify-center items-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <SubjectRevisionsContent />
        </Suspense>
    )
}
