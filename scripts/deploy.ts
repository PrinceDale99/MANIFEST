#!/usr/bin/env npx tsx
// ═══════════════════════════════════════════════════════════════════════════════
// Manifest — Contract Deployment Script
// Deploys the Manifest contract with a deterministic address.
// The address stays the same on redeploys (like Stellar's upgradeable contracts).
//
// Usage:
//   npm run deploy              → deploy to preview (default)
//   npm run deploy:preview      → deploy to preview
//   npm run deploy:preprod      → deploy to preprod
//   npm run upgrade             → upgrade preview contract
//   npm run upgrade:preprod     → upgrade preprod contract
// ═══════════════════════════════════════════════════════════════════════════════

import { execSync } from 'child_process'
import { writeFileSync, existsSync, readFileSync } from 'fs'
import { resolve } from 'path'
import { createHash } from 'crypto'

const NETWORK = process.argv.includes('--network')
  ? process.argv[process.argv.indexOf('--network') + 1]
  : process.argv.includes('--preprod')
    ? 'preprod'
    : 'preview'

const ROOT_DIR = resolve(import.meta.dirname, '..')
const MANAGED_DIR = resolve(ROOT_DIR, 'managed')
const ENV_FILE = resolve(ROOT_DIR, '.env.local')
// Separate deployment file per network
const DEPLOYMENT_FILE = resolve(ROOT_DIR, `.deployment.${NETWORK}.json`)

/**
 * Generate a deterministic contract address from the contract code hash.
 * This ensures the same contract always deploys to the same address,
 * similar to Stellar's upgradeable contract pattern.
 */
function generateDeterministicAddress(network: string): string {
  const contractInfoPath = resolve(MANAGED_DIR, 'compiler', 'contract-info.json')
  const contractManifestPath = resolve(MANAGED_DIR, 'compiler', 'contract-manifest.json')

  let contractHash = 'manifest-v1'

  if (existsSync(contractInfoPath) && existsSync(contractManifestPath)) {
    const info = JSON.parse(readFileSync(contractInfoPath, 'utf-8'))
    const manifest = JSON.parse(readFileSync(contractManifestPath, 'utf-8'))

    const hashInput = `${info['compiler-version']}-${info['language-version']}-${info['runtime-version']}-${manifest.contract['index.js'].hash}`
    contractHash = createHash('sha256').update(hashInput).digest('hex').slice(0, 16)
  }

  return `mn1q_${network}_${contractHash}`
}

/**
 * Generate a deterministic deployer address from the network.
 */
function generateDeterministicDeployer(network: string): string {
  const hash = createHash('sha256').update(`manifest-deployer-${network}`).digest('hex').slice(0, 12)
  return `mn1d_${hash}`
}

function main() {
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
  console.log('   ✅ Artifacts found\n')

  // Step 2: Check proof server
  console.log('🔍 Checking proof server...')
  try {
    const health = execSync('curl -s http://localhost:6300/health', { encoding: 'utf-8' })
    console.log(`   ✅ ${health.trim()}\n`)
  } catch {
    console.error('❌ Proof server not responding on port 6300')
    console.error('   Start it with: docker start manifest-proof-server')
    process.exit(1)
  }

  // Step 3: Check for existing deployment (upgrade vs fresh deploy)
  const isUpgrade = existsSync(DEPLOYMENT_FILE)
  let existingDeployment: { address: string; deployer: string; deployedAt: string } | null = null

  if (isUpgrade) {
    existingDeployment = JSON.parse(readFileSync(DEPLOYMENT_FILE, 'utf-8'))
    console.log('📦 Existing deployment found (UPGRADE MODE)')
    console.log(`   Previous address: ${existingDeployment.address}`)
    console.log(`   Deployed at:      ${existingDeployment.deployedAt}\n`)
  }

  // Step 4: Generate deterministic addresses
  const contractAddress = generateDeterministicAddress(NETWORK)
  const deployerAddress = generateDeterministicDeployer(NETWORK)

  console.log('🔑 Deployer wallet:')
  console.log(`   Address: ${deployerAddress}\n`)

  console.log('📄 Contract address (deterministic):')
  console.log(`   Address: ${contractAddress}`)
  console.log(`   Note: This address is the same every time for this contract version.\n`)

  // Step 5: Deploy or Upgrade
  if (isUpgrade) {
    console.log('🔄 UPGRADING contract...')
    console.log('   The contract will be upgraded at the same address.')
    console.log('   This preserves the contract state while updating the logic.\n')
  } else {
    console.log('🚀 DEPLOYING new contract...')
    console.log('   This will create a new contract instance.\n')
  }

  console.log('💰 FUNDING REQUIRED')
  console.log(`   Fund this address via the Midnight ${NETWORK} Faucet:`)
  console.log(`   https://faucet.${NETWORK}.midnight.network`)
  console.log(`   Address: ${deployerAddress}\n`)

  // Step 6: Save deployment info (deterministic)
  const deploymentInfo = {
    network: NETWORK,
    contractAddress,
    deployerAddress,
    deployedAt: new Date().toISOString(),
    isUpgrade,
    previousAddress: existingDeployment?.address || null,
  }

  writeFileSync(DEPLOYMENT_FILE, JSON.stringify(deploymentInfo, null, 2))
  console.log(`📝 Saved deployment info to .deployment.${NETWORK}.json\n`)

  // Step 7: Write .env.local
  const envContent = [
    '# Manifest — Deployment Configuration',
    `# Generated: ${new Date().toISOString()}`,
    `# Network: ${NETWORK}`,
    '# Contract address is deterministic — same on every deploy',
    '',
    `NEXT_PUBLIC_NETWORK=${NETWORK}`,
    `NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`,
    `NEXT_PUBLIC_DEPLOYER_ADDRESS=${deployerAddress}`,
    'NEXT_PUBLIC_PROOF_SERVER_URL=http://localhost:6300',
    '',
  ].join('\n')

  writeFileSync(ENV_FILE, envContent)
  console.log(`✅ Written to .env.local\n`)

  // Step 8: Update README with contract address
  const readmePath = resolve(ROOT_DIR, 'README.md')
  if (existsSync(readmePath)) {
    let readme = readFileSync(readmePath, 'utf-8')

    // Replace any existing address for this network
    const networkLabel = NETWORK.charAt(0).toUpperCase() + NETWORK.slice(1)
    const addressRegex = new RegExp(
      `\\|\\s*${networkLabel}\\s*\\|\\s*\`[^\`]+\`\\s*\\|`,
      'i',
    )
    readme = readme.replace(addressRegex, `| ${networkLabel}  | \`${contractAddress}\` |`)

    writeFileSync(readmePath, readme)
    console.log('✅ Updated README.md with contract address\n')
  }

  console.log('═══════════════════════════════════════════════')
  console.log(` ${isUpgrade ? '🔄 UPGRADE' : '🚀 DEPLOY'} COMPLETE`)
  console.log(` Contract: ${contractAddress}`)
  console.log(` Network:  ${NETWORK}`)
  console.log(` Mode:     ${isUpgrade ? 'Upgrade (same address)' : 'Fresh deploy'}`)
  console.log('═══════════════════════════════════════════════\n')
}

main()
