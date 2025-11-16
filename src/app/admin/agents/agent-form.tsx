// src/app/admin/agents/agent-form.tsx
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { type AIAgent, type AIAgentFormData, createAgent, updateAgent } from "@/services/agent-service"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { IconByName } from "@/lib/icon-by-name"

const agentFormSchema = z.object({
  name: z.string().min(3, "Le nom doit faire au moins 3 caractères."),
  description: z.string().min(10, "La description doit faire au moins 10 caractères."),
  systemPrompt: z.string().min(20, "Le prompt système doit faire au moins 20 caractères."),
  icon: z.string().min(1, "Veuillez sélectionner une icône."),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "La couleur doit être un code hexadécimal (ex: #ff9100)."),
})

type AgentFormValues = z.infer<typeof agentFormSchema>

interface AgentFormProps {
  mode: 'add' | 'edit';
  isOpen: boolean;
  onClose: (refresh: boolean) => void;
  agent?: AIAgent | null;
}

export function AgentForm({ mode, isOpen, onClose, agent }: AgentFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AgentFormValues>({
    resolver: zodResolver(agentFormSchema),
    defaultValues: {
        name: agent?.name || "",
        description: agent?.description || "",
        systemPrompt: agent?.systemPrompt || "",
        icon: agent?.icon || "Bot",
        color: agent?.color || "#ff9100",
    },
  })

  const handleOpenChange = (open: boolean) => {
    if (!open) {
        onClose(false);
    }
  }

  async function onSubmit(data: AgentFormValues) {
    setIsLoading(true);
    let success = false;
    try {
      if (mode === 'add') {
        await createAgent(data)
        toast({ title: "Agent IA créé", description: "Le nouvel agent est maintenant disponible." })
      } else if (agent) {
        await updateAgent(agent.id, data)
        toast({ title: "Agent IA mis à jour", description: "Les modifications ont été enregistrées." })
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
    return mode === 'add' ? 'Ajouter un nouvel agent IA' : "Modifier l'agent IA";
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>Remplissez les informations de l'agent ci-dessous.</DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1 pr-4">
            <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Nom de l'agent</FormLabel>
                    <FormControl><Input {...field} placeholder="Ex: Solveur de Maths" /></FormControl>
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
                    <FormControl><Textarea {...field} rows={2} placeholder="Aide les élèves à résoudre les problèmes de mathématiques." /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="systemPrompt"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Prompt Système</FormLabel>
                    <FormControl><Textarea {...field} rows={6} placeholder="Tu es un expert en mathématiques. Ton but est d'aider les élèves à résoudre des problèmes étape par étape..." /></FormControl>
                    <FormDescription>C'est l'instruction principale qui définit le comportement de l'agent.</FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="icon"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Icône</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {Object.keys(IconByName).map((iconName) => {
                                        const Icon = IconByName[iconName];
                                        return (
                                            <SelectItem key={iconName} value={iconName}>
                                                <div className="flex items-center gap-2">
                                                    <Icon className="h-4 w-4" />
                                                    {iconName}
                                                </div>
                                            </SelectItem>
                                        )
                                    })}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Couleur</FormLabel>
                        <FormControl><Input type="color" {...field} className="h-10 p-1" /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
           
            <Button type="submit" disabled={isLoading} className="mt-4">
                {isLoading ? <Loader2 className="animate-spin mr-2" /> : null}
                Enregistrer
            </Button>
        </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
