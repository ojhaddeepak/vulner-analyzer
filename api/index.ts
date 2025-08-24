import { VercelRequest, VercelResponse } from '@vercel/node';

// Simple serverless function handler
export default function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Basic routing based on URL path
  const { url } = req;

  if (url === '/api' || url === '/api/') {
    return res.json({
      message: 'Vulnerability Scanner API is running',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      status: 'ok'
    });
  }

  if (url === '/api/health' || url?.startsWith('/api/health')) {
    return res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: 'production'
    });
  }

  // Default response for unmatched routes
  res.status(404).json({
    error: 'Not Found',
    message: 'API endpoint not found',
    timestamp: new Date().toISOString()
  });
}
