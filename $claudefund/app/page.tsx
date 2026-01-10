import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="flex items-center justify-center gap-4 mb-6">
          <Image
            src="/icon.png"
            alt="ClaudeFund Logo"
            width={96}
            height={96}
            className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24"
          />
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold font-radley">
            <span className="text-gray-100">Claude</span>
            <span className="text-[#da7756]">Fund</span>
          </h1>
        </div>

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
