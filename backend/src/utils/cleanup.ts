import fs from 'fs-extra';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

const prisma = new PrismaClient();

export async function cleanupUploads(): Promise<void> {
  const uploadDir = process.env.UPLOAD_DIR || './uploads';
  const retentionHours = 24; // Keep files for 24 hours
  const cutoffTime = new Date(Date.now() - retentionHours * 60 * 60 * 1000);

  try {
    // Clean up old file scan records
    const deletedScans = await prisma.fileScan.deleteMany({
      where: {
        createdAt: {
          lt: cutoffTime
        }
      }
    });

    logger.info(`Deleted ${deletedScans.count} old file scan records`);

    // Clean up old URL check records
    const deletedUrls = await prisma.urlCheck.deleteMany({
      where: {
        createdAt: {
          lt: cutoffTime
        }
      }
    });

    logger.info(`Deleted ${deletedUrls.count} old URL check records`);

    // Clean up old files from filesystem
    if (await fs.pathExists(uploadDir)) {
      const files = await fs.readdir(uploadDir);
      
      for (const file of files) {
        const filePath = path.join(uploadDir, file);
        const stats = await fs.stat(filePath);
        
        if (stats.isDirectory()) {
          // Check if directory is older than retention period
          if (stats.mtime < cutoffTime) {
            await fs.remove(filePath);
            logger.info(`Removed old upload directory: ${file}`);
          }
        }
      }
    }
  } catch (error) {
    logger.error('Error during cleanup:', error);
    throw error;
  }
}
