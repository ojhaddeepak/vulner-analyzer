import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Shield, Mail, Lock, ArrowRight, User, CheckCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'
// Removed authApi import for standalone version

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type SignupForm = z.infer<typeof signupSchema>

export function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  })

  const password = watch('password', '')

  const passwordRequirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'One lowercase letter', met: /[a-z]/.test(password) },
    { label: 'One number', met: /[0-9]/.test(password) },
  ]

  const onSubmit = async (_data: SignupForm) => {
    setIsLoading(true)
    try {
      // Mock signup for standalone version
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Account created successfully! 🎉')
      navigate('/')
    } catch (error: any) {
      toast.error('Failed to create account')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
              <Shield className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">Create Account</h1>
          <p className="text-muted-foreground">
            Join the vulnerability scanner platform
          </p>
        </div>

        {/* Signup Form */}
        <div className="bg-card border rounded-xl shadow-lg p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  className="w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
              
              {/* Password Requirements */}
              {password && (
                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Password Requirements:</p>
                  <div className="space-y-1">
                    {passwordRequirements.map((req, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle 
                          className={`h-3 w-3 ${req.met ? 'text-green-500' : 'text-gray-300'}`} 
                        />
                        <span className={`text-xs ${req.met ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  className="w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <User className="h-4 w-4" />
                  <span>Create Account</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-muted"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Already have an account?</span>
            </div>
          </div>

          {/* Login Link */}
          <Link
            to="/login"
            className="w-full border border-green-600 text-green-600 py-3 rounded-lg font-medium hover:bg-green-50 dark:hover:bg-green-900/10 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <span>Sign In Instead</span>
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-green-600 transition-colors">
            ← Back to Scanner
          </Link>
        </div>
      </div>
    </div>
  )
}
