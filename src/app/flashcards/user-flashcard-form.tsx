
// src/app/flashcards/user-flashcard-form.tsx
'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useEffect, useState } from "react"
import { Loader2, PlusCircle, Trash2, FileJson, X } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { createFlashcardDeck, type FlashcardDeckFormData, getFlashcardFormConfiguration } from "@/services/flashcard-service"
import { useAuth } from "@/hooks/use-auth"

const cardSchema = z.object({
    id: z.string(),
    question: z.string().min(1, "La question ne peut pas être vide."),
    answer: z.string().min(1, "La réponse ne peut pas être vide."),
});

const userDeckSchema = z.object({
  title: z.string().min(3, "Le titre est requis."),
  subjectId: z.string().min(1, "Matière requise."),
  cards: z.array(cardSchema).min(1, "Un paquet doit contenir au moins une carte."),
});

type UserDeckFormValues = z.infer<typeof userDeckSchema>

type ConfigType = {
    subjects: { value: string; label: string }[];
}

export function UserFlashcardForm({ onFinished }: { onFinished: () => void }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [config, setConfig] = useState<ConfigType | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<UserDeckFormValues>({
    resolver: zodResolver(userDeckSchema),
    defaultValues: {
      title: "",
      subjectId: "",
      cards: [{id: `card-${Date.now()}`, question: "", answer: ""}],
    },
    mode: "onChange",
  })
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "cards"
  });

  useEffect(() => {
    // We only need subjects for the user form.
    getFlashcardFormConfiguration().then(config => setConfig({ subjects: config.subjects }));
  }, []);

  const handleAddCard = () => {
    const newId = `card-${Date.now()}`;
    append({ id: newId, question: "", answer: "" });
  };

  async function onSubmit(data: UserDeckFormValues) {
    if (!user || !user.profile) return;
    setIsLoading(true);
    try {
      // Construct full form data for the service function
      const formData: FlashcardDeckFormData = {
          ...data,
          isPublic: false,
          classes: [user.profile.schoolClass],
          series: [user.profile.series],
      };
      await createFlashcardDeck(formData, user.uid)
      toast({ title: "Paquet créé", description: "Votre nouveau paquet a été sauvegardé." })
      onFinished(); // Callback to close modal and refresh list
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du paquet", error);
      toast({ title: "Erreur", description: "Une erreur est survenue.", variant: "destructive" })
    } finally {
        setIsLoading(false);
    }
  }

  if (!config) return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin h-8 w-8" /></div>;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Titre du paquet</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
             <FormField control={form.control} name="subjectId" render={({ field }) => (
                  <FormItem><FormLabel>Matière</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger></FormControl>
                        <SelectContent><ScrollArea className="h-72">{config.subjects.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</ScrollArea></SelectContent>
                    </Select><FormMessage />
                  </FormItem>
              )}/>
        </div>
            
        <Card>
            <CardHeader>
                <CardTitle>Flashcards</CardTitle>
                <CardDescription>Ajoutez les questions et réponses.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <ScrollArea className="h-64 pr-4">
                    <div className="space-y-4">
                        {fields.map((field, index) => (
                            <Card key={field.id} className="p-4 bg-muted/50 relative">
                                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="absolute top-1 right-1 h-7 w-7"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                <div className="space-y-4">
                                    <FormField control={form.control} name={`cards.${index}.question`} render={({ field }) => (<FormItem><FormLabel>Question {index + 1}</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)}/>
                                    <FormField control={form.control} name={`cards.${index}.answer`} render={({ field }) => (<FormItem><FormLabel>Réponse</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)}/>
                                </div>
                            </Card>
                        ))}
                    </div>
                </ScrollArea>
                <Button type="button" variant="outline" className="w-full" onClick={handleAddCard}><PlusCircle className="mr-2 h-4 w-4" />Ajouter une carte</Button>
                <FormMessage>{form.formState.errors.cards?.message || form.formState.errors.cards?.root?.message}</FormMessage>
            </CardContent>
        </Card>
        
        <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Créer mon paquet
        </Button>
      </form>
    </Form>
  )
}
