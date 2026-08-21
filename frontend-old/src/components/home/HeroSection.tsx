'use client'

import { useEffect, useState } from 'react'

export default function HeroSection() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="relative min-h-[90vh] overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950" />
        <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-emerald-500/10 blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-[128px]" />
        <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/5 blur-[128px]" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {mounted && (
          <>
            <div className="absolute top-[20%] left-[15%] h-2 w-2 rounded-full bg-emerald-400/30 animate-float" />
            <div className="absolute top-[40%] right-[20%] h-1.5 w-1.5 rounded-full bg-cyan-400/30 animate-float" style={{ animationDelay: '1s' }} />
            <div className="absolute top-[60%] left-[30%] h-1 w-1 rounded-full bg-violet-400/30 animate-float" style={{ animationDelay: '2s' }} />
            <div className="absolute top-[30%] right-[35%] h-1.5 w-1.5 rounded-full bg-emerald-400/20 animate-float" style={{ animationDelay: '0.5s' }} />
            <div className="absolute top-[70%] right-[10%] h-2 w-2 rounded-full bg-cyan-400/20 animate-float" style={{ animationDelay: '1.5s' }} />
          </>
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-[90vh] flex-col items-center justify-center px-4">
        {/* Badge */}
        <div className="mb-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-4 py-2 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="font-mono text-xs text-zinc-400">Live on Midnight Network</span>
          </div>
        </div>

        {/* Main heading */}
        <h1 className="mb-6 max-w-4xl text-center text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
          <span className="text-white">The future of</span>
          <br />
          <span className="animate-gradient-text">freight bidding</span>
          <br />
          <span className="text-white">is private</span>
        </h1>

        {/* Subheading */}
        <p className="mb-10 max-w-2xl text-center text-lg text-zinc-400 sm:text-xl">
          Fair, private freight auctions powered by zero-knowledge math.
          Carriers can't see each other's bids. No middlemen. No data leaks.
        </p>

        {/* CTA Buttons */}
        <div className="mb-16 flex flex-col items-center gap-4 sm:flex-row">
          <a
            href="/shipper"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-white px-8 py-4 text-base font-semibold text-black transition-all hover:scale-105"
          >
            <span className="relative z-10">Post a Freight Tender</span>
            <svg className="relative z-10 h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 opacity-0 transition-opacity group-hover:opacity-100" />
            <span className="relative z-10 group-hover:text-white">Post a Freight Tender</span>
          </a>

          <a
            href="/carrier"
            className="group inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/50 px-8 py-4 text-base font-semibold text-zinc-300 transition-all hover:border-emerald-800 hover:bg-zinc-800 hover:text-white hover:scale-105"
          >
            <span>Browse Tenders</span>
            <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-zinc-500">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Zero-knowledge proofs</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Bids stay private</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Instant settlement</span>
          </div>
        </div>
      </div>
    </section>
  )
}
