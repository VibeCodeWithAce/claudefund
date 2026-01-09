'use client'

import { useState, useEffect } from 'react'
import {
  verifyAdmin,
  checkAdminAuth,
  logoutAdmin,
  toggleSubmissions,
  toggleWinnerSelection,
  getAdminStats,
  resetTimer,
  resetEverything,
  clearFundedBuilders,
} from '@/app/actions/admin-actions'
import { selectTopThreeWinners } from '@/app/actions/select-winners'
import { CountdownTimer } from '@/components/countdown-timer'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface AdminStats {
  topIdeas: Array<{
    id: string
    email: string
    title: string
    description: string
    likes: number
  }>
  settings: {
    submissionsPaused: boolean
    winnerSelectionPaused: boolean
    lastWinnerSelection: Date | null
    nextSelectionTime: Date | null
    currentCycle: number
  }
  totalActive: number
  totalFunded: number
}

export default function AdminPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState<AdminStats | null>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    const authenticated = await checkAdminAuth()
    setIsAuthenticated(authenticated)
    if (authenticated) {
      await loadStats()
    }
  }

  async function loadStats() {
    const data = await getAdminStats()
    if (data) {
      setStats(data)
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    const result = await verifyAdmin(password)

    if (result.success) {
      setIsAuthenticated(true)
      setPassword('')
      toast.success('Logged in successfully')
      await loadStats()
    } else {
      toast.error('Invalid password')
    }

    setIsLoading(false)
  }

  async function handleLogout() {
    await logoutAdmin()
    setIsAuthenticated(false)
    setStats(null)
    toast.success('Logged out')
  }

  async function handleToggleSubmissions() {
    if (!stats) return
    setIsLoading(true)
    const result = await toggleSubmissions(!stats.settings.submissionsPaused)
    if (result.success) {
      toast.success(result.message)
      await loadStats()
    } else {
      toast.error(result.error || 'Failed to toggle')
    }
    setIsLoading(false)
  }

  async function handleToggleWinnerSelection() {
    if (!stats) return
    setIsLoading(true)
    const result = await toggleWinnerSelection(
      !stats.settings.winnerSelectionPaused
    )
    if (result.success) {
      toast.success(result.message)
      await loadStats()
    } else {
      toast.error(result.error || 'Failed to toggle')
    }
    setIsLoading(false)
  }

  async function handleSelectWinners() {
    if (
      !confirm(
        'Are you sure you want to select winners now? This will fund the top 3 ideas and reset all like counts.'
      )
    ) {
      return
    }

    setIsLoading(true)
    const result = await selectTopThreeWinners()

    if (result.success) {
      toast.success(result.message)
      await loadStats()
      router.refresh()
    } else {
      toast.error(result.message)
    }

    setIsLoading(false)
  }

  async function handleResetTimer() {
    if (
      !confirm(
        'Reset the countdown timer to 24 hours from now? This will NOT select winners or reset like counts.'
      )
    ) {
      return
    }

    setIsLoading(true)
    const result = await resetTimer()

    if (result.success) {
      toast.success(result.message)
      await loadStats()
      router.refresh()
    } else {
      toast.error(result.error || 'Failed to reset timer')
    }

    setIsLoading(false)
  }

  async function handleResetEverything() {
    if (
      !confirm(
        '⚠️ RESET EVERYTHING?\n\nThis will:\n- Delete ALL active ideas from the leaderboard\n- Reset the timer to 24 hours from now\n- Reset current cycle to 1\n\nFunded builders will be kept.\n\nAre you sure?'
      )
    ) {
      return
    }

    setIsLoading(true)
    const result = await resetEverything()

    if (result.success) {
      toast.success(result.message)
      await loadStats()
      router.refresh()
    } else {
      toast.error(result.error || 'Failed to reset')
    }

    setIsLoading(false)
  }

  async function handleClearFundedBuilders() {
    if (
      !confirm(
        '⚠️ DELETE ALL FUNDED BUILDERS?\n\nThis will permanently delete all funded builders from the database.\n\nAre you absolutely sure?'
      )
    ) {
      return
    }

    setIsLoading(true)
    const result = await clearFundedBuilders()

    if (result.success) {
      toast.success(result.message)
      await loadStats()
      router.refresh()
    } else {
      toast.error(result.error || 'Failed to clear funded builders')
    }

    setIsLoading(false)
  }

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              Admin Login
            </h1>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-100"
                  placeholder="Enter admin password"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Logout
          </button>
        </div>

        {stats && (
          <>
            {/* Countdown Timer */}
            <CountdownTimer
              customDeadline={
                stats.settings.nextSelectionTime
                  ? new Date(stats.settings.nextSelectionTime).toISOString()
                  : null
              }
            />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Active Ideas
                </h3>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalActive}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Funded Ideas
                </h3>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalFunded}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Last Winner Selection
                </h3>
                <p className="text-lg font-semibold text-gray-900">
                  {stats.settings.lastWinnerSelection
                    ? new Date(
                        stats.settings.lastWinnerSelection
                      ).toLocaleDateString()
                    : 'Never'}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Controls
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-gray-900">Submissions</h3>
                    <p className="text-sm text-gray-500">
                      Currently:{' '}
                      {stats.settings.submissionsPaused ? 'Paused' : 'Active'}
                    </p>
                  </div>
                  <button
                    onClick={handleToggleSubmissions}
                    disabled={isLoading}
                    className={`px-6 py-2 rounded-lg font-semibold transition ${
                      stats.settings.submissionsPaused
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-yellow-600 text-white hover:bg-yellow-700'
                    } disabled:opacity-50`}
                  >
                    {stats.settings.submissionsPaused ? 'Resume' : 'Pause'}
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Winner Selection
                    </h3>
                    <p className="text-sm text-gray-500">
                      Currently:{' '}
                      {stats.settings.winnerSelectionPaused
                        ? 'Paused'
                        : 'Active'}
                    </p>
                  </div>
                  <button
                    onClick={handleToggleWinnerSelection}
                    disabled={isLoading}
                    className={`px-6 py-2 rounded-lg font-semibold transition ${
                      stats.settings.winnerSelectionPaused
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-yellow-600 text-white hover:bg-yellow-700'
                    } disabled:opacity-50`}
                  >
                    {stats.settings.winnerSelectionPaused ? 'Resume' : 'Pause'}
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-blue-50">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Manual Winner Selection
                    </h3>
                    <p className="text-sm text-gray-500">
                      Select top 3 ideas now and reset likes
                    </p>
                  </div>
                  <button
                    onClick={handleSelectWinners}
                    disabled={isLoading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
                  >
                    Select Winners & Reset
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-purple-50">
                  <div>
                    <h3 className="font-semibold text-gray-900">Reset Timer</h3>
                    <p className="text-sm text-gray-500">
                      Reset countdown to 24h from now (without selecting winners)
                    </p>
                  </div>
                  <button
                    onClick={handleResetTimer}
                    disabled={isLoading}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 transition"
                  >
                    Reset Timer
                  </button>
                </div>
              </div>
            </div>

            {/* Top 3 Ideas */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Current Top 3 Ideas (Full Emails)
              </h2>
              {stats.topIdeas.length === 0 ? (
                <p className="text-gray-500">No active ideas yet</p>
              ) : (
                <div className="space-y-4">
                  {stats.topIdeas.map((idea, index) => (
                    <div
                      key={idea.id}
                      className="p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                          #{index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 mb-1 break-words">
                            {idea.title}
                          </h3>
                          <p className="text-sm text-blue-600 mb-2 break-all">
                            {idea.email}
                          </p>
                          <p className="text-gray-700 text-sm break-words">
                            {idea.description}
                          </p>
                          <p className="text-sm text-gray-500 mt-2">
                            Likes: {idea.likes}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Danger Zone - Reset Buttons */}
            <div className="bg-white rounded-lg shadow-md p-6 border-2 border-red-200 mt-8">
              <h2 className="text-2xl font-bold text-red-600 mb-2">
                Danger Zone
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                These actions are irreversible. Use with caution.
              </p>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Reset Everything
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Deletes all ACTIVE ideas, resets timer to 24h, resets cycle to 1
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      (Keeps funded builders intact)
                    </p>
                  </div>
                  <button
                    onClick={handleResetEverything}
                    disabled={isLoading}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 transition flex-shrink-0"
                  >
                    Reset Everything
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Clear Funded Builders
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Permanently delete all funded builders from the database
                    </p>
                  </div>
                  <button
                    onClick={handleClearFundedBuilders}
                    disabled={isLoading}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 transition flex-shrink-0"
                  >
                    Clear Funded Builders
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
