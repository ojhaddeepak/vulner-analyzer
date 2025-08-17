import { useState } from 'react'
import { ChevronDown, ChevronRight, AlertTriangle, Info, CheckCircle } from 'lucide-react'
import { getRiskLevelColor } from '../lib/utils'

interface Signal {
  id: string
  title: string
  weight: number
  why: string
  evidence: string
  riskLevel: string
}

interface SignalsListProps {
  signals: Signal[]
  title: string
}

export function SignalsList({ signals, title }: SignalsListProps) {
  const [expandedSignals, setExpandedSignals] = useState<Set<string>>(new Set())

  const toggleSignal = (signalId: string) => {
    const newExpanded = new Set(expandedSignals)
    if (newExpanded.has(signalId)) {
      newExpanded.delete(signalId)
    } else {
      newExpanded.add(signalId)
    }
    setExpandedSignals(newExpanded)
  }

  const getSignalIcon = (riskLevel: string) => {
    switch (riskLevel.toUpperCase()) {
      case 'CRITICAL':
      case 'HIGH':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'MEDIUM':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'LOW':
        return <Info className="h-4 w-4 text-blue-600" />
      default:
        return <CheckCircle className="h-4 w-4 text-green-600" />
    }
  }

  if (signals.length === 0) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
        <h3 className="font-semibold mb-2">No Security Issues Detected</h3>
        <p className="text-muted-foreground">No suspicious patterns or security risks were found in this analysis.</p>
      </div>
    )
  }

  return (
    <div>
      <h3 className="font-semibold mb-4">{title}</h3>
      <div className="space-y-3">
        {signals.map((signal) => (
          <div key={signal.id} className="border rounded-lg">
            <button
              onClick={() => toggleSignal(signal.id)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                {getSignalIcon(signal.riskLevel)}
                <div>
                  <h4 className="font-medium">{signal.title}</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(signal.riskLevel)}`}>
                      {signal.riskLevel}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Weight: {signal.weight}
                    </span>
                  </div>
                </div>
              </div>
              {expandedSignals.has(signal.id) ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            
            {expandedSignals.has(signal.id) && (
              <div className="px-4 pb-4 space-y-3">
                <div>
                  <h5 className="text-sm font-medium text-muted-foreground mb-1">Why this matters:</h5>
                  <p className="text-sm">{signal.why}</p>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-muted-foreground mb-1">Evidence:</h5>
                  <p className="text-sm font-mono bg-muted p-2 rounded text-xs">{signal.evidence}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
