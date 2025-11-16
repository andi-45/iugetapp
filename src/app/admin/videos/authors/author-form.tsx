// src/app/admin/videos/authors/author-form.tsx
'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { createAuthor, updateAuthor, type Author } from "@/services/video-service"

const authorSchema = z.object({
  name: z.string().min(2, "Le nom est requis."),
  imageUrl: z.string().url("Veuillez entrer une URL d'image valide."),
})

type AuthorFormValues = z.infer<typeof authorSchema>

interface AuthorFormProps {
  mode: 'add' | 'edit';
  isOpen: boolean;
  onClose: (refresh: boolean) => void;
  author?: Author | null;
}

export function AuthorForm({ mode, isOpen, onClose, author }: AuthorFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<AuthorFormValues>({
    resolver: zodResolver(authorSchema),
    defaultValues: {
      name: author?.name || "",
      imageUrl: author?.imageUrl || "",
    },
  })

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose(false)
    }
  }

  async function onSubmit(data: AuthorFormValues) {
    setIsLoading(true)
    let success = false
    try {
      if (mode === 'add') {
        await createAuthor(data)
        toast({ title: "Auteur ajouté", description: "Le nouvel auteur a été créé avec succès." })
      } else if (author) {
        await updateAuthor(author.id, data)
        toast({ title: "Auteur mis à jour", description: "Les informations de l'auteur ont été mises à jour." })
      }
      success = true
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de l'auteur:", error)
      toast({ title: "Erreur", description: "Une erreur est survenue.", variant: "destructive" })
    } finally {
      setIsLoading(false)
      if (success) {
        onClose(true)
      }
    }
  }

  const title = mode === 'add' ? 'Ajouter un nouvel auteur' : 'Modifier l\'auteur'

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Entrez les informations de l'auteur ci-dessous.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de l'auteur</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Prof. Anicet" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL de l'image de profil</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enregistrer
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
