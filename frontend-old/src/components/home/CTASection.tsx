'use client'

export default function CTASection() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-zinc-900 to-cyan-900/20" />
        <div className="absolute top-0 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[128px]" />
      </div>

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
        <h2 className="mb-6 text-4xl font-bold text-white sm:text-5xl">
          Ready to bid fairly?
        </h2>
        <p className="mb-10 mx-auto max-w-2xl text-lg text-zinc-400">
          Join hundreds of shippers and carriers using math-powered auctions.
          No sign-up fees. No middlemen. Just fair freight bidding.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="/shipper/new"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-white px-8 py-4 text-base font-semibold text-black transition-all hover:scale-105"
          >
            <span className="relative z-10">Post Your First Tender</span>
            <svg className="relative z-10 h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 opacity-0 transition-opacity group-hover:opacity-100" />
            <span className="relative z-10 group-hover:text-white">Post Your First Tender</span>
          </a>

          <a
            href="/carrier"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/50 px-8 py-4 text-base font-semibold text-zinc-300 transition-all hover:border-emerald-800 hover:bg-zinc-800 hover:text-white hover:scale-105"
          >
            Start Bidding
          </a>
        </div>

        <p className="mt-8 text-sm text-zinc-500">
          No credit card required · Free for shippers · Pay only when you win
        </p>
      </div>
    </section>
  )
}
