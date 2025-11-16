// src/services/resource-service.ts
'use client';

import { db } from '@/lib/firebase';
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, serverTimestamp, query, orderBy, arrayUnion, arrayRemove, runTransaction, increment, getDoc, limit, startAfter, type QueryDocumentSnapshot } from 'firebase/firestore';
import { getSchoolStructure } from './school-structure-service';
import { getSubjects } from './subject-service';
import { getUserProfile } from './user-service';

export interface Resource {
  id: string;
  title: string;
  type: 'PDF' | 'WORD' | 'IMAGE' | 'VIDEO';
  url: string;
  subjectId: string;
  classes: string[];
  series: string[];
  // Optional fields for display
  subjectName?: string;
  createdAt: string; 
  likes?: string[];
  likeCount?: number;
  commentCount?: number;
}

export interface Comment {
    id: string;
    userId: string;
    userName: string;
    userPhotoURL?: string;
    text: string;
    createdAt: string; // ISO String
}


export type ResourceFormData = Omit<Resource, 'id' | 'subjectName' | 'createdAt' | 'likes' | 'likeCount' | 'commentCount' >;

const resourcesCollection = collection(db, 'resources');

export async function getResources(): Promise<Resource[]> {
  try {
    const q = query(resourcesCollection, orderBy("createdAt", "desc"));
    const resourcesSnapshot = await getDocs(q);
    const subjects = await getSubjects();
    const subjectsMap = new Map(subjects.map(doc => [doc.id, doc.name]));

    const resources = resourcesSnapshot.docs.map(doc => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString();
        return {
            id: doc.id,
            title: data.title,
            type: data.type,
            url: data.url,
            subjectId: data.subjectId,
            subjectName: subjectsMap.get(data.subjectId) || 'Non défini',
            classes: data.classes || [],
            series: data.series || [],
            createdAt,
            likes: data.likes || [],
            likeCount: data.likeCount || 0,
            commentCount: data.commentCount || 0,
        } as Resource;
    });
    return resources;
  } catch (error) {
    console.error("Erreur lors de la récupération des ressources:", error);
    return [];
  }
}

export async function getResourceById(id: string): Promise<Resource | null> {
    try {
        const docRef = doc(db, 'resources', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
             const data = docSnap.data();
             const createdAt = data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString();
             const subjects = await getSubjects();
             const subjectName = subjects.find(s => s.id === data.subjectId)?.name || 'Non défini';
             
            return { 
                id: docSnap.id, 
                ...data, 
                subjectName,
                createdAt 
            } as Resource;
        }
        return null;
    } catch(e) {
        console.error("Erreur lors de la récupération de la ressource", e);
        return null;
    }
}


export async function toggleLikeResource(userId: string, resourceId: string): Promise<{ liked: boolean, likeCount: number }> {
    const resourceRef = doc(db, 'resources', resourceId);
    
    let newLikeCount: number;
    let liked: boolean;

    await runTransaction(db, async (transaction) => {
        const resourceDoc = await transaction.get(resourceRef);
        if (!resourceDoc.exists()) {
            throw "Document does not exist!";
        }

        const data = resourceDoc.data();
        const likes: string[] = data.likes || [];
        
        if (likes.includes(userId)) {
            // User is unliking
            transaction.update(resourceRef, { 
                likes: arrayRemove(userId),
                likeCount: increment(-1)
            });
            liked = false;
        } else {
            // User is liking
            transaction.update(resourceRef, { 
                likes: arrayUnion(userId),
                likeCount: increment(1)
            });
            liked = true;
        }
    });

    // Read the final like count after the transaction
    const finalDoc = await getDoc(resourceRef);
    newLikeCount = finalDoc.data()?.likeCount || 0;
    
    return { liked: liked!, likeCount: newLikeCount };
}


export async function getComments(resourceId: string): Promise<Comment[]> {
    const commentsCol = collection(db, 'resources', resourceId, 'comments');
    const q = query(commentsCol, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate().toISOString(),
    } as Comment));
}

export async function addComment(userId: string, resourceId: string, text: string): Promise<Comment> {
    const userProfile = await getUserProfile(userId);
    if (!userProfile) throw new Error("User not found");

    const commentsCollection = collection(db, 'resources', resourceId, 'comments');
    const resourceRef = doc(db, 'resources', resourceId);

    const newCommentData = {
        userId,
        userName: userProfile.displayName,
        userPhotoURL: (userProfile as any).photoURL || '',
        text,
        createdAt: serverTimestamp(),
    };

    // Add the comment and update the counter in parallel
    const [newCommentRef, _] = await Promise.all([
        addDoc(commentsCollection, newCommentData),
        updateDoc(resourceRef, { commentCount: increment(1) })
    ]);

    return {
        id: newCommentRef.id,
        userId: newCommentData.userId,
        userName: newCommentData.userName,
        userPhotoURL: newCommentData.userPhotoURL,
        text: newCommentData.text,
        createdAt: new Date().toISOString(), // Return optimistic date
    };
}



export async function createResource(data: ResourceFormData): Promise<void> {
    await addDoc(resourcesCollection, {
        ...data,
        createdAt: serverTimestamp(),
        likes: [],
        likeCount: 0,
        commentCount: 0,
    });
}

export async function updateResource(id: string, data: ResourceFormData): Promise<void> {
    const resourceDoc = doc(db, "resources", id);
    await updateDoc(resourceDoc, {
        ...data,
        updatedAt: serverTimestamp(),
    });
}

export async function deleteResource(id: string): Promise<void> {
    await deleteDoc(doc(db, "resources", id));
}

export async function getResourceConfiguration() {
    const structure = await getSchoolStructure();
    const subjects = await getSubjects();

    const allSeries = structure
        .flatMap(c => c.series)
        .reduce((acc, current) => {
            if (!acc.find(item => item.value === current.value)) {
                acc.push(current);
            }
            return acc;
        }, [] as {value: string, label: string}[]);

    return {
        classes: structure.map(s => ({ value: s.name, label: s.name })),
        allSeries: allSeries,
        subjects: subjects.map(s => ({ value: s.id, label: s.name }))
    };
}
