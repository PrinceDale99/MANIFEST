// @ts-nocheck
'use client'

import { useState } from 'react'
import { EquipmentType } from '@/types/manifest'
import ProgressSteps from '@/components/ui/ProgressSteps'

const STEPS = [
  { label: 'Job Details', description: 'Where and what to ship' },
  { label: 'Auction Settings', description: 'Timing and price limits' },
  { label: 'Review & Post', description: 'Confirm and publish' },
]

export default function NewTenderPage() {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    origin: '',
    destination: '',
    equipmentType: EquipmentType.DRY_VAN,
    weightLbs: '',
    description: '',
    biddingHours: '48',
    revealHours: '24',
    reservePrice: '',
  })

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const canProceed = () => {
    if (step === 0) return form.origin && form.destination && form.weightLbs
    if (step === 1) return form.biddingHours && form.revealHours
    return true
  }

  const handleSubmit = async () => {
    setLoading(true)
    // In production: compute loadHash, deploy contract via Midnight SDK
    await new Promise((r) => setTimeout(r, 2000))
    setLoading(false)
    alert('Tender deployed to Midnight Preview! (Demo mode)')
    window.location.href = '/shipper'
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <a href="/shipper" className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Your Tenders
        </a>
        <h1 className="mb-2 text-2xl font-bold text-white">Post a Freight Auction</h1>
        <p className="text-sm text-zinc-400">
          Describe what you need shipped. Carrier bids will stay private until the reveal phase.
        </p>
      </div>

      {/* Progress */}
      <ProgressSteps steps={STEPS} currentStep={step} />

      {/* Step 1: Load Details */}
      {step === 0 && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="mb-6 text-sm font-semibold uppercase tracking-wider text-zinc-400">
            What Are You Shipping?
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm text-zinc-300">Origin *</label>
                <input
                  type="text"
                  placeholder="e.g. Chicago, IL"
                  value={form.origin}
                  onChange={(e) => update('origin', e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-zinc-300">Destination *</label>
                <input
                  type="text"
                  placeholder="e.g. Dallas, TX"
                  value={form.destination}
                  onChange={(e) => update('destination', e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm text-zinc-300">Equipment Type</label>
                <select
                  value={form.equipmentType}
                  onChange={(e) => update('equipmentType', e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                >
                  {Object.values(EquipmentType).map((eq) => (
                    <option key={eq} value={eq}>
                      {eq.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-zinc-300">Weight (lbs) *</label>
                <input
                  type="number"
                  placeholder="e.g. 42000"
                  value={form.weightLbs}
                  onChange={(e) => update('weightLbs', e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 font-mono text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm text-zinc-300">Description</label>
              <textarea
                placeholder="Special handling instructions, cargo details..."
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setStep(1)}
              disabled={!canProceed()}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-black transition-colors hover:bg-zinc-200 disabled:opacity-50"
            >
              Next: Auction Settings
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Bidding Config */}
      {step === 1 && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="mb-6 text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Auction Settings
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm text-zinc-300">Bidding Window (hours)</label>
                <input
                  type="number"
                  value={form.biddingHours}
                  onChange={(e) => update('biddingHours', e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 font-mono text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
                <p className="mt-1 text-xs text-zinc-500">How long carriers can submit bids</p>
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-zinc-300">Reveal Window (hours)</label>
                <input
                  type="number"
                  value={form.revealHours}
                  onChange={(e) => update('revealHours', e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 font-mono text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
                <p className="mt-1 text-xs text-zinc-500">How long carriers have to reveal bids</p>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm text-zinc-300">Reserve Price Ceiling (optional)</label>
              <input
                type="number"
                placeholder="e.g. 350 = $3.50/mi max"
                value={form.reservePrice}
                onChange={(e) => update('reservePrice', e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 font-mono text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
              />
              <p className="mt-1 text-xs text-zinc-500">Bids above this rate will be rejected</p>
            </div>
          </div>

          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setStep(0)}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-5 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <button
              onClick={() => setStep(2)}
              disabled={!canProceed()}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-black transition-colors hover:bg-zinc-200 disabled:opacity-50"
            >
              Review & Post
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Review & Deploy */}
      {step === 2 && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="mb-6 text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Review & Publish
          </h2>

          <div className="mb-6 space-y-3 rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
            <div className="flex justify-between">
              <span className="text-sm text-zinc-400">Lane</span>
              <span className="font-mono text-sm text-white">
                {form.origin} → {form.destination}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-zinc-400">Equipment</span>
              <span className="text-sm text-white">{form.equipmentType.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-zinc-400">Weight</span>
              <span className="font-mono text-sm text-white">
                {Number(form.weightLbs).toLocaleString()} lbs
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-zinc-400">Bidding Window</span>
              <span className="text-sm text-white">{form.biddingHours}h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-zinc-400">Reveal Window</span>
              <span className="text-sm text-white">{form.revealHours}h</span>
            </div>
            {form.reservePrice && (
              <div className="flex justify-between">
                <span className="text-sm text-zinc-400">Reserve Ceiling</span>
                <span className="font-mono text-sm text-emerald-400">
                  ${(Number(form.reservePrice) / 100).toFixed(2)}/mi
                </span>
              </div>
            )}
            {form.description && (
              <div className="flex justify-between">
                <span className="text-sm text-zinc-400">Description</span>
                <span className="max-w-xs text-right text-sm text-white">{form.description}</span>
              </div>
            )}
          </div>

          <div className="mb-6 rounded-lg border border-amber-900/50 bg-amber-900/20 p-4">
            <p className="text-sm text-amber-300">
              ⚡ This will post your auction to the Midnight blockchain. You'll need testnet NIGHT tokens.
            </p>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-5 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Deploying...
                </>
              ) : (
                <>
                  🚀 Post Auction
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
