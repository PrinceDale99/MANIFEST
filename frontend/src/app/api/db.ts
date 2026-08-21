import { Tender, TenderStatus, BidCommitment } from '@/types/manifest'

// In-memory store (Singleton for the Next.js dev server)
if (!(global as any).mockTenders) {
  (global as any).mockTenders = new Map<string, Tender>();
  (global as any).mockCommitments = new Map<string, BidCommitment[]>();
  
  // Seed with one dummy tender
  (global as any).mockTenders.set('mn1_tender_demo_001', {
    tenderId: 'mn1_tender_demo_001',
    shipper: 'shipper_pk_demo',
    loadHash: 'abc123hash',
    biddingDeadline: Date.now() + 86400000,
    revealDeadline: Date.now() + 172800000,
    status: TenderStatus.BIDDING_OPEN,
    lowestDisclosedBid: Number.MAX_SAFE_INTEGER,
    carrierCount: 0,
    createdAt: new Date()
  });
}

export const db = {
  getTenders: () => Array.from((global as any).mockTenders.values()),
  getTender: (id: string) => (global as any).mockTenders.get(id),
  saveTender: (tender: Tender) => (global as any).mockTenders.set(tender.tenderId, tender),
  
  getCommitments: (id: string) => (global as any).mockCommitments.get(id) || [],
  addCommitment: (id: string, comm: BidCommitment) => {
    const list = db.getCommitments(id)
    list.push(comm)
    ;(global as any).mockCommitments.set(id, list)
    
    // Update tender count
    const t = db.getTender(id)
    if (t) {
      t.carrierCount = list.length
      db.saveTender(t)
    }
  }
}
