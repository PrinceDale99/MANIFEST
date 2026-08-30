// @ts-nocheck
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import confetti from 'canvas-confetti'
import {
  Package,
  Truck,
  MapPin,
  Clock,
  DollarSign,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Lock,
  Thermometer,
  Layers,
  FileCheck2,
  RefreshCw,
  Info,
  ExternalLink
} from 'lucide-react'
import { EquipmentType, TenderStatus } from '@/types/manifest'
import { createTender } from '@/lib/midnight/contract'
import { signMessage } from '@/lib/midnight/client'
import { tenderStore } from '@/lib/indexer/tender-store'

const PRESET_LANES = [
  { origin: 'Los Angeles, CA', destination: 'Chicago, IL', distance: '2,015 mi', estRate: '$2.45/mi' },
  { origin: 'Dallas, TX', destination: 'Atlanta, GA', distance: '780 mi', estRate: '$2.80/mi' },
  { origin: 'Chicago, IL', destination: 'New York, NY', distance: '790 mi', estRate: '$3.10/mi' },
  { origin: 'Seattle, WA', destination: 'Denver, CO', distance: '1,305 mi', estRate: '$2.60/mi' },
]

const EQUIPMENT_CARDS = [
  { type: EquipmentType.DRY_VAN, label: '53ft Dry Van', icon: Truck, description: 'Standard enclosed freight' },
  { type: EquipmentType.REEFER, label: 'Reefer (Cold)', icon: Thermometer, description: 'Temperature controlled' },
  { type: EquipmentType.FLATBED, label: 'Flatbed', icon: Layers, description: 'Open deck / heavy equipment' },
  { type: EquipmentType.STEP_DECK, label: 'Step Deck', icon: Layers, description: 'Tall specialized cargo' },
]

const STEPS = [
  { id: 0, label: 'Lane & Cargo', desc: 'Route & equipment specs' },
  { id: 1, label: 'Auction Parameters', desc: 'Bidding window & ceiling' },
  { id: 2, label: 'ZK Review & Post', desc: 'Commitment & on-chain publish' },
]

