// ═══════════════════════════════════════════════════════════════════════════════
// Manifest — Unit Tests
// Circuit logic, state transitions, and reverse auction verification
// ═══════════════════════════════════════════════════════════════════════════════

import { beforeEach, describe, expect, it } from 'vitest'
import {
  computeLoadHash,
  generateBidCommitment,
  verifyCommitment,
} from '../frontend/src/lib/crypto/commitment'
import { TenderStatus } from '../frontend/src/types/manifest'

// ─── Tender State Machine Tests ─────────────────────────────────────────────

describe('Tender Lifecycle State Transitions', () => {
  it('should define valid state transitions', () => {
    const validTransitions: Record<TenderStatus, TenderStatus[]> = {
      [TenderStatus.DRAFT]: [TenderStatus.BIDDING_OPEN, TenderStatus.CANCELLED],
      [TenderStatus.BIDDING_OPEN]: [TenderStatus.REVEAL_PHASE, TenderStatus.CANCELLED],
      [TenderStatus.REVEAL_PHASE]: [TenderStatus.SETTLED, TenderStatus.CANCELLED],
      [TenderStatus.SETTLED]: [], // Terminal state
      [TenderStatus.CANCELLED]: [], // Terminal state
    }

    // Verify DRAFT -> BIDDING_OPEN is valid
    expect(validTransitions[TenderStatus.DRAFT]).toContain(TenderStatus.BIDDING_OPEN)

    // Verify DRAFT -> SETTLED is invalid (not in allowed list)
    expect(validTransitions[TenderStatus.DRAFT]).not.toContain(TenderStatus.SETTLED)

    // Verify SETTLED is terminal
    expect(validTransitions[TenderStatus.SETTLED]).toHaveLength(0)

    // Verify CANCELLED is terminal
    expect(validTransitions[TenderStatus.CANCELLED]).toHaveLength(0)
  })

  it('should not allow skipping states', () => {
    const validTransitions: Record<TenderStatus, TenderStatus[]> = {
      [TenderStatus.DRAFT]: [TenderStatus.BIDDING_OPEN, TenderStatus.CANCELLED],
      [TenderStatus.BIDDING_OPEN]: [TenderStatus.REVEAL_PHASE, TenderStatus.CANCELLED],
      [TenderStatus.REVEAL_PHASE]: [TenderStatus.SETTLED, TenderStatus.CANCELLED],
      [TenderStatus.SETTLED]: [],
      [TenderStatus.CANCELLED]: [],
    }

    // DRAFT -> REVEAL_PHASE should be invalid (must go through BIDDING_OPEN)
    expect(validTransitions[TenderStatus.DRAFT]).not.toContain(TenderStatus.REVEAL_PHASE)

    // BIDDING_OPEN -> SETTLED should be invalid (must go through REVEAL_PHASE)
    expect(validTransitions[TenderStatus.BIDDING_OPEN]).not.toContain(TenderStatus.SETTLED)
  })
})

// ─── Commitment Hash Tests ──────────────────────────────────────────────────

