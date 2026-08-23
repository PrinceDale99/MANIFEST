import { deployContract, createContractMaintenanceTxInterface } from '@midnight-ntwrk/midnight-js-contracts';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { Contract, createManifestPrivateState } from '../src/managed/contract/index.js';
import { TransactionContext } from '@midnight-ntwrk/midnight-js-types';
import { WalletBuilder } from '@midnight-ntwrk/wallet';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import * as crypto from 'crypto';
import { randomBytes } from 'crypto';

const SEED = "vast disagree lizard rigid false autumn pill leader put frequent inner dirt sell gather road share response police floor field slight private basket fiscal";

async function main() {
    console.log("Setting up providers...");
    // Initialize wallet
    const wallet = await WalletBuilder.buildFromSeed(
        'http://127.0.0.1:9944',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:61850',
        SEED,
        'preview',
        'info'
    );
    
    // We can just use the wallet builder or construct providers directly
}

main().catch(console.error);
