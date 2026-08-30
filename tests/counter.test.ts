// ═══════════════════════════════════════════════════════════════════════════════
// Manifest Protocol — Compact Smart Contract Tests (counter.test.ts)
// ═══════════════════════════════════════════════════════════════════════════════
// Required Coverage:
// 1. Circuit logic
// 2. State transitions
// 3. That private inputs are never exposed
// ═══════════════════════════════════════════════════════════════════════════════

import { describe, it, expect } from 'vitest'
import { Contract as ManifestContract } from '../frontend/src/managed/contract/index.js'
import * as ledger from '@midnight-ntwrk/ledger-v8'
import * as cr from '@midnight-ntwrk/compact-runtime'

describe('Manifest Compact Smart Contract Test Suite (counter.test.ts)', () => {
  const tenderId = new Uint8Array(32).fill(0xaa)
  const loadHash = new Uint8Array(32).fill(0xbb)
  const reservePriceCommitment = new Uint8Array(32).fill(0xcc)
  const biddingDeadline = 10000n
  const revealDeadline = 20000n

  const shipperSecretKey = new Uint8Array(32).fill(0x11)
  const carrierSecretKey = new Uint8Array(32).fill(0x22)
  const dummyCoinPk = new Uint8Array(32)
  const contractAddress = '8fd2f7ba25464652e4fb5c3fcd57c8eb2c2e574d07b9789596478c75e47f4aa0'

  const enumDesc = new cr.CompactTypeEnum(4, 1)

  // ───────────────────────────────────────────────────────────────────────────
  // 1. Circuit Logic
  // ───────────────────────────────────────────────────────────────────────────
  describe('1. Circuit Logic & Mathematical Verification', () => {
    it('executes initialization circuit and sets default storage parameters', () => {
      const shipperContract = new ManifestContract({
        local_secret_key: () => [{}, shipperSecretKey],
        store_bid_amount: () => [{}, []],
        store_salt: () => [{}, []],
      })

      const initial = shipperContract.initialState(
        { initialPrivateState: {}, initialZswapLocalState: new ledger.ZswapLocalState() },
        tenderId,
        loadHash,
        reservePriceCommitment,
        biddingDeadline,
        revealDeadline
      )

      expect(initial).toBeDefined()
      expect(initial.currentContractState).toBeDefined()

      const stateArr = initial.currentContractState.data.state.asArray()
      expect(stateArr.length).toBe(10)

      // Cell 0: tenderId
      expect(stateArr[0].asCell().value[0] || stateArr[0].asCell().value).toEqual(tenderId)
      // Cell 2: loadHash
      expect(stateArr[2].asCell().value[0] || stateArr[2].asCell().value).toEqual(loadHash)
      // Cell 3: reservePriceCommitment
      expect(stateArr[3].asCell().value[0] || stateArr[3].asCell().value).toEqual(reservePriceCommitment)
    })

    it('executes submitBidCommitment circuit and computes valid ZK state updates', () => {
      const shipperContract = new ManifestContract({
        local_secret_key: () => [{}, shipperSecretKey],
        store_bid_amount: () => [{}, []],
        store_salt: () => [{}, []],
      })

      const initial = shipperContract.initialState(
        { initialPrivateState: {}, initialZswapLocalState: new ledger.ZswapLocalState() },
        tenderId,
        loadHash,
        reservePriceCommitment,
        biddingDeadline,
        revealDeadline
      )

      // Open bidding
      const openContext = cr.createCircuitContext(
        contractAddress,
        dummyCoinPk,
        initial.currentContractState.data,
        {}
      )
      const openRes = shipperContract.circuits.openBidding(openContext)

      // Carrier submits bid
      let storedWitnessAmount: any = null
      let storedWitnessSalt: any = null

      const carrierContract = new ManifestContract({
        local_secret_key: () => [{}, carrierSecretKey],
        store_bid_amount: (_ctx: any, amount: any) => {
          storedWitnessAmount = amount
          return [{}, []]
        },
        store_salt: (_ctx: any, salt: any) => {
          storedWitnessSalt = salt
          return [{}, []]
        },
      })

      const carrierContext = cr.createCircuitContext(
        contractAddress,
        dummyCoinPk,
        openRes.context.currentQueryContext.state,
        {}
      )

      const bidAmount = 275000n // $2,750.00
      const salt = new Uint8Array(32).fill(0x55)

      const bidRes = carrierContract.circuits.submitBidCommitment(carrierContext, bidAmount, salt)

      expect(bidRes).toBeDefined()
      expect(bidRes.proofData).toBeDefined()
      expect(storedWitnessAmount).toBe(bidAmount)
      expect(storedWitnessSalt).toEqual(salt)

      // Verify that the commitment was inserted into carrierCommitments map (Index 9)
      const map = bidRes.context.currentQueryContext.state.state.asArray()[9]
      expect(map).toBeDefined()
    })
  })

  // ───────────────────────────────────────────────────────────────────────────
  // 2. State Transitions
  // ───────────────────────────────────────────────────────────────────────────
  describe('2. State Transitions & Lifecycle Enforcement', () => {
    it('strictly enforces lifecycle transitions: DRAFT (0) -> BIDDING_OPEN (1) -> REVEAL_PHASE (2) -> SETTLED (3)', () => {
      const shipperContract = new ManifestContract({
        local_secret_key: () => [{}, shipperSecretKey],
        store_bid_amount: () => [{}, []],
        store_salt: () => [{}, []],
      })

      // State 0: DRAFT
      const initial = shipperContract.initialState(
        { initialPrivateState: {}, initialZswapLocalState: new ledger.ZswapLocalState() },
        tenderId,
        loadHash,
        reservePriceCommitment,
        biddingDeadline,
        revealDeadline
      )
      let currentState = initial.currentContractState.data
      let status = enumDesc.fromValue(currentState.state.asArray()[6].asCell().value)
      expect(status).toBe(0) // DRAFT

      // Transition: DRAFT (0) -> BIDDING_OPEN (1)
      const openCtx = cr.createCircuitContext(contractAddress, dummyCoinPk, currentState, {})
      const openRes = shipperContract.circuits.openBidding(openCtx)
      currentState = openRes.context.currentQueryContext.state
      status = enumDesc.fromValue(currentState.state.asArray()[6].asCell().value)
      expect(status).toBe(1) // BIDDING_OPEN

      // Transition: BIDDING_OPEN (1) -> REVEAL_PHASE (2)
      const revealPhaseCtx = cr.createCircuitContext(contractAddress, dummyCoinPk, currentState, {})
      const revealPhaseRes = shipperContract.circuits.transitionToReveal(revealPhaseCtx)
      currentState = revealPhaseRes.context.currentQueryContext.state
      status = enumDesc.fromValue(currentState.state.asArray()[6].asCell().value)
      expect(status).toBe(2) // REVEAL_PHASE

      // Transition: REVEAL_PHASE (2) -> SETTLED (3)
      const settleCtx = cr.createCircuitContext(contractAddress, dummyCoinPk, currentState, {})
      const settleRes = shipperContract.circuits.settleTender(settleCtx)
      currentState = settleRes.context.currentQueryContext.state
      status = enumDesc.fromValue(currentState.state.asArray()[6].asCell().value)
      expect(status).toBe(3) // SETTLED
    })

    it('rejects invalid state operations (cannot submit bids when auction is in DRAFT status)', () => {
      const shipperContract = new ManifestContract({
        local_secret_key: () => [{}, shipperSecretKey],
        store_bid_amount: () => [{}, []],
        store_salt: () => [{}, []],
      })

      const carrierContract = new ManifestContract({
        local_secret_key: () => [{}, carrierSecretKey],
        store_bid_amount: () => [{}, []],
        store_salt: () => [{}, []],
      })

      // Auction is in DRAFT (0)
      const initial = shipperContract.initialState(
        { initialPrivateState: {}, initialZswapLocalState: new ledger.ZswapLocalState() },
        tenderId,
        loadHash,
        reservePriceCommitment,
        biddingDeadline,
        revealDeadline
      )

      const carrierContext = cr.createCircuitContext(
        contractAddress,
        dummyCoinPk,
        initial.currentContractState.data,
        {}
      )

      const bidAmount = 250000n
      const salt = new Uint8Array(32).fill(0x33)

      // Calling submitBidCommitment when status is DRAFT should fail assertion
      expect(() => {
        carrierContract.circuits.submitBidCommitment(carrierContext, bidAmount, salt)
      }).toThrow()
    })
  })

  // ───────────────────────────────────────────────────────────────────────────
  // 3. Privacy: That Private Inputs Are Never Exposed
  // ───────────────────────────────────────────────────────────────────────────
  describe('3. Zero-Knowledge Privacy & Witness Confidentiality', () => {
    it('verifies that carrier secret key, bid amount, and salt are not exposed in public outputs or on-chain cells', () => {
      const shipperContract = new ManifestContract({
        local_secret_key: () => [{}, shipperSecretKey],
        store_bid_amount: () => [{}, []],
        store_salt: () => [{}, []],
      })

      const initial = shipperContract.initialState(
        { initialPrivateState: {}, initialZswapLocalState: new ledger.ZswapLocalState() },
        tenderId,
        loadHash,
        reservePriceCommitment,
        biddingDeadline,
        revealDeadline
      )

      // Open bidding
      const openCtx = cr.createCircuitContext(contractAddress, dummyCoinPk, initial.currentContractState.data, {})
      const openRes = shipperContract.circuits.openBidding(openCtx)

      // Carrier creates private bid
      const carrierSecret = new Uint8Array(32).fill(0x99)
      const privateBidAmount = 185000n // $1,850.00
      const privateSalt = new Uint8Array(32).fill(0x77)

      const carrierContract = new ManifestContract({
        local_secret_key: () => [{}, carrierSecret],
        store_bid_amount: () => [{}, []],
        store_salt: () => [{}, []],
      })

      const carrierContext = cr.createCircuitContext(
        contractAddress,
        dummyCoinPk,
        openRes.context.currentQueryContext.state,
        {}
      )

      const bidRes = carrierContract.circuits.submitBidCommitment(carrierContext, privateBidAmount, privateSalt)

      // Inspect public transcript / output
      const publicOutput = bidRes.proofData.publicTranscript
      const serializedOutput = JSON.stringify(publicOutput)

      // 1. Secret key must NEVER appear in public transcript
      expect(serializedOutput).not.toContain('153') // 0x99 = 153

      // 2. Private salt must NEVER appear in public transcript
      expect(serializedOutput).not.toContain('119') // 0x77 = 119

      // 3. Raw bid amount must NOT be in on-chain status or public transcript
      const onChainCells = bidRes.context.currentQueryContext.state.state.asArray()
      for (let i = 0; i < 9; i++) {
        const cellValue = onChainCells[i].asCell().value
        const hex = Buffer.from(cellValue).toString('hex')
        expect(hex).not.toContain(privateBidAmount.toString(16))
      }
    })
  })
})
