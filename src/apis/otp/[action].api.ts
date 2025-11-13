import { NextApiRequest, NextApiResponse } from 'next';
import { request } from '@/utils/request';
import routerPath from '@/routerPath';
import { OtpAction, OtpListResponse } from '@/types/otp';

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

// Helper function to get token from request headers
function getAuthToken(req: NextApiRequest): string {
    try {
        if (!req?.headers) return '';

        const ohToken = req.headers['oh_token'] as string;
        const authHeader = req.headers['authorization'] as string;
        const cookies = req.headers.cookie as string;

        // Check for oh_token header first
        if (ohToken) {
            return ohToken;
        }

        // Check for Authorization header
        if (authHeader && authHeader.startsWith('Bearer ')) {
            return authHeader.substring(7);
        }

        // Fallback to cookie parsing
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

// Main handler
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
): Promise<void> {
    console.log('🔥 OTP API HANDLER CALLED!');
    console.log('📊 Request details:');
    console.log('  - Method:', req?.method);
    console.log('  - URL:', req?.url);
    console.log('  - Query:', JSON.stringify(req?.query, null, 2));

    const { action } = req?.query || {};
    const otpAction = action as OtpAction;
    const clientIP = getClientIP(req);
    const cookies = req?.headers?.cookie || '';
    const authToken = getAuthToken(req);

    console.log('📋 Extracted data:');
    console.log('  - Action:', otpAction);
    console.log('  - Client IP:', clientIP);
    console.log('  - Auth Token:', authToken ? `[TOKEN_PRESENT: ${authToken.substring(0, 20)}...]` : '[NO_TOKEN]');

    // Validate action
    const validActions: OtpAction[] = ['list'];

    if (!validActions.includes(otpAction)) {
        return res.status(400).json({
            success: false,
            message: `Invalid action: ${otpAction}`
        });
    }

    // Security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');

    try {
        let backendEndpoint: string;

        // Map action to backend endpoint
        const endpointMap: Record<OtpAction, string> = {
            'list': routerPath.BACKEND_OTP.LIST,
        };

        backendEndpoint = endpointMap[otpAction];

        let queryString = '';

        // Build query string from URL params
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

        console.log('Final Query String:', queryString);

        const backendUrl = `${process.env.BACKEND_ADMIN_URL}${backendEndpoint}${queryString}`;
        console.log('Calling backend:', backendUrl);

        // Build headers
        const baseHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
            'X-Client-IP': clientIP,
            'Cookie': cookies
        };

        // Add auth token header if available
        if (authToken) {
            baseHeaders['oh_token'] = authToken;
        }

        const backendResponse: OtpListResponse = await request({
            method: 'GET',
            url: backendUrl,
            headers: baseHeaders
        });

        console.log('✅ Backend response:', {
            result: backendResponse.result,
            dataLength: backendResponse.one_health_msg?.length || 0
        });

        // Transform response to match expected format
        const transformedData = backendResponse.one_health_msg || [];

        return res.status(200).json({
            success: backendResponse.result === 'true',
            data: transformedData,
            ...backendResponse
        });

    } catch (error: any) {
        console.error(`💥 [OTP ERROR] ${otpAction}:`, {
            error: error.message,
            timestamp: new Date().toISOString(),
            ip: clientIP
        });

        return res.status(error.status || 500).json({
            success: false,
            message: error.message || `OTP ${otpAction} failed`,
        });
    }
}
