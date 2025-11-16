// src/app/admin/revisions/edit/page.tsx
'use client'

import { notFound, useSearchParams } from 'next/navigation';
import { getRevisionById, type Revision } from '@/services/revision-service';
import { RevisionForm } from '../revision-form';
import { useEffect, useState, Suspense } from 'react';
import { Loader2 } from 'lucide-react';


function EditRevisionContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const [revision, setRevision] = useState<Revision | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if(id) {
            getRevisionById(id).then(data => {
                if(!data) notFound();
                setRevision(data);
                setIsLoading(false);
            });
        } else {
            setIsLoading(false);
        }
    }, [id]);

    if(isLoading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin" /></div>;
    }
    
    if(!id || !revision) {
        return notFound();
    }

    return (
        <div className="flex-1 space-y-8">
            <header>
                <h1 className="text-4xl font-headline font-bold">Modifier la Fiche de Révision</h1>
                <p className="text-muted-foreground mt-2">
                    Mettez à jour les informations pour : "{revision.subjectName}"
                </p>
            </header>
            <RevisionForm revision={revision} />
        </div>
    )
}

export default function EditRevisionPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-64"><Loader2 className="animate-spin" /></div>}>
            <EditRevisionContent />
        </Suspense>
    )
}
