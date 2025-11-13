import { NextApiRequest, NextApiResponse } from 'next';
import { request } from '@/utils/request';
import { storage } from '@/utils/auth';
import routerPath from '@/routerPath';
import { InvoiceAction, InvoiceListResponse } from '@/types/invoice';

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
    console.log('🔥 INVOICE API HANDLER CALLED!');
    console.log('📊 Request details:');
    console.log('  - Method:', req?.method);
    console.log('  - URL:', req?.url);
    console.log('  - Query:', JSON.stringify(req?.query, null, 2));

    const { action, id } = req?.query || {};
    const invoiceAction = action as InvoiceAction;
    const clientIP = getClientIP(req);
    const cookies = req?.headers?.cookie || '';
    const authToken = getAuthToken(req);

    console.log('📋 Extracted data:');
    console.log('  - Action:', invoiceAction);
    console.log('  - ID:', id);
    console.log('  - Client IP:', clientIP);
    console.log('  - Auth Token:', authToken ? `[TOKEN_PRESENT: ${authToken.substring(0, 20)}...]` : '[NO_TOKEN]');
    console.log('  - Cookies:', cookies);

    // Validate action
    const validActions: InvoiceAction[] = ['list', 'detail', 'refund'];

    if (!validActions.includes(invoiceAction)) {
        return res.status(400).json({
            success: false,
            message: `Invalid action: ${invoiceAction}`
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
        switch (invoiceAction) {
            case 'list':
                backendEndpoint = routerPath.BACKEND_INVOICE.LIST;
                break;
            case 'detail':
                if (!id) {
                    return res.status(400).json({
                        success: false,
                        message: 'Invoice ID is required for detail action'
                    });
                }
                // Use the detail endpoint and append the ID as a path parameter
                backendEndpoint = `${routerPath.BACKEND_INVOICE.DETAIL}/${id}`;
                break;
            case 'refund':
                if (!id) {
                    return res.status(400).json({
                        success: false,
                        message: 'Invoice ID is required for refund action'
                    });
                }
                backendEndpoint = routerPath.BACKEND_INVOICE.REFUND.replace(':id', id as string);
                method = 'POST';
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: `Unsupported action: ${invoiceAction}`
                });
        }

        let queryString = '';

        // Build query string from URL params for GET requests
        if (method === 'GET') {
            const excludedParams = ['action', 'slug', 'id', '__nextjs_original-pathname', '__nextjs_pathname'];
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

            // For detail action, don't include query parameters in the URL since ID is in the path
            if (invoiceAction !== 'detail') {
                queryString = queryParams.length > 0 ? '?' + queryParams.join('&') : '';
            }
        }

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
            method,
            url: backendUrl,
            headers: baseHeaders
        };

        // Add body for POST requests
        if (method === 'POST' && req.body) {
            requestOptions.body = req.body;
            console.log('📤 Request body:', JSON.stringify(req.body, null, 2));
        }

        const backendResponse: InvoiceListResponse = await request(requestOptions);

        console.log('📥 Backend response:', backendResponse.result);

        // Check if backend returned false result
        if (backendResponse.result === 'false') {
            console.error('❌ Backend returned false result:', backendResponse);
            return res.status(400).json({
                success: false,
                message: backendResponse && backendResponse.error && backendResponse.error.message ? backendResponse.error.message : 'Backend authentication or request failed',
                data: backendResponse
            });
        }

        // Transform response based on action
        if (invoiceAction === 'list') {
            const transformedData = backendResponse.one_health_msg || { list: [], report: { totalCashIn: 0, totalPayCredit: 0, totalPayMoney: 0, totalRefund: 0 }, count: 0 };

            return res.status(200).json({
                success: backendResponse.result === 'true',
                data: transformedData,
                ...backendResponse
            });
        } else {
            // For detail and refund actions
            return res.status(200).json({
                success: backendResponse.result === 'true',
                data: backendResponse.one_health_msg,
                ...backendResponse
            });
        }

    } catch (error: any) {
        console.error(`💥 [INVOICE ERROR] ${invoiceAction}:`, {
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            ip: clientIP
        });

        return res.status(error.status || 500).json({
            success: false,
            message: error.message || `Invoice ${invoiceAction} failed`,
        });
    }
}
