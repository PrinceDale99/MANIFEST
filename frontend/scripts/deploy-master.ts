import { WalletBuilder } from '@midnight-ntwrk/wallet'
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id'
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts'
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider'
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider'
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider'
import crypto from 'crypto'
import { Contract as ManifestContract } from '../src/managed/contract/index.js'
import fs from 'fs'
import { firstValueFrom } from 'rxjs'

const SEED_FILE = '.wallet-seed.hex'

function getNetworkUrls(networkId: string) {
  if (networkId === 'preprod') {
    return {
      indexer: 'https://indexer.preprod.midnight.network/api/v1/graphql',
      indexerWs: 'wss://indexer.preprod.midnight.network/api/v1/graphql/ws',
      node: 'https://rpc.preprod.midnight.network',
      faucet: 'https://faucet.preprod.midnight.network',
      prover: 'http://localhost:6300',
      zkConfig: 'http://localhost:10000'
    }
  }
  return {
    indexer: 'https://indexer.testnet.midnight.network/api/v1/graphql',
    indexerWs: 'wss://indexer.testnet.midnight.network/api/v1/graphql/ws',
    node: 'https://rpc.testnet.midnight.network',
    faucet: 'https://faucet.testnet.midnight.network',
    prover: 'http://localhost:6300',
    zkConfig: 'http://localhost:10000'
  }
}

async function main() {
  const network = process.argv.includes('--preprod') ? 'preprod' : 'testnet'
  const urls = getNetworkUrls(network)
  
  // Set Network ID for midnight-js
  setNetworkId(network === 'preprod' ? 'Undeployed' : 'TestNet')
  
  let seedHex = process.env.WALLET_SEED
  if (!seedHex) {
    if (fs.existsSync(SEED_FILE)) {
      seedHex = fs.readFileSync(SEED_FILE, 'utf-8').trim()
    } else {
      seedHex = crypto.randomBytes(32).toString('hex')
      fs.writeFileSync(SEED_FILE, seedHex)
    }
  }

  const wallet = await WalletBuilder.buildFromSeed(
    urls.indexer,
    urls.indexerWs,
    urls.prover,
    urls.node,
    seedHex,
    network === 'preprod' ? 0 : 2
  )
  wallet.start()
  const state = await firstValueFrom(wallet.state())
  const address = state.address

  console.log('---')
  console.log('Network: ' + network)
  console.log('Wallet Address: ' + address)
  console.log('---\n')

  // @ts-ignore
  const balancesArr = state.balances ? Object.values(state.balances) : []; const balance = balancesArr.length > 0 ? BigInt(balancesArr[0] as any) : 0n
  
  if (balance === 0n) {
    console.log('Your wallet has 0 balance!')
    console.log('Please go to ' + urls.faucet + ' and fund your address.')
    console.log('Your wallet seed has been saved to ' + SEED_FILE + '.')
    console.log('Run this script again after the faucet sends tokens.')
    process.exit(1)
  }

  console.log('Wallet funded! (Balance: ' + balance.toString() + ' tDUST)')
  console.log('Deploying Master Contract...')

  const proofProvider = httpClientProofProvider(urls.prover)
  const publicDataProvider = indexerPublicDataProvider(urls.indexerWs, urls.indexer)
  const zkConfigProvider = new FetchZkConfigProvider(urls.zkConfig)

  const providers = {
    walletProvider: wallet,
    proofProvider,
    publicDataProvider,
    zkConfigProvider,
  }

  // Define minimal witnesses for constructor
  const witnesses = {
    local_secret_key: () => [{}, Buffer.alloc(32)],
    store_bid_amount: () => [{}, []],
    store_salt: () => [{}, []],
  }

  try {
    // @ts-ignore
    const contract = await deployContract(providers, new ManifestContract(witnesses), {})
    const deployedAddress = contract.deployTxData.public.contractAddress.toString()
    console.log('Master Contract successfully deployed!')
    console.log('Contract Address: ' + deployedAddress)
    console.log('\nNext steps: Update your .env.local:')
    console.log('NEXT_PUBLIC_CONTRACT_ADDRESS=' + deployedAddress)
  } catch (err: any) {
    console.error('\nDeployment failed:', err.message || err)
    if (err.message?.includes('fetch')) {
      console.log('Make sure your local proof server and zk config server are running!')
    }
  }
}

main().catch(console.error)
