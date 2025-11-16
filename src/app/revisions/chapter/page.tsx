// src/app/revisions/chapter/page.tsx
'use client'

import { Suspense, useEffect, useState } from 'react';
import { notFound, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, BookUp, FileText, Loader2, PlayCircle, Eye, Share2 } from 'lucide-react';
import { getRevisionById, type Revision, type RevisionChapter, addPointsForChapterReview } from '@/services/revision-service';
import { getResources, type Resource } from '@/services/resource-service';
import { getSubjectIcon, getYoutubeThumbnailById, getYoutubeVideoId } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { VideoResourceViewer } from '@/app/resources/video-resource-viewer';
import { useAuth } from '@/hooks/use-auth';
import { addHistoryItem } from '@/services/history-service';

function ChapterContent() {
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const { user } = useAuth();
    const revisionId = searchParams.get('revisionId');
    const chapterId = searchParams.get('chapterId');

    const [chapter, setChapter] = useState<RevisionChapter | null>(null);
    const [revision, setRevision] = useState<Revision | null>(null);
    const [resources, setResources] = useState<Resource[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (revisionId && chapterId && user) {
            Promise.all([
                getRevisionById(revisionId),
                getResources(),
            ]).then(([revisionData, allResources]) => {
                if (!revisionData) {
                    notFound();
                    return;
                }
                const foundChapter = revisionData.chapters.find(c => c.id === chapterId);
                if (!foundChapter) {
                    notFound();
                    return;
                }
                
                setRevision(revisionData);
                setChapter(foundChapter);
                
                const chapterResources = allResources.filter(r => foundChapter.resourceIds.includes(r.id));
                setResources(chapterResources);
                setIsLoading(false);

                // Add points for visiting the chapter & add to history
                addPointsForChapterReview(user.uid);
                addHistoryItem(user.uid, {
                    type: 'chapter',
                    title: foundChapter.title,
                    link: `/revisions/chapter?revisionId=${revisionId}&chapterId=${chapterId}`
                });
            });
        } else {
            setIsLoading(false);
        }
    }, [revisionId, chapterId, user]);

    const handleShare = () => {
        const shareUrl = `${window.location.origin}/revisions/chapter?revisionId=${revisionId}&chapterId=${chapterId}`;
        navigator.clipboard.writeText(shareUrl).then(() => {
            toast({
                title: "Lien copié !",
                description: "Le lien de partage du chapitre a été copié.",
            });
        });
    };

    if (isLoading) {
        return <div className="flex-1 flex justify-center items-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!revision || !chapter) {
        notFound();
    }
    
    const SubjectIcon = getSubjectIcon(revision.subjectName);

    return (
        <div className="flex-1 space-y-8 p-4 md:p-8">
            <header>
                <Button asChild variant="outline" size="sm" className="mb-4">
                    <Link href={`/revisions/subject?id=${revision.id}`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Retour aux chapitres
                    </Link>
                </Button>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-secondary rounded-lg"><SubjectIcon className="h-8 w-8 text-secondary-foreground" /></div>
                        <div>
                            <h2 className="text-base font-semibold text-primary">{revision.subjectName}</h2>
                            <h1 className="text-3xl md:text-4xl font-headline font-bold">{chapter.title}</h1>
                        </div>
                    </div>
                    <Button variant="outline" size="icon" onClick={handleShare}><Share2 className="h-5 w-5" /></Button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><BookUp /> Cours Principal du Chapitre</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                            <p className="text-muted-foreground mb-4">Cliquez sur le bouton ci-dessous pour ouvrir le document du cours dans un lecteur optimisé.</p>
                            <Button asChild size="lg">
                                <Link href={`/viewer?url=${encodeURIComponent(chapter.pdfUrl)}&title=${encodeURIComponent(chapter.title)}`}>
                                    Ouvrir le cours
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
                
                <div className="space-y-4 lg:col-span-1">
                    <h3 className="text-xl font-headline font-semibold">Ressources Complémentaires</h3>
                    {resources.length > 0 ? (
                        resources.map(resource => {
                            const youtubeId = getYoutubeVideoId(resource.url);
                            return (
                                <Card key={resource.id}>
                                    <CardContent className="p-3 flex items-center gap-3">
                                        <div className="relative h-16 w-24 bg-muted rounded-md overflow-hidden shrink-0">
                                            {youtubeId ? (
                                                <Image src={getYoutubeThumbnailById(youtubeId)} alt={resource.title} layout="fill" objectFit="cover"/>
                                            ) : (
                                                <div className="flex items-center justify-center h-full"><FileText className="h-8 w-8 text-muted-foreground"/></div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold truncate">{resource.title}</p>
                                            <Badge variant="secondary">{resource.type}</Badge>
                                        </div>
                                        {resource.type === 'VIDEO' ? (
                                            <VideoResourceViewer resource={resource} trigger={
                                                <Button size="sm" variant="ghost"><PlayCircle className="h-5 w-5" /></Button>
                                            }/>
                                        ) : (
                                            <Button asChild size="sm" variant="ghost">
                                                <Link href={`/viewer?url=${encodeURIComponent(resource.url)}&title=${encodeURIComponent(resource.title)}`}>
                                                    <Eye className="h-5 w-5" />
                                                </Link>
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            )
                        })
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">Aucune ressource complémentaire pour ce chapitre.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function ChapterPage() {
    return (
        <Suspense fallback={<div className="flex-1 flex justify-center items-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <ChapterContent />
        </Suspense>
    );
}
