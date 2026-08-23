import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { Contract as ManifestContract } from '../src/managed/contract/index.js';
import { Wallet } from '@midnight-ntwrk/wallet-api';
import { createWallet } from '@midnight-ntwrk/wallet-sdk-hd';

const SEED = "vast disagree lizard rigid false autumn pill leader put frequent inner dirt sell gather road share response police floor field slight private basket fiscal";

async function main() {
    console.log("Building wallet...");
    // @ts-ignore
    const wallet = await createWallet({
        networkId: 'preview',
        indexer: 'https://indexer.preview.midnight.network/api/v1/graphql',
        indexerWs: 'wss://indexer.preview.midnight.network/api/v1/graphql/ws',
        prover: 'https://proof-server-whkk.onrender.com',
        node: 'https://rpc.preview.midnight.network',
        seed: SEED,
    });
    
    // wallet.start();
    const state = await wallet.state();
    console.log("Wallet address:", state.address);
    console.log("Wallet balances:", state.balances);

    console.log("Setting up providers...");
    const zkConfigProvider = new FetchZkConfigProvider('https://frontend-one-pi-zkum5l95zz.vercel.app/keys/', fetch);
    const proofProvider = httpClientProofProvider({ url: 'https://proof-server-whkk.onrender.com', zkConfigProvider });
    const publicDataProvider = indexerPublicDataProvider('https://indexer.preview.midnight.network/api/v1/graphql', 'wss://indexer.preview.midnight.network/api/v1/graphql/ws');

    const providers = {
        privateStateProvider: {
            get: async () => null,
            set: async () => {},
            remove: async () => {}
        } as any,
        zkConfigProvider,
        proofProvider,
        publicDataProvider,
        walletProvider: wallet,
        midnightProvider: wallet
    };

    const witnesses = {
        local_secret_key: () => [{}, new Uint8Array(32)],
        store_bid_amount: () => [{}, []],
        store_salt: () => [{}, []],
    };

    console.log("Compiling contract definition...");
    const _compiled = CompiledContract.make("manifest", ManifestContract); 
    const _withWitnesses = CompiledContract.withWitnesses(_compiled, witnesses); 

    console.log("Deploying contract... (this takes ~30-60s)");
    const contract = await deployContract(providers, { 
        compiledContract: _withWitnesses, 
        initialPrivateState: {}, 
        privateStateId: "manifest-private-state", 
        args: [new Uint8Array(32), new Uint8Array(32), new Uint8Array(32), 0n, 0n] 
    });

    console.log("===================================");
    console.log("Deployed successfully!");
    console.log("Contract Address:", contract.deployTxData.public.contractAddress.toString());
    console.log("===================================");
    process.exit(0);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
