#!/usr/bin/env npx tsx
// ═══════════════════════════════════════════════════════════════════════════════
// Manifest — Contract Deployment Script
//
// Real deployment on Midnight happens through:
//   1. Lace wallet browser extension (easiest)
//   2. Midnight SDK programmatic deployment
//
// Usage:
//   npm run deploy              → deploy to both preview + preprod
//   npm run deploy:preview      → deploy to preview only
//   npm run deploy:preprod      → deploy to preprod only
//   npm run deploy -- --address <REAL_ADDRESS>  → save a deployed address
// ═══════════════════════════════════════════════════════════════════════════════

import { existsSync, readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

const ROOT_DIR = resolve(import.meta.dirname, '..')
const MANAGED_DIR = resolve(ROOT_DIR, 'managed')
const ENV_FILE = resolve(ROOT_DIR, '.env.local')
const README_PATH = resolve(ROOT_DIR, 'README.md')

// Determine which networks to deploy to
const networks: string[] = (() => {
  if (process.argv.includes('--network')) {
    const idx = process.argv.indexOf('--network')
    return [process.argv[idx + 1]]
  }
  if (process.argv.includes('--preview')) return ['preview']
  if (process.argv.includes('--preprod')) return ['preprod']
  return ['preview', 'preprod']
})()

/**
 * Check if an address was provided via --address flag
 */
function getProvidedAddress(): string | null {
  const idx = process.argv.indexOf('--address')
  if (idx !== -1 && process.argv[idx + 1]) {
    return process.argv[idx + 1]
  }
  return null
}

/**
 * Deploy to a single network
 */
function deployToNetwork(network: string): string {
  const deploymentFile = resolve(ROOT_DIR, `.deployment.${network}.json`)

  console.log('═══════════════════════════════════════════════')
  console.log(` 🚀 DEPLOYING TO ${network.toUpperCase()}`)
  console.log('═══════════════════════════════════════════════\n')

  // Check compilation artifacts
  if (!existsSync(MANAGED_DIR)) {
    console.error('❌ managed/ not found. Run `npm run compile` first.')
    process.exit(1)
  }

  // Check for existing deployment
  const isUpgrade = existsSync(deploymentFile)
  if (isUpgrade) {
    const existing = JSON.parse(readFileSync(deploymentFile, 'utf-8'))
    console.log(`📦 Existing deployment found`)
    console.log(`   Address: ${existing.contractAddress}\n`)
  }

  // Check if address was provided
  const providedAddress = getProvidedAddress()
  if (providedAddress) {
    console.log(`✅ Using provided address: ${providedAddress}\n`)

    // Save deployment info
    writeFileSync(
      deploymentFile,
      JSON.stringify(
        {
          network,
          contractAddress: providedAddress,
          deployedAt: new Date().toISOString(),
          isUpgrade,
        },
        null,
        2
      )
    )
    console.log(`📝 Saved to .deployment.${network}.json\n`)

    // Update README
    updateReadme(network, providedAddress)

    return providedAddress
  }

  // No address provided — show instructions
  console.log('═══════════════════════════════════════════════')
  console.log(' 📋 HOW TO DEPLOY')
  console.log('═══════════════════════════════════════════════\n')

  console.log('Option 1: Using Lace Wallet (easiest)')
  console.log('─────────────────────────────────────────')
  console.log('1. Install Lace wallet: https://lace.io')
  console.log(`2. Set network to ${network}`)
  console.log('3. Set proof server to http://localhost:6300')
  console.log('4. Fund your wallet with testnet NIGHT tokens')
  console.log(`   Faucet: https://faucet.${network}.midnight.network`)
  console.log('5. Open the Manifest UI and create a tender')
  console.log('   The contract will be deployed automatically')
  console.log('6. Copy the contract address from the UI\n')

  console.log('Option 2: Using the bboard CLI template')
  console.log('─────────────────────────────────────────')
  console.log('git clone https://github.com/midnightntwrk/example-bboard.git')
  console.log('cd example-bboard && npm install')
  console.log(`npm run ${network}-remote`)
  console.log('Choose "Deploy contract" from the menu')
  console.log('Copy the contract address\n')

  console.log('Option 3: Using Midnight SDK (programmatic)')
  console.log('─────────────────────────────────────────')
  console.log('See: https://docs.midnight.network/getting-started/hello-world\n')

  console.log('═══════════════════════════════════════════════')
  console.log('After deploying, save the address:')
  console.log(`  npm run deploy:${network} -- --address <REAL_ADDRESS>`)
  console.log('═══════════════════════════════════════════════\n')

  if (isUpgrade) {
    const existing = JSON.parse(readFileSync(deploymentFile, 'utf-8'))
    return existing.contractAddress
  }

  process.exit(1)
}

/**
 * Update README with contract address
 */
function updateReadme(network: string, address: string) {
  if (!existsSync(README_PATH)) return

  let readme = readFileSync(README_PATH, 'utf-8')
  const label = network.charAt(0).toUpperCase() + network.slice(1)
  const regex = new RegExp(`\\|\\s*${label}\\s*\\|\\s*\`[^\`]+\`\\s*\\|`, 'i')
  readme = readme.replace(regex, `| ${label}  | \`${address}\` |`)
  writeFileSync(README_PATH, readme)
  console.log('✅ Updated README.md\n')
}

// ─── Main ──────────────────────────────────────────────────────────────────

function main() {
  console.log('═══════════════════════════════════════════════')
  console.log(' Manifest — Contract Deployment')
  console.log(` Networks: ${networks.join(', ')}`)
  console.log('═══════════════════════════════════════════════\n')

  const addresses: Record<string, string> = {}
  for (const network of networks) {
    addresses[network] = deployToNetwork(network)
  }

  // Write .env.local
  const defaultNetwork = networks.includes('preview') ? 'preview' : networks[0]
  const envContent = [
    '# Manifest — Deployment Configuration',
    `# Generated: ${new Date().toISOString()}`,
    '',
    `NEXT_PUBLIC_NETWORK=${defaultNetwork}`,
    `NEXT_PUBLIC_CONTRACT_ADDRESS=${addresses[defaultNetwork]}`,
    'NEXT_PUBLIC_PROOF_SERVER_URL=http://localhost:6300',
    '',
  ].join('\n')
  writeFileSync(ENV_FILE, envContent)
  console.log(`✅ Written to .env.local\n`)

  // Summary
  console.log('═══════════════════════════════════════════════')
  console.log(' ✅ DEPLOYMENT COMPLETE')
  console.log('═══════════════════════════════════════════════')
  for (const [net, addr] of Object.entries(addresses)) {
    console.log(` ${net}: ${addr}`)
  }
  console.log('═══════════════════════════════════════════════\n')
}

main()
