// src/app/account/page.tsx
"use client"

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, GraduationCap, Phone, Trophy } from "lucide-react";
import { getSchoolStructure, type SchoolClass, type Series } from "@/services/school-structure-service";
import { updateUserProfile } from "@/services/user-service";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


const profileSchema = z.object({
  displayName: z.string().min(2, { message: "Le nom complet doit contenir au moins 2 caractères." }),
  school: z.string().min(3, { message: "Le nom du lycée doit contenir au moins 3 caractères." }),
  schoolClass: z.string().min(1, "Veuillez sélectionner votre classe."),
  series: z.string().min(1, "Veuillez sélectionner votre série."),
  whatsapp: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Numéro WhatsApp invalide." }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function AccountPage() {
  const { user, refreshUserProfile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [schoolStructure, setSchoolStructure] = useState<SchoolClass[]>([]);
  const [availableSeries, setAvailableSeries] = useState<Series[]>([]);
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: "",
      school: "",
      schoolClass: "",
      series: "",
      whatsapp: ""
    },
  });

  useEffect(() => {
    async function loadData() {
        const structure = await getSchoolStructure();
        setSchoolStructure(structure);

        if (user?.profile) {
            form.reset({
                displayName: user.profile.displayName || "",
                school: user.profile.school || "",
                schoolClass: user.profile.schoolClass || "",
                series: user.profile.series || "",
                whatsapp: user.profile.whatsapp || "",
            });

            // Set initial series based on loaded profile class
            const initialClass = structure.find(c => c.name === user.profile?.schoolClass);
            if (initialClass) {
                setAvailableSeries(initialClass.series);
            }
        }
    }
    loadData();
  }, [user, form]);

  const selectedClassName = form.watch("schoolClass");

  useEffect(() => {
    if (selectedClassName && schoolStructure.length > 0) {
      const selectedClassData = schoolStructure.find(c => c.name === selectedClassName);
      setAvailableSeries(selectedClassData?.series || []);
      // Reset series if the new class doesn't include the current series
      const currentSeries = form.getValues("series");
      if (selectedClassData && !selectedClassData.series.find(s => s.value === currentSeries)) {
          form.setValue("series", ""); 
      }
    } else {
      setAvailableSeries([]);
    }
  }, [selectedClassName, form, schoolStructure]);


  async function onProfileSubmit(values: ProfileFormValues) {
    if (!user) return;
    setIsLoading(true);
    try {
        await updateUserProfile(user.uid, values);
        await refreshUserProfile(); // Met à jour le contexte utilisateur globalement
        toast({
            title: "Profil mis à jour",
            description: "Vos informations ont été enregistrées avec succès.",
        });
    } catch(error) {
        toast({
            title: "Erreur",
            description: "Impossible de mettre à jour le profil.",
            variant: "destructive"
        })
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8">
      <header>
        <h1 className="text-4xl font-headline font-bold text-gray-800 dark:text-white">Mon Compte</h1>
        <p className="text-muted-foreground mt-2">Gérez les informations de votre profil et vos préférences.</p>
      </header>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onProfileSubmit)}>
          <div className="grid gap-8 md:grid-cols-3">

            {/* Main column */}
            <div className="md:col-span-2 space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3"><User /> Informations Personnelles</CardTitle>
                    <CardDescription>Ces informations sont visibles par vos connexions.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField control={form.control} name="displayName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom complet</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}/>
                    <FormField control={form.control} name="whatsapp" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Numéro WhatsApp</FormLabel>
                        <FormControl><Input {...field} placeholder="+237..." /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}/>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3"><GraduationCap /> Informations Scolaires</CardTitle>
                    <CardDescription>Ces informations nous aident à personnaliser votre expérience.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField control={form.control} name="school" render={({ field }) => (
                      <FormItem>
                          <FormLabel>Lycée / Collège</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                          <FormMessage />
                      </FormItem>
                    )}/>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="schoolClass" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Classe</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Sélectionnez" /></SelectTrigger></FormControl>
                                <SelectContent>
                                  {schoolStructure.map((c) => (
                                      <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name="series" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Série</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value} disabled={!selectedClassName || availableSeries.length === 0}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Sélectionnez" /></SelectTrigger></FormControl>
                                <SelectContent>
                                  {availableSeries.map((s) => (
                                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                        )}/>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Enregistrer les modifications
                    </Button>
                  </CardFooter>
                </Card>
            </div>

            {/* Side column */}
            <div className="space-y-8">
              <Card>
                  <CardHeader>
                      <CardTitle>Photo de profil</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center gap-4">
                      <Avatar className="h-32 w-32 border-4 border-primary">
                        <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || "Avatar"} />
                        <AvatarFallback className="text-4xl">{user?.displayName?.[0]}</AvatarFallback>
                      </Avatar>
                      <Button variant="outline" disabled>Changer la photo</Button>
                      <p className="text-xs text-muted-foreground text-center">La mise à jour de la photo n'est pas encore disponible.</p>
                  </CardContent>
              </Card>
               <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Trophy /> Vos Points</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-5xl font-bold text-primary">{user?.profile?.points || 0}</p>
                  <p className="text-muted-foreground mt-1">points d'activité</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
