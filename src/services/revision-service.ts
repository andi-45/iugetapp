// src/services/revision-service.ts
'use client';

import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, serverTimestamp, query, orderBy, increment } from 'firebase/firestore';
import { getResources, type Resource } from './resource-service';
import { getSubjects } from './subject-service';
import { getSchoolStructure } from './school-structure-service';

export interface RevisionChapter {
    id: string; // ex: 'chap-1-cinematique'
    title: string;
    pdfUrl: string; // Lien vers le cours principal du chapitre
    resourceIds: string[]; // Liste des IDs des ressources complémentaires
}

export interface Revision {
    id: string;
    subjectId: string;
    subjectName?: string; // Pour affichage
    classes: string[]; // ex: ['Terminale']
    series: string[]; // ex: ['C', 'D']
    chapters: RevisionChapter[];
    createdAt: string;
}

export type RevisionFormData = {
    subjectId: string;
    classes: string[];
    series: string[];
    chapters: RevisionChapter[];
}

const revisionsCollection = collection(db, 'revisions');

/**
 * Récupère toutes les révisions avec le nom de la matière.
 */
export async function getRevisions(): Promise<Revision[]> {
    try {
        const [revisionsSnapshot, subjects] = await Promise.all([
            getDocs(query(revisionsCollection, orderBy("createdAt", "desc"))),
            getSubjects()
        ]);

        const subjectsMap = new Map(subjects.map(s => [s.id, s.name]));

        const revisions = revisionsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                subjectName: subjectsMap.get(data.subjectId) || 'Matière inconnue',
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
            } as Revision;
        });
        return revisions;
    } catch (error) {
        console.error("Erreur lors de la récupération des révisions:", error);
        return [];
    }
}

/**
 * Récupère une révision spécifique par son ID.
 */
export async function getRevisionById(id: string): Promise<Revision | null> {
    try {
        const docRef = doc(db, 'revisions', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            const subjects = await getSubjects();
            const subjectName = subjects.find(s => s.id === data.subjectId)?.name || 'Non défini';
            return {
                id: docSnap.id,
                ...data,
                subjectName,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
            } as Revision;
        }
        return null;
    } catch (e) {
        console.error("Erreur pour obtenir la révision par ID", e);
        return null;
    }
}


/**
 * Crée une nouvelle fiche de révision.
 */
export async function createRevision(data: RevisionFormData): Promise<string> {
    const revisionRef = await addDoc(revisionsCollection, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return revisionRef.id;
}

/**
 * Met à jour une fiche de révision existante.
 */
export async function updateRevision(id: string, data: RevisionFormData): Promise<void> {
    const revisionDoc = doc(db, "revisions", id);
    await updateDoc(revisionDoc, {
        ...data,
        updatedAt: serverTimestamp(),
    });
}

/**
 * Supprime une fiche de révision.
 */
export async function deleteRevision(id: string): Promise<void> {
    await deleteDoc(doc(db, "revisions", id));
}

/**
 * Récupère les données nécessaires pour le formulaire d'administration des révisions.
 */
export async function getRevisionFormConfiguration() {
    const [structure, subjects, resources] = await Promise.all([
        getSchoolStructure(),
        getSubjects(),
        getResources()
    ]);
    
    const allSeries = structure.flatMap(c => c.series).reduce((acc, current) => {
        if (!acc.find(item => item.value === current.value)) acc.push(current);
        return acc;
    }, [] as { value: string; label: string }[]);

    return {
        classes: structure.map(s => ({ value: s.name, label: s.name })),
        allSeries,
        subjects: subjects.map(s => ({ value: s.id, label: s.name })),
        resources: resources.map(r => ({ value: r.id, label: r.title, subject: r.subjectName }))
    };
}

export async function addPointsForChapterReview(userId: string) {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
        points: increment(5)
    });
}
