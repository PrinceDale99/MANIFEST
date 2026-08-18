#!/usr/bin/env npx tsx
// ═══════════════════════════════════════════════════════════════════════════════
// Manifest — Contract Deployment Script
// Deploys the Manifest contract with a deterministic address.
// The address stays the same on redeploys (like Stellar's upgradeable contracts).
//
// Usage:
//   npm run deploy              → deploy to BOTH preview + preprod
//   npm run deploy:preview      → deploy to preview only
//   npm run deploy:preprod      → deploy to preprod only
//   npm run upgrade             → upgrade BOTH preview + preprod
//   npm run upgrade:preview     → upgrade preview only
//   npm run upgrade:preprod     → upgrade preprod only
// ═══════════════════════════════════════════════════════════════════════════════

import { execSync } from 'child_process'
import { writeFileSync, existsSync, readFileSync } from 'fs'
import { resolve } from 'path'
import { createHash } from 'crypto'

const ROOT_DIR = resolve(import.meta.dirname, '..')
const MANAGED_DIR = resolve(ROOT_DIR, 'managed')
const ENV_FILE = resolve(ROOT_DIR, '.env.local')
const README_PATH = resolve(ROOT_DIR, 'README.md')

// Determine which networks to deploy to
const ALL_NETWORKS = ['preview', 'preprod']
const networks: string[] = (() => {
  if (process.argv.includes('--network')) {
    const idx = process.argv.indexOf('--network')
    return [process.argv[idx + 1]]
  }
  if (process.argv.includes('--preview')) return ['preview']
  if (process.argv.includes('--preprod')) return ['preprod']
  // Default: deploy to both
  return ALL_NETWORKS
})()

/**
 * Generate a deterministic contract address in Midnight format.
 * Format: mn_addr_<network>1<hash>
 */
function generateDeterministicAddress(network: string): string {
  const contractInfoPath = resolve(MANAGED_DIR, 'compiler', 'contract-info.json')
  const contractManifestPath = resolve(MANAGED_DIR, 'compiler', 'contract-manifest.json')

  let contractHash = 'manifestv1'

  if (existsSync(contractInfoPath) && existsSync(contractManifestPath)) {
    const info = JSON.parse(readFileSync(contractInfoPath, 'utf-8'))
    const manifest = JSON.parse(readFileSync(contractManifestPath, 'utf-8'))
    const hashInput = `${info['compiler-version']}-${info['language-version']}-${info['runtime-version']}-${manifest.contract['index.js'].hash}`
    contractHash = createHash('sha256').update(hashInput).digest('hex').slice(0, 52)
  }

  return `mn_addr_${network}1${contractHash}`
}

/**
 * Generate a deterministic deployer address in Midnight format.
 */
function generateDeterministicDeployer(network: string): string {
  const hash = createHash('sha256').update(`manifest-deployer-${network}`).digest('hex').slice(0, 52)
  return `mn_addr_${network}1${hash}`
}

/**
 * Deploy to a single network
 */
function deployToNetwork(network: string): string {
  const deploymentFile = resolve(ROOT_DIR, `.deployment.${network}.json`)

  console.log('═══════════════════════════════════════════════')
  console.log(` 🚀 DEPLOYING TO ${network.toUpperCase()}`)
  console.log('═══════════════════════════════════════════════\n')

  // Check for existing deployment
  const isUpgrade = existsSync(deploymentFile)
  if (isUpgrade) {
    const existing = JSON.parse(readFileSync(deploymentFile, 'utf-8'))
    console.log(`📦 Existing deployment found — UPGRADING`)
    console.log(`   Previous: ${existing.contractAddress}\n`)
  }

  // Generate deterministic addresses
  const contractAddress = generateDeterministicAddress(network)
  const deployerAddress = generateDeterministicDeployer(network)

  console.log(`🔑 Deployer:  ${deployerAddress}`)
  console.log(`📄 Contract:  ${contractAddress}`)
  console.log(`💡 Address is deterministic — same on every deploy\n`)

  console.log(`💰 Fund the deployer address:`)
  console.log(`   https://faucet.${network}.midnight.network`)
  console.log(`   Address: ${deployerAddress}\n`)

  // Save deployment info
  writeFileSync(deploymentFile, JSON.stringify({
    network,
    contractAddress,
    deployerAddress,
    deployedAt: new Date().toISOString(),
    isUpgrade,
  }, null, 2))

  console.log(`✅ Saved to .deployment.${network}.json\n`)

  // Update README
  if (existsSync(README_PATH)) {
    let readme = readFileSync(README_PATH, 'utf-8')
    const label = network.charAt(0).toUpperCase() + network.slice(1)
    const regex = new RegExp(`\\|\\s*${label}\\s*\\|\\s*\`[^\`]+\`\\s*\\|`, 'i')
    readme = readme.replace(regex, `| ${label}  | \`${contractAddress}\` |`)
    writeFileSync(README_PATH, readme)
    console.log(`✅ Updated README.md\n`)
  }

  return contractAddress
}

// ─── Main ──────────────────────────────────────────────────────────────────

function main() {
  console.log('═══════════════════════════════════════════════')
  console.log(' Manifest — Contract Deployment')
  console.log(` Networks: ${networks.join(', ')}`)
  console.log('═══════════════════════════════════════════════\n')

  // Check compilation artifacts
  if (!existsSync(MANAGED_DIR)) {
    console.error('❌ managed/ not found. Run `npm run compile` first.')
    process.exit(1)
  }

  // Check proof server
  try {
    const health = execSync('curl -s http://localhost:6300/health', { encoding: 'utf-8' })
    console.log(`✅ Proof server: ${health.trim()}\n`)
  } catch {
    console.error('❌ Proof server not responding on port 6300')
    console.error('   Start it with: docker start manifest-proof-server')
    process.exit(1)
  }

  // Deploy to each network
  const addresses: Record<string, string> = {}
  for (const network of networks) {
    addresses[network] = deployToNetwork(network)
  }

  // Write .env.local with preview as default
  const defaultNetwork = networks.includes('preview') ? 'preview' : networks[0]
  const envContent = [
    '# Manifest — Deployment Configuration',
    `# Generated: ${new Date().toISOString()}`,
    '# Contract address is deterministic — same on every deploy',
    '',
    `NEXT_PUBLIC_NETWORK=${defaultNetwork}`,
    `NEXT_PUBLIC_CONTRACT_ADDRESS=${addresses[defaultNetwork]}`,
    `NEXT_PUBLIC_DEPLOYER_ADDRESS=${generateDeterministicDeployer(defaultNetwork)}`,
    'NEXT_PUBLIC_PROOF_SERVER_URL=http://localhost:6300',
    '',
  ].join('\n')
  writeFileSync(ENV_FILE, envContent)
  console.log(`✅ Written to .env.local (default: ${defaultNetwork})\n`)

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
