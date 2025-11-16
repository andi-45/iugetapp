// src/services/notification-service.ts
'use client';

import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, orderBy, Timestamp, or } from 'firebase/firestore';
import { getUserProfile, getUsers, type UserProfile } from './user-service';

export interface Notification {
    id: string;
    type: 'connection_request' | 'admin_message';
    fromUser?: { // Not present for admin messages
        uid: string;
        displayName: string;
        photoURL?: string;
    };
    icon: 'bell' | 'user-plus',
    title?: string, // For admin messages
    message: string;
    read: boolean;
    createdAt: string; // ISO string
    link: string;
}

// --- Connection Request Notifications ---
async function getConnectionRequestNotifications(userId: string): Promise<Notification[]> {
    const userProfile = await getUserProfile(userId);
    if (!userProfile?.receivedConnectionRequests?.length) return [];

    const notifications: Notification[] = [];
    const allUsers = await getUsers();
    const usersMap = new Map(allUsers.map(u => [u.uid, u]));

    userProfile.receivedConnectionRequests.forEach(req => {
        const sender = usersMap.get(req.from);
        if (sender) {
             notifications.push({
                id: `conn-${req.from}`,
                type: 'connection_request',
                fromUser: {
                    uid: sender.uid,
                    displayName: sender.displayName,
                    photoURL: (sender as any).photoURL || '',
                },
                icon: 'user-plus',
                message: `${sender.displayName} vous a envoyé une demande de connexion.`,
                read: req.read || false,
                createdAt: new Date().toISOString(), // Placeholder
                link: '/community/requests'
            });
        }
    });

    return notifications;
}

// --- Admin-sent Notifications ---
async function getAdminNotifications(userId: string): Promise<Notification[]> {
    const notificationsCol = collection(db, 'notifications');
    const userProfile = await getUserProfile(userId);

    if (!userProfile) return [];

    // Query 1: Get all broadcast notifications
    const broadcastQuery = query(
        notificationsCol,
        where('target', '==', 'all')
    );
    const broadcastSnapshot = await getDocs(broadcastQuery);
    const broadcastNotifications = broadcastSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Query 2: Get all targeted notifications for this user
    const targetedQuery = query(
        notificationsCol,
        where('userIds', 'array-contains', userId)
    );
    const targetedSnapshot = await getDocs(targetedQuery);
    const targetedNotifications = targetedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Combine and remove duplicates (in case a user is in a targeted list of a broadcast)
    const allAdminDocs = [...broadcastNotifications, ...targetedNotifications];
    const uniqueDocs = Array.from(new Map(allAdminDocs.map(doc => [doc.id, doc])).values());


    const readNotifications: string[] = userProfile.readAdminNotifications || [];
    
    const notifications = uniqueDocs.map(docData => {
        return {
            id: docData.id,
            type: 'admin_message',
            icon: 'bell',
            title: docData.title,
            message: docData.message,
            read: readNotifications.includes(docData.id),
            createdAt: (docData.createdAt as Timestamp).toDate().toISOString(),
            link: docData.link || '/#',
        } as Notification;
    });

    // Sort in code
    notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return notifications;
}

export async function getNotifications(userId: string): Promise<Notification[]> {
    const [connectionNotifications, adminNotifications] = await Promise.all([
        getConnectionRequestNotifications(userId),
        getAdminNotifications(userId),
    ]);

    const allNotifications = [...connectionNotifications, ...adminNotifications];
    
    // Sort by creation date (newest first), but prioritize unread notifications
    allNotifications.sort((a, b) => {
        if (a.read !== b.read) {
            return a.read ? 1 : -1;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return allNotifications;
}

export async function markNotificationsAsRead(userId: string): Promise<void> {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        const userData = userSnap.data();
        
        // Mark connection requests as read
        const updatedRequests = (userData.receivedConnectionRequests || []).map((req: any) => ({
            ...req,
            read: true,
        }));

        // Get all unread admin notification IDs
        const adminNotifications = await getAdminNotifications(userId);
        const unreadAdminNotificationIds = adminNotifications
            .filter(n => !n.read)
            .map(n => n.id);
        
        const newReadAdminNotifications = [
            ...(userData.readAdminNotifications || []),
            ...unreadAdminNotificationIds
        ];

        await updateDoc(userRef, { 
            receivedConnectionRequests: updatedRequests,
            readAdminNotifications: newReadAdminNotifications,
        });
    }
}
