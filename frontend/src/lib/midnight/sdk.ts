// @ts-nocheck
import type { MidnightProviders, WalletProvider } from '@midnight-ntwrk/midnight-js-types'
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider'
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider'
// @ts-ignore
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider'
import type { WalletConnectedAPI } from '@midnight-ntwrk/dapp-connector-api'

export const PROOF_SERVER_URL = import.meta.env.VITE_PROOF_SERVER_URL || 'http://localhost:6300'
export const INDEXER_WS_URL = import.meta.env.VITE_INDEXER_WS_URL || 'ws://localhost:8088/api/v1/graphql/ws'
export const INDEXER_URL = import.meta.env.VITE_INDEXER_URL || 'http://localhost:8088/api/v1/graphql'
export const NODE_URL = import.meta.env.VITE_NODE_URL || 'http://localhost:9944'
export const ZK_CONFIG_URL = import.meta.env.VITE_ZK_CONFIG_URL || 'http://localhost:10000'

export let midnightProviders: MidnightProviders | null = null

export async function initializeMidnightProviders(): Promise<MidnightProviders> {
  if (midnightProviders) return midnightProviders

  if (typeof window === 'undefined') {
    throw new Error('Cannot initialize Midnight providers on the server side.')
  }

  // Poll for wallet injection (up to 5 seconds)
  let walletApi: any = null;
  let attempts = 0;
  console.log('[Manifest] Polling for Midnight wallet...');
  while (!walletApi && attempts < 20) {
    await new Promise(resolve => setTimeout(resolve, 250));
    const midnightObj = (window as any).midnight;
    if (midnightObj) {
      walletApi = midnightObj.lace || Object.values(midnightObj)[0];
    }
    attempts++;
  }

  if (!walletApi) {
    console.error('[Manifest] Wallet not found. window.midnight is:', (window as any).midnight);
    throw new Error('Midnight wallet extension not found. Please install a compatible wallet.')
  }

  // Connect to the wallet and get the WalletConnectedAPI
  const api: WalletConnectedAPI = walletApi.connect ? await walletApi.connect('preview') : await walletApi.enable()

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
