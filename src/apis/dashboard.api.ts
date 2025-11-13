import routerPath from '@/routerPath';

// Interfaces
interface StatOptions {
    type: string;
    day: number;
    month: number;
    year: number;
}

interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    result?: string;
    one_health_msg?: T;
}

// Helper function to get token from storage
const getAuthToken = (): string => {
    try {
        // Try to get from localStorage first
        const token = localStorage.getItem('webadmin_auth_token');

        if (token) {
            try {
                const tokenData = JSON.parse(token);
                return tokenData;
            } catch {
                console.log('Token is not JSON, using raw value');
                return token;
            }
        }

        // Fallback to cookies if localStorage is empty
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'webadmin_auth_token') {
                const decodedValue = decodeURIComponent(value);
                try {
                    const tokenData = JSON.parse(decodedValue);
                    return tokenData.token || decodedValue;
                } catch {
                    return decodedValue;
                }
            }
        }

        return '';
    } catch (error) {
        console.error('Error getting auth token:', error);
        return '';
    }
};

// Helper function to make API calls via proxy
const callDashboardApi = async <T = any>(
    action: string,
    method: 'GET' | 'POST' = 'POST',
    body?: any,
    params?: Record<string, any>
): Promise<ApiResponse<T>> => {
    // Use proxy URL pattern: /api/dashboard/action instead of direct route
    const url = new URL(`/api/dashboard/${action}`, window.location.origin);

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                url.searchParams.append(key, String(value));
            }
        });
    }

    // Get auth token
    const authToken = getAuthToken();

    // Prepare headers
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    // Add auth token to headers if available
    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
        headers['oh_token'] = authToken;
    }
    
    const response = await fetch(url.toString(), {
        method,
        headers: headers,
        body: body ? JSON.stringify(body) : undefined,
        credentials: 'include', // Include cookies
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Request failed');
    }

    return response.json();
};

// API Functions
export const dashboardApi = {
    statQuestion: (options: StatOptions) =>
        callDashboardApi('stat-question', 'POST', options),

    statPrescription: (options: StatOptions) =>
        callDashboardApi('stat-prescription', 'POST', options),

    statUser: (options: StatOptions) =>
        callDashboardApi('stat-user', 'POST', options),

    statCallHistory: (options: StatOptions) =>
        callDashboardApi('stat-call-history', 'POST', options),

    totalCashIn: (paymentType: string, params: { cashIn: number }) =>
        callDashboardApi('total-cash-in', 'GET', undefined, { paymentType, ...params }),

    statParaclinicalRevenue: () =>
        callDashboardApi('stat-paraclinical-revenue', 'GET'),

    statPrescriptionRevenue: () =>
        callDashboardApi('stat-prescription-revenue', 'GET'),

    cashInStat: () =>
        callDashboardApi('cash-in-stat', 'GET'),

    getTopDoctors: () =>
        callDashboardApi('top-doctors', 'GET'),

    cashInStatMonths: (year: number) =>
        callDashboardApi('cash-in-stat-months', 'GET', undefined, { year }),
};
