
// src/app/admin/courses/page.tsx
'use client'

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
import { MoreHorizontal, PlusCircle, GraduationCap, Loader2 } from "lucide-react"
import Image from "next/image"
import { getCourses, type Course } from "@/services/course-service";
import { useEffect, useState } from "react";

export default function AdminCoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getCourses().then(data => {
            setCourses(data);
            setIsLoading(false);
        });
    }, []);

    return (
        <div className="flex-1 space-y-8">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-headline font-bold">Gestion des Cours</h1>
                    <p className="text-muted-foreground mt-2">
                        Ajoutez, modifiez ou supprimez des cours sur la plateforme.
                    </p>
                </div>
                 <Button asChild>
                    <Link href="/admin/courses/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Ajouter un cours
                    </Link>
                </Button>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>Liste des Cours</CardTitle>
                    <CardDescription>
                        Gérez tous les cours disponibles pour les étudiants.
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
                                <TableHead>Matière</TableHead>
                                <TableHead className="hidden md:table-cell">Classes</TableHead>
                                <TableHead>
                                    <span className="sr-only">Actions</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                    </TableCell>
                                </TableRow>
                            ) : courses.map((course) => (
                                <TableRow key={course.id}>
                                    <TableCell className="hidden sm:table-cell">
                                        <Image
                                          alt={course.title}
                                          className="aspect-square rounded-md object-cover"
                                          height="64"
                                          src={course.imageUrl}
                                          width="64"
                                          data-ai-hint={course.imageHint}
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">{course.title}</TableCell>
                                    <TableCell>
                                        <Badge variant={course.status === 'published' ? 'default' : 'secondary'}>
                                            {course.status === 'published' ? 'Publié' : 'Brouillon'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                          <GraduationCap className="h-4 w-4" />
                                          {course.subjectName}
                                        </div>
                                    </TableCell>
                                     <TableCell className="hidden md:table-cell">
                                        <div className="flex gap-1 flex-wrap">
                                            {course.classes.map(c => <Badge key={c} variant="secondary">{c}</Badge>)}
                                        </div>
                                    </TableCell>
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
                                                <DropdownMenuItem asChild><Link href={`/admin/courses/edit?id=${course.id}`}>Modifier</Link></DropdownMenuItem>
                                                <DropdownMenuItem asChild><Link href={`/admin/courses/details?id=${course.id}`}>Voir les détails</Link></DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive">Supprimer</DropdownMenuItem>
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
