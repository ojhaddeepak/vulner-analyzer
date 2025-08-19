import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { authService } from '../lib/auth'
import { Shield } from 'lucide-react'

export function AuthCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code')
      const state = searchParams.get('state')
      const error = searchParams.get('error')

      if (error) {
        console.error('OAuth error:', error)
        navigate('/login')
        return
      }

      if (code && state) {
        try {
          await authService.handleGitHubCallback(code, state)
          navigate('/')
        } catch (error) {
          console.error('Callback error:', error)
          navigate('/login')
        }
      } else {
        navigate('/login')
      }
    }

    handleCallback()
  }, [searchParams, navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <Shield className="h-8 w-8 text-primary animate-pulse" />
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-2">Completing Sign In...</h1>
        <p className="text-muted-foreground">Please wait while we process your authentication.</p>
        <div className="mt-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    </div>
  )
}
