// src/components/notification-panel.tsx
'use client'

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Bell, Loader2, UserPlus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getNotifications, markNotificationsAsRead, type Notification } from '@/services/notification-service';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

function getNotificationIcon(iconName: Notification['icon']) {
    switch (iconName) {
        case 'bell':
            return Bell;
        case 'user-plus':
            return UserPlus;
        default:
            return Bell;
    }
}


export function NotificationPanel() {
    const { user, refreshUserProfile } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);

    const unreadCount = notifications.filter(n => !n.read).length;

    const fetchNotifications = async () => {
        if (!user) return;
        setIsLoading(true);
        const fetchedNotifications = await getNotifications(user.uid);
        setNotifications(fetchedNotifications);
        setIsLoading(false);
    };
    
    useEffect(() => {
        if (user) {
            fetchNotifications();
        }
    }, [user]);

    const handleOpenChange = async (open: boolean) => {
        setIsOpen(open);
        if (open) {
            // Refetch notifications every time panel is opened
            fetchNotifications();
        }
        if (!open && unreadCount > 0) {
            // When panel closes, mark as read
            await markNotificationsAsRead(user!.uid);
            // Optimistically update the UI
            setNotifications(prev => prev.map(n => ({...n, read: true})));
            // Refresh user profile to get the latest state of connection requests
            await refreshUserProfile();
        }
    };
    
    return (
        <Popover open={isOpen} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="relative shrink-0">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-xs items-center justify-center">{unreadCount}</span>
                        </span>
                    )}
                    <span className="sr-only">Notifications</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0">
                <div className="p-4 font-semibold border-b">Notifications</div>
                <div className="max-h-80 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex justify-center items-center p-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : notifications.length > 0 ? (
                        <ul className="divide-y">
                            {notifications.map(notif => {
                                const Icon = getNotificationIcon(notif.icon);
                                return (
                                <li key={notif.id} className={cn("hover:bg-accent", !notif.read && "bg-secondary/50")}>
                                     <Link href={notif.link} className="flex items-start gap-3 p-4" onClick={() => setIsOpen(false)}>
                                        <div className={cn("h-8 w-8 mt-1 flex items-center justify-center rounded-full", notif.fromUser ? "" : "bg-primary text-primary-foreground")}>
                                            {notif.fromUser ? (
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={notif.fromUser.photoURL} alt={notif.fromUser.displayName} />
                                                    <AvatarFallback>{notif.fromUser.displayName.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                            ) : (
                                                <Icon className="h-5 w-5" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            {notif.title && <p className="font-semibold text-sm">{notif.title}</p>}
                                            <p className="text-sm">{notif.message}</p>
                                        </div>
                                         {!notif.read && (
                                            <div className="h-2.5 w-2.5 rounded-full bg-primary mt-1 shrink-0"></div>
                                        )}
                                    </Link>
                                </li>
                            )})}
                        </ul>
                    ) : (
                        <div className="text-center p-8 text-sm text-muted-foreground">
                            <p>Vous n'avez aucune notification.</p>
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
