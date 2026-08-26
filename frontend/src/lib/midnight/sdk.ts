// @ts-nocheck
import type { MidnightProviders, WalletProvider, MidnightProvider, PrivateStateProvider } from '@midnight-ntwrk/midnight-js-types'
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider'
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider'
import { ZKConfigProvider, createProverKey, createVerifierKey, createZKIR } from '@midnight-ntwrk/midnight-js-types'
import type { WalletConnectedAPI } from '@midnight-ntwrk/dapp-connector-api'

export const PROOF_SERVER_URL = import.meta.env.VITE_PROOF_SERVER_URL || 'https://proof-server-whkk.onrender.com'
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

// Direct ZK artifact fetcher — bypasses FetchZkConfigProvider entirely.
// The SDK's FetchZkConfigProvider prepends 'keys/' internally, so we pass
// the BASE origin only. This custom impl fetches directly with full logging.
class DirectZkConfigProvider extends ZKConfigProvider {
  private baseUrl: string

  constructor(baseUrl: string) {
    super()
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/'
    console.log('[ZK] DirectZkConfigProvider created, baseUrl:', this.baseUrl)
  }

  private async fetchArtifact(path: string): Promise<Uint8Array> {
    const url = this.baseUrl + path
    console.log('[ZK] Fetching artifact:', url)
    try {
      const res = await fetch(url, { method: 'GET' })
      console.log('[ZK] Response for', path, '- status:', res.status, 'content-type:', res.headers.get('content-type'))
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText} fetching ${url}`)
      }
      const ct = res.headers.get('content-type') || ''
      if (ct.includes('text/html')) {
        throw new Error(`Got HTML instead of binary for ${url} - file likely missing on server`)
      }
      const buf = await res.arrayBuffer()
      console.log('[ZK] Fetched', path, '- bytes:', buf.byteLength)
      return new Uint8Array(buf)
    } catch (err) {
      console.error('[ZK] FETCH ERROR for', path, ':', err)
      throw err
    }
  }

  async getProverKey(circuitId: string): Promise<any> {
    console.log('[ZK] getProverKey called for circuit:', circuitId)
    const bytes = await this.fetchArtifact(`keys/${circuitId}.prover`)
    return createProverKey(bytes)
  }

  async getVerifierKey(circuitId: string): Promise<any> {
    console.log('[ZK] getVerifierKey called for circuit:', circuitId)
    const bytes = await this.fetchArtifact(`keys/${circuitId}.verifier`)
    return createVerifierKey(bytes)
  }

  async getZKIR(circuitId: string): Promise<any> {
    console.log('[ZK] getZKIR called for circuit:', circuitId)
    const bytes = await this.fetchArtifact(`zkir/${circuitId}.bzkir`)
    return createZKIR(bytes)
  }
}

export const NETWORK_ID = (typeof localStorage !== 'undefined' ? localStorage.getItem('midnight_network_id') : null) || import.meta.env.VITE_NETWORK_ID || 'preview'
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
  console.log('[Manifest] Polling for Midnight wallet...')
  while (!walletApi && attempts < 20) {
    await new Promise(resolve => setTimeout(resolve, 250))
    const midnightObj = (window as any).midnight
    if (midnightObj) {
      walletApi = midnightObj['1am'] || midnightObj.lace || Object.values(midnightObj)[0]
    }
    attempts++
  }

  if (!walletApi) {
    throw new Error('Midnight wallet extension not found. Please install a compatible wallet.')
  }

  console.log('[Manifest] Wallet found, connecting...')
  const api: WalletConnectedAPI = walletApi.connect ? await walletApi.connect(NETWORK_ID) : await walletApi.enable()
  const addresses = await api.getShieldedAddresses()
  console.log('[Manifest] Wallet connected. Addresses:', addresses)

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
      console.log('[sdk] balanceTx called with tx:', tx)
      let txHex = '';
      if (typeof tx === 'string') {
        txHex = tx;
      } else if (tx && typeof tx.serialize === 'function') {
        txHex = tx.serialize();
      } else if (tx && tx.transaction && typeof tx.transaction.serialize === 'function') {
        txHex = tx.transaction.serialize();
      } else if (tx instanceof Uint8Array) {
        txHex = Array.from(tx).map(b => b.toString(16).padStart(2, '0')).join('');
      } else {
        console.error('[sdk] Unrecognized tx format in balanceTx:', tx);
      }
      console.log('[sdk] txHex substring:', txHex.substring(0, 50));
      const balancedTx = await api.balanceUnsealedTransaction(txHex)
      return balancedTx as any
    }
  }

  const midnightProvider: MidnightProvider = {
    submitTx: async (tx: any) => {
      console.log('[sdk] submitTx called')
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

  const baseOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:10000'
  console.log('[ZK] Base origin for ZK artifacts:', baseOrigin)
  const zkConfigProvider = new DirectZkConfigProvider(baseOrigin)
  const proofProvider = httpClientProofProvider({ url: PROOF_SERVER_URL, zkConfigProvider })
  const urls = getNetworkUrls(NETWORK_ID)
  const publicDataProvider = indexerPublicDataProvider(urls.indexer, urls.indexerWs)

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
