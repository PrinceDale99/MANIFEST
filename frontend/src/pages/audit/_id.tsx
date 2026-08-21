import { useParams } from 'react-router-dom';
'use client'

import { useState, useEffect } from 'react'
import CryptographicProofBadge from '@/components/CryptographicProofBadge'
import StatusBadge from '@/components/ui/StatusBadge'
import LaneDisplay from '@/components/ui/LaneDisplay'
import type { Tender } from '@/types/manifest'
import { TenderStatus } from '@/types/manifest'

interface AuditRecord {
  tenderId: string
  shipper: string
  loadHash: string
  carrierCommitments: Array<{
    carrierPk: string
    commitmentHash: string
    revealed: boolean
    bidAmount?: number
    proofHash?: string
  }>
  winner?: string
  lowestBid?: number
  settledAt: string
  contractAddress: string
}

export default function AuditDetailPage() {
  const [tender, setTender] = useState<Tender | null>(null)
  const [audit, setAudit] = useState<AuditRecord | null>(null)

  useEffect(() => {
    // In production: fetch from indexer/proof server
    setTender({
      tenderId: (useParams().id as string),
      shipper: '0x8f2a...c3d1',
      loadHash: '0x4b8c...e7d2',
      loadSpec: {
        origin: 'Chicago, IL',
        destination: 'Dallas, TX',
        equipmentType: 'DRY_VAN' as any,
        weightLbs: 42000,
        description: 'Non-hazardous consumer goods',
      },
      status: TenderStatus.SETTLED,
      lowestDisclosedBid: 245,
      awardedCarrier: '0x9e1d...f4a8',
      carrierCount: 3,
      biddingDeadline: 1000,
      revealDeadline: 1100,
      createdAt: new Date(),
    })

    setAudit({
      tenderId: (useParams().id as string),
      shipper: '0x8f2a...c3d1',
      loadHash: '0x4b8c...e7d2',
      carrierCommitments: [
        {
          carrierPk: '0x9e1d...f4a8',
          commitmentHash: '0x7a3f...b2c1',
          revealed: true,
          bidAmount: 245,
          proofHash: '0x8f2a...c3d1',
        },
        {
          carrierPk: '0x3c1f...a9b7',
          commitmentHash: '0x2d4e...f8c3',
          revealed: true,
          bidAmount: 290,
          proofHash: '0x4b8c...e7d2',
        },
        {
          carrierPk: '0x5a2b...d1e6',
          commitmentHash: '0x9f7c...a3b2',
          revealed: true,
          bidAmount: 310,
          proofHash: '0x1d4f...c8a5',
        },
      ],
      winner: '0x9e1d...f4a8',
      lowestBid: 245,
      settledAt: new Date().toISOString(),
      contractAddress: 'mn1q_preview_msym32de',
    })
  }, [(useParams().id as string)])

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <a href="/audit" className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Verify Auctions
        </a>

        <div className="flex items-center gap-4">
          <StatusBadge status={TenderStatus.SETTLED} size="md" />
          <span className="font-mono text-sm text-zinc-500">#{(useParams().id as string).slice(0, 12)}...</span>
        </div>

        <div className="mt-4">
          <LaneDisplay
            origin={tender?.loadSpec?.origin || '—'}
            destination={tender?.loadSpec?.destination || '—'}
            size="lg"
          />
        </div>

        <p className="mt-3 text-sm text-zinc-400">
          Proof that this auction was fair. All bids and results are on the blockchain.
        </p>
      </div>

      {/* Tender Overview */}
      <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">
          Auction Summary
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div>
            <p className="text-xs text-zinc-500">Shipper</p>
            <p className="font-mono text-sm text-white">{audit?.shipper || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Bidders</p>
            <p className="text-sm text-white">{audit?.carrierCommitments.length || 0}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Contract</p>
            <p className="font-mono text-xs text-white break-all">{audit?.contractAddress || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Job Hash</p>
            <p className="font-mono text-xs text-white break-all">{audit?.loadHash || '—'}</p>
          </div>
        </div>
      </div>

      {/* Commitment Timeline */}
      <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="mb-6 text-sm font-semibold uppercase tracking-wider text-zinc-400">
          Private Bids
        </h2>

        <div className="space-y-4">
          {audit?.carrierCommitments.map((commitment, index) => (
            <div
              key={commitment.carrierPk}
              className="relative flex items-start gap-4 rounded-lg border border-zinc-700 bg-zinc-800/30 p-4"
            >
              {/* Step Number */}
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-zinc-400">
                {index + 1}
              </div>

              {/* Commitment Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-mono text-xs text-zinc-300">
                    Carrier: {commitment.carrierPk}
                  </p>
                </div>
                <p className="mt-1 font-mono text-[10px] text-zinc-500 break-all">
                  Commitment: {commitment.commitmentHash}
                </p>
              </div>

              {/* Reveal Status */}
              <div className="text-right">
                {commitment.revealed ? (
                  <div className="space-y-1">
                    <CryptographicProofBadge
                      proofHash={commitment.proofHash || ''}
                      verified={true}
                    />
                    {commitment.bidAmount !== undefined && (
                      <p className="font-mono text-xs text-emerald-400">
                        ${(commitment.bidAmount / 100).toFixed(2)}/mi
                      </p>
                    )}
                  </div>
                ) : (
                  <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-500">
                    Private
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Winner */}
      {audit?.winner && (
        <div className="rounded-xl border border-emerald-900/50 bg-emerald-900/10 p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-emerald-400">
            🏆 Winner
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-sm text-white">{audit.winner}</p>
              <p className="mt-1 text-xs text-zinc-400">
                Lowest bid won the auction
              </p>
            </div>
            <div className="text-right">
              <p className="font-mono text-2xl font-bold text-emerald-400">
                ${((audit.lowestBid || 0) / 100).toFixed(2)}/mi
              </p>
              <p className="text-xs text-zinc-500">per mile</p>
            </div>
          </div>
        </div>
      )}

      {/* Verification Notice */}
      <div className="mt-6 rounded-xl border border-cyan-900/50 bg-cyan-900/10 p-4 text-center">
        <p className="text-xs text-cyan-400">
          🔍 All proofs are verifiable on the Midnight blockchain.
          No carrier could see other carriers' bids during the auction.
        </p>
      </div>
    </div>
  )
}
