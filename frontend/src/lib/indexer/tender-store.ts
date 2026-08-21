// ═══════════════════════════════════════════════════════════════════════════════
// Manifest — Tender Event Store
// Reactive event listener & state cache for on-chain tender events.
// ═══════════════════════════════════════════════════════════════════════════════

import type { Tender, BidCommitment, TenderStatus } from '@/types/manifest'

type Listener = (tenders: Tender[]) => void

const PROOF_SERVER_URL =
  import.meta.env.VITE_PROOF_SERVER_URL !== undefined 
    ? import.meta.env.VITE_PROOF_SERVER_URL 
    : 'http://localhost:6300'

const POLL_INTERVAL_MS = 10_000

/**
 * In-memory tender state cache.
 * Updated via polling or WebSocket events from the proof server.
 */
class TenderStore {
  private tenders: Map<string, Tender> = new Map()
  private commitments: Map<string, BidCommitment[]> = new Map()
  private listeners: Set<Listener> = new Set()
  private pollTimer: ReturnType<typeof setInterval> | null = null
  private isRunning = false

  /**
   * Start the event listener / polling loop.
   */
  start(): void {
    if (this.isRunning) return
    this.isRunning = true

    // Initial fetch
    this.fetchAllTenders()

    // Set up polling
    this.pollTimer = setInterval(() => {
      this.fetchAllTenders()
    }, POLL_INTERVAL_MS)
  }

  /**
   * Stop the event listener.
   */
  stop(): void {
    this.isRunning = false
    if (this.pollTimer) {
      clearInterval(this.pollTimer)
      this.pollTimer = null
    }
  }

  /**
   * Subscribe to tender state changes.
   * Returns an unsubscribe function.
   */
  subscribe(listener: Listener): () => void {
    this.listeners.add(listener)
    // Immediately notify with current state
    listener(Array.from(this.tenders.values()))
    return () => {
      this.listeners.delete(listener)
    }
  }

  /**
   * Get a specific tender by ID.
   */
  getTender(tenderId: string): Tender | undefined {
    return this.tenders.get(tenderId)
  }

  /**
   * Get all cached tenders.
   */
  getAllTenders(): Tender[] {
    return Array.from(this.tenders.values())
  }

  /**
   * Get tenders filtered by status.
   */
  getTendersByStatus(status: TenderStatus): Tender[] {
    return this.getAllTenders().filter((t) => t.status === status)
  }

  /**
   * Get commitments for a specific tender.
   */
  getCommitments(tenderId: string): BidCommitment[] {
    return this.commitments.get(tenderId) || []
  }

  // ─── Private Methods ─────────────────────────────────────────────────────

  private async fetchAllTenders(): Promise<void> {
    try {
      const response = await fetch(`${PROOF_SERVER_URL}/api/tenders`)
      if (!response.ok) return

      const tenders: Tender[] = await response.json()
      let changed = false

      for (const tender of tenders) {
        const existing = this.tenders.get(tender.tenderId)
        if (
          !existing ||
          existing.status !== tender.status ||
          existing.lowestDisclosedBid !== tender.lowestDisclosedBid
        ) {
          this.tenders.set(tender.tenderId, tender)
          changed = true
        }
      }

      if (changed) {
        this.notifyListeners()
      }
    } catch (error) {
      console.warn('[Manifest TenderStore] Failed to fetch tenders:', error)
    }
  }

  private notifyListeners(): void {
    const tenders = this.getAllTenders()
    for (const listener of this.listeners) {
      try {
        listener(tenders)
      } catch (error) {
        console.error('[Manifest TenderStore] Listener error:', error)
      }
    }
  }
}

// Singleton instance
export const tenderStore = new TenderStore()
