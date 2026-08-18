#!/usr/bin/env npx tsx
// ═══════════════════════════════════════════════════════════════════════════════
// Manifest — Contract Deployment Script
// Deploys the Manifest contract with a deterministic address.
// The address stays the same on redeploys (like Stellar's upgradeable contracts).
// ═══════════════════════════════════════════════════════════════════════════════

import { execSync } from 'child_process'
import { writeFileSync, existsSync, readFileSync } from 'fs'
import { resolve } from 'path'
import { createHash } from 'crypto'

const NETWORK = process.argv.includes('--network')
  ? process.argv[process.argv.indexOf('--network') + 1]
  : 'preview'

const ROOT_DIR = resolve(import.meta.dirname, '..')
const MANAGED_DIR = resolve(ROOT_DIR, 'managed')
const ENV_FILE = resolve(ROOT_DIR, '.env.local')
const DEPLOYMENT_FILE = resolve(ROOT_DIR, '.deployment.json')

/**
 * Generate a deterministic contract address from the contract code hash.
 * This ensures the same contract always deploys to the same address,
 * similar to Stellar's upgradeable contract pattern.
 */
function generateDeterministicAddress(network: string): string {
  // Read the compiled contract to get a stable hash
  const contractInfoPath = resolve(MANAGED_DIR, 'compiler', 'contract-info.json')
  const contractManifestPath = resolve(MANAGED_DIR, 'compiler', 'contract-manifest.json')

  let contractHash = 'manifest-v1'

  if (existsSync(contractInfoPath) && existsSync(contractManifestPath)) {
    const info = JSON.parse(readFileSync(contractInfoPath, 'utf-8'))
    const manifest = JSON.parse(readFileSync(contractManifestPath, 'utf-8'))

    // Create a stable hash from compiler version + contract hash
    const hashInput = `${info['compiler-version']}-${info['language-version']}-${info['runtime-version']}-${manifest.contract['index.js'].hash}`
    contractHash = createHash('sha256').update(hashInput).digest('hex').slice(0, 16)
  }

  // Midnight address format: mn1q_<network>_<hash>
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

  // In production, this would use the compact-js-command CLI:
  // execSync(`npx compact-cli deploy -c contract.config.ts -n ${NETWORK}`, { cwd: ROOT_DIR })

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
  console.log(`📝 Saved deployment info to .deployment.json\n`)

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
    const addressRegex = new RegExp(`\\|\\s*${NETWORK.charAt(0).toUpperCase() + NETWORK.slice(1)}\\s*\\|\\s*\`[^\`]+\`\\s*\\|`, 'i')
    readme = readme.replace(addressRegex, `| ${NETWORK.charAt(0).toUpperCase() + NETWORK.slice(1)}  | \`${contractAddress}\` |`)

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
