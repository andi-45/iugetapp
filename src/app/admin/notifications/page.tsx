// src/app/admin/notifications/page.tsx
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useEffect, useState } from "react"
import { Loader2, Send } from "lucide-react"
import { sendNotification } from '@/services/admin-notification-service'
import { getUsers, UserProfile } from "@/services/user-service"
import { ScrollArea } from "@/components/ui/scroll-area"

const notificationSchema = z.object({
  title: z.string().min(3, "Le titre est requis."),
  message: z.string().min(10, "Le message doit contenir au moins 10 caractères."),
  link: z.string().url("Veuillez entrer une URL valide.").optional().or(z.literal('')),
  target: z.enum(["all", "specific"], {
    required_error: "Vous devez sélectionner une cible.",
  }),
  userIds: z.array(z.string()).optional(),
}).refine(data => {
    if (data.target === 'specific') {
        return data.userIds && data.userIds.length > 0;
    }
    return true;
}, {
    message: "Vous devez sélectionner au moins un utilisateur.",
    path: ["userIds"],
});


type NotificationFormValues = z.infer<typeof notificationSchema>

export default function AdminNotificationsPage() {
  const { toast } = useToast()
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUsersLoading, setIsUsersLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      const allUsers = await getUsers();
      setUsers(allUsers);
      setIsUsersLoading(false);
    }
    fetchUsers();
  }, []);

  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      title: "",
      message: "",
      link: "",
      target: "all",
      userIds: [],
    },
  })

  async function onSubmit(data: NotificationFormValues) {
    setIsLoading(true);
    try {
        await sendNotification({
            ...data,
            userIds: data.target === 'all' ? [] : data.userIds,
        });
        toast({ title: "Notification envoyée", description: "La notification a été envoyée avec succès." });
        form.reset();
    } catch (error) {
      console.error("Erreur lors de l'envoi de la notification", error);
      toast({ title: "Erreur", description: "Une erreur est survenue.", variant: "destructive" })
    } finally {
      setIsLoading(false);
    }
  }

  const target = form.watch("target");

  return (
    <div className="flex-1 space-y-8">
      <header>
        <h1 className="text-4xl font-headline font-bold">Envoyer une Notification</h1>
        <p className="text-muted-foreground mt-2">
          Communiquez avec les utilisateurs de la plateforme.
        </p>
      </header>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Contenu de la notification</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
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
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl><Textarea {...field} rows={5} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="link"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lien (Optionnel)</FormLabel>
                        <FormControl><Input {...field} placeholder="https://onbuch.com/..." /></FormControl>
                        <FormDescription>Un lien sur lequel l'utilisateur sera redirigé en cliquant sur la notification.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Cible</CardTitle>
                  <CardDescription>Choisissez à qui envoyer cette notification.</CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="target"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl><RadioGroupItem value="all" /></FormControl>
                              <FormLabel className="font-normal">Tous les utilisateurs</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl><RadioGroupItem value="specific" /></FormControl>
                              <FormLabel className="font-normal">Utilisateurs spécifiques</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              {target === 'specific' && (
                <Card>
                  <CardHeader><CardTitle>Sélectionner des utilisateurs</CardTitle></CardHeader>
                  <CardContent>
                    {isUsersLoading ? <Loader2 className="animate-spin" /> : (
                      <FormField
                        control={form.control}
                        name="userIds"
                        render={() => (
                          <FormItem>
                            <ScrollArea className="h-72 w-full rounded-md border p-4">
                               {users.map((user) => (
                                <FormField
                                  key={user.uid}
                                  control={form.control}
                                  name="userIds"
                                  render={({ field }) => (
                                    <FormItem
                                      key={user.uid}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(user.uid)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...(field.value || []), user.uid])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== user.uid
                                                  )
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal">
                                        {user.displayName}
                                      </FormLabel>
                                    </FormItem>
                                  )}
                                />
                              ))}
                            </ScrollArea>
                            <FormMessage className="pt-2"/>
                          </FormItem>
                        )}
                      />
                    )}
                  </CardContent>
                </Card>
              )}
               <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Send className="mr-2 h-4 w-4"/>
                Envoyer la notification
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}
