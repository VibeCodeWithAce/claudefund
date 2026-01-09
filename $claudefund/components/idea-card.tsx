'use client'

import { maskEmail } from '@/lib/utils'
import { LikeButton } from './like-button'

interface IdeaCardProps {
  id: string
  email: string
  title: string
  description: string
  likes: number
  createdAt: Date
}

export function IdeaCard({
  id,
  email,
  title,
  description,
  likes,
  createdAt,
}: IdeaCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-gray-900 mb-1 break-words">
            {title}
          </h3>
          <p className="text-sm text-gray-500">{maskEmail(email)}</p>
        </div>
        <LikeButton ideaId={id} initialLikes={likes} />
      </div>

      <p className="text-gray-700 mb-4 leading-relaxed whitespace-pre-wrap break-words">
        {description}
      </p>

      <div className="text-xs text-gray-400">
        Submitted {new Date(createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </div>
    </div>
  )
}
