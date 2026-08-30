// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Truck,
  MapPin,
  Clock,
  DollarSign,
  ShieldCheck,
  Search,
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Layers,
  Thermometer,
  Lock
} from 'lucide-react'
import type { Tender } from '@/types/manifest'
import { TenderStatus, EquipmentType } from '@/types/manifest'
import { tenderStore } from '@/lib/indexer/tender-store'
import StatusBadge from '@/components/ui/StatusBadge'
import LaneDisplay from '@/components/ui/LaneDisplay'
import EmptyState from '@/components/ui/EmptyState'
import CountdownTimer from '@/components/ui/CountdownTimer'

const EQUIPMENT_FILTERS = [
  { id: 'all', label: 'All Equipment' },
  { id: EquipmentType.DRY_VAN, label: 'Dry Van' },
  { id: EquipmentType.REEFER, label: 'Reefer' },
  { id: EquipmentType.FLATBED, label: 'Flatbed' },
]

export default function CarrierBrowsePage() {
  const [tenders, setTenders] = useState<Tender[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<'all' | 'bidding' | 'reveal'>('all')
  const [equipmentFilter, setEquipmentFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    tenderStore.start()
    const unsub = tenderStore.subscribe((t) => {
      setTenders(t || [])
      setLoading(false)
    })
    return () => {
      unsub()
      tenderStore.stop()
    }
  }, [])

  // Filter & Search
  const filteredTenders = tenders
    .filter((t) => {
      if (statusFilter === 'bidding') return t.status === TenderStatus.BIDDING_OPEN
      if (statusFilter === 'reveal') return t.status === TenderStatus.REVEAL_PHASE
      return t.status === TenderStatus.BIDDING_OPEN || t.status === TenderStatus.REVEAL_PHASE
    })
    .filter((t) => {
      if (equipmentFilter === 'all') return true
      return t.loadSpec?.equipmentType === equipmentFilter
    })
    .filter((t) => {
      if (!searchQuery) return true
      const q = searchQuery.toLowerCase()
      const origin = (t.loadSpec?.origin || '').toLowerCase()
      const dest = (t.loadSpec?.destination || '').toLowerCase()
      const id = (t.tenderId || '').toLowerCase()
      return origin.includes(q) || dest.includes(q) || id.includes(q)
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const biddingCount = tenders.filter((t) => t.status === TenderStatus.BIDDING_OPEN).length
  const revealCount = tenders.filter((t) => t.status === TenderStatus.REVEAL_PHASE).length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-semibold text-cyan-400">
            <Truck className="h-3.5 w-3.5" />
            Carrier Freight Exchange
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Live Freight Board</h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Browse verified freight loads and place private zero-knowledge bids. Competitors cannot see your rates.
          </p>
        </div>

        <Link
          to="/carrier/bids"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-surface-200 hover:bg-surface-300 border border-white/10 text-white font-semibold text-xs transition-colors"
        >
          <Lock className="h-3.5 w-3.5 text-emerald-400" />
          My Active Bids & Reveals
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-100/90 border border-white/5 overflow-x-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === 'all' ? 'bg-surface-300 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              All Open Freight ({biddingCount + revealCount})
            </button>
            <button
              onClick={() => setStatusFilter('bidding')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === 'bidding' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Accepting Bids ({biddingCount})
            </button>
            <button
              onClick={() => setStatusFilter('reveal')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === 'reveal' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-zinc-400 hover:text-white'
              }`}
            >
              In Reveal Phase ({revealCount})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search origin, destination, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full glass-input pl-9 pr-3 py-2 rounded-xl text-xs text-white placeholder-zinc-500"
            />
          </div>
        </div>

        {/* Equipment Type Quick Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs text-zinc-500 font-medium">Equipment:</span>
          {EQUIPMENT_FILTERS.map((eq) => (
            <button
              key={eq.id}
              onClick={() => setEquipmentFilter(eq.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                equipmentFilter === eq.id
                  ? 'bg-surface-200 border border-white/10 text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {eq.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tenders Grid / List */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-cyan-400" />
          <p className="text-xs text-zinc-400 font-mono">Loading active freight board...</p>
        </div>
      ) : filteredTenders.length === 0 ? (
        <EmptyState
          icon="🚛"
          title="No Freight Auctions Match Your Search"
          description="Adjust your search filters or check back shortly for new loads posted by shippers."
        />
      ) : (
        <div className="space-y-3.5">
          {filteredTenders.map((tender) => (
            <Link
              key={tender.tenderId}
              to={`/carrier/tender/${tender.tenderId}`}
              className="group block p-5 sm:p-6 rounded-2xl glass-card glass-card-hover border border-white/10 hover:border-cyan-500/40 transition-all shadow-lg"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                {/* Left: Status & Lane */}
                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center gap-3">
                    <StatusBadge status={tender.status} />
                    <span className="font-mono text-xs text-zinc-500">#{tender.tenderId.slice(0, 10)}</span>
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

                {/* Right: Equipment Specs, Sealed Bid Count & Action Button */}
                <div className="flex flex-wrap items-center gap-6 sm:gap-8 justify-between lg:justify-end pt-3 lg:pt-0 border-t lg:border-t-0 border-white/5 text-xs">
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
                    <span className="text-zinc-500 block">Competitor Bids</span>
                    <span className="font-mono font-bold text-cyan-400 text-sm">
                      {tender.carrierCount || 0} Sealed
                    </span>
                  </div>

                  <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-bold text-xs shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-all">
                    <span>{tender.status === TenderStatus.REVEAL_PHASE ? 'Reveal Rate' : 'Place Private Bid'}</span>
                    <ChevronRight className="h-3.5 w-3.5" />
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