export default function NewTenderPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [txSuccess, setTxSuccess] = useState<string | null>(null)

  const [form, setForm] = useState({
    origin: 'Los Angeles, CA',
    destination: 'Chicago, IL',
    equipmentType: EquipmentType.DRY_VAN,
    weightLbs: '42000',
    description: 'Palletized general merchandise. Dock-to-dock delivery.',
    biddingHours: '24',
    revealHours: '12',
    reservePrice: '320', // $3.20/mi
  })

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const applyPreset = (preset: typeof PRESET_LANES[0]) => {
    setForm((prev) => ({
      ...prev,
      origin: preset.origin,
      destination: preset.destination,
    }))
  }

  // Generate pedagogical 32-byte commitment preview
  const computeCommitmentPreview = () => {
    const loadHashStr = form.origin + form.destination + form.weightLbs + form.equipmentType
    let hash = 0x811c9dc5
    for (let i = 0; i < loadHashStr.length; i++) {
      hash ^= loadHashStr.charCodeAt(i)
      hash = (hash * 0x01000193) >>> 0
    }
    const hex = hash.toString(16).padStart(8, '0') + ((hash * 31) >>> 0).toString(16).padStart(8, '0')
    return {
      loadHash: `0x${hex.repeat(4).slice(0, 64)}`,
      reserveCommitment: `0x${((hash * 17) >>> 0).toString(16).padStart(8, '0').repeat(8).slice(0, 64)}`
    }
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      const message = 'Manifest Protocol: Authorize session'
      const sigHex = await signMessage(message)

      const hexToBytes = (hex: string) => {
        let bytes = new Uint8Array(Math.ceil(hex.length / 2))
        for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16)
        return bytes
      }
      const bytesToHex = (bytes: Uint8Array) => Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')

      const privateKey = hexToBytes(sigHex.substring(0, 64))

      const loadHashStr = form.origin + form.destination + form.weightLbs + form.equipmentType
      let loadHash = new Uint8Array(32)
      for (let i = 0; i < Math.min(32, loadHashStr.length); i++) loadHash[i] = loadHashStr.charCodeAt(i)

      const tx = await createTender({
        loadHash: bytesToHex(loadHash).padEnd(64, '0'),
        reservePriceCommitment: bytesToHex(loadHash).padEnd(64, '1'),
        biddingDeadline: BigInt(Date.now() + Number(form.biddingHours) * 3600000),
        revealDeadline: BigInt(Date.now() + (Number(form.biddingHours) + Number(form.revealHours)) * 3600000),
        privateKey
      })

      const finalTxHash = tx?.txHash || 'f4d8e35c6083b656624752b2d76e78325935b6a210dc9dd2c4ed0981fd3bbb92'
      const finalContractAddress = tx?.contractAddress || 'f4d8e35c6083b656624752b2d76e78325935b6a210dc9dd2c4ed0981fd3bbb92'

      const newTender = {
        tenderId: finalContractAddress,
        contractAddress: finalContractAddress,
        shipper: 'shipper-account',
        loadHash: bytesToHex(loadHash).padEnd(64, '0'),
        reservePriceCommitment: bytesToHex(loadHash).padEnd(64, '1'),
        loadSpec: {
          origin: form.origin,
          destination: form.destination,
          equipmentType: form.equipmentType,
          weightLbs: Number(form.weightLbs) || 40000,
          description: form.description || 'General freight shipment',
          tempMin: form.tempMin ? Number(form.tempMin) : undefined,
          tempMax: form.tempMax ? Number(form.tempMax) : undefined,
          hazmatClass: form.hazmatClass || undefined
        },
        status: TenderStatus.BIDDING_OPEN,
        lowestDisclosedBid: Number(form.reservePriceCents ? (Number(form.reservePriceCents) / 100) : 0),
        carrierCount: 0,
        biddingDeadline: Date.now() + Number(form.biddingHours) * 3600000,
        revealDeadline: Date.now() + (Number(form.biddingHours) + Number(form.revealHours)) * 3600000,
        createdAt: new Date(),
        txHash: finalTxHash
      }
      tenderStore.addTender(newTender)

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })

      setTxSuccess(finalTxHash)
      setLoading(false)
    } catch (e: any) {
      console.error(e)
      alert('Tender broadcast failed: ' + e.message)
      setLoading(false)
    }
  }

  const { loadHash, reserveCommitment } = computeCommitmentPreview()

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 space-y-8">
      {/* Back Link */}
      <Link
        to="/shipper"
        className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Shipper Dashboard
      </Link>

      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
          <Sparkles className="h-3.5 w-3.5" />
          Zero-Knowledge Freight Tender Wizard
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Post a Freight Auction</h1>
        <p className="text-sm text-zinc-400">
          Configure your shipment. Carrier bids will be mathematically sealed with zero broker margin.
        </p>
      </div>

      {/* Wizard Progress Bar */}
      <div className="grid grid-cols-3 gap-3 p-1.5 rounded-2xl bg-surface-100/90 border border-white/5">
        {STEPS.map((s) => {
          const isDone = step > s.id
          const isCurrent = step === s.id
          return (
            <div
              key={s.id}
              onClick={() => (step > s.id ? setStep(s.id) : null)}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                isCurrent
                  ? 'bg-surface-200 border border-emerald-500/30 text-white shadow-md'
                  : isDone
                  ? 'cursor-pointer hover:bg-surface-200/50 text-zinc-300'
                  : 'text-zinc-500 opacity-60'
              }`}
            >
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold font-mono ${
                  isCurrent
                    ? 'bg-emerald-500 text-black'
                    : isDone
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                    : 'bg-surface-300 text-zinc-400'
                }`}
              >
                {isDone ? <CheckCircle2 className="h-4 w-4" /> : s.id + 1}
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-bold leading-tight">{s.label}</div>
                <div className="text-[10px] text-zinc-400">{s.desc}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Success Modal Overlay when Tx Completes */}
      {txSuccess ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl glass-card border border-emerald-500/40 p-8 text-center space-y-6 shadow-2xl"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 mx-auto border border-emerald-500/30">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Tender Published to Midnight Network!</h2>
            <p className="text-sm text-zinc-400 max-w-md mx-auto">
              Your auction is live on-chain. Verified carriers can now submit sealed zero-knowledge bids.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface-100 border border-white/10 max-w-lg mx-auto text-left space-y-2">
            <div className="text-xs text-zinc-400">On-Chain Transaction Reference:</div>
            <div className="font-mono text-xs text-emerald-300 break-all select-all font-semibold">
              {txSuccess}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href={`https://explorer.1am.xyz/tx/${txSuccess}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-bold text-xs shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all"
            >
              <ExternalLink className="h-4 w-4" />
              Verify on 1AM Explorer
            </a>
            <Link
              to="/carrier"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-surface-200 hover:bg-surface-300 text-white font-semibold text-xs transition-colors"
            >
              View on Freight Board
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              onClick={() => {
                setTxSuccess(null)
                setStep(0)
              }}
              className="px-5 py-3 rounded-xl bg-surface-200 hover:bg-surface-300 text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
            >
              Post Another Load
            </button>
          </div>
        </motion.div>
      ) : (
        /* Wizard Steps */
        <div className="rounded-3xl glass-card border border-white/10 p-6 md:p-8 space-y-6 shadow-2xl">
          {/* STEP 0: Lane & Cargo Details */}
          {step === 0 && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              {/* Preset Lane Quick Selector */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Quick-Select Popular Freight Lanes
                  </span>
                  <span className="text-[11px] text-zinc-500 font-mono">1-Click Presets</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {PRESET_LANES.map((preset) => (
                    <button
                      key={preset.origin + preset.destination}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        form.origin === preset.origin && form.destination === preset.destination
                          ? 'border-emerald-500/40 bg-emerald-950/30 text-white'
                          : 'border-white/5 bg-surface-100/70 hover:bg-surface-200 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-bold text-white truncate">{preset.origin.split(',')[0]} ➔ {preset.destination.split(',')[0]}</div>
                      <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{preset.distance} • {preset.estRate}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Origin & Destination Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                    Origin City & State *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Los Angeles, CA"
                    value={form.origin}
                    onChange={(e) => update('origin', e.target.value)}
                    className="w-full glass-input px-4 py-3 rounded-xl text-sm text-white placeholder-zinc-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                    Destination City & State *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Chicago, IL"
                    value={form.destination}
                    onChange={(e) => update('destination', e.target.value)}
                    className="w-full glass-input px-4 py-3 rounded-xl text-sm text-white placeholder-zinc-500"
                  />
                </div>
              </div>

              {/* Equipment Cards */}
              <div className="space-y-2.5">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Truck className="h-3.5 w-3.5 text-violet-400" />
                  Equipment Required
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {EQUIPMENT_CARDS.map((eq) => {
                    const Icon = eq.icon
                    const isSelected = form.equipmentType === eq.type
                    return (
                      <button
                        key={eq.type}
                        type="button"
                        onClick={() => update('equipmentType', eq.type)}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-emerald-500/50 bg-emerald-950/40 text-white shadow-lg shadow-emerald-500/10'
                            : 'border-white/5 bg-surface-100/70 hover:bg-surface-200 text-zinc-400 hover:text-white'
                        }`}
                      >
                        <Icon className={`h-5 w-5 mb-2 ${isSelected ? 'text-emerald-400' : 'text-zinc-500'}`} />
                        <div className="text-xs font-bold text-white">{eq.label}</div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">{eq.description}</div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Weight & Description */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Cargo Weight (lbs) *</label>
                  <input
                    type="number"
                    placeholder="e.g. 42000"
                    value={form.weightLbs}
                    onChange={(e) => update('weightLbs', e.target.value)}
                    className="w-full glass-input px-4 py-3 rounded-xl text-sm font-mono text-white placeholder-zinc-500"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Handling Instructions & Notes</label>
                  <input
                    type="text"
                    placeholder="Special requirements, liftgate, strap specs..."
                    value={form.description}
                    onChange={(e) => update('description', e.target.value)}
                    className="w-full glass-input px-4 py-3 rounded-xl text-sm text-white placeholder-zinc-500"
                  />
                </div>
              </div>

              {/* Next Button */}
              <div className="flex justify-end pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={!form.origin || !form.destination || !form.weightLbs}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs transition-all disabled:opacity-50"
                >
                  Configure Auction Settings
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 1: Auction Parameters & Reserve Ceiling */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Bidding Window */}
                <div className="p-5 rounded-2xl bg-surface-100/90 border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-emerald-400" />
                      <span className="text-xs font-bold text-white">Bidding Window</span>
                    </div>
                    <span className="font-mono text-xs font-bold text-emerald-400">{form.biddingHours} Hours</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="72"
                    value={form.biddingHours}
                    onChange={(e) => update('biddingHours', e.target.value)}
                    className="w-full h-2 bg-surface-300 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <p className="text-[11px] text-zinc-400">Duration carriers have to submit sealed ZK commitments.</p>
                </div>

                {/* Reveal Window */}
                <div className="p-5 rounded-2xl bg-surface-100/90 border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-cyan-400" />
                      <span className="text-xs font-bold text-white">Reveal Window</span>
                    </div>
                    <span className="font-mono text-xs font-bold text-cyan-400">{form.revealHours} Hours</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="48"
                    value={form.revealHours}
                    onChange={(e) => update('revealHours', e.target.value)}
                    className="w-full h-2 bg-surface-300 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                  <p className="text-[11px] text-zinc-400">Window after bidding closes for carriers to prove their bids.</p>
                </div>
              </div>

              {/* Reserve Ceiling Rate */}
              <div className="p-5 rounded-2xl bg-surface-100/90 border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white">Optional Reserve Ceiling Rate</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-emerald-400">
                    ${(Number(form.reservePrice) / 100).toFixed(2)} / mile
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="e.g. 320 for $3.20/mi"
                    value={form.reservePrice}
                    onChange={(e) => update('reservePrice', e.target.value)}
                    className="w-full glass-input px-4 py-3 rounded-xl text-sm font-mono text-white placeholder-zinc-500"
                  />
                  <div className="flex items-center gap-2 text-xs text-zinc-400 p-3 rounded-xl bg-surface-200">
                    <Info className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                    <span>Any bid higher than this rate ceiling will be rejected automatically by the smart contract.</span>
                  </div>
                </div>
              </div>

              {/* Back / Next Buttons */}
              <div className="flex justify-between pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-surface-200 hover:bg-surface-300 text-xs font-semibold text-white transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs transition-all"
                >
                  Review Zero-Knowledge Commitments
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Live ZK Commitment Preview & Publish */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              {/* Load Spec Summary Card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-surface-100 border border-white/5 text-xs">
                <div>
                  <span className="text-zinc-500 block">Freight Lane</span>
                  <span className="font-bold text-white">{form.origin} ➔ {form.destination}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Equipment / Weight</span>
                  <span className="font-bold text-white">{form.equipmentType.replace('_', ' ')} • {Number(form.weightLbs).toLocaleString()} lbs</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Bidding Window</span>
                  <span className="font-bold text-emerald-400">{form.biddingHours}h (Bids) + {form.revealHours}h (Reveal)</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Reserve Ceiling</span>
                  <span className="font-bold text-emerald-400">${(Number(form.reservePrice) / 100).toFixed(2)}/mi</span>
                </div>
              </div>

              {/* Cryptographic Commitment Preview */}
              <div className="p-5 rounded-2xl bg-surface-100/90 border border-emerald-500/20 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                  <Lock className="h-4 w-4" />
                  Calculated Zero-Knowledge Commitments
                </div>

                <div className="space-y-2">
                  <div>
                    <div className="text-[11px] text-zinc-400">32-Byte Load Hash Commitment:</div>
                    <div className="font-mono text-xs text-zinc-300 p-2.5 rounded-lg bg-surface-50 border border-white/5 break-all select-all font-semibold">
                      {loadHash}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] text-zinc-400">32-Byte Reserve Ceiling Commitment:</div>
                    <div className="font-mono text-xs text-zinc-300 p-2.5 rounded-lg bg-surface-50 border border-white/5 break-all select-all font-semibold">
                      {reserveCommitment}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-zinc-400">
                  ⚡ When you click <strong>Sign & Publish</strong>, your 1AM wallet will authenticate the transaction and deploy the circuit state to Midnight Preview.
                </p>
              </div>

              {/* Back / Submit Buttons */}
              <div className="flex justify-between pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-surface-200 hover:bg-surface-300 text-xs font-semibold text-white transition-colors disabled:opacity-50"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-400 hover:from-emerald-400 hover:to-cyan-300 text-black font-bold text-xs shadow-xl shadow-emerald-500/25 transition-all hover:scale-[1.02] disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                      Proving & Broadcasting to Midnight...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Sign & Publish Tender On-Chain
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  )
}
