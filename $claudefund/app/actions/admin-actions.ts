'use server'

import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!

export async function verifyAdmin(password: string) {
  const isValid = password === ADMIN_PASSWORD

  if (isValid) {
    const cookieStore = await cookies()
    cookieStore.set('admin_session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 24 hours
      sameSite: 'strict',
    })
  }

  return { success: isValid }
}

export async function checkAdminAuth() {
  const cookieStore = await cookies()
  return cookieStore.get('admin_session')?.value === 'authenticated'
}

export async function logoutAdmin() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_session')
  revalidatePath('/admin-12345')
}

export async function toggleSubmissions(paused: boolean) {
  const isAdmin = await checkAdminAuth()
  if (!isAdmin) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    await prisma.settings.upsert({
      where: { id: 1 },
      update: { submissionsPaused: paused },
      create: {
        id: 1,
        submissionsPaused: paused,
        winnerSelectionPaused: false,
      },
    })

    revalidatePath('/admin-12345')
    revalidatePath('/submit')

    return {
      success: true,
      message: `Submissions ${paused ? 'paused' : 'resumed'}`,
    }
  } catch (error) {
    console.error('Toggle submissions error:', error)
    return { success: false, error: 'Failed to toggle submissions' }
  }
}

export async function toggleWinnerSelection(paused: boolean) {
  const isAdmin = await checkAdminAuth()
  if (!isAdmin) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    await prisma.settings.upsert({
      where: { id: 1 },
      update: { winnerSelectionPaused: paused },
      create: {
        id: 1,
        submissionsPaused: false,
        winnerSelectionPaused: paused,
      },
    })

    revalidatePath('/admin-12345')

    return {
      success: true,
      message: `Winner selection ${paused ? 'paused' : 'resumed'}`,
    }
  } catch (error) {
    console.error('Toggle winner selection error:', error)
    return { success: false, error: 'Failed to toggle winner selection' }
  }
}

export async function getAdminStats() {
  const isAdmin = await checkAdminAuth()
  if (!isAdmin) {
    return null
  }

  try {
    const [topIdeas, settings, totalActive, totalFunded, unprocessedWinners] = await Promise.all([
      prisma.idea.findMany({
        where: { status: 'active' },
        orderBy: { likes: 'desc' },
        take: 3,
      }),
      prisma.settings.findUnique({ where: { id: 1 } }),
      prisma.idea.count({ where: { status: 'active' } }),
      prisma.idea.count({ where: { status: 'funded' } }),
      prisma.idea.findMany({
        where: {
          status: 'funded',
          processed: false
        },
        orderBy: { fundedAt: 'desc' },
      }),
    ])

    return {
      topIdeas,
      settings: settings || {
        submissionsPaused: false,
        winnerSelectionPaused: false,
        lastWinnerSelection: null,
        nextSelectionTime: null,
        currentCycle: 1,
      },
      totalActive,
      totalFunded,
      unprocessedWinners,
    }
  } catch (error) {
    console.error('Get admin stats error:', error)
    return null
  }
}

export async function resetTimer() {
  const isAdmin = await checkAdminAuth()
  if (!isAdmin) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    // Calculate 24 hours from now
    const nextSelectionTime = new Date(Date.now() + 24 * 60 * 60 * 1000)

    await prisma.settings.upsert({
      where: { id: 1 },
      update: { nextSelectionTime },
      create: {
        id: 1,
        submissionsPaused: false,
        winnerSelectionPaused: false,
        nextSelectionTime,
      },
    })

    revalidatePath('/admin-12345')
    revalidatePath('/leaderboard')

    return {
      success: true,
      message: 'Timer reset to 24 hours from now',
      nextSelectionTime: nextSelectionTime.toISOString(),
    }
  } catch (error) {
    console.error('Reset timer error:', error)
    return { success: false, error: 'Failed to reset timer' }
  }
}

export async function resetEverything() {
  const isAdmin = await checkAdminAuth()
  if (!isAdmin) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    // Calculate 24 hours from now
    const nextSelectionTime = new Date(Date.now() + 24 * 60 * 60 * 1000)

    // Delete all ACTIVE ideas (keep funded builders)
    const deleteResult = await prisma.idea.deleteMany({
      where: { status: 'active' },
    })

    // Reset timer and current cycle to 1
    await prisma.settings.upsert({
      where: { id: 1 },
      update: {
        nextSelectionTime,
        currentCycle: 1,
      },
      create: {
        id: 1,
        submissionsPaused: false,
        winnerSelectionPaused: false,
        nextSelectionTime,
        currentCycle: 1,
      },
    })

    revalidatePath('/admin-12345')
    revalidatePath('/leaderboard')

    return {
      success: true,
      message: `Reset complete! Deleted ${deleteResult.count} active ideas. Timer set to 24h from now. Current cycle reset to 1.`,
    }
  } catch (error) {
    console.error('Reset everything error:', error)
    return { success: false, error: 'Failed to reset everything' }
  }
}

export async function clearFundedBuilders() {
  const isAdmin = await checkAdminAuth()
  if (!isAdmin) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    // Delete all FUNDED ideas
    const deleteResult = await prisma.idea.deleteMany({
      where: { status: 'funded' },
    })

    revalidatePath('/admin-12345')
    revalidatePath('/funded')
    revalidatePath('/leaderboard')

    return {
      success: true,
      message: `Deleted ${deleteResult.count} funded builders`,
    }
  } catch (error) {
    console.error('Clear funded builders error:', error)
    return { success: false, error: 'Failed to clear funded builders' }
  }
}

export async function markAsProcessed(ideaId: string) {
  const isAdmin = await checkAdminAuth()
  if (!isAdmin) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    await prisma.idea.update({
      where: { id: ideaId },
      data: { processed: true },
    })

    revalidatePath('/admin-12345')

    return {
      success: true,
      message: 'Marked as processed',
    }
  } catch (error) {
    console.error('Mark as processed error:', error)
    return { success: false, error: 'Failed to mark as processed' }
  }
}
