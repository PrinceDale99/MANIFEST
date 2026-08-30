'use client'

import { useState, useEffect } from 'react'
import type { Tender } from '@/types/manifest'
import { TenderStatus, TENDER_STATUS_CONFIG } from '@/types/manifest'
import { tenderStore } from '@/lib/indexer/tender-store'

export default function ShipperDashboardPage() {
  const [tenders, setTenders] = useState<Tender[]>([])
  const [activeTab, setActiveTab] = useState<
    'active' | 'settled' | 'cancelled'
  >('active')

  useEffect(() => {
    tenderStore.start()
    const unsub = tenderStore.subscribe(setTenders)
    return () => {
      unsub()
      tenderStore.stop()
    }
  }, [])

  const filteredTenders = tenders.filter((t) => {
    switch (activeTab) {
      case 'active':
        return (
          t.status === TenderStatus.BIDDING_OPEN ||
          t.status === TenderStatus.REVEAL_PHASE ||
          t.status === TenderStatus.DRAFT
        )
      case 'settled':
        return t.status === TenderStatus.SETTLED
      case 'cancelled':
        return t.status === TenderStatus.CANCELLED
    }
  })

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-2xl font-bold text-white">
            Shipper Dashboard
          </h1>
          <p className="text-sm text-zinc-400">
            Manage your freight tenders and track settlement.
          </p>
        </div>
        <a
          href="/shipper/new"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
        >
          + New Tender
        </a>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-lg border border-zinc-800 bg-zinc-900/50 p-1">
        {(['active', 'settled', 'cancelled'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400 hover:text-zinc-300'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)} (
            {
              tenders.filter((t) => {
                if (tab === 'active')
                  return (
                    t.status === TenderStatus.BIDDING_OPEN ||
                    t.status === TenderStatus.REVEAL_PHASE ||
                    t.status === TenderStatus.DRAFT
                  )
                if (tab === 'settled') return t.status === TenderStatus.SETTLED
                return t.status === TenderStatus.CANCELLED
              }).length
            }
            )
          </button>
        ))}
      </div>

      {/* Tenders Table */}
      {filteredTenders.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-zinc-800">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/50">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Tender ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Lane
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Bids
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Lowest Bid
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredTenders.map((tender) => {
                const statusConfig =
                  TENDER_STATUS_CONFIG[tender.status]
                return (
                  <tr
                    key={tender.tenderId}
                    className="transition-colors hover:bg-zinc-900/30"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-zinc-300">
                      #{tender.tenderId.slice(0, 8)}
                    </td>
                    <td className="px-4 py-3 text-sm text-white">
                      {tender.loadSpec?.origin || '—'} →{' '}
                      {tender.loadSpec?.destination || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${statusConfig.bgColor} ${statusConfig.color}`}
                      >
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-zinc-300">
                      {tender.carrierCount}
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-emerald-400">
                      {tender.lowestDisclosedBid &&
                      tender.lowestDisclosedBid < 0xFFFFFFFFFFFFFFFF
                        ? `$${(tender.lowestDisclosedBid / 100).toFixed(2)}/mi`
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {tender.status === TenderStatus.REVEAL_PHASE && (
                        <button className="rounded bg-amber-900/50 px-3 py-1 text-xs text-amber-400 hover:bg-amber-900">
                          Settle
                        </button>
                      )}
                      {tender.status === TenderStatus.DRAFT && (
                        <button className="rounded bg-emerald-900/50 px-3 py-1 text-xs text-emerald-400 hover:bg-emerald-900">
                          Open Bidding
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-12 text-center">
          <div className="mb-4 text-4xl">📦</div>
          <h3 className="mb-2 text-lg font-semibold text-white">
            No Tenders Found
          </h3>
          <p className="text-sm text-zinc-400">
            {activeTab === 'active'
              ? 'Create your first freight tender to get started.'
              : `No ${activeTab} tenders to display.`}
          </p>
        </div>
      )}
    </div>
  )
}
