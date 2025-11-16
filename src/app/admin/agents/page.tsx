// src/app/admin/agents/page.tsx
'use client'

import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getAgents, deleteAgent, type AIAgent } from "@/services/agent-service" 
import { MoreHorizontal, PlusCircle, Edit, Trash2, Loader2, Bot, Palette } from "lucide-react"
import { AgentForm } from "./agent-form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast";
import { IconByName } from "@/lib/icon-by-name";

type FormState = {
  mode: 'add' | 'edit';
  isOpen: boolean;
  agent?: AIAgent | null;
}

export default function AdminAgentsPage() {
    const [agents, setAgents] = useState<AIAgent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [formState, setFormState] = useState<FormState>({ mode: 'add', isOpen: false });
    const { toast } = useToast();

    const fetchAgents = async () => {
        setIsLoading(true);
        const data = await getAgents();
        setAgents(data);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchAgents();
    }, []);

    const handleOpenForm = (mode: FormState['mode'], agent?: AIAgent) => {
        setFormState({ mode, agent, isOpen: true });
    }

    const handleCloseForm = (refresh: boolean) => {
        setFormState({ ...formState, isOpen: false });
        if (refresh) {
            fetchAgents();
        }
    }
    
    const handleDelete = async (id: string, name: string) => {
        try {
            await deleteAgent(id);
            toast({ title: "Agent supprimé", description: `L'agent IA "${name}" a été supprimé.` });
            fetchAgents();
        } catch (error) {
            toast({ title: "Erreur", description: "Impossible de supprimer l'agent.", variant: "destructive" });
        }
    }

    return (
        <div className="flex-1 space-y-8">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-headline font-bold">Gestion des Agents IA</h1>
                    <p className="text-muted-foreground mt-2">
                        Créez et configurez des assistants IA spécialisés pour les élèves.
                    </p>
                </div>
                <Button onClick={() => handleOpenForm('add')}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Ajouter un agent
                </Button>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>Liste des Agents IA</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-48">
                            <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : agents.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {agents.map((agent) => {
                                const Icon = IconByName[agent.icon] || Bot;
                                return (
                                <Card key={agent.id} className="group">
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 rounded-lg" style={{backgroundColor: agent.color}}>
                                                <Icon className="h-6 w-6 text-white" />
                                            </div>
                                            <CardTitle className="text-xl">{agent.name}</CardTitle>
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenForm('edit', agent)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Cette action est irréversible et supprimera l'agent "{agent.name}".
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(agent.id, agent.name)}>Confirmer</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription>{agent.description}</CardDescription>
                                    </CardContent>
                                </Card>
                            )})}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            <p>Aucun agent IA créé. Cliquez sur "Ajouter un agent" pour commencer.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {formState.isOpen && (
                <AgentForm
                    mode={formState.mode}
                    isOpen={formState.isOpen}
                    onClose={handleCloseForm}
                    agent={formState.agent}
                />
            )}
        </div>
    )
}
