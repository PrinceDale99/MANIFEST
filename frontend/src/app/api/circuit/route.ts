import { NextResponse } from 'next/server'
import { db } from '../db'
import { TenderStatus } from '@/types/manifest'

export async function POST(req: Request) {
  const body = await req.json()
  const circuit = body.circuit
  const tenderId = body.args[0]
  
  const tender = db.getTender(tenderId)
  if (!tender) return NextResponse.json({ error: 'Tender not found' }, { status: 404 })

  // Mock the circuit state transitions
  if (circuit === 'openBidding') {
    tender.status = TenderStatus.BIDDING_OPEN
    db.saveTender(tender)
  } else if (circuit === 'submitBidCommitment') {
    db.addCommitment(tenderId, {
      tenderId,
      carrierPk: 'carrier_pk_mock_' + Math.random().toString(36).substring(7),
      commitmentHash: 'mock_hash_' + Math.random().toString(36).substring(7),
      submittedAt: new Date()
    })
  } else if (circuit === 'transitionToReveal') {
    tender.status = TenderStatus.REVEAL_PHASE
    db.saveTender(tender)
  } else if (circuit === 'revealBid') {
    const bidAmount = Number(body.args[1])
    if (bidAmount < tender.lowestDisclosedBid) {
      tender.lowestDisclosedBid = bidAmount
      tender.awardedCarrier = 'carrier_pk_mock'
      db.saveTender(tender)
    }
  } else if (circuit === 'settleTender') {
    tender.status = TenderStatus.SETTLED
    db.saveTender(tender)
  }

  return NextResponse.json({ txHash: 'tx_hash_circuit_mock' })
}
