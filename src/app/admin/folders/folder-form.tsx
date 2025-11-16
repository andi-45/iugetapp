// src/app/admin/folders/folder-form.tsx
'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useEffect, useState } from "react"
import { Loader2, Folder } from "lucide-react"
import type { ResourceFolder, ResourceFolderFormData } from "@/services/resource-folder-service"
import { createResourceFolder, updateResourceFolder, getFolderFormConfiguration } from "@/services/resource-folder-service"
import type { SchoolClass } from "@/services/school-structure-service"
import { ScrollArea } from "@/components/ui/scroll-area"

const folderFormSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères."),
  class: z.string().min(1, "Vous devez sélectionner une classe."),
  series: z.string().min(1, "Vous devez sélectionner une série."),
  resourceIds: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "Vous devez sélectionner au moins une ressource.",
  }),
})

type FolderFormValues = z.infer<typeof folderFormSchema>

interface FolderFormProps {
  folder?: ResourceFolder
}

type ConfigType = {
    classes: { value: string, label: string }[],
    structure: SchoolClass[],
    resources: { value: string, label: string, subject?: string }[],
}

export function FolderForm({ folder }: FolderFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [config, setConfig] = useState<ConfigType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [availableSeries, setAvailableSeries] = useState<{ value: string, label: string }[]>([]);

  useEffect(() => {
    getFolderFormConfiguration().then(setConfig);
  }, []);

  const form = useForm<FolderFormValues>({
    resolver: zodResolver(folderFormSchema),
    defaultValues: {
        title: folder?.title || "",
        class: folder?.class || "",
        series: folder?.series || "",
        resourceIds: folder?.resourceIds || [],
    },
    mode: "onChange",
  })
  
  const selectedClassName = form.watch("class");

  useEffect(() => {
    if (selectedClassName && config) {
      const selectedClassData = config.structure.find(c => c.name === selectedClassName);
      setAvailableSeries(selectedClassData?.series || []);
      if (folder?.class !== selectedClassName) {
          form.setValue("series", "");
      }
    }
  }, [selectedClassName, config, form, folder]);

  async function onSubmit(data: FolderFormValues) {
    setIsLoading(true);
    try {
      const formData: ResourceFolderFormData = data;
      if (folder) {
        await updateResourceFolder(folder.id, formData)
        toast({ title: "Dossier mis à jour", description: "Le dossier a été mis à jour avec succès." })
        router.refresh();
      } else {
        const newFolderId = await createResourceFolder(formData)
        toast({ title: "Dossier créé", description: "Le nouveau dossier a été créé avec succès." })
        router.push(`/admin/folders`)
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du dossier", error);
      toast({ title: "Erreur", description: "Une erreur est survenue.", variant: "destructive" })
    } finally {
        setIsLoading(false);
    }
  }

  if (!config) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <Card>
                <CardHeader><CardTitle>Informations du dossier</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                     <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Titre du dossier</FormLabel>
                                <FormControl><Input placeholder="Ex: Annales de Maths, Série C" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="class"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Classe</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner une classe" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {config.classes.map((c) => (
                                                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="series"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Série</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value} disabled={!selectedClassName}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner une série" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {availableSeries.map((s) => (
                                                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Ressources du dossier</CardTitle>
                    <CardDescription>Cochez toutes les ressources à inclure dans ce dossier.</CardDescription>
                </CardHeader>
                <CardContent>
                     <FormField
                        control={form.control}
                        name="resourceIds"
                        render={() => (
                            <FormItem>
                                <ScrollArea className="h-72 w-full rounded-md border p-4">
                                {config.resources.map((item) => (
                                <FormField
                                    key={item.value}
                                    control={form.control}
                                    name="resourceIds"
                                    render={({ field }) => {
                                    return (
                                        <FormItem key={item.value} className="flex flex-row items-start space-x-3 space-y-0 mb-3">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value?.includes(item.value)}
                                                    onCheckedChange={(checked) => {
                                                        return checked
                                                        ? field.onChange([...field.value, item.value])
                                                        : field.onChange(
                                                            field.value?.filter(
                                                            (value) => value !== item.value
                                                            )
                                                        )
                                                    }}
                                                />
                                            </FormControl>
                                            <div className="flex flex-col">
                                                <FormLabel className="font-normal">{item.label}</FormLabel>
                                                <FormDescription>{item.subject}</FormDescription>
                                            </div>
                                        </FormItem>
                                    )
                                    }}
                                />
                                ))}
                                </ScrollArea>
                                <FormMessage className="pt-2"/>
                            </FormItem>
                        )}
                        />
                </CardContent>
            </Card>
          </div>
          <div className="space-y-8">
            <Card className="sticky top-8">
                <CardHeader>
                    <CardTitle>Résumé</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex items-center gap-3 text-sm">
                        <Folder className="h-5 w-5 text-muted-foreground" />
                        <span className="font-semibold">{form.watch('title') || 'Titre du dossier...'}</span>
                     </div>
                     <div className="text-sm">
                         <span className="font-semibold">Classe:</span> {form.watch('class') || 'N/A'}
                     </div>
                      <div className="text-sm">
                         <span className="font-semibold">Série:</span> {form.watch('series')?.toUpperCase() || 'N/A'}
                     </div>
                     <div className="text-sm">
                         <span className="font-semibold">Ressources sélectionnées:</span> {form.watch('resourceIds')?.length || 0}
                     </div>
                </CardContent>
            </Card>
             <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {folder ? "Enregistrer les modifications" : "Créer le dossier"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}
