import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { Contract as ManifestContract } from '../src/managed/contract/index.js';
import { WalletBuilder } from '@midnight-ntwrk/wallet';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { CompiledContract } from '@midnight-ntwrk/compact-js';
import * as zswap from '@midnight-ntwrk/zswap';
import { firstValueFrom } from 'rxjs';
import { MidnightBech32m, ShieldedCoinPublicKey, ShieldedEncryptionPublicKey } from '@midnight-ntwrk/wallet-sdk-address-format';

const HEX_SEED = "f1a7da0b5cf5241f6933f4aecb95d19f5c36c0eebe29b7b4f565aafcbb5644ca";
setNetworkId('test');

const witnesses = {
  local_secret_key: () => [{}, new Uint8Array(32)],
  store_bid_amount: () => [{}, []],
  store_salt: () => [{}, []],
};

async function main() {
    const wallet = await WalletBuilder.buildFromSeed(
        'https://indexer.testnet.midnight.network/api/v1/graphql',
        'wss://indexer.testnet.midnight.network/api/v1/graphql',
        'https://proof-server-whkk.onrender.com',
        'wss://rpc.testnet.midnight.network',
        HEX_SEED,
        zswap.NetworkId.TestNet,
        'info'
    );
    const zkConfigProvider = new NodeZkConfigProvider('./public', { verify: 'off' });
    const proofProvider = httpClientProofProvider({ url: 'https://proof-server-whkk.onrender.com', zkConfigProvider });
    wallet.start();
    const state = await firstValueFrom(wallet.state());
    
    const walletProvider = {
        balanceTx: async (tx: any, ttl?: Date) => {
            console.log("SERIALIZED TX:", Buffer.from(tx.serialize()).toString('hex'));
            process.exit(0);
        },
        getCoinPublicKey: () => state.coinPublicKey,
        getEncryptionPublicKey: () => state.encryptionPublicKey
    };
    
    const midnightProvider = {
        submitTx: async (tx: any) => {
            return await wallet.submitTransaction(tx);
        }
    };
    
    const providers = {
      privateStateProvider: wallet,
      zkConfigProvider,
      proofProvider,
      publicDataProvider: indexerPublicDataProvider('https://indexer.testnet.midnight.network/api/v1/graphql', 'wss://indexer.testnet.midnight.network/api/v1/graphql'),
      walletProvider,
      midnightProvider
    };
    
    const _compiled = CompiledContract.make("manifest", ManifestContract);
    const _withWitnesses = CompiledContract.withWitnesses(_compiled, witnesses as any);
    
    await deployContract(providers, {
      compiledContract: _withWitnesses,
      initialPrivateState: {},
      privateStateId: "manifest-private-state",
      args: [new Uint8Array(32), new Uint8Array(32), new Uint8Array(32), 0n, 0n]
    });
}
main().catch(console.error);
