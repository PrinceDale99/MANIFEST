'use client'

import { useEffect, useState } from 'react'
import type { WalletState, ProofServerStatus } from '@/types/manifest'
import { createHealthMonitor } from '@/lib/midnight/proof-service'
import { initializeMidnightClient } from '@/lib/midnight/client'

export default function Navbar() {
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    network: 'preview',
  })
  const [proofServer, setProofServer] = useState<ProofServerStatus>({
    connected: false,
    latencyMs: 0,
    lastHeartbeat: null,
  })

  useEffect(() => {
    // Initialize wallet
    initializeMidnightClient().then((ctx) => setWallet(ctx.wallet))

    // Start proof server health monitor
    const cleanup = createHealthMonitor(setProofServer)
    return cleanup
  }, [])

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500">
            <span className="text-sm font-bold text-white">M</span>
          </div>
          <span className="font-mono text-lg font-semibold tracking-tight text-white">
            Manifest
          </span>
          <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-400">
            ZK Protocol
          </span>
        </div>

        {/* Navigation Links */}
        <div className="hidden items-center gap-1 md:flex">
          <a
            href="/"
            className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
          >
            Marketplace
          </a>
          <a
            href="/shipper/dashboard"
            className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
          >
            Shipper
          </a>
          <a
            href="/carrier/bids"
            className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
          >
            Carrier
          </a>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-3">
          {/* Network Badge */}
          <span className="rounded-full border border-zinc-700 bg-zinc-800/50 px-2.5 py-1 font-mono text-[11px] uppercase text-zinc-400">
            {wallet.network}
          </span>

          {/* Proof Server Status */}
          <div className="flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800/50 px-2.5 py-1">
            <div
              className={`h-1.5 w-1.5 rounded-full ${
                proofServer.connected ? 'bg-emerald-400' : 'bg-red-400'
              }`}
            />
            <span className="font-mono text-[11px] text-zinc-400">
              {proofServer.connected
                ? `${proofServer.latencyMs}ms`
                : 'Offline'}
            </span>
          </div>

          {/* Wallet Connection */}
          {wallet.connected ? (
            <div className="flex items-center gap-2 rounded-full border border-emerald-800 bg-emerald-900/30 px-3 py-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span className="font-mono text-xs text-emerald-300">
                {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
              </span>
            </div>
          ) : (
            <button className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-zinc-200">
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}
