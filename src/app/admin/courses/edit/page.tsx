
// src/app/admin/courses/edit/page.tsx
'use client'

import { notFound, useSearchParams } from 'next/navigation';
import { getCourseById, type Course } from '@/services/course-service';
import { CourseForm } from '../course-form';
import { useEffect, useState, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

function EditCourseContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const [course, setCourse] = useState<Course | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if(id) {
            getCourseById(id).then(data => {
                if (!data) {
                    notFound();
                }
                setCourse(data);
                setIsLoading(false);
            });
        } else {
            setIsLoading(false);
        }
    }, [id]);

    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin" /></div>;
    }

    if (!id || !course) {
        return notFound();
    }

    return (
        <div className="flex-1 space-y-8">
            <header>
                <h1 className="text-4xl font-headline font-bold">Modifier le cours</h1>
                <p className="text-muted-foreground mt-2">
                    Mettez à jour les informations du cours : "{course.title}"
                </p>
            </header>
            <CourseForm course={course} />
        </div>
    )
}

export default function EditCoursePage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-64"><Loader2 className="animate-spin" /></div>}>
            <EditCourseContent />
        </Suspense>
    )
}
