import { ReactNode, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Shield, FileText, Globe, Github, User, LogOut, LogIn } from 'lucide-react'

interface LayoutProps {
  children: ReactNode
}

interface User {
  id: string
  email: string
}

export function Layout({ children }: LayoutProps) {
  const [user, setUser] = useState<User | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (token && userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">Vulnerability Scanner</span>
            </Link>
            
            <nav className="flex items-center space-x-6">
              <Link 
                to="/" 
                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <FileText className="h-4 w-4" />
                <span>File Scan</span>
              </Link>
              <Link 
                to="/" 
                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Globe className="h-4 w-4" />
                <span>URL Check</span>
              </Link>
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="h-4 w-4" />
                <span>GitHub</span>
              </a>
              
              {/* Authentication Section */}
              <div className="flex items-center space-x-4 ml-4 pl-4 border-l">
                {user ? (
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2 text-sm">
                      <User className="h-4 w-4 text-primary" />
                      <span className="text-foreground">{user.email}</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-1 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <Link 
                      to="/login"
                      className="flex items-center space-x-1 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <LogIn className="h-4 w-4" />
                      <span>Login</span>
                    </Link>
                    <Link 
                      to="/signup"
                      className="bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
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
