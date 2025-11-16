// src/app/admin/premium/page.tsx
'use client'

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { getUsers, type UserProfile } from "@/services/user-service"
import { PremiumTable } from "./premium-table"
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function AdminPremiumPage() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getUsers().then(data => {
            setUsers(data);
            setIsLoading(false);
        })
    }, [])

    return (
        <div className="flex-1 space-y-8">
            <header>
                <h1 className="text-4xl font-headline font-bold">Gestion des Abonnements Premium</h1>
                <p className="text-muted-foreground mt-2">
                    Activez, désactivez et consultez les abonnements premium des utilisateurs.
                </p>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>Liste des Utilisateurs</CardTitle>
                    <CardDescription>
                        Gérez les statuts premium de tous les utilisateurs inscrits.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                         <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin" /></div>
                    ) : (
                         <PremiumTable initialUsers={users} />
                    )}
                </CardContent>
            </Card>
        </div>
    )
}