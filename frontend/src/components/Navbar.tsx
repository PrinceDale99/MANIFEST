'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import type { WalletState, ProofServerStatus } from '@/types/manifest'
import { createHealthMonitor } from '@/lib/midnight/proof-service'
import { initializeMidnightClient } from '@/lib/midnight/client'

export default function Navbar() {
  const pathname = usePathname()
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    network: 'preview',
  })
  const [proofServer, setProofServer] = useState<ProofServerStatus>({
    connected: false,
    latencyMs: 0,
    lastHeartbeat: null,
  })
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    initializeMidnightClient().then((ctx) => setWallet(ctx.wallet))
    const cleanup = createHealthMonitor(setProofServer)
    return cleanup
  }, [])

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/'
    return pathname.startsWith(path)
  }

  const navLinks = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/shipper', label: 'Shipper', icon: '📦' },
    { href: '/carrier', label: 'Carrier', icon: '🚛' },
    { href: '/audit', label: 'Audit', icon: '🔍' },
  ]

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <a href="/" className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500">
            <span className="text-sm font-bold text-white">M</span>
          </div>
          <span className="font-mono text-lg font-semibold tracking-tight text-white">
            Manifest
          </span>
        </a>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-300'
              }`}
            >
              <span className="text-xs">{link.icon}</span>
              {link.label}
            </a>
          ))}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {/* Network Badge */}
          <span className="hidden rounded-full border border-zinc-700 bg-zinc-800/50 px-2.5 py-1 font-mono text-[11px] uppercase text-zinc-400 sm:inline">
            {wallet.network}
          </span>

          {/* Proof Server Status */}
          <div className="hidden items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800/50 px-2.5 py-1 sm:flex">
            <div
              className={`h-1.5 w-1.5 rounded-full ${
                proofServer.connected ? 'bg-emerald-400' : 'bg-red-400'
              }`}
            />
            <span className="font-mono text-[11px] text-zinc-400">
              {proofServer.connected ? `${proofServer.latencyMs}ms` : 'Offline'}
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
            <button
              onClick={async () => {
                const ctx = await initializeMidnightClient()
                setWallet(ctx.wallet)
              }}
              className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-zinc-200"
            >
              Connect Wallet
            </button>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 md:hidden"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-zinc-800 px-4 py-3 md:hidden">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:bg-zinc-800/50'
              }`}
            >
              <span>{link.icon}</span>
              {link.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  )
}
