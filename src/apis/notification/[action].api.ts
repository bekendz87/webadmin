import { NextApiRequest, NextApiResponse } from 'next';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
    NotificationAction,
    NotificationItem,
    NotificationListResponse,
    NotificationCreateRequest,
    NotificationUpdateRequest
} from '@/types/notification';

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'notifications.json');

// Helper function to ensure data directory exists
async function ensureDataDirectory() {
    console.log('🔧 Ensuring data directory exists at:', DATA_FILE_PATH);
    const dataDir = path.dirname(DATA_FILE_PATH);
    try {
        await fs.access(dataDir);
    } catch {
        await fs.mkdir(dataDir, { recursive: true });
    }
}

// Helper function to read notifications from JSON file
async function readNotifications(): Promise<NotificationItem[]> {
    try {
        await ensureDataDirectory();
        const data = await fs.readFile(DATA_FILE_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // If file doesn't exist, return empty array
        return [];
    }
}

// Helper function to write notifications to JSON file
async function writeNotifications(notifications: NotificationItem[]): Promise<void> {
    await ensureDataDirectory();
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(notifications, null, 2));
}

// Helper function to get token from request headers AND query parameters (similar to invoice API)
function getAuthToken(req: NextApiRequest): string {
    try {
        if (!req) return '';

        // First check query parameters
        let queryToken = req.query?.oh_token as string;
        if (queryToken) {
            queryToken = queryToken.replace(/^["']|["']$/g, '');
            queryToken = queryToken.replace(/\\"/g, '"');
            return queryToken;
        }

        // Then check headers
        if (req.headers) {
            let ohToken = req.headers['oh_token'] as string;
            const authHeader = req.headers['authorization'] as string;
            const cookies = req.headers.cookie as string;

            if (ohToken) {
                ohToken = ohToken.replace(/^["']|["']$/g, '');
                ohToken = ohToken.replace(/\\"/g, '"');
                return ohToken;
            }

            if (authHeader && authHeader.startsWith('Bearer ')) {
                let token = authHeader.substring(7);
                token = token.replace(/^["']|["']$/g, '');
                token = token.replace(/\\"/g, '"');
                return token;
            }

            if (cookies) {
                const cookieArray = cookies.split(';').map(cookie => cookie.trim());
                for (const cookie of cookieArray) {
                    const [name, value] = cookie.split('=');
                    if (name === 'webadmin_auth_token' || name === 'token') {
                        const decodedValue = decodeURIComponent(value);
                        try {
                            const tokenData = JSON.parse(decodedValue);
                            let token = tokenData.token || decodedValue;
                            token = token.replace(/^["']|["']$/g, '');
                            token = token.replace(/\\"/g, '"');
                            return token;
                        } catch {
                            let token = decodedValue;
                            token = token.replace(/^["']|["']$/g, '');
                            token = token.replace(/\\"/g, '"');
                            return token;
                        }
                    }
                }
            }
        }

        return '';
    } catch (error) {
        console.error('💥 Error extracting auth token:', error);
        return '';
    }
}

// Helper function to get user info from token/headers/request
function getUserInfo(req: NextApiRequest): { userId: string; username: string } {
    try {
        // First, try to get from request headers (sent from frontend)
        const userIdFromHeader = req.headers['x-user-id'] as string;
        const usernameFromHeader = req.headers['x-username'] as string;

        if (userIdFromHeader) {
            return {
                userId: userIdFromHeader,
                username: usernameFromHeader || 'unknown-user'
            };
        }

        // Fallback: try to get from query parameters
        const userIdFromQuery = req.query?.userId as string;
        const usernameFromQuery = req.query?.username as string;

        if (userIdFromQuery) {
            return {
                userId: userIdFromQuery,
                username: usernameFromQuery || 'unknown-user'
            };
        }

        // Final fallback: try to decode from auth token
        const authToken = getAuthToken(req);
        if (authToken) {
            try {
                // Simple token decoding - in real app, you'd properly decode JWT
                const tokenParts = authToken.split('.');
                if (tokenParts.length === 3) {
                    const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
                    return {
                        userId: payload.userId || payload.id || payload.sub || 'demo-user-id',
                        username: payload.username || payload.name || 'demo-user'
                    };
                }
            } catch (error) {
                console.error('Error decoding token:', error);
            }
        }

        // Default fallback
        return { userId: 'demo-user-id', username: 'demo-user' };
    } catch (error) {
        console.error('Error getting user info:', error);
        return { userId: 'demo-user-id', username: 'demo-user' };
    }
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
): Promise<void> {
    console.log('🔔 NOTIFICATION API HANDLER CALLED!');
    console.log('📊 Request details:', {
        method: req.method,
        url: req.url,
        query: req.query
    });

    const { action, id } = req.query;
    const notificationAction = action as NotificationAction;
    const { userId, username } = getUserInfo(req);

    // Validate action
    const validActions: NotificationAction[] = ['list', 'create', 'update', 'delete', 'mark-all-read'];

    if (!validActions.includes(notificationAction)) {
        return res.status(400).json({
            success: false,
            message: `Invalid action: ${notificationAction}`
        });
    }

    try {
        const notifications = await readNotifications();

        switch (notificationAction) {
            case 'list': {
                const { limit = 10, page = 1, type, read } = req.query;

                // Filter notifications for current user
                let userNotifications = notifications.filter(n => n.userId === userId);

                // Apply filters
                if (type) {
                    userNotifications = userNotifications.filter(n => n.type === type);
                }
                if (read !== undefined) {
                    userNotifications = userNotifications.filter(n => n.read === (read === 'true'));
                }

                // Sort by created_time desc
                userNotifications.sort((a, b) => new Date(b.created_time).getTime() - new Date(a.created_time).getTime());

                // Pagination
                const startIndex = (Number(page) - 1) * Number(limit);
                const endIndex = startIndex + Number(limit);
                const paginatedNotifications = userNotifications.slice(startIndex, endIndex);

                const unreadCount = userNotifications.filter(n => !n.read).length;

                const response: NotificationListResponse = {
                    result: 'true',
                    one_health_msg: {
                        list: paginatedNotifications,
                        count: userNotifications.length,
                        unreadCount
                    }
                };

                return res.status(200).json(response);
            }

            case 'create': {
                if (req.method !== 'POST') {
                    return res.status(405).json({ success: false, message: 'Method not allowed' });
                }

                const { title, message, type }: NotificationCreateRequest = req.body;

                if (!title || !message || !type) {
                    return res.status(400).json({
                        success: false,
                        message: 'Title, message, and type are required'
                    });
                }

                const newNotification: NotificationItem = {
                    _id: uuidv4(),
                    userId,
                    username,
                    title,
                    message,
                    type,
                    timestamp: new Date().toISOString(),
                    read: false,
                    created_time: new Date().toISOString(),
                    modified_time: new Date().toISOString()
                };

                notifications.push(newNotification);
                await writeNotifications(notifications);

                return res.status(201).json({
                    success: true,
                    data: newNotification,
                    message: 'Notification created successfully'
                });
            }

            case 'update': {
                if (req.method !== 'PUT') {
                    return res.status(405).json({ success: false, message: 'Method not allowed' });
                }

                if (!id) {
                    return res.status(400).json({
                        success: false,
                        message: 'Notification ID is required'
                    });
                }

                const { read }: NotificationUpdateRequest = req.body;

                const notificationIndex = notifications.findIndex(n => n._id === id && n.userId === userId);

                if (notificationIndex === -1) {
                    return res.status(404).json({
                        success: false,
                        message: 'Notification not found'
                    });
                }

                if (read !== undefined) {
                    notifications[notificationIndex].read = read;
                    notifications[notificationIndex].modified_time = new Date().toISOString();
                }

                await writeNotifications(notifications);

                return res.status(200).json({
                    success: true,
                    data: notifications[notificationIndex],
                    message: 'Notification updated successfully'
                });
            }

            case 'delete': {
                if (req.method !== 'DELETE') {
                    return res.status(405).json({ success: false, message: 'Method not allowed' });
                }

                if (!id) {
                    return res.status(400).json({
                        success: false,
                        message: 'Notification ID is required'
                    });
                }

                const notificationIndex = notifications.findIndex(n => n._id === id && n.userId === userId);

                if (notificationIndex === -1) {
                    return res.status(404).json({
                        success: false,
                        message: 'Notification not found'
                    });
                }

                notifications.splice(notificationIndex, 1);
                await writeNotifications(notifications);

                return res.status(200).json({
                    success: true,
                    message: 'Notification deleted successfully'
                });
            }

            case 'mark-all-read': {
                if (req.method !== 'PUT') {
                    return res.status(405).json({ success: false, message: 'Method not allowed' });
                }

                const updatedNotifications = notifications.map(n =>
                    n.userId === userId ? { ...n, read: true, modified_time: new Date().toISOString() } : n
                );

                await writeNotifications(updatedNotifications);

                return res.status(200).json({
                    success: true,
                    message: 'All notifications marked as read'
                });
            }

            default:
                return res.status(400).json({
                    success: false,
                    message: `Unsupported action: ${notificationAction}`
                });
        }

    } catch (error: any) {
        console.error(`💥 [NOTIFICATION ERROR] ${notificationAction}:`, error);

        return res.status(500).json({
            success: false,
            message: error.message || `Notification ${notificationAction} failed`
        });
    }
}
