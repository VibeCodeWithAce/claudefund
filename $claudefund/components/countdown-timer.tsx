'use client'

import { useState, useEffect } from 'react'

interface CountdownTimerProps {
  customDeadline?: string | null
}

export function CountdownTimer({ customDeadline }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    const calculateTimeLeft = () => {
      const now = new Date()
      let targetTime: Date

      if (customDeadline) {
        // Use custom deadline if provided
        targetTime = new Date(customDeadline)
      } else {
        // Default to next UTC midnight
        const tomorrow = new Date()
        tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
        tomorrow.setUTCHours(0, 0, 0, 0)
        targetTime = tomorrow
      }

      const diff = targetTime.getTime() - now.getTime()

      // Handle case where time has passed
      if (diff <= 0) {
        return '0h 0m 0s'
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      return `${hours}h ${minutes}m ${seconds}s`
    }

    setTimeLeft(calculateTimeLeft())
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(interval)
  }, [customDeadline])

  if (!mounted) {
    return (
      <div className="bg-[#2a2a2a] rounded-lg shadow-md p-8 text-center mb-8 border border-gray-800">
        <h2 className="text-2xl font-bold text-gray-100 mb-2">
          Next Winner Selection
        </h2>
        <div className="text-4xl font-mono text-[#da7756]">Loading...</div>
      </div>
    )
  }

  return (
    <div className="bg-[#2a2a2a] rounded-lg shadow-md p-8 text-center mb-8 border border-gray-800">
      <h2 className="text-2xl font-bold text-gray-100 mb-2">
        Next Winner Selection
      </h2>
      <div className="text-4xl font-mono text-[#da7756]">{timeLeft}</div>
      <p className="text-sm text-gray-400 mt-2">
        {customDeadline
          ? `Custom deadline: ${new Date(customDeadline).toLocaleString()}`
          : 'Winners selected at UTC midnight'}
      </p>
    </div>
  )
}
