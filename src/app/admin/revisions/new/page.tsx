// src/app/admin/revisions/new/page.tsx
import { RevisionForm } from "../revision-form";

export default function NewRevisionPage() {
    return (
        <div className="flex-1 space-y-8">
            <header>
                <h1 className="text-4xl font-headline font-bold">Créer une Fiche de Révision</h1>
                <p className="text-muted-foreground mt-2">
                    Remplissez le formulaire pour créer une nouvelle fiche de révision avec ses chapitres et ressources.
                </p>
            </header>
            <RevisionForm />
        </div>
    )
}
