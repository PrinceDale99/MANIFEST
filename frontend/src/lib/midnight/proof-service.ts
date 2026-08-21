// ═══════════════════════════════════════════════════════════════════════════════
// Manifest — Proof Server Health Monitor
// ═══════════════════════════════════════════════════════════════════════════════

import type { ProofServerStatus } from '@/types/manifest'

const PROOF_SERVER_URL =
  import.meta.env.VITE_PROOF_SERVER_URL || 'http://localhost:6300'

const HEALTH_CHECK_INTERVAL_MS = 5_000
const TIMEOUT_MS = 3_000

/**
 * Check the proof server health endpoint.
 */
export async function checkProofServerHealth(): Promise<ProofServerStatus> {
  const start = performance.now()

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

    const response = await fetch(`${PROOF_SERVER_URL}/health`, {
      signal: controller.signal,
    })
    clearTimeout(timeout)

    const latencyMs = Math.round(performance.now() - start)

    if (response.ok) {
      const data = await response.json().catch(() => ({}))
      return {
        connected: true,
        latencyMs,
        lastHeartbeat: new Date(),
        version: data.version,
      }
    }

    return {
      connected: false,
      latencyMs,
      lastHeartbeat: null,
    }
  } catch {
    return {
      connected: false,
      latencyMs: Math.round(performance.now() - start),
      lastHeartbeat: null,
    }
  }
}

/**
 * Create a polling health monitor.
 * Returns a cleanup function to stop monitoring.
 */
export function createHealthMonitor(
  onStatusChange: (status: ProofServerStatus) => void,
): () => void {
  let intervalId: ReturnType<typeof setInterval> | null = null
  let isRunning = true

  const poll = async () => {
    if (!isRunning) return
    const status = await checkProofServerHealth()
    onStatusChange(status)
  }

  // Initial check
  poll()

  // Set up polling
  intervalId = setInterval(poll, HEALTH_CHECK_INTERVAL_MS)

  return () => {
    isRunning = false
    if (intervalId) clearInterval(intervalId)
  }
}

/**
 * Retry a proof server operation with exponential backoff.
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  baseDelayMs = 1000,
): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error

      if (attempt < maxRetries) {
        const delay = baseDelayMs * Math.pow(2, attempt)
        console.warn(
          `[Manifest] Operation failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms...`,
        )
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError
}
