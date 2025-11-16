// src/app/resources/page.tsx
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { getResources, type Resource, toggleLikeResource } from "@/services/resource-service";
import { Download, FileText, Video, ImageIcon as LucideImageIcon, Loader2, Search, PlayCircle, Eye, Bookmark, ThumbsUp, MessageSquare, Folder, ListFilter, Share2 } from "lucide-react";
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import Image from "next/image";
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { toggleSavedResource } from '@/services/user-service';
import { cn } from '@/lib/utils';
import { VideoResourceViewer } from './video-resource-viewer';
import { getResourceFolders, type ResourceFolder } from '@/services/resource-folder-service';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { getSubjects, type Subject } from '@/services/subject-service';

const getFileIcon = (type: string, className?: string) => {
    switch (type.toUpperCase()) {
        case 'PDF': return <FileText className={className || "h-8 w-8 text-red-500"} />;
        case 'WORD': return <FileText className={className || "h-8 w-8 text-blue-500"} />;
        case 'VIDEO': return <Video className={className || "h-8 w-8 text-purple-500"} />;
        case 'IMAGE': return <LucideImageIcon className={className || "h-8 w-8 text-green-500"} />;
        default: return <FileText className={className || "h-8 w-8 text-muted-foreground"} />;
    }
}

// Fonction pour obtenir l'ID d'une vidéo YouTube à partir de l'URL
const getYoutubeId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

// Fonction pour obtenir l'URL de la miniature d'une vidéo YouTube
const getYoutubeThumbnail = (videoId: string): string => {
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
};

const resourceTypes = ["PDF", "WORD", "IMAGE", "VIDEO"];

