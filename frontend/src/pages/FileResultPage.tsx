import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Copy, Download, FileText, AlertTriangle, CheckCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { fileApi, FileScanResult } from '../lib/api'
import { formatFileSize, copyToClipboard, getRiskLevelColor } from '../lib/utils'
import { RiskMeter } from '../components/RiskMeter'
import { SignalsList } from '../components/SignalsList'

export function FileResultPage() {
  const { id } = useParams<{ id: string }>()
  const [result, setResult] = useState<FileScanResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    const fetchResult = async () => {
      try {
        const data = await fileApi.getResult(id)
        setResult(data)
      } catch (err) {
        setError('Failed to load analysis result')
        console.error('Error fetching result:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchResult()
  }, [id])

  const handleCopyHash = async (hash: string, type: string) => {
    try {
      await copyToClipboard(hash)
      toast.success(`${type} hash copied to clipboard`)
    } catch (err) {
      toast.error('Failed to copy hash')
    }
  }

  const handleDownloadReport = () => {
    if (!result) return

    const report = {
      id: result.id,
      fileName: result.metadata.fileName,
      analysisDate: result.createdAt || new Date().toISOString(),
      hashes: result.hashes,
      metadata: result.metadata,
      riskScore: result.riskScore,
      riskLevel: result.riskLevel,
      signals: result.signals,
      nextSteps: result.nextSteps,
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `file-analysis-${result.id}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3">Loading analysis result...</span>
        </div>
      </div>
    )
  }

  if (error || !result) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Result</h2>
          <p className="text-muted-foreground mb-4">{error || 'Analysis result not found'}</p>
          <Link
            to="/"
            className="inline-flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Scanner</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Scanner</span>
        </Link>
      </div>

      <div className="bg-card border rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">File Analysis Result</h1>
            <p className="text-muted-foreground">{result.metadata.fileName}</p>
          </div>
          <button
            onClick={handleDownloadReport}
            className="flex items-center space-x-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/80 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Download Report</span>
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="font-semibold mb-3">File Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Size:</span>
                <span>{formatFileSize(result.metadata.size)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <span>{result.metadata.mimeType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Extension:</span>
                <span>{result.metadata.extension}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Risk Assessment</h3>
            <div className="space-y-3">
              <RiskMeter score={result.riskScore} />
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Risk Level:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(result.riskLevel)}`}>
                  {result.riskLevel}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold mb-3">File Hashes</h3>
          <div className="grid gap-3">
            {Object.entries(result.hashes).map(([type, hash]) => (
              <div key={type} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <span className="text-sm font-medium uppercase">{type}</span>
                  <p className="text-xs text-muted-foreground font-mono break-all">{hash}</p>
                </div>
                <button
                  onClick={() => handleCopyHash(hash, type.toUpperCase())}
                  className="flex items-center space-x-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Copy className="h-4 w-4" />
                  <span className="text-xs">Copy</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        <SignalsList signals={result.signals} title="Security Signals" />
      </div>

      <div className="bg-card border rounded-lg p-6">
        <h3 className="font-semibold mb-4">Recommended Next Steps</h3>
        <div className="space-y-3">
          {result.nextSteps.map((step, index) => (
            <div key={index} className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
