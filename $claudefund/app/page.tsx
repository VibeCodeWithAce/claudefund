import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl sm:text-6xl font-bold mb-6 text-gray-900">
          ClaudeFund
        </h1>

        <p className="text-xl sm:text-2xl text-gray-700 mb-4 leading-relaxed">
          Get funded to build your idea with Claude Pro.
        </p>

        <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
          Submit your app or website idea. If it passes Claude AI review, it goes live on our leaderboard.
          The top 3 most-liked ideas every 24 hours win a Claude Pro subscription — funded by $ClaudeFund Creator Fees.
        </p>

        <p className="text-lg sm:text-xl text-gray-600 mb-12">
          No strings attached. Just build.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/submit"
            className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Submit Your Idea
          </Link>

          <Link
            href="/leaderboard"
            className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition-colors"
          >
            View Leaderboard
          </Link>
        </div>
      </div>
    </main>
  );
}
