import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// ✅ Cấu hình chuẩn cho React + TS + Vite với tối ưu hiệu năng
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(process.cwd(), './src'),
      process: 'process/browser',
    },
  },
  define: {
    'process.env': {},
  },
  // ✅ Cấu hình CPU và Memory cho build
  build: {
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      maxParallelFileOps: 4, // Giới hạn số file xử lý song song
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false, // Tắt sourcemap để tiết kiệm memory
  },
  // ✅ Cấu hình server performance
  server: {
    port: 3004,
    host: true,
    // Tối ưu memory cho dev server
    hmr: {
      overlay: false, // Giảm memory usage
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log(
              `🔄 Proxying: ${req.method} ${req.url} → http://localhost:3001${req.url}`,
            );
          });
        },
      },
    },
  },
  // ✅ Tối ưu memory cho dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    force: false, // Không force re-optimize để tiết kiệm CPU
  },
});
