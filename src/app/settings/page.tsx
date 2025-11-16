
"use client"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect } from "react"
import { BellRing } from "lucide-react"


const passwordSchema = z.object({
  currentPassword: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères."),
  newPassword: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères."),
  confirmPassword: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères."),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Les nouveaux mots de passe ne correspondent pas.",
  path: ["confirmPassword"],
});


export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast({ title: "Erreur", description: "Ce navigateur ne supporte pas les notifications.", variant: "destructive" });
      return;
    }

    const status = await Notification.requestPermission();
    setPermission(status);

    if (status === 'granted') {
      toast({ title: "Notifications activées", description: "Vous recevrez désormais les notifications." });
      // S'assurer que le service worker s'abonne
      navigator.serviceWorker.ready.then(registration => {
        registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_KEY,
        });
      });
    } else {
      toast({ title: "Notifications bloquées", description: "Vous pouvez modifier cela dans les paramètres de votre navigateur.", variant: "destructive" });
    }
  };


  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    }
  });

  function onPasswordSubmit(values: z.infer<typeof passwordSchema>) {
    console.log("Changement du mot de passe pour:", values.newPassword);
  }

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8">
      <header>
        <h1 className="text-4xl font-headline font-bold text-gray-800 dark:text-white">Paramètres</h1>
        <p className="text-muted-foreground mt-2">Gérez les paramètres de votre compte et de l'application.</p>
      </header>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Changer le mot de passe</CardTitle>
                <CardDescription>Mettez à jour votre mot de passe pour des raisons de sécurité.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                        <FormField control={passwordForm.control} name="currentPassword" render={({ field }) => (
                            <FormItem><FormLabel>Mot de passe actuel</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={passwordForm.control} name="newPassword" render={({ field }) => (
                            <FormItem><FormLabel>Nouveau mot de passe</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={passwordForm.control} name="confirmPassword" render={({ field }) => (
                            <FormItem><FormLabel>Confirmer le nouveau mot de passe</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <Button type="submit" variant="secondary">Changer le mot de passe</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
        
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>Gérez vos préférences de notification.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                            <h4 className="font-semibold">Notifications Push</h4>
                            <p className="text-sm text-muted-foreground">Recevez les annonces importantes.</p>
                        </div>
                        <Button
                          onClick={requestNotificationPermission}
                          disabled={permission === 'granted'}
                          size="sm"
                        >
                          {permission === 'granted' ? 'Activées' : 'Activer'}
                        </Button>
                    </div>
                     <div className="flex items-center justify-between">
                        <Label htmlFor="reminders-notifications" className="flex flex-col space-y-1">
                            <span>Rappels de planning</span>
                             <span className="font-normal leading-snug text-muted-foreground">
                                Recevez des rappels pour vos sessions d'étude planifiées.
                            </span>
                        </Label>
                        <Switch id="reminders-notifications" defaultChecked />
                    </div>
                </CardContent>
            </Card>
        </div>
        
      </div>
    </div>
  );
}
