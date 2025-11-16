// src/app/admin/folders/new/page.tsx
import { FolderForm } from "../folder-form";

export default function NewFolderPage() {
    return (
        <div className="flex-1 space-y-8">
            <header>
                <h1 className="text-4xl font-headline font-bold">Ajouter un nouveau dossier</h1>
                <p className="text-muted-foreground mt-2">
                    Remplissez le formulaire pour créer un nouveau dossier de ressources.
                </p>
            </header>
            <FolderForm />
        </div>
    )
}
