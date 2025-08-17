import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for adding auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

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

export const fileApi = {
  scan: async (file: File): Promise<FileScanResult> => {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await api.post('/api/files/scan', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  getResult: async (id: string): Promise<FileScanResult> => {
    const response = await api.get(`/api/files/${id}`)
    return response.data
  },

  deleteResult: async (id: string): Promise<void> => {
    await api.delete(`/api/files/${id}`)
  },
}

export const urlApi = {
  check: async (url: string): Promise<UrlCheckResult> => {
    const response = await api.post('/api/urls/check', { url })
    return response.data
  },

  getResult: async (id: string): Promise<UrlCheckResult> => {
    const response = await api.get(`/api/urls/${id}`)
    return response.data
  },

  deleteResult: async (id: string): Promise<void> => {
    await api.delete(`/api/urls/${id}`)
  },
}

export const authApi = {
  register: async (email: string, password: string) => {
    const response = await api.post('/api/auth/register', { email, password })
    return response.data
  },

  login: async (email: string, password: string) => {
    const response = await api.post('/api/auth/login', { email, password })
    return response.data
  },
}
