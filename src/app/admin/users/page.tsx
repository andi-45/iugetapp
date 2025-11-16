
// src/app/admin/users/page.tsx
'use client'

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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MoreHorizontal, PlusCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { getUsers, type UserProfile } from "@/services/user-service"
import { useEffect, useState } from "react"

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getUsers().then(data => {
            setUsers(data);
            setIsLoading(false);
        });
    }, []);

    return (
        <div className="flex-1 space-y-8">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-headline font-bold">Gestion des Utilisateurs</h1>
                    <p className="text-muted-foreground mt-2">
                        Liste de tous les utilisateurs inscrits sur la plateforme.
                    </p>
                </div>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Ajouter un utilisateur
                </Button>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>Utilisateurs</CardTitle>
                    <CardDescription>
                        Gérez les utilisateurs, consultez leurs profils et leurs activités.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="hidden w-[100px] sm:table-cell">
                                    <span className="sr-only">Avatar</span>
                                </TableHead>
                                <TableHead>Nom</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead className="hidden md:table-cell">Classe</TableHead>
                                <TableHead className="hidden md:table-cell">Inscrit le</TableHead>
                                <TableHead>
                                    <span className="sr-only">Actions</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                    </TableCell>
                                </TableRow>
                            ) : users.map((user) => (
                                <TableRow key={user.uid}>
                                    <TableCell className="hidden sm:table-cell">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={(user as any).photoURL || undefined} alt={user.displayName} />
                                            <AvatarFallback>{user.displayName?.[0] || 'U'}</AvatarFallback>
                                        </Avatar>
                                    </TableCell>
                                    <TableCell className="font-medium">{user.displayName}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        <Badge variant="outline">{user.schoolClass} {user.series?.toUpperCase()}</Badge>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">{new Date(user.createdAt).toLocaleDateString('fr-FR')}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Toggle menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/admin/users/details?id=${user.uid}`}>Voir les détails</Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>Modifier</DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive">Désactiver</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
