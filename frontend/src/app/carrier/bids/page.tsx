'use client'

import { useState } from 'react'

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
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active')

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

  return (
    <div>
      <div className="mb-8">
        <h1 className="mb-2 text-2xl font-bold text-white">My Bids</h1>
        <p className="text-sm text-zinc-400">
          Track your sealed bids and auction outcomes.
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-lg border border-zinc-800 bg-zinc-900/50 p-1">
        {(['active', 'history'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400 hover:text-zinc-300'
            }`}
          >
            {tab === 'active' ? 'Active Bids' : 'Bid History'}
          </button>
        ))}
      </div>

      {/* Bids List */}
      <div className="space-y-3">
        {bids
          .filter((b) =>
            activeTab === 'active'
              ? b.status === 'sealed' || b.status === 'revealed'
              : b.status === 'won' || b.status === 'lost',
          )
          .map((bid) => (
            <div
              key={bid.tenderId}
              className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition-colors hover:border-zinc-700"
            >
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm font-medium text-white">
                    {bid.origin} → {bid.destination}
                  </p>
                  <p className="font-mono text-xs text-zinc-500">
                    {bid.tenderId}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-mono text-sm font-semibold text-emerald-400">
                    ${(bid.bidAmount / 100).toFixed(2)}/mi
                  </p>
                  <p className="text-xs text-zinc-500">{bid.submittedAt}</p>
                </div>

                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase ${statusColors[bid.status]}`}
                >
                  {bid.status}
                </span>

                {bid.proofHash && (
                  <span className="font-mono text-[10px] text-zinc-600">
                    🔒 {bid.proofHash}
                  </span>
                )}
              </div>
            </div>
          ))}

        {bids.filter((b) =>
          activeTab === 'active'
            ? b.status === 'sealed' || b.status === 'revealed'
            : b.status === 'won' || b.status === 'lost',
        ).length === 0 && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-12 text-center">
            <div className="mb-4 text-4xl">🔒</div>
            <h3 className="mb-2 text-lg font-semibold text-white">
              No {activeTab} bids
            </h3>
            <p className="text-sm text-zinc-400">
              Browse the marketplace to place your first sealed bid.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
