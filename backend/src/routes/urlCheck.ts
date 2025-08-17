import { Router } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { UrlAnalyzer } from '../utils/urlAnalysis';
import { createError } from '../middleware/errorHandler';
import { authenticateToken } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const urlCheckSchema = z.object({
  url: z.string().url('Invalid URL format'),
});

const urlCheckQuerySchema = z.object({
  id: z.string().cuid(),
});

/**
 * @swagger
 * /api/urls/check:
 *   post:
 *     summary: Check URL for phishing indicators
 *     description: Analyze a URL for potential phishing or malicious indicators
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *             properties:
 *               url:
 *                 type: string
 *                 format: uri
 *                 description: URL to analyze
 *     responses:
 *       200:
 *         description: URL analysis completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 normalizedUrl:
 *                   type: string
 *                 domain:
 *                   type: string
 *                 classification:
 *                   type: string
 *                   enum: [LIKELY_GENUINE, SUSPICIOUS, UNKNOWN]
 *                 confidence:
 *                   type: integer
 *                   minimum: 0
 *                   maximum: 100
 *                 score:
 *                   type: integer
 *                   minimum: 0
 *                   maximum: 100
 *                 reasons:
 *                   type: array
 *                   items:
 *                     type: object
 *                 tips:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         description: Invalid URL format
 */
router.post('/check', authenticateToken, async (req, res, next) => {
  try {
    const { url } = urlCheckSchema.parse(req.body);

    logger.info(`Analyzing URL: ${url}`);

    // Analyze the URL
    const analysisResult = await UrlAnalyzer.analyzeUrl(url);

    // Store result in database
    const urlCheck = await prisma.urlCheck.create({
      data: {
        url: url,
        normalizedUrl: analysisResult.normalizedUrl,
        domain: analysisResult.domain,
        classification: analysisResult.classification,
        confidence: analysisResult.confidence,
        score: analysisResult.score,
        reasonsJson: JSON.stringify(analysisResult.reasons),
        tipsJson: JSON.stringify(analysisResult.tips),
        metadataJson: JSON.stringify(analysisResult.metadata),
      },
    });

    logger.info(`URL analysis completed: ${urlCheck.id}, Classification: ${analysisResult.classification}`);

    res.json({
      id: urlCheck.id,
      normalizedUrl: analysisResult.normalizedUrl,
      domain: analysisResult.domain,
      classification: analysisResult.classification,
      confidence: analysisResult.confidence,
      score: analysisResult.score,
      reasons: analysisResult.reasons,
      tips: analysisResult.tips,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/urls/{id}:
 *   get:
 *     summary: Get URL check result by ID
 *     description: Retrieve the analysis results for a previously checked URL
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: URL check ID
 *     responses:
 *       200:
 *         description: URL check result retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 normalizedUrl:
 *                   type: string
 *                 domain:
 *                   type: string
 *                 classification:
 *                   type: string
 *                 confidence:
 *                   type: integer
 *                 score:
 *                   type: integer
 *                 reasons:
 *                   type: array
 *                 tips:
 *                   type: array
 *       404:
 *         description: URL check not found
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = urlCheckQuerySchema.parse(req.params);

    const urlCheck = await prisma.urlCheck.findUnique({
      where: { id },
    });

    if (!urlCheck) {
      throw createError('URL check not found', 404);
    }

    res.json({
      id: urlCheck.id,
      normalizedUrl: urlCheck.normalizedUrl,
      domain: urlCheck.domain,
      classification: urlCheck.classification,
      confidence: urlCheck.confidence,
      score: urlCheck.score,
      reasons: JSON.parse(urlCheck.reasonsJson),
      tips: JSON.parse(urlCheck.tipsJson),
      createdAt: urlCheck.createdAt,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/urls/{id}:
 *   delete:
 *     summary: Delete URL check result
 *     description: Delete a URL check result
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: URL check ID
 *     responses:
 *       200:
 *         description: URL check deleted successfully
 *       404:
 *         description: URL check not found
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = urlCheckQuerySchema.parse(req.params);

    const urlCheck = await prisma.urlCheck.findUnique({
      where: { id },
    });

    if (!urlCheck) {
      throw createError('URL check not found', 404);
    }

    // Delete from database
    await prisma.urlCheck.delete({
      where: { id },
    });

    res.json({ message: 'URL check deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export { router as urlCheckRoutes };
