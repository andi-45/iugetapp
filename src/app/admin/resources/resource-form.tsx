// src/app/admin/resources/resource-form.tsx
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { type Resource, type ResourceFormData, createResource, updateResource, getResourceConfiguration } from "@/services/resource-service"
import { useToast } from "@/hooks/use-toast"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

const resourceFormSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères."),
  url: z.string().url("Veuillez entrer une URL valide."),
  type: z.enum(["PDF", "WORD", "IMAGE", "VIDEO"]),
  subjectId: z.string().min(1, "Vous devez sélectionner une matière."),
  classes: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "Vous devez sélectionner au moins une classe.",
  }),
  series: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "Vous devez sélectionner au moins une série.",
  }),
})

type ResourceFormValues = z.infer<typeof resourceFormSchema>

interface ResourceFormProps {
  mode: 'add' | 'edit';
  isOpen: boolean;
  onClose: (refresh: boolean) => void;
  resource?: Resource | null;
}

type ConfigType = {
    classes: { value: string, label: string }[],
    allSeries: { value: string, label: string }[],
    subjects: { value: string, label: string }[]
}

const resourceTypes = [
    { value: "PDF", label: "PDF" },
    { value: "WORD", label: "Document Word" },
    { value: "IMAGE", label: "Image" },
    { value: "VIDEO", label: "Vidéo" },
]

export function ResourceForm({ mode, isOpen, onClose, resource }: ResourceFormProps) {
  const { toast } = useToast()
  const [config, setConfig] = useState<ConfigType | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getResourceConfiguration().then(setConfig);
  }, []);

  const form = useForm<ResourceFormValues>({
    resolver: zodResolver(resourceFormSchema),
    defaultValues: {
        title: resource?.title || "",
        url: resource?.url || "",
        type: resource?.type || "PDF",
        subjectId: resource?.subjectId || "",
        classes: resource?.classes || [],
        series: resource?.series || [],
    },
  })

  const handleOpenChange = (open: boolean) => {
    if (!open) {
        onClose(false);
    }
  }

  async function onSubmit(data: ResourceFormValues) {
    setIsLoading(true);
    let success = false;
    try {
      if (mode === 'add') {
        await createResource(data)
        toast({ title: "Ressource créée", description: "La nouvelle ressource a été ajoutée." })
      } else if (resource) {
        await updateResource(resource.id, data)
        toast({ title: "Ressource modifiée", description: "La ressource a été mise à jour." })
      }
      success = true;
    } catch (error) {
      console.error("Erreur lors de la soumission du formulaire:", error)
      toast({ title: "Erreur", description: "Une erreur est survenue.", variant: "destructive" })
    } finally {
      setIsLoading(false)
      if (success) {
          onClose(true); // Close and refresh
      }
    }
  }

  const getTitle = () => {
    return mode === 'add' ? 'Ajouter une ressource' : 'Modifier la ressource';
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>Remplissez les informations ci-dessous.</DialogDescription>
        </DialogHeader>
        
        {!config ? (
            <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin" /></div>
        ) : (
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-h-[70vh] overflow-y-auto p-1 pr-4">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Titre de la ressource</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>URL de la ressource</FormLabel>
                        <FormControl><Input {...field} placeholder="https://..." /></FormControl>
                        <FormDescription>Le lien direct vers le fichier hébergé (pour les vidéos, utilisez un lien d'intégration/embed).</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Type de fichier</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {resourceTypes.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="subjectId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Matière</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner une matière" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {config.subjects.map((subject) => (
                                            <SelectItem key={subject.value} value={subject.value}>
                                                {subject.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <FormField
                        control={form.control}
                        name="classes"
                        render={() => (
                            <FormItem>
                                <div className="mb-4">
                                <FormLabel className="text-base">Classes</FormLabel>
                                <FormDescription>Sélectionnez les classes concernées.</FormDescription>
                                </div>
                                {config.classes.map((item) => (
                                <FormField
                                    key={item.value}
                                    control={form.control}
                                    name="classes"
                                    render={({ field }) => {
                                    return (
                                        <FormItem key={item.value} className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value?.includes(item.label)}
                                                onCheckedChange={(checked) => {
                                                    return checked
                                                    ? field.onChange([...field.value, item.label])
                                                    : field.onChange(
                                                        field.value?.filter(
                                                        (value) => value !== item.label
                                                        )
                                                    )
                                                }}
                                            />
                                        </FormControl>
                                        <FormLabel className="font-normal">{item.label}</FormLabel>
                                        </FormItem>
                                    )
                                    }}
                                />
                                ))}
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                    <FormField
                        control={form.control}
                        name="series"
                        render={() => (
                            <FormItem>
                                <div className="mb-4">
                                <FormLabel className="text-base">Séries</FormLabel>
                                <FormDescription>Sélectionnez les séries concernées.</FormDescription>
                                </div>
                                {config.allSeries.map((item) => (
                                <FormField
                                    key={item.value}
                                    control={form.control}
                                    name="series"
                                    render={({ field }) => {
                                    return (
                                        <FormItem key={item.value} className="flex flex-row items-start space-x-3 space-y-0">
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
                                        <FormLabel className="font-normal">{item.label}</FormLabel>
                                        </FormItem>
                                    )
                                    }}
                                />
                                ))}
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                 </div>
                <Button type="submit" disabled={isLoading} className="mt-4">
                    {isLoading ? <Loader2 className="animate-spin mr-2" /> : null}
                    Enregistrer
                </Button>
            </form>
            </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
