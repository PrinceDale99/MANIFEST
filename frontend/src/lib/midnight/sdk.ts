// @ts-nocheck
import type { MidnightProviders, WalletProvider } from '@midnight-ntwrk/midnight-js-types'
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider'
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider'
// @ts-ignore
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider'
import type { WalletConnectedAPI } from '@midnight-ntwrk/dapp-connector-api'

export const PROOF_SERVER_URL = process.env.NEXT_PUBLIC_PROOF_SERVER_URL || 'http://localhost:6300'
export const INDEXER_WS_URL = process.env.NEXT_PUBLIC_INDEXER_WS_URL || 'ws://localhost:8088/api/v1/graphql/ws'
export const INDEXER_URL = process.env.NEXT_PUBLIC_INDEXER_URL || 'http://localhost:8088/api/v1/graphql'
export const NODE_URL = process.env.NEXT_PUBLIC_NODE_URL || 'http://localhost:9944'
export const ZK_CONFIG_URL = process.env.NEXT_PUBLIC_ZK_CONFIG_URL || 'http://localhost:10000'

export let midnightProviders: MidnightProviders | null = null

export async function initializeMidnightProviders(): Promise<MidnightProviders> {
  if (midnightProviders) return midnightProviders

  if (typeof window === 'undefined') {
    throw new Error('Cannot initialize Midnight providers on the server side.')
  }

  // Find the Lace wallet in the window
  const laceWallet = (window as any).midnight?.lace
  if (!laceWallet) {
    throw new Error('Midnight Lace wallet extension not found. Please install Lace wallet.')
  }

  // Connect to Lace and get the WalletConnectedAPI
  const api: WalletConnectedAPI = await laceWallet.enable()

  // Fetch synchronous keys before creating the provider
  const addresses = await api.getShieldedAddresses()

  // Create a custom WalletProvider adapter that wraps the DAppConnector API
  const walletProvider: WalletProvider = {
    getCoinPublicKey: () => addresses.shieldedCoinPublicKey as any,
    getEncryptionPublicKey: () => addresses.shieldedEncryptionPublicKey as any,
    balanceTx: async (tx: any, ttl?: Date) => {
      // For a real balancing, we serialize the unsealed transaction and pass it to Lace to balance
      // Since `api.balanceUnsealedTransaction` expects a hex string:
      const txHex = typeof tx === 'string' ? tx : tx.serialize ? tx.serialize() : ''
      const balancedTx = await api.balanceUnsealedTransaction(txHex)
      // Wait for wallet to submit or return the finalized tx
      return balancedTx as any
    }
  }

  // Initialize other standard providers for midnight.js
  const proofProvider = httpClientProofProvider(PROOF_SERVER_URL)
  const publicDataProvider = indexerPublicDataProvider(INDEXER_WS_URL, INDEXER_URL)
  const zkConfigProvider = new FetchZkConfigProvider(ZK_CONFIG_URL)

  midnightProviders = {
    walletProvider,
    proofProvider,
    publicDataProvider,
    zkConfigProvider,
  } as unknown as MidnightProviders

  return midnightProviders
}
