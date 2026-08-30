// @ts-nocheck
import type { Tender, BidCommitment, TenderStatus } from '@/types/manifest'
import { initializeMidnightProviders } from './sdk'
import { Contract as ManifestContract } from '../../managed/contract/index.js'
import type { Witnesses } from '../../managed/contract/index.d.ts'
import { findDeployedContract, deployContract } from '@midnight-ntwrk/midnight-js-contracts'
import { CompiledContract } from '@midnight-ntwrk/compact-js'

export const CONTRACT_ADDRESS = (typeof localStorage !== 'undefined' ? localStorage.getItem('manifest_active_contract_address') : null) || import.meta.env.NEXT_PUBLIC_CONTRACT_ADDRESS || import.meta.env.VITE_CONTRACT_ADDRESS || 'f4d8e35c6083b656624752b2d76e78325935b6a210dc9dd2c4ed0981fd3bbb92'

function createWitnesses(privateKey: Uint8Array, bidAmount?: bigint, salt?: Uint8Array): Witnesses<any> {
  return {
    local_secret_key: (context) => [(context as any).privateState ?? (context as any).state, privateKey],
    store_bid_amount: (context, amount) => {
      return [(context as any).privateState ?? (context as any).state, []]
    },
    store_salt: (context, salt) => {
      return [(context as any).privateState ?? (context as any).state, []]
    }
  }
}

async function getContract(witnesses: any, targetAddress?: string) {
  const providers = await initializeMidnightProviders()
  const compiled = CompiledContract.make('manifest', ManifestContract)
  const withWitnesses = CompiledContract.withWitnesses(compiled, witnesses)
  const addr = targetAddress || (typeof localStorage !== 'undefined' ? localStorage.getItem('manifest_active_contract_address') : null) || CONTRACT_ADDRESS
  return findDeployedContract(providers, {
    compiledContract: withWitnesses,
    contractAddress: addr,
    privateStateId: 'manifest-private-state',
    initialPrivateState: {}
  })
}

export async function openBidding(params: {
  privateKey: Uint8Array
  contractAddress?: string
}): Promise<{ txHash: string }> {
  const witnesses = createWitnesses(params.privateKey)
  const contract = await getContract(witnesses, params.contractAddress)
  const tx = await contract.callTx.openBidding()
  return { txHash: tx.finalizedTxData?.hash || tx.public?.txId || '' }
}

export async function createTender(params: {
  loadHash: string
  reservePriceCommitment: string
  biddingDeadline: bigint
  revealDeadline: bigint
  privateKey: Uint8Array
}): Promise<{ txHash: string; contractAddress?: string }> {
  const providers = await initializeMidnightProviders()
  const witnesses = createWitnesses(params.privateKey)
  const compiled = CompiledContract.make('manifest', ManifestContract)
  const withWitnesses = CompiledContract.withWitnesses(compiled, witnesses)

  const tenderIdBytes = new Uint8Array(32)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(tenderIdBytes)
  } else {
    tenderIdBytes.fill(Math.floor(Math.random() * 255))
  }

  const parse32 = (str: string) => {
    const clean = (str || '').replace(/^0x/, '')
    const arr = new Uint8Array(32)
    for (let i = 0; i < Math.min(32, clean.length / 2); i++) {
      arr[i] = parseInt(clean.substring(i * 2, i * 2 + 2), 16) || 0
    }
    return arr
  }

  const loadBytes = parse32(params.loadHash)
  const reserveBytes = parse32(params.reservePriceCommitment)

  console.log('[contract] Deploying tender contract on Midnight...')
  const deployed = await deployContract(providers, {
    compiledContract: withWitnesses,
    privateStateId: 'manifest-private-state',
    initialPrivateState: {},
    initialArgs: [tenderIdBytes, loadBytes, reserveBytes, params.biddingDeadline, params.revealDeadline]
  })

  const addr = deployed.deployTxData?.contractAddress || deployed.deployTxData?.public?.contractAddress || ''
  const hash = deployed.deployTxData?.hash || deployed.deployTxData?.txId || ''
  console.log('[contract] Tender deployed at address:', addr, 'txHash:', hash)

  if (addr) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('manifest_active_contract_address', addr)
    }
    try {
      console.log('[contract] Automatically opening bidding on deployed tender...')
      const openContract = await findDeployedContract(providers, {
        compiledContract: withWitnesses,
        contractAddress: addr,
        privateStateId: 'manifest-private-state',
        initialPrivateState: {}
      })
      const openTx = await openContract.callTx.openBidding()
      console.log('[contract] openBidding executed on deployed tender:', openTx.finalizedTxData?.hash || openTx.public?.txId)
    } catch (openErr) {
      console.warn('[contract] Auto openBidding notice (can be opened manually):', openErr)
    }
  }

  return { txHash: hash, contractAddress: addr }
}

