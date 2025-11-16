
// src/app/resources/folders/details/page.tsx
'use client';

import { getResourceFolderById, type ResourceFolder } from "@/services/resource-folder-service";
import { getResources, type Resource } from "@/services/resource-service";
import { notFound, useSearchParams } from "next/navigation";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Folder, PlayCircle, Eye, FileText, Video, ImageIcon as LucideImageIcon, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Badge } from "@/components/ui/badge";
import { useEffect, useState, Suspense } from "react";

const getFileIcon = (type: string, className?: string) => {
    switch (type.toUpperCase()) {
        case 'PDF': return <FileText className={className || "h-8 w-8 text-red-500"} />;
        case 'WORD': return <FileText className={className || "h-8 w-8 text-blue-500"} />;
        case 'VIDEO': return <Video className={className || "h-8 w-8 text-purple-500"} />;
        case 'IMAGE': return <LucideImageIcon className={className || "h-8 w-8 text-green-500"} />;
        default: return <FileText className={className || "h-8 w-8 text-muted-foreground"} />;
    }
}

const getYoutubeId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

const getYoutubeThumbnail = (videoId: string): string => {
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
};

function FolderContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const [folder, setFolder] = useState<ResourceFolder | null>(null);
    const [folderResources, setFolderResources] = useState<Resource[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if(id) {
            Promise.all([
                getResourceFolderById(id),
                getResources()
            ]).then(([folderData, allResources]) => {
                if(!folderData) notFound();
                setFolder(folderData);
                const resources = allResources.filter(r => folderData.resourceIds.includes(r.id));
                setFolderResources(resources);
                setIsLoading(false);
            })
        } else {
            setIsLoading(false);
        }
    }, [id])

    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin" /></div>;
    }
    
    if (!id || !folder) {
        notFound();
    }

    return (
        <div className="flex-1 space-y-8 p-4 md:p-8">
            <header>
                <Button asChild variant="outline" size="sm" className="mb-4">
                    <Link href="/resources">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Retour aux ressources
                    </Link>
                </Button>
                <div className="flex items-center gap-4">
                    <Folder className="h-12 w-12 text-primary" />
                    <div>
                        <h1 className="text-4xl font-headline font-bold">{folder.title}</h1>
                        <p className="text-muted-foreground mt-1">
                            Contenu du dossier pour la classe de {folder.class} - Série {folder.series.toUpperCase()}
                        </p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {folderResources.length > 0 ? (
                    folderResources.map(resource => {
                        const viewerUrl = `/viewer?url=${encodeURIComponent(resource.url)}&title=${encodeURIComponent(resource.title)}`;
                        const youtubeId = resource.type === 'VIDEO' ? getYoutubeId(resource.url) : null;
                        return (
                            <Card key={resource.id} className="flex flex-col overflow-hidden group">
                                <div className="relative">
                                    {resource.type === 'IMAGE' ? (
                                        <div className="p-0 border-b">
                                            <Image src={resource.url} alt={resource.title} width={300} height={150} className="w-full h-40 object-cover" />
                                        </div>
                                    ) : youtubeId ? (
                                        <div className="p-0 border-b relative">
                                            <Image src={getYoutubeThumbnail(youtubeId)} alt={resource.title} width={300} height={150} className="w-full h-40 object-cover" />
                                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                                <PlayCircle className="h-12 w-12 text-white/70" />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex-row items-center gap-4 p-4 border-b h-40 flex justify-center bg-muted">
                                            {getFileIcon(resource.type, "h-16 w-16")}
                                        </div>
                                    )}
                                </div>
                                <CardContent className="p-4 flex flex-col flex-grow">
                                    <CardTitle className="text-base font-semibold leading-tight flex-grow mb-2">{resource.title}</CardTitle>
                                    <CardDescription>
                                        <Badge variant="secondary">{resource.subjectName}</Badge>
                                    </CardDescription>
                                </CardContent>
                                <div className="p-4 pt-0">
                                     <Button asChild className="w-full">
                                        <Link href={viewerUrl}>
                                            <Eye className="mr-2 h-4 w-4" /> Ouvrir
                                        </Link>
                                    </Button>
                                </div>
                            </Card>
                        )
                    })
                ) : (
                     <div className="col-span-full text-center py-16 text-muted-foreground">
                        <p>Ce dossier est actuellement vide.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function FolderContentPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-64"><Loader2 className="animate-spin" /></div>}>
            <FolderContent />
        </Suspense>
    )
}
