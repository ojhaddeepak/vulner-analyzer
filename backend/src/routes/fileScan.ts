import { Router, Request } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { promises as fsPromises } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { FileAnalyzer } from '../utils/fileAnalysis';
import { createError } from '../middleware/errorHandler';
import { authenticateToken } from '../middleware/auth';
import { logger } from '../utils/logger';

interface FileRequest extends Request {
  fileId?: string;
}

const router = Router();
const prisma = new PrismaClient();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req: FileRequest, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    const fileId = uuidv4();
    const fileDir = path.join(uploadDir, fileId);
    
    try {
      await fsPromises.mkdir(fileDir, { recursive: true });
      req.fileId = fileId; // Store fileId for later use
      cb(null, fileDir);
    } catch (error) {
      cb(error as Error, '');
    }
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '26214400'), // 25MB
  },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = (process.env.ALLOWED_EXTENSIONS || '').split(',');
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    if (allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error(`File type not allowed: ${fileExtension}`));
    }
  },
});

// Validation schema
const fileScanQuerySchema = z.object({
  id: z.string().cuid(),
});

/**
 * @swagger
 * /api/files/scan:
 *   post:
 *     summary: Upload and analyze a file
 *     description: Upload a file for security analysis and risk assessment
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: file
 *         type: file
 *         required: true
 *         description: File to analyze
 *     responses:
 *       200:
 *         description: File analysis completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 hashes:
 *                   type: object
 *                   properties:
 *                     md5:
 *                       type: string
 *                     sha1:
 *                       type: string
 *                     sha256:
 *                       type: string
 *                 metadata:
 *                   type: object
 *                 riskScore:
 *                   type: integer
 *                   minimum: 0
 *                   maximum: 100
 *                 riskLevel:
 *                   type: string
 *                   enum: [LOW, MEDIUM, HIGH, CRITICAL]
 *                 signals:
 *                   type: array
 *                   items:
 *                     type: object
 *                 nextSteps:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         description: Invalid file or request
 *       413:
 *         description: File too large
 */
router.post('/scan', authenticateToken, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      throw createError('No file uploaded', 400);
    }

    const filePath = req.file.path;
    const originalName = req.file.originalname;
    const fileId = (req as FileRequest).fileId as string;

    logger.info(`Analyzing file: ${originalName} (${fileId})`);

    // Analyze the file
    const analysisResult = await FileAnalyzer.analyzeFile(filePath, originalName);

    // Store result in database
    const fileScan = await prisma.fileScan.create({
      data: {
        fileName: fileId,
        originalName,
        size: analysisResult.metadata.size,
        mimeType: analysisResult.metadata.mimeType,
        md5: analysisResult.metadata.hashes.md5,
        sha1: analysisResult.metadata.hashes.sha1,
        sha256: analysisResult.metadata.hashes.sha256,
        riskScore: analysisResult.riskScore,
        riskLevel: analysisResult.riskLevel,
        signalsJson: JSON.stringify(analysisResult.signals),
        metadataJson: JSON.stringify(analysisResult.metadata),
        nextStepsJson: JSON.stringify(analysisResult.nextSteps),
      },
    });

    logger.info(`File analysis completed: ${fileId}, Risk: ${analysisResult.riskLevel}`);

    res.json({
      id: fileScan.id,
      hashes: analysisResult.metadata.hashes,
      metadata: {
        fileName: originalName,
        size: analysisResult.metadata.size,
        mimeType: analysisResult.metadata.mimeType,
        extension: analysisResult.metadata.extension,
      },
      riskScore: analysisResult.riskScore,
      riskLevel: analysisResult.riskLevel,
      signals: analysisResult.signals,
      nextSteps: analysisResult.nextSteps,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/files/{id}:
 *   get:
 *     summary: Get file analysis result by ID
 *     description: Retrieve the analysis results for a previously scanned file
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: File scan ID
 *     responses:
 *       200:
 *         description: File analysis result retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 hashes:
 *                   type: object
 *                 metadata:
 *                   type: object
 *                 riskScore:
 *                   type: integer
 *                 riskLevel:
 *                   type: string
 *                 signals:
 *                   type: array
 *                 nextSteps:
 *                   type: array
 *       404:
 *         description: File scan not found
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = fileScanQuerySchema.parse(req.params);

    const fileScan = await prisma.fileScan.findUnique({
      where: { id },
    });

    if (!fileScan) {
      throw createError('File scan not found', 404);
    }

    res.json({
      id: fileScan.id,
      hashes: {
        md5: fileScan.md5,
        sha1: fileScan.sha1,
        sha256: fileScan.sha256,
      },
      metadata: {
        fileName: fileScan.originalName,
        size: fileScan.size,
        mimeType: fileScan.mimeType,
      },
      riskScore: fileScan.riskScore,
      riskLevel: fileScan.riskLevel,
      signals: JSON.parse(fileScan.signalsJson),
      nextSteps: JSON.parse(fileScan.nextStepsJson),
      createdAt: fileScan.createdAt,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/files/{id}:
 *   delete:
 *     summary: Delete file scan result
 *     description: Delete a file scan result and associated file
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: File scan ID
 *     responses:
 *       200:
 *         description: File scan deleted successfully
 *       404:
 *         description: File scan not found
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = fileScanQuerySchema.parse(req.params);

    const fileScan = await prisma.fileScan.findUnique({
      where: { id },
    });

    if (!fileScan) {
      throw createError('File scan not found', 404);
    }

    // Delete the file from filesystem
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    const fileDir = path.join(uploadDir, fileScan.fileName);
    
    try {
      await fsPromises.rm(fileDir, { recursive: true, force: true });
      logger.info(`Deleted file directory: ${fileDir}`);
    } catch (error) {
      logger.error('Error deleting file directory:', error);
    }

    // Delete from database
    await prisma.fileScan.delete({
      where: { id },
    });

    res.json({ message: 'File scan deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export { router as fileScanRoutes };
