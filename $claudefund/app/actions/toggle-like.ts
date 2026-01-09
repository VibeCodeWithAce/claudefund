'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function toggleLike(ideaId: string, action: 'add' | 'remove') {
  try {
    await prisma.idea.update({
      where: { id: ideaId },
      data: {
        likes: {
          [action === 'add' ? 'increment' : 'decrement']: 1,
        },
      },
    })

    revalidatePath('/leaderboard')
    return { success: true }
  } catch (error) {
    console.error('Toggle like error:', error)
    return { success: false, error: 'Failed to update like' }
  }
}
