import { CourseForm } from '../course-form';

export default function NewCoursePage() {
    return (
        <div className="flex-1 space-y-8">
            <header>
                <h1 className="text-4xl font-headline font-bold">Ajouter un nouveau cours</h1>
                <p className="text-muted-foreground mt-2">
                    Remplissez le formulaire ci-dessous pour créer un nouveau cours.
                </p>
            </header>
            <CourseForm />
        </div>
    )
}
