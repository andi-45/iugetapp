// src/services/agent-service.ts
'use client';

import { db } from '@/lib/firebase';
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, serverTimestamp, query, orderBy, getDoc } from 'firebase/firestore';

export interface AIAgent {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  icon: string;
  color: string;
  createdAt: string;
}

export type AIAgentFormData = Omit<AIAgent, 'id' | 'createdAt'>;

const agentsCollection = collection(db, 'aiAgents');

export async function getAgents(): Promise<AIAgent[]> {
  try {
    const q = query(agentsCollection, orderBy("createdAt", "asc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate().toISOString() : new Date().toISOString(),
    } as AIAgent));
  } catch (error) {
    console.error("Erreur lors de la récupération des agents IA:", error);
    return [];
  }
}

export async function getAgentById(id: string): Promise<AIAgent | null> {
    const docRef = doc(db, 'aiAgents', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const data = docSnap.data();
        return {
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
        } as AIAgent;
    }
    return null;
}

export async function createAgent(data: AIAgentFormData): Promise<string> {
  const docRef = await addDoc(agentsCollection, {
    ...data,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateAgent(id: string, data: AIAgentFormData): Promise<void> {
  const docRef = doc(db, 'aiAgents', id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteAgent(id: string): Promise<void> {
  await deleteDoc(doc(db, 'aiAgents', id));
}
