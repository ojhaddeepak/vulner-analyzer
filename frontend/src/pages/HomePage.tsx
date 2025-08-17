import { useState } from 'react'
import { FileScanCard } from '../components/FileScanCard'
import { UrlCheckCard } from '../components/UrlCheckCard'
import { Shield, FileText, Globe } from 'lucide-react'

type TabType = 'file' | 'url'

export function HomePage() {
  const [activeTab, setActiveTab] = useState<TabType>('file')

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <Shield className="h-16 w-16 text-primary" />
        </div>
        <h1 className="text-4xl font-bold mb-4">Vulnerability Scanner</h1>
        <p className="text-xl text-muted-foreground mb-6">
          Analyze files and URLs for security risks with our defensive scanning tool
        </p>
        <div className="flex justify-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>File Analysis</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Globe className="h-4 w-4" />
            <span>URL Phishing Detection</span>
          </div>
        </div>
      </div>

      <div className="bg-card border rounded-lg p-6">
        <div className="flex space-x-1 mb-6">
          <button
            onClick={() => setActiveTab('file')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'file'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>File Scan</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('url')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'url'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Globe className="h-4 w-4" />
              <span>URL Check</span>
            </div>
          </button>
        </div>

        {activeTab === 'file' ? <FileScanCard /> : <UrlCheckCard />}
      </div>

      <div className="mt-8 grid md:grid-cols-3 gap-6">
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold">Safe Analysis</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Files are never executed, only analyzed as data for maximum security.
          </p>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold">Multiple Formats</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Support for PDFs, Office documents, executables, archives, and more.
          </p>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Globe className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold">Phishing Detection</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Advanced URL analysis with SSL/TLS, domain age, and content checks.
          </p>
        </div>
      </div>
    </div>
  )
}
