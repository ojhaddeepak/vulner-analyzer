import { useState } from 'react'
import { FileScanCard } from '../components/FileScanCard'
import { UrlCheckCard } from '../components/UrlCheckCard'
import { Shield, FileText, Globe, Zap, Lock, Search, CheckCircle, AlertTriangle, Activity } from 'lucide-react'

type TabType = 'file' | 'url'

export function HomePage() {
  const [activeTab, setActiveTab] = useState<TabType>('file')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />
        
        <div className="relative max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            {/* Animated Shield Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-lg opacity-30 animate-pulse" />
                <div className="relative p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-xl transform hover:scale-110 transition-all duration-300">
                  <Shield className="h-10 w-10 text-white" />
                </div>
              </div>
            </div>
            
            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent mb-4">
              Vulnerability Scanner
            </h1>
            
            {/* Subtitle */}
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-6 max-w-2xl mx-auto leading-relaxed">
              Advanced security analysis powered by AI. Protect your digital assets with 
              <span className="text-blue-600 dark:text-blue-400 font-semibold"> enterprise-grade scanning</span>
            </p>
            
            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <div className="flex items-center space-x-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 shadow-md">
                <Zap className="h-3.5 w-3.5 text-yellow-500" />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Lightning Fast</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 shadow-md">
                <Lock className="h-3.5 w-3.5 text-green-500" />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">100% Secure</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 shadow-md">
                <Activity className="h-3.5 w-3.5 text-blue-500" />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Real-time Analysis</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Scanner Section */}
      <div className="max-w-4xl mx-auto px-4 pb-12">
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-2xl shadow-xl p-6">
          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-6 p-1.5 bg-slate-100/50 dark:bg-slate-700/50 rounded-xl">
            <button
              onClick={() => setActiveTab('file')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${
                activeTab === 'file'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-600/50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <FileText className="h-4 w-4" />
                <span className="text-sm">File Scanner</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('url')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${
                activeTab === 'url'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-600/50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Globe className="h-4 w-4" />
                <span className="text-sm">URL Analyzer</span>
              </div>
            </button>
          </div>

          {/* Scanner Content */}
          <div className="transition-all duration-500 ease-in-out">
            {activeTab === 'file' ? <FileScanCard /> : <UrlCheckCard />}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-3">
            Why Choose Our Scanner?
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
            Enterprise-grade security analysis with cutting-edge technology
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {/* Safe Analysis */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl blur-lg opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
            <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-md">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Safe Analysis</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-3">
                Files are never executed, only analyzed as data for maximum security.
              </p>
              <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                <CheckCircle className="h-4 w-4" />
                <span className="text-xs font-medium">Zero-execution guarantee</span>
              </div>
            </div>
          </div>

          {/* Multiple Formats */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl blur-lg opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
            <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-md">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Multiple Formats</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-3">
                Support for PDFs, Office documents, executables, archives, and more.
              </p>
              <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                <Search className="h-4 w-4" />
                <span className="text-xs font-medium">50+ file formats supported</span>
              </div>
            </div>
          </div>

          {/* Phishing Detection */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur-lg opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
            <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-md">
                  <Globe className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Threat Detection</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-3">
                Advanced URL analysis with SSL/TLS, domain age, and content checks.
              </p>
              <div className="flex items-center space-x-2 text-purple-600 dark:text-purple-400">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-xs font-medium">Real-time threat intelligence</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
