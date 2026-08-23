// @ts-nocheck
import type { Tender, BidCommitment, TenderStatus } from '@/types/manifest'
import { initializeMidnightProviders } from './sdk'
import { Contract as ManifestContract } from '../../managed/contract/index.js'
import type { Witnesses } from '../../managed/contract/index.d.ts'
import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts'

const CONTRACT_ADDRESS = import.meta.env.NEXT_PUBLIC_CONTRACT_ADDRESS || import.meta.env.VITE_CONTRACT_ADDRESS || ''

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

export async function createTender(params: {
  loadHash: string
  reservePriceCommitment: string
  biddingDeadline: bigint
  revealDeadline: bigint
  privateKey: Uint8Array
}): Promise<{ txHash: string }> {
  const providers = await initializeMidnightProviders()
  const witnesses = createWitnesses(params.privateKey)
  
  if (!CONTRACT_ADDRESS) throw new Error('Contract address not configured')

  // @ts-ignore
  const contract: any = await findDeployedContract(providers, CONTRACT_ADDRESS, new ManifestContract(witnesses))
  
  const tx = await contract.impureCircuits.createTender(
    new TextEncoder().encode(params.loadHash),
    new TextEncoder().encode(params.loadHash),
    new TextEncoder().encode(params.reservePriceCommitment),
    params.biddingDeadline,
    params.revealDeadline
  )
  
  return { txHash: tx.txHash }
}

export async function submitBidCommitment(params: {
  tenderId: string
  bidAmount: bigint
  salt: string
  privateKey: Uint8Array
}): Promise<{ commitmentHash: string; txHash: string }> {
  const providers = await initializeMidnightProviders()
  const witnesses = createWitnesses(params.privateKey, params.bidAmount, new TextEncoder().encode(params.salt))
  
  if (!CONTRACT_ADDRESS) throw new Error('Contract address not configured')
  // @ts-ignore
  const contract: any = await findDeployedContract(providers, CONTRACT_ADDRESS, new ManifestContract(witnesses))
  const tx = await contract.impureCircuits.submitBidCommitment(new TextEncoder().encode(params.tenderId), params.bidAmount, new TextEncoder().encode(params.salt))
  
  return { commitmentHash: 'derived_locally_hash', txHash: tx.txHash }
}

export async function revealBid(params: {
  tenderId: string
  bidAmount: bigint
  salt: string
  privateKey: Uint8Array
}): Promise<{ proofHash: string; txHash: string }> {
  const providers = await initializeMidnightProviders()
  const witnesses = createWitnesses(params.privateKey, params.bidAmount, new TextEncoder().encode(params.salt))
  
  if (!CONTRACT_ADDRESS) throw new Error('Contract address not configured')
  // @ts-ignore
  const contract: any = await findDeployedContract(providers, CONTRACT_ADDRESS, new ManifestContract(witnesses))
  const tx = await contract.impureCircuits.revealBid(new TextEncoder().encode(params.tenderId), params.bidAmount, new TextEncoder().encode(params.salt))
  
  return { proofHash: 'generated_zk_proof', txHash: tx.txHash }
}

export async function settleTender(
  tenderId: string,
  privateKey: Uint8Array,
  reservePrice: bigint,
  reserveSalt: string
): Promise<{ txHash: string }> {
  const providers = await initializeMidnightProviders()
  const witnesses = createWitnesses(privateKey)
  
  if (!CONTRACT_ADDRESS) throw new Error('Contract address not configured')
  // @ts-ignore
  const contract: any = await findDeployedContract(providers, CONTRACT_ADDRESS, new ManifestContract(witnesses))
  
  const tx = await contract.impureCircuits.settleTender(new TextEncoder().encode(tenderId), reservePrice, new TextEncoder().encode(reserveSalt))
  
  return { txHash: tx.txHash }
}
