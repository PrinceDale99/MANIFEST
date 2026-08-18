'use client'

import { useState, useEffect } from 'react'
import type { Tender } from '@/types/manifest'
import { TenderStatus } from '@/types/manifest'
import StatusBadge from '@/components/ui/StatusBadge'
import LaneDisplay from '@/components/ui/LaneDisplay'

const PHASES = [
  { label: 'Created', status: TenderStatus.DRAFT },
  { label: 'Bidding Open', status: TenderStatus.BIDDING_OPEN },
  { label: 'Reveal Phase', status: TenderStatus.REVEAL_PHASE },
  { label: 'Settled', status: TenderStatus.SETTLED },
]

export default function ShipperTenderDetailPage({ params }: { params: { id: string } }) {
  const [tender, setTender] = useState<Tender | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    // In production: fetch from API
    // For now, use demo data
    setTender({
      tenderId: params.id,
      shipper: '0x8f2a...c3d1',
      loadHash: '0x4b8c...e7d2',
      loadSpec: {
        origin: 'Chicago, IL',
        destination: 'Dallas, TX',
        equipmentType: 'DRY_VAN' as any,
        weightLbs: 42000,
        description: 'Non-hazardous consumer goods',
      },
      status: TenderStatus.BIDDING_OPEN,
      lowestDisclosedBid: 0xFFFFFFFFFFFFFFFF,
      carrierCount: 3,
      biddingDeadline: 1000,
      revealDeadline: 1100,
      createdAt: new Date(),
    })
    setLoading(false)
  }, [params.id])

  const handleOpenBidding = async () => {
    setActionLoading(true)
    await new Promise((r) => setTimeout(r, 1500))
    setTender((prev) => prev ? { ...prev, status: TenderStatus.BIDDING_OPEN } : prev)
    setActionLoading(false)
  }

  const handleTransitionToReveal = async () => {
    setActionLoading(true)
    await new Promise((r) => setTimeout(r, 1500))
    setTender((prev) => prev ? { ...prev, status: TenderStatus.REVEAL_PHASE } : prev)
    setActionLoading(false)
  }

  const handleSettle = async () => {
    setActionLoading(true)
    await new Promise((r) => setTimeout(r, 1500))
    setTender((prev) => prev ? { ...prev, status: TenderStatus.SETTLED } : prev)
    setActionLoading(false)
  }

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this tender?')) return
    setActionLoading(true)
    await new Promise((r) => setTimeout(r, 1500))
    setTender((prev) => prev ? { ...prev, status: TenderStatus.CANCELLED } : prev)
    setActionLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-emerald-400" />
          <p className="text-sm text-zinc-400">Loading tender...</p>
        </div>
      </div>
    )
  }

  if (!tender) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-12 text-center">
        <div className="mb-4 text-5xl">❌</div>
        <h3 className="mb-2 text-lg font-semibold text-white">Tender Not Found</h3>
        <a href="/shipper" className="text-sm text-emerald-400 hover:text-emerald-300">
          ← Back to Dashboard
        </a>
      </div>
    )
  }

  const currentPhaseIndex = PHASES.findIndex((p) => p.status === tender.status)

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <a href="/shipper" className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </a>

        <div className="flex items-center gap-4">
          <StatusBadge status={tender.status} size="md" />
          <span className="font-mono text-sm text-zinc-500">#{tender.tenderId.slice(0, 12)}...</span>
        </div>

        <div className="mt-4">
          <LaneDisplay
            origin={tender.loadSpec?.origin || '—'}
            destination={tender.loadSpec?.destination || '—'}
            size="lg"
          />
        </div>
      </div>

      {/* Phase Progress */}
      <div className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">
          Tender Progress
        </h2>
        <div className="flex items-center">
          {PHASES.map((phase, index) => {
            const isComplete = index < currentPhaseIndex
            const isCurrent = index === currentPhaseIndex
            return (
              <div key={phase.label} className="flex flex-1 items-center">
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                      isComplete
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                          ? 'bg-white text-black'
                          : 'bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    {isComplete ? '✓' : index + 1}
                  </div>
                  <span
                    className={`text-sm ${
                      isCurrent ? 'text-white' : isComplete ? 'text-emerald-400' : 'text-zinc-500'
                    }`}
                  >
                    {phase.label}
                  </span>
                </div>
                {index < PHASES.length - 1 && (
                  <div
                    className={`mx-3 h-px flex-1 ${
                      isComplete ? 'bg-emerald-600' : 'bg-zinc-800'
                    }`}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Load Details */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">
              Load Details
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-zinc-500">Equipment</p>
                <p className="text-sm text-white">{tender.loadSpec?.equipmentType?.replace('_', ' ') || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Weight</p>
                <p className="font-mono text-sm text-white">
                  {tender.loadSpec?.weightLbs?.toLocaleString() || '—'} lbs
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-zinc-500">Description</p>
                <p className="text-sm text-white">{tender.loadSpec?.description || '—'}</p>
              </div>
            </div>
          </div>

          {/* Carrier Commitments */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">
              Carrier Bids ({tender.carrierCount})
            </h2>
            {tender.carrierCount > 0 ? (
              <div className="space-y-3">
                {Array.from({ length: tender.carrierCount }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-zinc-700 bg-zinc-800/30 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-zinc-400">
                        {i + 1}
                      </div>
                      <div>
                        <p className="font-mono text-xs text-zinc-300">
                          Carrier {String.fromCharCode(65 + i)} ({`0x${(i + 1).toString(16).padStart(4, '0')}...`})
                        </p>
                        <p className="text-[10px] text-zinc-500">Commitment: 0x{(i * 7 + 3).toString(16).padStart(4, '0')}...</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-500">
                      {tender.status === TenderStatus.REVEAL_PHASE || tender.status === TenderStatus.SETTLED
                        ? 'Revealed'
                        : 'Sealed'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-500">No bids submitted yet.</p>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="space-y-4">
          {/* Quick Stats */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-zinc-500">Bids</p>
                <p className="font-mono text-lg font-bold text-white">{tender.carrierCount}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Lowest</p>
                <p className="font-mono text-lg font-bold text-emerald-400">
                  {tender.lowestDisclosedBid && tender.lowestDisclosedBid < 0xFFFFFFFFFFFFFFFF
                    ? `$${(tender.lowestDisclosedBid / 100).toFixed(2)}`
                    : '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
            <h3 className="mb-3 text-sm font-semibold text-white">Actions</h3>
            <div className="space-y-2">
              {tender.status === TenderStatus.DRAFT && (
                <button
                  onClick={handleOpenBidding}
                  disabled={actionLoading}
                  className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
                >
                  {actionLoading ? 'Processing...' : 'Open Bidding'}
                </button>
              )}
              {tender.status === TenderStatus.BIDDING_OPEN && (
                <button
                  onClick={handleTransitionToReveal}
                  disabled={actionLoading}
                  className="w-full rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-amber-500 disabled:opacity-50"
                >
                  {actionLoading ? 'Processing...' : 'Transition to Reveal'}
                </button>
              )}
              {tender.status === TenderStatus.REVEAL_PHASE && (
                <button
                  onClick={handleSettle}
                  disabled={actionLoading}
                  className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
                >
                  {actionLoading ? 'Processing...' : 'Settle Tender'}
                </button>
              )}
              {(tender.status === TenderStatus.DRAFT ||
                tender.status === TenderStatus.BIDDING_OPEN ||
                tender.status === TenderStatus.REVEAL_PHASE) && (
                <button
                  onClick={handleCancel}
                  disabled={actionLoading}
                  className="w-full rounded-lg border border-red-900 bg-red-900/20 px-4 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-900/30 disabled:opacity-50"
                >
                  {actionLoading ? 'Processing...' : 'Cancel Tender'}
                </button>
              )}
              {tender.status === TenderStatus.SETTLED && (
                <a
                  href={`/audit/${tender.tenderId}`}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700"
                >
                  🔍 View Audit Trail
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
