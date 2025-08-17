import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useNavigate } from 'react-router-dom'
import { Upload, FileText, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { fileApi } from '../lib/api'

export function FileScanCard() {
  const [isUploading, setIsUploading] = useState(false)
  const navigate = useNavigate()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    
    // Check file size (25MB limit)
    if (file.size > 25 * 1024 * 1024) {
      toast.error('File size must be less than 25MB')
      return
    }

    setIsUploading(true)
    
    try {
      const result = await fileApi.scan(file)
      toast.success('File analysis completed!')
      navigate(`/file/${result.id}`)
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to analyze file. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }, [navigate])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'application/zip': ['.zip'],
      'application/x-rar-compressed': ['.rar'],
      'application/x-7z-compressed': ['.7z'],
      'text/javascript': ['.js'],
      'text/x-python': ['.py'],
      'application/java-archive': ['.jar'],
      'application/vnd.android.package-archive': ['.apk'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/gif': ['.gif'],
      'text/plain': ['.txt'],
      'application/x-msdownload': ['.exe'],
      'application/x-msi': ['.msi'],
      'application/vnd.debian.binary-package': ['.deb'],
      'application/x-rpm': ['.rpm'],
      'application/vnd.ms-word.document.macroEnabled.12': ['.docm'],
      'application/vnd.ms-excel.sheet.macroEnabled.12': ['.xlsm'],
    },
    maxFiles: 1,
    disabled: isUploading,
  })

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">File Security Analysis</h2>
        <p className="text-muted-foreground">
          Upload a file to analyze it for security risks and generate hashes
        </p>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50'
        } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        
        {isUploading ? (
          <div className="space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary animate-pulse" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-lg font-medium text-primary">🔍 Analyzing file...</p>
              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                <span className="animate-pulse">•</span>
                <span>Calculating hashes</span>
                <span className="animate-pulse">•</span>
                <span>Detecting threats</span>
                <span className="animate-pulse">•</span>
                <span>Generating report</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <Upload className={`h-16 w-16 mx-auto transition-all duration-300 ${
                isDragActive ? 'text-primary scale-110' : 'text-muted-foreground hover:text-primary'
              }`} />
              {isDragActive && (
                <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping"></div>
              )}
            </div>
            <div>
              <p className="text-xl font-medium">
                {isDragActive ? '🎯 Drop the file here!' : '📁 Drag & drop a file here'}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                or <span className="text-primary font-medium">click to browse</span>
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 space-y-4">
        <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
          <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-sm">
            <p className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              📋 Supported File Types
            </p>
            <div className="grid grid-cols-2 gap-1 text-xs text-blue-700 dark:text-blue-300">
              <span>• PDF Documents</span>
              <span>• Office Files</span>
              <span>• Archives (ZIP, RAR)</span>
              <span>• Executables</span>
              <span>• Scripts (JS, Python)</span>
              <span>• Images & More</span>
            </div>
          </div>
        </div>

        <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200/50 dark:border-green-800/50">
          <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg">
            <AlertCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="text-sm">
            <p className="font-semibold text-green-900 dark:text-green-100 mb-1">
              🛡️ 100% Safe Analysis
            </p>
            <p className="text-green-700 dark:text-green-300">
              Files are <strong>never executed</strong>. We only analyze file data for maximum security.
            </p>
          </div>
        </div>

        <div className="text-xs text-muted-foreground text-center">
          Maximum file size: 25MB • Files are automatically deleted after 24 hours
        </div>
      </div>
    </div>
  )
}
