// src/app/admin/promo/page.tsx
'use client';

import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getPromos, deletePromo, type PromoContent, updatePromoOrder } from "@/services/promo-service";
import { MoreHorizontal, PlusCircle, Edit, Trash2, Loader2, GripVertical, Megaphone } from "lucide-react";
import { PromoForm } from "./promo-form";
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
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

type FormState = {
    mode: 'add' | 'edit';
    isOpen: boolean;
    promo?: PromoContent | null;
}

export default function AdminPromoPage() {
    const [promos, setPromos] = useState<PromoContent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [formState, setFormState] = useState<FormState>({ mode: 'add', isOpen: false });
    const { toast } = useToast();

    const fetchPromos = async () => {
        setIsLoading(true);
        const data = await getPromos();
        setPromos(data);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchPromos();
    }, []);

    const handleOpenForm = (mode: FormState['mode'], promo?: PromoContent) => {
        setFormState({ mode, promo, isOpen: true });
    };

    const handleCloseForm = (refresh: boolean) => {
        setFormState({ ...formState, isOpen: false });
        if (refresh) {
            fetchPromos();
        }
    };

    const handleDelete = async (id: string, title: string) => {
        try {
            await deletePromo(id);
            toast({ title: "Publicité supprimée", description: `La publicité "${title}" a été supprimée.` });
            fetchPromos();
        } catch (error) {
            toast({ title: "Erreur", description: "Impossible de supprimer la publicité.", variant: "destructive" });
        }
    };
    
    // Drag and drop logic
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        e.dataTransfer.setData("promoIndex", index.toString());
    };

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
        const dragIndex = parseInt(e.dataTransfer.getData("promoIndex"), 10);
        const draggedItem = promos[dragIndex];
        const newPromos = [...promos];
        newPromos.splice(dragIndex, 1);
        newPromos.splice(dropIndex, 0, draggedItem);
        
        // Update order property
        const updatedOrderPromos = newPromos.map((p, index) => ({ ...p, order: index }));
        setPromos(updatedOrderPromos);

        // Save new order to backend
        try {
            await updatePromoOrder(updatedOrderPromos.map(p => ({ id: p.id, order: p.order })));
            toast({ title: "Ordre mis à jour", description: "L'ordre des publicités a été sauvegardé." });
        } catch (error) {
            toast({ title: "Erreur", description: "Impossible de sauvegarder le nouvel ordre.", variant: "destructive" });
            fetchPromos(); // Revert on error
        }
    };

    return (
        <div className="flex-1 space-y-8">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-headline font-bold flex items-center gap-3"><Megaphone /> Gestion de la Publicité</h1>
                    <p className="text-muted-foreground mt-2">
                        Gérez le contenu du carrousel publicitaire sur la page d'accueil.
                    </p>
                </div>
                <Button onClick={() => handleOpenForm('add')}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Ajouter une publicité
                </Button>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>Liste des Publicités</CardTitle>
                    <CardDescription>Glissez-déposez pour réorganiser l'ordre d'affichage.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-48">
                            <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : promos.length > 0 ? (
                        <div className="space-y-3">
                            {promos.map((promo, index) => (
                                <div
                                    key={promo.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, index)}
                                    onDrop={(e) => handleDrop(e, index)}
                                    onDragOver={(e) => e.preventDefault()}
                                    className="flex items-center gap-4 p-3 border rounded-lg bg-background hover:bg-muted/50 cursor-grab"
                                >
                                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                                    <Image src={promo.imageUrl} alt={promo.title} width={100} height={56} className="rounded-md object-cover aspect-video" />
                                    <div className="flex-1">
                                        <h3 className="font-semibold">{promo.title}</h3>
                                        <p className="text-sm text-muted-foreground truncate">{promo.description}</p>
                                    </div>
                                    <Badge variant={promo.isActive ? 'default' : 'secondary'}>
                                        {promo.isActive ? 'Actif' : 'Inactif'}
                                    </Badge>
                                    <div>
                                        <Button variant="ghost" size="icon" onClick={() => handleOpenForm('edit', promo)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Cette action supprimera définitivement la publicité "{promo.title}".
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(promo.id, promo.title)}>Confirmer</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            <p>Aucune publicité créée. Cliquez sur "Ajouter une publicité" pour commencer.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {formState.isOpen && (
                <PromoForm
                    mode={formState.mode}
                    isOpen={formState.isOpen}
                    onClose={handleCloseForm}
                    promo={formState.promo}
                    lastOrder={promos.length > 0 ? Math.max(...promos.map(p => p.order)) : 0}
                />
            )}
        </div>
    )
}
