// ═══════════════════════════════════════════════════════════════════════════════
// Manifest — Deterministic Key Derivation (KDF)
// Prevents lost salts by deriving bid salt deterministically from wallet signature.
// ═══════════════════════════════════════════════════════════════════════════════

import { signMessage } from '@/lib/midnight/client'

const PBKDF2_ITERATIONS = 100_000
const KEY_LENGTH = 32 // bytes
const HASH = 'SHA-256'
const SALT_PREFIX = 'MANIFEST_BID_SALT_v1_'

/**
 * Derive a deterministic bid salt from a wallet signature.
 *
 * The salt is derived by:
 * 1. Signing the message `TENDER_BID_${tenderId}` with the connected wallet
 * 2. Hashing the signature with PBKDF2 using the tender ID as context
 *
 * This ensures:
 * - Same wallet + tender = same salt (reproducible)
 * - Different wallets get different salts
 * - Salt cannot be guessed without wallet access
 */
export async function deriveBidSalt(tenderId: string): Promise<string> {
  // Step 1: Sign the deterministic message
  const message = `TENDER_BID_${tenderId}`
  const signature = await signMessage(message)

  // Step 2: PBKDF2 derivation
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(signature),
    { name: 'PBKDF2' },
    false,
    ['deriveBits'],
  )

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: encoder.encode(`${SALT_PREFIX}${tenderId}`),
      iterations: PBKDF2_ITERATIONS,
      hash: HASH,
    },
    keyMaterial,
    KEY_LENGTH * 8,
  )

  // Convert to hex string
  return Array.from(new Uint8Array(derivedBits))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Generate a downloadable JSON keyfile backup for the derived salt.
 * Allows carriers to recover their salts if they lose wallet access.
 */
export function generateKeyfileBackup(
  tenderId: string,
  salt: string,
  carrierAddress: string,
): string {
  const keyfile = {
    version: 1,
    protocol: 'manifest-freight-tendering',
    tenderId,
    carrierAddress,
    salt,
    derivedAt: new Date().toISOString(),
    warning:
      'This keyfile contains your bid salt. Keep it secure. Anyone with this file can verify your bid commitment.',
  }

  return JSON.stringify(keyfile, null, 2)
}

/**
 * Trigger a browser download of the keyfile backup.
 */
export function downloadKeyfile(
  tenderId: string,
  salt: string,
  carrierAddress: string,
): void {
  const content = generateKeyfileBackup(tenderId, salt, carrierAddress)
  const blob = new Blob([content], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `manifest-salt-${tenderId.slice(0, 8)}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}
