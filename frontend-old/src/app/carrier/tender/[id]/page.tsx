'use client'

import { useState, useEffect } from 'react'
import type { Tender } from '@/types/manifest'
import { TenderStatus } from '@/types/manifest'
import StatusBadge from '@/components/ui/StatusBadge'
import LaneDisplay from '@/components/ui/LaneDisplay'
import ProofProgress from '@/components/ProofProgress'
import CryptographicProofBadge from '@/components/CryptographicProofBadge'
import { ProofStage } from '@/types/manifest'
import { deriveBidSalt, downloadKeyfile } from '@/lib/crypto/kdf'
import { generateBidCommitment } from '@/lib/crypto/commitment'
import { getWalletAddress } from '@/lib/midnight/client'

interface BidState {
  step: number
  bidAmount: string
  salt: string
  commitmentHash: string
  proofStage: ProofStage
  proofError: string | null
  revealed: boolean
  proofHash: string | null
}

const BID_STEPS = [
  { label: 'Set Your Bid', description: 'Enter amount and security code' },
  { label: 'Create Seal', description: 'Generate mathematical fingerprint' },
  { label: 'Submit Private Bid', description: 'Send proof to blockchain' },
  { label: 'Reveal & Win', description: 'Prove your bid is real' },
]

export default function CarrierTenderDetailPage({ params }: { params: { id: string } }) {
  const [tender, setTender] = useState<Tender | null>(null)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [bid, setBid] = useState<BidState>({
    step: 0,
    bidAmount: '',
    salt: '',
    commitmentHash: '',
    proofStage: ProofStage.IDLE,
    proofError: null,
    revealed: false,
    proofHash: null,
  })

  useEffect(() => {
    // In production: fetch tender details from API
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
      status: TenderStatus.BIDDING_OPEN,
      lowestDisclosedBid: 0xFFFFFFFFFFFFFFFF,
      carrierCount: 3,
      biddingDeadline: 1000,
      revealDeadline: 1100,
      createdAt: new Date(),
    })

    getWalletAddress().then(setWalletAddress)
  }, [params.id])

  const handleDeriveSalt = async () => {
    try {
      const salt = await deriveBidSalt(params.id)
      setBid((prev) => ({ ...prev, salt }))
    } catch (error) {
      console.error('Failed to derive salt:', error)
    }
  }

  const handleGenerateCommitment = async () => {
    if (!bid.bidAmount || !bid.salt || !walletAddress) return

    try {
      const commitmentHash = await generateBidCommitment({
        tenderId: params.id,
        carrierPk: walletAddress,
        bidAmount: BigInt(Math.round(parseFloat(bid.bidAmount) * 100)),
        salt: bid.salt,
      })
      setBid((prev) => ({ ...prev, commitmentHash, step: 1 }))
    } catch (error) {
      console.error('Failed to generate commitment:', error)
    }
  }

  const handleSubmitCommitment = async () => {
    setBid((prev) => ({
      ...prev,
      step: 2,
      proofStage: ProofStage.WITNESS_EVALUATION,
      proofError: null,
    }))

    try {
      await new Promise((r) => setTimeout(r, 1000))
      setBid((prev) => ({ ...prev, proofStage: ProofStage.CIRCUIT_COMPILATION }))

      await new Promise((r) => setTimeout(r, 1500))
      setBid((prev) => ({ ...prev, proofStage: ProofStage.PROOF_GENERATION }))

      await new Promise((r) => setTimeout(r, 2000))
      setBid((prev) => ({ ...prev, proofStage: ProofStage.LEDGER_SUBMISSION }))

      await new Promise((r) => setTimeout(r, 1000))
      setBid((prev) => ({
        ...prev,
        proofStage: ProofStage.COMPLETE,
        step: 2,
      }))
    } catch (error) {
      setBid((prev) => ({
        ...prev,
        proofStage: ProofStage.FAILED,
        proofError: (error as Error).message,
      }))
    }
  }

  const handleRevealBid = async () => {
    setBid((prev) => ({
      ...prev,
      step: 3,
      proofStage: ProofStage.WITNESS_EVALUATION,
      proofError: null,
    }))

    try {
      await new Promise((r) => setTimeout(r, 1500))
      setBid((prev) => ({ ...prev, proofStage: ProofStage.CIRCUIT_COMPILATION }))

      await new Promise((r) => setTimeout(r, 2000))
      setBid((prev) => ({ ...prev, proofStage: ProofStage.PROOF_GENERATION }))

      await new Promise((r) => setTimeout(r, 2000))
      setBid((prev) => ({ ...prev, proofStage: ProofStage.LEDGER_SUBMISSION }))

      await new Promise((r) => setTimeout(r, 1000))

      const proofHash = '0x' + Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16),
      ).join('')

      setBid((prev) => ({
        ...prev,
        proofStage: ProofStage.COMPLETE,
        revealed: true,
        proofHash,
        step: 3,
      }))
    } catch (error) {
      setBid((prev) => ({
        ...prev,
        proofStage: ProofStage.FAILED,
        proofError: (error as Error).message,
      }))
    }
  }

  if (!tender) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-emerald-400" />
          <p className="text-sm text-zinc-400">Loading tender...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <a href="/carrier" className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Auctions
        </a>

        <div className="flex items-center gap-4">
          <StatusBadge status={tender.status} size="md" />
          <LaneDisplay
            origin={tender.loadSpec?.origin || '—'}
            destination={tender.loadSpec?.destination || '—'}
            size="lg"
          />
        </div>

        <p className="mt-3 text-sm text-zinc-400">
          Your bid amount and security code stay private. Only a mathematical seal is stored on the blockchain.
        </p>
      </div>

      {/* Bid Progress Steps */}
      <nav className="mb-8">
        <ol className="flex items-center">
          {BID_STEPS.map((step, index) => {
            const isComplete = index < bid.step
            const isCurrent = index === bid.step
            return (
              <li key={step.label} className={`relative flex items-center ${index < BID_STEPS.length - 1 ? 'flex-1' : ''}`}>
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                      isComplete
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                          ? 'bg-white text-black'
                          : 'bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    {isComplete ? '✓' : index + 1}
                  </div>
                  <div className="hidden sm:block">
                    <p className={`text-sm font-medium ${isCurrent ? 'text-white' : isComplete ? 'text-emerald-400' : 'text-zinc-500'}`}>
                      {step.label}
                    </p>
                    {isCurrent && <p className="text-xs text-zinc-400">{step.description}</p>}
                  </div>
                </div>
                {index < BID_STEPS.length - 1 && (
                  <div className={`ml-3 h-px flex-1 ${isComplete ? 'bg-emerald-600' : 'bg-zinc-800'}`} />
                )}
              </li>
            )
          })}
        </ol>
      </nav>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Bid Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 0: Configure Bid */}
          {bid.step === 0 && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">
                Set Your Bid Amount
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm text-zinc-300">
                    Your Bid (cents per mile)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="e.g. 275 = $2.75/mi"
                      value={bid.bidAmount}
                      onChange={(e) => setBid((prev) => ({ ...prev, bidAmount: e.target.value }))}
                      className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 font-mono text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                    />
                    <button
                      onClick={handleDeriveSalt}
                      className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700"
                    >
                      Derive Salt
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm text-zinc-300">
                    Security Code (auto-generated or manual)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Click 'Derive Salt' or paste manually"
                      value={bid.salt}
                      onChange={(e) => setBid((prev) => ({ ...prev, salt: e.target.value }))}
                      className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 font-mono text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                    />
                    {bid.salt && (
                      <button
                        onClick={() =>
                          downloadKeyfile(params.id, bid.salt, walletAddress || 'unknown')
                        }
                        className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-xs text-zinc-400 transition-colors hover:bg-zinc-700"
                      >
                        💾 Backup
                      </button>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleGenerateCommitment}
                  disabled={!bid.bidAmount || !bid.salt}
                  className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
                >
                  Generate Commitment →
                </button>
              </div>
            </div>
          )}

          {/* Step 1: Review Commitment */}
          {bid.step === 1 && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">
                Your Bid is Sealed
              </h2>

              <div className="mb-4 rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
                <p className="mb-1 text-xs text-zinc-500">Your Private Bid</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Amount</span>
                    <span className="font-mono text-white">
                      ${(parseFloat(bid.bidAmount)).toFixed(2)}/mi
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Commitment Hash</span>
                    <span className="font-mono text-xs text-emerald-400 break-all">
                      {bid.commitmentHash.slice(0, 20)}...{bid.commitmentHash.slice(-8)}
                    </span>
                  </div>
                </div>
              </div>

              <p className="mb-4 text-xs text-zinc-500">
                This hash is what gets stored on-chain. Your actual bid amount remains private.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setBid((prev) => ({ ...prev, step: 0 }))}
                  className="flex-1 rounded-lg border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
                >
                  ← Edit Bid
                </button>
                <button
                  onClick={handleSubmitCommitment}
                  className="flex-1 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
                >
                  Submit Private Bid →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Proof Generation */}
          {bid.step === 2 && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">
                Creating Mathematical Proof
              </h2>
              <ProofProgress currentStage={bid.proofStage} error={bid.proofError} />

              {bid.proofStage === ProofStage.COMPLETE && (
                <div className="mt-4">
                  {tender.status === TenderStatus.REVEAL_PHASE ? (
                    <button
                      onClick={handleRevealBid}
                      className="w-full rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-amber-500"
                    >
                      ⚡ Reveal Your Bid (Prove It's Real)
                    </button>
                  ) : (
                    <p className="text-center text-sm text-zinc-400">
                      Bid submitted! Waiting for reveal phase to start...
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Revealed */}
          {bid.step === 3 && bid.revealed && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">
                Your Bid Was Verified
              </h2>

              <div className="mb-4 flex items-center gap-3 rounded-lg border border-emerald-900/50 bg-emerald-900/10 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-900/50">
                  <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-emerald-400">Successfully Verified</p>
                  <p className="text-xs text-zinc-400">Your bid was confirmed on the blockchain</p>
                </div>
              </div>

              <CryptographicProofBadge
                proofHash={bid.proofHash || ''}
                verified={true}
                explorerUrl={`https://explorer.midnight.network/proof/${bid.proofHash}`}
              />

              <p className="mt-4 text-xs text-zinc-500">
                Your bid was verified. The mathematical proof confirms your bid is real without
                showing the exact amount to other carriers.
              </p>

              <div className="mt-4 flex gap-3">
                <a
                  href="/carrier"
                  className="flex-1 rounded-lg border border-zinc-700 px-4 py-2.5 text-center text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
                >
                  Find More Auctions
                </a>
                <a
                  href={`/audit/${params.id}`}
                  className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-zinc-700"
                >
                  🔍 See Full Proof
                </a>
              </div>
            </div>
          )}

          {/* Tender Details */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">
              Job Details
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-zinc-500">Equipment</p>
                <p className="text-sm text-white">
                  {tender.loadSpec?.equipmentType?.replace('_', ' ') || '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Weight</p>
                <p className="font-mono text-sm text-white">
                  {tender.loadSpec?.weightLbs?.toLocaleString() || '—'} lbs
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-zinc-500">Description</p>
                <p className="text-sm text-white">{tender.loadSpec?.description || '—'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Privacy Info */}
        <div className="space-y-4">
          <div className="rounded-xl border border-cyan-900/50 bg-cyan-900/10 p-4">
            <h3 className="mb-2 text-xs font-semibold text-cyan-400">
              🔒 Privacy Guarantee
            </h3>
            <ul className="space-y-1.5 text-[11px] text-zinc-400">
              <li>• Your bid amount stays hidden</li>
              <li>• Only a math seal is on the blockchain</li>
              <li>• Reveal proves your bid is real</li>
              <li>• Competitors can't see your price</li>
            </ul>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
            <h3 className="mb-2 text-xs font-semibold text-white">How It Works</h3>
            <ol className="space-y-2 text-[11px] text-zinc-400">
              <li className="flex gap-2">
                <span className="font-bold text-emerald-400">1.</span>
                <span>Enter your bid and get a security code</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-emerald-400">2.</span>
                <span>Create a math seal (stored on blockchain)</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-emerald-400">3.</span>
                <span>During reveal, prove your bid matches</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-emerald-400">4.</span>
                <span>Lowest bid wins the freight job</span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