export async function submitBidCommitment(params: {
  bidAmount: bigint
  salt: Uint8Array
  privateKey: Uint8Array
  contractAddress?: string
}): Promise<{ commitmentHash: string; txHash: string }> {
  const witnesses = createWitnesses(params.privateKey, params.bidAmount, params.salt)
  const contract = await getContract(witnesses, params.contractAddress)
  const tx = await contract.callTx.submitBidCommitment(params.bidAmount, params.salt)
  return { commitmentHash: '', txHash: tx.finalizedTxData?.hash || tx.public?.txId || '' }
}

export async function transitionToReveal(params: {
  privateKey: Uint8Array
  contractAddress?: string
}): Promise<{ txHash: string }> {
  const witnesses = createWitnesses(params.privateKey)
  const contract = await getContract(witnesses, params.contractAddress)
  const tx = await contract.callTx.transitionToReveal()
  return { txHash: tx.finalizedTxData?.hash || tx.public?.txId || '' }
}

export async function revealBid(params: {
  bidAmount: bigint
  salt: Uint8Array
  privateKey: Uint8Array
  contractAddress?: string
}): Promise<{ proofHash: string; txHash: string }> {
  const witnesses = createWitnesses(params.privateKey, params.bidAmount, params.salt)
  const contract = await getContract(witnesses, params.contractAddress)
  const tx = await contract.callTx.revealBid(params.bidAmount, params.salt)
  return { proofHash: '', txHash: tx.finalizedTxData?.hash || tx.public?.txId || '' }
}

export async function settleTender(params: {
  privateKey: Uint8Array
  contractAddress?: string
}): Promise<{ txHash: string }> {
  const witnesses = createWitnesses(params.privateKey)
  const contract = await getContract(witnesses, params.contractAddress)
  const tx = await contract.callTx.settleTender()
  return { txHash: tx.finalizedTxData?.hash || tx.public?.txId || '' }
}

export async function cancelTender(params: {
  privateKey: Uint8Array
  contractAddress?: string
}): Promise<{ txHash: string }> {
  const witnesses = createWitnesses(params.privateKey)
  const contract = await getContract(witnesses, params.contractAddress)
  const tx = await contract.callTx.cancelTender()
  return { txHash: tx.finalizedTxData?.hash || tx.public?.txId || '' }
}

export async function queryOnChainTenderStatus(contractAddress: string): Promise<TenderStatus | null> {
  try {
    const cleanAddr = (contractAddress || '').replace(/^0x/, '')
    if (!cleanAddr || cleanAddr.length < 32) return null

    const query = {
      query: `query {
        contract(address: "${cleanAddr}") {
          address
          state
        }
      }`
    }

    const res = await fetch('https://api-preview.1am.xyz/api/v4/graphql?session_token=a632f1af-db7e-4003-90a5-c5db9f2cb716', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(query)
    })
    const data = await res.json()
    const stateHex = data?.data?.contract?.state
    if (!stateHex) return null

    const ocrt = await import('@midnight-ntwrk/onchain-runtime-v3')
    const cr = await import('@midnight-ntwrk/compact-runtime')
    const stateBytes = new Uint8Array(stateHex.match(/.{1,2}/g).map((byte: string) => parseInt(byte, 16)))
    const decodedState = ocrt.ContractState.deserialize(stateBytes)
    const arr = decodedState.data.state.asArray()
    if (arr && arr.length >= 7 && arr[6]) {
      const enumDesc = new cr.CompactTypeEnum(4, 1)
      const val = enumDesc.fromValue(arr[6].asCell().value)
      switch (val) {
        case 0: return TenderStatus.DRAFT
        case 1: return TenderStatus.BIDDING_OPEN
        case 2: return TenderStatus.REVEAL_PHASE
        case 3: return TenderStatus.SETTLED
        case 4: return TenderStatus.CANCELLED
        default: return null
      }
    }
  } catch (err) {
    console.warn('[contract] queryOnChainTenderStatus error:', err)
  }
  return null
}

