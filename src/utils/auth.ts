import { APP_CONFIG } from '@/constants/config';
import { User, UserSession, StorageKeys } from '@/types/auth';

export const AUTH_STORAGE_KEYS: StorageKeys = {
    USER_INFO: 'userInfo',
    TOKEN: 'token',
    PERMISSIONS: 'permission_by_user',
    HOSPITAL_LIST: 'hospitalList',
    IS_ROOT: 'isRoot',
    DOCTOR: 'doctor',
    CONCLUSION_PERMISSION: 'conclusion_permission'
};

// Storage utilities
export const storage = {
    // localStorage utilities
    setItem: (key: string, value: any) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(key, JSON.stringify(value));
        }
    },

    getItem: <T>(key: string): T | null => {
        if (typeof window !== 'undefined') {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        }
        return null;
    },

    removeItem: (key: string) => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(key);
        }
    },

    clear: () => {
        if (typeof window !== 'undefined') {
            localStorage.clear();
        }
    }
};

// Add this helper function before sessionManager
const calculateExpirationTime = (durationInHours: number = 24): string => {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + durationInHours);
    return expiresAt.toISOString();
};

// Session management
export const sessionManager = {
    saveSession: (sessionData: UserSession, sessionDurationHours: number = 24) => {
        const loginTime = new Date().toISOString();
        const expiresAt = calculateExpirationTime(sessionDurationHours);

        storage.setItem(APP_CONFIG.TOKEN_KEY, sessionData.token);
        storage.setItem(AUTH_STORAGE_KEYS.USER_INFO, {
            ...sessionData.user,
            loginTime,
            expiresAt
        });
        storage.setItem(AUTH_STORAGE_KEYS.PERMISSIONS, sessionData.permissions);

        if (sessionData.hospitalList) {
            storage.setItem(AUTH_STORAGE_KEYS.HOSPITAL_LIST, sessionData.hospitalList);
        }

        if (sessionData.isRoot) {
            storage.setItem(AUTH_STORAGE_KEYS.IS_ROOT, sessionData.isRoot);
        }

        if (sessionData.doctor) {
            storage.setItem(AUTH_STORAGE_KEYS.DOCTOR, sessionData.doctor);
        }

        if (sessionData.conclusion_permission) {
            storage.setItem(AUTH_STORAGE_KEYS.CONCLUSION_PERMISSION, sessionData.conclusion_permission);
        }
    },

    getSession: (): UserSession | null => {
        const token = storage.getItem<string>(APP_CONFIG.TOKEN_KEY);
        const user = storage.getItem<User>(AUTH_STORAGE_KEYS.USER_INFO);

        if (!token || !user) {
            return null;
        }

        // Check session expiration
        if (!user.expiresAt) {
            sessionManager.clearSession();
            return null;
        }

        const now = new Date().getTime();
        const expiresAt = new Date(user.expiresAt).getTime();

        console.log('Session expires at:', user.expiresAt, 'Current time:', new Date().toISOString());

        if (now >= expiresAt) {
            // Session has expired
            sessionManager.clearSession();
            return null;
        }

        // Check token expiration if using JWT
        try {
            const tokenParts = token.split('.');
            if (tokenParts.length === 3) {
                const tokenPayload = JSON.parse(atob(tokenParts[1]));
                if (tokenPayload.exp && tokenPayload.exp * 1000 < now) {
                    // Token has expired
                    sessionManager.clearSession();
                    return null;
                }
            }
        } catch (error) {
            console.error('Error parsing token:', error);
            return null;
        }

        return {
            token,
            user,
            permissions: storage.getItem(AUTH_STORAGE_KEYS.PERMISSIONS) || [],
            hospitalList: storage.getItem(AUTH_STORAGE_KEYS.HOSPITAL_LIST) || undefined,
            isRoot: storage.getItem(AUTH_STORAGE_KEYS.IS_ROOT) ?? undefined,
            doctor: storage.getItem(AUTH_STORAGE_KEYS.DOCTOR) ?? undefined,
            conclusion_permission: storage.getItem(AUTH_STORAGE_KEYS.CONCLUSION_PERMISSION) ?? undefined,
            loginTime: user.loginTime || '',
            expiresAt: user.expiresAt
        };
    },

    clearSession: () => {
        Object.values(AUTH_STORAGE_KEYS).forEach(key => {
            storage.removeItem(key);
        });
        storage.removeItem(APP_CONFIG.TOKEN_KEY);
    },

    isSessionValid: (): boolean => {
        const session = sessionManager.getSession();
        if (!session) {
            return false;
        }

        const user = storage.getItem<User>(AUTH_STORAGE_KEYS.USER_INFO);
        if (!user?.expiresAt) {
            return false;
        }

        const now = new Date().getTime();
        const expiresAt = new Date(user.expiresAt).getTime();

        return now < expiresAt;
    }
};

// Token utilities
export const tokenUtils = {
    getAuthHeader: (): { Authorization: string } | {} => {
        const token = storage.getItem<string>(APP_CONFIG.TOKEN_KEY);
        return token ? { Authorization: `Bearer ${token}` } : {};
    },

    isTokenExpired: (token: string): boolean => {
        // Implement JWT token expiration check if using JWT
        // For now, return false as original implementation doesn't check expiration
        return false;
    }
};