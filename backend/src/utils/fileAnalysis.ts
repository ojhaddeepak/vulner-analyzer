import { createReadStream } from 'fs';
import { createHash } from 'crypto';
import { pipeline } from 'stream/promises';
const pdfParse = require('pdf-parse');
const exifParser = require('exif-parser');
import { logger } from './logger';

export interface AnalysisSignal {
  id: string;
  title: string;
  weight: number;
  why: string;
  evidence: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface FileMetadata {
  size: number;
  mimeType: string;
  extension: string;
  hashes: {
    md5: string;
    sha1: string;
    sha256: string;
  };
  [key: string]: any;
}

export interface AnalysisResult {
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  signals: AnalysisSignal[];
  metadata: FileMetadata;
  nextSteps: string[];
}

export class FileAnalyzer {
  private static readonly ALLOWED_EXTENSIONS = [
    '.pdf', '.docx', '.xlsx', '.pptx', '.zip', '.rar', '.7z',
    '.js', '.py', '.jar', '.apk', '.png', '.jpg', '.jpeg', '.gif',
    '.txt', '.exe', '.dll', '.msi', '.deb', '.rpm', '.docm', '.xlsm'
  ];

  private static readonly MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

  static async analyzeFile(filePath: string, originalName: string): Promise<AnalysisResult> {
    const extension = this.getFileExtension(originalName);
    
    if (!this.ALLOWED_EXTENSIONS.includes(extension.toLowerCase())) {
      throw new Error(`File type not allowed: ${extension}`);
    }

    const metadata = await this.extractMetadata(filePath, originalName);
    const signals: AnalysisSignal[] = [];

    // Perform file-specific analysis
    switch (extension.toLowerCase()) {
      case '.pdf':
        signals.push(...await this.analyzePdf(filePath));
        break;
      case '.docx':
      case '.docm':
      case '.xlsx':
      case '.xlsm':
      case '.pptx':
        signals.push(...await this.analyzeOfficeDocument(filePath, extension));
        break;
      case '.zip':
      case '.rar':
      case '.7z':
        signals.push(...await this.analyzeArchive(filePath));
        break;
      case '.js':
      case '.py':
        signals.push(...await this.analyzeScript(filePath, extension));
        break;
      case '.exe':
      case '.dll':
      case '.msi':
        signals.push(...await this.analyzeExecutable(filePath));
        break;
      case '.apk':
        signals.push(...await this.analyzeApk(filePath));
        break;
      case '.jar':
        signals.push(...await this.analyzeJar(filePath));
        break;
      case '.png':
      case '.jpg':
      case '.jpeg':
      case '.gif':
        signals.push(...await this.analyzeImage(filePath));
        break;
    }

    // Calculate risk score
    const riskScore = this.calculateRiskScore(signals);
    const riskLevel = this.determineRiskLevel(riskScore);
    const nextSteps = this.generateNextSteps(signals, riskLevel);

    return {
      riskScore,
      riskLevel,
      signals,
      metadata,
      nextSteps,
    };
  }

  private static async extractMetadata(filePath: string, originalName: string): Promise<FileMetadata> {
    const fs = await import('fs/promises');
    const stats = await fs.stat(filePath);
    
    const hashes = await this.calculateHashes(filePath);
    const mimeType = await this.detectMimeType(filePath);
    const extension = this.getFileExtension(originalName);

    return {
      size: stats.size,
      mimeType,
      extension,
      hashes,
      originalName,
    };
  }

  private static async calculateHashes(filePath: string): Promise<{ md5: string; sha1: string; sha256: string }> {
    const md5Hash = createHash('md5');
    const sha1Hash = createHash('sha1');
    const sha256Hash = createHash('sha256');

    const stream = createReadStream(filePath);
    
    await pipeline(stream, async function* (source) {
      for await (const chunk of source) {
        md5Hash.update(chunk);
        sha1Hash.update(chunk);
        sha256Hash.update(chunk);
        yield chunk;
      }
    });

    return {
      md5: md5Hash.digest('hex'),
      sha1: sha1Hash.digest('hex'),
      sha256: sha256Hash.digest('hex'),
    };
  }

  private static async detectMimeType(filePath: string): Promise<string> {
    const mime = await import('mime-types');
    const detected = mime.lookup(filePath);
    return detected || 'application/octet-stream';
  }

  private static getFileExtension(filename: string): string {
    const lastDotIndex = filename.lastIndexOf('.');
    return lastDotIndex !== -1 ? filename.substring(lastDotIndex) : '';
  }

