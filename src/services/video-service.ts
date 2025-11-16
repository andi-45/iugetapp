// src/services/video-service.ts
'use client';

import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, addDoc, updateDoc, deleteDoc, query, orderBy, limit, startAfter, type QueryDocumentSnapshot } from 'firebase/firestore';

// --- INTERFACES ---

export interface Author {
    id: string;
    name: string;
    imageUrl: string;
}

export interface Playlist {
    id: string;
    name: string;
    url: string; // Back to YouTube playlist URL
    authorId: string;
    language: 'Français' | 'English';
    imageUrl: string; 
}

export interface Video {
    id: string;
    title: string;
    url: string; 
    playlistId: string;
}

type AuthorFormData = Omit<Author, 'id'>;
type PlaylistFormData = Omit<Playlist, 'id'>;

// --- COLLECTIONS ---

const authorsCollection = collection(db, 'videoAuthors');
const playlistsCollection = collection(db, 'videoPlaylists');

// --- GETTERS ---

async function fetchData<T>(collectionRef: any): Promise<T[]> {
    const snapshot = await getDocs(collectionRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
}

export async function getAuthors(): Promise<Author[]> {
    return await fetchData<Author>(authorsCollection); 
}

export async function getPlaylists(): Promise<Playlist[]> {
    return await fetchData<Playlist>(playlistsCollection);
}


// --- CRUD for Authors ---
export async function createAuthor(data: AuthorFormData): Promise<string> {
    const docRef = await addDoc(authorsCollection, data);
    return docRef.id;
}

export async function updateAuthor(id: string, data: AuthorFormData): Promise<void> {
    const docRef = doc(db, 'videoAuthors', id);
    await updateDoc(docRef, data);
}

export async function deleteAuthor(id: string): Promise<void> {
    await deleteDoc(doc(db, 'videoAuthors', id));
}


// --- CRUD for Playlists ---
export async function createPlaylist(data: PlaylistFormData): Promise<string> {
    const docRef = await addDoc(playlistsCollection, data);
    return docRef.id;
}

export async function updatePlaylist(id: string, data: PlaylistFormData): Promise<void> {
    const docRef = doc(db, 'videoPlaylists', id);
    await updateDoc(docRef, data);
}

export async function deletePlaylist(id: string): Promise<void> {
    await deleteDoc(doc(db, 'videoPlaylists', id));
}
