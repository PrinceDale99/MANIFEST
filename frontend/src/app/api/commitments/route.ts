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
  
  const { data: commitments, error } = await supabase
    .from('commitments')
    .select('*')
    .eq('tender_id', tenderId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const formatted = commitments.map(c => ({
    tenderId: c.tender_id,
    carrierPk: c.carrier_pk,
    commitmentHash: c.commitment_hash,
    submittedAt: c.submitted_at
  }));

  return NextResponse.json(formatted);
}
