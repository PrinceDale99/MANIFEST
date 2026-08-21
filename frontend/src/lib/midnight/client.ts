// ═══════════════════════════════════════════════════════════════════════════════
// Manifest — Midnight SDK Client Initialization
// ═══════════════════════════════════════════════════════════════════════════════

import type { WalletState } from '@/types/manifest'

const PROOF_SERVER_URL =
  import.meta.env.VITE_PROOF_SERVER_URL || 'http://localhost:6300'

import { initializeMidnightProviders, NETWORK_ID } from './sdk'

const NETWORK = NETWORK_ID as
  | 'preview'
  | 'preprod'
  | 'mainnet'

export async function initializeMidnightClient(): Promise<{
  wallet: WalletState
  proofServerUrl: string
  network: string
}> {
  try {
    const providers = await initializeMidnightProviders()
    const api = providers.walletProvider
    
    // @ts-ignore
    const address = await api.getAddress()
    // @ts-ignore
    const balance = await api.getBalance()

    return {
      wallet: {
        connected: true,
        address,
        balance: BigInt(balance),
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

/**
 * Sign a message using the connected wallet.
 * Used for deterministic salt derivation.
 */
export async function signMessage(message: string): Promise<string> {
  if (typeof window === 'undefined' || !('midnight' in window)) {
    throw new Error('Wallet not connected')
  }

  const provider = (window as any).midnight
  const api = await provider.enable()
  const signature = await api.signMessage(
    new TextEncoder().encode(message),
  )
  return Buffer.from(signature).toString('hex')
}

/**
 * Get the current connected wallet address.
 */
export async function getWalletAddress(): Promise<string | null> {
  if (typeof window === 'undefined' || !('midnight' in window)) {
    return null
  }

  try {
    const provider = (window as any).midnight
    const api = await provider.enable()
    return await api.getAddress()
  } catch {
    return null
  }
}
