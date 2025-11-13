import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import requestIp from 'request-ip';
import { request } from '@/utils/request';
import {
    AuthAction,
    LoginResponse,
    AuthResponse,
    PermissionResponse,
    ValidationResult,
    SecurityConfig,
    RateLimitConfig
} from '@/types/auth';

// Helper function để lấy client IP - sử dụng request-ip
function getClientIP(req: NextApiRequest): string {
    try {
        const clientIp = requestIp.getClientIp(req);
        return clientIp || 'localhost';
    } catch (error) {
        console.error('Error getting client IP:', error);
        return 'localhost';
    }
}

// Safe function để lấy user agent
function getUserAgent(req: NextApiRequest): string {
    try {
        return req?.headers?.['user-agent'] || 'unknown';
    } catch (error) {
        console.error('Error getting user agent:', error);
        return 'unknown';
    }
}

// Security configuration
const SECURITY_CONFIG: SecurityConfig = {
    tokenExpiry: 24 * 60 * 60 * 1000,
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000,
    passwordMinLength: 6,
    requireSpecialChars: false
};

// Rate limiting configuration
const getRateLimitConfig = (action: AuthAction): RateLimitConfig => {
    const configs: Record<AuthAction, RateLimitConfig> = {
        login: { maxAttempts: 5, windowMs: 15 * 60 * 1000 },
        logout: { maxAttempts: 10, windowMs: 60 * 1000 },
        register: { maxAttempts: 3, windowMs: 60 * 60 * 1000 },
        'forgot-password': { maxAttempts: 3, windowMs: 60 * 60 * 1000 },
        'reset-password': { maxAttempts: 5, windowMs: 60 * 60 * 1000 },
    };
    return configs[action];
};

