import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { slug } = req.query;
    const [module, action] = slug as string[];

    console.log(`🔄 [PROXY] ${req.method} /api/${module}/${action}`);
    console.log('📋 Proxy - Module:', module, 'Action:', action);

    try {
        if (module === 'auth') {
            // ✅ Handle auth module
            const { default: authHandler } = await import(`../../apis/auth/[action].api`);

            const fakeReq: any = {
                ...req,
                query: { ...req.query, action }
            };

            console.log('🔄 Calling authHandler with action:', action);
            return await authHandler(fakeReq, res);
        } else if (module) {
            const { default: moduleHandler } = await import(`../../apis/${module}/[action].api`);
            const fakeReq: any = {
                ...req,
                query: { ...req.query, action },
                headers: { ...req.headers }
            };

            console.log(`🔄 Calling ${module}Handler with action: ${action}`);
            return await moduleHandler(fakeReq, res);
        }
        
        res.status(404).json({ success: false, message: `API module not found: ${module}` });
    } catch (error: any) {
        console.error('💥 Proxy error:', error);
        console.error('📁 Import path attempted:', `../../apis/${module}/[action].api`);
        res.status(500).json({ success: false, message: `Proxy error: ${error.message}` });
    }
}