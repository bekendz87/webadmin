import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  // ✅ Chỉ định Next.js tìm pages trong src/
  pageExtensions: ['ts', 'tsx'],

  experimental: {
    appDir: false,
    // ✅ Cấu hình memory và workers
    workerThreads: false, // Tắt worker threads để tiết kiệm memory
    cpus: 2, // Giới hạn số CPU cores sử dụng
  },

  // ✅ Cấu hình build performance
  swcMinify: true, // Sử dụng SWC thay vì Terser (nhanh hơn, ít memory hơn)
  
  // ✅ Memory optimization
  onDemandEntries: {
    maxInactiveAge: 25 * 1000, // 25 seconds
    pagesBufferLength: 2, // Chỉ giữ 2 pages trong memory
  },

  // ✅ Override pages directory
  webpack: (config, { isServer, dev }) => {
    // Set pages directory to src/pages
    config.resolve.alias['@'] = path.join(__dirname, 'src');

    // ✅ Webpack memory optimization
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            maxSize: 244 * 1024, // 244KB max chunk size
          },
        },
      },
    };

    // ✅ Development memory settings
    if (dev) {
      config.watchOptions = {
        poll: 1000, // Giảm frequency checking files
        aggregateTimeout: 300, // Delay rebuild
      };
    }

    if (isServer) {
      config.module.rules.push({
        test: /\.css$/,
        use: 'ignore-loader'
      });
    }
    return config;
  },

  // CORS headers
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'http://localhost:3004' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};

export default nextConfig;