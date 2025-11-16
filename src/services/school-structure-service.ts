// src/services/school-structure-service.ts
'use client';

import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, query, orderBy, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';

export interface Series {
  value: string; // Ex: 'c'
  label: string; // Ex: 'Série C'
}

export interface SchoolClass {
  id: string; // Ex: 'terminale'
  name: string; // Ex: 'Terminale'
  order: number;
  series: Series[];
}

export type SchoolClassFormData = Omit<SchoolClass, 'id' | 'series'>;

const structureCollection = collection(db, 'schoolStructure');

// --- FONCTIONS CRUD pour les classes ---

export async function getSchoolStructure(): Promise<SchoolClass[]> {
    try {
        const q = query(structureCollection, orderBy("order", "asc"));
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
             console.log("No school structure found. Initializing with default data.");
             await initializeDefaultStructure();
             const newSnapshot = await getDocs(q);
             return newSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as SchoolClass[];
        }
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as SchoolClass[];
    } catch (error) {
        console.error("Erreur lors de la récupération de la structure scolaire:", error);
        return [];
    }
}

async function initializeDefaultStructure() {
    const defaultClasses: Omit<SchoolClass, 'id'>[] = [
        { name: 'Seconde', order: 1, series: [{ value: 'general', label: 'Enseignement Général' }] },
        { name: 'Première', order: 2, series: [{ value: 'a', label: 'Série A' }, { value: 'c', label: 'Série C' }, { value: 'd', label: 'Série D' }] },
        { name: 'Terminale', order: 3, series: [{ value: 'a', label: 'Série A' }, { value: 'c', label: 'Série C' }, { value: 'd', label: 'Série D' }] },
    ];

    const promises = defaultClasses.map(classData => {
        const classId = classData.name.toLowerCase().replace(/\s+/g, '-');
        return setDoc(doc(db, "schoolStructure", classId), classData);
    });

    await Promise.all(promises);
    console.log("Default school structure initialized.");
}


export async function createClass(data: SchoolClassFormData) {
  const classId = data.name.toLowerCase().replace(/\s+/g, '-');
  const classDocRef = doc(db, "schoolStructure", classId);
  await setDoc(classDocRef, { ...data, series: [] });
}

export async function updateClass(id: string, data: SchoolClassFormData) {
  const classDocRef = doc(db, "schoolStructure", id);
  await updateDoc(classDocRef, data);
}

export async function deleteClass(id: string) {
  await deleteDoc(doc(db, "schoolStructure", id));
}

// --- FONCTIONS pour les séries ---

export async function addSeriesToClass(classId: string, seriesData: Series) {
    const classDocRef = doc(db, "schoolStructure", classId);
    
    const classSnap = await getDoc(classDocRef);
    if (classSnap.exists()) {
        const existingData = classSnap.data();
        const existingSeries = existingData.series || [];

        const seriesExists = existingSeries.some((s: Series) => s.value === seriesData.value);

        if (!seriesExists) {
            await updateDoc(classDocRef, {
                series: arrayUnion(seriesData)
            });
        }
    }
}


export async function removeSeriesFromClass(classId: string, seriesData: Series) {
  const classDocRef = doc(db, "schoolStructure", classId);
  await updateDoc(classDocRef, {
    series: arrayRemove(seriesData)
  });
}
