import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { Search, Globe, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { urlApi } from '../lib/api'

const urlSchema = z.object({
  url: z.string().url('Please enter a valid URL'),
})

type UrlFormData = z.infer<typeof urlSchema>

export function UrlCheckCard() {
  const [isChecking, setIsChecking] = useState(false)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UrlFormData>({
    resolver: zodResolver(urlSchema),
  })

  const onSubmit = async (data: UrlFormData) => {
    setIsChecking(true)
    
    try {
      const result = await urlApi.check(data.url)
      toast.success('URL analysis completed!')
      navigate(`/url/${result.id}`)
    } catch (error) {
      console.error('URL check error:', error)
      toast.error('Failed to analyze URL. Please try again.')
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">URL Phishing Detection</h2>
        <p className="text-muted-foreground">
          Check URLs for phishing indicators and security risks
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="url" className="block text-sm font-medium mb-2">
            Enter URL to analyze
          </label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              {...register('url')}
              type="url"
              id="url"
              placeholder="https://example.com"
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              disabled={isChecking}
            />
          </div>
          {errors.url && (
            <p className="text-sm text-red-600 mt-1">{errors.url.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isChecking}
          className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isChecking ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Analyzing URL...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <Search className="h-4 w-4" />
              <span>Check URL</span>
            </div>
          )}
        </button>
      </form>

      <div className="mt-6 space-y-4">
        <div className="flex items-start space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
              What we check
            </p>
            <p className="text-blue-700 dark:text-blue-300">
              SSL/TLS certificates, domain age, DNS records, URL patterns, and content analysis
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-yellow-900 dark:text-yellow-100 mb-1">
              Safe Analysis
            </p>
            <p className="text-yellow-700 dark:text-yellow-300">
              We fetch content safely with timeouts and size limits. No JavaScript execution.
            </p>
          </div>
        </div>

        <div className="text-xs text-muted-foreground text-center">
          Analysis results are for guidance only • Always verify with multiple sources
        </div>
      </div>
    </div>
  )
}
