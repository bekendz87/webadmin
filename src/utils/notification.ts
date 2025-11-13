import { NotificationCreateRequest } from '@/types/notification';
import { useNotification } from '@/contexts/NotificationContext';

// Helper function to get user info from localStorage
export const getUserInfoFromStorage = () => {
    try {
        if (typeof window !== 'undefined') {
            const userInfo = localStorage.getItem('userInfo');
            if (userInfo) {
                const parsed = JSON.parse(userInfo);
                return {
                    userId: parsed._id || parsed.id || 'demo-user-id',
                    username: parsed.username || parsed.name || 'demo-user'
                };
            }
        }
    } catch (error) {
        console.error('Error parsing userInfo from localStorage:', error);
    }
    return { userId: 'demo-user-id', username: 'demo-user' };
};

// Helper function to create notification
export const createNotification = async (notification: Omit<NotificationCreateRequest, 'userId' | 'username'>) => {
    try {
        const { userId, username } = getUserInfoFromStorage();
        
        const response = await fetch('/api/notification/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-User-ID': userId,
                'X-Username': username
            },
            body: JSON.stringify({
                ...notification,
                userId,
                username
            }),
        });

        const data = await response.json();

        if (data?.success) {
            console.log('✅ Notification created successfully');
            return { success: true, data };
        } else {
            console.error('❌ Failed to create notification:', data);
            return { success: false, message: data?.message || 'Failed to create notification' };
        }
    } catch (error) {
        console.error('Error creating notification:', error);
        return { success: false, message: 'Failed to create notification' };
    }
};

// Helper function to get notification count
export const getNotificationCount = async () => {
    try {
        const { userId } = getUserInfoFromStorage();
        
        const response = await fetch(`/api/notification/list?userId=${userId}&limit=1`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-User-ID': userId,
                'X-Username': getUserInfoFromStorage().username
            }
        });
        
        const data = await response.json();
        
        if (data.success && data.one_health_msg) {
            return data.one_health_msg.unreadCount || 0;
        }
        
        return 0;
    } catch (error) {
        console.error('Error getting notification count:', error);
        return 0;
    }
};
