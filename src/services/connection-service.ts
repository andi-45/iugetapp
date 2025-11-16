// src/services/connection-service.ts
'use client';

import { db } from '@/lib/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove, runTransaction, getDoc } from 'firebase/firestore';

export async function sendConnectionRequest(senderId: string, receiverId: string) {
    const senderRef = doc(db, 'users', senderId);
    const receiverRef = doc(db, 'users', receiverId);
    
    const receiverRequest = { from: senderId, read: false };
    
    await updateDoc(senderRef, {
        sentConnectionRequests: arrayUnion(receiverId)
    });
    await updateDoc(receiverRef, {
        receivedConnectionRequests: arrayUnion(receiverRequest)
    });
}

export async function acceptConnectionRequest(userId: string, requesterId: string) {
    const userRef = doc(db, 'users', userId);
    const requesterRef = doc(db, 'users', requesterId);

    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) throw "User not found";

    const userRequests = userDoc.data().receivedConnectionRequests || [];
    const newReceivedRequests = userRequests.filter((req: any) => req.from !== requesterId);

    await Promise.all([
        updateDoc(userRef, { 
            receivedConnectionRequests: newReceivedRequests,
            connections: arrayUnion(requesterId)
        }),
        updateDoc(requesterRef, { 
            sentConnectionRequests: arrayRemove(userId),
            connections: arrayUnion(userId)
        })
    ]);
}

export async function rejectConnectionRequest(userId: string, requesterId: string) {
    const userRef = doc(db, 'users', userId);
    const requesterRef = doc(db, 'users', requesterId);

    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) throw "User not found";

    const userRequests = userDoc.data().receivedConnectionRequests || [];
    const newReceivedRequests = userRequests.filter((req: any) => req.from !== requesterId);

    await Promise.all([
        updateDoc(userRef, { receivedConnectionRequests: newReceivedRequests }),
        updateDoc(requesterRef, { sentConnectionRequests: arrayRemove(userId) })
    ]);
}

export async function removeConnection(userId: string, connectionId: string) {
    const userRef = doc(db, 'users', userId);
    const connectionRef = doc(db, 'users', connectionId);

    await Promise.all([
        updateDoc(userRef, { connections: arrayRemove(connectionId) }),
        updateDoc(connectionRef, { connections: arrayRemove(userId) })
    ]);
}
