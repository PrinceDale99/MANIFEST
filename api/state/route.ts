import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: Request) {
  const url = new URL(req.url);
  const tenderId = url.searchParams.get('tenderId');
  
  if (!tenderId) return NextResponse.json({ error: 'Missing tenderId' }, { status: 400 });
  
  const { data: tender, error } = await supabase
    .from('tenders')
    .select('*')
    .eq('tender_id', tenderId)
    .single();

  if (error || !tender) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({
    tenderId: tender.tender_id,
    shipper: tender.shipper,
    loadHash: tender.load_hash,
    reservePriceCommitment: tender.reserve_price_commitment,
    biddingDeadline: tender.bidding_deadline,
    revealDeadline: tender.reveal_deadline,
    status: tender.status,
    lowestDisclosedBid: tender.lowest_disclosed_bid,
    awardedCarrier: tender.awarded_carrier,
    carrierCount: tender.carrier_count,
    createdAt: tender.created_at
  });
}
