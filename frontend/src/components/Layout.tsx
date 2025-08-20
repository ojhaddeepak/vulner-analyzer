import { ReactNode, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Shield, FileText, Globe, Github, User as UserIcon, LogOut, LogIn } from 'lucide-react'
import { authService, type User } from '../lib/auth'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const [user, setUser] = useState<User | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Get current user from authService
    const currentUser = authService.getCurrentUser()
    setUser(currentUser)
  }, [])

  const handleLogout = () => {
    authService.logout()
    setUser(null)
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-background dark:bg-slate-900">
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">Vulnerability Scanner</span>
            </Link>
            
            <nav className="flex items-center space-x-6">
              <Link 
                to="/" 
                className="flex items-center space-x-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <FileText className="h-4 w-4" />
                <span>File Scan</span>
              </Link>
              <Link 
                to="/" 
                className="flex items-center space-x-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <Globe className="h-4 w-4" />
                <span>URL Check</span>
              </Link>
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <Github className="h-4 w-4" />
                <span>GitHub</span>
              </a>
              
              {/* Authentication Section */}
              <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-slate-200 dark:border-slate-600">
                {user ? (
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2 text-sm">
                      <UserIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-slate-700 dark:text-slate-200">{user.email}</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-1 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <Link 
                      to="/login"
                      className="flex items-center space-x-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      <LogIn className="h-4 w-4" />
                      <span>Login</span>
                    </Link>
                    <Link 
                      to="/signup"
                      className="bg-blue-600 dark:bg-blue-500 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="border-t py-8 mt-auto">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p className="text-sm">
            This tool provides guidance only and is not a definitive security verdict. 
            Always use multiple tools and human judgment for critical security decisions.
          </p>
          <p className="text-xs mt-2">
            © 2024 Vulnerability Scanner. MIT License.
          </p>
        </div>
      </footer>
    </div>
  )
}
