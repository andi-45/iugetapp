// src/app/community/page.tsx
'use client'

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Medal, Trophy } from "lucide-react";
import { useAuth } from '@/hooks/use-auth';
import { getUsers, type UserProfile } from '@/services/user-service';
import { getLeaderboardExclusions } from '@/services/leaderboard-service';
import Link from 'next/link';

function getRankColor(rank: number): string {
    if (rank === 0) return 'bg-yellow-400 border-yellow-500'; // Gold
    if (rank === 1) return 'bg-gray-300 border-gray-400'; // Silver
    if (rank === 2) return 'bg-yellow-600 border-yellow-700'; // Bronze
    return 'bg-muted border-border';
}

function getRankIcon(rank: number): React.ReactNode {
     if (rank === 0) return <Medal className="h-6 w-6 text-yellow-600" />;
     return <span className="font-bold text-lg">{rank + 1}</span>;
}

export default function CommunityPage() {
    const { user } = useAuth();
    const [leaderboard, setLeaderboard] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setIsLoading(true);
            const [allUsers, excludedIds] = await Promise.all([
                getUsers(),
                getLeaderboardExclusions()
            ]);

            const eligibleUsers = allUsers.filter(u => !excludedIds.includes(u.uid) && u.points != null && u.points > 0);
            const sortedUsers = eligibleUsers.sort((a, b) => (b.points || 0) - (a.points || 0));
            
            setLeaderboard(sortedUsers.slice(0, 10));
            setIsLoading(false);
        };
        
        fetchLeaderboard();
    }, []);

    return (
        <div className="flex-1 space-y-8 p-4 md:p-8">
            <header>
                <h1 className="text-4xl font-headline font-bold text-gray-800 dark:text-white">Classement Général</h1>
                <p className="text-muted-foreground mt-2">Découvrez les étudiants les plus actifs sur la plateforme OnBuch.</p>
            </header>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                </div>
            ) : leaderboard.length > 0 ? (
                <div className="space-y-4 max-w-4xl mx-auto">
                    {leaderboard.map((student, index) => (
                        <Card key={student.uid} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-3 flex items-center gap-4">
                                <div className={`flex items-center justify-center h-12 w-12 rounded-full font-bold text-xl ${getRankColor(index)}`}>
                                    {getRankIcon(index)}
                                </div>
                                <Link href={`/community/profile?id=${student.uid}`} className="flex-1">
                                    <div className="flex items-center gap-4 cursor-pointer">
                                        <Avatar className="h-14 w-14 border-2 border-primary/20">
                                            <AvatarImage src={(student as any).photoURL || ''} alt={student.displayName} />
                                            <AvatarFallback>{student.displayName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <h3 className="font-headline text-lg font-semibold">{student.displayName}</h3>
                                            <p className="text-muted-foreground text-sm">{student.schoolClass} - Série {student.series?.toUpperCase()}</p>
                                        </div>
                                    </div>
                                </Link>
                                <div className="flex items-center gap-2 font-bold text-lg text-amber-600 pr-4">
                                    <Trophy className="h-5 w-5" />
                                    <span>{student.points}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="text-center py-16">
                    <CardContent>
                        <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold">Le classement est encore vide</h3>
                        <p className="text-muted-foreground mt-2">Commencez à étudier pour gagner des points et apparaître ici !</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
