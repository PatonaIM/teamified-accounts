import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
    hmr: {
      clientPort: 443,
    },
    allowedHosts: true,
    proxy: {
      // Portal API (existing) - NestJS backend
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },

      // NEW: Hiring API - Job Requests, Candidates, Meetings (Azure Zoho Service)
      '/hiring-api/zoho': {
        target: 'https://func-tmf-reg-dev.azurewebsites.net',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/hiring-api\/zoho/, '/api'),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Forward auth token from portal to hiring API
            const token = req.headers.authorization;
            if (token) {
              proxyReq.setHeader('Authorization', token);
            }
            console.log(`[Hiring-Zoho] ${req.method} ${req.url} -> ${options.target}${proxyReq.path}`);
          });

          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log(`[Hiring-Zoho] ${proxyRes.statusCode} ${req.url}`);
          });

          proxy.on('error', (err, req, res) => {
            console.error(`[Hiring-Zoho Error] ${req.url}:`, err.message);
          });
        },
      },

      // NEW: Interview Service API (Azure Interview Service)
      '/hiring-api/interview': {
        target: 'https://api-interview-dev.azurewebsites.net',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/hiring-api\/interview/, ''),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            const token = req.headers.authorization;
            if (token) {
              proxyReq.setHeader('Authorization', token);
            }
            console.log(`[Hiring-Interview] ${req.method} ${req.url} -> ${options.target}${proxyReq.path}`);
          });

          proxy.on('error', (err, req, res) => {
            console.error(`[Hiring-Interview Error] ${req.url}:`, err.message);
          });
        },
      },

      // NEW: AI Talent Search API (Azure AI Service)
      '/hiring-api/ai': {
        target: 'https://teamified-ai-dev.azurewebsites.net',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/hiring-api\/ai/, ''),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            const token = req.headers.authorization;
            if (token) {
              proxyReq.setHeader('Authorization', token);
            }
            console.log(`[Hiring-AI] ${req.method} ${req.url} -> ${options.target}${proxyReq.path}`);
          });

          proxy.on('error', (err, req, res) => {
            console.error(`[Hiring-AI Error] ${req.url}:`, err.message);
          });
        },
      },

      // NEW: Onboarding/Auth API (Azure Onboarding Service)
      '/hiring-api/auth': {
        target: 'https://apionboarding-dev.azurewebsites.net',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/hiring-api\/auth/, '/api'),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            const token = req.headers.authorization;
            if (token) {
              proxyReq.setHeader('Authorization', token);
            }
            console.log(`[Hiring-Auth] ${req.method} ${req.url} -> ${options.target}${proxyReq.path}`);
          });

          proxy.on('error', (err, req, res) => {
            console.error(`[Hiring-Auth Error] ${req.url}:`, err.message);
          });
        },
      },
    }
  },
  preview: {
    host: '0.0.0.0',
    port: 5000,
    strictPort: true,
  },
  optimizeDeps: {
    include: ['date-fns']
  },
  build: {
    commonjsOptions: {
      include: [/date-fns/, /node_modules/]
    },
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
        chunkFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
        assetFileNames: `assets/[name]-[hash]-${Date.now()}.[ext]`
      }
    }
  }
})
