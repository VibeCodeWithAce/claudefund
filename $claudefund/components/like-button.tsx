'use client'

import { useState, useEffect } from 'react'
import { toggleLike } from '@/app/actions/toggle-like'

interface LikeButtonProps {
  ideaId: string
  initialLikes: number
}

export function LikeButton({ ideaId, initialLikes }: LikeButtonProps) {
  const [hasLiked, setHasLiked] = useState(false)
  const [likes, setLikes] = useState(initialLikes)
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const liked = localStorage.getItem(`liked_${ideaId}`)
    setHasLiked(liked === 'true')
  }, [ideaId])

  const handleLike = async () => {
    if (isLoading) return

    setIsLoading(true)
    const newState = !hasLiked

    // Optimistic update
    setHasLiked(newState)
    setLikes((prev) => (newState ? prev + 1 : prev - 1))
    localStorage.setItem(`liked_${ideaId}`, String(newState))

    try {
      await toggleLike(ideaId, newState ? 'add' : 'remove')
    } catch (error) {
      // Revert on error
      setHasLiked(!newState)
      setLikes((prev) => (newState ? prev - 1 : prev + 1))
      localStorage.setItem(`liked_${ideaId}`, String(!newState))
      console.error('Like error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted) {
    return (
      <button
        disabled
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        <span className="font-medium">{initialLikes}</span>
      </button>
    )
  }

  return (
    <button
      onClick={handleLike}
      disabled={isLoading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
        hasLiked
          ? 'border-red-500 bg-red-50 text-red-600'
          : 'border-gray-300 bg-white text-gray-700 hover:border-red-300 hover:bg-red-50'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      <svg
        className="w-5 h-5"
        fill={hasLiked ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      <span className="font-medium">{likes}</span>
    </button>
  )
}
