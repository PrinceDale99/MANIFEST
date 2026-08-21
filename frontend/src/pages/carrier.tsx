// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import type { Tender } from '@/types/manifest'
import { TenderStatus } from '@/types/manifest'
import { tenderStore } from '@/lib/indexer/tender-store'
import StatusBadge from '@/components/ui/StatusBadge'
import LaneDisplay from '@/components/ui/LaneDisplay'
import EmptyState from '@/components/ui/EmptyState'

export default function CarrierBrowsePage() {
  const [tenders, setTenders] = useState<Tender[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'bidding' | 'reveal'>('all')

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

  // Filter and sort chronologically (newest first)
  const filteredTenders = tenders
    .filter((t) => {
      if (filter === 'bidding') return t.status === TenderStatus.BIDDING_OPEN
      if (filter === 'reveal') return t.status === TenderStatus.REVEAL_PHASE
      return t.status === TenderStatus.BIDDING_OPEN || t.status === TenderStatus.REVEAL_PHASE
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const biddingCount = tenders.filter((t) => t.status === TenderStatus.BIDDING_OPEN).length
  const revealCount = tenders.filter((t) => t.status === TenderStatus.REVEAL_PHASE).length

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-2xl font-bold text-white">Available Auctions</h1>
        <p className="text-sm text-zinc-400">
          Find freight jobs and submit private bids. Your bid amount stays hidden until the reveal phase.
        </p>
      </div>

      {/* Stats & Filters */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400 hover:bg-zinc-800/50'
            }`}
          >
            All ({biddingCount + revealCount})
          </button>
          <button
            onClick={() => setFilter('bidding')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filter === 'bidding'
                ? 'bg-emerald-900/50 text-emerald-400'
                : 'text-zinc-400 hover:bg-zinc-800/50'
            }`}
          >
            Accepting Bids ({biddingCount})
          </button>
          <button
            onClick={() => setFilter('reveal')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filter === 'reveal'
                ? 'bg-amber-900/50 text-amber-400'
                : 'text-zinc-400 hover:bg-zinc-800/50'
            }`}
          >
            Revealing ({revealCount})
          </button>
        </div>
        <p className="text-xs text-zinc-500">
          {filteredTenders.length} auction{filteredTenders.length !== 1 ? 's' : ''} available
        </p>
      </div>

      {/* Tenders List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-emerald-400" />
            <p className="text-sm text-zinc-400">Loading tenders...</p>
          </div>
        </div>
      ) : filteredTenders.length === 0 ? (
        <EmptyState
          icon="🚛"
          title="No Auctions Available"
          description="Check back later for new freight jobs. All bids are private and mathematically guaranteed."
        />
      ) : (
        <div className="space-y-3">
          {filteredTenders.map((tender) => (
            <a
              key={tender.tenderId}
              href={`/carrier/tender/${tender.tenderId}`}
              className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 transition-all hover:border-zinc-700 hover:bg-zinc-900"
            >
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <StatusBadge status={tender.status} />
                    <span className="font-mono text-xs text-zinc-500">
                      #{tender.tenderId.slice(0, 8)}
                    </span>
                  </div>
                  <LaneDisplay
                    origin={tender.loadSpec?.origin || '—'}
                    destination={tender.loadSpec?.destination || '—'}
                    size="sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 text-right">
                <div>
                  <p className="text-xs text-zinc-500">Equipment</p>
                  <p className="text-sm text-white">
                    {tender.loadSpec?.equipmentType?.replace('_', ' ') || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Weight</p>
                  <p className="font-mono text-sm text-white">
                    {tender.loadSpec?.weightLbs
                      ? `${(tender.loadSpec.weightLbs / 1000).toFixed(0)}k`
                      : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Bids</p>
                  <p className="font-mono text-sm text-white">{tender.carrierCount}</p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-900/50 px-3 py-1.5 text-xs font-medium text-emerald-400">
                  Place Bid
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
