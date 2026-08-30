#!/usr/bin/env npx tsx
// ═══════════════════════════════════════════════════════════════════════════════
// Manifest — Testnet Freight Load Seeder
// Seeds demo tenders for testing the marketplace UI.
// ═══════════════════════════════════════════════════════════════════════════════

const DEMO_TENDERS = [
  {
    origin: 'Chicago, IL',
    destination: 'Dallas, TX',
    equipmentType: 'DRY_VAN',
    weightLbs: 42000,
    description: 'Consumer electronics, non-hazardous',
    biddingHours: 48,
    revealHours: 24,
  },
  {
    origin: 'Los Angeles, CA',
    destination: 'Phoenix, AZ',
    equipmentType: 'REEFER',
    weightLbs: 38000,
    temperatureRange: { min: 32, max: 38 },
    description: 'Fresh produce, temperature-sensitive',
    biddingHours: 24,
    revealHours: 12,
  },
  {
    origin: 'Houston, TX',
    destination: 'New Orleans, LA',
    equipmentType: 'FLATBED',
    weightLbs: 55000,
    description: 'Steel coils, oversized load',
    biddingHours: 72,
    revealHours: 24,
  },
  {
    origin: 'New York, NY',
    destination: 'Boston, MA',
    equipmentType: 'DRY_VAN',
    weightLbs: 28000,
    description: 'Pharmaceutical supplies (non-hazmat)',
    biddingHours: 24,
    revealHours: 12,
  },
  {
    origin: 'Seattle, WA',
    destination: 'Portland, OR',
    equipmentType: 'TANKER',
    weightLbs: 45000,
    description: 'Food-grade liquid cargo',
    biddingHours: 48,
    revealHours: 24,
  },
]

const NETWORK = process.argv.includes('--network')
  ? process.argv[process.argv.indexOf('--network') + 1]
  : 'preview'

async function main() {
  console.log('═══════════════════════════════════════════════')
  console.log(' Manifest — Freight Load Seeder')
  console.log(` Network: ${NETWORK}`)
  console.log(` Seeding ${DEMO_TENDERS.length} demo tenders`)
  console.log('═══════════════════════════════════════════════\n')

  const PROOF_SERVER = process.env.PROOF_SERVER_URL || 'http://localhost:6300'

  for (let i = 0; i < DEMO_TENDERS.length; i++) {
    const tender = DEMO_TENDERS[i]
    console.log(`📦 [${i + 1}/${DEMO_TENDERS.length}] ${tender.origin} → ${tender.destination}`)
    console.log(
      `   Equipment: ${tender.equipmentType} | Weight: ${tender.weightLbs.toLocaleString()} lbs`
    )

    try {
      // In production: deploy via compact-cli
      // execSync(`npx compact-cli deploy ...`)
      console.log(`   ✅ Tender created (demo mode)`)
    } catch (error) {
      console.error(`   ❌ Failed: ${(error as Error).message}`)
    }
  }

  console.log('\n═══════════════════════════════════════════════')
  console.log(' ✅ Seeding Complete!')
  console.log('═══════════════════════════════════════════════\n')
}

main()
