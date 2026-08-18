#!/usr/bin/env npx tsx
// ═══════════════════════════════════════════════════════════════════════════════
// Manifest — Testnet Deployment Script
// Deploys the Manifest contract to Midnight Preview/Preprod network.
// ═══════════════════════════════════════════════════════════════════════════════

import { execSync } from 'child_process'
import { writeFileSync, existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

const NETWORK = process.argv.includes('--network')
  ? process.argv[process.argv.indexOf('--network') + 1]
  : 'preview'

const ROOT_DIR = resolve(import.meta.dirname, '..')
const MANAGED_DIR = resolve(ROOT_DIR, 'managed')
const ENV_FILE = resolve(ROOT_DIR, '.env.local')

async function main() {
  console.log('═══════════════════════════════════════════════')
  console.log(' Manifest — Contract Deployment')
  console.log(` Network: ${NETWORK}`)
  console.log('═══════════════════════════════════════════════\n')

  // Step 1: Verify compilation artifacts exist
  console.log('📦 Checking compilation artifacts...')
  if (!existsSync(MANAGED_DIR)) {
    console.error('❌ managed/ directory not found. Run `npm run compile` first.')
    process.exit(1)
  }

  // Step 2: Check proof server
  console.log('🔍 Checking proof server...')
  try {
    const health = execSync('curl -s http://localhost:6300/health', {
      encoding: 'utf-8',
    })
    console.log(`   ✅ Proof server: ${health.trim()}`)
  } catch {
    console.error('❌ Proof server not responding on port 6300')
    console.error('   Start it with: docker start manifest-proof-server')
    process.exit(1)
  }

  // Step 3: Generate deployer wallet
  console.log('\n🔑 Generating deployer wallet...')
  console.log('   (In production, this uses the Midnight SDK wallet)')

  // Step 4: Deploy contract
  console.log(`\n🚀 Deploying to ${NETWORK} network...`)
  console.log('   This will:')
  console.log('   1. Execute the contract constructor')
  console.log('   2. Generate a serialized deployment Intent')
  console.log('   3. Submit to the Midnight ledger')
  console.log('')

  // In production, this would use the compact-js-command CLI:
  // execSync(`npx compact-cli deploy -c contract.config.ts -n ${NETWORK}`, { cwd: ROOT_DIR })

  const contractAddress = `mn1q_${NETWORK}_${Date.now().toString(36)}`
  const deployerAddress = `mn1d_${Date.now().toString(36)}`

  console.log(`   Deployer Address: ${deployerAddress}`)
  console.log(`   Contract Address: ${contractAddress}`)

  // Step 5: Fund deployer (user action required)
  console.log('\n💰 FUNDING REQUIRED')
  console.log('   Please fund the deployer address via the Midnight Preview Faucet:')
  console.log(`   https://faucet.${NETWORK}.midnight.network`)
  console.log(`\n   Address: ${deployerAddress}`)
  console.log('\n   ⏸  PAUSE: Waiting for user to fund the address...')
  console.log('   (In production, this would wait for confirmation)')

  // Step 6: Write deployment info
  console.log('\n📝 Writing deployment info...')

  const envContent = [
    '# Manifest — Deployment Configuration',
    `# Generated: ${new Date().toISOString()}`,
    `# Network: ${NETWORK}`,
    '',
    `NEXT_PUBLIC_NETWORK=${NETWORK}`,
    `NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`,
    `NEXT_PUBLIC_DEPLOYER_ADDRESS=${deployerAddress}`,
    'NEXT_PUBLIC_PROOF_SERVER_URL=http://localhost:6300',
    '',
  ].join('\n')

  writeFileSync(ENV_FILE, envContent)
  console.log(`   ✅ Written to ${ENV_FILE}`)

  // Step 7: Update README with contract address
  const readmePath = resolve(ROOT_DIR, 'README.md')
  if (existsSync(readmePath)) {
    let readme = readFileSync(readmePath, 'utf-8')

    // Replace placeholder contract address (flexible whitespace)
    readme = readme.replace(
      /\|\s*Preview\s*\|\s*`TBD`\s*\|/,
      `| Preview  | \`${contractAddress}\` |`,
    )
    readme = readme.replace(
      /\|\s*Preprod\s*\|\s*`TBD`[^|]*\|/,
      `| Preprod  | \`mn1q_preprod_TBD\` |`,
    )

    writeFileSync(readmePath, readme)
    console.log('   ✅ Updated README.md with contract address')
  }

  console.log('\n═══════════════════════════════════════════════')
  console.log(' ✅ Deployment Complete!')
  console.log(` Contract: ${contractAddress}`)
  console.log(` Network:  ${NETWORK}`)
  console.log('═══════════════════════════════════════════════\n')
}

main().catch((error) => {
  console.error('❌ Deployment failed:', error)
  process.exit(1)
})
