#!/usr/bin/env npx tsx
// ═══════════════════════════════════════════════════════════════════════════════
// Manifest — Contract Compilation Script
// Compiles the Compact contract via Docker and lists Midnight circuits.
// ═══════════════════════════════════════════════════════════════════════════════

import { execSync } from 'child_process'
import { existsSync, readFileSync, readdirSync } from 'fs'
import { resolve } from 'path'

const ROOT_DIR = resolve(import.meta.dirname, '..')
const MANAGED_DIR = resolve(ROOT_DIR, 'managed')

function main() {
  console.log('═══════════════════════════════════════════════')
  console.log(' Manifest — Contract Compilation')
  console.log('═══════════════════════════════════════════════\n')

  // Step 1: Build Docker image with Compact compiler
  console.log('🔨 Building Compact compiler (Docker)...')
  try {
    execSync(
      'docker build -f Dockerfile.compiler -t manifest-compiler .',
      { cwd: ROOT_DIR, stdio: 'pipe' }
    )
    console.log('   ✅ Compiler image built\n')
  } catch {
    console.error('   ❌ Docker build failed. Is Docker running?')
    process.exit(1)
  }

  // Step 2: Extract compiled artifacts
  console.log('📦 Extracting compiled artifacts...')
  try {
    try { execSync('docker rm manifest-extract 2>/dev/null', { stdio: 'pipe' }) } catch {}
    execSync('docker create --name manifest-extract manifest-compiler', { stdio: 'pipe' })
    execSync('docker cp manifest-extract:/app/managed/. managed/', { cwd: ROOT_DIR, stdio: 'pipe' })
    execSync('docker rm manifest-extract', { stdio: 'pipe' })
    console.log('   ✅ Artifacts extracted to managed/\n')
  } catch {
    console.error('   ❌ Failed to extract artifacts')
    process.exit(1)
  }

  // Step 3: Read contract-info.json and list Midnight circuits
  const contractInfoPath = resolve(MANAGED_DIR, 'compiler', 'contract-info.json')
  if (!existsSync(contractInfoPath)) {
    console.error('❌ contract-info.json not found')
    process.exit(1)
  }

  const contractInfo = JSON.parse(readFileSync(contractInfoPath, 'utf-8'))

  console.log('═══════════════════════════════════════════════')
  console.log(' 🔐 MIDNIGHT CIRCUITS')
  console.log('═══════════════════════════════════════════════\n')
  console.log(`  Compiler:     ${contractInfo['compiler-version']}`)
  console.log(`  Language:     ${contractInfo['language-version']}`)
  console.log(`  Runtime:      ${contractInfo['runtime-version']}`)
  console.log('')

  // List circuits
  console.log('  Exported Circuits (with ZK proofs):')
  console.log('  ──────────────────────────────────────')
  for (const circuit of contractInfo.circuits) {
    const args = circuit.arguments.length > 0
      ? circuit.arguments.map((a: any) => `${a.name}: ${a.type['type-name']}${a.type.length ? `<${a.type.length}>` : ''}`).join(', ')
      : 'none'
    console.log(`  📌 ${circuit.name}`)
    console.log(`     Arguments:  ${args}`)
    console.log(`     Returns:    ${circuit['result-type']['type-name']}`)
    console.log(`     ZK Proof:   ${circuit.proof ? '✅ required' : '❌ not required'}`)
    console.log('')
  }

  // List witnesses
  console.log('  Private Witnesses (never on-chain):')
  console.log('  ──────────────────────────────────────')
  for (const witness of contractInfo.witnesses) {
    const args = witness.arguments.length > 0
      ? witness.arguments.map((a: any) => `${a.name}: ${a.type['type-name']}`).join(', ')
      : 'none'
    console.log(`  🔒 ${witness.name}(${args})`)
  }
  console.log('')

  // List ledger fields
  console.log('  Ledger Fields (on-chain state):')
  console.log('  ──────────────────────────────────────')
  for (const field of contractInfo.ledger) {
    let typeName: string
    let extra = ''

    if (field.storage === 'Map' && field.key && field.value) {
      // Map type: key and value are directly on the field
      const keyType = field.key['type-name'] + (field.key.length ? `<${field.key.length}>` : '')
      const valueType = field.value['type-name'] + (field.value.length ? `<${field.value.length}>` : '')
      typeName = 'Map'
      extra = `<${keyType}, ${valueType}>`
    } else if (field.type) {
      // Cell type: type is nested under field.type
      typeName = field.type['type-name']
      if (typeName === 'Enum') {
        // Enum has name property
        extra = field.type.name ? `<${field.type.name}>` : ''
      } else if (field.type.length) {
        extra = `<${field.type.length}>`
      }
    } else {
      typeName = 'unknown'
    }

    const sealed = !['tenderStatus', 'lowestDisclosedBid', 'carrierCommitments'].includes(field.name)
      ? ' (sealed)'
      : ''
    console.log(`  📋 ${field.name}: ${typeName}${extra}${sealed}`)
  }
  console.log('')

  // List compiled files
  console.log('═══════════════════════════════════════════════')
  console.log(' 📁 COMPILED FILES')
  console.log('═══════════════════════════════════════════════\n')

  const keysDir = resolve(MANAGED_DIR, 'keys')
  if (existsSync(keysDir)) {
    const proverFiles = readdirSync(keysDir).filter(f => f.endsWith('.prover'))
    console.log('  Circuit Keys:')
    for (const f of proverFiles) {
      const name = f.replace('.prover', '')
      console.log(`    ✅ ${name} (prover + verifier)`)
    }
    console.log('')
  }

  const zkirDir = resolve(MANAGED_DIR, 'zkir')
  if (existsSync(zkirDir)) {
    const zkirFiles = readdirSync(zkirDir).filter(f => f.endsWith('.zkir'))
    console.log('  ZK Intermediate Representations:')
    for (const f of zkirFiles) {
      console.log(`    ✅ ${f}`)
    }
    console.log('')
  }

  const contractDir = resolve(MANAGED_DIR, 'contract')
  if (existsSync(contractDir)) {
    console.log('  TypeScript Bindings:')
    for (const f of readdirSync(contractDir)) {
      console.log(`    ✅ ${f}`)
    }
    console.log('')
  }

  // Step 4: Run contract tests
  console.log('═══════════════════════════════════════════════')
  console.log(' 🧪 RUNNING CONTRACT TESTS')
  console.log('═══════════════════════════════════════════════\n')
  try {
    const output = execSync('npx vitest run', { cwd: ROOT_DIR, encoding: 'utf-8', stdio: 'pipe' })
    // Extract key lines from vitest output
    const lines = output.split('\n')
    for (const line of lines) {
      if (line.includes('✓') || line.includes('Tests') || line.includes('Test Files') || line.includes('Duration')) {
        console.log(`  ${line.trim()}`)
      }
    }
    console.log('')
  } catch (error: any) {
    console.error('  ❌ Tests failed')
    if (error.stdout) console.log(error.stdout)
    process.exit(1)
  }

  console.log('═══════════════════════════════════════════════')
  console.log(' ✅ COMPILATION & TESTS COMPLETE')
  console.log('═══════════════════════════════════════════════\n')
}

main()
