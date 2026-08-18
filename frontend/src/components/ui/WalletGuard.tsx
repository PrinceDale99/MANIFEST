'use client'

import { useEffect, useState } from 'react'
import { initializeMidnightClient } from '@/lib/midnight/client'
import type { WalletState } from '@/types/manifest'

interface WalletGuardProps {
  children: React.ReactNode
  /** Fallback to show when wallet is not connected */
  fallback?: React.ReactNode
}

export default function WalletGuard({ children, fallback }: WalletGuardProps) {
  const [wallet, setWallet] = useState<WalletState | null>(null)

  useEffect(() => {
    initializeMidnightClient().then((ctx) => setWallet(ctx.wallet))
  }, [])

  // Loading state
  if (wallet === null) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-emerald-400" />
          <p className="text-sm text-zinc-400">Checking wallet...</p>
        </div>
      </div>
    )
  }

  // Not connected
  if (!wallet.connected) {
    return (
      fallback || (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-12 text-center">
          <div className="mb-4 text-5xl">🔐</div>
          <h3 className="mb-2 text-lg font-semibold text-white">Connect Your Wallet</h3>
          <p className="mb-6 text-sm text-zinc-400 max-w-md mx-auto">
            Connect your Midnight wallet to interact with the freight tendering protocol.
            All bids are sealed with zero-knowledge proofs.
          </p>
          <button
            onClick={async () => {
              const ctx = await initializeMidnightClient()
              setWallet(ctx.wallet)
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-medium text-black transition-colors hover:bg-zinc-200"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Connect Lace Wallet
          </button>
          <p className="mt-4 text-xs text-zinc-500">
            Don't have Lace?{' '}
            <a href="https://lace.io" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300">
              Install it here
            </a>
          </p>
        </div>
      )
    )
  }

  // Connected — pass wallet info down
  return <>{children}</>
}

/** Hook to get wallet state from within guarded pages */
export function useWallet() {
  const [wallet, setWallet] = useState<WalletState | null>(null)

  useEffect(() => {
    initializeMidnightClient().then((ctx) => setWallet(ctx.wallet))
  }, [])

  return wallet
}