describe('Bid Commitment Generation', () => {
  const testParams = {
    tenderId: 'a'.repeat(64), // 32 bytes as hex
    carrierPk: 'b'.repeat(64),
    bidAmount: 27500n, // $2.75/mi in cents
    salt: 'c'.repeat(64),
  }

  it('should generate a consistent commitment hash', async () => {
    const hash1 = await generateBidCommitment(testParams)
    const hash2 = await generateBidCommitment(testParams)

    expect(hash1).toBe(hash2)
    expect(hash1).toHaveLength(64) // SHA-256 hex = 64 chars
  })

  it('should produce different hashes for different bid amounts', async () => {
    const hash1 = await generateBidCommitment(testParams)
    const hash2 = await generateBidCommitment({
      ...testParams,
      bidAmount: 30000n, // Different amount
    })

    expect(hash1).not.toBe(hash2)
  })

  it('should produce different hashes for different salts', async () => {
    const hash1 = await generateBidCommitment(testParams)
    const hash2 = await generateBidCommitment({
      ...testParams,
      salt: 'd'.repeat(64),
    })

    expect(hash1).not.toBe(hash2)
  })

  it('should produce different hashes for different tender IDs', async () => {
    const hash1 = await generateBidCommitment(testParams)
    const hash2 = await generateBidCommitment({
      ...testParams,
      tenderId: 'e'.repeat(64),
    })

    expect(hash1).not.toBe(hash2)
  })

  it('should verify valid commitments', async () => {
    const commitment = await generateBidCommitment(testParams)
    const isValid = await verifyCommitment(commitment, testParams)

    expect(isValid).toBe(true)
  })

  it('should reject tampered commitments', async () => {
    const commitment = await generateBidCommitment(testParams)

    // Try to verify with a different bid amount
    const isInvalid = await verifyCommitment(commitment, {
      ...testParams,
      bidAmount: 99999n, // Tampered amount
    })

    expect(isInvalid).toBe(false)
  })

  it('should reject commitments with wrong salt', async () => {
    const commitment = await generateBidCommitment(testParams)

    const isInvalid = await verifyCommitment(commitment, {
      ...testParams,
      salt: 'f'.repeat(64), // Wrong salt
    })

    expect(isInvalid).toBe(false)
  })
})

// ─── Reverse Auction Logic Tests ────────────────────────────────────────────

describe('Reverse Auction Logic', () => {
  it('should track the lowest bid correctly', () => {
    const bids = [30000n, 25000n, 27500n, 22000n, 31000n]
    const SENTINEL = 0xffffffffffffffffn

    let lowestBid = SENTINEL
    let winner = 'none'

    const carriers = ['A', 'B', 'C', 'D', 'E']

    bids.forEach((bid, i) => {
      if (bid < lowestBid) {
        lowestBid = bid
        winner = carriers[i]
      }
    })

    expect(lowestBid).toBe(22000n) // $2.20/mi — lowest
    expect(winner).toBe('D')
  })

  it('should not overwrite lowest bid with higher bid', () => {
    const SENTINEL = 0xffffffffffffffffn
    let lowestBid = SENTINEL

    // First bid: $3.00/mi
    const bid1 = 30000n
    if (bid1 < lowestBid) lowestBid = bid1
    expect(lowestBid).toBe(30000n)

    // Second bid: $3.50/mi (higher — should NOT update)
    const bid2 = 35000n
    if (bid2 < lowestBid) lowestBid = bid2
    expect(lowestBid).toBe(30000n) // Still $3.00

    // Third bid: $2.50/mi (lower — should update)
    const bid3 = 25000n
    if (bid3 < lowestBid) lowestBid = bid3
    expect(lowestBid).toBe(25000n) // Now $2.50
  })

  it('should handle the sentinel value correctly', () => {
    const SENTINEL = 0xffffffffffffffffn
    expect(SENTINEL).toBe(18446744073709551615n) // Max uint64
    expect(100n < SENTINEL).toBe(true)
  })
})

// ─── Load Hash Tests ────────────────────────────────────────────────────────

describe('Load Hash Computation', () => {
  it('should produce consistent load hashes', async () => {
    const params = {
      origin: 'Chicago, IL',
      destination: 'Dallas, TX',
      equipmentType: 'DRY_VAN',
      weightLbs: 42000,
    }

    const hash1 = await computeLoadHash(params)
    const hash2 = await computeLoadHash(params)

    expect(hash1).toBe(hash2)
    expect(hash1).toHaveLength(64)
  })

  it('should produce different hashes for different origins', async () => {
    const hash1 = await computeLoadHash({
      origin: 'Chicago, IL',
      destination: 'Dallas, TX',
      equipmentType: 'DRY_VAN',
      weightLbs: 42000,
    })

    const hash2 = await computeLoadHash({
      origin: 'Los Angeles, CA',
      destination: 'Dallas, TX',
      equipmentType: 'DRY_VAN',
      weightLbs: 42000,
    })

    expect(hash1).not.toBe(hash2)
  })
})