export default function ResourcesPage() {
    const { user, refreshUserProfile } = useAuth();
    const { toast } = useToast();
    const [resources, setResources] = useState<Resource[]>([]);
    const [folders, setFolders] = useState<ResourceFolder[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    
    const [isLoading, setIsLoading] = useState(true);
    
    const [isSaving, setIsSaving] = useState<string | null>(null);
    const [isLiking, setIsLiking] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
    
    useEffect(() => {
        const fetchInitialData = async () => {
            if (!user?.profile) return;
            
            setIsLoading(true);
    
            try {
                const [foldersData, subjectsData, resourcesData] = await Promise.all([
                    getResourceFolders(),
                    getSubjects(),
                    getResources()
                ]);
                
                const userClass = user.profile.schoolClass;
                const userSeries = user.profile.series;
    
                const userFolders = foldersData.filter(folder =>
                    folder.class === userClass &&
                    folder.series === userSeries
                );
                setFolders(userFolders);
                setSubjects(subjectsData);
                setResources(resourcesData);
            } catch (error) {
                 console.error("Failed to fetch initial data", error);
                 toast({ title: "Erreur", description: "Impossible de charger les données.", variant: "destructive"});
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchInitialData();
    }, [user, toast]);

    const userClass = user?.profile?.schoolClass;
    const userSeries = user?.profile?.series;

    const filteredResources = useMemo(() => {
        if (!userClass || !userSeries) return [];
        return resources.filter(resource => {
            const matchesClass = resource.classes.includes(userClass);
            const matchesSeries = resource.series.includes(userSeries);
            const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = !selectedType || resource.type === selectedType;
            const matchesSubject = !selectedSubject || resource.subjectName === selectedSubject;
            
            return matchesClass && matchesSeries && matchesSearch && matchesType && matchesSubject;
        });
    }, [resources, searchTerm, selectedType, selectedSubject, userClass, userSeries]);
    
    const handleClearFilters = () => {
        setSearchTerm('');
        setSelectedType(null);
        setSelectedSubject(null);
    }
    
    const isResourceSaved = (resourceId: string) => {
      return user?.profile?.savedResources?.includes(resourceId);
    }
    
    const hasUserLiked = (resource: Resource) => {
        return user && resource.likes?.includes(user.uid);
    }

    const handleSaveResource = async (resourceId: string) => {
        if (!user) return;
        setIsSaving(resourceId);
        try {
            const { saved } = await toggleSavedResource(user.uid, resourceId);
            await refreshUserProfile();
            toast({
                title: saved ? "Ressource sauvegardée" : "Sauvegarde annulée",
                description: saved ? "Cette ressource a été ajoutée à vos favoris." : "Cette ressource a été retirée de vos favoris.",
            });
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Impossible de modifier la sauvegarde de la ressource.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(null);
        }
    }

    const handleLike = async (resourceId: string) => {
        if (!user) return;
        setIsLiking(resourceId);
        try {
            const { liked, likeCount } = await toggleLikeResource(user.uid, resourceId);
            setResources(prev => prev.map(r => 
                r.id === resourceId 
                    ? { ...r, likeCount, likes: liked 
                        ? [...(r.likes || []), user.uid] 
                        : (r.likes || []).filter(uid => uid !== user.uid) } 
                    : r
            ));
        } catch (error) {
            toast({ title: "Erreur", description: "Impossible de traiter le 'like'.", variant: "destructive" });
        } finally {
            setIsLiking(null);
        }
    };
    
    const handleShare = (resourceId: string) => {
        const shareUrl = `${window.location.origin}/resources/share?id=${resourceId}`;
        navigator.clipboard.writeText(shareUrl).then(() => {
            toast({
                title: "Lien copié !",
                description: "Le lien de partage a été copié dans votre presse-papiers.",
            });
        }, () => {
            toast({
                title: "Erreur",
                description: "Impossible de copier le lien.",
                variant: "destructive",
            });
        });
    };

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8">
      <header>
        <h1 className="text-4xl font-headline font-bold text-gray-800 dark:text-white">Bibliothèque de Ressources</h1>
        <p className="text-muted-foreground mt-2">Documents, fichiers et dossiers pour votre classe de {user?.profile?.schoolClass} ({user?.profile?.series?.toUpperCase()}).</p>
      </header>

      {isLoading && !folders.length ? (
        <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
        </div>
      ) : folders.length > 0 ? (
          <section>
             <h2 className="text-2xl font-headline font-semibold mb-4">Dossiers de ressources</h2>
             <Carousel
                opts={{
                    align: "start",
                }}
                className="w-full"
            >
                <CarouselContent>
                    {folders.map((folder) => (
                    <CarouselItem key={folder.id} className="basis-1/2 md:basis-1/3 lg:basis-1/5">
                        <Link href={`/resources/folders/details?id=${folder.id}`}>
                            <Card className="hover:bg-accent transition-colors">
                                <CardContent className="flex flex-col items-center justify-center p-4 gap-2 text-center h-32">
                                    <Folder className="h-10 w-10 text-primary" />
                                    <p className="text-sm font-semibold line-clamp-2">{folder.title}</p>
                                </CardContent>
                            </Card>
                        </Link>
                    </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="hidden sm:flex" />
                <CarouselNext className="hidden sm:flex" />
            </Carousel>
          </section>
      ) : null}

      <div className="space-y-4">
        <h2 className="text-2xl font-headline font-semibold">Toutes les ressources</h2>
        <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative w-full md:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                    placeholder="Rechercher une ressource..." 
                    className="pl-10" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="flex w-full md:w-auto items-center gap-2">
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="flex-1">
                            <ListFilter className="mr-2 h-4 w-4" />
                            {selectedType || "Type"}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        {resourceTypes.map(type => (
                            <DropdownMenuItem key={type} onSelect={() => setSelectedType(type)}>
                                {type}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="flex-1">
                            <ListFilter className="mr-2 h-4 w-4" />
                            {selectedSubject || "Matière"}
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
                {(searchTerm || selectedType || selectedSubject) && (
                    <Button variant="ghost" onClick={handleClearFilters}>➖</Button>
                )}
            </div>
        </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : filteredResources.length > 0 ? (
                <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredResources.map(resource => {
                        const viewerUrl = `/viewer?url=${encodeURIComponent(resource.url)}&title=${encodeURIComponent(resource.title)}`;
                        const isSaved = isResourceSaved(resource.id);
                        const isLiked = hasUserLiked(resource);
                        const youtubeId = resource.type === 'VIDEO' ? getYoutubeId(resource.url) : null;

                        return (
                            <Card key={resource.id} className="flex flex-col overflow-hidden group">
                                <div className="relative">
                                    <div className="absolute top-1 right-1 z-10 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <Button
                                            size="icon"
                                            variant="secondary"
                                            className={cn("rounded-full h-7 w-7", isSaved && "bg-primary/20 text-primary")}
                                            onClick={() => handleSaveResource(resource.id)}
                                            disabled={isSaving === resource.id}
                                            aria-label="Sauvegarder"
                                        >
                                            {isSaving === resource.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bookmark className="h-4 w-4" />}
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="secondary"
                                            onClick={() => handleShare(resource.id)}
                                            aria-label="Partager"
                                            className="rounded-full h-7 w-7"
                                        >
                                            <Share2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    {resource.type === 'IMAGE' ? (
                                        <Image src={resource.url} alt={resource.title} width={200} height={120} className="w-full h-32 object-cover" />
                                    ) : youtubeId ? (
                                        <div className="relative h-32">
                                            <Image src={getYoutubeThumbnail(youtubeId)} alt={resource.title} layout="fill" className="object-cover" />
                                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                                <PlayCircle className="h-10 w-10 text-white/70" />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-32 flex items-center justify-center bg-muted p-4">
                                            {getFileIcon(resource.type, "h-12 w-12")}
                                        </div>
                                    )}
                                </div>
                            
                                <CardContent className="p-3 flex-grow flex flex-col">
                                    <CardTitle className="text-sm font-semibold leading-tight flex-grow mb-1.5">{resource.title}</CardTitle>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <Badge variant="outline" className="py-0.5">{resource.subjectName}</Badge>
                                        <button
                                            onClick={() => handleLike(resource.id)}
                                            disabled={isLiking === resource.id}
                                            className={cn("flex items-center gap-1 hover:text-primary", isLiked && "text-primary")}
                                            aria-label="Aimer"
                                        >
                                            {isLiking === resource.id ? <Loader2 className="h-3 w-3 animate-spin"/> : <ThumbsUp className="h-3 w-3" />}
                                            <span>{resource.likeCount || 0}</span>
                                        </button>
                                    </div>
                                </CardContent>
                                <div className="p-3 pt-0">
                                    {resource.type === 'VIDEO' ? (
                                        <VideoResourceViewer 
                                            resource={resource} 
                                            trigger={
                                                <Button size="sm" className="w-full">
                                                    <PlayCircle className="mr-2 h-4 w-4" /> Voir
                                                </Button>
                                            }
                                        />
                                    ) : (
                                        <Button asChild size="sm" className="w-full">
                                            <Link href={viewerUrl}>
                                                <Eye className="mr-2 h-4 w-4" /> Ouvrir
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </Card>
                        )
                    })}
                </div>
                </>
            ) : (
                <div className="col-span-full text-center py-16 text-muted-foreground">
                    <p>Aucune ressource ne correspond à vos critères pour le moment.</p>
                </div>
            )}
      </div>

    </div>
  );
}
