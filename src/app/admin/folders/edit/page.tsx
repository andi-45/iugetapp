
// src/app/admin/folders/edit/page.tsx
'use client'

import { notFound, useSearchParams } from 'next/navigation';
import { getResourceFolderById, type ResourceFolder } from '@/services/resource-folder-service';
import { FolderForm } from '../folder-form';
import { useEffect, useState, Suspense } from 'react';
import { Loader2 } from 'lucide-react';


function EditFolderContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const [folder, setFolder] = useState<ResourceFolder | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if(id) {
            getResourceFolderById(id).then(data => {
                if(!data) notFound();
                setFolder(data);
                setIsLoading(false);
            });
        } else {
            setIsLoading(false);
        }
    }, [id]);

    if(isLoading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin" /></div>;
    }
    
    if(!id || !folder) {
        return notFound();
    }

    return (
        <div className="flex-1 space-y-8">
            <header>
                <h1 className="text-4xl font-headline font-bold">Modifier le dossier</h1>
                <p className="text-muted-foreground mt-2">
                    Mettez à jour les informations du dossier : "{folder.title}"
                </p>
            </header>
            <FolderForm folder={folder} />
        </div>
    )
}

export default function EditFolderPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-64"><Loader2 className="animate-spin" /></div>}>
            <EditFolderContent />
        </Suspense>
    )
}
