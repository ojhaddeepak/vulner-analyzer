import { ReactNode, useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Shield, Lock } from 'lucide-react'
import { authService } from '../lib/auth'

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    // Use authService to check authentication status
    const isAuth = authService.isAuthenticated()
    setIsAuthenticated(isAuth)
  }, [])

  // Loading state
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Authenticated - render children
  return <>{children}</>
}

export function AuthPrompt() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-card border rounded-xl shadow-lg p-8">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary/10 rounded-full">
              <Lock className="h-12 w-12 text-primary" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="text-muted-foreground mb-6">
            Please sign in to access the vulnerability scanner and upload files for analysis.
          </p>
          
          <div className="space-y-3">
            <a
              href="/login"
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2"
            >
              <Shield className="h-4 w-4" />
              <span>Sign In</span>
            </a>
            
            <a
              href="/signup"
              className="w-full border border-primary text-primary py-3 rounded-lg font-medium hover:bg-primary/5 transition-colors flex items-center justify-center"
            >
              Create Account
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
