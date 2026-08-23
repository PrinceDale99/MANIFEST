// @ts-nocheck
import type { MidnightProviders, WalletProvider, MidnightProvider, PrivateStateProvider } from '@midnight-ntwrk/midnight-js-types'
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider'
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider'
// @ts-ignore
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider'
import type { WalletConnectedAPI } from '@midnight-ntwrk/dapp-connector-api'

export const PROOF_SERVER_URL = import.meta.env.VITE_PROOF_SERVER_URL || 'http://localhost:6300'
export const getNetworkUrls = (networkId: string) => {
  if (networkId === 'preprod') {
    return {
      indexer: 'https://indexer.preprod.midnight.network/api/v1/graphql',
      indexerWs: 'wss://indexer.preprod.midnight.network/api/v1/graphql/ws',
      node: 'https://rpc.preprod.midnight.network'
    }
  }
  return {
    indexer: import.meta.env.VITE_INDEXER_URL || 'https://indexer.testnet.midnight.network/api/v1/graphql',
    indexerWs: import.meta.env.VITE_INDEXER_WS_URL || 'wss://indexer.testnet.midnight.network/api/v1/graphql/ws',
    node: import.meta.env.VITE_NODE_URL || 'https://rpc.testnet.midnight.network'
  }
}
export const ZK_CONFIG_URL = import.meta.env.VITE_ZK_CONFIG_URL || 'http://localhost:10000'

export const NETWORK_ID = localStorage.getItem('midnight_network_id') || import.meta.env.VITE_NETWORK_ID || 'preview'
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id'
setNetworkId(NETWORK_ID)
export let midnightProviders: MidnightProviders | null = null

export async function initializeMidnightProviders(): Promise<MidnightProviders> {
  if (midnightProviders) return midnightProviders

  if (typeof window === 'undefined') {
    throw new Error('Cannot initialize Midnight providers on the server side.')
  }

  let walletApi: any = null;
  let attempts = 0;
  console.log('[Manifest] Polling for Midnight wallet...');
  while (!walletApi && attempts < 20) {
    await new Promise(resolve => setTimeout(resolve, 250));
    const midnightObj = (window as any).midnight;
    if (midnightObj) {
      walletApi = midnightObj["1am"] || midnightObj.lace || Object.values(midnightObj)[0];
    }
    attempts++;
  }

  if (!walletApi) {
    throw new Error('Midnight wallet extension not found. Please install a compatible wallet.')
  }

  const api: WalletConnectedAPI = walletApi.connect ? await walletApi.connect(NETWORK_ID) : await walletApi.enable()
  const addresses = await api.getShieldedAddresses()

  const { MidnightBech32m, ShieldedCoinPublicKey, ShieldedEncryptionPublicKey } = await import('@midnight-ntwrk/wallet-sdk-address-format')
  const walletProvider: WalletProvider = {
    getCoinPublicKey: () => {
      console.log('[sdk] getCoinPublicKey called! addresses:', addresses)
      const parsed = MidnightBech32m.parse(addresses.shieldedCoinPublicKey)
      const hex = ShieldedCoinPublicKey.codec.decode(NETWORK_ID, parsed).toHexString()
      console.log('[sdk] getCoinPublicKey returning:', hex)
      return hex as any
    },
    getEncryptionPublicKey: () => {
      const parsed = MidnightBech32m.parse(addresses.shieldedEncryptionPublicKey)
      return ShieldedEncryptionPublicKey.codec.decode(NETWORK_ID, parsed).toHexString() as any
    },
    balanceTx: async (tx: any, ttl?: Date) => {
      const txHex = typeof tx === 'string' ? tx : tx.serialize ? tx.serialize() : ''
      const balancedTx = await api.balanceUnsealedTransaction(txHex)
      return balancedTx as any
    }
  }

  const midnightProvider: MidnightProvider = {
    submitTx: async (tx: any) => {
      const txHex = typeof tx === 'string' ? tx : tx.serialize ? tx.serialize() : ''
      const submitted = await api.submitTransaction(txHex)
      return submitted as any
    }
  }

  const privateStateProvider: PrivateStateProvider = {
    get: async () => null,
    set: async () => {},
    remove: async () => {}
  } as any

  const proofProvider = httpClientProofProvider(PROOF_SERVER_URL)
  const urls = getNetworkUrls(NETWORK_ID)
  const publicDataProvider = indexerPublicDataProvider(urls.indexer, urls.indexerWs)
  const zkConfigProvider = new FetchZkConfigProvider(ZK_CONFIG_URL)

  midnightProviders = {
    walletProvider,
    midnightProvider,
    privateStateProvider,
    proofProvider,
    publicDataProvider,
    zkConfigProvider,
  } as unknown as MidnightProviders

  return midnightProviders
}
