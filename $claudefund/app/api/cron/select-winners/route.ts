import { NextRequest, NextResponse } from 'next/server'
import { selectTopThreeWinners } from '@/app/actions/select-winners'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization')

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.error('Unauthorized cron attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Cron job triggered: Selecting winners...')

    // Pass false to indicate this is an automated trigger (not manual)
    const result = await selectTopThreeWinners(false)

    if (result.success) {
      console.log(
        `Cron job successful: ${result.winners} winner(s) selected`
      )
      return NextResponse.json({
        success: true,
        message: result.message,
        winners: result.winners,
      })
    } else {
      console.error(`Cron job failed: ${result.message}`)
      return NextResponse.json(
        {
          success: false,
          message: result.message,
        },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to select winners',
      },
      { status: 500 }
    )
  }
}
