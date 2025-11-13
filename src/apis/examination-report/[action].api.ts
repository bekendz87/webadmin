import { NextApiRequest, NextApiResponse } from 'next';
import { request } from '@/utils/request';
import { storage } from '@/utils/auth';
import routerPath from '@/routerPath';

export type ExaminationReportAction = 'list' | 'search-health-service';

interface ExaminationReportListResponse {
    result: string;
    one_health_msg?: any[];
    error?: {
        message: string;
    };
}

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

// Helper function to get token from request headers AND query parameters
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

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
): Promise<void> {
    console.log('🔥 EXAMINATION REPORT API HANDLER CALLED!');
    console.log('📊 Request details:');
    console.log('  - Method:', req?.method);
    console.log('  - URL:', req?.url);
    console.log('  - Query:', JSON.stringify(req?.query, null, 2));

    const { action } = req?.query || {};
    const examinationAction = action as ExaminationReportAction;
    const clientIP = getClientIP(req);
    const cookies = req?.headers?.cookie || '';
    const authToken = getAuthToken(req);

    console.log('📋 Extracted data:');
    console.log('  - Action:', examinationAction);
    console.log('  - Client IP:', clientIP);
    console.log('  - Auth Token:', authToken ? `[TOKEN_PRESENT: ${authToken.substring(0, 20)}...]` : '[NO_TOKEN]');

    // Validate action
    const validActions: ExaminationReportAction[] = ['list', 'search-health-service'];

    if (!validActions.includes(examinationAction)) {
        return res.status(400).json({
            success: false,
            message: `Invalid action: ${examinationAction}`
        });
    }

    // Security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');

    try {
        let backendEndpoint: string;
        let method: 'GET' | 'POST' = 'GET';

        // Map action to backend endpoint
        switch (examinationAction) {
            case 'list':
                backendEndpoint = routerPath.BACKEND_EXAMINATION_REPORT.LIST;
                break;
            case 'search-health-service':
                backendEndpoint = routerPath.BACKEND_EXAMINATION_REPORT.SEARCH_HEALTH_SERVICE;
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: `Unsupported action: ${examinationAction}`
                });
        }

        let queryString = '';

        // Build query string from URL params for GET requests
        if (method === 'GET') {
            const excludedParams = ['action', 'slug', '__nextjs_original-pathname', '__nextjs_pathname'];
            const queryParams = req?.query ? Object.entries(req.query)
                .filter(([key]) => !excludedParams.includes(key))
                .filter(([key, value]) => value !== undefined && value !== null && value !== '')
                .map(([key, value]) => {
                    if (Array.isArray(value)) {
                        return value.map(v => `${key}=${String(v)}`).join('&');
                    } else {
                        return `${key}=${String(value)}`;
                    }
                })
                .filter(Boolean) : [];

            queryString = queryParams.length > 0 ? '?' + queryParams.join('&') : '';
        }

        console.log('Final Query String:', queryString);

        const backendUrl = `${process.env.BACKEND_ADMIN_URL}${backendEndpoint}${queryString}`;
        console.log('Calling backend:', backendUrl);

        // Build headers
        const baseHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
            'X-Client-IP': clientIP
        };

        if (cookies) {
            baseHeaders['Cookie'] = cookies;
        }

        if (authToken) {
            baseHeaders['oh_token'] = authToken;
            baseHeaders['Authorization'] = `Bearer ${authToken}`;
            console.log('✅ Adding auth headers with token');
        } else {
            console.log('⚠️ No auth token found');
        }

        console.log('Request headers being sent:', JSON.stringify(baseHeaders, null, 2));

        // Prepare request options
        const requestOptions: any = {
            method,
            url: backendUrl,
            headers: baseHeaders
        };

        // Handle export requests
        if (req.query.export) {
            const exportUrl = `${backendUrl}&oh_token=${authToken}`;
            return res.redirect(exportUrl);
        }

        const backendResponse: ExaminationReportListResponse = await request(requestOptions);

        console.log('📥 Backend response result:', backendResponse.result);

        // Check if backend returned false result
        if (backendResponse.result === 'false') {
            console.error('❌ Backend returned false result:', backendResponse);
            return res.status(400).json({
                success: false,
                message: backendResponse?.error?.message || 'Backend authentication or request failed',
                data: backendResponse
            });
        }

        // Return successful response
        return res.status(200).json({
            success: backendResponse.result === 'true',
            data: backendResponse.one_health_msg || [],
            ...backendResponse
        });

    } catch (error: any) {
        console.error(`💥 [EXAMINATION REPORT ERROR] ${examinationAction}:`, {
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            ip: clientIP
        });

        return res.status(error.status || 500).json({
            success: false,
            message: error.message || `Examination report ${examinationAction} failed`,
        });
    }
}
