'use client'

import { useState, useEffect } from 'react'
import type { Tender } from '@/types/manifest'
import { TenderStatus } from '@/types/manifest'
import { tenderStore } from '@/lib/indexer/tender-store'
import StatusBadge from '@/components/ui/StatusBadge'
import LaneDisplay from '@/components/ui/LaneDisplay'
import EmptyState from '@/components/ui/EmptyState'

export default function AuditPage() {
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

  // Only show settled tenders (auditable)
  const settledTenders = tenders
    .filter((t) => t.status === TenderStatus.SETTLED)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-2xl font-bold text-white">Audit Trail</h1>
        <p className="text-sm text-zinc-400">
          Publicly verifiable cryptographic proof that tenders were conducted fairly.
          All commitments and reveals are on-chain.
        </p>
      </div>

      {/* Info Banner */}
      <div className="mb-6 rounded-xl border border-cyan-900/50 bg-cyan-900/10 p-4">
        <p className="text-sm text-cyan-400">
          🔍 Every settled tender has a complete audit trail. You can verify that:
          all bids were sealed during bidding, the lowest bid won, and no data leaked
          to third parties.
        </p>
      </div>

      {/* Tenders List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-emerald-400" />
            <p className="text-sm text-zinc-400">Loading audit records...</p>
          </div>
        </div>
      ) : settledTenders.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No Auditable Tenders"
          description="Settled tenders will appear here with their complete cryptographic audit trail."
        />
      ) : (
        <div className="space-y-3">
          {settledTenders.map((tender) => (
            <a
              key={tender.tenderId}
              href={`/audit/${tender.tenderId}`}
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
                <div>
                  <p className="text-xs text-zinc-500">Winner</p>
                  <p className="font-mono text-sm text-emerald-400">
                    {tender.lowestDisclosedBid && tender.lowestDisclosedBid < 0xFFFFFFFFFFFFFFFF
                      ? `$${(tender.lowestDisclosedBid / 100).toFixed(2)}/mi`
                      : '—'}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-900/50 px-3 py-1.5 text-xs font-medium text-indigo-400">
                  View Proof
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
