'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function selectTopThreeWinners(isManualTrigger: boolean = true) {
  try {
    // Get settings
    const settings = await prisma.settings.findUnique({ where: { id: 1 } })
    if (settings?.winnerSelectionPaused) {
      return { success: false, message: 'Winner selection is paused' }
    }

    // Get top 3 active ideas by likes
    const topIdeas = await prisma.idea.findMany({
      where: { status: 'active' },
      orderBy: { likes: 'desc' },
      take: 3,
    })

    if (topIdeas.length === 0) {
      return { success: false, message: 'No active ideas to fund' }
    }

    // Update winners to funded status
    const winnerIds = topIdeas.map((idea) => idea.id)
    await prisma.idea.updateMany({
      where: { id: { in: winnerIds } },
      data: {
        status: 'funded',
        fundedAt: new Date(),
      },
    })

    // Reset likes for all remaining active ideas to 0
    await prisma.idea.updateMany({
      where: {
        status: 'active',
        id: { notIn: winnerIds },
      },
      data: {
        likes: 0,
      },
    })

    // Update last selection time, handle timer reset, and increment cycle
    const now = new Date()
    const nextSelectionTime = isManualTrigger
      ? new Date(now.getTime() + 24 * 60 * 60 * 1000) // 24 hours from now for manual trigger
      : null // Clear custom time for automated cron trigger

    const currentCycle = settings?.currentCycle || 1
    const newCycle = currentCycle + 1

    await prisma.settings.upsert({
      where: { id: 1 },
      update: {
        lastWinnerSelection: now,
        nextSelectionTime,
        currentCycle: newCycle,
      },
      create: {
        id: 1,
        lastWinnerSelection: now,
        nextSelectionTime,
        currentCycle: newCycle,
        submissionsPaused: false,
        winnerSelectionPaused: false,
      },
    })

    // Revalidate pages
    revalidatePath('/leaderboard')
    revalidatePath('/funded')
    revalidatePath('/admin-12345')

    return {
      success: true,
      winners: topIdeas.length,
      message: `${topIdeas.length} winner(s) selected and funded!`,
    }
  } catch (error) {
    console.error('Select winners error:', error)
    return {
      success: false,
      message: 'Failed to select winners. Please try again.',
    }
  }
}
