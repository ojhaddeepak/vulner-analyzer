import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';
import multer from 'multer';

// Import your existing backend routes
import { authRoutes } from '../backend/src/routes/auth';
import { fileScanRoutes } from '../backend/src/routes/fileScan';
import { urlCheckRoutes } from '../backend/src/routes/urlCheck';
import { healthRoutes } from '../backend/src/routes/health';

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/files', upload.single('file'), fileScanRoutes);
app.use('/api/url', urlCheckRoutes);
app.use('/api/health', healthRoutes);

// Health check endpoint
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Vulnerability Scanner API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Export for Vercel
export default app;
