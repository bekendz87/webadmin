import React, { createContext, useContext, useState, useCallback } from 'react';
import { NotificationItem } from '@/types/notification';
import { request } from '@/utils/request';

interface NotificationContextType {
    notifications: NotificationItem[];
    unreadCount: number;
    loading: boolean;
    fetchNotifications: () => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    removeNotification: (id: string) => Promise<void>;
    refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const getUserInfo = () => {
        try {
            const userInfo = localStorage.getItem('userInfo');
            if (userInfo) {
                const parsed = JSON.parse(userInfo);
                return {
                    userId: parsed._id || parsed.id || 'demo-user-id',
                    username: parsed.username || parsed.name || 'demo-user'
                };
            }
        } catch (error) {
            console.error('Error parsing userInfo from localStorage:', error);
        }
        return { userId: 'demo-user-id', username: 'demo-user' };
    };

    const getRequestHeaders = () => {
        const { userId, username } = getUserInfo();
        return {
            'Content-Type': 'application/json',
            'X-User-ID': userId,
            'X-Username': username
        };
    };

    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);
            const { userId } = getUserInfo();

            // Use the request utility properly
            const response:any = await request({
                method: 'GET',
                url: `/api/notification/list?userId=${userId}`,
                headers: getRequestHeaders()
            });

            if (response?.success && response.one_health_msg) {
                setNotifications(response.one_health_msg.list || []);
                setUnreadCount(response.one_health_msg.unreadCount || 0);
            } else if (response?.result === 'true' && response.one_health_msg) {
                setNotifications(response.one_health_msg.list || []);
                setUnreadCount(response.one_health_msg.unreadCount || 0);
            } else {
                // Fallback to empty state if no valid data
                setNotifications([]);
                setUnreadCount(0);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
            // Set empty state on error
            setNotifications([]);
            setUnreadCount(0);
        } finally {
            setLoading(false);
        }
    }, []);

    const markAsRead = useCallback(async (id: string) => {
        try {
            const response:any = await request({
                method: 'PUT',
                url: `/api/notification/update`,
                params: { id },
                headers: getRequestHeaders(),
                body: { read: true }
            });

            if (response?.success) {
                setNotifications(prev =>
                    prev.map(n => n._id === id ? { ...n, read: true } : n)
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        try {
            const response:any = await request({
                method: 'PUT',
                url: '/api/notification/mark-all-read',
                headers: getRequestHeaders()
            });

            if (response?.success) {
                setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                setUnreadCount(0);
            }
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    }, []);

    const removeNotification = useCallback(async (id: string) => {
        try {
            const response:any = await request({
                method: 'DELETE',
                url: `/api/notification/delete`,
                params: { id },
                headers: getRequestHeaders()
            });

            if (response?.success) {
                const wasUnread = notifications.find(n => n._id === id)?.read === false;
                setNotifications(prev => prev.filter(n => n._id !== id));
                if (wasUnread) {
                    setUnreadCount(prev => Math.max(0, prev - 1));
                }
            }
        } catch (error) {
            console.error('Error removing notification:', error);
        }
    }, [notifications]);

    const refreshNotifications = useCallback(async () => {
        await fetchNotifications();
    }, [fetchNotifications]);

    const value = {
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        removeNotification,
        refreshNotifications
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};
