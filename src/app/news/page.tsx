// src/app/news/page.tsx
'use client'

import { useState, useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getNews, type NewsArticle } from "@/services/news-service";
import { ArrowRight, Search, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function NewsPage() {
  const [newsItems, setNewsItems] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const data = await getNews();
      const publishedNews = data.filter(item => item.status === 'published');
      // Trier les articles par date, du plus récent au plus ancien
      publishedNews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setNewsItems(publishedNews);
      setIsLoading(false);
    }
    fetchData();
  }, []);

  const filteredNews = useMemo(() => {
    return newsItems.filter(item =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [newsItems, searchTerm]);

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8">
      <header>
        <h1 className="text-4xl font-headline font-bold text-gray-800 dark:text-white">Blog & Actualités</h1>
        <p className="text-muted-foreground mt-2">Tenez-vous informé des dernières nouvelles et des conseils d'étude.</p>
      </header>

      <div className="relative w-full md:max-w-md mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input 
          placeholder="Rechercher un article..." 
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

       {isLoading ? (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNews.length > 0 ? (
                filteredNews.map((item) => (
                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
                  <CardHeader className="p-0">
                    <Link href={`/news/article?slug=${item.slug}`}>
                        <Image src={item.imageUrl} alt={item.title} width={400} height={200} className="w-full h-48 object-cover" data-ai-hint={item.imageHint} />
                    </Link>
                  </CardHeader>
                  <CardContent className="p-4 flex flex-col flex-grow">
                    <div className="mb-2">
                      <Badge variant="secondary">{item.category}</Badge>
                    </div>
                    <CardTitle className="font-headline text-xl mb-2">{item.title}</CardTitle>
                    <CardDescription className="flex-grow">{item.summary}</CardDescription>
                    <div className="flex justify-between items-center mt-4">
                      <p className="text-xs text-muted-foreground">{item.date}</p>
                      <Button asChild variant="link" className="p-0">
                        <Link href={`/news/article?slug=${item.slug}`}>Lire la suite <ArrowRight className="ml-2 h-4 w-4" /></Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
                <div className="col-span-full text-center py-16 text-muted-foreground">
                    <p>Aucun article ne correspond à votre recherche.</p>
                </div>
            )}
          </div>
        )}
    </div>
  );
}
