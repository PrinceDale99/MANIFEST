import { NextResponse } from 'next/server'
import { db } from '../db'

export async function GET() {
  const tenders = db.getTenders()
  return NextResponse.json(tenders)
}
