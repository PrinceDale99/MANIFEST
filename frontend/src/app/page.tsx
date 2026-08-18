'use client'

import { useEffect, useState } from 'react'
import { initializeMidnightClient } from '@/lib/midnight/client'
import type { WalletState } from '@/types/manifest'

export default function HomePage() {
  const [wallet, setWallet] = useState<WalletState | null>(null)

  useEffect(() => {
    initializeMidnightClient().then((ctx) => setWallet(ctx.wallet))
  }, [])

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center">
      {/* Hero */}
      <div className="mb-12 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 px-4 py-2">
          <div className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="font-mono text-xs text-zinc-400">Powered by Midnight Network</span>
        </div>

        <h1 className="mb-4 text-5xl font-bold tracking-tight text-white sm:text-6xl">
          Manifest
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-zinc-400">
          Zero-knowledge freight tendering. Sealed bids. Fair auctions.
          <br />
          No intermediaries. No data leaks.
        </p>
      </div>

      {/* Role Selection */}
      <div className="grid w-full max-w-3xl gap-6 sm:grid-cols-2">
        {/* Shipper Card */}
        <a
          href="/shipper"
          className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 transition-all hover:border-emerald-800 hover:bg-zinc-900"
        >
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-900/50 text-2xl">
            📦
          </div>
          <h2 className="mb-2 text-xl font-bold text-white group-hover:text-emerald-400">
            I'm a Shipper
          </h2>
          <p className="mb-6 text-sm text-zinc-400">
            Create freight tenders and run sealed-bid reverse auctions.
            Find the best carriers at fair market rates.
          </p>
          <div className="space-y-2 text-xs text-zinc-500">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Create tenders in seconds</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Bids stay sealed until reveal</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Cryptographic proof of fairness</span>
            </div>
          </div>
          <div className="mt-6">
            <span className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition-colors group-hover:bg-emerald-500">
              Open Shipper Dashboard
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
          </div>
        </a>

        {/* Carrier Card */}
        <a
          href="/carrier"
          className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 transition-all hover:border-cyan-800 hover:bg-zinc-900"
        >
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-cyan-900/50 text-2xl">
            🚛
          </div>
          <h2 className="mb-2 text-xl font-bold text-white group-hover:text-cyan-400">
            I'm a Carrier
          </h2>
          <p className="mb-6 text-sm text-zinc-400">
            Browse freight tenders and submit sealed bids.
            Your bid amount stays private until the reveal phase.
          </p>
          <div className="space-y-2 text-xs text-zinc-500">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Browse active tenders</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Submit bids with zero-knowledge proofs</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Deterministic salt derivation</span>
            </div>
          </div>
          <div className="mt-6">
            <span className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-5 py-2.5 text-sm font-medium text-white transition-colors group-hover:bg-cyan-500">
              Browse Tenders
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
          </div>
        </a>
      </div>

      {/* Wallet Status */}
      {wallet && !wallet.connected && (
        <div className="mt-8 text-center">
          <p className="text-xs text-zinc-500">
            Connect your Lace wallet to get started •{' '}
            <a href="https://lace.io" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300">
              Install Lace
            </a>
          </p>
        </div>
      )}

      {/* How It Works */}
      <div className="mt-16 w-full max-w-3xl">
        <h2 className="mb-8 text-center text-sm font-semibold uppercase tracking-wider text-zinc-500">
          How It Works
        </h2>
        <div className="grid gap-6 sm:grid-cols-4">
          {[
            { step: '1', label: 'Shipper Creates Tender', desc: 'Load specs are hashed on-chain' },
            { step: '2', label: 'Carriers Submit Bids', desc: 'Sealed with ZK commitments' },
            { step: '3', label: 'Reveal Phase', desc: 'Prove commitment preimage' },
            { step: '4', label: 'Lowest Bid Wins', desc: 'Settled with cryptographic proof' },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-sm font-bold text-emerald-400">
                {item.step}
              </div>
              <p className="mb-1 text-sm font-medium text-white">{item.label}</p>
              <p className="text-xs text-zinc-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
