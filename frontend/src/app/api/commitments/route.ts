import { NextResponse } from 'next/server'
import { db } from '../db'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const tenderId = url.searchParams.get('tenderId')
  
  if (!tenderId) return NextResponse.json({ error: 'Missing tenderId' }, { status: 400 })
  
  const commitments = db.getCommitments(tenderId)
  return NextResponse.json(commitments)
}
