import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Shield, ArrowRight, ArrowLeft, RotateCcw } from 'lucide-react'
import { authService } from '../lib/auth'
import { toast } from 'react-hot-toast'

export function VerifyOTPPage() {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes in seconds
  const navigate = useNavigate()
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const email = authService.getPasswordResetEmail()

  useEffect(() => {
    // Redirect if no email in session
    if (!email) {
      navigate('/forgot-password')
      return
    }

    // Start countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [email, navigate])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const newOtp = [...otp]
    
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newOtp[i] = pastedData[i]
    }
    
    setOtp(newOtp)
    
    // Focus the next empty input or the last one
    const nextIndex = Math.min(pastedData.length, 5)
    inputRefs.current[nextIndex]?.focus()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const otpString = otp.join('')
    
    if (otpString.length !== 6) {
      toast.error('Please enter all 6 digits')
      return
    }

    setIsLoading(true)
    try {
      const isValid = await authService.verifyPasswordResetOTP(otpString)
      if (isValid) {
        navigate('/reset-password')
      }
    } catch (error) {
      // Error handling is done in authService
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (!email) return
    
    setIsResending(true)
    try {
      await authService.sendPasswordResetOTP(email)
      setTimeLeft(600) // Reset timer
      setOtp(['', '', '', '', '', '']) // Clear current OTP
      inputRefs.current[0]?.focus()
    } catch (error) {
      // Error handling is done in authService
    } finally {
      setIsResending(false)
    }
  }

  if (!email) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
              <Shield className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">Verify OTP</h1>
          <p className="text-muted-foreground mb-2">
            We've sent a 6-digit code to
          </p>
          <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
            {email}
          </p>
        </div>

        {/* OTP Verification Form */}
        <div className="bg-card border rounded-xl shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Enter 6-digit OTP</label>
              <div className="flex justify-center space-x-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-12 h-12 text-center text-lg font-bold border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  />
                ))}
              </div>
            </div>

            {/* Timer */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {timeLeft > 0 ? (
                  <>Time remaining: <span className="font-medium text-purple-600">{formatTime(timeLeft)}</span></>
                ) : (
                  <span className="text-red-500">OTP has expired</span>
                )}
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || timeLeft === 0}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <span>Verify OTP</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Resend OTP */}
          <div className="mt-6 text-center">
            <button
              onClick={handleResendOTP}
              disabled={isResending || timeLeft > 540} // Allow resend after 1 minute
              className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center justify-center space-x-1 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
              ) : (
                <>
                  <RotateCcw className="h-4 w-4" />
                  <span>Resend OTP</span>
                </>
              )}
            </button>
            {timeLeft > 540 && (
              <p className="text-xs text-muted-foreground mt-1">
                You can resend OTP in {formatTime(timeLeft - 540)}
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-muted"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Need help?</span>
            </div>
          </div>

          {/* Back Link */}
          <Link
            to="/forgot-password"
            className="w-full border border-purple-600 text-purple-600 py-3 rounded-lg font-medium hover:bg-purple-50 dark:hover:bg-purple-900/10 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Try Different Email</span>
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-purple-600 transition-colors">
            ← Back to Scanner
          </Link>
        </div>
      </div>
    </div>
  )
}
