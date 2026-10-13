import React, { useEffect, useState } from 'react'

interface ScoreGaugeProps {
  score: number
  tierName: string
  color: string
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score, color }) => {
  const [animatedScore, setAnimatedScore] = useState(0)

  // Count-up animation
  useEffect(() => {
    let startTime: number | null = null
    const duration = 1200
    const target = score

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3)
      setAnimatedScore(Math.round(easeOut * target))

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [score])

  // Circular gauge geometry
  const radius = 80
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - Math.min(score, 100) / 100)

  return (
    <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
        {/* Background track */}
        <circle cx="100" cy="100" r={radius} fill="none" stroke="#1E293B" strokeWidth="14" />
        {/* Animated colored progress */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-5xl sm:text-6xl font-extrabold text-white tracking-tight tabular-nums">
          {animatedScore}
        </span>
        <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider mt-1">
          de 100 pontos
        </span>
      </div>
    </div>
  )
}
