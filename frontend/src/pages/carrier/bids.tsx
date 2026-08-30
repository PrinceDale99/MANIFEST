// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Truck,
  Lock,
  Eye,
  Trophy,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  ChevronRight,
  Download,
  AlertCircle,
  ExternalLink
} from 'lucide-react'
import LaneDisplay from '@/components/ui/LaneDisplay'
import EmptyState from '@/components/ui/EmptyState'

interface CarrierBidRecord {
  tenderId: string
  origin: string
  destination: string
  bidAmount: number
  salt: string
  commitmentHash: string
  status: 'sealed' | 'revealed' | 'won' | 'lost'
  timestamp: string
}

export default function CarrierBidsPage() {
  const [bids, setBids] = useState<CarrierBidRecord[]>([])
  const [filter, setFilter] = useState<'all' | 'active' | 'history'>('all')

  useEffect(() => {
    const saved = localStorage.getItem('manifest_carrier_bids')
    if (saved) {
      try {
        setBids(JSON.parse(saved) || [])
      } catch (e) {
        console.error(e)
        setBids([])
      }
    } else {
      setBids([])
    }
  }, [])

  const filteredBids = bids.filter((b) => {
    if (filter === 'active') return b.status === 'sealed' || b.status === 'revealed'
    if (filter === 'history') return b.status === 'won' || b.status === 'lost'
    return true
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-semibold text-cyan-400">
            <Lock className="h-3.5 w-3.5" />
            Carrier Portfolio
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">My Submitted Bids</h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Monitor your sealed zero-knowledge bids and execute rate reveals when auction windows close.
          </p>
        </div>

        <Link
          to="/carrier"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-bold text-xs shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-all"
        >
          <Truck className="h-4 w-4 text-black" />
          Find New Freight Loads
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-100/90 border border-white/5 w-fit">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filter === 'all' ? 'bg-surface-300 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
          }`}
        >
          All Bids ({bids.length})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filter === 'active' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Active / Sealed ({bids.filter((b) => b.status === 'sealed' || b.status === 'revealed').length})
        </button>
      </div>

      {/* Bids List */}
      {filteredBids.length === 0 ? (
        <EmptyState
          icon="🚛"
          title="No Carrier Bids Found"
          description="Browse open freight auctions to place your first zero-knowledge sealed bid."
          action={{ label: 'Browse Freight Board', href: '/carrier' }}
        />
      ) : (
        <div className="space-y-3.5">
          {filteredBids.map((bid, index) => (
            <div
              key={`${bid.tenderId}-${index}`}
              className="p-5 sm:p-6 rounded-2xl glass-card border border-white/10 hover:border-cyan-500/30 transition-all shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-5"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-surface-200 border border-white/10 text-cyan-300">
                    {bid.status === 'sealed' ? '🔒 Sealed Witness' : '⚡ Revealed'}
                  </span>
                  <span className="font-mono text-xs text-zinc-500">#{bid.tenderId.slice(0, 14)}</span>
                </div>

                <LaneDisplay origin={bid.origin} destination={bid.destination} size="md" />
              </div>

              <div className="flex flex-wrap items-center gap-6 sm:gap-8 justify-between lg:justify-end pt-3 lg:pt-0 border-t lg:border-t-0 border-white/5 text-xs">
                <div>
                  <span className="text-zinc-500 block">Your Sealed Rate</span>
                  <span className="font-mono font-extrabold text-emerald-400 text-base">
                    ${bid.bidAmount.toLocaleString()}
                  </span>
                </div>

                <div>
                  <span className="text-zinc-500 block">Saved Salt ($\sigma$)</span>
                  <span className="font-mono text-zinc-300 text-xs">{bid.salt.slice(0, 10)}...</span>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`https://explorer.1am.xyz/tx/${bid.commitmentHash || bid.tenderId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-200 hover:bg-surface-300 border border-white/10 text-zinc-300 hover:text-white text-xs font-semibold transition-colors"
                  >
                    <span>Explorer</span>
                    <ExternalLink className="h-3 w-3 text-cyan-400" />
                  </a>

                  <Link
                    to={`/carrier/tender/${bid.tenderId}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-200 hover:bg-surface-300 border border-white/10 text-white font-semibold text-xs transition-colors"
                  >
                    <span>Auction</span>
                    <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
