// src/app/community/requests/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Check, X, UserPlus, Eye } from "lucide-react";
import { useAuth } from '@/hooks/use-auth';
import { getUsers, type UserProfile } from '@/services/user-service';
import { acceptConnectionRequest, rejectConnectionRequest } from '@/services/connection-service';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function ConnectionRequestsPage() {
    const { user, refreshUserProfile } = useAuth();
    const { toast } = useToast();
    const [requests, setRequests] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState<string | null>(null);

    const fetchRequests = useCallback(async () => {
        if (!user || !user.profile?.receivedConnectionRequests) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        const allUsers = await getUsers();
        const requestSenderIds = user.profile.receivedConnectionRequests.map(req => req.from);

        const requestSenders = allUsers.filter(u => 
            requestSenderIds.includes(u.uid)
        );
        setRequests(requestSenders);
        setIsLoading(false);
    }, [user]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleAccept = async (requesterId: string) => {
        if (!user) return;
        setIsProcessing(requesterId);
        try {
            await acceptConnectionRequest(user.uid, requesterId);
            await refreshUserProfile();
            await fetchRequests(); // Re-fetch to update the list
            toast({ title: "Connexion établie", description: "Vous êtes maintenant connecté." });
        } catch (error) {
            toast({ title: "Erreur", description: "Impossible d'accepter la demande.", variant: "destructive" });
        } finally {
            setIsProcessing(null);
        }
    };

    const handleReject = async (requesterId: string) => {
        if (!user) return;
        setIsProcessing(requesterId);
        try {
            await rejectConnectionRequest(user.uid, requesterId);
            await refreshUserProfile();
            await fetchRequests(); // Re-fetch to update the list
            toast({ title: "Demande refusée" });
        } catch (error) {
            toast({ title: "Erreur", description: "Impossible de refuser la demande.", variant: "destructive" });
        } finally {
            setIsProcessing(null);
        }
    };


    return (
        <div className="flex-1 space-y-8 p-4 md:p-8">
            <header>
                <h1 className="text-4xl font-headline font-bold text-gray-800 dark:text-white">Invitations</h1>
                <p className="text-muted-foreground mt-2">Gérez les demandes de connexion des autres étudiants.</p>
            </header>
            <Card>
                <CardHeader>
                    <CardTitle>Demandes de Connexion</CardTitle>
                    <CardDescription>Gérez les demandes de connexion reçues.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : requests.length > 0 ? (
                        <div className="space-y-4">
                            {requests.map(requester => (
                                <div key={requester.uid} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage src={(requester as any).photoURL || ''} alt={requester.displayName} />
                                            <AvatarFallback>{requester.displayName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold">{requester.displayName}</p>
                                            <p className="text-sm text-muted-foreground">{requester.schoolClass} - Série {requester.series?.toUpperCase()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button asChild size="icon" variant="outline" aria-label="Voir le profil">
                                            <Link href={`/community/profile?id=${requester.uid}`}>
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button 
                                            size="icon" 
                                            variant="outline" 
                                            onClick={() => handleAccept(requester.uid)}
                                            disabled={isProcessing === requester.uid}
                                            aria-label="Accepter"
                                        >
                                            {isProcessing === requester.uid ? <Loader2 className="h-4 w-4 animate-spin"/> : <Check className="h-4 w-4 text-green-500" />}
                                        </Button>
                                        <Button 
                                            size="icon" 
                                            variant="outline" 
                                            onClick={() => handleReject(requester.uid)}
                                            disabled={isProcessing === requester.uid}
                                            aria-label="Refuser"
                                        >
                                            {isProcessing === requester.uid ? <Loader2 className="h-4 w-4 animate-spin"/> : <X className="h-4 w-4 text-red-500" />}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                             <UserPlus className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                             <p className="font-semibold">Aucune nouvelle demande</p>
                             <p className="text-sm">Vous n'avez pas de demande de connexion en attente.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
