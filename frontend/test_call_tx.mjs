import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { Contract as ManifestContract } from './src/managed/contract/index.js';
import * as ledger from '@midnight-ntwrk/ledger-v8';
import * as compactRuntime from '@midnight-ntwrk/compact-runtime';

import fs from 'fs';
setNetworkId('preview');

const CONTRACT_ADDRESS = 'f4d8e35c6083b656624752b2d76e78325935b6a210dc9dd2c4ed0981fd3bbb92';

async function test() {
  console.log('Testing full findDeployedContract callTx flow...');

  const privateStateMap = new Map();
  const signingKeyMap = new Map();

  const privateStateProvider = {
    get: async (k) => privateStateMap.get(k) ?? {},
    set: async (k, v) => privateStateMap.set(k, v),
    remove: async (k) => privateStateMap.delete(k),
    setContractAddress: () => {},
    getSigningKey: async (a) => signingKeyMap.get(a) ?? null,
    setSigningKey: async (a, k) => signingKeyMap.set(a, k),
  };

  const walletProvider = {
    getCoinPublicKey: () => '0c0bd08e32900c38bdcbe6442463134852a862d430d267b26b72fd4c1ee64aec',
    getEncryptionPublicKey: () => 'f5b9fa49d3c4f06582dab6ba45c85f6b1927873105b4c8cf363b9b57ca910f65',
    balanceTx: async (tx) => tx
  };

  const midnightProvider = {
    submitTx: async (tx) => 'mock-tx-id-12345'
  };

  const zkConfigProvider = {
    getVerifierKey: async (id) => fs.readFileSync(`./public/keys/${id}.verifier`),
    getVerifierKeys: async (ids) => ids.map(id => [id, fs.readFileSync(`./public/keys/${id}.verifier`)]),
    getProverKey: async (id) => fs.readFileSync(`./public/keys/${id}.prover`),
    getZKIR: async (id) => fs.readFileSync(`./public/zkir/${id}.bzkir`),
    get: async (id) => ({
      circuitId: id,
      proverKey: fs.readFileSync(`./public/keys/${id}.prover`),
      verifierKey: fs.readFileSync(`./public/keys/${id}.verifier`),
      zkir: fs.readFileSync(`./public/zkir/${id}.bzkir`)
    }),
    getZkConfig: async () => ({})
  };

  const proofProvider = {
    proveTx: async (unproven) => ({
      ...unproven,
      serialize: () => new Uint8Array(64)
    })
  };

  const createMockContractState = async () => {
    const contract = new ManifestContract({
      local_secret_key: () => [{}, new Uint8Array(32)],
      store_bid_amount: () => [{}, []],
      store_salt: () => [{}, []],
    });
    const initial = contract.initialState(
      { initialPrivateState: {}, initialZswapLocalState: new ledger.ZswapLocalState() },
      new Uint8Array(32),
      new Uint8Array(32),
      new Uint8Array(32),
      1000n,
      2000n
    );
    const circuits = ['openBidding', 'submitBidCommitment', 'transitionToReveal', 'revealBid', 'settleTender', 'cancelTender'];
    for (const c of circuits) {
      const vk = await zkConfigProvider.getVerifierKey(c);
      const op = initial.currentContractState.operation(c) || new compactRuntime.ContractOperation();
      op.verifierKey = vk;
      initial.currentContractState.setOperation(c, op);
    }
    return initial.currentContractState;
  };

  const mockPublicDataProvider = {
    queryDeployContractState: async (addr) => createMockContractState(),
    queryContractState: async (addr) => createMockContractState(),
    queryZSwapAndContractState: async (addr) => {
      const s = await createMockContractState();
      return [new ledger.ZswapChainState(), s, ledger.LedgerParameters.initialParameters()];
    },
    watchForTxData: async (txId) => ({
      status: 'SucceedEntirely',
      txId,
      hash: txId
    }),
    watchForDeployTxData: async (addr) => ({
      status: 'SucceedEntirely',
      contractAddress: addr,
      public: { contractAddress: addr }
    })
  };

  const providers = {
    walletProvider,
    midnightProvider,
    privateStateProvider,
    proofProvider,
    publicDataProvider: mockPublicDataProvider,
    zkConfigProvider
  };

  const witnesses = {
    local_secret_key: (ctx) => [ctx.privateState ?? {}, new Uint8Array(32)],
    store_bid_amount: (ctx, amt) => [ctx.privateState ?? {}, []],
    store_salt: (ctx, s) => [ctx.privateState ?? {}, []]
  };

  const compiled = CompiledContract.make('manifest', ManifestContract);
  const withWitnesses = CompiledContract.withWitnesses(compiled, witnesses);

  console.log('Finding deployed contract...');
  const contract = await findDeployedContract(providers, {
    compiledContract: withWitnesses,
    contractAddress: CONTRACT_ADDRESS,
    privateStateId: 'manifest-private-state',
    initialPrivateState: {}
  });

  console.log('Found contract! Calling callTx.openBidding()...');
  try {
    const tx = await contract.callTx.openBidding();
    console.log('openBidding SUCCESS:', tx);
  } catch (err) {
    console.error('openBidding FAILED:', err);
  }
}

test();
