// src/app/admin/news/news-form.tsx
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { type NewsArticle, type NewsFormData, createNews, updateNews } from "@/services/news-service"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { Loader2 } from "lucide-react"

const newsFormSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères."),
  summary: z.string().min(10, "Le résumé doit contenir au moins 10 caractères."),
  content: z.string().min(50, "Le contenu doit contenir au moins 50 caractères."),
  category: z.string().min(2, "La catégorie est requise."),
  status: z.enum(["draft", "published"]),
  date: z.string().min(1, "La date est requise."), // Simple string for now
})

type NewsFormValues = z.infer<typeof newsFormSchema>

interface NewsFormProps {
  article?: NewsArticle
}

export function NewsForm({ article }: NewsFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false);

  const defaultValues: Partial<NewsFormValues> = {
    title: article?.title || "",
    summary: article?.summary || "",
    content: article?.content || "",
    category: article?.category || "Annonce",
    status: article?.status || "draft",
    date: article?.date || new Date().toLocaleDateString('fr-CA'), // YYYY-MM-DD
  }

  const form = useForm<NewsFormValues>({
    resolver: zodResolver(newsFormSchema),
    defaultValues,
    mode: "onChange",
  })

  async function onSubmit(data: NewsFormValues) {
    setIsLoading(true);
    try {
      const newsData: NewsFormData = data;
      if (article) {
        await updateNews(article.id, newsData)
        toast({ title: "Article mis à jour", description: "L'article a été mis à jour avec succès." })
        router.refresh();
      } else {
        const newArticleId = await createNews(newsData)
        toast({ title: "Article créé", description: "Le nouvel article a été créé avec succès." })
        router.push(`/admin/news`)
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de l'article", error);
      toast({ title: "Erreur", description: "Une erreur est survenue.", variant: "destructive" })
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <Card>
                <CardHeader><CardTitle>Contenu de l'article</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                     <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Titre</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="summary"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Résumé</FormLabel>
                            <FormControl><Textarea {...field} rows={3} /></FormControl>
                            <FormDescription>Un court résumé qui apparaîtra dans la liste des actualités.</FormDescription>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Contenu complet</FormLabel>
                            <FormControl><Textarea {...field} rows={10} /></FormControl>
                            <FormDescription>Le contenu de l'article. Vous pouvez utiliser du HTML simple.</FormDescription>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>
          </div>
          <div className="space-y-8">
            <Card>
                <CardHeader><CardTitle>Métadonnées</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                    <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Statut</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="draft">Brouillon</SelectItem>
                                        <SelectItem value="published">Publié</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Catégorie</FormLabel>
                                <FormControl><Input {...field} placeholder="Ex: Annonce" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Date de publication</FormLabel>
                                <FormControl><Input type="date" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>
             <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {article ? "Enregistrer les modifications" : "Publier l'article"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}
