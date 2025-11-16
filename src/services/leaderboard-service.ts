// src/services/leaderboard-service.ts
'use client';

import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

const exclusionsRef = doc(db, 'settings', 'leaderboardExclusions');

/**
 * Fetches the list of user IDs excluded from the public leaderboard.
 * @returns A promise that resolves to an array of excluded user IDs.
 */
export async function getLeaderboardExclusions(): Promise<string[]> {
    try {
        const docSnap = await getDoc(exclusionsRef);
        if (docSnap.exists()) {
            return docSnap.data().excludedIds || [];
        }
        return [];
    } catch (error) {
        console.error("Error fetching leaderboard exclusions:", error);
        return [];
    }
}

/**
 * Adds or removes a user from the leaderboard exclusion list.
 * @param userId - The ID of the user to toggle.
 * @param exclude - True to exclude the user, false to include them.
 */
export async function toggleLeaderboardExclusion(userId: string, exclude: boolean): Promise<void> {
    try {
        if (exclude) {
            await updateDoc(exclusionsRef, {
                excludedIds: arrayUnion(userId)
            });
        } else {
            await updateDoc(exclusionsRef, {
                excludedIds: arrayRemove(userId)
            });
        }
    } catch (error) {
        // If the document doesn't exist, create it.
        if (error instanceof Error && (error as any).code === 'not-found') {
            await setDoc(exclusionsRef, { excludedIds: exclude ? [userId] : [] });
        } else {
            console.error("Error toggling leaderboard exclusion:", error);
            throw error; // Re-throw the error to be handled by the caller
        }
    }
}
