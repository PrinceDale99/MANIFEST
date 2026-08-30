'use client'

import { useEffect, useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ShieldCheck,
  Truck,
  Package,
  Search,
  Wallet,
  Cpu,
  Menu,
  X,
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react'
import type { WalletState, ProofServerStatus } from '@/types/manifest'
import { createHealthMonitor } from '@/lib/midnight/proof-service'
import { initializeMidnightClient } from '@/lib/midnight/client'
import WalletModal from '@/components/ui/WalletModal'

export default function Navbar() {
  const pathname = useLocation().pathname
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    network: (localStorage.getItem('midnight_network_id') || 'preview') as any,
  })
  const [proofServer, setProofServer] = useState<ProofServerStatus>({
    connected: false,
    latencyMs: 0,
    lastHeartbeat: null,
  })
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [walletModalOpen, setWalletModalOpen] = useState(false)

  useEffect(() => {
    initializeMidnightClient().then((ctx) => setWallet(ctx.wallet))
    const cleanup = createHealthMonitor(setProofServer)
    return cleanup
  }, [])

  const navLinks = [
    { href: '/', label: 'Overview', icon: Sparkles },
    { href: '/shipper', label: 'Shipper Portal', icon: Package },
    { href: '/carrier', label: 'Freight Board', icon: Truck },
    { href: '/audit', label: 'ZK Verifier', icon: Search },
  ]

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/'
    return pathname.startsWith(path)
  }

  const truncateAddress = (addr?: string) => {
    if (!addr) return ''
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`
  }

  return (
    <>
      <nav className="sticky top-0 z-40 border-b border-white/[0.08] bg-background/80 backdrop-blur-2xl transition-all">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 via-cyan-500 to-violet-600 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <span className="font-mono text-base font-bold text-white tracking-tighter">M</span>
              <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                MANIFEST
                <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  ZK-v1
                </span>
              </span>
              <span className="text-[10px] text-zinc-400 font-sans tracking-wide">
                Zero-Knowledge Freight Exchange
              </span>
            </div>
          </Link>

          {/* Desktop Navigation with Animated Pill */}
          <div className="hidden md:flex items-center gap-1.5 p-1 rounded-xl bg-surface-100/80 border border-white/5">
            {navLinks.map((link) => {
              const Icon = link.icon
              const active = isActive(link.href)
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`relative flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                    active ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="navbar-active-pill"
                      className="absolute inset-0 rounded-lg bg-surface-300 border border-white/10 shadow-sm"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon className={`h-3.5 w-3.5 ${active ? 'text-emerald-400' : 'text-zinc-400'}`} />
                    {link.label}
                  </span>
                </Link>
              )
            })}
          </div>

          {/* Right Side Status & Wallet */}
          <div className="flex items-center gap-2.5">
            {/* Proof Server Status */}
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-white/10 bg-surface-100/90 px-3 py-1 text-xs">
              <div
                className={`h-2 w-2 rounded-full ${
                  proofServer.connected
                    ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                    : 'bg-amber-400 animate-pulse'
                }`}
              />
              <span className="font-mono text-[11px] text-zinc-300 flex items-center gap-1">
                <Cpu className="h-3 w-3 text-cyan-400" />
                {proofServer.connected ? `${proofServer.latencyMs}ms` : 'Prover Syncing'}
              </span>
            </div>

            {/* Network Pill */}
            <div className="hidden lg:flex items-center gap-1.5 rounded-full border border-white/10 bg-surface-100/90 px-2.5 py-1 text-[11px] font-mono text-zinc-300 uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
              Midnight Preview
            </div>

            {/* Wallet Button */}
            {wallet.connected ? (
              <button
                onClick={() => setWalletModalOpen(true)}
                className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/40 hover:bg-emerald-900/50 px-3.5 py-1.5 transition-all group"
              >
                <div className="h-2 w-2 rounded-full bg-emerald-400 group-hover:scale-125 transition-transform" />
                <span className="font-mono text-xs font-semibold text-emerald-300">
                  {truncateAddress(wallet.address)}
                </span>
              </button>
            ) : (
              <button
                onClick={async () => {
                  const ctx = await initializeMidnightClient()
                  setWallet(ctx.wallet)
                  setWalletModalOpen(true)
                }}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-semibold text-xs px-4 py-2 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all hover:scale-[1.02]"
              >
                <Wallet className="h-3.5 w-3.5 text-black" />
                Connect 1AM Wallet
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-surface-200 md:hidden transition-colors"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-t border-white/10 bg-surface-50 px-4 py-3 md:hidden space-y-2"
          >
            {navLinks.map((link) => {
              const Icon = link.icon
              const active = isActive(link.href)
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                    active ? 'bg-surface-200 text-white' : 'text-zinc-400 hover:bg-surface-100 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${active ? 'text-emerald-400' : 'text-zinc-500'}`} />
                    {link.label}
                  </div>
                  <ChevronRight className="h-4 w-4 text-zinc-600" />
                </Link>
              )
            })}
          </motion.div>
        )}
      </nav>

      {/* Wallet Management Modal */}
      <WalletModal
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        wallet={wallet}
        proofServer={proofServer}
      />
    </>
  )
}

