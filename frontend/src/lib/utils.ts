import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text)
}

export function getRiskLevelColor(riskLevel: string): string {
  switch (riskLevel.toUpperCase()) {
    case 'LOW':
      return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400'
    case 'MEDIUM':
      return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-400'
    case 'HIGH':
      return 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-400'
    case 'CRITICAL':
      return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400'
    default:
      return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-400'
  }
}

export function getClassificationColor(classification: string): string {
  switch (classification.toUpperCase()) {
    case 'LIKELY_GENUINE':
      return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400'
    case 'SUSPICIOUS':
      return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400'
    case 'UNKNOWN':
      return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-400'
    default:
      return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-400'
  }
}
