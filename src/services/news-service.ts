// src/services/news-service.ts
'use client';

import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string; // HTML content
  date: string; // Stored as a simple string for now e.g. "1 juin 2024"
  category: string;
  status: 'published' | 'draft';
  imageUrl: string;
  imageHint: string;
  createdAt: string;
}

export type NewsFormData = Omit<NewsArticle, 'id' | 'createdAt' | 'slug' | 'imageUrl' | 'imageHint'>;

const newsCollection = collection(db, 'news');
const defaultImageUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSbtIhPIQrl85jhG71amOKmJ3-ViRnXXtk04PAcLvPfHQ&s";

function createSlug(title: string) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // remove special chars
        .replace(/\s+/g, '-') // replace spaces with hyphens
        .replace(/-+/g, '-'); // remove consecutive hyphens
}

export async function getNews(): Promise<NewsArticle[]> {
  try {
    const snapshot = await getDocs(newsCollection);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString();
        return {
            id: doc.id,
            ...data,
            imageUrl: defaultImageUrl, // On force l'utilisation de l'URL par défaut
            imageHint: data.imageHint || "news article",
            createdAt,
        } as NewsArticle
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des actualités:", error);
    return [];
  }
}

export async function getNewsArticleById(id: string): Promise<NewsArticle | null> {
    try {
        const docRef = doc(db, 'news', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
             const data = docSnap.data();
             const createdAt = data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString();
            return { 
                id: docSnap.id, 
                ...data, 
                imageUrl: defaultImageUrl, // On force l'utilisation de l'URL par défaut
                imageHint: data.imageHint || "news article",
                createdAt 
            } as NewsArticle;
        }
        return null;
    } catch(e) {
        console.error("Erreur lors de la récupération de l'article", e);
        return null;
    }
}

export async function createNews(data: NewsFormData): Promise<string> {
    const slug = createSlug(data.title);
    const newArticleRef = await addDoc(newsCollection, {
        ...data,
        slug,
        imageUrl: defaultImageUrl,
        imageHint: 'education brand image',
        createdAt: serverTimestamp(),
    });
    return newArticleRef.id;
}

export async function updateNews(id: string, data: NewsFormData): Promise<void> {
    const slug = createSlug(data.title);
    const docRef = doc(db, 'news', id);
    await updateDoc(docRef, { ...data, slug, updatedAt: serverTimestamp() });
}

export async function deleteNews(id: string): Promise<void> {
    const docRef = doc(db, 'news', id);
    await deleteDoc(docRef);
}
