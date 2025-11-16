// src/app/admin/flashcards/new/page.tsx
import { FlashcardForm } from "../flashcard-form";

export default function NewFlashcardDeckPage() {
    return (
        <div className="flex-1 space-y-8">
            <header>
                <h1 className="text-4xl font-headline font-bold">Créer un Paquet de Flashcards</h1>
                <p className="text-muted-foreground mt-2">
                    Remplissez le formulaire pour créer un nouveau paquet.
                </p>
            </header>
            <FlashcardForm />
        </div>
    )
}
