
// src/app/community/discover-tab.tsx
'use client'

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, UserPlus, Loader2, Check, Clock, Users } from "lucide-react";
import { useAuth } from '@/hooks/use-auth';
import { getUsers, type UserProfile } from '@/services/user-service';
import { sendConnectionRequest } from '@/services/connection-service';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export function DiscoverTab() {
  const { user, refreshUserProfile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = useCallback(async () => {
    if (!user || !user.profile) return;
    setIsLoading(true);
    const allUsers = await getUsers();
    const filtered = allUsers.filter(u => 
      u.uid !== user.uid && 
      u.schoolClass === user.profile?.schoolClass
    );
    setUsers(filtered);
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    return users.filter(u =>
      u.displayName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const handleConnect = async (receiverId: string) => {
    if (!user) return;
    setIsConnecting(receiverId);
    try {
        await sendConnectionRequest(user.uid, receiverId);
        await refreshUserProfile();
        toast({ title: "Demande envoyée", description: "Votre demande de connexion a été envoyée." });
    } catch (error) {
        toast({ title: "Erreur", description: "Impossible d'envoyer la demande.", variant: "destructive" });
        console.error(error);
    } finally {
        setIsConnecting(null);
    }
  }

  const getConnectionStatus = (otherUser: UserProfile) => {
      const sentRequests = user?.profile?.sentConnectionRequests || [];
      const receivedRequests = user?.profile?.receivedConnectionRequests?.map(r => r.from) || [];
      const connections = user?.profile?.connections || [];

      if (connections.includes(otherUser.uid)) {
          return { status: 'connected', text: 'Connecté', icon: <Check className="h-4 w-4" /> };
      }
      if (sentRequests.includes(otherUser.uid)) {
          return { status: 'pending', text: 'Demande envoyée', icon: <Clock className="h-4 w-4" /> };
      }
      if (receivedRequests.includes(otherUser.uid)) {
          return { status: 'action_required', text: 'Répondre', icon: <UserPlus className="h-4 w-4" />, link: '/community/requests' };
      }
      return { status: 'not_connected', text: 'Se connecter', icon: <UserPlus className="h-4 w-4" /> };
  }

   return (
        <Card className="mt-4">
            <CardContent className="pt-6 space-y-6">
                <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                        placeholder="Rechercher un camarade..." 
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map(member => {
                                const connection = getConnectionStatus(member);
                                return (
                                    <Card key={member.uid} className="text-center hover:shadow-lg transition-shadow">
                                        <CardContent className="p-6 flex flex-col items-center">
                                            <Link href={`/community/profile?id=${member.uid}`}>
                                                <Avatar className="h-24 w-24 mb-4 border-4 border-primary/20 cursor-pointer">
                                                    <AvatarImage src={(member as any).photoURL || ''} alt={member.displayName} />
                                                    <AvatarFallback>{member.displayName.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                            </Link>
                                            <h3 className="font-headline text-xl font-semibold">{member.displayName}</h3>
                                            <p className="text-muted-foreground text-sm">Série {member.series?.toUpperCase()}</p>
                                            
                                            <Button 
                                                className="mt-4 w-full"
                                                onClick={() => {
                                                    if (connection.status === 'not_connected') handleConnect(member.uid)
                                                    if (connection.status === 'action_required' && connection.link) router.push(connection.link)
                                                }}
                                                disabled={isConnecting === member.uid || connection.status === 'pending' || connection.status === 'connected'}
                                                variant={connection.status === 'connected' ? 'secondary' : 'default'}
                                            >
                                                {isConnecting === member.uid ? (
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                ) : (
                                                    connection.icon
                                                )}
                                                {connection.text}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                )
                            })
                        ) : (
                            <div className="col-span-full text-center py-16 text-muted-foreground">
                                <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                <p>Aucun autre étudiant de votre classe trouvé pour le moment.</p>
                                <p className="text-sm mt-1">Invitez vos amis à rejoindre la plateforme !</p>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
  );
}
