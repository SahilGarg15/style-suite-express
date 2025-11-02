import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import type { ViteDevServer } from 'vite';
import type { IncomingMessage, ServerResponse } from 'http';

// API handler plugin for development
const apiPlugin = () => ({
  name: 'api-handler',
  configureServer(server: ViteDevServer) {
    server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
      // Only handle API routes
      if (!req.url?.startsWith('/api/')) {
        return next();
      }

      // Prevent Vite from handling this
      res.setHeader('X-Handled-By', 'api-plugin');

      try {
        // Parse URL and extract path
        const url = new URL(req.url, `http://${req.headers.host}`);
        const apiPath = url.pathname.replace('/api/', '');
        
        // Convert to module path
        let modulePath;
        if (apiPath === 'auth' || apiPath.startsWith('auth?')) {
          // Consolidated auth endpoint (handles both login and signup)
          modulePath = './api/auth/index';
        } else if (apiPath.startsWith('auth/')) {
          modulePath = `./api/${apiPath}`;
        } else if (apiPath.startsWith('v1/')) {
          // /api/v1/* (external API endpoints)
          const v1Path = apiPath.replace('v1/', '');
          modulePath = `./api/v1/${v1Path}`;
        } else if (apiPath.startsWith('admin/')) {
          // /api/admin/products, /api/admin/orders, etc.
          modulePath = `./api/${apiPath}`;
        } else if (apiPath === 'reviews') {
          // /api/reviews (reviews endpoint)
          modulePath = './api/reviews/index';
        } else if (apiPath === 'products') {
          // /api/products (list endpoint)
          modulePath = './api/products/index';
        } else if (apiPath.startsWith('products/')) {
          // /api/products/some-id (detail endpoint)
          const id = apiPath.replace('products/', '');
          modulePath = './api/products/[id]';
          url.searchParams.set('id', id);
        } else if (apiPath.startsWith('orders/')) {
          // /api/orders/* (consolidated orders endpoint)
          modulePath = './api/orders/index';
          const orderAction = apiPath.replace('orders/', '');
          if (orderAction && orderAction !== 'index') {
            url.searchParams.set('action', orderAction);
          }
        } else if (apiPath.startsWith('users/')) {
          modulePath = './api/users/profile';
        } else {
          return next();
        }

        // Import and execute handler
        const { register } = await import('tsx/esm/api');
        const unregister = register();
        
        try {
          const module = await import(modulePath + '.ts');
          const handler = module.default;

          // Mock Vercel request/response
          const vercelReq = {
            query: Object.fromEntries(url.searchParams),
            body: await new Promise((resolve) => {
              let body = '';
              req.on('data', (chunk: Buffer) => body += chunk);
              req.on('end', () => {
                try {
                  resolve(body ? JSON.parse(body) : {});
                } catch {
                  resolve({});
                }
              });
            }),
            headers: req.headers,
            method: req.method,
            url: req.url
          };

          const vercelRes = {
            status: (code: number) => {
              res.statusCode = code;
              return vercelRes;
            },
            setHeader: (name: string, value: string) => {
              res.setHeader(name, value);
              return vercelRes;
            },
            json: (data: any) => {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(data));
              return vercelRes;
            },
            send: (data: any) => {
              res.end(data);
              return vercelRes;
            },
            end: () => {
              res.end();
              return vercelRes;
            }
          };

          await handler(vercelReq, vercelRes);
        } finally {
          unregister();
        }
      } catch (error) {
        console.error('API Error:', error);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.end(JSON.stringify({ error: 'Internal server error', message: errorMessage }));
      }
    });
  }
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(), 
    mode === "development" && componentTagger(),
    mode === "development" && apiPlugin()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
