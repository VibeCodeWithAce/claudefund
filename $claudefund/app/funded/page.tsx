import { prisma } from '@/lib/prisma'
import { maskEmail } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function FundedPage() {
  const fundedIdeas = await prisma.idea.findMany({
    where: { status: 'funded' },
    orderBy: { fundedAt: 'desc' },
  })

  return (
    <div className="min-h-screen bg-[#1a1a1a] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-100 mb-4 text-center">
          Funded Builders
        </h1>
        <p className="text-lg text-gray-300 mb-12 text-center">
          These amazing ideas won Claude Pro funding!
        </p>

        {fundedIdeas.length === 0 ? (
          <div className="bg-[#2a2a2a] rounded-lg shadow-md p-12 text-center border border-gray-800">
            <p className="text-xl text-gray-300 mb-4">
              No winners yet!
            </p>
            <p className="text-gray-400">
              The first winners will be selected at UTC midnight.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {fundedIdeas.map((idea) => (
              <div
                key={idea.id}
                className="bg-[#2a2a2a] rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-800"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-[#da7756] rounded-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-gray-100 mb-1 break-words">
                      {idea.title}
                    </h3>
                    <p className="text-sm text-gray-400">{maskEmail(idea.email)}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <span className="inline-block bg-[#da7756]/20 text-[#da7756] text-sm font-semibold px-4 py-2 rounded-full border border-[#da7756]/30">
                    Funded by $ClaudeFund Creator Fees
                  </span>
                </div>

                <p className="text-gray-300 mb-4 leading-relaxed whitespace-pre-wrap break-words">
                  {idea.description}
                </p>

                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div>
                    <span className="font-medium">Funded on:</span>{' '}
                    {idea.fundedAt
                      ? new Date(idea.fundedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : 'N/A'}
                  </div>
                  <div className="text-gray-700">|</div>
                  <div>
                    <span className="font-medium">Final votes:</span> {idea.likes}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
