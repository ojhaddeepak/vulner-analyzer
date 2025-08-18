// Mock API for standalone deployment without backend
const generateMockId = () => Math.random().toString(36).substr(2, 9)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export interface FileScanResult {
  id: string
  hashes: {
    md5: string
    sha1: string
    sha256: string
  }
  metadata: {
    fileName: string
    size: number
    mimeType: string
    extension: string
  }
  riskScore: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  signals: Array<{
    id: string
    title: string
    weight: number
    why: string
    evidence: string
    riskLevel: string
  }>
  nextSteps: string[]
  createdAt?: string
}

export interface UrlCheckResult {
  id: string
  normalizedUrl: string
  domain: string
  classification: 'LIKELY_GENUINE' | 'SUSPICIOUS' | 'UNKNOWN'
  confidence: number
  score: number
  reasons: Array<{
    id: string
    title: string
    weight: number
    why: string
    evidence: string
    riskLevel: string
  }>
  tips: string[]
  createdAt?: string
}

// Mock file analysis
const generateMockFileResult = (file: File): FileScanResult => {
  const riskScore = Math.floor(Math.random() * 100)
  const riskLevel = riskScore < 25 ? 'LOW' : riskScore < 50 ? 'MEDIUM' : riskScore < 75 ? 'HIGH' : 'CRITICAL'
  
  return {
    id: generateMockId(),
    hashes: {
      md5: Array.from({length: 32}, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      sha1: Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      sha256: Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join(''),
    },
    metadata: {
      fileName: file.name,
      size: file.size,
      mimeType: file.type,
      extension: file.name.split('.').pop() || '',
    },
    riskScore,
    riskLevel,
    signals: [
      {
        id: '1',
        title: 'File Type Analysis',
        weight: 20,
        why: 'Standard file type with no immediate concerns',
        evidence: `File extension: ${file.name.split('.').pop()}`,
        riskLevel: 'LOW'
      },
      {
        id: '2',
        title: 'Size Analysis',
        weight: 10,
        why: file.size > 10000000 ? 'Large file size may indicate packed content' : 'Normal file size',
        evidence: `File size: ${(file.size / 1024 / 1024).toFixed(2)} MB`,
        riskLevel: file.size > 10000000 ? 'MEDIUM' : 'LOW'
      }
    ],
    nextSteps: [
      'Review file contents manually',
      'Scan with additional antivirus tools',
      'Check file origin and source'
    ],
    createdAt: new Date().toISOString()
  }
}

// Mock URL analysis
const generateMockUrlResult = (url: string): UrlCheckResult => {
  const score = Math.floor(Math.random() * 100)
  const classification = score < 30 ? 'LIKELY_GENUINE' : score < 70 ? 'UNKNOWN' : 'SUSPICIOUS'
  const confidence = Math.floor(Math.random() * 100)
  
  return {
    id: generateMockId(),
    normalizedUrl: url,
    domain: new URL(url).hostname,
    classification,
    confidence,
    score,
    reasons: [
      {
        id: '1',
        title: 'Domain Analysis',
        weight: 30,
        why: 'Domain appears to be legitimate',
        evidence: `Domain: ${new URL(url).hostname}`,
        riskLevel: 'LOW'
      },
      {
        id: '2',
        title: 'SSL Certificate',
        weight: 25,
        why: url.startsWith('https') ? 'HTTPS connection detected' : 'No HTTPS detected',
        evidence: url.startsWith('https') ? 'Valid SSL certificate' : 'HTTP connection',
        riskLevel: url.startsWith('https') ? 'LOW' : 'MEDIUM'
      }
    ],
    tips: [
      'Always verify URLs before clicking',
      'Check for HTTPS connections',
      'Be cautious of suspicious domains'
    ],
    createdAt: new Date().toISOString()
  }
}

export const fileApi = {
  scan: async (file: File): Promise<FileScanResult> => {
    await delay(2000) // Simulate processing time
    const result = generateMockFileResult(file)
    localStorage.setItem(`file_result_${result.id}`, JSON.stringify(result))
    return result
  },

  getResult: async (id: string): Promise<FileScanResult> => {
    await delay(500)
    const cached = localStorage.getItem(`file_result_${id}`)
    if (cached) {
      return JSON.parse(cached)
    }
    throw new Error('Result not found')
  },

  deleteResult: async (id: string): Promise<void> => {
    await delay(300)
    localStorage.removeItem(`file_result_${id}`)
  },
}

export const urlApi = {
  check: async (url: string): Promise<UrlCheckResult> => {
    await delay(1500) // Simulate processing time
    const result = generateMockUrlResult(url)
    localStorage.setItem(`url_result_${result.id}`, JSON.stringify(result))
    return result
  },

  getResult: async (id: string): Promise<UrlCheckResult> => {
    await delay(500)
    const cached = localStorage.getItem(`url_result_${id}`)
    if (cached) {
      return JSON.parse(cached)
    }
    throw new Error('Result not found')
  },

  deleteResult: async (id: string): Promise<void> => {
    await delay(300)
    localStorage.removeItem(`url_result_${id}`)
  },
}
