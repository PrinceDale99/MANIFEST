'use client'

import { useState } from 'react'
import LaneDisplay from '@/components/ui/LaneDisplay'
import EmptyState from '@/components/ui/EmptyState'

interface CarrierBid {
  tenderId: string
  origin: string
  destination: string
  bidAmount: number
  status: 'sealed' | 'revealed' | 'won' | 'lost'
  submittedAt: string
  proofHash?: string
}

export default function CarrierBidsPage() {
  const [filter, setFilter] = useState<'all' | 'active' | 'history'>('all')

  // Demo data — in production fetched from indexer
  const bids: CarrierBid[] = [
    {
      tenderId: '0x7a3f...b2c1',
      origin: 'Chicago, IL',
      destination: 'Dallas, TX',
      bidAmount: 275,
      status: 'sealed',
      submittedAt: '2h ago',
    },
    {
      tenderId: '0x9e1d...f4a8',
      origin: 'Los Angeles, CA',
      destination: 'Phoenix, AZ',
      bidAmount: 195,
      status: 'revealed',
      submittedAt: '6h ago',
      proofHash: '0x8f2a...c3d1',
    },
    {
      tenderId: '0x4b8c...e7d2',
      origin: 'New York, NY',
      destination: 'Boston, MA',
      bidAmount: 150,
      status: 'won',
      submittedAt: '1d ago',
      proofHash: '0x3c1f...a9b7',
    },
  ]

  const statusColors = {
    sealed: 'bg-zinc-800 text-zinc-400',
    revealed: 'bg-amber-900/50 text-amber-400',
    won: 'bg-emerald-900/50 text-emerald-400',
    lost: 'bg-red-900/50 text-red-400',
  }

  const statusLabels = {
    sealed: 'Sealed',
    revealed: 'Revealed',
    won: 'Won',
    lost: 'Lost',
  }

  const filteredBids = bids.filter((b) => {
    if (filter === 'active') return b.status === 'sealed' || b.status === 'revealed'
    if (filter === 'history') return b.status === 'won' || b.status === 'lost'
    return true
  })

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-2xl font-bold text-white">Your Bids</h1>
        <p className="text-sm text-zinc-400">
          Track your private bids and see who won.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            filter === 'all' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-800/50'
          }`}
        >
          All ({bids.length})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            filter === 'active' ? 'bg-emerald-900/50 text-emerald-400' : 'text-zinc-400 hover:bg-zinc-800/50'
          }`}
        >
          In Progress ({bids.filter((b) => b.status === 'sealed' || b.status === 'revealed').length})
        </button>
        <button
          onClick={() => setFilter('history')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            filter === 'history' ? 'bg-indigo-900/50 text-indigo-400' : 'text-zinc-400 hover:bg-zinc-800/50'
          }`}
        >
          History ({bids.filter((b) => b.status === 'won' || b.status === 'lost').length})
        </button>
      </div>

      {/* Bids List */}
      {filteredBids.length === 0 ? (
        <EmptyState
          icon="🔒"
          title="No Bids Yet"
          description="Find an auction and submit your first private bid."
          action={{ label: 'Find Auctions', href: '/carrier' }}
        />
      ) : (
        <div className="space-y-3">
          {filteredBids.map((bid) => (
            <div
              key={bid.tenderId}
              className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 transition-colors hover:border-zinc-700"
            >
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="mb-2">
                    <LaneDisplay origin={bid.origin} destination={bid.destination} size="sm" />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-zinc-500">{bid.tenderId}</span>
                    <span className="text-xs text-zinc-600">•</span>
                    <span className="text-xs text-zinc-500">{bid.submittedAt}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-mono text-sm font-semibold text-emerald-400">
                    ${(bid.bidAmount / 100).toFixed(2)}/mi
                  </p>
                </div>

                <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase ${statusColors[bid.status]}`}>
                  {statusLabels[bid.status]}
                </span>

                {bid.proofHash && (
                  <span className="font-mono text-[10px] text-zinc-600">
                    🔒 {bid.proofHash}
                  </span>
                )}

                <svg className="h-4 w-4 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
