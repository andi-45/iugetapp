
// src/app/admin/news/page.tsx
'use client'

import { useState, useEffect } from "react";
import Link from "next/link";
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
import { MoreHorizontal, PlusCircle, Edit, Trash2, Eye, Loader2 } from "lucide-react"
import Image from "next/image"
import { getNews, deleteNews, type NewsArticle } from "@/services/news-service";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function AdminNewsPage() {
    const [newsItems, setNewsItems] = useState<NewsArticle[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchNews = async () => {
        setIsLoading(true);
        const items = await getNews();
        setNewsItems(items);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchNews();
    }, []);

    const handleDelete = async (id: string, title: string) => {
        try {
            await deleteNews(id);
            toast({ title: "Article supprimé", description: `L'article "${title}" a été supprimé.` });
            fetchNews();
        } catch (error) {
            toast({ title: "Erreur", description: "Impossible de supprimer l'article.", variant: "destructive" });
        }
    }

    return (
        <div className="flex-1 space-y-8">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-headline font-bold">Gestion des Actualités</h1>
                    <p className="text-muted-foreground mt-2">
                        Rédigez, modifiez ou supprimez des articles et des annonces.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/admin/news/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Ajouter un article
                    </Link>
                </Button>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>Liste des Articles</CardTitle>
                    <CardDescription>
                        Gérez tout le contenu du blog et des actualités.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="hidden w-[100px] sm:table-cell">
                                    <span className="sr-only">Image</span>
                                </TableHead>
                                <TableHead>Titre</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead className="hidden md:table-cell">Catégorie</TableHead>
                                <TableHead className="hidden md:table-cell">Date</TableHead>
                                <TableHead>
                                    <span className="sr-only">Actions</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center">
                                        <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                                    </TableCell>
                                </TableRow>
                            ) : newsItems.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="hidden sm:table-cell">
                                        <Image
                                          alt={item.title}
                                          className="aspect-square rounded-md object-cover"
                                          height="64"
                                          src={item.imageUrl}
                                          width="64"
                                          data-ai-hint={item.imageHint}
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">{item.title}</TableCell>
                                    <TableCell>
                                        <Badge variant={item.status === 'published' ? 'default' : 'secondary'}>
                                            {item.status === 'published' ? 'Publié' : 'Brouillon'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">{item.category}</TableCell>
                                    <TableCell className="hidden md:table-cell">{item.date}</TableCell>
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
                                                    <Link href={`/admin/news/edit?id=${item.id}`}><Edit className="mr-2 h-4 w-4" />Modifier</Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/news/article?slug=${item.slug}`}><Eye className="mr-2 h-4 w-4" />Voir</Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <div className="flex items-center w-full"><Trash2 className="mr-2 h-4 w-4" />Supprimer</div>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                Cette action est irréversible et supprimera l'article "{item.title}".
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDelete(item.id, item.title)}>
                                                                    Confirmer
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </DropdownMenuItem>
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
