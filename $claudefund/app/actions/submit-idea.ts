'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { anthropic } from '@/lib/anthropic'
import { revalidatePath } from 'next/cache'

const SubmitSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters').max(500, 'Description must be less than 500 characters'),
})

export async function submitIdea(formData: FormData) {
  try {
    // 1. Validate input
    const validated = SubmitSchema.parse({
      email: formData.get('email'),
      title: formData.get('title'),
      description: formData.get('description'),
    })

    // 2. Get settings and check if submissions are paused
    const settings = await prisma.settings.findUnique({ where: { id: 1 } })
    if (settings?.submissionsPaused) {
      return {
        success: false,
        error: 'Submissions are currently paused. Please try again later.',
      }
    }

    const currentCycle = settings?.currentCycle || 1

    // 3. Check if email has EVER been funded (permanent block)
    const fundedIdea = await prisma.idea.findFirst({
      where: {
        email: validated.email,
        status: 'funded',
      },
    })

    if (fundedIdea) {
      return {
        success: false,
        error: 'This email has already received funding and cannot submit again.',
      }
    }

    // 4. Check if email has already submitted in the CURRENT cycle (temporary block)
    const existingIdeaThisCycle = await prisma.idea.findFirst({
      where: {
        email: validated.email,
        cycleId: currentCycle,
        status: 'active', // Only check active ideas, not funded ones
      },
    })

    if (existingIdeaThisCycle) {
      return {
        success: false,
        error: 'You have already submitted an idea this cycle. Please wait for the next cycle.',
      }
    }

    // 5. Claude AI Vetting
    const vetResult = await vetWithClaude(validated.title, validated.description)

    if (!vetResult.approved) {
      return {
        success: false,
        error: `Your idea was not approved by Claude AI: ${vetResult.reason}`,
      }
    }

    // 6. Save to database with current cycle
    const idea = await prisma.idea.create({
      data: {
        email: validated.email,
        title: validated.title,
        description: validated.description,
        status: 'active',
        cycleId: currentCycle,
      },
    })

    // 7. Revalidate leaderboard
    revalidatePath('/leaderboard')

    return { success: true, ideaId: idea.id }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || 'Validation failed',
      }
    }

    console.error('Submit idea error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    }
  }
}

async function vetWithClaude(title: string, description: string) {
  console.log('\n=== CLAUDE AI VETTING DEBUG ===')
  console.log('Title:', title)
  console.log('Description:', description)
  console.log('API Key present?', !!process.env.ANTHROPIC_API_KEY)
  console.log('API Key starts with:', process.env.ANTHROPIC_API_KEY?.substring(0, 10))

  try {
    console.log('Calling Anthropic API...')

    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `You are a strict evaluator for a developer funding program. You must REJECT ideas that:

1. Are nonsensical, gibberish, or don't form coherent sentences
2. Don't clearly describe an app or website concept
3. Can't realistically be built as software (e.g., physical products, services)
4. Don't explain what the app/website actually does
5. Are just random thoughts or unrelated sentences
6. Are inappropriate or offensive

Examples of ideas to REJECT:
- "Football is game, my mother doesnt play, go up in tree" (gibberish, no app concept)
- "Make things better and faster" (too vague, no specific app)
- "A flying car service" (not software)
- "Best app ever" (doesn't explain what it does)

Examples of ideas to APPROVE:
- "A todo list app with AI-powered task prioritization"
- "Recipe sharing website where users can rate and comment on dishes"
- "Fitness tracker that sends daily workout reminders"

Idea title: ${title}
Idea description: ${description}

Carefully evaluate if this describes a REAL, BUILDABLE app or website concept with a clear purpose. Respond with JSON only:
{
  "approved": boolean,
  "reason": "short explanation"
}`,
        },
      ],
    })

    console.log('API Response received!')
    console.log('Response content type:', message.content[0].type)

    const content =
      message.content[0].type === 'text' ? message.content[0].text : ''

    console.log('Raw API response:', content)

    const result = JSON.parse(content)
    console.log('Parsed result:', result)
    console.log('Approved?', result.approved)
    console.log('Reason:', result.reason)
    console.log('=== END VETTING DEBUG ===\n')

    return {
      approved: result.approved,
      reason: result.reason || 'No reason provided',
    }
  } catch (error) {
    console.error('❌ Claude vetting FAILED with error:', error)
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error)
    console.error('Error message:', error instanceof Error ? error.message : String(error))
    console.log('=== END VETTING DEBUG (ERROR) ===\n')

    // If Claude fails, REJECT to be safe (changed from auto-approve)
    return {
      approved: false,
      reason: 'Vetting service error - please try again or contact support',
    }
  }
}
