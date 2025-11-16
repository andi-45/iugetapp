// src/app/resources/video-resource-viewer.tsx
'use client'

import { useState, useEffect } from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { type Resource, type Comment, getComments, addComment, toggleLikeResource } from "@/services/resource-service"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ThumbsUp, MessageSquare, Loader2, Send } from "lucide-react"
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface VideoResourceViewerProps {
    resource: Resource;
    trigger?: React.ReactNode;
    defaultOpen?: boolean;
}

const getYoutubeEmbedUrl = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    if (match && match[2].length === 11) {
        return `https://www.youtube.com/embed/${match[2]}`;
    } else {
        return url.includes('embed') ? url : null;
    }
};

export function VideoResourceViewer({ resource: initialResource, trigger, defaultOpen = false }: VideoResourceViewerProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [resource, setResource] = useState(initialResource);
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState({ comments: true, like: false, newComment: false });
    const [newComment, setNewComment] = useState('');
    const [hasLiked, setHasLiked] = useState<boolean | null>(null);
    const [isOpen, setIsOpen] = useState(defaultOpen);

    const embedUrl = getYoutubeEmbedUrl(resource.url);

    useEffect(() => {
        if (isOpen) {
            setIsLoading(prev => ({ ...prev, comments: true }));
            getComments(resource.id)
                .then(setComments)
                .finally(() => setIsLoading(prev => ({ ...prev, comments: false })));
        }
    }, [resource.id, isOpen]);
    
    // Check initial like status
    useEffect(() => {
        if (user) {
            setHasLiked(initialResource.likes?.includes(user.uid) || false);
        }
    }, [user, initialResource.likes]);
    
     const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
    }

    const handleLike = async () => {
        if (!user) return;
        setIsLoading(prev => ({ ...prev, like: true }));
        try {
            const { liked, likeCount } = await toggleLikeResource(user.uid, resource.id);
            setResource(prev => ({ ...prev, likeCount }));
            setHasLiked(liked); // Update local state
        } catch (error) {
            toast({ title: "Erreur", description: "Impossible de traiter le 'like'.", variant: "destructive" });
        } finally {
            setIsLoading(prev => ({ ...prev, like: false }));
        }
    };

    const handleAddComment = async () => {
        if (!user || !newComment.trim()) return;
        setIsLoading(prev => ({ ...prev, newComment: true }));
        try {
            const addedComment = await addComment(user.uid, resource.id, newComment);
            setComments(prev => [addedComment, ...prev]);
            setResource(prev => ({ ...prev, commentCount: (prev.commentCount || 0) + 1 }));
            setNewComment('');
        } catch (error) {
            toast({ title: "Erreur", description: "Impossible d'ajouter le commentaire.", variant: "destructive" });
        } finally {
            setIsLoading(prev => ({ ...prev, newComment: false }));
        }
    };


    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="max-w-4xl p-0">
                <div className="aspect-video">
                    {embedUrl ? (
                        <iframe
                            width="100%"
                            height="100%"
                            src={embedUrl}
                            title={resource.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            className="rounded-t-lg"
                        ></iframe>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-black text-white rounded-t-lg">
                            URL de la vidéo invalide ou non supportée.
                        </div>
                    )}
                </div>
                <div className="p-6 max-h-[calc(100vh-60%)] overflow-y-auto">
                    <DialogHeader className="mb-4">
                        <DialogTitle className="text-2xl font-headline">{resource.title}</DialogTitle>
                        <DialogDescription>
                            <Badge variant="outline">{resource.subjectName}</Badge>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center gap-4 border-b pb-4">
                        <Button variant="outline" onClick={handleLike} disabled={isLoading.like}>
                            {isLoading.like ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <ThumbsUp className={cn("mr-2 h-4 w-4", hasLiked && "fill-primary text-primary")} />}
                            J'aime ({resource.likeCount || 0})
                        </Button>
                    </div>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="comments" className='border-b-0'>
                            <AccordionTrigger className='py-4'>
                                <div className="flex items-center gap-2 text-muted-foreground font-semibold">
                                    <MessageSquare className="h-5 w-5" />
                                    <span>Commentaires ({resource.commentCount || 0})</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="mt-2 space-y-4">
                                    <h3 className="font-semibold mb-2">Laisser un commentaire</h3>
                                    <div className="flex items-start gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={user?.photoURL || undefined} />
                                            <AvatarFallback>{user?.displayName?.[0] || 'U'}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <Textarea 
                                                placeholder="Ajoutez votre commentaire..." 
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                                rows={2}
                                            />
                                            <Button 
                                                className="mt-2" 
                                                size="sm" 
                                                onClick={handleAddComment}
                                                disabled={isLoading.newComment || !newComment.trim()}
                                            >
                                            {isLoading.newComment ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4" />}
                                                Envoyer
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 space-y-4">
                                    {isLoading.comments ? (
                                        <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin"/></div>
                                    ) : comments.length > 0 ? (
                                        comments.map(comment => (
                                            <div key={comment.id} className="flex items-start gap-3">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={comment.userPhotoURL} />
                                                    <AvatarFallback>{comment.userName.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div className="bg-muted p-3 rounded-lg flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-semibold text-sm">{comment.userName}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                        · {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: fr })}
                                                        </p>
                                                    </div>
                                                    <p className="text-sm mt-1 whitespace-pre-wrap">{comment.text}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center text-sm text-muted-foreground border rounded-lg p-8">
                                            Soyez le premier à commenter cette ressource !
                                        </div>
                                    )}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </DialogContent>
        </Dialog>
    )
}
