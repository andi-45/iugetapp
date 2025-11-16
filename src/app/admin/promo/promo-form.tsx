// src/app/admin/promo/promo-form.tsx
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
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { Loader2, Megaphone, Save } from "lucide-react"
import { createPromo, updatePromo, type PromoContent, type PromoFormData } from "@/services/promo-service"
import { Switch } from "@/components/ui/switch"

const promoSchema = z.object({
  isActive: z.boolean().default(false),
  title: z.string().min(3, "Le titre est requis."),
  description: z.string().min(10, "La description est requise."),
  imageUrl: z.string().url("Veuillez entrer une URL d'image valide."),
  ctaText: z.string().min(2, "Le texte du bouton est requis."),
  ctaLink: z.string().url("Veuillez entrer une URL de lien valide."),
});

type PromoFormValues = z.infer<typeof promoSchema>;

interface PromoFormProps {
    mode: 'add' | 'edit';
    isOpen: boolean;
    onClose: (refresh: boolean) => void;
    promo?: PromoContent | null;
    lastOrder: number;
}


export function PromoForm({ mode, isOpen, onClose, promo, lastOrder }: PromoFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<PromoFormValues>({
    resolver: zodResolver(promoSchema),
    defaultValues: {
      isActive: promo?.isActive ?? false,
      title: promo?.title || "",
      description: promo?.description || "",
      imageUrl: promo?.imageUrl || "",
      ctaText: promo?.ctaText || "",
      ctaLink: promo?.ctaLink || "",
    },
  });

  async function onSubmit(data: PromoFormValues) {
    setIsLoading(true);
    let success = false;
    try {
        if (mode === 'add') {
            await createPromo(data, lastOrder);
            toast({ title: "Publicité ajoutée", description: "La nouvelle publicité a été créée." });
        } else if (promo) {
            await updatePromo(promo.id, data);
            toast({ title: "Publicité mise à jour", description: "La publicité a été mise à jour." });
        }
        success = true;
    } catch (error) {
      console.error("Erreur lors de la soumission du formulaire", error);
      toast({ title: "Erreur", description: "Une erreur est survenue.", variant: "destructive" })
    } finally {
      setIsLoading(false);
      if (success) {
        onClose(true);
      }
    }
  }
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose(false);
    }
  };

  const title = mode === 'add' ? 'Ajouter une publicité' : 'Modifier la publicité';

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Remplissez les détails de la publicité ci-dessous.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1 pr-4">
              <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                              <FormLabel>Active</FormLabel>
                              <FormDescription>Rendre cette publicité visible dans le carrousel.</FormDescription>
                          </div>
                          <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      </FormItem>
                  )}
              />
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem><FormLabel>Titre</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="imageUrl" render={({ field }) => (
                <FormItem><FormLabel>URL de l'image</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="ctaText" render={({ field }) => (
                <FormItem><FormLabel>Texte du bouton (CTA)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="ctaLink" render={({ field }) => (
                <FormItem><FormLabel>Lien du bouton (URL)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )}/>

             <Button type="submit" disabled={isLoading} className="w-full mt-4">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4"/>}
              Enregistrer
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
