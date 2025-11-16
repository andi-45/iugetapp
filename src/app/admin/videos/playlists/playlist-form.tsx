// src/app/admin/videos/playlists/playlist-form.tsx
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { createPlaylist, updatePlaylist, type Playlist, type Author } from "@/services/video-service"

const playlistSchema = z.object({
  name: z.string().min(3, "Le nom est requis."),
  url: z.string().url("Veuillez entrer une URL de playlist YouTube valide."),
  authorId: z.string().min(1, "Veuillez sélectionner un auteur."),
  language: z.enum(["Français", "English"]),
  imageUrl: z.string().url("Veuillez entrer une URL d'image de miniature valide."),
})

type PlaylistFormValues = z.infer<typeof playlistSchema>

interface PlaylistFormProps {
  mode: 'add' | 'edit';
  isOpen: boolean;
  onClose: (refresh: boolean) => void;
  playlist?: Playlist | null;
  authors: Author[];
}

const languages = ["Français", "English"];

export function PlaylistForm({ mode, isOpen, onClose, playlist, authors }: PlaylistFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<PlaylistFormValues>({
    resolver: zodResolver(playlistSchema),
    defaultValues: {
      name: playlist?.name || "",
      url: playlist?.url || "",
      authorId: playlist?.authorId || "",
      language: playlist?.language || "Français",
      imageUrl: playlist?.imageUrl || "",
    },
  })

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose(false)
    }
  }

  async function onSubmit(data: PlaylistFormValues) {
    setIsLoading(true)
    let success = false
    try {
      if (mode === 'add') {
        await createPlaylist(data)
        toast({ title: "Playlist ajoutée", description: "La nouvelle playlist a été créée." })
      } else if (playlist) {
        await updatePlaylist(playlist.id, data)
        toast({ title: "Playlist mise à jour", description: "Les informations ont été mises à jour." })
      }
      success = true
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de la playlist:", error)
      toast({ title: "Erreur", description: "Une erreur est survenue.", variant: "destructive" })
    } finally {
      setIsLoading(false)
      if (success) {
        onClose(true)
      }
    }
  }

  const title = mode === 'add' ? 'Ajouter une nouvelle playlist' : 'Modifier la playlist'

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Remplissez les informations de la playlist ci-dessous.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de la playlist</FormLabel>
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
                  <FormLabel>URL de la playlist YouTube</FormLabel>
                  <FormControl><Input placeholder="https://www.youtube.com/playlist?list=..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL de la miniature</FormLabel>
                  <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
                 <FormField
                    control={form.control}
                    name="authorId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Auteur</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {authors.map((author) => (
                                        <SelectItem key={author.id} value={author.id}>{author.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Langue</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {languages.map((lang) => (
                                        <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
           
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
