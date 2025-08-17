import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Download, Globe, AlertTriangle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { urlApi, UrlCheckResult } from '../lib/api'
import { copyToClipboard, getClassificationColor } from '../lib/utils'
import { RiskMeter } from '../components/RiskMeter'
import { SignalsList } from '../components/SignalsList'

export function UrlResultPage() {
  const { id } = useParams<{ id: string }>()
  const [result, setResult] = useState<UrlCheckResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    const fetchResult = async () => {
      try {
        const data = await urlApi.getResult(id)
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
            <h1 className="text-2xl font-bold mb-2">URL Analysis Result</h1>
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="font-mono text-sm">{result.normalizedUrl}</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="font-semibold mb-3">URL Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Domain:</span>
                <span className="font-mono">{result.domain}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Classification:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getClassificationColor(result.classification)}`}>
                  {result.classification.replace('_', ' ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Confidence:</span>
                <span>{result.confidence}%</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Risk Assessment</h3>
            <div className="space-y-3">
              <RiskMeter score={result.score} />
            </div>
          </div>
        </div>

        <SignalsList signals={result.reasons} title="Analysis Reasons" />
      </div>

      <div className="bg-card border rounded-lg p-6">
        <h3 className="font-semibold mb-4">Safety Tips</h3>
        <div className="space-y-3">
          {result.tips.map((tip, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0">•</div>
              <p className="text-sm">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

