// src/services/flashcard-service.ts
'use client';

import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, serverTimestamp, query, where, orderBy, writeBatch, setDoc, increment, or } from 'firebase/firestore';
import { getSubjects } from './subject-service';
import { getSchoolStructure } from './school-structure-service';

export interface Card {
    id: string;
    question: string;
    answer: string;
}

export interface FlashcardDeck {
  id: string;
  title: string;
  subjectId: string;
  subjectName?: string;
  isPublic: boolean;
  classes: string[];
  series: string[];
  cards: Card[];
  createdBy: string; // User ID
  createdAt: string;
}

export type FlashcardDeckFormData = Omit<FlashcardDeck, 'id' | 'createdAt' | 'createdBy' | 'subjectName'>;

const decksCollection = collection(db, 'flashcardDecks');

export async function getFlashcardDecks(options: { 
    forUserClass?: { schoolClass: string, series: string };
    includePrivate?: boolean;
    userId?: string;
}): Promise<FlashcardDeck[]> {
    const { forUserClass, includePrivate, userId } = options;

    let q;

    if (includePrivate) { // Admin case
        q = query(decksCollection, orderBy("createdAt", "desc"));
    } else if (forUserClass) { // User case
        q = query(
            decksCollection,
            where("classes", "array-contains", forUserClass.schoolClass)
        );
    } else {
        return [];
    }
    
    try {
        const querySnapshot = await getDocs(q);
        const subjects = await getSubjects();
        const subjectsMap = new Map(subjects.map(s => [s.id, s.name]));

        const decks: FlashcardDeck[] = [];
        querySnapshot.forEach(doc => {
            const data = doc.data();
            decks.push({
                id: doc.id,
                ...data,
                subjectName: subjectsMap.get(data.subjectId) || 'Inconnu',
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
            } as FlashcardDeck);
        });
        
        // Final filtering for user view
        if (forUserClass && userId) {
            return decks.filter(deck => 
                (deck.isPublic && deck.series.includes(forUserClass.series)) 
                || deck.createdBy === userId
            );
        }

        return decks;

    } catch (error) {
        console.error("Error fetching flashcard decks:", error);
        return [];
    }
}

export async function getFlashcardDeckById(id: string): Promise<FlashcardDeck | null> {
    const docRef = doc(db, 'flashcardDecks', id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;

    const subjects = await getSubjects();
    const subjectsMap = new Map(subjects.map(s => [s.id, s.name]));
    const data = docSnap.data();

    return {
        id: docSnap.id,
        ...data,
        subjectName: subjectsMap.get(data.subjectId) || 'Inconnu',
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
    } as FlashcardDeck;
}

export async function createFlashcardDeck(data: FlashcardDeckFormData, userId?: string): Promise<string> {
    const docRef = await addDoc(decksCollection, {
        ...data,
        createdBy: userId || 'admin', // 'admin' if created from backend
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return docRef.id;
}

export async function updateFlashcardDeck(id: string, data: FlashcardDeckFormData): Promise<void> {
    const docRef = doc(db, 'flashcardDecks', id);
    await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
}

export async function deleteFlashcardDeck(id: string): Promise<void> {
    // Also delete user progress associated with this deck
    const progressCollection = collection(db, 'userFlashcardProgress');
    const q = query(progressCollection, where("deckId", "==", id));
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    snapshot.forEach(doc => batch.delete(doc.ref));
    batch.delete(doc(db, 'flashcardDecks', id));
    await batch.commit();
}


export async function getFlashcardFormConfiguration() {
    const [structure, subjects] = await Promise.all([
        getSchoolStructure(),
        getSubjects()
    ]);
    
    const allSeries = structure.flatMap(c => c.series).reduce((acc, current) => {
        if (!acc.find(item => item.value === current.value)) acc.push(current);
        return acc;
    }, [] as { value: string; label: string }[]);

    return {
        classes: structure.map(s => ({ value: s.name, label: s.name })),
        allSeries,
        subjects: subjects.map(s => ({ value: s.id, label: s.name })),
    };
}


// --- User Progress Service ---

export interface CardProgress {
    [cardId: string]: 'learning' | 'mastered';
}

export async function getUserProgress(userId: string, deckId: string): Promise<CardProgress> {
    const progressRef = doc(db, 'userFlashcardProgress', `${userId}_${deckId}`);
    const docSnap = await getDoc(progressRef);
    if(docSnap.exists()) {
        return docSnap.data().progress || {};
    }
    return {};
}

export async function updateUserProgress(userId: string, deckId: string, cardId: string, status: 'learning' | 'mastered') {
    const progressRef = doc(db, 'userFlashcardProgress', `${userId}_${deckId}`);
    
    await setDoc(progressRef, {
        userId,
        deckId,
        progress: {
            [cardId]: status
        }
    }, { merge: true });
}

// --- Points Service ---

export async function addPointsForActivity(userId: string, activityType: 'flashcard_review' | 'chapter_review') {
    const userRef = doc(db, 'users', userId);
    let pointsToAdd = 0;
    
    switch (activityType) {
        case 'flashcard_review':
            pointsToAdd = 1;
            break;
        case 'chapter_review':
            pointsToAdd = 5;
            break;
    }

    if (pointsToAdd > 0) {
        await updateDoc(userRef, {
            points: increment(pointsToAdd)
        });
    }
}
