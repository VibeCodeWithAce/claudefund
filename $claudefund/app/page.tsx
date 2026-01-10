import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-7xl sm:text-8xl font-bold mb-6 font-radley">
          <span className="text-gray-100">Claude</span>
          <span className="text-[#da7756]">Fund</span>
        </h1>

        <p className="text-xl sm:text-2xl text-[#f5e6d3] mb-4 leading-relaxed">
          Get funded to build your idea with Claude Pro.
        </p>

        <p className="text-lg sm:text-xl text-gray-300 mb-8 leading-relaxed max-w-3xl mx-auto">
          Submit your app or website idea. If it passes Claude AI review, it goes live on our leaderboard.
          The top 3 most-liked ideas every 24 hours win a Claude Pro subscription — funded by $ClaudeFund Creator Fees.
        </p>

        <p className="text-lg sm:text-xl text-gray-300 mb-12">
          No strings attached. Just build.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/submit"
            className="bg-[#da7756] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#c96645] transition-colors"
          >
            Submit Your Idea
          </Link>

          <Link
            href="/leaderboard"
            className="bg-[#2a2a2a] text-[#da7756] px-8 py-4 rounded-lg text-lg font-semibold border-2 border-[#da7756] hover:bg-[#3a3a3a] transition-colors"
          >
            View Leaderboard
          </Link>
        </div>
      </div>
    </main>
  );
}
