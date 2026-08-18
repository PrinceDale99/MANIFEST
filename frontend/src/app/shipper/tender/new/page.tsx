'use client'

import { useState } from 'react'
import { EquipmentType } from '@/types/manifest'

export default function NewTenderPage() {
  const [form, setForm] = useState({
    origin: '',
    destination: '',
    equipmentType: EquipmentType.DRY_VAN,
    weightLbs: '',
    tempMin: '',
    tempMax: '',
    hazmatClass: '',
    description: '',
    biddingHours: '48',
    revealHours: '24',
    reservePrice: '',
  })
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      // In production: compute loadHash, deploy contract via Midnight SDK
      console.log('Deploying tender:', form)
      alert('Tender deployment initiated! (Demo mode)')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="mb-2 text-2xl font-bold text-white">
          Create Freight Tender
        </h1>
        <p className="text-sm text-zinc-400">
          Define your load specifications and bidding parameters. All carrier
          bids will be sealed with zero-knowledge proofs.
        </p>
      </div>

      {/* Step Indicator */}
      <div className="mb-8 flex items-center gap-2">
        {['Load Details', 'Bidding Config', 'Review & Deploy'].map(
          (label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  step > i + 1
                    ? 'bg-emerald-900/50 text-emerald-400'
                    : step === i + 1
                      ? 'bg-white text-black'
                      : 'bg-zinc-800 text-zinc-500'
                }`}
              >
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span
                className={`text-xs ${step === i + 1 ? 'text-white' : 'text-zinc-500'}`}
              >
                {label}
              </span>
              {i < 2 && <div className="mx-2 h-px w-8 bg-zinc-700" />}
            </div>
          ),
        )}
      </div>

      {/* Step 1: Load Details */}
      {step === 1 && (
        <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Load Specifications
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm text-zinc-300">
                Origin
              </label>
              <input
                type="text"
                placeholder="e.g. Chicago, IL"
                value={form.origin}
                onChange={(e) => updateForm('origin', e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 font-mono text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-zinc-300">
                Destination
              </label>
              <input
                type="text"
                placeholder="e.g. Dallas, TX"
                value={form.destination}
                onChange={(e) => updateForm('destination', e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 font-mono text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm text-zinc-300">
                Equipment Type
              </label>
              <select
                value={form.equipmentType}
                onChange={(e) =>
                  updateForm('equipmentType', e.target.value)
                }
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
              >
                {Object.values(EquipmentType).map((eq) => (
                  <option key={eq} value={eq}>
                    {eq.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-zinc-300">
                Weight (lbs)
              </label>
              <input
                type="number"
                placeholder="e.g. 42000"
                value={form.weightLbs}
                onChange={(e) => updateForm('weightLbs', e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 font-mono text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Temperature Range (for reefer) */}
          {form.equipmentType === EquipmentType.REEFER && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm text-zinc-300">
                  Min Temp (°F)
                </label>
                <input
                  type="number"
                  placeholder="e.g. -10"
                  value={form.tempMin}
                  onChange={(e) => updateForm('tempMin', e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 font-mono text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-zinc-300">
                  Max Temp (°F)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 35"
                  value={form.tempMax}
                  onChange={(e) => updateForm('tempMax', e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 font-mono text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm text-zinc-300">
              Description
            </label>
            <textarea
              placeholder="Special handling instructions, cargo details..."
              value={form.description}
              onChange={(e) => updateForm('description', e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setStep(2)}
              className="rounded-lg bg-white px-6 py-2 text-sm font-medium text-black transition-colors hover:bg-zinc-200"
            >
              Next: Bidding Config →
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Bidding Configuration */}
      {step === 2 && (
        <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Bidding Configuration
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm text-zinc-300">
                Bidding Window (hours)
              </label>
              <input
                type="number"
                value={form.biddingHours}
                onChange={(e) =>
                  updateForm('biddingHours', e.target.value)
                }
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 font-mono text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-zinc-300">
                Reveal Window (hours)
              </label>
              <input
                type="number"
                value={form.revealHours}
                onChange={(e) =>
                  updateForm('revealHours', e.target.value)
                }
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 font-mono text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm text-zinc-300">
              Reserve Price Ceiling (optional, cents/mi)
            </label>
            <input
              type="number"
              placeholder="e.g. 350 = $3.50/mi max"
              value={form.reservePrice}
              onChange={(e) => updateForm('reservePrice', e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 font-mono text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
            />
            <p className="mt-1 text-xs text-zinc-500">
              Optional: Set a maximum rate. Bids above this will be rejected.
            </p>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="rounded-lg border border-zinc-700 px-6 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
            >
              ← Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="rounded-lg bg-white px-6 py-2 text-sm font-medium text-black transition-colors hover:bg-zinc-200"
            >
              Next: Review →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Review & Deploy */}
      {step === 3 && (
        <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Review & Deploy
          </h2>

          <div className="space-y-3 rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
            <div className="flex justify-between">
              <span className="text-sm text-zinc-400">Lane</span>
              <span className="font-mono text-sm text-white">
                {form.origin || '—'} → {form.destination || '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-zinc-400">Equipment</span>
              <span className="text-sm text-white">
                {form.equipmentType.replace('_', ' ')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-zinc-400">Weight</span>
              <span className="font-mono text-sm text-white">
                {form.weightLbs ? `${Number(form.weightLbs).toLocaleString()} lbs` : '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-zinc-400">Bidding Window</span>
              <span className="text-sm text-white">
                {form.biddingHours}h
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-zinc-400">Reveal Window</span>
              <span className="text-sm text-white">
                {form.revealHours}h
              </span>
            </div>
            {form.reservePrice && (
              <div className="flex justify-between">
                <span className="text-sm text-zinc-400">
                  Reserve Ceiling
                </span>
                <span className="font-mono text-sm text-emerald-400">
                  ${(Number(form.reservePrice) / 100).toFixed(2)}/mi
                </span>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-amber-900/50 bg-amber-900/20 p-3">
            <p className="text-xs text-amber-300">
              ⚡ This will deploy a smart contract to the Midnight Preview
              network. You will need testnet NIGHT tokens.
            </p>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep(2)}
              className="rounded-lg border border-zinc-700 px-6 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
            >
              ← Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="rounded-lg bg-emerald-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
            >
              {loading ? 'Deploying...' : '🚀 Deploy Tender'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
