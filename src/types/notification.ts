// Base interfaces
export interface NotificationUser {
    _id: string;
    username: string;
    first_name?: string;
    last_name?: string;
}

export interface NotificationItem {
    _id: string;
    userId: string;
    username: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'error';
    timestamp: string;
    read: boolean;
    created_time: string;
    modified_time: string;
}

// Request interfaces
export interface NotificationListRequest {
    limit?: number;
    page?: number;
    userId?: string;
    username?: string;
    type?: 'info' | 'warning' | 'success' | 'error';
    read?: boolean;
    from?: string;
    to?: string;
}

export interface NotificationCreateRequest {
    userId: string;
    username: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'error';
}

export interface NotificationUpdateRequest {
    read?: boolean;
}

// Response interfaces
export interface NotificationListResponse {
    result: string;
    one_health_msg?: {
        list: NotificationItem[];
        count: number;
        unreadCount: number;
    };
    message?: string;
    error?: {
        message: string;
    };
}

export interface NotificationApiResponse {
    success: boolean;
    data?: {
        list: NotificationItem[];
        count: number;
        unreadCount: number;
    };
    list?: NotificationItem[];
    count?: number;
    unreadCount?: number;
    one_health_msg?: {
        list: NotificationItem[];
        count: number;
        unreadCount: number;
    };
    message?: string;
}

export type NotificationAction = 'list' | 'create' | 'update' | 'delete' | 'mark-all-read';
