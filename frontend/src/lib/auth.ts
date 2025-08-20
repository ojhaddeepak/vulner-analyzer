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
      if (!this.googleClientId || this.googleClientId === 'your_google_client_id_here') {
        toast.error('Google OAuth not configured. Please set VITE_GOOGLE_CLIENT_ID in your .env file')
        console.error('Google Client ID not configured. Please add VITE_GOOGLE_CLIENT_ID to your .env file')
        return
      }

      // Load Google Identity Services
      await this.loadGoogleScript()
      
      return new Promise((resolve, reject) => {
        try {
          // @ts-ignore - Google Identity Services
          if (!window.google?.accounts?.id) {
            throw new Error('Google Identity Services not loaded')
          }

          // @ts-ignore - Google Identity Services
          window.google.accounts.id.initialize({
            client_id: this.googleClientId,
            callback: (response: any) => {
              this.handleGoogleCallback(response)
                .then(() => resolve())
                .catch(reject)
            },
            auto_select: false,
            cancel_on_tap_outside: true
          })

          // @ts-ignore
          window.google.accounts.id.prompt((notification: any) => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
              // Fallback to renderButton if prompt fails
              this.showGoogleSignInButton(resolve, reject)
            }
          })
        } catch (error) {
          reject(error)
        }
      })
    } catch (error) {
      console.error('Google login error:', error)
      toast.error('Failed to login with Google. Please check your configuration.')
      throw error
    }
  }

  private showGoogleSignInButton(resolve: () => void, reject: (error: any) => void): void {
    // Create a temporary button for Google Sign-In
    const buttonContainer = document.createElement('div')
    buttonContainer.id = 'google-signin-button'
    buttonContainer.style.position = 'fixed'
    buttonContainer.style.top = '50%'
    buttonContainer.style.left = '50%'
    buttonContainer.style.transform = 'translate(-50%, -50%)'
    buttonContainer.style.zIndex = '10000'
    buttonContainer.style.backgroundColor = 'white'
    buttonContainer.style.padding = '20px'
    buttonContainer.style.borderRadius = '8px'
    buttonContainer.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)'
    document.body.appendChild(buttonContainer)

    // @ts-ignore
    window.google.accounts.id.renderButton(buttonContainer, {
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      shape: 'rectangular'
    })

    // Add close button
    const closeButton = document.createElement('button')
    closeButton.innerHTML = '×'
    closeButton.style.position = 'absolute'
    closeButton.style.top = '5px'
    closeButton.style.right = '10px'
    closeButton.style.background = 'none'
    closeButton.style.border = 'none'
    closeButton.style.fontSize = '20px'
    closeButton.style.cursor = 'pointer'
    closeButton.onclick = () => {
      document.body.removeChild(buttonContainer)
      reject(new Error('Google sign-in cancelled'))
    }
    buttonContainer.appendChild(closeButton)

    // Set up the callback for the button
    // @ts-ignore
    window.google.accounts.id.initialize({
      client_id: this.googleClientId,
      callback: (response: any) => {
        document.body.removeChild(buttonContainer)
        this.handleGoogleCallback(response)
          .then(() => resolve())
          .catch(reject)
      }
    })
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
      if (!this.githubClientId || this.githubClientId === 'your_github_client_id_here') {
        toast.error('GitHub OAuth not configured. Please set VITE_GITHUB_CLIENT_ID in your .env file')
        console.error('GitHub Client ID not configured. Please add VITE_GITHUB_CLIENT_ID to your .env file')
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

      console.log('Redirecting to GitHub OAuth:', githubUrl)
      window.location.href = githubUrl
    } catch (error) {
      console.error('GitHub login error:', error)
      toast.error('Failed to login with GitHub. Please check your configuration.')
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

      console.log('Processing GitHub OAuth callback with code:', code)
      
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
      console.log('Attempting email login for:', email)
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
      console.log('Creating account for:', email)
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

  // Forgot Password - Send OTP
  async sendPasswordResetOTP(email: string): Promise<void> {
    try {
      // Mock implementation - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Generate and store OTP (in production, this would be done on backend)
      const otp = Math.floor(100000 + Math.random() * 900000).toString()
      localStorage.setItem('password_reset_otp', otp)
      localStorage.setItem('password_reset_email', email)
      localStorage.setItem('otp_expires', (Date.now() + 10 * 60 * 1000).toString()) // 10 minutes
      
      // In production, send OTP via email service
      console.log(`OTP for ${email}: ${otp}`) // For demo purposes
      toast.success('OTP sent to your email address')
    } catch (error) {
      console.error('Send OTP error:', error)
      toast.error('Failed to send OTP. Please try again.')
      throw error
    }
  }

  // Verify OTP
  async verifyPasswordResetOTP(otp: string): Promise<boolean> {
    try {
      const storedOTP = localStorage.getItem('password_reset_otp')
      const expiresAt = localStorage.getItem('otp_expires')
      
      if (!storedOTP || !expiresAt) {
        toast.error('No OTP found. Please request a new one.')
        return false
      }

      if (Date.now() > parseInt(expiresAt)) {
        localStorage.removeItem('password_reset_otp')
        localStorage.removeItem('otp_expires')
        toast.error('OTP has expired. Please request a new one.')
        return false
      }

      if (otp !== storedOTP) {
        toast.error('Invalid OTP. Please try again.')
        return false
      }

      toast.success('OTP verified successfully')
      return true
    } catch (error) {
      console.error('Verify OTP error:', error)
      toast.error('Failed to verify OTP')
      return false
    }
  }

  // Reset Password
  async resetPassword(newPassword: string): Promise<void> {
    try {
      const email = localStorage.getItem('password_reset_email')
      const storedOTP = localStorage.getItem('password_reset_otp')
      
      if (!email || !storedOTP) {
        toast.error('Invalid reset session. Please start over.')
        throw new Error('Invalid reset session')
      }

      console.log('Resetting password for:', email)
      // Mock implementation - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Clean up stored data
      localStorage.removeItem('password_reset_otp')
      localStorage.removeItem('password_reset_email')
      localStorage.removeItem('otp_expires')
      
      toast.success('Password reset successfully! You can now login with your new password.')
    } catch (error) {
      console.error('Reset password error:', error)
      toast.error('Failed to reset password')
      throw error
    }
  }

  // Get email for password reset (for display purposes)
  getPasswordResetEmail(): string | null {
    return localStorage.getItem('password_reset_email')
  }

  // Logout
  logout(): void {
    this.user = null
    localStorage.removeItem('user')
    localStorage.removeItem('github_oauth_state')
    localStorage.removeItem('password_reset_otp')
    localStorage.removeItem('password_reset_email')
    localStorage.removeItem('otp_expires')
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
