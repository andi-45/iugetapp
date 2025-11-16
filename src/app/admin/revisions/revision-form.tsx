// src/app/admin/revisions/revision-form.tsx
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
import { type Revision, type RevisionChapter, type RevisionFormData, createRevision, updateRevision, getRevisionFormConfiguration } from "@/services/revision-service"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

const chapterSchema = z.object({
    id: z.string(),
    title: z.string().min(3, "Le titre du chapitre doit faire au moins 3 caractères."),
    pdfUrl: z.string().url("URL du PDF invalide."),
    resourceIds: z.array(z.string()),
});

const revisionFormSchema = z.object({
  subjectId: z.string().min(1, "Matière requise."),
  classes: z.array(z.string()).min(1, "Au moins une classe est requise."),
  series: z.array(z.string()).min(1, "Au moins une série est requise."),
  chapters: z.array(chapterSchema).min(1, "Au moins un chapitre est requis."),
});

type RevisionFormValues = z.infer<typeof revisionFormSchema>

type ConfigType = {
    classes: { value: string; label: string }[];
    allSeries: { value: string; label: string }[];
    subjects: { value: string; label: string }[];
    resources: { value: string; label: string; subject?: string }[];
}

export function RevisionForm({ revision }: { revision?: Revision }) {
  const router = useRouter()
  const { toast } = useToast()
  const [config, setConfig] = useState<ConfigType | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [jsonInput, setJsonInput] = useState('')
  const [isJsonModalOpen, setJsonModalOpen] = useState(false)

  const form = useForm<RevisionFormValues>({
    resolver: zodResolver(revisionFormSchema),
    defaultValues: {
      subjectId: revision?.subjectId || "",
      classes: revision?.classes || [],
      series: revision?.series || [],
      chapters: revision?.chapters || [],
    },
    mode: "onChange",
  })
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "chapters"
  });

  useEffect(() => {
    getRevisionFormConfiguration().then(setConfig);
  }, []);

  const handleAddChapter = () => {
    const newId = `chap-${Date.now()}`;
    append({ id: newId, title: "", pdfUrl: "", resourceIds: [] });
  };
  
  const handleJsonImport = () => {
    try {
        const parsedData = JSON.parse(jsonInput);
        const chaptersSchema = z.array(z.object({
            title: z.string(),
            pdfUrl: z.string().url(),
            resourceIds: z.array(z.string()).optional().default([]),
        }));
        
        const validatedData = chaptersSchema.parse(parsedData);
        
        validatedData.forEach(chap => {
            append({
                id: `chap-${chap.title.toLowerCase().replace(/\s/g, '-')}-${Date.now()}`,
                title: chap.title,
                pdfUrl: chap.pdfUrl,
                resourceIds: chap.resourceIds
            });
        });
        
        setJsonInput('');
        setJsonModalOpen(false);
        toast({ title: "Chapitres importés !", description: `${validatedData.length} chapitres ont été ajoutés.`});

    } catch (error) {
        console.error("JSON parsing error:", error);
        if (error instanceof z.ZodError) {
            toast({ title: "Erreur de validation JSON", description: error.errors[0].message, variant: "destructive" });
        } else {
            toast({ title: "Erreur JSON", description: "Le format JSON est invalide.", variant: "destructive" });
        }
    }
  }

  async function onSubmit(data: RevisionFormValues) {
    setIsLoading(true);
    try {
      const formData: RevisionFormData = data;
      if (revision) {
        await updateRevision(revision.id, formData)
        toast({ title: "Révision mise à jour", description: "La fiche de révision a été mise à jour." })
      } else {
        await createRevision(formData)
        toast({ title: "Révision créée", description: "La nouvelle fiche de révision a été créée." })
        router.push(`/admin/revisions`)
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de la révision", error);
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
                    <CardTitle>Métadonnées</CardTitle>
                    <CardDescription>Configurez la matière, les classes et les séries concernées.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <FormField control={form.control} name="subjectId" render={({ field }) => (
                          <FormItem className="md:col-span-1">
                            <FormLabel>Matière</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger></FormControl>
                                <SelectContent><ScrollArea className="h-72">{config.subjects.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</ScrollArea></SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                      )}/>
                    <div className="md:col-span-2 grid grid-cols-2 gap-4">
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
                    </div>
                </CardContent>
            </Card>

            <Card>
                 <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Chapitres de la révision</CardTitle>
                            <CardDescription>Ajoutez, modifiez ou supprimez les chapitres.</CardDescription>
                        </div>
                        <Dialog open={isJsonModalOpen} onOpenChange={setJsonModalOpen}>
                            <DialogTrigger asChild><Button variant="outline" size="sm"><FileJson className="mr-2 h-4 w-4"/>Importer</Button></DialogTrigger>
                            <DialogContent>
                                <DialogHeader><DialogTitle>Importer des chapitres via JSON</DialogTitle></DialogHeader>
                                <Textarea value={jsonInput} onChange={(e) => setJsonInput(e.target.value)} rows={10} placeholder='[{"title": "Chapitre 1", "pdfUrl": "https://...", "resourceIds": ["id1", "id2"]}, ...]'/>
                                <Button onClick={handleJsonImport}>Valider et Importer</Button>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-4">
                        {fields.map((field, index) => (
                            <Card key={field.id} className="p-4 bg-muted/50">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-semibold">Chapitre {index + 1}</h4>
                                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                </div>
                                <div className="space-y-4">
                                     <FormField control={form.control} name={`chapters.${index}.title`} render={({ field }) => (<FormItem><FormLabel>Titre du chapitre</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                     <FormField control={form.control} name={`chapters.${index}.pdfUrl`} render={({ field }) => (<FormItem><FormLabel>URL du PDF principal</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                     <FormField control={form.control} name={`chapters.${index}.resourceIds`} render={() => (
                                        <FormItem>
                                            <FormLabel>Ressources complémentaires</FormLabel>
                                            <Dialog>
                                                <DialogTrigger asChild><Button variant="outline" className="w-full">Sélectionner ({form.watch(`chapters.${index}.resourceIds`).length})</Button></DialogTrigger>
                                                <DialogContent className="max-w-2xl">
                                                    <DialogHeader><DialogTitle>Sélectionner des ressources</DialogTitle></DialogHeader>
                                                    <ScrollArea className="h-96 rounded-md border">
                                                        <div className="p-4">
                                                        {config.resources.map(item => (
                                                            <FormField key={item.value} control={form.control} name={`chapters.${index}.resourceIds`} render={({ field: f }) => (
                                                                <FormItem key={item.value} className="flex flex-row items-start space-x-3 space-y-0 mb-3">
                                                                    <FormControl><Checkbox checked={f.value.includes(item.value)} onCheckedChange={checked => checked ? f.onChange([...f.value, item.value]) : f.onChange(f.value.filter(v => v !== item.value))}/></FormControl>
                                                                    <div><FormLabel className="font-normal">{item.label}</FormLabel><FormDescription>{item.subject}</FormDescription></div>
                                                                </FormItem>
                                                            )}/>
                                                        ))}
                                                        </div>
                                                    </ScrollArea>
                                                </DialogContent>
                                            </Dialog>
                                        </FormItem>
                                    )}/>
                                </div>
                            </Card>
                        ))}
                    </div>
                    <Button type="button" variant="outline" className="w-full" onClick={handleAddChapter}><PlusCircle className="mr-2 h-4 w-4" />Ajouter un chapitre</Button>
                    <FormMessage>{form.formState.errors.chapters?.message || form.formState.errors.chapters?.root?.message}</FormMessage>
                </CardContent>
            </Card>
          </div>
          <div className="space-y-4">
             <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {revision ? "Enregistrer les modifications" : "Créer la fiche de révision"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}
