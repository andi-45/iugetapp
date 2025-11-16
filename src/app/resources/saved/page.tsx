// src/app/resources/saved/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getResources, type Resource } from "@/services/resource-service";
import { ArrowRight, Search, Loader2, Bookmark, FolderHeart, PlayCircle, Eye, FileText, Video, ImageIcon as LucideImageIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from '@/hooks/use-auth';
import { toggleSavedResource } from '@/services/user-service';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { VideoResourceViewer } from '../video-resource-viewer';

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

export default function SavedResourcesPage() {
  const { user, refreshUserProfile } = useAuth();
  const { toast } = useToast();
  const [allResources, setAllResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const resourcesData = await getResources();
      setAllResources(resourcesData);
      setIsLoading(false);
    }
    fetchData();
  }, []);

  const savedResources = useMemo(() => {
    const userSavedResourceIds = user?.profile?.savedResources || [];
    return allResources.filter(resource => 
      userSavedResourceIds.includes(resource.id) &&
      resource.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allResources, user, searchTerm]);
  
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

  const isResourceSaved = (resourceId: string) => {
    return user?.profile?.savedResources?.includes(resourceId);
  }

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8">
      <header>
        <h1 className="text-4xl font-headline font-bold text-gray-800 dark:text-white flex items-center gap-3">
          <FolderHeart className="h-10 w-10 text-primary" />
          Mes Ressources Sauvegardées
        </h1>
        <p className="text-muted-foreground mt-2">Retrouvez ici tous les documents que vous avez mis de côté.</p>
      </header>

      <Card>
        <CardHeader>
          <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Rechercher dans vos ressources..." 
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
            ) : savedResources.length > 0 ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {savedResources.map(resource => {
                        const viewerUrl = `/viewer?url=${encodeURIComponent(resource.url)}&title=${encodeURIComponent(resource.title)}`;
                        const isSaved = isResourceSaved(resource.id);
                        const youtubeId = resource.type === 'VIDEO' ? getYoutubeId(resource.url) : null;
                        return (
                             <Card key={resource.id} className="flex flex-col overflow-hidden group">
                                <div className="relative">
                                    <Button
                                        size="icon"
                                        variant="secondary"
                                        className={cn(
                                            "absolute top-2 right-2 rounded-full h-8 w-8 z-10 transition-opacity",
                                            isSaved && "opacity-100"
                                        )}
                                        onClick={() => handleSaveResource(resource.id)}
                                        disabled={isSaving === resource.id}
                                        aria-label="Sauvegarder la ressource"
                                    >
                                        {isSaving === resource.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Bookmark className={cn("h-4 w-4", isSaved && "fill-primary text-primary")} />
                                        )}
                                    </Button>
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
                                    {resource.type === 'VIDEO' ? (
                                        <VideoResourceViewer 
                                            resource={resource}
                                            trigger={
                                                <Button className="w-full">
                                                    <PlayCircle className="mr-2 h-4 w-4" /> Voir la vidéo
                                                </Button>
                                            }
                                        />
                                    ) : (
                                        <Button asChild className="w-full">
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
            ) : (
                <div className="col-span-full text-center py-16 text-muted-foreground">
                    <p>Vous n'avez aucune ressource sauvegardée.</p>
                    <Button asChild variant="link" className="mt-2">
                        <Link href="/resources">Parcourir les ressources</Link>
                    </Button>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
