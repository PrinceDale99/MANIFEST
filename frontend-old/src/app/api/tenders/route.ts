import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  const { data: tenders, error } = await supabase
    .from('tenders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Transform snake_case back to camelCase for the frontend types
  const formattedTenders = tenders.map(t => ({
    tenderId: t.tender_id,
    shipper: t.shipper,
    loadHash: t.load_hash,
    reservePriceCommitment: t.reserve_price_commitment,
    biddingDeadline: t.bidding_deadline,
    revealDeadline: t.reveal_deadline,
    status: t.status,
    lowestDisclosedBid: t.lowest_disclosed_bid,
    awardedCarrier: t.awarded_carrier,
    carrierCount: t.carrier_count,
    createdAt: t.created_at
  }));

  return NextResponse.json(formattedTenders);
}
