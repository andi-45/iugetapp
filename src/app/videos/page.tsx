// src/app/videos/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Search, Loader2, PlayCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { getAuthors, getPlaylists, type Author, type Playlist } from '@/services/video-service';
import Autoplay from 'embla-carousel-autoplay';

// Type pour les vidéos locales
interface LocalVideo {
  id: string;
  title: string;
  description: string;
  duration: number;
  views: number;
  uploadDate: string;
  thumbnail: string;
  videoUrl: string;
  authorName: string;
  authorAvatar: string;
}

interface ExtendedVideo extends LocalVideo {
  videoId: string;
  playlistId: string;
  playlistName: string;
  originalAuthor: Author;
}

export default function VideosPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [authors, setAuthors] = useState<Author[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [allVideos, setAllVideos] = useState<ExtendedVideo[]>([]);
  const [currentVideo, setCurrentVideo] = useState<ExtendedVideo | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  // Fonction pour sélectionner des vidéos aléatoires
  const selectRandomVideos = (videos: ExtendedVideo[], count = 50): ExtendedVideo[] => {
    const shuffled = [...videos].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  };

  // Chargement initial
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        // Charger le fichier JSON depuis le dossier public
        const response = await fetch('/videos.json'); // Ajuste le chemin si nécessaire
        if (!response.ok) {
          throw new Error('Failed to fetch videos.json');
        }
        const videosData = await response.json();

        // Charger les auteurs et playlists
        const [authorsData, playlistsData] = await Promise.all([
          getAuthors(),
          getPlaylists(),
        ]);

        setAuthors(authorsData);
        setPlaylists(playlistsData);

        // Transformer les données vidéo pour les adapter à l'interface existante
        const extendedVideos: ExtendedVideo[] = videosData.videos.map((video: LocalVideo) => {
          // Associer chaque vidéo à une playlist et un auteur
          const author = authorsData[0] || { id: 'default', name: video.authorName, imageUrl: video.authorAvatar };
          const playlist = playlistsData[0] || { id: 'default', name: 'Playlist Principale', url: '', imageUrl: '', authorId: author.id, language: 'fr' };

          return {
            ...video,
            videoId: video.id,
            playlistId: playlist.id,
            playlistName: playlist.name,
            originalAuthor: author,
          };
        });

        setAllVideos(extendedVideos);
      } catch (error) {
        console.error('Failed to fetch video data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const filteredPlaylists = useMemo(() => {
    return playlists.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, playlists]);

  const filteredVideos = useMemo(() => {
    if (!searchTerm) {
      // Retourner des vidéos aléatoires quand pas de recherche
      return selectRandomVideos(allVideos, Math.min(allVideos.length, 50));
    }
    return allVideos.filter(v =>
      v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.originalAuthor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.playlistName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, allVideos]);

  const handleVideoClick = (video: ExtendedVideo) => {
    setCurrentVideo(video);
    setIsPlayerOpen(true);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-[80vh]"><Loader2 className="h-10 w-10 animate-spin" /></div>;
  }

 











  return (

<div className="w-full max-w-full mx-auto px-2 sm:px-4">
  {/* Authors Carousel */}
  <section className="mt-6 px-0">
    {authors.length > 0 ? (
      <div className="flex gap-3 overflow-x-auto pb-2">
        {authors.map((author) => (
          <div key={author.id} className="flex flex-col items-center w-16 sm:w-20 flex-shrink-0">
            <Avatar className="h-12 w-12 sm:h-14 sm:w-14 border-2 border-primary/50">
              <AvatarImage src={author.imageUrl} alt={author.name} />
              <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <p className="text-xs font-medium truncate w-full text-center">{author.name}</p>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-muted-foreground text-sm">Aucun auteur disponible.</p>
    )}
  </section>

  {/* Search Bar */}
  <div className="px-2 sm:px-4">
    <div className="relative w-full max-w-md mx-auto">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
      <Input
        placeholder="Rechercher une vidéo ou une playlist..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-10 pr-4 h-12 text-base"
      />
    </div>
  </div>
  {/* Playlists Carousel */}  
  




      {/* Main Videos Section */}
      <section>
        <h2 className="text-2xl font-headline font-semibold mb-4">
          {searchTerm ? `Résultats (${filteredVideos.length})` : 'Suggestions'}
        </h2>

        {filteredVideos.length > 0 ? (
          <div className="space-y-3">
            {filteredVideos.map(video => {
              const duration = Math.floor(video.duration / 60) + ':' + 
                              (video.duration % 60).toString().padStart(2, '0');
              const views = video.views >= 1000000 ? 
                          `${(video.views / 1000000).toFixed(1)}M` : 
                          video.views >= 1000 ? 
                          `${(video.views / 1000).toFixed(1)}K` : 
                          video.views.toString();

              return (
                <div 
                  key={video.id} 
                  className="flex gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer group transition-colors"
                  onClick={() => handleVideoClick(video)}
                >
                  {/* Thumbnail */}
                  <div className="relative flex-shrink-0 w-40 h-24 rounded-lg overflow-hidden">
                    <Image 
                      src={video.thumbnail || `https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`}
                      alt={video.title} 
                      fill 
                      className="object-cover transition-transform group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <PlayCircle className="h-8 w-8 text-white/90" />
                    </div>
                    <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                      {duration}
                    </div>
                  </div>

                  {/* Video Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm leading-tight line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                      {video.title}
                    </h3>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <Avatar className="h-4 w-4">
                        <AvatarImage src={video.originalAuthor.imageUrl} alt={video.originalAuthor.name} data-ai-hint="person face" />
                        <AvatarFallback className="text-[10px]">{video.originalAuthor.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="truncate">{video.originalAuthor.name || 'Auteur Inconnu'}</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{views} vues</span>
                      <span>•</span>
                      <span>Playlist: {video.playlistName}</span>
                    </div>
                  </div>

                  {/* Menu button */}
                  <div className="flex-shrink-0 flex items-start pt-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Logique pour le menu contextuel
                      }}
                    >
                      <span className="text-lg leading-none">⋮</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">Aucune vidéo ne correspond à votre recherche.</p>
        )}
      </section>

      {/* Video Player Modal */}
      {isPlayerOpen && currentVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 animate-in fade-in-0" onClick={() => setIsPlayerOpen(false)}>
          <div className="relative w-full max-w-3xl aspect-video mx-4" onClick={(e) => e.stopPropagation()}>
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${currentVideo.videoId}?autoplay=1`}
              title={currentVideo.title}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              className="rounded-lg shadow-lg"
            />
            <button
              onClick={() => setIsPlayerOpen(false)}
              className="absolute -top-2 -right-2 text-white bg-black/50 rounded-full p-1"
              aria-label="Fermer"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}