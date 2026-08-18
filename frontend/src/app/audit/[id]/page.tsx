'use client'

import { useState, useEffect } from 'react'
import CryptographicProofBadge from '@/components/CryptographicProofBadge'
import type { Tender } from '@/types/manifest'
import { TenderStatus, TENDER_STATUS_CONFIG } from '@/types/manifest'

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

export default function AuditPage({
  params,
}: {
  params: { id: string }
}) {
  const [tender, setTender] = useState<Tender | null>(null)
  const [audit, setAudit] = useState<AuditRecord | null>(null)

  useEffect(() => {
    // In production: fetch from indexer/proof server
    // Demo data:
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
      status: TenderStatus.SETTLED,
      lowestDisclosedBid: 245,
      awardedCarrier: '0x9e1d...f4a8',
      carrierCount: 3,
      biddingDeadline: 1000,
      revealDeadline: 1100,
      createdAt: new Date(),
    })

    setAudit({
      tenderId: params.id,
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
      contractAddress: 'mn1q...settled',
    })
  }, [params.id])

  const statusConfig = tender
    ? TENDER_STATUS_CONFIG[tender.status]
    : null

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-3">
          <a
            href="/"
            className="text-sm text-zinc-500 transition-colors hover:text-zinc-300"
          >
            ← Marketplace
          </a>
          <span className="rounded-full bg-indigo-900/50 px-2.5 py-1 text-[11px] font-semibold text-indigo-400">
            AUDIT TRAIL
          </span>
        </div>
        <h1 className="mb-2 text-2xl font-bold text-white">
          Tender Proof Audit
        </h1>
        <p className="text-sm text-zinc-400">
          Publicly verifiable cryptographic proof that this tender was
          conducted fairly. All commitments and reveals are on-chain.
        </p>
      </div>

      {/* Tender Overview */}
      <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Tender Overview
          </h2>
          {statusConfig && (
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase ${statusConfig.bgColor} ${statusConfig.color}`}
            >
              {statusConfig.label}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div>
            <p className="text-xs text-zinc-500">Tender ID</p>
            <p className="font-mono text-sm text-white">
              #{params.id.slice(0, 12)}...
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Shipper</p>
            <p className="font-mono text-sm text-white">
              {audit?.shipper || '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Lane</p>
            <p className="text-sm text-white">
              {tender?.loadSpec?.origin} → {tender?.loadSpec?.destination}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Carriers</p>
            <p className="text-sm text-white">
              {audit?.carrierCommitments.length || 0}
            </p>
          </div>
        </div>

        {/* Load Hash */}
        <div className="mt-4 rounded-lg border border-zinc-700 bg-zinc-800/50 p-3">
          <p className="mb-1 text-xs text-zinc-500">
            Load Specification Hash (SHA-256)
          </p>
          <p className="font-mono text-xs text-zinc-300 break-all">
            {audit?.loadHash || '—'}
          </p>
        </div>
      </div>

      {/* Commitment Timeline */}
      <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">
          Sealed Bid Commitments
        </h2>

        <div className="space-y-3">
          {audit?.carrierCommitments.map((commitment, index) => (
            <div
              key={commitment.carrierPk}
              className="flex items-center gap-4 rounded-lg border border-zinc-700 bg-zinc-800/30 p-4"
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
                    Sealed
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
            🏆 Awarded Carrier
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-sm text-white">
                {audit.winner}
              </p>
              <p className="mt-1 text-xs text-zinc-400">
                Lowest valid bid wins (reverse auction)
              </p>
            </div>
            <div className="text-right">
              <p className="font-mono text-2xl font-bold text-emerald-400">
                ${((audit.lowestBid || 0) / 100).toFixed(2)}/mi
              </p>
              <p className="text-xs text-zinc-500">
                Winning rate per mile
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Verification Notice */}
      <div className="mt-6 rounded-xl border border-cyan-900/50 bg-cyan-900/10 p-4 text-center">
        <p className="text-xs text-cyan-400">
          🔍 All proofs in this audit trail are cryptographically verifiable on
          the Midnight ledger. The sealed-bid mechanism ensures no carrier
          could see competitors' bids during the bidding phase.
        </p>
      </div>
    </div>
  )
}
