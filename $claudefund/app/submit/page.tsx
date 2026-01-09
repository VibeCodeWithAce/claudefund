'use client'

import { useState } from 'react'
import { submitIdea } from '@/app/actions/submit-idea'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function SubmitPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)

    try {
      const result = await submitIdea(formData)

      if (result.success) {
        toast.success('Idea approved and added to leaderboard!')
        router.push('/leaderboard')
      } else {
        toast.error(result.error || 'Submission failed')
      }
    } catch (error) {
      toast.error('An error occurred while submitting')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Submit Your Idea
          </h1>
          <p className="text-lg text-gray-600">
            Your idea will be vetted by Claude AI before going live
          </p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-gray-100 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-200 disabled:cursor-not-allowed"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Idea Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                minLength={5}
                maxLength={100}
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-gray-100 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-200 disabled:cursor-not-allowed"
                placeholder="My Amazing Project"
              />
              <p className="text-sm text-gray-500 mt-1">
                5-100 characters
              </p>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                required
                minLength={50}
                maxLength={500}
                rows={6}
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-gray-100 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-200 disabled:cursor-not-allowed resize-none"
                placeholder="Describe your project idea in detail..."
              />
              <p className="text-sm text-gray-500 mt-1">
                50-500 characters
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting
                ? 'Thanks, your idea is being vetted by Claude AI...'
                : 'Submit for AI Vetting'}
            </button>
          </form>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            Your submission will be reviewed by Claude AI to ensure it's a genuine
            project idea. If approved, it will appear on the leaderboard immediately.
          </p>
        </div>
      </div>
    </div>
  )
}
