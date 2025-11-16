// src/services/promo-service.ts
'use client';

import { db } from '@/lib/firebase';
import { collection, doc, getDocs, setDoc, serverTimestamp, addDoc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';

export interface PromoContent {
    id: string;
    isActive: boolean;
    title: string;
    description: string;
    imageUrl: string;
    ctaText: string;
    ctaLink: string;
    order: number;
}

export type PromoFormData = Omit<PromoContent, 'id'>;

const promoCollection = collection(db, 'promoAds');

export async function getPromos(): Promise<PromoContent[]> {
    try {
        const q = query(promoCollection, orderBy("order", "asc"));
        const docSnap = await getDocs(q);
        if (docSnap.empty) {
            return [];
        }
        return docSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as PromoContent));
    } catch (error) {
        console.error("Error fetching promos:", error);
        return [];
    }
}

export async function createPromo(data: Omit<PromoFormData, 'order'>, lastOrder: number): Promise<string> {
    const docRef = await addDoc(promoCollection, {
        ...data,
        order: lastOrder + 1,
        createdAt: serverTimestamp(),
    });
    return docRef.id;
}


export async function updatePromo(id: string, data: Partial<PromoFormData>): Promise<void> {
    const docRef = doc(db, 'promoAds', id);
    await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
    });
}

export async function deletePromo(id: string): Promise<void> {
    await deleteDoc(doc(db, 'promoAds', id));
}

export async function updatePromoOrder(promos: { id: string; order: number }[]): Promise<void> {
    const batch = db.batch();
    promos.forEach(p => {
        const docRef = doc(db, 'promoAds', p.id);
        batch.update(docRef, { order: p.order });
    });
    await batch.commit();
}
