// OAuth Authentication Service
import { toast } from 'react-hot-toast'

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  provider: 'google' | 'github' | 'email'
}

class AuthService {
  private user: User | null = null

  // Google OAuth Configuration
  private googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
  
  // GitHub OAuth Configuration  
  private githubClientId = import.meta.env.VITE_GITHUB_CLIENT_ID || ''
  private githubRedirectUri = `${window.location.origin}/auth/callback`

  constructor() {
    // Check for existing session
    this.loadUserFromStorage()
  }

  private loadUserFromStorage() {
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        this.user = JSON.parse(userData)
      } catch (error) {
        localStorage.removeItem('user')
      }
    }
  }

  private saveUserToStorage(user: User) {
    this.user = user
    localStorage.setItem('user', JSON.stringify(user))
  }

  getCurrentUser(): User | null {
    return this.user
  }

  isAuthenticated(): boolean {
    return this.user !== null
  }

  // Google OAuth Login
  async loginWithGoogle(): Promise<void> {
    try {
      if (!this.googleClientId) {
        toast.error('Google OAuth not configured')
        return
      }

      // Load Google Identity Services
      await this.loadGoogleScript()
      
      return new Promise((resolve, reject) => {
        // @ts-ignore - Google Identity Services
        window.google.accounts.id.initialize({
          client_id: this.googleClientId,
          callback: (response: any) => {
            this.handleGoogleCallback(response)
              .then(() => resolve())
              .catch(reject)
          }
        })

        // @ts-ignore
        window.google.accounts.id.prompt()
      })
    } catch (error) {
      console.error('Google login error:', error)
      toast.error('Failed to login with Google')
      throw error
    }
  }

  private async loadGoogleScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.getElementById('google-script')) {
        resolve()
        return
      }

      const script = document.createElement('script')
      script.id = 'google-script'
      script.src = 'https://accounts.google.com/gsi/client'
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Failed to load Google script'))
      document.head.appendChild(script)
    })
  }

  private async handleGoogleCallback(response: any): Promise<void> {
    try {
      // Decode JWT token (in production, verify on backend)
      const payload = JSON.parse(atob(response.credential.split('.')[1]))
      
      const user: User = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        avatar: payload.picture,
        provider: 'google'
      }

      this.saveUserToStorage(user)
      toast.success(`Welcome, ${user.name}!`)
    } catch (error) {
      console.error('Google callback error:', error)
      toast.error('Failed to process Google login')
      throw error
    }
  }

  // GitHub OAuth Login
  async loginWithGitHub(): Promise<void> {
    try {
      if (!this.githubClientId) {
        toast.error('GitHub OAuth not configured')
        return
      }

      const scope = 'user:email'
      const state = this.generateRandomString(32)
      localStorage.setItem('github_oauth_state', state)

      const githubUrl = `https://github.com/login/oauth/authorize?` +
        `client_id=${this.githubClientId}&` +
        `redirect_uri=${encodeURIComponent(this.githubRedirectUri)}&` +
        `scope=${encodeURIComponent(scope)}&` +
        `state=${state}`

      window.location.href = githubUrl
    } catch (error) {
      console.error('GitHub login error:', error)
      toast.error('Failed to login with GitHub')
      throw error
    }
  }

  // Handle GitHub OAuth callback
  async handleGitHubCallback(code: string, state: string): Promise<void> {
    try {
      const savedState = localStorage.getItem('github_oauth_state')
      if (state !== savedState) {
        throw new Error('Invalid state parameter')
      }

      // In production, exchange code for token on backend
      // For demo purposes, we'll simulate the process
      const mockUser: User = {
        id: 'github_' + Date.now(),
        email: 'user@github.com',
        name: 'GitHub User',
        avatar: 'https://github.com/identicons/sample.png',
        provider: 'github'
      }

      this.saveUserToStorage(mockUser)
      localStorage.removeItem('github_oauth_state')
      toast.success(`Welcome, ${mockUser.name}!`)
    } catch (error) {
      console.error('GitHub callback error:', error)
      toast.error('Failed to process GitHub login')
      throw error
    }
  }

  // Email/Password Login
  async loginWithEmail(email: string, password: string): Promise<void> {
    try {
      // Mock implementation - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const user: User = {
        id: 'email_' + Date.now(),
        email,
        name: email.split('@')[0],
        provider: 'email'
      }

      this.saveUserToStorage(user)
      toast.success(`Welcome back, ${user.name}!`)
    } catch (error) {
      console.error('Email login error:', error)
      toast.error('Invalid email or password')
      throw error
    }
  }

  // Email/Password Signup
  async signupWithEmail(email: string, password: string): Promise<void> {
    try {
      // Mock implementation - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const user: User = {
        id: 'email_' + Date.now(),
        email,
        name: email.split('@')[0],
        provider: 'email'
      }

      this.saveUserToStorage(user)
      toast.success(`Account created successfully! Welcome, ${user.name}!`)
    } catch (error) {
      console.error('Email signup error:', error)
      toast.error('Failed to create account')
      throw error
    }
  }

  // Logout
  logout(): void {
    this.user = null
    localStorage.removeItem('user')
    localStorage.removeItem('github_oauth_state')
    toast.success('Logged out successfully')
  }

  private generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }
}

export const authService = new AuthService()
