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
    <div className="bg-[#2a2a2a] rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-800">
      <div className="flex justify-between items-start gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-gray-100 mb-1 break-words">
            {title}
          </h3>
          <p className="text-sm text-gray-400">{maskEmail(email)}</p>
        </div>
        <LikeButton ideaId={id} initialLikes={likes} />
      </div>

      <p className="text-gray-300 mb-4 leading-relaxed whitespace-pre-wrap break-words">
        {description}
      </p>

      <div className="text-xs text-gray-500">
        Submitted {new Date(createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </div>
    </div>
  )
}
