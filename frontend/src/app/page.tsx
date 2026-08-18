'use client'

import { useState, useEffect, useMemo } from 'react'
import TenderCard from '@/components/TenderCard'
import type { Tender } from '@/types/manifest'
import { TenderStatus } from '@/types/manifest'
import { tenderStore } from '@/lib/indexer/tender-store'

const EQUIPMENT_FILTERS = [
  'All',
  'DRY_VAN',
  'REEFER',
  'FLATBED',
  'TANKER',
  'LOWBOY',
]

export default function MarketplacePage() {
  const [tenders, setTenders] = useState<Tender[]>([])
  const [originFilter, setOriginFilter] = useState('')
  const [destFilter, setDestFilter] = useState('')
  const [equipmentFilter, setEquipmentFilter] = useState('All')
  const [sortBy, setSortBy] = useState<'newest' | 'deadline' | 'bids'>(
    'newest',
  )

  useEffect(() => {
    tenderStore.start()
    const unsub = tenderStore.subscribe(setTenders)
    return () => {
      unsub()
      tenderStore.stop()
    }
  }, [])

  const filteredTenders = useMemo(() => {
    let result = tenders.filter(
      (t) =>
        t.status === TenderStatus.BIDDING_OPEN ||
        t.status === TenderStatus.REVEAL_PHASE,
    )

    if (originFilter) {
      result = result.filter((t) =>
        t.loadSpec?.origin
          .toLowerCase()
          .includes(originFilter.toLowerCase()),
      )
    }
    if (destFilter) {
      result = result.filter((t) =>
        t.loadSpec?.destination
          .toLowerCase()
          .includes(destFilter.toLowerCase()),
      )
    }
    if (equipmentFilter !== 'All') {
      result = result.filter(
        (t) => t.loadSpec?.equipmentType === equipmentFilter,
      )
    }

    // Sort
    switch (sortBy) {
      case 'deadline':
        result.sort((a, b) => a.biddingDeadline - b.biddingDeadline)
        break
      case 'bids':
        result.sort((a, b) => b.carrierCount - a.carrierCount)
        break
      default:
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime(),
        )
    }

    return result
  }, [tenders, originFilter, destFilter, equipmentFilter, sortBy])

  return (
    <div>
      {/* Hero */}
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-white">
          Freight Marketplace
        </h1>
        <p className="text-zinc-400">
          Browse active tenders. All bids are sealed with zero-knowledge proofs.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Origin city/state..."
            value={originFilter}
            onChange={(e) => setOriginFilter(e.target.value)}
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 font-mono text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
          />
          <input
            type="text"
            placeholder="Destination city/state..."
            value={destFilter}
            onChange={(e) => setDestFilter(e.target.value)}
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 font-mono text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
          />

          <div className="flex gap-1">
            {EQUIPMENT_FILTERS.map((eq) => (
              <button
                key={eq}
                onClick={() => setEquipmentFilter(eq)}
                className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                  equipmentFilter === eq
                    ? 'bg-emerald-900/50 text-emerald-400'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                }`}
              >
                {eq === 'All' ? 'All Types' : eq.replace('_', ' ')}
              </button>
            ))}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
          >
            <option value="newest">Newest First</option>
            <option value="deadline">Deadline Soon</option>
            <option value="bids">Most Bids</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-zinc-500">
          {filteredTenders.length} active tender
          {filteredTenders.length !== 1 ? 's' : ''}
        </p>
        <p className="font-mono text-xs text-zinc-600">
          All bids cryptographically sealed
        </p>
      </div>

      {/* Tender Grid */}
      {filteredTenders.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTenders.map((tender) => (
            <TenderCard
              key={tender.tenderId}
              tender={tender}
              onClick={() =>
                (window.location.href = `/carrier/tender/${tender.tenderId}`)
              }
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-12 text-center">
          <div className="mb-4 text-4xl">🚛</div>
          <h3 className="mb-2 text-lg font-semibold text-white">
            No Active Tenders
          </h3>
          <p className="text-sm text-zinc-400">
            No tenders match your filters. Try adjusting your search criteria.
          </p>
        </div>
      )}
    </div>
  )
}
