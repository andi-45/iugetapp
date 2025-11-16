// src/services/user-service.ts
'use client';

import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp, updateDoc, arrayUnion, arrayRemove, collection, getDocs, query, where, orderBy, limit, startAfter, type QueryDocumentSnapshot } from 'firebase/firestore';
import { getPremiumStatus, getPremiumsMap } from './premium-service';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  school: string;
  whatsapp: string;
  gender: string;
  schoolClass: string;
  series: string;
  createdAt: string; 
  points?: number;
  savedCourses?: string[];
  savedResources?: string[];
  connections?: string[];
  sentConnectionRequests?: string[];
  receivedConnectionRequests?: { from: string, read: boolean }[];
  readAdminNotifications?: string[];
  isPremium?: boolean;
  premiumExpiresAt?: string | null;
}

export type UserProfileUpdateData = Omit<UserProfile, 'uid' | 'createdAt' | 'email' | 'gender' | 'savedCourses' | 'savedResources' | 'connections' | 'sentConnectionRequests' | 'receivedConnectionRequests' | 'isPremium' | 'premiumExpiresAt' | 'readAdminNotifications' | 'points'>;

export async function createUserProfile(uid: string, data: Omit<UserProfile, 'uid' | 'createdAt' | 'isPremium' | 'premiumExpiresAt' | 'points'>) {
    try {
        const userRef = doc(db, 'users', uid);
        await setDoc(userRef, {
            ...data,
            points: 0,
            savedCourses: [],
            savedResources: [],
            connections: [],
            sentConnectionRequests: [],
            receivedConnectionRequests: [],
            readAdminNotifications: [],
            createdAt: serverTimestamp()
        });
        return { success: true };
    } catch(error) {
        console.error("Error creating user profile: ", error);
        return { success: false, error: "Failed to create user profile." };
    }
}

export async function updateUserProfile(uid: string, data: UserProfileUpdateData) {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
        ...data,
        updatedAt: serverTimestamp(),
    });
}


export async function getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
        const userRef = doc(db, 'users', uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            const premiumStatus = await getPremiumStatus(uid); // Appel individuel, c'est ok ici.
            
            const profileData = JSON.parse(JSON.stringify(data, (key, value) => {
                if (value && value.seconds !== undefined) {
                    return new Date(value.seconds * 1000).toISOString();
                }
                return value;
            }));

            return {
                uid,
                ...profileData,
                createdAt: profileData.createdAt || new Date().toISOString(),
                isPremium: premiumStatus.isPremium,
                premiumExpiresAt: premiumStatus.expiresAt,
            } as UserProfile;
        }
        return null;
    } catch (error) {
        console.error("Error fetching user profile: ", error);
        return null;
    }
}

export async function getUsers(): Promise<UserProfile[]> {
    try {
        const usersCollection = collection(db, 'users');
        const usersSnapshot = await getDocs(usersCollection);
        
        const premiumsMap = await getPremiumsMap();

        const userProfiles = usersSnapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            const premiumInfo = premiumsMap.get(docSnap.id);
            const isPremium = !!premiumInfo && premiumInfo.endDate >= new Date();
            const premiumExpiresAt = premiumInfo ? premiumInfo.endDate.toISOString() : null;
            
            const profileData = JSON.parse(JSON.stringify(data, (key, value) => {
                if (value && value.seconds !== undefined) {
                    return new Date(value.seconds * 1000).toISOString();
                }
                return value;
            }));

            return {
                uid: docSnap.id,
                ...profileData,
                createdAt: profileData.createdAt || new Date().toISOString(),
                isPremium: isPremium,
                premiumExpiresAt: premiumExpiresAt,
            } as UserProfile;
        });

        return userProfiles;
    } catch (error) {
        console.error("Error fetching users: ", error);
        return [];
    }
}

export async function getPaginatedUsers({
    currentUser,
    limit: queryLimit,
    startAfter: startAfterDoc,
    searchTerm,
}: {
    currentUser: UserProfile,
    limit: number,
    startAfter: QueryDocumentSnapshot | null,
    searchTerm?: string
}): Promise<{ users: UserProfile[], lastDoc: QueryDocumentSnapshot | null }> {
    try {
        const usersRef = collection(db, 'users');
        let constraints: any[] = [
            where('uid', '!=', currentUser.uid),
            where('schoolClass', '==', currentUser.schoolClass),
            orderBy('uid'), 
            limit(queryLimit)
        ];

        if (startAfterDoc) {
            constraints.push(startAfter(startAfterDoc));
        }

        const q = query(usersRef, ...constraints);
        const snapshot = await getDocs(q);

        let users = snapshot.docs.map(doc => ({
            uid: doc.id,
            ...doc.data()
        } as UserProfile));

        if (searchTerm && searchTerm.trim() !== '') {
            users = users.filter(u => u.displayName.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        const lastDoc = snapshot.docs[snapshot.docs.length - 1] || null;

        return { users, lastDoc };

    } catch (error) {
        console.error("Error paginating users:", error);
        return { users: [], lastDoc: null };
    }
}


export async function toggleSavedCourse(userId: string, courseId: string): Promise<{ saved: boolean }> {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
        throw new Error("User not found");
    }

    const userData = userDoc.data();
    const savedCourses: string[] = userData.savedCourses || [];

    if (savedCourses.includes(courseId)) {
        await updateDoc(userRef, { savedCourses: arrayRemove(courseId) });
        return { saved: false };
    } else {
        await updateDoc(userRef, { savedCourses: arrayUnion(courseId) });
        return { saved: true };
    }
}

export async function toggleSavedResource(userId: string, resourceId: string): Promise<{ saved: boolean }> {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
        throw new Error("User not found");
    }

    const userData = userDoc.data();
    const savedResources: string[] = userData.savedResources || [];

    if (savedResources.includes(resourceId)) {
        await updateDoc(userRef, { savedResources: arrayRemove(resourceId) });
        return { saved: false };
    } else {
        await updateDoc(userRef, { savedResources: arrayUnion(resourceId) });
        return { saved: true };
    }
}
