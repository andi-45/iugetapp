// src/app/planner/planner-form.tsx
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { type ScheduleEvent, type ScheduleEventFormData, addScheduleEvent, updateScheduleEvent } from "@/services/planner-service"
import { getSubjects, type Subject } from "@/services/subject-service"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

const weekDays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const eventTypes = [
    { value: "revision", label: "Révision" },
    { value: "quiz", label: "Quiz" },
    { value: "exercice", label: "Exercices" },
    { value: "lecture", label: "Lecture" },
    { value: "evaluation", label: "Évaluation" },
];


const plannerFormSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères."),
  day: z.string().min(1, "Veuillez sélectionner un jour."),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format HH:MM invalide."),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format HH:MM invalide."),
  subjectId: z.string().min(1, "Vous devez sélectionner une matière."),
  type: z.enum(["revision", "quiz", "exercice", "lecture", "evaluation"]),
})

type PlannerFormValues = z.infer<typeof plannerFormSchema>

interface PlannerFormProps {
  mode: 'add' | 'edit';
  isOpen: boolean;
  onClose: (refresh: boolean) => void;
  event?: ScheduleEvent | null;
  defaultDay?: string;
}

export function PlannerForm({ mode, isOpen, onClose, event, defaultDay }: PlannerFormProps) {
  const { user } = useAuth();
  const { toast } = useToast()
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getSubjects().then(setSubjects);
  }, []);

  const form = useForm<PlannerFormValues>({
    resolver: zodResolver(plannerFormSchema),
    defaultValues: {
        title: event?.title || "",
        day: event?.day || defaultDay || "",
        startTime: event?.startTime || "",
        endTime: event?.endTime || "",
        subjectId: event?.subjectId || "",
        type: event?.type || "revision",
    },
  })

  const handleOpenChange = (open: boolean) => {
    if (!open) {
        onClose(false);
    }
  }

  async function onSubmit(data: PlannerFormValues) {
    if (!user) return;
    setIsLoading(true);
    let success = false;
    try {
      const eventData: ScheduleEventFormData = data;
      if (mode === 'add') {
        await addScheduleEvent(user.uid, eventData)
        toast({ title: "Événement ajouté", description: "Votre planning a été mis à jour." })
      } else if (event) {
        await updateScheduleEvent(user.uid, event.id, eventData)
        toast({ title: "Événement modifié", description: "Votre planning a été mis à jour." })
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
    return mode === 'add' ? 'Ajouter un événement' : "Modifier l'événement";
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>Planifiez votre temps d'étude efficacement.</DialogDescription>
        </DialogHeader>
        
        {subjects.length === 0 ? (
            <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin" /></div>
        ) : (
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Titre de l'événement</FormLabel>
                        <FormControl><Input {...field} placeholder="Ex: Réviser le Chapitre 3 de Maths" /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <FormField
                        control={form.control}
                        name="day"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Jour</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner un jour" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {weekDays.map((day) => (
                                            <SelectItem key={day} value={day}>{day}</SelectItem>
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
                                        {subjects.map((subject) => (
                                            <SelectItem key={subject.id} value={subject.id}>
                                                {subject.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <FormField
                        control={form.control}
                        name="startTime"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Heure de début</FormLabel>
                                <FormControl><Input type="time" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="endTime"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Heure de fin</FormLabel>
                                <FormControl><Input type="time" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                 
                <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Type d'activité</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {eventTypes.map((type) => (
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
                
                <Button type="submit" disabled={isLoading} className="mt-4 w-full">
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
