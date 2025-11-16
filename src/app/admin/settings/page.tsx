// src/app/admin/settings/page.tsx
'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Globe, KeyRound, Hammer, Loader2, Bot, GraduationCap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Textarea } from "@/components/ui/textarea";

const apiKeysSchema = z.object({
  gemini: z.string().min(10, "Veuillez entrer au moins une clé API."),
});
type ApiKeysFormValues = z.infer<typeof apiKeysSchema>;

const tutorSchema = z.object({
    systemPrompt: z.string().min(20, "L'instruction doit contenir au moins 20 caractères."),
});
type TutorFormValues = z.infer<typeof tutorSchema>;

const resultsSchema = z.object({
    obcApiUrl: z.string().url("URL de l'API OBC invalide."),
    gceALevelPdfUrl: z.string().url("URL du PDF GCE A-Level invalide."),
    gceOLevelPdfUrl: z.string().url("URL du PDF GCE O-Level invalide."),
});
type ResultsFormValues = z.infer<typeof resultsSchema>;

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isTutorLoading, setIsTutorLoading] = useState(false);
  const [isResultsLoading, setIsResultsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const apiForm = useForm<ApiKeysFormValues>({
    resolver: zodResolver(apiKeysSchema), defaultValues: { gemini: "" },
  });
  const tutorForm = useForm<TutorFormValues>({
      resolver: zodResolver(tutorSchema), defaultValues: { systemPrompt: "" }
  });
  const resultsForm = useForm<ResultsFormValues>({
      resolver: zodResolver(resultsSchema), defaultValues: { obcApiUrl: "", gceALevelPdfUrl: "", gceOLevelPdfUrl: "" }
  });

  useEffect(() => {
    async function fetchSettings() {
      setIsFetching(true);
      const apiKeysRef = doc(db, 'settings', 'apiKeys');
      const tutorRef = doc(db, 'settings', 'aiTutor');
      const resultsRef = doc(db, 'settings', 'examResults');
      
      const [apiKeysSnap, tutorSnap, resultsSnap] = await Promise.all([
          getDoc(apiKeysRef), 
          getDoc(tutorRef),
          getDoc(resultsRef)
      ]);

      if (apiKeysSnap.exists()) apiForm.reset(apiKeysSnap.data());
      if (tutorSnap.exists()) tutorForm.reset(tutorSnap.data());
      if (resultsSnap.exists()) resultsForm.reset(resultsSnap.data());
      
      setIsFetching(false);
    }
    fetchSettings();
  }, [apiForm, tutorForm, resultsForm]);


  async function onApiSubmit(data: ApiKeysFormValues) {
    setIsLoading(true);
    try {
      await setDoc(doc(db, 'settings', 'apiKeys'), data, { merge: true });
      toast({ title: "Clés API mises à jour", description: "Vos clés API ont été enregistrées." });
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible d'enregistrer les clés API.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }
  
  async function onTutorSubmit(data: TutorFormValues) {
    setIsTutorLoading(true);
    try {
        await setDoc(doc(db, 'settings', 'aiTutor'), data, { merge: true });
        toast({ title: "Tuteur IA mis à jour", description: "Les instructions du tuteur ont été enregistrées." });
    } catch (error) {
        toast({ title: "Erreur", description: "Impossible d'enregistrer les instructions.", variant: "destructive" });
    } finally {
        setIsTutorLoading(false);
    }
  }

  async function onResultsSubmit(data: ResultsFormValues) {
    setIsResultsLoading(true);
    try {
        await setDoc(doc(db, 'settings', 'examResults'), data, { merge: true });
        toast({ title: "Configuration des résultats mise à jour", description: "Les liens ont été enregistrés." });
    } catch (error) {
        toast({ title: "Erreur", description: "Impossible d'enregistrer les liens des résultats.", variant: "destructive" });
    } finally {
        setIsResultsLoading(false);
    }
  }

  return (
    <div className="flex-1 space-y-8">
      <header>
        <h1 className="text-4xl font-headline font-bold">Paramètres</h1>
        <p className="text-muted-foreground mt-2">Gérez la configuration globale de la plateforme OnBuch.</p>
      </header>

      {isFetching ? <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8" /></div> : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Bot /> Paramètres du Tuteur IA</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...tutorForm}>
                        <form onSubmit={tutorForm.handleSubmit(onTutorSubmit)} className="space-y-4">
                             <FormField control={tutorForm.control} name="systemPrompt" render={({ field }) => (
                                <FormItem><FormLabel>Instruction Système</FormLabel><FormControl><Textarea rows={6} {...field} /></FormControl><FormMessage /></FormItem>
                             )}/>
                            <Button type="submit" disabled={isTutorLoading}>{isTutorLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Enregistrer les instructions</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><KeyRound /> Clés API et Intégrations</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...apiForm}>
                        <form onSubmit={apiForm.handleSubmit(onApiSubmit)} className="space-y-4">
                        <FormField control={apiForm.control} name="gemini" render={({ field }) => (
                            <FormItem><FormLabel>Clés API Google Gemini (une par ligne)</FormLabel><FormControl><Textarea rows={5} {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <Button type="submit" disabled={isLoading}>{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Mettre à jour les clés</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><GraduationCap /> Configuration des Résultats d'Examen</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...resultsForm}>
                        <form onSubmit={resultsForm.handleSubmit(onResultsSubmit)} className="space-y-4">
                            <FormField control={resultsForm.control} name="obcApiUrl" render={({ field }) => (
                                <FormItem><FormLabel>URL de l'API pour les résultats OBC</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={resultsForm.control} name="gceALevelPdfUrl" render={({ field }) => (
                                <FormItem><FormLabel>URL du PDF pour GCE A-Level</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={resultsForm.control} name="gceOLevelPdfUrl" render={({ field }) => (
                                <FormItem><FormLabel>URL du PDF pour GCE O-Level</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <Button type="submit" disabled={isResultsLoading}>{isResultsLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Enregistrer les liens</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

          </div>
          <div className="space-y-8">
            <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Hammer /> Maintenance</CardTitle></CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                        <h4 className="font-semibold">Mode Maintenance</h4>
                        <p className="text-sm text-muted-foreground">Rend le site inaccessible.</p>
                        </div>
                        <Switch id="maintenance-mode" />
                    </div>
                </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
