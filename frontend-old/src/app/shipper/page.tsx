'use client'

import { useState, useEffect } from 'react'
import type { Tender } from '@/types/manifest'
import { TenderStatus } from '@/types/manifest'
import { tenderStore } from '@/lib/indexer/tender-store'
import StatusBadge from '@/components/ui/StatusBadge'
import LaneDisplay from '@/components/ui/LaneDisplay'
import EmptyState from '@/components/ui/EmptyState'

export default function ShipperDashboardPage() {
  const [tenders, setTenders] = useState<Tender[]>([])
  const [loading, setLoading] = useState(true)

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

  // Sort by newest first (chronological)
  const sortedTenders = [...tenders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  const activeCount = tenders.filter(
    (t) => t.status === TenderStatus.BIDDING_OPEN || t.status === TenderStatus.REVEAL_PHASE,
  ).length

  const settledCount = tenders.filter((t) => t.status === TenderStatus.SETTLED).length

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-2xl font-bold text-white">Your Tenders</h1>
          <p className="text-sm text-zinc-400">
            Create freight auctions and track bids from carriers.
          </p>
        </div>
        <a
          href="/shipper/new"
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Tender
        </a>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <p className="font-mono text-2xl font-bold text-white">{tenders.length}</p>
          <p className="text-xs text-zinc-500">Total Posted</p>
        </div>
        <div className="rounded-xl border border-emerald-900/50 bg-emerald-900/10 p-4">
          <p className="font-mono text-2xl font-bold text-emerald-400">{activeCount}</p>
          <p className="text-xs text-zinc-500">Collecting Bids</p>
        </div>
        <div className="rounded-xl border border-indigo-900/50 bg-indigo-900/10 p-4">
          <p className="font-mono text-2xl font-bold text-indigo-400">{settledCount}</p>
          <p className="text-xs text-zinc-500">Completed</p>
        </div>
      </div>

      {/* Tenders List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-emerald-400" />
            <p className="text-sm text-zinc-400">Loading tenders...</p>
          </div>
        </div>
      ) : sortedTenders.length === 0 ? (
        <EmptyState
          icon="📦"
          title="No Auctions Yet"
          description="Post your first freight auction to start receiving private bids from carriers."
          action={{ label: 'Post First Auction', href: '/shipper/new' }}
        />
      ) : (
        <div className="space-y-3">
          {sortedTenders.map((tender) => (
            <a
              key={tender.tenderId}
              href={`/shipper/tender/${tender.tenderId}`}
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
                  <p className="text-xs text-zinc-500">Bids</p>
                  <p className="font-mono text-sm text-white">{tender.carrierCount}</p>
                </div>
                {tender.lowestDisclosedBid && tender.lowestDisclosedBid < 0xFFFFFFFFFFFFFFFF ? (
                  <div>
                    <p className="text-xs text-zinc-500">Lowest</p>
                    <p className="font-mono text-sm text-emerald-400">
                      ${(tender.lowestDisclosedBid / 100).toFixed(2)}/mi
                    </p>
                  </div>
                ) : null}
                <div>
                  <p className="text-xs text-zinc-500">Equipment</p>
                  <p className="text-sm text-white">
                    {tender.loadSpec?.equipmentType?.replace('_', ' ') || '—'}
                  </p>
                </div>
                <svg className="h-4 w-4 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
