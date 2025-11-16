// src/app/admin/flashcards/flashcard-form.tsx
'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useEffect, useState } from "react"
import { Loader2, PlusCircle, Trash2, FileJson, X } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { type FlashcardDeck, type Card as Flashcard, type FlashcardDeckFormData, createFlashcardDeck, updateFlashcardDeck, getFlashcardFormConfiguration } from "@/services/flashcard-service"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"

const cardSchema = z.object({
    id: z.string(),
    question: z.string().min(1, "La question ne peut pas être vide."),
    answer: z.string().min(1, "La réponse ne peut pas être vide."),
});

const deckFormSchema = z.object({
  title: z.string().min(3, "Le titre est requis."),
  subjectId: z.string().min(1, "Matière requise."),
  classes: z.array(z.string()).min(1, "Au moins une classe est requise."),
  series: z.array(z.string()).min(1, "Au moins une série est requise."),
  isPublic: z.boolean().default(false),
  cards: z.array(cardSchema).min(1, "Un paquet doit contenir au moins une carte."),
});

type DeckFormValues = z.infer<typeof deckFormSchema>

type ConfigType = {
    classes: { value: string; label: string }[];
    allSeries: { value: string; label: string }[];
    subjects: { value: string; label: string }[];
}

export function FlashcardForm({ deck }: { deck?: FlashcardDeck }) {
  const router = useRouter()
  const { toast } = useToast()
  const [config, setConfig] = useState<ConfigType | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [jsonInput, setJsonInput] = useState('')
  const [isJsonModalOpen, setJsonModalOpen] = useState(false)

  const form = useForm<DeckFormValues>({
    resolver: zodResolver(deckFormSchema),
    defaultValues: {
      title: deck?.title || "",
      subjectId: deck?.subjectId || "",
      classes: deck?.classes || [],
      series: deck?.series || [],
      isPublic: deck?.isPublic || false,
      cards: deck?.cards || [],
    },
    mode: "onChange",
  })
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "cards"
  });

  useEffect(() => {
    getFlashcardFormConfiguration().then(setConfig);
  }, []);

  const handleAddCard = () => {
    const newId = `card-${Date.now()}`;
    append({ id: newId, question: "", answer: "" });
  };
  
  const handleJsonImport = () => {
    try {
        const parsedData = JSON.parse(jsonInput);
        const cardsSchema = z.array(z.object({
            question: z.string(),
            answer: z.string(),
        }));
        
        const validatedData = cardsSchema.parse(parsedData);
        
        validatedData.forEach(card => {
            append({
                id: `card-${Date.now()}-${Math.random()}`,
                ...card
            });
        });
        
        setJsonInput('');
        setJsonModalOpen(false);
        toast({ title: "Cartes importées !", description: `${validatedData.length} cartes ont été ajoutées.`});

    } catch (error) {
        console.error("JSON parsing error:", error);
        if (error instanceof z.ZodError) {
            toast({ title: "Erreur de validation JSON", description: error.errors[0].message, variant: "destructive" });
        } else {
            toast({ title: "Erreur JSON", description: "Le format JSON est invalide.", variant: "destructive" });
        }
    }
  }

  async function onSubmit(data: DeckFormValues) {
    setIsLoading(true);
    try {
      const formData: FlashcardDeckFormData = data;
      if (deck) {
        await updateFlashcardDeck(deck.id, formData)
        toast({ title: "Paquet mis à jour", description: "Le paquet de flashcards a été mis à jour." })
      } else {
        await createFlashcardDeck(formData)
        toast({ title: "Paquet créé", description: "Le nouveau paquet de flashcards a été créé." })
        router.push(`/admin/flashcards`)
      }
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
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
             <Card>
                <CardHeader>
                    <CardTitle>Détails du Paquet</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Titre du paquet</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                     <FormField control={form.control} name="subjectId" render={({ field }) => (
                          <FormItem><FormLabel>Matière</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger></FormControl>
                                <SelectContent><ScrollArea className="h-72">{config.subjects.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</ScrollArea></SelectContent>
                            </Select><FormMessage />
                          </FormItem>
                      )}/>
                      <FormField control={form.control} name="isPublic" render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                <div className="space-y-0.5">
                                    <FormLabel>Paquet Public</FormLabel>
                                    <FormDescription>Rendre ce paquet visible par tous les élèves concernés.</FormDescription>
                                </div>
                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                            </FormItem>
                        )}/>
                </CardContent>
            </Card>

            <Card>
                 <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Flashcards</CardTitle>
                            <CardDescription>Ajoutez les questions et réponses.</CardDescription>
                        </div>
                        <Dialog open={isJsonModalOpen} onOpenChange={setJsonModalOpen}>
                            <DialogTrigger asChild><Button variant="outline" size="sm"><FileJson className="mr-2 h-4 w-4"/>Importer JSON</Button></DialogTrigger>
                            <DialogContent>
                                <DialogHeader><DialogTitle>Importer des cartes via JSON</DialogTitle></DialogHeader>
                                <FormDescription>Format: [&#123;"question": "Q1", "answer": "A1"&#125;, ...]</FormDescription>
                                <Textarea value={jsonInput} onChange={(e) => setJsonInput(e.target.value)} rows={10} placeholder='[{"question": "...", "answer": "..."}, ...]'/>
                                <Button onClick={handleJsonImport}>Valider et Importer</Button>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <ScrollArea className="h-96 pr-4">
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
          </div>
          <div className="space-y-4">
            <Card>
                <CardHeader><CardTitle>Ciblage</CardTitle></CardHeader>
                 <CardContent className="space-y-4">
                    <FormField control={form.control} name="classes" render={() => (<FormItem>
                            <FormLabel>Classes</FormLabel>
                            <ScrollArea className="h-24 w-full rounded-md border p-2">{config.classes.map((item) => (
                            <FormField key={item.value} control={form.control} name="classes" render={({ field }) => (
                                <FormItem key={item.value} className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value?.includes(item.label)} onCheckedChange={(c) => c ? field.onChange([...field.value, item.label]) : field.onChange(field.value?.filter((v) => v !== item.label))}/></FormControl><FormLabel className="font-normal">{item.label}</FormLabel></FormItem>
                            )}/>))}</ScrollArea><FormMessage />
                    </FormItem>)}/>
                    <FormField control={form.control} name="series" render={() => (<FormItem>
                        <FormLabel>Séries</FormLabel>
                        <ScrollArea className="h-24 w-full rounded-md border p-2">{config.allSeries.map((item) => (
                        <FormField key={item.value} control={form.control} name="series" render={({ field }) => (
                            <FormItem key={item.value} className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value?.includes(item.value)} onCheckedChange={(c) => c ? field.onChange([...field.value, item.value]) : field.onChange(field.value?.filter((v) => v !== item.value))}/></FormControl><FormLabel className="font-normal">{item.label}</FormLabel></FormItem>
                        )}/>))}</ScrollArea><FormMessage />
                    </FormItem>)}/>
                 </CardContent>
            </Card>
             <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {deck ? "Enregistrer les modifications" : "Créer le paquet"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}
