import { NextApiRequest, NextApiResponse } from 'next';
import { request } from '@/utils/request';
import routerPath from '@/routerPath';

function getClientIP(req: NextApiRequest): string {
    try {
        const forwarded = req?.headers?.['x-forwarded-for'];
        const ip = forwarded ? (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0]) : req?.socket?.remoteAddress;
        return ip || 'localhost';
    } catch (error) {
        return 'localhost';
    }
}

function getAuthToken(req: NextApiRequest): string {
    try {
        if (!req) return '';

        // Check query parameters first
        let queryToken = req.query?.oh_token as string;
        if (queryToken) {
            queryToken = queryToken.replace(/^["']|["']$/g, '');
            queryToken = queryToken.replace(/\\"/g, '"');
            return queryToken;
        }

        // Check headers
        if (req.headers) {
            let ohToken = req.headers['oh_token'] as string;
            const authHeader = req.headers['authorization'] as string;

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
    const { action } = req?.query || {};
    const clientIP = getClientIP(req);
    const authToken = getAuthToken(req);

    console.log('🔥 DEBIT API HANDLER:', action);

    if (!['list', 'listRefund', 'update-returned'].includes(action as string)) {
        return res.status(400).json({
            success: false,
            message: `Invalid action: ${action}`
        });
    }

    try {
        let backendEndpoint: string;
        let method: 'GET' | 'POST' = 'GET';

        switch (action) {
            case 'list':
                backendEndpoint = routerPath.BACKEND_CASHIER.LIST; // Sử dụng chung với cashier
                break;
            case 'listRefund':
                backendEndpoint = '/invoices/listRefund'; // For refund details
                break;
            case 'update-returned':
                backendEndpoint = '/invoices/debit/update-returneds';
                method = 'POST';
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: `Unsupported action: ${action}`
                });
        }

        // Build query string from URL params for GET requests
        let queryString = '';
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

        const backendUrl = `${process.env.BACKEND_ADMIN_URL}${backendEndpoint}${queryString}`;

        console.log('🚀 Calling backend:', backendUrl);

        const baseHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
            'X-Client-IP': clientIP
        };

        if (authToken) {
            baseHeaders['oh_token'] = authToken;
            baseHeaders['Authorization'] = `Bearer ${authToken}`;
        }

        const requestOptions: any = {
            method,
            url: backendUrl,
            headers: baseHeaders
        };

        // Add body for POST requests
        if (method === 'POST' && req.body) {
            requestOptions.body = req.body;
        }

        const backendResponse: any = await request(requestOptions);

        if (backendResponse.result === 'false') {
            return res.status(400).json({
                success: false,
                message: backendResponse?.error?.message || 'Backend request failed',
                data: backendResponse
            });
        }

        return res.status(200).json({
            success: backendResponse.result === 'true',
            data: backendResponse.one_health_msg,
            ...backendResponse
        });

    } catch (error: any) {
        console.error('💥 DEBIT ERROR:', error);
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || `Debit ${action} failed`,
        });
    }
}
