interface RiskMeterProps {
  score: number
}

export function RiskMeter({ score }: RiskMeterProps) {
  const getColor = (score: number) => {
    if (score <= 30) return 'bg-green-500'
    if (score <= 60) return 'bg-yellow-500'
    if (score <= 80) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getLabel = (score: number) => {
    if (score <= 30) return 'Low Risk'
    if (score <= 60) return 'Medium Risk'
    if (score <= 80) return 'High Risk'
    return 'Critical Risk'
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">Risk Score</span>
        <span className="text-lg font-bold">{score}/100</span>
      </div>
      
      <div className="relative">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${getColor(score)}`}
            style={{ width: `${score}%` }}
          />
        </div>
        
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>0</span>
          <span>25</span>
          <span>50</span>
          <span>75</span>
          <span>100</span>
        </div>
      </div>
      
      <div className="text-center">
        <span className={`text-sm font-medium ${getColor(score).replace('bg-', 'text-')}`}>
          {getLabel(score)}
        </span>
      </div>
    </div>
  )
}
