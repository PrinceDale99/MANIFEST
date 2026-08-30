// ═══════════════════════════════════════════════════════════════════════════════
// Manifest — Compact Midnight Contract Test Suite
// Direct execution and verification of compiled Compact circuits & state machine
// ═══════════════════════════════════════════════════════════════════════════════

import { describe, it, expect } from 'vitest'
import { Contract as ManifestContract } from '../frontend/src/managed/contract/index.js'
import * as ledger from '@midnight-ntwrk/ledger-v8'
import * as cr from '@midnight-ntwrk/compact-runtime'

describe('Manifest Compact Smart Contract Circuits', () => {
  const tenderId = new Uint8Array(32).fill(1)
  const loadHash = new Uint8Array(32).fill(2)
  const reservePriceCommitment = new Uint8Array(32).fill(3)
  const biddingDeadline = 1000n
  const revealDeadline = 2000n

  const shipperSecretKey = new Uint8Array(32).fill(7)
  const carrier1SecretKey = new Uint8Array(32).fill(8)
  const carrier2SecretKey = new Uint8Array(32).fill(9)

  let contractState: any
  let shipperContract: any
  let carrier1Contract: any
  let carrier2Contract: any

  const dummyCoinPk = new Uint8Array(32)
  const contractAddress = '8fd2f7ba25464652e4fb5c3fcd57c8eb2c2e574d07b9789596478c75e47f4aa0'

  it('1. Constructor & initialState initializes tender in DRAFT (0)', () => {
    shipperContract = new ManifestContract({
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

    contractState = initial.currentContractState
    const stateArr = contractState.data.state.asArray()
    expect(stateArr.length).toBe(10)

    const enumDesc = new cr.CompactTypeEnum(4, 1)
    const status = enumDesc.fromValue(stateArr[6].asCell().value)
    expect(status).toBe(0) // 0 = DRAFT
  })

  it('2. openBidding circuit transitions tender from DRAFT (0) to BIDDING_OPEN (1)', () => {
    const context = cr.createCircuitContext(
      contractAddress,
      dummyCoinPk,
      contractState.data,
      {}
    )

    const res = shipperContract.circuits.openBidding(context)
    expect(res).toBeDefined()
    expect(res.proofData).toBeDefined()

    // Update contract state with the new ledger state
    contractState.data = res.context.currentQueryContext.state
    const stateArr = contractState.data.state.asArray()
    const enumDesc = new cr.CompactTypeEnum(4, 1)
    const status = enumDesc.fromValue(stateArr[6].asCell().value)
    expect(status).toBe(1) // 1 = BIDDING_OPEN
  })

  it('3. Carrier 1 submits sealed bid commitment for $2,500', () => {
    carrier1Contract = new ManifestContract({
      local_secret_key: () => [{}, carrier1SecretKey],
      store_bid_amount: () => [{}, []],
      store_salt: () => [{}, []],
    })

    const context = cr.createCircuitContext(
      contractAddress,
      dummyCoinPk,
      contractState.data,
      {}
    )

    const bidAmount = 250000n // $2,500.00
    const salt = new Uint8Array(32).fill(11)

    const res = carrier1Contract.circuits.submitBidCommitment(context, bidAmount, salt)
    expect(res).toBeDefined()
    expect(res.proofData).toBeDefined()
    expect(res.context).toBeDefined()

    contractState.data = res.context.currentQueryContext.state
    expect(contractState.data.state.asArray()[9]).toBeDefined()
  })

  it('4. Carrier 2 submits sealed bid commitment for $2,200 (lower rate)', () => {
    carrier2Contract = new ManifestContract({
      local_secret_key: () => [{}, carrier2SecretKey],
      store_bid_amount: () => [{}, []],
      store_salt: () => [{}, []],
    })

    const context = cr.createCircuitContext(
      contractAddress,
      dummyCoinPk,
      contractState.data,
      {}
    )

    const bidAmount = 220000n // $2,200.00
    const salt = new Uint8Array(32).fill(22)

    const res = carrier2Contract.circuits.submitBidCommitment(context, bidAmount, salt)
    expect(res).toBeDefined()
    expect(res.proofData).toBeDefined()
    expect(res.context).toBeDefined()

    contractState.data = res.context.currentQueryContext.state
    expect(contractState.data.state.asArray()[9]).toBeDefined()
  })

  it('5. transitionToReveal circuit transitions tender to REVEAL_PHASE (2)', () => {
    const context = cr.createCircuitContext(
      contractAddress,
      dummyCoinPk,
      contractState.data,
      {}
    )

    const res = shipperContract.circuits.transitionToReveal(context)
    expect(res).toBeDefined()

    contractState.data = res.context.currentQueryContext.state
    const stateArr = contractState.data.state.asArray()
    const enumDesc = new cr.CompactTypeEnum(4, 1)
    const status = enumDesc.fromValue(stateArr[6].asCell().value)
    expect(status).toBe(2) // 2 = REVEAL_PHASE
  })

  it('6. Carrier 1 reveals $2,500 bid (becomes lowest bid)', () => {
    const context = cr.createCircuitContext(
      contractAddress,
      dummyCoinPk,
      contractState.data,
      {}
    )

    const bidAmount = 250000n
    const salt = new Uint8Array(32).fill(11)

    const res = carrier1Contract.circuits.revealBid(context, bidAmount, salt)
    expect(res).toBeDefined()

    contractState.data = res.context.currentQueryContext.state
    const stateArr = contractState.data.state.asArray()
    const uint64Desc = new cr.CompactTypeUnsignedInteger(18446744073709551615n, 8)
    const lowestBid = uint64Desc.fromValue(stateArr[7].asCell().value)
    expect(lowestBid).toBe(250000n)
  })

  it('7. Carrier 2 reveals $2,200 bid (wins auction with lower rate)', () => {
    const context = cr.createCircuitContext(
      contractAddress,
      dummyCoinPk,
      contractState.data,
      {}
    )

    const bidAmount = 220000n
    const salt = new Uint8Array(32).fill(22)

    const res = carrier2Contract.circuits.revealBid(context, bidAmount, salt)
    expect(res).toBeDefined()

    contractState.data = res.context.currentQueryContext.state
    const stateArr = contractState.data.state.asArray()
    const uint64Desc = new cr.CompactTypeUnsignedInteger(18446744073709551615n, 8)
    const lowestBid = uint64Desc.fromValue(stateArr[7].asCell().value)
    expect(lowestBid).toBe(220000n) // Carrier 2 wins at $2,200!
  })

  it('8. settleTender circuit finalizes auction into SETTLED (3)', () => {
    const context = cr.createCircuitContext(
      contractAddress,
      dummyCoinPk,
      contractState.data,
      {}
    )

    const res = shipperContract.circuits.settleTender(context)
    expect(res).toBeDefined()

    contractState.data = res.context.currentQueryContext.state
    const stateArr = contractState.data.state.asArray()
    const enumDesc = new cr.CompactTypeEnum(4, 1)
    const status = enumDesc.fromValue(stateArr[6].asCell().value)
    expect(status).toBe(3) // 3 = SETTLED
  })
})
