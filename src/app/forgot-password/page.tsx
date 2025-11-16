
"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/logo";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Veuillez entrer une adresse e-mail valide." }),
});

export default function ForgotPasswordPage() {
  const { sendPasswordReset } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: z.infer<typeof forgotPasswordSchema>) {
    setIsLoading(true);
    setIsSuccess(false);
    try {
      await sendPasswordReset(values.email);
      setIsSuccess(true);
      toast({
        title: "E-mail envoyé",
        description: "Veuillez consulter votre boîte de réception pour réinitialiser votre mot de passe.",
      });
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Erreur",
        description: error.message, // L'erreur est déjà traduite par le hook
        variant: "destructive",
      });
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <main className="flex items-center justify-center min-h-screen bg-secondary p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
                <Logo />
            </div>
          <CardTitle className="text-2xl font-headline">Mot de passe oublié</CardTitle>
          <CardDescription>Entrez votre adresse e-mail pour recevoir un lien de réinitialisation.</CardDescription>
        </CardHeader>
        <CardContent>
          {isSuccess ? (
            <Alert variant="default" className="border-green-500 text-green-700 dark:border-green-400 dark:text-green-300">
                <AlertTitle>Vérifiez votre boîte mail</AlertTitle>
                <AlertDescription>
                   Un e-mail de réinitialisation a été envoyé à l'adresse fournie. Si vous ne le voyez pas, veuillez vérifier votre dossier de courrier indésirable.
                </AlertDescription>
            </Alert>
          ) : (
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>E-mail</FormLabel>
                        <FormControl>
                        <Input type="email" placeholder="votre.email@exemple.com" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Envoyer le lien de réinitialisation
                </Button>
                </form>
            </Form>
          )}

           <Button variant="link" asChild className="p-0 font-medium text-primary mt-4 w-full">
              <Link href="/login" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" /> Retour à la connexion
              </Link>
            </Button>
        </CardContent>
      </Card>
    </main>
  );
}
