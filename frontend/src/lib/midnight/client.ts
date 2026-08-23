// @ts-nocheck
import type { WalletState } from '@/types/manifest'
import { firstValueFrom } from 'rxjs'
import { initializeMidnightProviders, NETWORK_ID } from './sdk'

const PROOF_SERVER_URL = import.meta.env.VITE_PROOF_SERVER_URL || 'http://localhost:6300'
const NETWORK = NETWORK_ID as 'preview' | 'preprod' | 'mainnet'

export async function initializeMidnightClient(): Promise<{
  wallet: WalletState
  proofServerUrl: string
  network: string
}> {
  try {
    await initializeMidnightProviders()
    
    const midnightObj = (window as any).midnight;
    const walletApi = midnightObj["1am"] || midnightObj.lace || Object.values(midnightObj)[0];
    const api = walletApi.connect ? await walletApi.connect(NETWORK_ID) : await walletApi.enable()
    
    const state = await firstValueFrom(api.state())
    const address = state.addresses?.unshielded || 'mn_addr_unknown'
    const balancesArr = state.balances ? Object.values(state.balances) : []
    const balance = balancesArr.length > 0 ? BigInt(balancesArr[0]) : 0n

    return {
      wallet: {
        connected: true,
        address,
        balance,
        network: NETWORK,
      },
      proofServerUrl: PROOF_SERVER_URL,
      network: NETWORK,
    }
  } catch (error) {
    console.error('[Manifest] Failed to connect wallet:', error)
    return {
      wallet: { connected: false, network: NETWORK },
      proofServerUrl: PROOF_SERVER_URL,
      network: NETWORK,
    }
  }
}

export async function signMessage(message: string): Promise<string> {
  if (typeof window === 'undefined' || !('midnight' in window)) {
    throw new Error('Wallet not connected')
  }
  const midnightObj = (window as any).midnight;
  const walletApi = midnightObj["1am"] || midnightObj.lace || Object.values(midnightObj)[0];
  const api = walletApi.connect ? await walletApi.connect(NETWORK_ID) : await walletApi.enable()
  const signature = await api.signData(message, { encoding: 'text', keyType: 'unshielded' })
  return signature.signature || ''
}

export async function getWalletAddress(): Promise<string | null> {
  if (typeof window === 'undefined' || !('midnight' in window)) {
    return null
  }
  try {
    const midnightObj = (window as any).midnight;
    const walletApi = midnightObj["1am"] || midnightObj.lace || Object.values(midnightObj)[0];
    const api = walletApi.connect ? await walletApi.connect(NETWORK_ID) : await walletApi.enable()
    const state = await firstValueFrom(api.state())
    return state.addresses?.unshielded || null
  } catch {
    return null
  }
}