  private static async analyzePdf(filePath: string): Promise<AnalysisSignal[]> {
    const signals: AnalysisSignal[] = [];
    
    try {
      const fs = await import('fs/promises');
      const buffer = await fs.readFile(filePath);
      const data = await pdfParse(buffer);
      
      // Check for JavaScript actions
      if (data.text.includes('/JS') || data.text.includes('/JavaScript')) {
        signals.push({
          id: 'pdf_js_detected',
          title: 'JavaScript detected in PDF',
          weight: 30,
          why: 'PDFs with JavaScript can execute code and may be malicious',
          evidence: 'Found JavaScript references in PDF content',
          riskLevel: 'MEDIUM',
        });
      }

      // Check for embedded files
      if (data.text.includes('/EmbeddedFile') || data.text.includes('/F')) {
        signals.push({
          id: 'pdf_embedded_files',
          title: 'Embedded files detected',
          weight: 20,
          why: 'PDFs with embedded files may contain malicious content',
          evidence: 'Found embedded file references in PDF',
          riskLevel: 'LOW',
        });
      }

      // Check for suspicious actions
      if (data.text.includes('/OpenAction') || data.text.includes('/Launch')) {
        signals.push({
          id: 'pdf_suspicious_actions',
          title: 'Suspicious actions detected',
          weight: 40,
          why: 'PDFs with automatic actions can be dangerous',
          evidence: 'Found OpenAction or Launch references',
          riskLevel: 'HIGH',
        });
      }
    } catch (error) {
      logger.error('Error analyzing PDF:', error);
    }

    return signals;
  }

  private static async analyzeOfficeDocument(filePath: string, extension: string): Promise<AnalysisSignal[]> {
    const signals: AnalysisSignal[] = [];
    
    try {
      const fs = await import('fs/promises');
      const buffer = await fs.readFile(filePath);
      
      // Check for macro indicators
      const bufferString = buffer.toString('binary');
      if (bufferString.includes('vbaProject.bin') || bufferString.includes('VBA')) {
        signals.push({
          id: 'office_macro_detected',
          title: 'Macro detected in Office document',
          weight: 60,
          why: 'Office documents with macros can execute malicious code',
          evidence: 'Found VBA project or macro indicators',
          riskLevel: 'HIGH',
        });
      }

      // Check for macro-enabled extensions
      if (extension.toLowerCase().includes('m')) {
        signals.push({
          id: 'office_macro_enabled',
          title: 'Macro-enabled document format',
          weight: 40,
          why: 'Macro-enabled formats can contain executable code',
          evidence: `File extension indicates macro support: ${extension}`,
          riskLevel: 'MEDIUM',
        });
      }
    } catch (error) {
      logger.error('Error analyzing Office document:', error);
    }

    return signals;
  }

  private static async analyzeArchive(filePath: string): Promise<AnalysisSignal[]> {
    const signals: AnalysisSignal[] = [];
    
    try {
      const fs = await import('fs/promises');
      
      // For now, we'll do basic analysis
      // In a real implementation, you'd want to list archive contents safely
      const stats = await fs.stat(filePath);
      
      if (stats.size > 10 * 1024 * 1024) { // 10MB
        signals.push({
          id: 'archive_large_size',
          title: 'Large archive file',
          weight: 15,
          why: 'Large archives may contain many files or large executables',
          evidence: `Archive size: ${Math.round(stats.size / 1024 / 1024)}MB`,
          riskLevel: 'LOW',
        });
      }
    } catch (error) {
      logger.error('Error analyzing archive:', error);
    }

    return signals;
  }

  private static async analyzeScript(filePath: string, extension: string): Promise<AnalysisSignal[]> {
    const signals: AnalysisSignal[] = [];
    
    try {
      const fs = await import('fs/promises');
      const content = await fs.readFile(filePath, 'utf-8');
      
      // Check for obfuscation
      if (content.includes('eval(') || content.includes('Function(')) {
        signals.push({
          id: 'script_obfuscation',
          title: 'Potential code obfuscation detected',
          weight: 50,
          why: 'Obfuscated code can hide malicious functionality',
          evidence: 'Found eval() or Function() calls',
          riskLevel: 'HIGH',
        });
      }

      // Check for very long lines
      const lines = content.split('\n');
      const longLines = lines.filter(line => line.length > 1000);
      if (longLines.length > 0) {
        signals.push({
          id: 'script_long_lines',
          title: 'Very long lines detected',
          weight: 25,
          why: 'Very long lines may indicate obfuscated or encoded content',
          evidence: `Found ${longLines.length} lines longer than 1000 characters`,
          riskLevel: 'MEDIUM',
        });
      }

      // Check for base64 content
      const base64Pattern = /[A-Za-z0-9+/]{50,}={0,2}/g;
      if (base64Pattern.test(content)) {
        signals.push({
          id: 'script_base64',
          title: 'Base64 encoded content detected',
          weight: 30,
          why: 'Base64 encoded content may hide malicious payloads',
          evidence: 'Found potential Base64 encoded strings',
          riskLevel: 'MEDIUM',
        });
      }
    } catch (error) {
      logger.error('Error analyzing script:', error);
    }

    return signals;
  }

