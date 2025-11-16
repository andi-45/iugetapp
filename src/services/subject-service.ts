// src/services/subject-service.ts
'use client';

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, type DocumentData } from 'firebase/firestore';

export interface Subject {
  id: string;
  name: string;
  courseCount: number;
}

export type SubjectFormData = {
  name: string;
}

const subjectsCollection = collection(db, 'subjects');

// --- FONCTIONS CRUD ---

export async function getSubjects(): Promise<Subject[]> {
  try {
    const snapshot = await getDocs(subjectsCollection);
    if (snapshot.empty) {
      console.log("Aucune matière trouvée, initialisation avec des données par défaut...");
      await initializeDefaultSubjects();
      const newSnapshot = await getDocs(subjectsCollection);
      return mapSnapshotToSubjects(newSnapshot.docs);
    }
    return mapSnapshotToSubjects(snapshot.docs);
  } catch (error) {
    console.error("Erreur lors de la récupération des matières:", error);
    // En cas d'erreur (ex: règles de sécurité), on retourne un tableau vide.
    return [];
  }
}

export async function createSubject(data: SubjectFormData) {
  try {
    await addDoc(subjectsCollection, {
      name: data.name,
      courseCount: 0 // Initialisé à 0
    });
    return { success: true, message: "Matière créée avec succès." };
  } catch (error) {
    console.error("Erreur lors de la création de la matière:", error);
    return { success: false, message: "Échec de la création de la matière." };
  }
}

export async function updateSubject(id: string, data: SubjectFormData) {
  try {
    const subjectDoc = doc(db, "subjects", id);
    await updateDoc(subjectDoc, { name: data.name });
    return { success: true, message: "Matière mise à jour avec succès." };
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la matière:", error);
    return { success: false, message: "Échec de la mise à jour de la matière." };
  }
}

export async function deleteSubject(id: string) {
  try {
    await deleteDoc(doc(db, "subjects", id));
    return { success: true, message: "Matière supprimée avec succès." };
  } catch (error) {
    console.error("Erreur lors de la suppression de la matière:", error);
    return { success: false, message: "Échec de la suppression de la matière." };
  }
}


// --- HELPERS ---

function mapSnapshotToSubjects(docs: DocumentData[]): Subject[] {
  const subjectsMap = new Map<string, Subject>();
  docs.forEach(doc => {
      const data = doc.data();
      const subject: Subject = {
          id: doc.id,
          name: data.name || 'Nom manquant',
          courseCount: data.courseCount || 0,
      };
      if (!subjectsMap.has(subject.name)) {
          subjectsMap.set(subject.name, subject);
      }
  });
  return Array.from(subjectsMap.values());
}

async function initializeDefaultSubjects() {
  const defaultSubjects = [
    { name: 'Mathématiques', courseCount: 5 },
    { name: 'Physique', courseCount: 3 },
    { name: 'Chimie', courseCount: 2 },
    { name: 'SVT', courseCount: 4 },
    { name: 'Histoire', courseCount: 2 },
    { name: 'Géographie', courseCount: 2 },
    { name: 'Littérature', courseCount: 1 },
    { name: 'Philosophie', courseCount: 1 },
  ];
  const promises = defaultSubjects.map(subject => addDoc(subjectsCollection, subject));
  await Promise.all(promises);
}
