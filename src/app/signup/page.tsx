
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Logo } from "@/components/logo";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { getSchoolStructure, type SchoolClass } from "@/services/school-structure-service";
import Image from "next/image";

const signupSchema = z.object({
  firstName: z.string().min(2, { message: "Le prénom doit contenir au moins 2 caractères." }),
  lastName: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères." }),
  school: z.string().min(3, { message: "Le nom du lycée doit contenir au moins 3 caractères." }),
  whatsapp: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Veuillez entrer un numéro WhatsApp valide." }),
  gender: z.string().min(1, "Veuillez sélectionner votre sexe."),
  schoolClass: z.string().min(1, "Veuillez sélectionner votre classe."),
  series: z.string().min(1, "Veuillez sélectionner votre série."),
  email: z.string().email({ message: "Veuillez entrer une adresse e-mail valide." }),
  password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères." }),
});

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [schoolStructure, setSchoolStructure] = useState<SchoolClass[]>([]);

  useEffect(() => {
    getSchoolStructure().then(setSchoolStructure);
  }, []);

  const genders = [
      { value: 'male', label: 'Masculin' },
      { value: 'female', label: 'Féminin' },
  ];

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      school: "",
      whatsapp: "",
      gender: "",
      schoolClass: "",
      series: "",
      email: "",
      password: "",
    },
  });

  const selectedClassName = form.watch("schoolClass");
  const [availableSeries, setAvailableSeries] = useState<{ value: string; label: string; }[]>([]);

  useEffect(() => {
    if (selectedClassName) {
      const selectedClassData = schoolStructure.find(c => c.name === selectedClassName);
      setAvailableSeries(selectedClassData?.series || []);
      form.setValue("series", ""); // Reset series when class changes
    } else {
      setAvailableSeries([]);
    }
  }, [selectedClassName, form, schoolStructure]);


  async function onSubmit(values: z.infer<typeof signupSchema>) {
    setIsLoading(true);
    try {
      await signup(values.email, values.password, values);

      toast({
        title: "Inscription réussie !",
        description: "Votre compte a été créé. Bienvenue sur OnBuch.",
      });
      router.push("/"); 
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Erreur d'inscription",
        description: error.message, // L'erreur est déjà traduite par le hook
        variant: "destructive",
      });
    } finally {
        setIsLoading(false);
    }
  }

  return (
     <main className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
       <div className="flex items-center justify-center p-4 md:p-8">
        <div className="mx-auto grid w-full max-w-md gap-6">
           <div className="grid gap-2 text-center">
             <div className="flex justify-center mb-4">
                <Logo />
            </div>
            <h1 className="text-3xl font-bold font-headline">Créez votre compte</h1>
            <p className="text-balance text-muted-foreground">
              Remplissez le formulaire pour rejoindre l'aventure OnBuch.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="firstName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prénom</FormLabel>
                      <FormControl><Input placeholder="John" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                )}/>
                <FormField control={form.control} name="lastName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom</FormLabel>
                      <FormControl><Input placeholder="Doe" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                )}/>
                <FormField control={form.control} name="school" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lycée</FormLabel>
                      <FormControl><Input placeholder="Lycée de la Cité Verte" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                )}/>
                <FormField control={form.control} name="whatsapp" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Numéro WhatsApp</FormLabel>
                      <FormControl><Input placeholder="+2376..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                )}/>
                 <FormField control={form.control} name="gender" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sexe</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Sélectionnez" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {genders.map((g) => (
                            <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                )}/>
                <FormField control={form.control} name="schoolClass" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Classe</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Sélectionnez" /></SelectTrigger>
                        </FormControl>
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
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Sélectionnez" /></SelectTrigger>
                        </FormControl>
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

               <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="votre.email@exemple.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>
              
              <FormField control={form.control} name="password" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mot de passe</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="********" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>

              <Button type="submit" className="w-full" disabled={isLoading || schoolStructure.length === 0}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Créer mon compte
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Vous avez déjà un compte ?{" "}
            <Link href="/login" className="underline font-semibold">
                Connectez-vous
            </Link>
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        <Image
          src="https://placehold.co/1080x1920.png"
          alt="Étudiante souriante avec des livres"
          data-ai-hint="smiling female student books"
          width="1080"
          height="1920"
          className="h-full w-full object-cover dark:brightness-[0.3]"
        />
      </div>
    </main>
  );
}
