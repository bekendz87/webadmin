import { NextApiRequest, NextApiResponse } from 'next';
import { request } from '@/utils/request';
import routerPath from '@/routerPath';

// Types
type DashboardAction =
    | 'stat-question'
    | 'stat-prescription'
    | 'stat-user'
    | 'stat-call-history'
    | 'total-cash-in'
    | 'stat-paraclinical-revenue'
    | 'stat-prescription-revenue'
    | 'cash-in-stat'
    | 'top-doctors'
    | 'cash-in-stat-months';


// Helper function to get client IP
function getClientIP(req: NextApiRequest): string {
    try {
        const forwarded = req?.headers?.['x-forwarded-for'];
        const ip = forwarded ? (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0]) : req?.socket?.remoteAddress;
        return ip || 'localhost';
    } catch (error) {
        return 'localhost';
    }
}

// Helper function to get token from request headers - ENHANCED DEBUG
function getAuthToken(req: NextApiRequest): string {
    try {

        // Safe check for headers
        if (!req) {
            return '';
        }

        if (!req.headers) {
            return '';
        }



        // Check specific headers with detailed logging
        const ohToken = req.headers['oh_token'] as string;
        const authHeader = req.headers['authorization'] as string;
        const cookies = req.headers.cookie as string;



        // Check for oh_token header first (sent by client)
        if (ohToken) {
            return ohToken;
        }

        // Check for Authorization header
        if (authHeader && authHeader.startsWith('Bearer ')) {
            return authHeader.substring(7);
        }

        // Fallback to cookie parsing if needed
        if (cookies) {
            const cookieArray = cookies.split(';').map(cookie => cookie.trim());

            for (const cookie of cookieArray) {
                const [name, value] = cookie.split('=');
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
        }


        return '';
    } catch (error) {
        console.error('💥 Error extracting auth token:', error);
        return '';
    }
}

// Helper function to build query string from options (like the original client code)
function buildQueryStringFromOptions(options: any): string {
    if (!options) return '';

    const params: string[] = [];

    if (options.type) {
        params.push(`type=${encodeURIComponent(options.type)}`);
    }
    if (options.day) {
        params.push(`day=${encodeURIComponent(options.day)}`);
    }
    if (options.month) {
        params.push(`month=${encodeURIComponent(options.month)}`);
    }
    if (options.year) {
        params.push(`year=${encodeURIComponent(options.year)}`);
    }

    return params.length > 0 ? '?' + params.join('&') : '';
}

// Main handler
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
): Promise<void> {
    console.log('🔥 DASHBOARD API HANDLER CALLED!');
    console.log('📊 Request details:');
    console.log('  - Method:', req?.method);
    console.log('  - URL:', req?.url);
    console.log('  - Query:', JSON.stringify(req?.query, null, 2));
    console.log('  - Body:', JSON.stringify(req?.body, null, 2));


    // Safe access to request properties
    const { action } = req?.query || {};
    const dashboardAction = action as DashboardAction;
    const clientIP = getClientIP(req);
    const cookies = req?.headers?.cookie || '';

    // Get auth token from client headers with enhanced debugging
    const authToken = getAuthToken(req);

    console.log('📋 Extracted data:');
    console.log('  - Action:', dashboardAction);
    console.log('  - Client IP:', clientIP);
    console.log('  - Auth Token:', authToken ? `[TOKEN_PRESENT: ${authToken.substring(0, 20)}...]` : '[NO_TOKEN]');

    // Validate action
    const validActions: DashboardAction[] = [
        'stat-question', 'stat-prescription', 'stat-user', 'stat-call-history',
        'total-cash-in', 'stat-paraclinical-revenue', 'stat-prescription-revenue',
        'cash-in-stat', 'top-doctors', 'cash-in-stat-months'
    ];

    if (!validActions.includes(dashboardAction)) {
        return res.status(400).json({
            success: false,
            message: `Invalid action: ${dashboardAction}`
        });
    }

    // Security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');

    try {
        let backendEndpoint: string;
        let requestData = req?.body || {};

        // Map action to backend endpoint
        const endpointMap: Record<DashboardAction, string> = {
            'stat-question': routerPath.BACKEND_DASHBOARD.STAT_QUESTION,
            'stat-prescription': routerPath.BACKEND_DASHBOARD.STAT_PRESCRIPTION,
            'stat-user': routerPath.BACKEND_DASHBOARD.STAT_USER,
            'stat-call-history': routerPath.BACKEND_DASHBOARD.STAT_CALL_HISTORY,
            'total-cash-in': routerPath.BACKEND_DASHBOARD.TOTAL_CASH_IN,
            'stat-paraclinical-revenue': routerPath.BACKEND_DASHBOARD.STAT_PARACLINICAL_REVENUE,
            'stat-prescription-revenue': routerPath.BACKEND_DASHBOARD.STAT_PRESCRIPTION_REVENUE,
            'cash-in-stat': routerPath.BACKEND_DASHBOARD.CASH_IN_STAT,
            'top-doctors': routerPath.BACKEND_DASHBOARD.TOP_DOCTORS,
            'cash-in-stat-months': routerPath.BACKEND_DASHBOARD.CASH_IN_STAT_MONTHS,
        };

        backendEndpoint = endpointMap[dashboardAction];

        let queryString = '';

        // Handle different request types
        if (req?.method === 'GET') {
            // For GET requests, build query string from URL params
            const excludedParams = ['action', 'slug', '__nextjs_original-pathname', '__nextjs_pathname'];
            const queryParams = req?.query ? Object.entries(req.query)
                .filter(([key]) => !excludedParams.includes(key))
                .filter(([key, value]) => value !== undefined && value !== null && value !== '')
                .map(([key, value]) => {
                    if (Array.isArray(value)) {
                        return value.map(v => `${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`).join('&');
                    } else {
                        return `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`;
                    }
                })
                .filter(Boolean) : [];

            queryString = queryParams.length > 0 ? '?' + queryParams.join('&') : '';
        } else {
            // For POST requests with stat actions, convert body to query string (like original client code)
            if (['stat-question', 'stat-prescription', 'stat-user', 'stat-call-history'].includes(dashboardAction)) {
                queryString = buildQueryStringFromOptions(requestData);
                console.log('Built query string from POST body:', queryString);
            } else {
                // For other POST requests, keep existing logic
                const excludedParams = ['action', 'slug', '__nextjs_original-pathname', '__nextjs_pathname'];
                const queryParams = req?.query ? Object.entries(req.query)
                    .filter(([key]) => !excludedParams.includes(key))
                    .filter(([key, value]) => value !== undefined && value !== null && value !== '')
                    .map(([key, value]) => {
                        if (Array.isArray(value)) {
                            return value.map(v => `${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`).join('&');
                        } else {
                            return `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`;
                        }
                    })
                    .filter(Boolean) : [];

                queryString = queryParams.length > 0 ? '?' + queryParams.join('&') : '';
            }
        }

        console.log('Final Query String:', queryString);

        const backendUrl = `${process.env.BACKEND_ADMIN_URL}${backendEndpoint}${queryString}`;
        console.log('Calling backend:', backendUrl);

        // Build headers with safe checks
        const baseHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
            'X-Client-IP': clientIP,
            'Cookie': cookies
        };

        // Add auth token header if available
        if (authToken) {
            baseHeaders['oh_token'] = authToken;

        }

        let backendResponse: any;

        // For stat endpoints that use query params, always use GET
        if (['stat-question', 'stat-prescription', 'stat-user', 'stat-call-history'].includes(dashboardAction)) {
            backendResponse = await request({
                method: 'GET',
                url: backendUrl,
                headers: baseHeaders
            });
        } else {
            // For other endpoints, use the original method
            if (req?.method === 'GET') {
                backendResponse = await request({
                    method: 'GET',
                    url: backendUrl,
                    headers: baseHeaders
                });
            } else {
                backendResponse = await request({
                    method: req?.method as 'POST' | 'PUT' | 'DELETE',
                    url: backendUrl,
                    body: requestData,
                    headers: baseHeaders
                });
            }
        }



        return res.status(200).json({
            success: backendResponse.result === 'true',
            data: backendResponse,
            ...backendResponse
        });

    } catch (error: any) {
        console.error(`💥 [DASHBOARD ERROR] ${dashboardAction}:`, {
            error: error.message,
            timestamp: new Date().toISOString(),
            ip: clientIP
        });

        return res.status(error.status || 500).json({
            success: false,
            message: error.message || `Dashboard ${dashboardAction} failed`,
        });
    }
}
