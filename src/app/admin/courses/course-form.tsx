// src/app/admin/courses/course-form.tsx
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
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { type Course, type CourseFormData, createCourse, updateCourse, getCourseConfiguration } from "@/services/course-service"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

const courseFormSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères."),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères."),
  pdfUrl: z.string().url("Veuillez entrer une URL valide."),
  status: z.enum(["draft", "published"]),
  subjectId: z.string().min(1, "Vous devez sélectionner une matière."),
  classes: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "Vous devez sélectionner au moins une classe.",
  }),
  series: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "Vous devez sélectionner au moins une série.",
  }),
})

type CourseFormValues = z.infer<typeof courseFormSchema>

interface CourseFormProps {
  course?: Course
}

type ConfigType = {
    classes: { value: string, label: string }[],
    allSeries: { value: string, label: string }[],
    subjects: { value: string, label: string }[]
}

export function CourseForm({ course }: CourseFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [config, setConfig] = useState<ConfigType | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getCourseConfiguration().then(setConfig);
  }, []);

  const defaultValues: Partial<CourseFormValues> = {
    title: course?.title || "",
    description: course?.description || "",
    pdfUrl: course?.pdfUrl || "",
    status: course?.status || "draft",
    subjectId: course?.subjectId || "",
    classes: course?.classes || [],
    series: course?.series || [],
  }

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues,
    mode: "onChange",
  })

  async function onSubmit(data: CourseFormValues) {
    setIsLoading(true);
    try {
      const courseData: CourseFormData = data;
      if (course) {
        await updateCourse(course.id, courseData)
        toast({ title: "Cours mis à jour", description: "Le cours a été mis à jour avec succès." })
        router.refresh();
      } else {
        const newCourseId = await createCourse(courseData)
        toast({ title: "Cours créé", description: "Le nouveau cours a été créé avec succès." })
        router.push(`/admin/courses/${newCourseId}`)
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du cours", error);
      toast({ title: "Erreur", description: "Une erreur est survenue.", variant: "destructive" })
    } finally {
        setIsLoading(false);
    }
  }

  if (!config) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <Card>
                <CardHeader><CardTitle>Informations principales</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                     <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Titre du cours</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl><Textarea {...field} rows={5} /></FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="pdfUrl"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>URL du PDF du cours</FormLabel>
                            <FormControl><Input {...field} placeholder="https://..." /></FormControl>
                            <FormDescription>Le lien direct vers le fichier PDF hébergé.</FormDescription>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>
          </div>
          <div className="space-y-8">
            <Card>
                <CardHeader><CardTitle>Organisation</CardTitle></CardHeader>
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
                        name="subjectId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Matière</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner une matière" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {config.subjects.map((subject) => (
                                            <SelectItem key={subject.value} value={subject.value}>
                                                {subject.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="classes"
                        render={() => (
                            <FormItem>
                                <div className="mb-4">
                                <FormLabel className="text-base">Classes</FormLabel>
                                <FormDescription>Sélectionnez les classes concernées.</FormDescription>
                                </div>
                                {config.classes.map((item) => (
                                <FormField
                                    key={item.value}
                                    control={form.control}
                                    name="classes"
                                    render={({ field }) => {
                                    return (
                                        <FormItem key={item.value} className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value?.includes(item.label)}
                                                onCheckedChange={(checked) => {
                                                    return checked
                                                    ? field.onChange([...field.value, item.label])
                                                    : field.onChange(
                                                        field.value?.filter(
                                                        (value) => value !== item.label
                                                        )
                                                    )
                                                }}
                                            />
                                        </FormControl>
                                        <FormLabel className="font-normal">{item.label}</FormLabel>
                                        </FormItem>
                                    )
                                    }}
                                />
                                ))}
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                    <FormField
                        control={form.control}
                        name="series"
                        render={() => (
                            <FormItem>
                                <div className="mb-4">
                                <FormLabel className="text-base">Séries</FormLabel>
                                <FormDescription>Sélectionnez les séries concernées.</FormDescription>
                                </div>
                                {config.allSeries.map((item) => (
                                <FormField
                                    key={item.value}
                                    control={form.control}
                                    name="series"
                                    render={({ field }) => {
                                    return (
                                        <FormItem key={item.value} className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value?.includes(item.value)}
                                                onCheckedChange={(checked) => {
                                                    return checked
                                                    ? field.onChange([...field.value, item.value])
                                                    : field.onChange(
                                                        field.value?.filter(
                                                        (value) => value !== item.value
                                                        )
                                                    )
                                                }}
                                            />
                                        </FormControl>
                                        <FormLabel className="font-normal">{item.label}</FormLabel>
                                        </FormItem>
                                    )
                                    }}
                                />
                                ))}
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                </CardContent>
            </Card>
             <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {course ? "Enregistrer les modifications" : "Créer le cours"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}
