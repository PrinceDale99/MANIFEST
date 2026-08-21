import { NextResponse } from 'next/server'
import { db } from '../db'
import { TenderStatus } from '@/types/manifest'

export async function POST(req: Request) {
  const body = await req.json()
  
  // This simulates the proof-server /api/deploy endpoint
  const newTenderId = 'mn1_tender_' + Math.random().toString(36).substring(7)
  
  db.saveTender({
    tenderId: newTenderId,
    shipper: 'shipper_pk_demo',
    loadHash: body.args[0] || 'hash',
    biddingDeadline: Date.now() + 86400000,
    revealDeadline: Date.now() + 172800000,
    status: TenderStatus.DRAFT,
    lowestDisclosedBid: Number.MAX_SAFE_INTEGER,
    carrierCount: 0,
    createdAt: new Date()
  })

  return NextResponse.json({ tenderId: newTenderId, txHash: 'tx_hash_mock' })
}
