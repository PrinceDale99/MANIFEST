'use client'

import type { Tender } from '@/types/manifest'
import { TENDER_STATUS_CONFIG, TenderStatus } from '@/types/manifest'
import { useState, useEffect } from 'react'

interface TenderCardProps {
  tender: Tender
  onClick?: () => void
}

export default function TenderCard({ tender, onClick }: TenderCardProps) {
  const [timeRemaining, setTimeRemaining] = useState('')

  useEffect(() => {
    const updateCountdown = () => {
      // Approximate block time: ~20 seconds per block on Midnight
      const now = Math.floor(Date.now() / 1000)
      const targetBlock =
        tender.status === TenderStatus.BIDDING_OPEN
          ? tender.biddingDeadline
          : tender.revealDeadline

      // Rough estimate: blocks * 20 seconds
      const estimatedSecondsRemaining = Math.max(
        0,
        (targetBlock - now) * 20,
      )

      if (estimatedSecondsRemaining <= 0) {
        setTimeRemaining('Deadline passed')
        return
      }

      const hours = Math.floor(estimatedSecondsRemaining / 3600)
      const minutes = Math.floor((estimatedSecondsRemaining % 3600) / 60)

      if (hours > 24) {
        setTimeRemaining(`${Math.floor(hours / 24)}d ${hours % 24}h`)
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m`)
      } else {
        setTimeRemaining(`${minutes}m`)
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 60_000)
    return () => clearInterval(interval)
  }, [tender])

  const statusConfig = TENDER_STATUS_CONFIG[tender.status]

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 transition-all hover:border-zinc-700 hover:bg-zinc-900"
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${statusConfig.bgColor} ${statusConfig.color}`}
          >
            {statusConfig.label}
          </span>
          {tender.carrierCount > 0 && (
            <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-500">
              {tender.carrierCount} bid{tender.carrierCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <span className="font-mono text-xs text-zinc-500">
          #{tender.tenderId.slice(0, 8)}
        </span>
      </div>

      {/* Lane */}
      <div className="mb-3 flex items-center gap-3">
        <div className="flex-1">
          <p className="text-sm font-medium text-zinc-300">Origin</p>
          <p className="font-mono text-lg font-semibold text-white">
            {tender.loadSpec?.origin || '—'}
          </p>
        </div>
        <div className="flex items-center gap-2 text-zinc-600">
          <div className="h-px w-8 bg-zinc-700" />
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
          <div className="h-px w-8 bg-zinc-700" />
        </div>
        <div className="flex-1 text-right">
          <p className="text-sm font-medium text-zinc-300">Destination</p>
          <p className="font-mono text-lg font-semibold text-white">
            {tender.loadSpec?.destination || '—'}
          </p>
        </div>
      </div>

      {/* Details Row */}
      <div className="mb-3 flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1.5 text-zinc-400">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          <span>{tender.loadSpec?.equipmentType || '—'}</span>
        </div>
        <div className="text-zinc-600">|</div>
        <div className="text-zinc-400">
          {tender.loadSpec?.weightLbs
            ? `${(tender.loadSpec.weightLbs / 1000).toFixed(1)}k lbs`
            : '—'}
        </div>
        {tender.lowestDisclosedBid && tender.lowestDisclosedBid < 0xFFFFFFFFFFFFFFFF && (
          <>
            <div className="text-zinc-600">|</div>
            <div className="font-mono text-emerald-400">
              ${((tender.lowestDisclosedBid || 0) / 100).toFixed(2)}/mi
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-zinc-800 pt-3">
        <span className="font-mono text-xs text-zinc-500">
          Load: {tender.loadHash.slice(0, 12)}...
        </span>
        <div className="flex items-center gap-1.5 text-zinc-400">
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-xs">{timeRemaining}</span>
        </div>
      </div>
    </div>
  )
}
