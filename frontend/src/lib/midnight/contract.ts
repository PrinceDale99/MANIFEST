// ═══════════════════════════════════════════════════════════════════════════════
// Manifest — Contract Interface Bindings
// ═══════════════════════════════════════════════════════════════════════════════

import type { Tender, BidCommitment, TenderStatus } from '@/types/manifest'

const PROOF_SERVER_URL =
  process.env.NEXT_PUBLIC_PROOF_SERVER_URL || 'http://localhost:6300'

/**
 * Deploy a new freight tender to the Midnight ledger.
 * Executes the contract constructor with tender parameters.
 */
export async function deployTender(params: {
  loadHash: string
  reservePriceCommitment: string
  biddingDeadline: bigint
  revealDeadline: bigint
}): Promise<{ tenderId: string; txHash: string }> {
  const response = await fetch(`${PROOF_SERVER_URL}/api/deploy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      circuit: 'constructor',
      args: [
        params.loadHash,
        params.reservePriceCommitment,
        params.biddingDeadline,
        params.revealDeadline,
      ],
    }),
  })

  if (!response.ok) {
    throw new Error(`Deploy failed: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Open bidding on a tender (shipper-only).
 */
export async function openBidding(
  tenderId: string,
): Promise<{ txHash: string }> {
  const response = await fetch(`${PROOF_SERVER_URL}/api/circuit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      circuit: 'openBidding',
      contractAddress: tenderId,
      args: [tenderId],
    }),
  })

  if (!response.ok) {
    throw new Error(`Open bidding failed: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Submit a sealed-bid commitment.
 * bidAmount and salt are private witnesses — never leave the client.
 */
export async function submitBidCommitment(params: {
  tenderId: string
  bidAmount: bigint
  salt: string
}): Promise<{ commitmentHash: string; txHash: string }> {
  const response = await fetch(`${PROOF_SERVER_URL}/api/circuit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      circuit: 'submitBidCommitment',
      args: [params.tenderId, params.bidAmount, params.salt],
    }),
  })

  if (!response.ok) {
    throw new Error(`Submit commitment failed: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Transition tender from BIDDING_OPEN to REVEAL_PHASE.
 */
export async function transitionToReveal(
  tenderId: string,
): Promise<{ txHash: string }> {
  const response = await fetch(`${PROOF_SERVER_URL}/api/circuit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      circuit: 'transitionToReveal',
      args: [tenderId],
    }),
  })

  if (!response.ok) {
    throw new Error(`Transition to reveal failed: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Reveal a sealed bid by proving the commitment preimage.
 * Generates a ZK proof via the proof server.
 */
export async function revealBid(params: {
  tenderId: string
  bidAmount: bigint
  salt: string
}): Promise<{ proofHash: string; txHash: string }> {
  const response = await fetch(`${PROOF_SERVER_URL}/api/circuit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      circuit: 'revealBid',
      args: [params.tenderId, params.bidAmount, params.salt],
    }),
  })

  if (!response.ok) {
    throw new Error(`Reveal bid failed: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Settle a tender after the reveal deadline.
 */
export async function settleTender(
  tenderId: string,
): Promise<{ txHash: string }> {
  const response = await fetch(`${PROOF_SERVER_URL}/api/circuit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      circuit: 'settleTender',
      args: [tenderId],
    }),
  })

  if (!response.ok) {
    throw new Error(`Settle tender failed: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Fetch tender state from the ledger.
 */
export async function getTender(tenderId: string): Promise<Tender | null> {
  const response = await fetch(
    `${PROOF_SERVER_URL}/api/state?tenderId=${tenderId}`,
  )

  if (!response.ok) {
    return null
  }

  return response.json()
}

/**
 * Fetch all active tenders from the ledger.
 */
export async function getActiveTenders(): Promise<Tender[]> {
  const response = await fetch(`${PROOF_SERVER_URL}/api/tenders`)

  if (!response.ok) {
    return []
  }

  return response.json()
}

/**
 * Fetch all commitments for a tender.
 */
export async function getCommitments(
  tenderId: string,
): Promise<BidCommitment[]> {
  const response = await fetch(
    `${PROOF_SERVER_URL}/api/commitments?tenderId=${tenderId}`,
  )

  if (!response.ok) {
    return []
  }

  return response.json()
}
