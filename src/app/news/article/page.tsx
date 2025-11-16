// src/app/news/article/page.tsx
'use client';

import Head from 'next/head';
import { getNews, type NewsArticle } from '@/services/news-service';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Calendar, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useEffect, useState, Suspense } from 'react';

function ArticleContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug');
  const [article, setArticle] = useState<NewsArticle | null | undefined>(undefined);

  useEffect(() => {
    async function fetchArticle() {
      if (slug) {
        const allNews = await getNews();
        const foundArticle = allNews.find((item) => item.slug === slug);
        setArticle(foundArticle || null);
      } else {
        setArticle(null);
      }
    }
    fetchArticle();
  }, [slug]);

  // Loader
  if (article === undefined) {
    return (
      <>
        <Head>
          <title>Chargement de l'article...</title>
          <meta name="description" content="Chargement de l'article d'actualité" />
        </Head>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin" />
        </div>
      </>
    );
  }

  // Article introuvable
  if (article === null) {
    return (
      <>
        <Head>
          <title>Article introuvable</title>
          <meta name="description" content="L'article que vous cherchez est introuvable" />
        </Head>
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold mb-4">Article non trouvé</h1>
          <Button asChild>
            <Link href="/news">Retour à toutes les actualités</Link>
          </Button>
        </div>
      </>
    );
  }

  // Article trouvé
  return (
    <div className="flex-1">
      {/* SEO dynamique côté client */}
      <Head key={article.slug}>
        <title>{article.title}</title>
        <meta name="description" content={article.description || article.title} />
        <meta name="keywords" content={article.keywords?.join(', ') || ''} />
        <meta name="author" content="Ludovic Aggaï" />

        {/* Open Graph */}
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.description || article.title} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content={article.imageUrl || '/default-og-image.jpg'} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={article.description || article.title} />
        <meta name="twitter:image" content={article.imageUrl || '/default-og-image.jpg'} />
      </Head>

      {/* Header de l'article */}
      <header className="relative h-64 md:h-80 lg:h-96">
        <Image
          src={article.imageUrl}
          alt={article.title}
          layout="fill"
          objectFit="cover"
          className="brightness-50"
          data-ai-hint={article.imageHint}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-4">
          <Badge variant="secondary" className="mb-4">{article.category}</Badge>
          <h1 className="text-3xl md:text-5xl font-headline font-bold max-w-4xl">{article.title}</h1>
          <div className="mt-4 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{article.date}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu de l'article */}
      <main className="max-w-4xl mx-auto p-4 md:p-8">
        <article
          className="prose dark:prose-invert lg:prose-lg max-w-full"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
        <hr className="my-8" />
        <div className="text-center">
          <Button asChild>
            <Link href="/news">Retour à toutes les actualités</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}

export default function NewsArticlePage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin" />
      </div>
    }>
      <ArticleContent />
    </Suspense>
  );
}