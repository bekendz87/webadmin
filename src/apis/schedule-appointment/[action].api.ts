import { NextApiRequest, NextApiResponse } from 'next';
import { request } from '@/utils/request';
import { storage } from '@/utils/auth';
import routerPath from '@/routerPath';

// Types
type ScheduleAppointmentAction = 'list';


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

        // First check query parameters (this is where the client is sending it)
        let queryToken = req.query?.oh_token as string;
        if (queryToken) {
            // Clean the token - remove extra quotes and escape characters
            queryToken = queryToken.replace(/^["']|["']$/g, ''); // Remove leading/trailing quotes
            queryToken = queryToken.replace(/\\"/g, '"'); // Unescape quotes
            return queryToken;
        }

        // Then check headers
        if (req.headers) {
            let ohToken = req.headers['oh_token'] as string;
            const authHeader = req.headers['authorization'] as string;
            const cookies = req.headers.cookie as string;

            // Check for oh_token header
            if (ohToken) {
                // Clean the token
                ohToken = ohToken.replace(/^["']|["']$/g, '');
                ohToken = ohToken.replace(/\\"/g, '"');
                return ohToken;
            }

            // Check for Authorization header
            if (authHeader && authHeader.startsWith('Bearer ')) {
                let token = authHeader.substring(7);
                token = token.replace(/^["']|["']$/g, '');
                token = token.replace(/\\"/g, '"');
                return token;
            }

            // Fallback to cookie parsing
            if (cookies) {
                const cookieArray = cookies.split(';').map(cookie => cookie.trim());
                for (const cookie of cookieArray) {
                    const [name, value] = cookie.split('=');
                    if (name === 'webadmin_auth_token' || name === 'token') {
                        const decodedValue = decodeURIComponent(value);
                        try {
                            const tokenData = JSON.parse(decodedValue);
                            let token = tokenData.token || decodedValue;
                            // Clean the token
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

// Main handler
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
): Promise<void> {
    console.log('🏥 SCHEDULE APPOINTMENT API HANDLER CALLED!');
    console.log('📊 Request details:');
    console.log('  - Method:', req?.method);
    console.log('  - URL:', req?.url);
    console.log('  - Query:', JSON.stringify(req?.query, null, 2));

    const { action } = req?.query || {};
    const scheduleAppointmentAction = action as ScheduleAppointmentAction;
    const clientIP = getClientIP(req);
    const cookies = req?.headers?.cookie || '';
    const authToken = getAuthToken(req);

    console.log('📋 Extracted data:');
    console.log('  - Action:', scheduleAppointmentAction);
    console.log('  - Client IP:', clientIP);
    console.log('  - Auth Token:', authToken ? `[TOKEN_PRESENT: ${authToken.substring(0, 20)}...]` : '[NO_TOKEN]');
    console.log('  - Cookies:', cookies);

    // Validate action
    const validActions: ScheduleAppointmentAction[] = ['list'];

    if (!validActions.includes(scheduleAppointmentAction)) {
        return res.status(400).json({
            success: false,
            message: `Invalid action: ${scheduleAppointmentAction}`
        });
    }

    // Only allow GET method for list action
    if (req.method !== 'GET') {
        return res.status(405).json({
            success: false,
            message: `Method ${req.method} not allowed`
        });
    }

    // Security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');

    try {
        let backendEndpoint: string;

        // Map action to backend endpoint - use accountant endpoint as default
        switch (scheduleAppointmentAction) {
            case 'list':
                backendEndpoint = routerPath.BACKEND_SCHEDULE_APPOINTMENT.LIST_ACCOUNTANT;
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: `Unsupported action: ${scheduleAppointmentAction}`
                });
        }

        let queryString = '';

        // Build query string from URL params for GET requests
        const excludedParams = ['action', 'slug', '__nextjs_original-pathname', '__nextjs_pathname'];
        const queryParams = req?.query ? Object.entries(req.query)
            .filter(([key]) => !excludedParams.includes(key))
            .filter(([key, value]) => value !== undefined && value !== null && value !== '')
            .map(([key, value]) => {
                if (Array.isArray(value)) {
                    return value.map(v => `${key}=${String(v)}`).join('&');
                } else {
                    // Don't encode the values to match working format
                    return `${key}=${String(value)}`;
                }
            })
            .filter(Boolean) : [];

        queryString = queryParams.length > 0 ? '?' + queryParams.join('&') : '';

        console.log('Final Query String:', queryString);

        const backendUrl = `${process.env.BACKEND_ADMIN_URL}${backendEndpoint}${queryString}`;
        console.log('Calling backend:', backendUrl);

        // Build headers - ensure proper authentication
        const baseHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
            'X-Client-IP': clientIP
        };

        // Always forward cookies
        if (cookies) {
            baseHeaders['Cookie'] = cookies;
        }

        // Add auth token header if available - try multiple header names
        if (authToken) {
            baseHeaders['oh_token'] = authToken;
            baseHeaders['Authorization'] = `Bearer ${authToken}`;
            console.log('✅ Adding auth headers with token');
        } else {
            console.log('⚠️ No auth token found - this might cause authentication issues');
        }

        console.log('Request headers being sent:', JSON.stringify(baseHeaders, null, 2));

        // Prepare request options
        const requestOptions: any = {
            method: 'GET',
            url: backendUrl,
            headers: baseHeaders
        };

        const backendResponse: any = await request(requestOptions);

        console.log('📨 Backend response received:', {
            success: backendResponse?.success,
            result: backendResponse?.result,
            hasData: !!backendResponse?.one_health_msg,
            hasReport: !!backendResponse?.one_health_msg?.report,
            dataLength: backendResponse?.one_health_msg?.list?.length || 0
        });

        // Check if backend returned false result
        if (backendResponse.result === 'false') {
            console.error('❌ Backend returned false result:', backendResponse);
            return res.status(400).json({
                success: false,
                message: 'Backend authentication or request failed',
                data: backendResponse
            });
        }

        // Transform response for schedule appointment list
        if (scheduleAppointmentAction === 'list') {
            const responseData = backendResponse.one_health_msg || { 
                list: [], 
                report: { 
                    total_paid: 0, 
                    total_refund: 0, 
                    count: 0 
                } 
            };
            
            return res.status(200).json({
                success: backendResponse.result === 'true',
                list: responseData.list || [],
                report: responseData.report || { total_paid: 0, total_refund: 0, count: 0 },
                total: responseData.report?.count || 0,
                ...backendResponse
            });
        }

        // Fallback response
        return res.status(200).json({
            success: backendResponse.result === 'true',
            data: backendResponse.one_health_msg,
            ...backendResponse
        });

    } catch (error: any) {
        console.error(`💥 [SCHEDULE APPOINTMENT ERROR] ${scheduleAppointmentAction}:`, {
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            ip: clientIP
        });

        return res.status(error.status || 500).json({
            success: false,
            message: error.message || `Schedule appointment ${scheduleAppointmentAction} failed`,
        });
    }
}
