// src/services/history-service.ts
'use client';

import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs } from 'firebase/firestore';

export interface HistoryItem {
    id?: string;
    type: 'flashcard' | 'chapter' | 'ai';
    title: string;
    link: string;
    createdAt?: string; // ISO string
}

export type HistoryItemData = Omit<HistoryItem, 'id' | 'createdAt'>;

/**
 * Adds a new item to a user's history.
 * @param userId - The ID of the user.
 * @param item - The history item data to add.
 */
export async function addHistoryItem(userId: string, item: HistoryItemData): Promise<void> {
    try {
        const historyCollection = collection(db, 'users', userId, 'history');
        await addDoc(historyCollection, {
            ...item,
            createdAt: serverTimestamp(),
        });
        // Note: We might want to add logic here to trim old history items if the collection grows too large.
    } catch (error) {
        console.error("Error adding history item:", error);
    }
}

/**
 * Retrieves the most recent history items for a user.
 * @param userId - The ID of the user.
 * @param count - The number of items to retrieve.
 * @returns A promise that resolves to an array of history items.
 */
export async function getHistory(userId: string, count: number = 5): Promise<HistoryItem[]> {
    try {
        const historyCollection = collection(db, 'users', userId, 'history');
        const q = query(historyCollection, orderBy('createdAt', 'desc'), limit(count));
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
            } as HistoryItem;
        });
    } catch (error) {
        console.error("Error fetching history:", error);
        return [];
    }
}
