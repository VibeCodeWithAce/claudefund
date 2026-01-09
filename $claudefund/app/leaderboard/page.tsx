import { prisma } from '@/lib/prisma'
import { CountdownTimer } from '@/components/countdown-timer'
import { IdeaCard } from '@/components/idea-card'

export const dynamic = 'force-dynamic'

export default async function LeaderboardPage() {
  const [ideas, settings] = await Promise.all([
    prisma.idea.findMany({
      where: { status: 'active' },
      orderBy: [{ likes: 'desc' }, { createdAt: 'desc' }],
    }),
    prisma.settings.findUnique({ where: { id: 1 } }),
  ])

  return (
    <div className="min-h-screen bg-[#1a1a1a] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-100 mb-8 text-center">
          Leaderboard
        </h1>

        <CountdownTimer
          customDeadline={
            settings?.nextSelectionTime
              ? settings.nextSelectionTime.toISOString()
              : null
          }
        />

        {ideas.length === 0 ? (
          <div className="bg-[#2a2a2a] rounded-lg shadow-md p-12 text-center border border-gray-800">
            <p className="text-xl text-gray-300 mb-4">
              No ideas submitted yet!
            </p>
            <p className="text-gray-400">
              Be the first to submit your idea and compete for funding.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {ideas.map((idea, index) => (
              <div key={idea.id} className="relative">
                {index < 3 && (
                  <div className="absolute -left-4 top-4 bg-[#da7756] text-white px-3 py-1 rounded-full text-sm font-bold shadow-md">
                    #{index + 1}
                  </div>
                )}
                <IdeaCard
                  id={idea.id}
                  email={idea.email}
                  title={idea.title}
                  description={idea.description}
                  likes={idea.likes}
                  createdAt={idea.createdAt}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
