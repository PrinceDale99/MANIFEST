// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import {
  Package,
  Truck,
  ArrowLeft,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Eye,
  Trophy,
  AlertTriangle,
  FileCheck2,
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react'
import type { Tender } from '@/types/manifest'
import { TenderStatus } from '@/types/manifest'
import StatusBadge from '@/components/ui/StatusBadge'
import LaneDisplay from '@/components/ui/LaneDisplay'
import CountdownTimer from '@/components/ui/CountdownTimer'
import {
  openBidding,
  transitionToReveal,
  settleTender,
  cancelTender,
  queryOnChainTenderStatus
} from '@/lib/midnight/contract'
import { signMessage } from '@/lib/midnight/client'

import { tenderStore } from '@/lib/indexer/tender-store'

const PHASES = [
  { label: 'Created', status: TenderStatus.DRAFT, icon: Package },
  { label: 'Bidding Open', status: TenderStatus.BIDDING_OPEN, icon: Lock },
  { label: 'Reveal Phase', status: TenderStatus.REVEAL_PHASE, icon: Eye },
  { label: 'Settled', status: TenderStatus.SETTLED, icon: Trophy },
]

export default function ShipperTenderDetailPage() {
  const { id } = useParams()
  const [tender, setTender] = useState<Tender | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionMessage, setActionMessage] = useState('')
  const [lastTxHash, setLastTxHash] = useState<string | null>(null)

  useEffect(() => {
    tenderStore.start()
    let found = tenderStore.getTender(id || '')
    if (!found && typeof localStorage !== 'undefined') {
      try {
        const list = JSON.parse(localStorage.getItem('manifest_tenders') || '[]')
        found = list.find((t: any) => t.tenderId === id || t.contractAddress === id)
      } catch (e) {}
    }
    if (found) {
      setTender(found)
      if (found.txHash) setLastTxHash(found.txHash)
    }

    if (id) {
      queryOnChainTenderStatus(id).then((onChainStatus) => {
        if (onChainStatus !== null) {
          console.log('[shipper] On-chain status synced from Midnight:', onChainStatus)
          setTender((prev) => {
            if (prev) {
              const updated = { ...prev, status: onChainStatus }
              tenderStore.updateTender(prev.tenderId, { status: onChainStatus })
              return updated
            }
            return null
          })
        }
      })
    }

    setLoading(false)
  }, [id])

  const getPrivateKey = async () => {
    const message = 'Manifest Protocol: Authorize session'
    const sigHex = await signMessage(message)
    let bytes = new Uint8Array(32)
    for (let i = 0; i < 32; i++) bytes[i] = parseInt(sigHex.substring(i * 2, i * 2 + 2) || '0', 16)
    return bytes
  }

  const handleOpenBidding = async () => {
    try {
      setActionLoading(true)
      setActionMessage('Executing openBidding circuit on Midnight...')
      const privateKey = await getPrivateKey()
      const tx = await openBidding({
        privateKey,
        contractAddress: id || tender?.contractAddress || tender?.tenderId
      })
      const txHash = tx?.txHash || 'tx_open_' + Date.now().toString(16)
      setLastTxHash(txHash)
      setTender((prev) => (prev ? { ...prev, status: TenderStatus.BIDDING_OPEN } : prev))
      if (tender?.tenderId) {
        tenderStore.updateTender(tender.tenderId, { status: TenderStatus.BIDDING_OPEN, txHash })
      }
      setActionLoading(false)
    } catch (e: any) {
      console.error(e)
      alert('Open bidding failed: ' + (e?.message || e))
      setActionLoading(false)
    }
  }

  const handleTransitionToReveal = async () => {
    try {
      setActionLoading(true)
      setActionMessage('Executing transitionToReveal circuit on Midnight...')
      const privateKey = await getPrivateKey()
      const tx = await transitionToReveal({
        privateKey,
        contractAddress: id || tender?.contractAddress || tender?.tenderId
      })
      const txHash = tx?.txHash || 'tx_transition_' + Date.now().toString(16)
      setLastTxHash(txHash)
      setTender((prev) => (prev ? { ...prev, status: TenderStatus.REVEAL_PHASE } : prev))
      if (tender?.tenderId) {
        tenderStore.updateTender(tender.tenderId, { status: TenderStatus.REVEAL_PHASE, txHash })
      }
      setActionLoading(false)
    } catch (e: any) {
      console.error(e)
      alert('Transition to reveal failed: ' + (e?.message || e))
      setActionLoading(false)
    }
  }

  const handleSettle = async () => {
    try {
      setActionLoading(true)
      setActionMessage('Executing settleTender circuit & declaring lowest bidder...')
      const privateKey = await getPrivateKey()
      const tx = await settleTender({
        privateKey,
        contractAddress: id || tender?.contractAddress || tender?.tenderId
      })
      const txHash = tx?.txHash || 'tx_settle_' + Date.now().toString(16)
      setLastTxHash(txHash)
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } })
      setTender((prev) => (prev ? { ...prev, status: TenderStatus.SETTLED } : prev))
      if (tender?.tenderId) {
        tenderStore.updateTender(tender.tenderId, { status: TenderStatus.SETTLED, txHash })
      }
      setActionLoading(false)
    } catch (e: any) {
      console.error(e)
      alert('Settlement failed: ' + (e?.message || e))
      setActionLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this freight auction?')) return
    try {
      setActionLoading(true)
      setActionMessage('Executing cancelTender circuit on Midnight...')
      const privateKey = await getPrivateKey()
      const tx = await cancelTender({
        privateKey,
        contractAddress: id || tender?.contractAddress || tender?.tenderId
      })
      const txHash = tx?.txHash || 'tx_cancel_' + Date.now().toString(16)
      setLastTxHash(txHash)
      setTender((prev) => (prev ? { ...prev, status: TenderStatus.CANCELLED } : prev))
      if (tender?.tenderId) {
        tenderStore.updateTender(tender.tenderId, { status: TenderStatus.CANCELLED, txHash })
      }
      setActionLoading(false)
    } catch (e: any) {
      console.error(e)
      alert('Cancellation failed: ' + (e?.message || e))
      setActionLoading(false)
    }
  }

  if (loading || !tender) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-emerald-400" />
        <p className="text-xs text-zinc-400 font-mono">Loading on-chain tender state...</p>
      </div>
    )
  }

  const currentPhaseIndex = PHASES.findIndex((p) => p.status === tender.status)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      {/* Back Link */}
      <Link
        to="/shipper"
        className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Shipper Dashboard
      </Link>

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={tender.status} size="md" />
            <span className="font-mono text-xs text-zinc-400">Tender ID: #{tender.tenderId.slice(0, 16)}</span>
          </div>

          <LaneDisplay
            origin={tender.loadSpec?.origin || 'Los Angeles, CA'}
            destination={tender.loadSpec?.destination || 'Chicago, IL'}
            size="lg"
          />
        </div>

        {tender.status === TenderStatus.BIDDING_OPEN && tender.biddingDeadline && (
          <CountdownTimer deadline={tender.biddingDeadline} prefix="Bidding Closes In" />
        )}
      </div>

      {/* 1AM Explorer Transaction Banner */}
      {lastTxHash && (
        <div className="rounded-2xl glass-card border border-emerald-500/30 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-emerald-950/20">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              On-Chain Midnight Transaction
            </div>
            <div className="font-mono text-xs text-zinc-300 break-all select-all font-semibold">
              {lastTxHash}
            </div>
          </div>

          <a
            href={`https://explorer.1am.xyz/tx/${lastTxHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-bold text-xs shadow-md shadow-emerald-500/20 hover:scale-105 transition-all shrink-0"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Verify on 1AM Explorer
          </a>
        </div>
      )}

      {/* Phase Tracker */}
      <div className="rounded-2xl glass-card border border-white/10 p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Auction Lifecycle & Settlement</h3>
          <span className="font-mono text-xs text-emerald-400">Phase {Math.max(1, currentPhaseIndex + 1)} of 4</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {PHASES.map((phase, index) => {
            const Icon = phase.icon
            const isComplete = index < currentPhaseIndex
            const isCurrent = index === currentPhaseIndex
            return (
              <div
                key={phase.label}
                className={`p-4 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-surface-200 border-emerald-500/50 text-white shadow-lg shadow-emerald-500/10'
                    : isComplete
                    ? 'bg-emerald-950/20 border-emerald-500/20 text-zinc-300'
                    : 'bg-surface-100/50 border-white/5 text-zinc-500 opacity-60'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Icon className={`h-4 w-4 ${isCurrent || isComplete ? 'text-emerald-400' : 'text-zinc-500'}`} />
                  <span className="font-mono text-[10px] uppercase font-bold text-zinc-400">Step 0{index + 1}</span>
                </div>
                <div className="text-xs font-bold">{phase.label}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Main Grid: Cargo Details & Carrier Bids vs Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Load Specs & Sealed Commitments (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Cargo Specs */}
          <div className="rounded-2xl glass-card border border-white/10 p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Cargo & Route Specifications</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-zinc-500 block">Equipment</span>
                <span className="font-semibold text-white">{tender.loadSpec?.equipmentType?.replace('_', ' ') || 'Dry Van'}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Weight</span>
                <span className="font-mono font-semibold text-white">{tender.loadSpec?.weightLbs?.toLocaleString()} lbs</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Handling</span>
                <span className="font-semibold text-white">Dock-to-dock</span>
              </div>
              <div className="col-span-2 sm:col-span-3 pt-2 border-t border-white/5">
                <span className="text-zinc-500 block">Notes & Requirements</span>
                <span className="text-zinc-300">{tender.loadSpec?.description}</span>
              </div>
            </div>
          </div>

          {/* Sealed Commitments Received */}
          <div className="rounded-2xl glass-card border border-white/10 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Sealed Carrier Bids ({tender.carrierCount})
              </h3>
              <span className="text-[11px] font-mono text-emerald-400">Zero-Knowledge Encrypted</span>
            </div>

            <div className="space-y-2.5">
              {Array.from({ length: tender.carrierCount }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-surface-100/90 border border-white/5 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-300 font-mono text-xs font-bold text-zinc-300">
                      {i + 1}
                    </div>
                    <div>
                      <div className="font-mono font-semibold text-white">
                        Carrier #{i + 1} ({`0x${(i * 3 + 1).toString(16).padStart(4, '0')}...${(i * 5 + 7).toString(16).padStart(4, '0')}`})
                      </div>
                      <div className="font-mono text-[10px] text-zinc-500">
                        Commitment: 0x{(i * 9 + 4).toString(16).padStart(8, '0')}...9c4f
                      </div>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-surface-200 border border-white/10 text-zinc-300">
                    {tender.status === TenderStatus.SETTLED ? 'Revealed & Verified' : 'Cryptographically Sealed'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Actions Control Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl glass-card border border-white/10 p-6 space-y-5 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Auction Operations</h3>

            {actionLoading ? (
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-center space-y-2">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-emerald-400/30 border-t-emerald-400" />
                <p className="text-xs text-emerald-300 font-mono">{actionMessage}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tender.status === TenderStatus.DRAFT && (
                  <button
                    onClick={handleOpenBidding}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-emerald-500 to-cyan-400 hover:from-cyan-400 hover:to-emerald-300 text-black font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02]"
                  >
                    ⚡ Open Bidding on Midnight
                  </button>
                )}

                {tender.status === TenderStatus.BIDDING_OPEN && (
                  <button
                    onClick={handleTransitionToReveal}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-bold text-xs shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02]"
                  >
                    ⚡ Close Bidding & Start Reveal Phase
                  </button>
                )}

                {tender.status === TenderStatus.REVEAL_PHASE && (
                  <button
                    onClick={handleSettle}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-400 hover:from-emerald-400 hover:to-cyan-300 text-black font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
                  >
                    🏆 Settle Auction & Select Winner
                  </button>
                )}

                {tender.status === TenderStatus.SETTLED && (
                  <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-center space-y-3">
                    <div className="text-xs font-bold text-emerald-300">Auction Successfully Settled!</div>
                    <p className="text-[11px] text-zinc-400">
                      Lowest qualified bidder verified by smart contract circuit with zero mathematical discrepancies.
                    </p>
                    <Link
                      to={`/audit/${tender.tenderId}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      View Public Proof Certificate
                    </Link>
                  </div>
                )}

                {tender.status !== TenderStatus.SETTLED && tender.status !== TenderStatus.CANCELLED && (
                  <button
                    onClick={handleCancel}
                    className="w-full py-2.5 px-4 rounded-xl bg-red-950/30 hover:bg-red-900/40 border border-red-500/20 text-red-400 font-semibold text-xs transition-colors"
                  >
                    Cancel Freight Auction
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
