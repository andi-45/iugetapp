// src/app/admin/structure/structure-form.tsx
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import type { SchoolClass, Series, SchoolClassFormData } from "@/services/school-structure-service"
import { createClass, updateClass, addSeriesToClass } from "@/services/school-structure-service"

// Schema for adding/editing a class
const classSchema = z.object({
  name: z.string().min(3, "Le nom de la classe est requis."),
  order: z.coerce.number().min(1, "L'ordre est requis."),
})

// Schema for adding a series
const seriesSchema = z.object({
  label: z.string().min(1, "Le nom de la série est requis."),
  value: z.string().min(1, "L'identifiant court est requis (ex: c, d, a)."),
})

interface StructureFormProps {
  mode: 'addClass' | 'editClass' | 'addSeries';
  isOpen: boolean;
  onClose: (refresh: boolean) => void;
  classData?: SchoolClass | null; // For editing class or adding series to it
}

export function StructureForm({ mode, isOpen, onClose, classData }: StructureFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm({
    resolver: zodResolver(mode === 'addSeries' ? seriesSchema : classSchema),
    defaultValues: mode === 'addClass'
      ? { name: '', order: 1 }
      : mode === 'editClass' && classData
      ? { name: classData.name, order: classData.order }
      : { label: '', value: '' },
  })

  const handleOpenChange = (open: boolean) => {
    if (!open) {
        onClose(false);
    }
  }

  async function onSubmit(values: any) {
    setIsLoading(true)
    let success = false;
    try {
      if (mode === 'addClass') {
        await createClass(values as SchoolClassFormData)
        toast({ title: "Classe créée", description: "La nouvelle classe a été ajoutée." })
      } else if (mode === 'editClass' && classData) {
        await updateClass(classData.id, values as SchoolClassFormData)
        toast({ title: "Classe modifiée", description: "La classe a été mise à jour." })
      } else if (mode === 'addSeries' && classData) {
        await addSeriesToClass(classData.id, values as Series)
        toast({ title: "Série ajoutée", description: "La nouvelle série a été ajoutée à la classe." })
      }
      form.reset()
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
    switch (mode) {
      case 'addClass': return 'Ajouter une classe';
      case 'editClass': return 'Modifier la classe';
      case 'addSeries': return `Ajouter une série à "${classData?.name}"`;
      default: return '';
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {mode === 'addSeries' ? (
              <>
                <FormField
                  control={form.control}
                  name="label"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom de la série (ex: Série C)</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Identifiant (ex: c)</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            ) : (
              <>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom de la classe (ex: Terminale)</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ordre d'affichage</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                      <FormDescription>Ex: 1 pour Seconde, 2 pour Première...</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin mr-2" /> : null}
              Enregistrer
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
