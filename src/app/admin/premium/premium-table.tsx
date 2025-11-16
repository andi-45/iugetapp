'use client'

import { useState, useMemo } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Gem, Loader2, MoreVertical, Download, Contact } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserProfile } from '@/services/user-service';
import { useToast } from '@/hooks/use-toast';
import { activatePremium, deactivatePremium } from '@/services/premium-service';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PremiumTableProps {
    initialUsers: UserProfile[];
}

export function PremiumTable({ initialUsers }: PremiumTableProps) {
    const [users, setUsers] = useState(initialUsers);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
    const [isLoading, setIsLoading] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const pageSize = 50;
    const { toast } = useToast();

    const formatDate = (iso: string | null) => {
        return iso ? new Date(iso).toLocaleDateString('fr-FR') : '-';
    };

    const filteredUsers = useMemo(() => {
        const lowerSearch = search.toLowerCase();

        return [...users]
            .filter(u =>
                (u.displayName?.toLowerCase().includes(lowerSearch) ||
                    u.email?.toLowerCase().includes(lowerSearch)) &&
                (filterStatus === 'all' ||
                    (filterStatus === 'active' && u.isPremium) ||
                    (filterStatus === 'inactive' && !u.isPremium))
            )
            .sort((a, b) => (a.email || '').localeCompare(b.email || ''));
    }, [users, search, filterStatus]);

    const totalPages = Math.ceil(filteredUsers.length / pageSize);

    const paginatedUsers = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filteredUsers.slice(start, start + pageSize);
    }, [filteredUsers, page]);

    const handleActivate = async (userId: string, duration: 'week' | 'month' | 'year') => {
        setIsLoading(userId);
        try {
            await activatePremium(userId, duration);
            let endDate = new Date();
            if (duration === 'week') endDate.setDate(endDate.getDate() + 7);
            if (duration === 'month') endDate.setMonth(endDate.getMonth() + 1);
            if (duration === 'year') endDate.setMonth(endDate.getMonth() + 9);
            setUsers(prev => prev.map(u =>
                u.uid === userId ? { ...u, isPremium: true, premiumExpiresAt: endDate.toISOString() } : u
            ));
            toast({ title: 'Succès', description: 'Le statut premium a été activé.' });
        } catch (error) {
            toast({ title: 'Erreur', description: 'Impossible d\'activer le statut premium.', variant: 'destructive' });
        } finally {
            setIsLoading(null);
        }
    };

    const handleDeactivate = async (userId: string) => {
        setIsLoading(userId);
        try {
            await deactivatePremium(userId);
            setUsers(prev => prev.map(u =>
                u.uid === userId ? { ...u, isPremium: false, premiumExpiresAt: null } : u
            ));
            toast({ title: 'Succès', description: 'Le statut premium a été désactivé.' });
        } catch (error) {
            toast({ title: 'Erreur', description: 'Impossible de désactiver le statut premium.', variant: 'destructive' });
        } finally {
            setIsLoading(null);
        }
    };

    const generateCSV = (data: any[], headers: Record<string, string>, filename: string) => {
        const csvRows = [];
        // Add headers
        csvRows.push(Object.keys(headers).join(','));

        // Add data rows
        for (const row of data) {
            const values = Object.keys(headers).map(headerKey => {
                const value = row[headerKey] !== null && row[headerKey] !== undefined ? row[headerKey] : '';
                return `"${String(value).replace(/"/g, '""')}"`;
            });
            csvRows.push(values.join(','));
        }

        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportSimpleCSV = () => {
        const headers = {
            displayName: 'Nom',
            email: 'Email',
            isPremium: 'Premium',
            premiumExpiresAt: 'Expire le',
        };

        const dataToExport = filteredUsers.map(u => ({
            displayName: u.displayName,
            email: u.email,
            isPremium: u.isPremium ? 'Actif' : 'Inactif',
            premiumExpiresAt: formatDate(u.premiumExpiresAt)
        }));

        generateCSV(dataToExport, headers, 'utilisateurs-premium.csv');
    };
    
    const exportGoogleContactsCSV = () => {
        const headers = {
            'Name': 'Name',
            'Given Name': 'Given Name',
            'Family Name': 'Family Name',
            'Phone 1 - Type': 'Phone 1 - Type',
            'Phone 1 - Value': 'Phone 1 - Value',
            'E-mail 1 - Type': 'E-mail 1 - Type',
            'E-mail 1 - Value': 'E-mail 1 - Value'
        };

        const dataToExport = filteredUsers.map(u => {
            const nameParts = u.displayName.split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';

            return {
                'Name': `user_${u.displayName}`,
                'Given Name': `user_${firstName}`,
                'Family Name': lastName,
                'Phone 1 - Type': 'Mobile',
                'Phone 1 - Value': u.whatsapp || '',
                'E-mail 1 - Type': 'Work',
                'E-mail 1 - Value': u.email || '',
            };
        });

        generateCSV(dataToExport, headers, 'contacts-onbuch-google.csv');
    };

    return (
        <>
            {/* 🔍 Recherche + Filtres + Export */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <Input
                    placeholder="Rechercher par nom ou email..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                    }}
                    className="max-w-sm"
                />

                <div className="flex items-center gap-2">
                    <Select value={filterStatus} onValueChange={(value) => {
                        setFilterStatus(value as 'all' | 'active' | 'inactive');
                        setPage(1);
                    }}>
                        <SelectTrigger className="w-36">
                            <SelectValue placeholder="Filtrer..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tous</SelectItem>
                            <SelectItem value="active">Premium actif</SelectItem>
                            <SelectItem value="inactive">Inactif</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button variant="outline" onClick={exportSimpleCSV}>
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                    <Button variant="outline" onClick={exportGoogleContactsCSV}>
                        <Contact className="w-4 h-4 mr-2" />
                        Google
                    </Button>
                </div>
            </div>

            {/* 🧾 Table */}
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Utilisateur</TableHead>
                        <TableHead>Statut Premium</TableHead>
                        <TableHead>Expire le</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedUsers.map((user) => (
                        <TableRow key={user.uid}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={(user as any).photoURL || undefined} alt={user.displayName} />
                                        <AvatarFallback>{user.displayName?.[0] || 'U'}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">{user.displayName}</p>
                                        <p className="text-sm text-muted-foreground">{user.email}</p>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                {user.isPremium ? (
                                    <Badge className="bg-purple-500 text-white gap-2">
                                        <Gem className="h-4 w-4" /> Actif
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary">Inactif</Badge>
                                )}
                            </TableCell>
                            <TableCell>{formatDate(user.premiumExpiresAt)}</TableCell>
                            <TableCell className="text-right">
                                {isLoading === user.uid ? (
                                    <Loader2 className="h-5 w-5 animate-spin ml-auto" />
                                ) : (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Gérer l'abonnement</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuSub>
                                                <DropdownMenuSubTrigger>Activer</DropdownMenuSubTrigger>
                                                <DropdownMenuSubContent>
                                                    <DropdownMenuItem onClick={() => handleActivate(user.uid, 'week')}>1 Semaine</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleActivate(user.uid, 'month')}>1 Mois</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleActivate(user.uid, 'year')}>1 Année scolaire</DropdownMenuItem>
                                                </DropdownMenuSubContent>
                                            </DropdownMenuSub>
                                            <DropdownMenuItem
                                                className="text-destructive"
                                                onClick={() => handleDeactivate(user.uid)}
                                                disabled={!user.isPremium}
                                            >
                                                Désactiver
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* 📄 Pagination */}
            <div className="flex justify-between items-center mt-4">
                <Button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                    Précédent
                </Button>
                <span>Page {page} / {totalPages}</span>
                <Button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                    Suivant
                </Button>
            </div>
        </>
    );
}