  private static async analyzeExecutable(filePath: string): Promise<AnalysisSignal[]> {
    const signals: AnalysisSignal[] = [];
    
    try {
      const fs = await import('fs/promises');
      const buffer = await fs.readFile(filePath);
      
      // Check for PE header (Windows executables)
      if (buffer.length > 2 && buffer[0] === 0x4D && buffer[1] === 0x5A) {
        signals.push({
          id: 'executable_pe_header',
          title: 'Windows executable detected',
          weight: 70,
          why: 'Executable files can contain malicious code',
          evidence: 'Found PE header (MZ signature)',
          riskLevel: 'HIGH',
        });
      }

      // Check file size
      if (buffer.length < 1024) {
        signals.push({
          id: 'executable_small_size',
          title: 'Unusually small executable',
          weight: 20,
          why: 'Very small executables may be suspicious',
          evidence: `File size: ${buffer.length} bytes`,
          riskLevel: 'LOW',
        });
      }
    } catch (error) {
      logger.error('Error analyzing executable:', error);
    }

    return signals;
  }

  private static async analyzeApk(filePath: string): Promise<AnalysisSignal[]> {
    const signals: AnalysisSignal[] = [];
    
    try {
      const fs = await import('fs/promises');
      const buffer = await fs.readFile(filePath);
      
      // Check for APK signature
      const bufferString = buffer.toString('binary');
      if (bufferString.includes('AndroidManifest.xml')) {
        signals.push({
          id: 'apk_manifest_found',
          title: 'Android APK detected',
          weight: 60,
          why: 'APK files can contain malicious Android applications',
          evidence: 'Found AndroidManifest.xml in APK',
          riskLevel: 'HIGH',
        });
      }
    } catch (error) {
      logger.error('Error analyzing APK:', error);
    }

    return signals;
  }

  private static async analyzeJar(filePath: string): Promise<AnalysisSignal[]> {
    const signals: AnalysisSignal[] = [];
    
    try {
      const fs = await import('fs/promises');
      const buffer = await fs.readFile(filePath);
      
      // Check for JAR signature
      if (buffer.length > 4 && buffer[0] === 0x50 && buffer[1] === 0x4B) {
        signals.push({
          id: 'jar_signature_found',
          title: 'Java JAR file detected',
          weight: 50,
          why: 'JAR files can contain executable Java code',
          evidence: 'Found ZIP/JAR signature (PK)',
          riskLevel: 'MEDIUM',
        });
      }
    } catch (error) {
      logger.error('Error analyzing JAR:', error);
    }

    return signals;
  }

  private static async analyzeImage(filePath: string): Promise<AnalysisSignal[]> {
    const signals: AnalysisSignal[] = [];
    
    try {
      const fs = await import('fs/promises');
      const buffer = await fs.readFile(filePath);
      
      // Check for EXIF data
      if (buffer.length > 2 && buffer[0] === 0xFF && buffer[1] === 0xD8) {
        try {
          const parser = exifParser.create(buffer);
          const result = parser.parse();
          
          if (result.gps) {
            signals.push({
              id: 'image_gps_data',
              title: 'GPS location data found',
              weight: 10,
              why: 'Images with GPS data may reveal location information',
              evidence: 'Found GPS coordinates in EXIF data',
              riskLevel: 'LOW',
            });
          }
        } catch (exifError) {
          // EXIF parsing failed, which is normal for many images
        }
      }
    } catch (error) {
      logger.error('Error analyzing image:', error);
    }

    return signals;
  }

  private static calculateRiskScore(signals: AnalysisSignal[]): number {
    let totalScore = 0;

    for (const signal of signals) {
      totalScore += signal.weight;
    }

    // Calculate percentage based on signal weights
    const maxPossibleScore = signals.length * 100;
    const normalizedScore = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;
    
    // Cap at 100
    return Math.min(Math.round(normalizedScore), 100);
  }

  private static determineRiskLevel(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (score >= 80) return 'CRITICAL';
    if (score >= 60) return 'HIGH';
    if (score >= 30) return 'MEDIUM';
    return 'LOW';
  }

  private static generateNextSteps(signals: AnalysisSignal[], riskLevel: string): string[] {
    const nextSteps: string[] = [];

    if (riskLevel === 'CRITICAL' || riskLevel === 'HIGH') {
      nextSteps.push('Do not open or execute this file');
      nextSteps.push('Consider quarantining the file');
      nextSteps.push('Run additional antivirus scans');
    }

    if (signals.some(s => s.id.includes('macro'))) {
      nextSteps.push('Disable macros in Office applications');
      nextSteps.push('Use Office Protected View');
    }

    if (signals.some(s => s.id.includes('executable'))) {
      nextSteps.push('Verify the source of this executable');
      nextSteps.push('Check file signature and publisher');
    }

    if (nextSteps.length === 0) {
      nextSteps.push('File appears safe, but always verify the source');
      nextSteps.push('Keep your antivirus software updated');
    }

    return nextSteps;
  }
}
