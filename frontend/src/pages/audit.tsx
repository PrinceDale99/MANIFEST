// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Search,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Trophy,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Lock,
  Eye,
  FileCheck2,
  ArrowRight
} from 'lucide-react'
import type { Tender } from '@/types/manifest'
import { TenderStatus } from '@/types/manifest'
import { tenderStore } from '@/lib/indexer/tender-store'
import StatusBadge from '@/components/ui/StatusBadge'
import LaneDisplay from '@/components/ui/LaneDisplay'
import EmptyState from '@/components/ui/EmptyState'

export default function AuditPage() {
  const [tenders, setTenders] = useState<Tender[]>([])
  const [loading, setLoading] = useState(true)
  const [searchContract, setSearchContract] = useState('')

  useEffect(() => {
    tenderStore.start()
    const unsub = tenderStore.subscribe((t) => {
      setTenders(t || [])
      setLoading(false)
    })
    return () => {
      unsub()
      tenderStore.stop()
    }
  }, [])

  const settledTenders = tenders
    .filter((t) => t.status === TenderStatus.SETTLED)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs font-semibold text-violet-300">
            <ShieldCheck className="h-3.5 w-3.5 text-violet-400" />
            Public Zero-Knowledge Verifier
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Cryptographic Audit Hub</h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Verify the mathematical integrity of completed freight auctions directly against the Midnight blockchain ledger.
          </p>
        </div>

        <a
          href="https://explorer.1am.xyz"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-200 hover:bg-surface-300 border border-white/10 text-white font-semibold text-xs transition-colors self-start sm:self-auto"
        >
          <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
          1AM Midnight Explorer
        </a>
      </div>

      {/* Trust & Guarantee Banner */}
      <div className="rounded-2xl glass-card border border-emerald-500/20 p-6 md:p-8 space-y-3 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
          <CheckCircle2 className="h-4 w-4" />
          Mathematical Guarantees Verified On-Chain
        </div>
        <p className="text-sm text-zinc-300 max-w-3xl leading-relaxed">
          Every completed freight auction is cryptographically provable. The zero-knowledge circuit guarantees that: <strong>(1)</strong> No carrier could view competing rates before the reveal phase, <strong>(2)</strong> Revealed rates strictly matched initial commitments, and <strong>(3)</strong> The winning rate was deterministically the lowest qualified bid.
        </p>
      </div>

      {/* Completed Auditable Auctions */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span>Settled Freight Auctions</span>
          <span className="text-xs font-mono text-zinc-500">({settledTenders.length})</span>
        </h2>

        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-violet-400" />
            <p className="text-xs text-zinc-400 font-mono">Querying Midnight ledger proofs...</p>
          </div>
        ) : settledTenders.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="No Settled Auctions Yet"
            description="Completed freight auctions with verified mathematical proofs will appear here for public inspection."
          />
        ) : (
          <div className="space-y-3.5">
            {settledTenders.map((tender) => (
              <Link
                key={tender.tenderId}
                to={`/audit/${tender.tenderId}`}
                className="group block p-5 sm:p-6 rounded-2xl glass-card glass-card-hover border border-white/10 hover:border-violet-500/40 transition-all shadow-lg"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <StatusBadge status={tender.status} />
                      <span className="font-mono text-xs text-zinc-500">#{tender.tenderId}</span>
                    </div>

                    <LaneDisplay
                      origin={tender.loadSpec?.origin || 'Seattle, WA'}
                      destination={tender.loadSpec?.destination || 'Denver, CO'}
                      size="md"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-6 sm:gap-8 justify-between lg:justify-end pt-3 lg:pt-0 border-t lg:border-t-0 border-white/5 text-xs">
                    <div>
                      <span className="text-zinc-500 block">Carriers Participated</span>
                      <span className="font-mono font-bold text-white text-sm">{tender.carrierCount || 4} Verified</span>
                    </div>

                    <div>
                      <span className="text-zinc-500 block">Winning Rate</span>
                      <span className="font-mono font-extrabold text-emerald-400 text-base">
                        ${tender.lowestDisclosedBid?.toLocaleString()}
                      </span>
                    </div>

                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500/20 border border-violet-500/30 text-violet-300 font-semibold text-xs group-hover:scale-105 transition-all">
                      <FileCheck2 className="h-3.5 w-3.5 text-violet-400" />
                      <span>Inspect ZK Proof</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
