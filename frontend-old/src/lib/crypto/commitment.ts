// ═══════════════════════════════════════════════════════════════════════════════
// Manifest — Cryptographic Commitment Generator
// SHA-256 based commitment for sealed-bid reverse auctions.
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate a SHA-256 commitment hash from tender bid parameters.
 *
 * commitment = SHA-256(tenderId || carrierPk || bidAmount || salt)
 *
 * This matches the Compact contract's hash derivation:
 *   hash(bytes(tenderId) + bytes(carrierPk) + bytes(bidAmount) + salt)
 */
export async function generateBidCommitment(params: {
  tenderId: string
  carrierPk: string
  bidAmount: bigint
  salt: string
}): Promise<string> {
  const encoder = new TextEncoder()

  // Concatenate all components as raw bytes
  const data = new Uint8Array([
    ...hexToBytes(params.tenderId),
    ...hexToBytes(params.carrierPk),
    ...uint64ToBytes(params.bidAmount),
    ...hexToBytes(params.salt),
  ])

  // SHA-256 hash
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return bytesToHex(new Uint8Array(hashBuffer))
}

/**
 * Verify a commitment matches the expected preimage.
 */
export async function verifyCommitment(
  commitment: string,
  params: {
    tenderId: string
    carrierPk: string
    bidAmount: bigint
    salt: string
  },
): Promise<boolean> {
  const recomputed = await generateBidCommitment(params)
  return commitment === recomputed
}

/**
 * Compute the load hash for a tender's cargo parameters.
 * This is the on-chain digest of the load specification.
 */
export async function computeLoadHash(params: {
  origin: string
  destination: string
  equipmentType: string
  weightLbs: number
  temperatureRange?: { min: number; max: number }
}): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(
    JSON.stringify({
      o: params.origin,
      d: params.destination,
      e: params.equipmentType,
      w: params.weightLbs,
      t: params.temperatureRange,
    }),
  )

  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return bytesToHex(new Uint8Array(hashBuffer))
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith('0x') ? hex.slice(2) : hex
  const bytes = new Uint8Array(clean.length / 2)
  for (let i = 0; i < clean.length; i += 2) {
    bytes[i / 2] = parseInt(clean.substring(i, i + 2), 16)
  }
  return bytes
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function uint64ToBytes(value: bigint): Uint8Array {
  const bytes = new Uint8Array(8)
  for (let i = 7; i >= 0; i--) {
    bytes[i] = Number(value & 0xFFn)
    value >>= 8n
  }
  return bytes
}
