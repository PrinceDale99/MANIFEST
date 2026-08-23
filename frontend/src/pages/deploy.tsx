'use client'

import { useState } from 'react'; 
import { initializeMidnightProviders, NETWORK_ID } from '@/lib/midnight/sdk'
import { Contract as ManifestContract } from '../managed/contract/index.js'
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts'
import { CompiledContract } from '@midnight-ntwrk/compact-js'

export default function DeployPage() {
  const [status, setStatus] = useState<string>('Idle')
  const [contractAddress, setContractAddress] = useState<string>('')

  const handleDeploy = async () => {
    try {
      setStatus('Connecting to 1am Wallet & Providers...')
      const providers = await initializeMidnightProviders()
      
      setStatus('Deploying Master Contract... Please approve the transaction in your wallet.')

      // Define minimal witnesses for constructor
      const witnesses = {
        local_secret_key: () => [{}, new Uint8Array(32)],
        store_bid_amount: () => [{}, []],
        store_salt: () => [{}, []],
      }

      // @ts-ignore
      const _compiled = CompiledContract.make("manifest", ManifestContract); const _withWitnesses = CompiledContract.withWitnesses(_compiled, witnesses); const contract = await deployContract(providers, { compiledContract: _withWitnesses, initialPrivateState: {}, privateStateId: "manifest-private-state", args: [new Uint8Array(32), new Uint8Array(32), new Uint8Array(32), 0n, 0n] })
      const deployedAddress = contract.deployTxData.public.contractAddress.toString()
      
      setContractAddress(deployedAddress)
      setStatus('Deployed successfully!')
    } catch (err: any) {
      console.error('DEPLOY ERROR', err, err?.cause, err?.cause?.message);
      setStatus('Error: ' + (err.message || err.toString()) + ' | CAUSE: ' + (err.cause?.message || err.cause || 'none'))
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full bg-gray-800 rounded-lg p-6 shadow-xl border border-gray-700">
        <h1 className="text-2xl font-bold mb-4 text-emerald-400">Deploy Master Contract</h1>
        <p className="text-gray-400 mb-6">
          This will use your connected 1am wallet ({NETWORK_ID}) to deploy the Manifest master contract.
        </p>

        <button
          onClick={handleDeploy}
          className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium transition-colors mb-4"
        >
          Deploy Contract
        </button>

        <div className="bg-gray-900 p-4 rounded text-sm text-gray-300 font-mono break-all">
          Status: {status}
        </div>

        {contractAddress && (
          <div className="mt-4 p-4 border border-emerald-500 bg-emerald-900/20 rounded">
            <h3 className="text-emerald-400 font-semibold mb-2">Deployed Address:</h3>
            <p className="font-mono text-sm break-all">{contractAddress}</p>
            <p className="text-xs text-gray-400 mt-2">
              Copy this address and add it to your .env.local as NEXT_PUBLIC_CONTRACT_ADDRESS.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
