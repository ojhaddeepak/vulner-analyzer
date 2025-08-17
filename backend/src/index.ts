import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { fileScanRoutes } from './routes/fileScan';
import { urlCheckRoutes } from './routes/urlCheck';
import { authRoutes } from './routes/auth';
import { setupSwagger } from './utils/swagger';
import { logger } from './utils/logger';
import cron from 'node-cron';
import { cleanupUploads } from './utils/cleanup';

const app = express();
const prisma = new PrismaClient();

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.1.0',
    info: {
      title: 'Vulnerability Scanner API',
      version: '1.0.0',
      description: 'API for file analysis and URL phishing detection',
    },
    servers: [
      {
        url: 'http://localhost:8000',
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const fileScanLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
  max: parseInt(process.env.RATE_LIMIT_FILES || '5'),
  message: 'Too many file scan requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const urlCheckLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
  max: parseInt(process.env.RATE_LIMIT_URLS || '20'),
  message: 'Too many URL check requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Routes
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/files', fileScanLimiter, fileScanRoutes);
app.use('/api/urls', urlCheckLimiter, urlCheckRoutes);

// Error handling
app.use(errorHandler);

// Cleanup cron job (run every hour)
cron.schedule('0 * * * *', async () => {
  try {
    await cleanupUploads();
    logger.info('Upload cleanup completed');
  } catch (error) {
    logger.error('Upload cleanup failed:', error);
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

const PORT = process.env.PORT || 8000;

// For Vercel serverless deployment
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`API documentation available at http://localhost:${PORT}/api/docs`);
  });
}

// Export for Vercel
export default app;
