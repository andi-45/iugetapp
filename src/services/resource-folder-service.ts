// src/services/resource-folder-service.ts
'use client';

import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, serverTimestamp, query } from 'firebase/firestore';
import { getSchoolStructure } from './school-structure-service';
import { getResources } from './resource-service';

export interface ResourceFolder {
  id: string;
  title: string;
  class: string;
  series: string;
  resourceIds: string[];
  createdAt: string;
}

export type ResourceFolderFormData = Omit<ResourceFolder, 'id' | 'createdAt'>;

const foldersCollection = collection(db, 'resourceFolders');

export async function getResourceFolders(): Promise<ResourceFolder[]> {
    try {
        const q = query(foldersCollection);
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
            } as ResourceFolder;
        });
    } catch (error) {
        console.error("Error fetching resource folders:", error);
        return [];
    }
}

export async function getResourceFolderById(id: string): Promise<ResourceFolder | null> {
    const docRef = doc(db, 'resourceFolders', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const data = docSnap.data();
        return {
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
        } as ResourceFolder;
    }
    return null;
}


export async function createResourceFolder(data: ResourceFolderFormData): Promise<string> {
    const docRef = await addDoc(foldersCollection, {
        ...data,
        createdAt: serverTimestamp(),
    });
    return docRef.id;
}

export async function updateResourceFolder(id: string, data: ResourceFolderFormData): Promise<void> {
    const docRef = doc(db, 'resourceFolders', id);
    await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
    });
}

export async function deleteResourceFolder(id: string): Promise<void> {
    await deleteDoc(doc(db, 'resourceFolders', id));
}

export async function getFolderFormConfiguration() {
    const structure = await getSchoolStructure();
    const resources = await getResources();

    return {
        classes: structure.map(s => ({ value: s.name, label: s.name })),
        structure, // Pass the full structure for dependent series
        resources: resources.map(r => ({ value: r.id, label: r.title, subject: r.subjectName })),
    };
}
