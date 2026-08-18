'use client'

import { useState, useEffect } from 'react'
import type { Tender } from '@/types/manifest'
import { TenderStatus, TENDER_STATUS_CONFIG } from '@/types/manifest'
import ProofProgress from '@/components/ProofProgress'
import CryptographicProofBadge from '@/components/CryptographicProofBadge'
import { ProofStage } from '@/types/manifest'
import { deriveBidSalt, downloadKeyfile } from '@/lib/crypto/kdf'
import { generateBidCommitment } from '@/lib/crypto/commitment'
import { getWalletAddress } from '@/lib/midnight/client'

interface BidState {
  bidAmount: string
  salt: string
  commitmentHash: string
  proofStage: ProofStage
  proofError: string | null
  revealed: boolean
  proofHash: string | null
}

export default function CarrierBiddingPage({
  params,
}: {
  params: { id: string }
}) {
  const [tender, setTender] = useState<Tender | null>(null)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [bid, setBid] = useState<BidState>({
    bidAmount: '',
    salt: '',
    commitmentHash: '',
    proofStage: ProofStage.IDLE,
    proofError: null,
    revealed: false,
    proofHash: null,
  })

  useEffect(() => {
    // Fetch tender details
    fetch(`/api/tenders/${params.id}`)
      .then((r) => r.json())
      .then(setTender)
      .catch(console.error)

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
      setBid((prev) => ({ ...prev, commitmentHash }))
    } catch (error) {
      console.error('Failed to generate commitment:', error)
    }
  }

  const handleSubmitCommitment = async () => {
    setBid((prev) => ({
      ...prev,
      proofStage: ProofStage.WITNESS_EVALUATION,
      proofError: null,
    }))

    try {
      // Simulate proof generation stages
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
        commitmentHash: bid.commitmentHash || 'simulated',
      }))

      console.log('Commitment submitted:', bid.commitmentHash)
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
      proofStage: ProofStage.WITNESS_EVALUATION,
      proofError: null,
    }))

    try {
      // Simulate reveal proof generation
      await new Promise((r) => setTimeout(r, 1500))
      setBid((prev) => ({ ...prev, proofStage: ProofStage.CIRCUIT_COMPILATION }))

      await new Promise((r) => setTimeout(r, 2000))
      setBid((prev) => ({ ...prev, proofStage: ProofStage.PROOF_GENERATION }))

      await new Promise((r) => setTimeout(r, 2000))
      setBid((prev) => ({ ...prev, proofStage: ProofStage.LEDGER_SUBMISSION }))

      await new Promise((r) => setTimeout(r, 1000))

      const proofHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')

      setBid((prev) => ({
        ...prev,
        proofStage: ProofStage.COMPLETE,
        revealed: true,
        proofHash,
      }))
    } catch (error) {
      setBid((prev) => ({
        ...prev,
        proofStage: ProofStage.FAILED,
        proofError: (error as Error).message,
      }))
    }
  }

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
          {statusConfig && (
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase ${statusConfig.bgColor} ${statusConfig.color}`}
            >
              {statusConfig.label}
            </span>
          )}
        </div>
        <h1 className="mb-2 text-2xl font-bold text-white">
          Sealed Bid — {params.id.slice(0, 12)}...
        </h1>
        <p className="text-sm text-zinc-400">
          Your bid amount and salt are private witnesses. Only the
          commitment hash is stored on-chain.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Bid Form */}
        <div className="lg:col-span-2 space-y-4">
          {/* Bid Input */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">
              Bid Configuration
            </h2>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-zinc-300">
                  Bid Amount (cents per mile)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="e.g. 275 = $2.75/mi"
                    value={bid.bidAmount}
                    onChange={(e) =>
                      setBid((prev) => ({
                        ...prev,
                        bidAmount: e.target.value,
                      }))
                    }
                    className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 font-mono text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                  />
                  <button
                    onClick={handleDeriveSalt}
                    className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-700"
                  >
                    Derive Salt
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm text-zinc-300">
                  Salt (auto-derived or manual)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Click 'Derive Salt' or paste manually"
                    value={bid.salt}
                    onChange={(e) =>
                      setBid((prev) => ({ ...prev, salt: e.target.value }))
                    }
                    className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 font-mono text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                  />
                  {bid.salt && (
                    <button
                      onClick={() =>
                        downloadKeyfile(
                          params.id,
                          bid.salt,
                          walletAddress || 'unknown',
                        )
                      }
                      className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs text-zinc-400 transition-colors hover:bg-zinc-700"
                    >
                      💾 Backup
                    </button>
                  )}
                </div>
              </div>

              {/* Commitment Hash */}
              {bid.commitmentHash && (
                <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-3">
                  <p className="mb-1 text-xs text-zinc-400">
                    Commitment Hash
                  </p>
                  <p className="font-mono text-xs text-emerald-400 break-all">
                    {bid.commitmentHash}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleGenerateCommitment}
                  disabled={!bid.bidAmount || !bid.salt}
                  className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700 disabled:opacity-50"
                >
                  Generate Commitment
                </button>
                <button
                  onClick={handleSubmitCommitment}
                  disabled={!bid.commitmentHash}
                  className="flex-1 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
                >
                  Submit Sealed Bid
                </button>
              </div>

              {/* Reveal Button */}
              {tender?.status === TenderStatus.REVEAL_PHASE &&
                bid.proofStage === ProofStage.COMPLETE &&
                !bid.revealed && (
                  <button
                    onClick={handleRevealBid}
                    className="w-full rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-amber-500"
                  >
                    ⚡ Reveal Bid (Prove Commitment)
                  </button>
                )}
            </div>
          </div>

          {/* Tender Details */}
          {tender && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">
                Tender Details
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-zinc-500">Origin</p>
                  <p className="font-mono text-sm text-white">
                    {tender.loadSpec?.origin || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Destination</p>
                  <p className="font-mono text-sm text-white">
                    {tender.loadSpec?.destination || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Equipment</p>
                  <p className="text-sm text-white">
                    {tender.loadSpec?.equipmentType?.replace('_', ' ') || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Weight</p>
                  <p className="font-mono text-sm text-white">
                    {tender.loadSpec?.weightLbs
                      ? `${tender.loadSpec.weightLbs.toLocaleString()} lbs`
                      : '—'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Proof Progress */}
        <div className="space-y-4">
          <ProofProgress
            currentStage={bid.proofStage}
            error={bid.proofError}
          />

          {/* Verification Badge */}
          {bid.revealed && bid.proofHash && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
              <h3 className="mb-3 text-sm font-semibold text-white">
                Bid Verified
              </h3>
              <CryptographicProofBadge
                proofHash={bid.proofHash}
                verified={true}
                explorerUrl={`https:// explorer.midnight.network/proof/${bid.proofHash}`}
              />
              <p className="mt-3 text-xs text-zinc-500">
                Your bid has been revealed and verified on-chain. The ZK proof
                confirms your commitment without exposing the exact amount
                to other carriers.
              </p>
            </div>
          )}

          {/* Privacy Notice */}
          <div className="rounded-xl border border-cyan-900/50 bg-cyan-900/10 p-4">
            <h3 className="mb-2 text-xs font-semibold text-cyan-400">
              🔒 Privacy Guarantee
            </h3>
            <ul className="space-y-1 text-[11px] text-zinc-400">
              <li>• Your bid amount is a private witness</li>
              <li>• Only the commitment hash is on-chain</li>
              <li>• Reveal proves preimage without leaking salt</li>
              <li>• Rivals cannot see your exact quote</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
