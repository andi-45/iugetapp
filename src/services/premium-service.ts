// src/services/premium-service.ts
'use client';

import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';

export interface PremiumInfo {
    userId: string;
    startDate: Date; 
    endDate: Date;
    duration: 'week' | 'month' | 'year';
}

export interface PremiumStatus {
    isPremium: boolean;
    expiresAt: string | null;
}

/**
 * Optimisé : Récupère tous les documents premium en une seule fois et les retourne sous forme de Map.
 */
export async function getPremiumsMap(): Promise<Map<string, PremiumInfo>> {
    const premiumsMap = new Map<string, PremiumInfo>();
    try {
        const snapshot = await getDocs(collection(db, 'premiums'));
        snapshot.forEach(doc => {
            const data = doc.data();
            premiumsMap.set(doc.id, {
                userId: doc.id,
                startDate: data.startDate.toDate(),
                endDate: data.endDate.toDate(),
                duration: data.duration,
            });
        });
    } catch (error) {
        console.error("Error fetching all premium documents:", error);
    }
    return premiumsMap;
}

export async function getPremiumStatus(userId: string, premiumsMap?: Map<string, PremiumInfo>): Promise<PremiumStatus> {
    try {
        // Si la map est fournie, on l'utilise pour éviter une lecture
        if (premiumsMap) {
            const premiumInfo = premiumsMap.get(userId);
            if (!premiumInfo) {
                return { isPremium: false, expiresAt: null };
            }
            if (premiumInfo.endDate < new Date()) {
                // Le document est expiré mais peut-être pas encore supprimé.
                return { isPremium: false, expiresAt: premiumInfo.endDate.toISOString() };
            }
            return { isPremium: true, expiresAt: premiumInfo.endDate.toISOString() };
        }

        // Comportement original si la map n'est pas fournie (pour les cas individuels)
        const premiumDocRef = doc(db, 'premiums', userId);
        const premiumDoc = await getDoc(premiumDocRef);

        if (!premiumDoc.exists()) {
            return { isPremium: false, expiresAt: null };
        }
        
        const data = premiumDoc.data();
        const endDate = data.endDate.toDate();

        if (endDate < new Date()) {
            await deleteDoc(premiumDocRef);
            return { isPremium: false, expiresAt: endDate.toISOString() };
        }

        return { isPremium: true, expiresAt: endDate.toISOString() };
    } catch (error) {
        console.error(`Error fetching premium status for user ${userId}:`, error);
        return { isPremium: false, expiresAt: null };
    }
}

export async function activatePremium(userId: string, duration: 'week' | 'month' | 'year'): Promise<void> {
    const startDate = new Date();
    let endDate = new Date(startDate);

    switch (duration) {
        case 'week':
            endDate.setDate(startDate.getDate() + 7);
            break;
        case 'month':
            endDate.setMonth(startDate.getMonth() + 1);
            break;
        case 'year': // Année scolaire (environ 9 mois)
            endDate.setMonth(startDate.getMonth() + 9);
            break;
    }

    const premiumDocRef = doc(db, 'premiums', userId);
    
    await setDoc(premiumDocRef, {
        userId,
        startDate,
        endDate,
        duration,
    });
}

export async function deactivatePremium(userId: string): Promise<void> {
    const premiumDocRef = doc(db, 'premiums', userId);
    const premiumDoc = await getDoc(premiumDocRef);
    if (premiumDoc.exists()) {
        await deleteDoc(premiumDocRef);
    }
}
