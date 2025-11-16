// src/app/ia-tools/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";
import { getAgents, type AIAgent } from "@/services/agent-service";
import { Bot, Loader2, Search } from "lucide-react";
import { IconByName } from '@/lib/icon-by-name';
import { Input } from '@/components/ui/input';

export default function IaToolsPage() {
    const [agents, setAgents] = useState<AIAgent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        getAgents().then(data => {
            setAgents(data);
            setIsLoading(false);
        });
    }, []);

    const filteredAgents = useMemo(() => {
        if (!searchTerm) return agents;
        return agents.filter(agent =>
            agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            agent.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [agents, searchTerm]);

    if (isLoading) {
        return (
            <div className="flex-1 flex justify-center items-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-8 p-4 md:p-8">
            <header>
                <h1 className="text-4xl font-headline font-bold text-gray-800 dark:text-white">Outils IA</h1>
                <p className="text-muted-foreground mt-2">
                    Découvrez des assistants IA spécialisés pour vous aider dans vos études.
                </p>
            </header>
            
            <div className="relative w-full md:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                    placeholder="Rechercher un outil..." 
                    className="pl-10"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            {filteredAgents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredAgents.map(agent => {
                        const Icon = IconByName[agent.icon] || Bot;
                        return (
                        <Link key={agent.id} href={`/ia-tools/chat?id=${agent.id}`} legacyBehavior>
                            <a className="block h-full">
                                <Card className="h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
                                    <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-4">
                                        <div className="p-4 rounded-full" style={{ backgroundColor: agent.color }}>
                                            <Icon className="h-8 w-8 text-white" />
                                        </div>
                                        <h3 className="text-xl font-headline font-semibold">{agent.name}</h3>
                                        <p className="text-sm text-muted-foreground">{agent.description}</p>
                                    </CardContent>
                                </Card>
                            </a>
                        </Link>
                    )})}
                </div>
            ) : (
                <Card className="border-dashed">
                    <CardContent className="p-8 text-center text-muted-foreground">
                        <h3 className="text-lg font-semibold">Aucun outil IA trouvé</h3>
                        <p className="mt-1">Aucun outil ne correspond à votre recherche.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
