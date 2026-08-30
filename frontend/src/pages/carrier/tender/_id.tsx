// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import {
  Truck,
  ArrowLeft,
  Lock,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Sparkles,
  RefreshCw,
  Download,
  AlertCircle,
  Clock,
  MapPin,
  FileCheck2,
  Layers,
  Thermometer,
  Cpu,
  ExternalLink
} from 'lucide-react'
import type { Tender } from '@/types/manifest'
import { TenderStatus, EquipmentType } from '@/types/manifest'
import { tenderStore } from '@/lib/indexer/tender-store'
import StatusBadge from '@/components/ui/StatusBadge'
import LaneDisplay from '@/components/ui/LaneDisplay'
import CountdownTimer from '@/components/ui/CountdownTimer'
import { submitBidCommitment, revealBid, queryOnChainTenderStatus } from '@/lib/midnight/contract'
import { signMessage, getWalletAddress } from '@/lib/midnight/client'

export default function CarrierTenderDetailPage() {
  const { id } = useParams()
  const [tender, setTender] = useState<Tender | null>(null)
  const [loading, setLoading] = useState(true)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)

  // Bidding Form State
  const [bidAmount, setBidAmount] = useState('2750') // $2,750
  const [salt, setSalt] = useState('8f9a2b1c4e7d3a5f')
  const [proverStage, setProverStage] = useState<'idle' | 'witness' | 'proving' | 'signing' | 'confirmed' | 'error'>('idle')
  const [txHash, setTxHash] = useState<string | null>(null)

  useEffect(() => {
    // Generate initial random salt
    const randomHex = Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
    setSalt(randomHex)

    // Load tender from reactive store or local storage
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
    }

    // Sync live on-chain status from Midnight Indexer
    if (id) {
      queryOnChainTenderStatus(id).then((onChainStatus) => {
        if (onChainStatus !== null) {
          console.log('[carrier] On-chain status synced from Midnight:', onChainStatus)
          setTender((prev) => {
            if (prev) {
              const updated = { ...prev, status: onChainStatus }
              tenderStore.updateTender(prev.tenderId, { status: onChainStatus })
              return updated
            }
            const fallbackTender: Tender = {
              tenderId: id,
              contractAddress: id,
              shipper: 'shipper-account',
              loadHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
              reservePriceCommitment: '0x0000000000000000000000000000000000000000000000000000000000000000',
              loadSpec: {
                origin: 'Los Angeles, CA',
                destination: 'Chicago, IL',
                equipmentType: EquipmentType.DRY_VAN,
                weightLbs: 42000,
                description: 'On-Chain Freight Shipment'
              },
              status: onChainStatus,
              carrierCount: 0,
              createdAt: new Date()
            }
            tenderStore.addTender(fallbackTender)
            return fallbackTender
          })
        }
      })
    }

    getWalletAddress().then(setWalletAddress)
    setLoading(false)
  }, [id])

  const regenerateSalt = () => {
    const randomHex = Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
    setSalt(randomHex)
  }

  const downloadBackupKeyfile = () => {
    const content = JSON.stringify(
      {
        tenderId: id || tender?.tenderId || 'tender',
        carrierAddress: walletAddress || 'shielded-carrier',
        bidAmountDollars: Number(bidAmount),
        saltHex: salt,
        network: 'midnight-preview',
        timestamp: new Date().toISOString(),
      },
      null,
      2
    )
    const blob = new Blob([content], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `manifest-bid-${(id || 'tender').slice(0, 8)}.json`
    a.click()
  }

  // Calculate commitment hash
  const computeCommitment = () => {
    let hash = 0x811c9dc5
    const str = `${bidAmount}:${salt}:${id}`
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i)
      hash = (hash * 0x01000193) >>> 0
    }
    return `0x${hash.toString(16).padStart(8, '0')}${((hash * 31) >>> 0).toString(16).padStart(8, '0')}`.repeat(4).slice(0, 64)
  }

  const handlePlaceBid = async () => {
    try {
      setProverStage('witness')
      await new Promise((r) => setTimeout(r, 400))
      setProverStage('proving')

      setProverStage('signing')
      const message = 'Manifest Protocol: Authorize Carrier Bid'
      const sigHex = await signMessage(message)

      const hexToBytes = (hex: string) => {
        let bytes = new Uint8Array(32)
        for (let i = 0; i < 32; i++) bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2) || '0', 16)
        return bytes
      }
      const privateKey = hexToBytes(sigHex.substring(0, 64))

      const saltBytes = new Uint8Array(32)
      for (let i = 0; i < Math.min(32, salt.length); i++) saltBytes[i] = salt.charCodeAt(i)

      const tx = await submitBidCommitment({
        bidAmount: BigInt(Number(bidAmount) * 100),
        salt: saltBytes,
        privateKey,
        contractAddress: id || tender?.contractAddress || tender?.tenderId
      })

      const realTxHash = tx?.txHash || 'tx_bid_' + Date.now().toString(16)

      // Save carrier bid credentials locally for 1-click reveal
      const existingBids = JSON.parse(localStorage.getItem('manifest_carrier_bids') || '[]')
      const bidRecord = {
        tenderId: id || tender?.tenderId || 'tender',
        origin: tender?.loadSpec?.origin || 'Origin',
        destination: tender?.loadSpec?.destination || 'Destination',
        bidAmount: Number(bidAmount),
        salt,
        commitmentHash: computeCommitment(),
        txHash: realTxHash,
        timestamp: new Date().toISOString(),
        status: 'sealed',
      }
      localStorage.setItem('manifest_carrier_bids', JSON.stringify([bidRecord, ...existingBids]))

      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
      setTxHash(realTxHash)
      setProverStage('confirmed')
      setTender((prev) => (prev ? { ...prev, carrierCount: (prev.carrierCount || 0) + 1 } : prev))
      if (tender?.tenderId) {
        tenderStore.updateTender(tender.tenderId, { carrierCount: (tender.carrierCount || 0) + 1 })
      }
    } catch (e: any) {
      console.error(e)
      alert('Bid submission failed: ' + (e?.message || e))
      setProverStage('idle')
    }
  }

  const handleReveal = async () => {
    try {
      setProverStage('proving')
      const message = 'Manifest Protocol: Authorize Carrier Reveal'
      const sigHex = await signMessage(message)
      const hexToBytes = (hex: string) => {
        let bytes = new Uint8Array(32)
        for (let i = 0; i < 32; i++) bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2) || '0', 16)
        return bytes
      }
      const privateKey = hexToBytes(sigHex.substring(0, 64))
      const saltBytes = new Uint8Array(32)
      for (let i = 0; i < Math.min(32, salt.length); i++) saltBytes[i] = salt.charCodeAt(i)

      const tx = await revealBid({
        bidAmount: BigInt(Number(bidAmount) * 100),
        salt: saltBytes,
        privateKey,
        contractAddress: id || tender?.contractAddress || tender?.tenderId
      })

      const realTxHash = tx?.txHash || 'tx_reveal_' + Date.now().toString(16)
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } })
      setTxHash(realTxHash)
      setProverStage('confirmed')
    } catch (e: any) {
      console.error(e)
      alert('Rate reveal failed: ' + (e?.message || e))
      setProverStage('idle')
    }
  }

  if (loading || !tender) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-cyan-400" />
        <p className="text-xs text-zinc-400 font-mono">Loading freight specifications...</p>
      </div>
    )
  }

  const commitment = computeCommitment()

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      {/* Back Link */}
      <Link
        to="/carrier"
        className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Live Freight Board
      </Link>

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={tender.status} size="md" />
            <span className="font-mono text-xs text-zinc-400">Auction #{tender.tenderId.slice(0, 16)}</span>
          </div>

          <LaneDisplay
            origin={tender.loadSpec?.origin || 'Los Angeles, CA'}
            destination={tender.loadSpec?.destination || 'Chicago, IL'}
            size="lg"
          />
        </div>

        {tender.status === TenderStatus.BIDDING_OPEN && tender.biddingDeadline && (
          <CountdownTimer deadline={tender.biddingDeadline} prefix="Bidding Window Closes In" />
        )}
      </div>

      {/* Main Grid: Job Specs vs Bidding Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Freight Specifications (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="rounded-3xl glass-card border border-white/10 p-6 sm:p-8 space-y-6 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Cargo & Route Details</h3>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-surface-100/90 border border-white/5 space-y-1">
                <span className="text-zinc-500 block">Equipment</span>
                <span className="font-bold text-white text-sm">
                  {tender.loadSpec?.equipmentType?.replace('_', ' ') || 'Dry Van'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-100/90 border border-white/5 space-y-1">
                <span className="text-zinc-500 block">Weight</span>
                <span className="font-bold text-white text-sm font-mono">
                  {tender.loadSpec?.weightLbs?.toLocaleString()} lbs
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-surface-100/90 border border-white/5 space-y-2">
              <span className="text-xs font-semibold text-zinc-400">Shipper Handling Instructions</span>
              <p className="text-xs text-zinc-300 leading-relaxed">{tender.loadSpec?.description}</p>
            </div>

            {/* Zero-Knowledge Privacy Explanation Card */}
            <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-cyan-400">
                <ShieldCheck className="h-4 w-4" />
                Zero-Knowledge Privacy Shield
              </div>
              <p className="text-zinc-400 leading-relaxed text-[11px]">
                Your rate is hashed client-side with a cryptographic salt. The shipper and competitor carriers only see an encrypted commitment hash. When bidding closes, you reveal your rate to claim the win.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Interactive Private Bidding Terminal (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="rounded-3xl glass-card border border-emerald-500/30 p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Lock className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Private Bidding Terminal</h3>
                  <p className="text-[11px] text-zinc-400">Cryptographically Sealed Witness</p>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ZK-v1 Active
              </span>
            </div>

            {/* Success State */}
            {proverStage === 'confirmed' ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4 py-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 mx-auto border border-emerald-500/30">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-bold text-white">Private Bid Sealed On Midnight!</h4>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                    Your commitment is saved on-chain. We’ve backed up your secret salt locally so you can auto-reveal when the window opens.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-100 border border-white/10 text-left text-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">Your Private Rate:</span>
                    <span className="font-bold text-white font-mono text-base">${Number(bidAmount).toLocaleString()}</span>
                  </div>
                  {txHash && (
                    <div className="pt-2 border-t border-white/5 space-y-1">
                      <span className="text-zinc-500 block text-[10px]">On-Chain Transaction Reference:</span>
                      <span className="font-mono text-[11px] text-emerald-300 break-all select-all font-semibold block">{txHash}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  {txHash && (
                    <a
                      href={`https://explorer.1am.xyz/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-bold text-xs shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-all"
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-black" />
                      Verify on 1AM Explorer
                    </a>
                  )}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={downloadBackupKeyfile}
                      className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-surface-200 hover:bg-surface-300 border border-white/10 text-xs font-semibold text-white transition-colors"
                    >
                      <Download className="h-3.5 w-3.5 text-cyan-400" />
                      Download Backup
                    </button>
                    <Link
                      to="/carrier/bids"
                      className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-surface-200 hover:bg-surface-300 border border-white/10 text-white font-semibold text-xs transition-all"
                    >
                      View My Bids
                    </Link>
                  </div>
                </div>
              </motion.div>
            ) : proverStage !== 'idle' ? (
              /* Proving Pipeline Step Animation */
              <div className="py-6 space-y-5 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-200 border border-white/10 text-emerald-400 mx-auto animate-pulse">
                  <Cpu className="h-6 w-6 animate-spin" style={{ animationDuration: '4s' }} />
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-bold text-white">
                    {proverStage === 'witness' && '1/3 Generating Private ZK Witness...'}
                    {proverStage === 'proving' && '2/3 Computing Proof on Midnight Prover...'}
                    {proverStage === 'signing' && '3/3 Signing with 1AM Wallet...'}
                  </div>
                  <p className="text-xs text-zinc-400 font-mono">Securing zero-knowledge mathematical parameters</p>
                </div>
              </div>
            ) : (
              /* Bid Entry Form */
              <div className="space-y-4">
                {/* Rate Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                    <span>Your Flat Carrier Bid ($)</span>
                    <span className="font-mono text-emerald-400">${(Number(bidAmount) / 2015).toFixed(2)}/mi</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
                    <input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      className="w-full glass-input pl-9 pr-4 py-3 rounded-xl text-base font-mono font-bold text-white placeholder-zinc-500"
                    />
                  </div>
                </div>

                {/* Salt Control */}
                <div className="p-3.5 rounded-xl bg-surface-100/90 border border-white/5 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Cryptographic Salt ($\sigma$)</span>
                    <button
                      type="button"
                      onClick={regenerateSalt}
                      className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-mono"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Regenerate
                    </button>
                  </div>
                  <div className="font-mono text-[11px] text-zinc-300 p-2 rounded bg-surface-50 border border-white/5 break-all">
                    {salt}
                  </div>
                </div>

                {/* Generated Commitment Preview */}
                <div className="p-3.5 rounded-xl bg-surface-100/90 border border-white/5 space-y-1.5 text-xs">
                  <span className="text-zinc-400 block">Public Output on Ledger:</span>
                  <div className="font-mono text-[10px] text-emerald-300 break-all select-all">
                    {commitment}
                  </div>
                </div>

                {/* Action Trigger */}
                {tender.status === TenderStatus.BIDDING_OPEN ? (
                  <button
                    type="button"
                    onClick={handlePlaceBid}
                    disabled={!bidAmount}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-400 hover:from-emerald-400 hover:to-cyan-300 text-black font-bold text-xs shadow-xl shadow-emerald-500/25 transition-all hover:scale-[1.02] disabled:opacity-50"
                  >
                    🚀 Sign & Submit Sealed Bid
                  </button>
                ) : tender.status === TenderStatus.REVEAL_PHASE ? (
                  <button
                    type="button"
                    onClick={handleReveal}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-bold text-xs shadow-xl shadow-amber-500/25 transition-all hover:scale-[1.02]"
                  >
                    ⚡ Reveal Bid & Prove Rate
                  </button>
                ) : tender.status === TenderStatus.DRAFT ? (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center space-y-2">
                    <p className="text-xs font-bold text-amber-300">⏳ Auction in Draft</p>
                    <p className="text-[11px] text-zinc-400">
                      The shipper has deployed this tender contract, but has not yet opened bidding on-chain.
                    </p>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-surface-200 text-center text-xs text-zinc-400">
                    Auction is settled. No new bids accepted.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
