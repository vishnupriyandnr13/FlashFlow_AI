import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Server-side health endpoint for frontend host
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'FlashGuard Frontend Host',
    runtime: `Node.js ${process.version}`,
    intendedBackend: 'FastAPI',
    fastApiUrl: process.env.VITE_API_BASE_URL || 'http://localhost:8000',
    timestamp: new Date().toISOString(),
  });
});

// Server-side configuration endpoint
app.get('/api/config', (req, res) => {
  res.json({
    apiBaseUrl: process.env.VITE_API_BASE_URL || 'http://localhost:8000',
    demoModeDefault: process.env.VITE_DEFAULT_DEMO_MODE !== 'false',
    supportedEndpoints: [
      'GET /api/v1/products',
      'GET /api/v1/products/:id',
      'GET /api/v1/campaigns',
      'GET /api/v1/campaigns/:id',
      'GET /api/v1/orders/:id',
      'GET /api/v1/health'
    ]
  });
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FlashGuard frontend server listening on port ${PORT}`);
  });
}

startServer();
