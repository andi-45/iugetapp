// src/services/admin-notification-service.ts
'use client';

import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, writeBatch } from 'firebase/firestore';

export interface AdminNotificationData {
    title: string;
    message: string;
    link?: string;
    target: 'all' | 'specific';
    userIds?: string[];
}

export async function sendNotification(data: AdminNotificationData) {
    const { target, userIds, ...notificationData } = data;

    if (target === 'all') {
        // Broadcast notification
        await addDoc(collection(db, 'notifications'), {
            ...notificationData,
            target: 'all',
            createdAt: serverTimestamp(),
        });
    } else if (target === 'specific' && userIds && userIds.length > 0) {
        // Targeted notification
        await addDoc(collection(db, 'notifications'), {
            ...notificationData,
            target: 'specific',
            userIds: userIds,
            createdAt: serverTimestamp(),
        });
    } else {
        throw new Error("Invalid notification target or missing user IDs.");
    }
}
