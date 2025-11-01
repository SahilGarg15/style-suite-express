import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Helper to convert Vercel functions to Express routes
const wrapVercelFunction = (fn) => async (req, res) => {
  try {
    // Mock Vercel request/response objects
    const vercelReq = {
      ...req,
      query: req.query,
      body: req.body,
      headers: req.headers,
      method: req.method,
      url: req.url
    };
    
    const vercelRes = {
      status: (code) => {
        res.status(code);
        return vercelRes;
      },
      json: (data) => {
        res.json(data);
        return vercelRes;
      },
      send: (data) => {
        res.send(data);
        return vercelRes;
      }
    };
    
    await fn(vercelReq, vercelRes);
  } catch (error) {
    console.error('Error in API route:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
};

// Import API routes dynamically
const importAPI = async (path) => {
  try {
    const module = await import(`./api/${path}.ts`);
    return module.default;
  } catch (error) {
    console.error(`Failed to import api/${path}.ts:`, error.message);
    return null;
  }
};

// Setup routes
const setupRoutes = async () => {
  // Auth routes
  const signup = await importAPI('auth/signup');
  const login = await importAPI('auth/login');
  
  if (signup) app.post('/api/auth/signup', wrapVercelFunction(signup));
  if (login) app.post('/api/auth/login', wrapVercelFunction(login));
  
  // Product routes
  const products = await importAPI('products/index');
  const productDetail = await importAPI('products/[id]');
  
  if (products) app.get('/api/products', wrapVercelFunction(products));
  if (productDetail) {
    app.get('/api/products/:id', async (req, res) => {
      const handler = wrapVercelFunction(productDetail);
      req.query = { ...req.query, id: req.params.id };
      await handler(req, res);
    });
  }
  
  // Order routes
  const createOrder = await importAPI('orders/create');
  const myOrders = await importAPI('orders/my-orders');
  const trackOrder = await importAPI('orders/track');
  
  if (createOrder) app.post('/api/orders', wrapVercelFunction(createOrder));
  if (myOrders) app.get('/api/orders/my-orders', wrapVercelFunction(myOrders));
  if (trackOrder) app.get('/api/orders/track', wrapVercelFunction(trackOrder));
  
  // User routes
  const profile = await importAPI('users/profile');
  
  if (profile) {
    app.get('/api/users/profile', wrapVercelFunction(profile));
    app.put('/api/users/profile', wrapVercelFunction(profile));
  }
};

// Start server
const PORT = 3001;

setupRoutes().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🚀 Test server running on http://localhost:${PORT}`);
    console.log(`\n📍 Available endpoints:`);
    console.log(`   POST /api/auth/signup`);
    console.log(`   POST /api/auth/login`);
    console.log(`   GET  /api/products`);
    console.log(`   GET  /api/products/:id`);
    console.log(`   POST /api/orders`);
    console.log(`   GET  /api/orders/my-orders`);
    console.log(`   GET  /api/orders/track`);
    console.log(`   GET  /api/users/profile`);
    console.log(`   PUT  /api/users/profile`);
    console.log(`\n✅ Ready for testing!\n`);
  });
});
