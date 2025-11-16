// src/app/admin/whatsapp/page.tsx
'use client'

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Phone, Save, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getWhatsAppAdminConfig, setWhatsAppGroupLink } from '@/services/whatsapp-group-service';
import type { SchoolClass } from '@/services/school-structure-service';

type ClassWithLinks = SchoolClass & {
    series: {
        value: string;
        label: string;
        link: string;
    }[];
}

export default function AdminWhatsAppPage() {
    const [config, setConfig] = useState<ClassWithLinks[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState<string | null>(null);
    const { toast } = useToast();

    const fetchConfig = async () => {
        setIsLoading(true);
        const data = await getWhatsAppAdminConfig();
        setConfig(data);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchConfig();
    }, []);

    const handleLinkChange = (classIndex: number, seriesIndex: number, newLink: string) => {
        const newConfig = [...config];
        newConfig[classIndex].series[seriesIndex].link = newLink;
        setConfig(newConfig);
    };

    const handleSave = async (className: string, seriesValue: string, seriesLabel: string, link: string) => {
        const key = `${className}-${seriesValue}`;
        setIsSaving(key);
        try {
            await setWhatsAppGroupLink(className, seriesValue, seriesLabel, link);
            toast({
                title: "Lien enregistré",
                description: `Le lien pour ${className} - ${seriesLabel} a été mis à jour.`,
                action: <CheckCircle className="text-green-500" />
            });
        } catch (error) {
            toast({ title: "Erreur", description: "Impossible d'enregistrer le lien.", variant: "destructive" });
        } finally {
            setIsSaving(null);
        }
    };
    
    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin h-8 w-8" /></div>;
    }

    return (
        <div className="flex-1 space-y-8">
            <header>
                <h1 className="text-4xl font-headline font-bold">Groupes WhatsApp</h1>
                <p className="text-muted-foreground mt-2">Gérez les liens des groupes WhatsApp pour chaque classe et série.</p>
            </header>

            <div className="space-y-6">
                {config.map((sClass, classIndex) => (
                    <Card key={sClass.id}>
                        <CardHeader>
                            <CardTitle>{sClass.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {sClass.series.map((s, seriesIndex) => (
                                <div key={s.value} className="flex flex-col sm:flex-row items-center gap-4 p-3 border rounded-lg">
                                    <Label htmlFor={`${sClass.id}-${s.value}`} className="sm:w-32 shrink-0 font-semibold">
                                        Série {s.label}
                                    </Label>
                                    <div className="flex-1 w-full flex items-center gap-2">
                                        <Phone className="h-5 w-5 text-muted-foreground" />
                                        <Input
                                            id={`${sClass.id}-${s.value}`}
                                            placeholder="https://chat.whatsapp.com/..."
                                            value={s.link}
                                            onChange={(e) => handleLinkChange(classIndex, seriesIndex, e.target.value)}
                                        />
                                        <Button 
                                            size="sm"
                                            onClick={() => handleSave(sClass.name, s.value, s.label, s.link)}
                                            disabled={isSaving === `${sClass.name}-${s.value}`}
                                        >
                                            {isSaving === `${sClass.name}-${s.value}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                            <span className="hidden sm:inline ml-2">Enregistrer</span>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                             {sClass.series.length === 0 && (
                                <p className="text-muted-foreground text-sm text-center">Aucune série définie pour cette classe. Ajoutez-en dans la section "Structure".</p>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
