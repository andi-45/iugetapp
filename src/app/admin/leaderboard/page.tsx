// src/app/admin/leaderboard/page.tsx
'use client'

import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Trophy, EyeOff, Eye } from "lucide-react"
import { getUsers, type UserProfile } from "@/services/user-service"
import { getLeaderboardExclusions, toggleLeaderboardExclusion } from "@/services/leaderboard-service";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function AdminLeaderboardPage() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [excludedIds, setExcludedIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isToggling, setIsToggling] = useState<string | null>(null);
    const { toast } = useToast();

    const fetchData = async () => {
        setIsLoading(true);
        const [usersData, excludedData] = await Promise.all([
            getUsers(),
            getLeaderboardExclusions()
        ]);
        
        // Sort users by points descending and take top 20
        const sortedUsers = usersData
            .sort((a, b) => (b.points || 0) - (a.points || 0))
            .slice(0, 20);

        setUsers(sortedUsers);
        setExcludedIds(excludedData);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);
    
    const handleToggleExclusion = async (userId: string, isExcluded: boolean) => {
        setIsToggling(userId);
        try {
            await toggleLeaderboardExclusion(userId, !isExcluded);
            toast({
                title: "Classement mis à jour",
                description: `L'utilisateur a été ${!isExcluded ? "exclu" : "réinclus"} du classement.`
            });
            // Refetch to update the state
            await fetchData();
        } catch (error) {
             toast({ title: "Erreur", description: "Impossible de modifier le statut de l'utilisateur.", variant: "destructive" });
        } finally {
            setIsToggling(null);
        }
    }

    return (
        <div className="flex-1 space-y-8">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-headline font-bold">Gestion du Classement</h1>
                    <p className="text-muted-foreground mt-2">
                        Consultez et modérez le classement des utilisateurs par points.
                    </p>
                </div>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>Top 20 des Utilisateurs</CardTitle>
                    <CardDescription>
                        Les utilisateurs exclus n'apparaîtront pas dans le classement public.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-16">Rang</TableHead>
                                <TableHead>Utilisateur</TableHead>
                                <TableHead>Points</TableHead>
                                <TableHead>Statut Classement</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                    </TableCell>
                                </TableRow>
                            ) : users.map((user, index) => {
                                const isExcluded = excludedIds.includes(user.uid);
                                return (
                                <TableRow key={user.uid} className={isExcluded ? "bg-muted/50" : ""}>
                                    <TableCell className="font-bold text-lg text-muted-foreground">{index + 1}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage src={(user as any).photoURL || undefined} alt={user.displayName} />
                                                <AvatarFallback>{user.displayName?.[0] || 'U'}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{user.displayName}</p>
                                                <p className="text-sm text-muted-foreground">{user.schoolClass}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-bold flex items-center gap-2">
                                            <Trophy className="h-4 w-4 text-amber-500" />
                                            {user.points || 0}
                                        </div>
                                    </TableCell>
                                     <TableCell>
                                        <Badge variant={isExcluded ? "secondary" : "default"}>
                                            {isExcluded ? "Exclu" : "Visible"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button 
                                            variant="ghost" 
                                            size="sm"
                                            onClick={() => handleToggleExclusion(user.uid, isExcluded)}
                                            disabled={isToggling === user.uid}
                                        >
                                            {isToggling === user.uid ? <Loader2 className="h-4 w-4 animate-spin"/> : (
                                                isExcluded ? <Eye className="mr-2 h-4 w-4"/> : <EyeOff className="mr-2 h-4 w-4"/>
                                            )}
                                            {isExcluded ? "Réinclure" : "Exclure"}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )})}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
