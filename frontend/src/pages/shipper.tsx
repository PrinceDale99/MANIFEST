// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Package,
  Plus,
  Truck,
  Layers,
  Clock,
  CheckCircle2,
  DollarSign,
  ChevronRight,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Search
} from 'lucide-react'
import type { Tender } from '@/types/manifest'
import { TenderStatus } from '@/types/manifest'
import { tenderStore } from '@/lib/indexer/tender-store'
import StatusBadge from '@/components/ui/StatusBadge'
import LaneDisplay from '@/components/ui/LaneDisplay'
import EmptyState from '@/components/ui/EmptyState'
import CountdownTimer from '@/components/ui/CountdownTimer'

export default function ShipperDashboardPage() {
  const [tenders, setTenders] = useState<Tender[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'reveal' | 'settled'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    tenderStore.start()
    const unsub = tenderStore.subscribe((t) => {
      setTenders(t)
      setLoading(false)
    })
    return () => {
      unsub()
      tenderStore.stop()
    }
  }, [])

  // Filter & sort
  const filteredTenders = tenders
    .filter((t) => {
      if (filter === 'active') return t.status === TenderStatus.BIDDING_OPEN
      if (filter === 'reveal') return t.status === TenderStatus.REVEAL_PHASE
      if (filter === 'settled') return t.status === TenderStatus.SETTLED
      return true
    })
    .filter((t) => {
      if (!searchQuery) return true
      const q = searchQuery.toLowerCase()
      const origin = (t.loadSpec?.origin || '').toLowerCase()
      const dest = (t.loadSpec?.destination || '').toLowerCase()
      const eq = (t.loadSpec?.equipmentType || '').toLowerCase()
      const id = (t.tenderId || '').toLowerCase()
      return origin.includes(q) || dest.includes(q) || eq.includes(q) || id.includes(q)
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const totalBids = tenders.reduce((acc, t) => acc + (t.carrierCount || 0), 0)
  const activeCount = tenders.filter((t) => t.status === TenderStatus.BIDDING_OPEN).length
  const revealCount = tenders.filter((t) => t.status === TenderStatus.REVEAL_PHASE).length
  const settledCount = tenders.filter((t) => t.status === TenderStatus.SETTLED).length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
            <Package className="h-3.5 w-3.5" />
            Shipper Control Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Your Freight Tenders</h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Create zero-knowledge freight auctions, monitor sealed carrier bids, and settle winning loads.
          </p>
        </div>

        <Link
          to="/shipper/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-400 hover:from-emerald-400 hover:to-cyan-300 text-black font-bold text-xs shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-all"
        >
          <Plus className="h-4 w-4 text-black" />
          Post New Freight Auction
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Total Auctions</span>
            <Package className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-extrabold text-white">{tenders.length}</div>
          <p className="text-[10px] text-zinc-500">All posted freight loads</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Accepting Bids</span>
            <Clock className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-extrabold text-emerald-400">{activeCount}</div>
          <p className="text-[10px] text-zinc-500">Live sealed bidding window</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>In Reveal Phase</span>
            <Sparkles className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-extrabold text-amber-400">{revealCount}</div>
          <p className="text-[10px] text-zinc-500">Carriers proving rates</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Total Sealed Bids</span>
            <ShieldCheck className="h-4 w-4 text-violet-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-extrabold text-violet-300">{totalBids}</div>
          <p className="text-[10px] text-zinc-500">Zero-leakage carrier bids</p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-100/90 border border-white/5 overflow-x-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === 'all' ? 'bg-surface-300 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            All Tenders ({tenders.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === 'active' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Bidding Open ({activeCount})
          </button>
          <button
            onClick={() => setFilter('reveal')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === 'reveal' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-zinc-400 hover:text-white'
            }`}
          >
            In Reveal ({revealCount})
          </button>
          <button
            onClick={() => setFilter('settled')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === 'settled' ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Settled ({settledCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by city, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full glass-input pl-9 pr-3 py-1.5 rounded-xl text-xs text-white placeholder-zinc-500"
          />
        </div>
      </div>

      {/* Tender Cards List */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-emerald-400" />
          <p className="text-xs text-zinc-400 font-mono">Syncing on-chain state with Midnight Indexer...</p>
        </div>
      ) : filteredTenders.length === 0 ? (
        <EmptyState
          icon="📦"
          title="No Auctions Found"
          description="Create your first freight auction or change your active filters to view existing loads."
          action={{ label: 'Post New Tender', href: '/shipper/new' }}
        />
      ) : (
        <div className="space-y-3.5">
          {filteredTenders.map((tender) => (
            <Link
              key={tender.tenderId}
              to={`/shipper/tender/${tender.tenderId}`}
              className="group block p-5 rounded-2xl glass-card glass-card-hover border border-white/10 hover:border-emerald-500/40 transition-all shadow-lg"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Left: Lane & Status */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <StatusBadge status={tender.status} />
                    <span className="font-mono text-xs text-zinc-500">
                      #{tender.tenderId.slice(0, 10)}...
                    </span>
                    {tender.status === TenderStatus.BIDDING_OPEN && tender.biddingDeadline && (
                      <CountdownTimer deadline={tender.biddingDeadline} compact />
                    )}
                  </div>

                  <LaneDisplay
                    origin={tender.loadSpec?.origin || 'Los Angeles, CA'}
                    destination={tender.loadSpec?.destination || 'Chicago, IL'}
                    size="md"
                  />
                </div>

                {/* Right: Specifications & CTA */}
                <div className="flex flex-wrap items-center gap-6 sm:gap-8 justify-between md:justify-end pt-3 md:pt-0 border-t md:border-t-0 border-white/5 text-xs">
                  <div>
                    <span className="text-zinc-500 block">Equipment</span>
                    <span className="font-semibold text-white">
                      {tender.loadSpec?.equipmentType?.replace('_', ' ') || 'Dry Van'}
                    </span>
                  </div>

                  <div>
                    <span className="text-zinc-500 block">Weight</span>
                    <span className="font-mono font-semibold text-white">
                      {tender.loadSpec?.weightLbs
                        ? `${(tender.loadSpec.weightLbs / 1000).toFixed(0)}k lbs`
                        : '42k lbs'}
                    </span>
                  </div>

                  <div>
                    <span className="text-zinc-500 block">Sealed Bids</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">
                      {tender.carrierCount || 0}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-emerald-400 font-semibold group-hover:translate-x-1 transition-transform">
                    <span>Manage Tender</span>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
