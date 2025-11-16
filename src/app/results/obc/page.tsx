// src/app/results/obc/page.tsx
'use client'

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Search, Award, Frown, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

// --- Client-side Action ---

export interface ExamResult {
    id: number;
    nom_du_candidat: string;
    matricule: string;
    sexe: string;
    date_de_naissance: string;
    lieu_de_naissance: string;
    abreviation_examen: string;
    abreviation_serie: string;
    décision: string;
    annee: number;
}

export interface ApiResponse {
    status: 'success' | 'error';
    count: number;
    resultats: ExamResult[];
    message?: string;
}

async function getOBCResults(matricule: string, annee: string): Promise<ApiResponse> {
    try {
        const settingsDocRef = doc(db, 'settings', 'examResults');
        const settingsDoc = await getDoc(settingsDocRef);

        if (!settingsDoc.exists() || !settingsDoc.data().obcApiUrl) {
            throw new Error("Le service de consultation des résultats de l'OBC n'est pas configuré.");
        }

        const apiUrl = new URL(settingsDoc.data().obcApiUrl);
        apiUrl.searchParams.append('matricule', matricule);
        apiUrl.searchParams.append('annee', annee);
        
        const response = await fetch(apiUrl.toString());

        if (!response.ok) {
            try {
                const errorData = await response.json();
                throw new Error(errorData.message || `Erreur du serveur: ${response.statusText}`);
            } catch (jsonError) {
                 throw new Error(`Erreur du serveur: ${response.statusText}`);
            }
        }

        const data: ApiResponse = await response.json();
        return data;

    } catch (error: any) {
        console.error("Erreur lors de la requête API:", error);
        return {
            status: 'error',
            count: 0,
            resultats: [],
            message: error.message || "Impossible de contacter le service des résultats."
        };
    }
}


// --- Component ---

const resultsSchema = z.object({
  matricule: z.string().min(5, { message: "Le matricule est requis." }),
  annee: z.string().length(4, { message: "L'année doit comporter 4 chiffres." }),
});

type ResultsFormValues = z.infer<typeof resultsSchema>;

export default function OBCResultsPage() {
    const [result, setResult] = useState<ExamResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searched, setSearched] = useState(false);
    const resultsRef = useRef<HTMLDivElement>(null);

    const form = useForm<ResultsFormValues>({
        resolver: zodResolver(resultsSchema),
        defaultValues: { matricule: '', annee: new Date().getFullYear().toString() },
    });

    async function onSubmit(values: ResultsFormValues) {
        setIsLoading(true);
        setError(null);
        setResult(null);
        setSearched(true);
        try {
            const apiResponse = await getOBCResults(values.matricule, values.annee);
            if (apiResponse.status === 'success' && apiResponse.count > 0) {
                setResult(apiResponse.resultats[0]);
            } else {
                 setError(apiResponse.message || "Aucun résultat trouvé pour ces informations.");
            }
        } catch (e: any) {
            setError(e.message || "Une erreur s'est produite lors de la communication avec le serveur.");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (!isLoading && searched && resultsRef.current) {
            resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [isLoading, searched]);

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 10 }, (_, i) => (currentYear - i).toString());

    return (
        <div className="flex-1 space-y-8 p-4 md:p-8">
             <Button asChild variant="outline" size="sm" className="mb-4">
                <Link href="/results">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour à la sélection
                </Link>
            </Button>
            <header className="text-center">
                <h1 className="text-4xl font-headline font-bold text-gray-800 dark:text-white">Résultats OBC</h1>
                <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Vérifiez les résultats du BEPC, Probatoire et Baccalauréat.</p>
            </header>

            <Card className="max-w-xl mx-auto">
                <CardHeader>
                    <CardTitle>Rechercher un résultat</CardTitle>
                    <CardDescription>Veuillez entrer l'année de l'examen et votre matricule.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="annee"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Année de l'examen</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    {years.map(year => (
                                                        <SelectItem key={year} value={year}>{year}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="matricule"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Matricule</FormLabel>
                                            <FormControl><Input {...field} placeholder="Votre matricule..." /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                                Rechercher
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <div ref={resultsRef} className="scroll-mt-8">
                {isLoading && (
                    <div className="text-center p-8">
                        <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
                        <p className="mt-2 text-muted-foreground">Recherche en cours...</p>
                    </div>
                )}

                {searched && !isLoading && (
                    <div className="mt-8">
                        {result ? (
                            <Card className="max-w-2xl mx-auto animate-in fade-in-0 duration-500">
                                <CardHeader className="text-center items-center">
                                    <div className={`p-4 rounded-full ${result.décision.toLowerCase().includes('admis') ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
                                        {result.décision.toLowerCase().includes('admis') ? <Award className="h-10 w-10 text-green-600 dark:text-green-400" /> : <Frown className="h-10 w-10 text-red-600 dark:text-red-400" />}
                                    </div>
                                    <CardTitle className="text-3xl font-bold">{result.nom_du_candidat}</CardTitle>
                                    <CardDescription>Résultat de l'examen {result.abreviation_examen} {result.annee}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="text-center">
                                        <p className="text-lg">Décision :</p>
                                        <Badge className={`text-2xl font-bold px-6 py-2 mt-1 ${result.décision.toLowerCase().includes('admis') ? 'bg-green-600' : 'bg-destructive'}`}>
                                            {result.décision}
                                        </Badge>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 border-t pt-4">
                                        <div className="space-y-1"><p className="text-sm text-muted-foreground">Matricule</p><p className="font-semibold">{result.matricule}</p></div>
                                        <div className="space-y-1"><p className="text-sm text-muted-foreground">Sexe</p><p className="font-semibold">{result.sexe}</p></div>
                                        <div className="space-y-1"><p className="text-sm text-muted-foreground">Date de Naissance</p><p className="font-semibold">{result.date_de_naissance}</p></div>
                                        <div className="space-y-1"><p className="text-sm text-muted-foreground">Lieu de Naissance</p><p className="font-semibold">{result.lieu_de_naissance}</p></div>
                                        <div className="space-y-1"><p className="text-sm text-muted-foreground">Examen</p><p className="font-semibold">{result.abreviation_examen}</p></div>
                                        <div className="space-y-1"><p className="text-sm text-muted-foreground">Série</p><p className="font-semibold">{result.abreviation_serie}</p></div>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Alert variant="destructive" className="max-w-xl mx-auto">
                                <Info className="h-4 w-4" />
                                <AlertTitle>Aucun Résultat</AlertTitle>
                                <AlertDescription>
                                    {error || "Nous n'avons trouvé aucun résultat correspondant à votre recherche. Veuillez vérifier les informations et réessayer."}
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
