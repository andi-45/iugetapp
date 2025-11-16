
// src/app/admin/news/edit/page.tsx
'use client'

import { notFound, useSearchParams } from 'next/navigation';
import { getNewsArticleById, type NewsArticle } from '@/services/news-service';
import { NewsForm } from '../news-form';
import { Suspense, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

function EditNewsContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const [article, setArticle] = useState<NewsArticle | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id) {
            getNewsArticleById(id).then(data => {
                if (!data) notFound();
                setArticle(data);
                setIsLoading(false);
            });
        } else {
            setIsLoading(false);
        }
    }, [id]);

    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin" /></div>;
    }
    
    if (!id || !article) {
        return notFound();
    }

    return (
        <div className="flex-1 space-y-8">
            <header>
                <h1 className="text-4xl font-headline font-bold">Modifier l'article</h1>
                <p className="text-muted-foreground mt-2">
                    Mettez à jour les informations de l'article : "{article.title}"
                </p>
            </header>
            <NewsForm article={article} />
        </div>
    )
}

export default function EditNewsPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-64"><Loader2 className="animate-spin" /></div>}>
            <EditNewsContent />
        </Suspense>
    )
}
