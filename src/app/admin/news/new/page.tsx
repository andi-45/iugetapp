// src/app/admin/news/new/page.tsx
import { NewsForm } from "../news-form";

export default function NewNewsPage() {
    return (
        <div className="flex-1 space-y-8">
            <header>
                <h1 className="text-4xl font-headline font-bold">Rédiger un nouvel article</h1>
                <p className="text-muted-foreground mt-2">
                    Remplissez le formulaire pour créer un nouvel article ou une annonce.
                </p>
            </header>
            <NewsForm />
        </div>
    )
}
