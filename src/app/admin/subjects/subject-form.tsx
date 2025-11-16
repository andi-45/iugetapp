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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { type Subject, type SubjectFormData, createSubject, updateSubject } from "@/services/subject-service"

const subjectSchema = z.object({
  name: z.string().min(3, "Le nom de la matière doit contenir au moins 3 caractères."),
});

type SubjectFormValues = z.infer<typeof subjectSchema>;

interface SubjectFormProps {
  mode: 'add' | 'edit';
  isOpen: boolean;
  onClose: (refresh: boolean) => void;
  subject?: Subject | null;
}

export function SubjectForm({ mode, isOpen, onClose, subject }: SubjectFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      name: subject?.name || '',
    },
  });

  const handleOpenChange = (open: boolean) => {
    if (!open) {
        onClose(false);
    }
  }

  async function onSubmit(values: SubjectFormValues) {
    setIsLoading(true)
    let result;
    if (mode === 'add') {
      result = await createSubject(values);
      toast({ title: "Matière créée", description: result.message });
    } else if (subject) {
      result = await updateSubject(subject.id, values);
      toast({ title: "Matière modifiée", description: result.message });
    }

    setIsLoading(false)
    if (result?.success) {
        onClose(true); // Close and refresh
    } else {
        toast({ title: "Erreur", description: result?.message || "Une erreur est survenue.", variant: "destructive" })
    }
  }

  const getTitle = () => {
    return mode === 'add' ? 'Ajouter une nouvelle matière' : `Modifier la matière : ${subject?.name}`;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de la matière</FormLabel>
                  <FormControl><Input placeholder="Ex: Mathématiques" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? <Loader2 className="animate-spin mr-2" /> : null}
              {mode === 'add' ? 'Ajouter la matière' : 'Enregistrer les modifications'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
