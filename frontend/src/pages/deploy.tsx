// @ts-nocheck
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  ShieldCheck,
  Cpu,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  AlertCircle,
  ExternalLink
} from 'lucide-react'
import { initializeMidnightProviders, NETWORK_ID } from '@/lib/midnight/sdk'
import { Contract as ManifestContract } from '../managed/contract/index.js'
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts'
import { CompiledContract } from '@midnight-ntwrk/compact-js'

export default function DeployPage() {
  const [status, setStatus] = useState<string>('Idle')
  const [contractAddress, setContractAddress] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDeploy = async () => {
    try {
      setLoading(true)
      setStatus('Connecting to 1AM Wallet & Midnight Providers...')
      const providers = await initializeMidnightProviders()

      setStatus('Proving & Deploying Contract... Please approve the transaction in your 1AM wallet extension.')

      const witnesses = {
        local_secret_key: () => [{}, new Uint8Array(32)],
        store_bid_amount: () => [{}, []],
        store_salt: () => [{}, []],
      }

      const randomBytes = () => crypto.getRandomValues(new Uint8Array(32))

      const _compiled = CompiledContract.make('manifest', ManifestContract)
      const _withWitnesses = CompiledContract.withWitnesses(_compiled, witnesses)

      const args = [
        randomBytes(),
        randomBytes(),
        randomBytes(),
        1000n,
        2000n,
      ]

      const contract = await deployContract(providers, {
        compiledContract: _withWitnesses,
        initialPrivateState: {},
        privateStateId: 'manifest-private-state',
        args,
      })
      const deployedAddress = contract.deployTxData.public.contractAddress.toString()

      setContractAddress(deployedAddress)
      setStatus('Deployed successfully on Midnight Preview!')
      setLoading(false)
    } catch (err: any) {
      console.error('DEPLOY ERROR', err)
      setStatus('Error: ' + (err.message || err.toString()))
      setLoading(false)
    }
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(contractAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-16 space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
          <Cpu className="h-3.5 w-3.5" />
          Master Contract Deployment
        </div>
        <h1 className="text-3xl font-extrabold text-white">Deploy Manifest Protocol</h1>
        <p className="text-xs text-zinc-400">
          Deploy a fresh Compact master contract to Midnight Network ({NETWORK_ID}).
        </p>
      </div>

      <div className="rounded-3xl glass-card border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl">
        <button
          onClick={handleDeploy}
          disabled={loading}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-400 hover:from-emerald-400 hover:to-cyan-300 text-black font-bold text-xs shadow-xl shadow-emerald-500/25 transition-all hover:scale-[1.02] disabled:opacity-50"
        >
          {loading ? 'Deploying to Midnight...' : '🚀 Deploy Master Contract'}
        </button>

        <div className="p-4 rounded-xl bg-surface-100 border border-white/5 space-y-1 text-xs">
          <span className="text-zinc-500 font-mono">Status:</span>
          <p className="font-mono text-zinc-300 break-all">{status}</p>
        </div>

        {contractAddress && (
          <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Deployed Contract Address
              </span>
              <button
                onClick={copyAddress}
                className="inline-flex items-center gap-1 text-xs text-emerald-300 hover:text-white font-mono"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="font-mono text-xs text-emerald-200 break-all select-all font-semibold">
              {contractAddress}
            </p>
            <a
              href={`https://explorer.1am.xyz/contract/${contractAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-bold text-xs shadow-md shadow-emerald-500/20 hover:scale-[1.02] transition-all"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Verify on 1AM Explorer
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