// Validation functions
const validateRequest = (action: AuthAction, body: Record<string, any>): ValidationResult => {
    const errors: string[] = [];

    switch (action) {
        case 'login':
            if (!body?.username) errors.push('Username is required');
            if (!body?.password) errors.push('Password is required');
            break;
        case 'register':
            if (!body?.username) errors.push('Username is required');
            if (!body?.password) errors.push('Password is required');
            if (!body?.email) errors.push('Email is required');
            if (body?.password && body.password.length < SECURITY_CONFIG.passwordMinLength) {
                errors.push(`Password must be at least ${SECURITY_CONFIG.passwordMinLength} characters`);
            }
            if (body?.email && !isValidEmail(body.email)) errors.push('Invalid email format');
            break;
        case 'forgot-password':
            if (!body?.email) errors.push('Email is required');
            if (body?.email && !isValidEmail(body.email)) errors.push('Invalid email format');
            break;
        case 'reset-password':
            if (!body?.token) errors.push('Reset token is required');
            if (!body?.newPassword) errors.push('New password is required');
            if (body?.newPassword && body.newPassword.length < SECURITY_CONFIG.passwordMinLength) {
                errors.push(`Password must be at least ${SECURITY_CONFIG.passwordMinLength} characters`);
            }
            break;
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

// MD5 hash function
const createMD5Hash = (input: string): string => {
    return crypto.createHash('md5').update(input).digest('hex');
};

// Helper functions
const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const logAuthActivity = async (
    action: AuthAction,
    data: Record<string, any>,
    ip: string,
    success: boolean,
    error?: string
): Promise<void> => {
    const logData = {
        action: action.toUpperCase(),
        status: success ? 'SUCCESS' : 'FAILED',
        username: data?.username || data?.email || 'unknown',
        ip,
        timestamp: new Date().toISOString(),
        error: error || null
    };

    console.log(`[AUTH] ${logData.action} - ${logData.status}`, logData);
};

// Get permissions
const getUserPermissions = async (userId: string): Promise<any[]> => {
    try {
        const response: PermissionResponse = await request({
            method: 'POST',
            url: `${process.env.BACKEND_ADMIN_URL}/acl/get-permissions-by-user`,
            body: { id: userId, limit: 1000 },
            headers: {
                Cookie: `user=${userId}` // Truyền cookie vào headers
            }
        });


        if (response.result && response?.one_health_msg) {
            return response.one_health_msg;
        }
        return [];
    } catch (error) {
        console.error('Error fetching user permissions:', error);
        return [];
    }
};

// Process hospital list
const processHospitalList = (username: string): any[] | null => {
    const dataByUser: Record<string, any[]> = {
        "ungbuou,": [{
            key: "Ung Bướu",
            value: "ung_buou"
        }]
    };

    for (const [key, value] of Object.entries(dataByUser)) {
        const arrKey = key.split(",").filter(item => item && item !== "");
        if (arrKey.includes(username)) {
            return value;
        }
    }
    return null;
};

// Main handler
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<LoginResponse | { success: boolean; message: string; errors?: string[] }>
): Promise<void> {
    console.log('🔥 AUTH API HANDLER CALLED!');
    console.log('Method:', req?.method);
    console.log('Query:', req?.query);
    console.log('Body keys:', Object.keys(req?.body || {}));

    // ✅ Safe property access
    const { action } = req?.query || {};
    const authAction = action as AuthAction;
    const clientIP = getClientIP(req);
    const userAgent = getUserAgent(req);
    console.log('Cookies:', req?.headers?.cookie || 'No cookies found');

    const requestBody = req?.body || {};
    const cookies = req?.headers?.cookie || ''; // Lấy cookie từ request gốc

    console.log('Action:', authAction);
    console.log('Client IP:', clientIP);
    console.log('User Agent:', userAgent);

    // Validate action
    if (!['login', 'logout', 'register', 'forgot-password', 'reset-password'].includes(authAction)) {
        return res.status(400).json({
            success: false,
            message: `Invalid action: ${authAction}`
        });
    }

    // Validate request data
    const validation = validateRequest(authAction, requestBody);
    if (!validation.isValid) {
        await logAuthActivity(authAction, requestBody, clientIP, false, validation.errors.join(', '));
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: validation.errors
        });
    }

    // Security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');

    try {
        let requestData = { ...requestBody };
        let backendResponse: AuthResponse;
        // Special processing for different actions
        switch (authAction) {
            case 'login':
                if (requestData.password) {
                    requestData.password = createMD5Hash(requestData.password);
                }
                break;
            case 'register':
                if (requestData.password) {
                    requestData.password = createMD5Hash(requestData.password);
                }
                break;
            // case 'logout':
            //     res.setHeader('Set-Cookie', [
            //         'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly',
            //         'session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly',
            //     ]);
            // return res.status(200).json({ success: true, message: 'Logout successful' });
        }

        // Get backend endpoint
        const backendEndpoints: Record<AuthAction, string> = {
            'login': '/users/login',
            'logout': '/logout',
            'register': '/auth/register',
            'forgot-password': '/auth/forgot-password',
            'reset-password': '/auth/reset-password'
        };

        const backendEndpoint = backendEndpoints[authAction];
        if (!backendEndpoint) {
            throw new Error(`No backend endpoint configured for action: ${authAction}`);
        }
        const queryString = req?.query
            ? '?' +
            Object.entries(req?.query)
                .map(([key, value]) => {
                    if (value === undefined) return '';
                    const encodedValue = Array.isArray(value)
                        ? value.map(v => encodeURIComponent(v)).join(',')
                        : encodeURIComponent(value);
                    return `${encodeURIComponent(key)}=${encodedValue}`;
                })
                .filter(Boolean)
                .join('&')
            : '';

        const backendUrl = `${process.env.BACKEND_ADMIN_URL}${backendEndpoint}${queryString}`;
        console.log('Calling backend:', backendUrl);
        console.log('Request data:', { ...requestData, password: requestData.password ? '[HASHED]' : undefined });

        // Call backend API
        if (req?.method === 'GET') {
            backendResponse = await request({
                method: req?.method as 'GET' | 'POST' | 'PUT' | 'DELETE' || 'GET',
                url: `${backendUrl}`,

                headers: {
                    'Content-Type': 'application/json',
                    'X-Client-IP': clientIP,
                    'X-User-Agent': userAgent
                }
            });
        } else {
            backendResponse = await request({
                method: req?.method as 'GET' | 'POST' | 'PUT' | 'DELETE' || 'GET',
                url: `${backendUrl}`,
                body: requestData,
                headers: {
                    'Content-Type': 'application/json',
                    'X-Client-IP': clientIP,
                    'X-User-Agent': userAgent
                }
            });
        }
        // let backendResponse: AuthResponse = await request({
        //     method: req?.method as 'GET' | 'POST' | 'PUT' | 'DELETE' || 'GET',
        //     url: `${backendUrl}`,
        //     body: requestData,
        //     headers: {
        //     'Content-Type': 'application/json',
        //     'X-Client-IP': clientIP,
        //     'X-User-Agent': userAgent
        // }
        // });


        console.log('Backend response received:', { ...backendResponse, one_health_msg: backendResponse.one_health_msg ? '[USER_DATA]' : undefined });

        // Process response based on action
        let response: LoginResponse = {
            success: backendResponse.result === 'true',
            data: backendResponse
        };

        if (authAction === 'login' && response.success && backendResponse.one_health_msg) {
            const user = backendResponse.one_health_msg;

            // Set expiration time
            const expiresIn = SECURITY_CONFIG.tokenExpiry;
            const loginTime = new Date().toISOString();

            // Get user permissions
            const permissions = await getUserPermissions(user._id); // Truyền cookie vào đây

            // Process hospital list
            const hospitalList = processHospitalList(user.username);

            response = {
                success: true,
                user: {
                    ...user,
                    token: undefined // Remove sensitive data
                },
                token: user.token,
                permissions,
                loginTime,
                expiresIn,
                hospitalList,
                message: 'Login successful'
            };
        }

        // Log successful activity
        await logAuthActivity(authAction, requestBody, clientIP, true);

        console.log('Sending response:', { ...response, token: response.token ? '[TOKEN]' : undefined });
        return res.status(200).json(response);

    } catch (error: any) {
        // Log failed activity
        await logAuthActivity(authAction, requestBody, clientIP, false, error.message);

        console.error(`[AUTH ERROR] ${authAction}:`, {
            error: error.message,
            requestData: { ...requestBody, password: '[REDACTED]' },
            timestamp: new Date().toISOString(),
            ip: clientIP,
            userAgent
        });

        const statusCode = error.status || (authAction === 'login' ? 401 : 400);
        return res.status(statusCode).json({
            success: false,
            message: error.message || `${authAction} failed`,
        });
    }
}