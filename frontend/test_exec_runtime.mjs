import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { ContractExecutable } from '@midnight-ntwrk/midnight-js-protocol/compact-js';
import { makeContractExecutableRuntime } from '@midnight-ntwrk/midnight-js-types';
import { ContractAddress } from '@midnight-ntwrk/midnight-js-protocol/platform-js/effect/ContractAddress';
import { ProvableCircuitId } from '@midnight-ntwrk/midnight-js-protocol/compact-js/effect/Contract';
import * as ledger from '@midnight-ntwrk/ledger-v8';
import * as contractModule from './src/managed/contract/index.js';

setNetworkId('preview');

const contractAddr = 'f4d8e35c6083b656624752b2d76e78325935b6a210dc9dd2c4ed0981fd3bbb92';

async function test() {
  console.log('Testing makeContractExecutableRuntime with ContractExecutable...');
  const contract = new contractModule.Contract({
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

  const contractExec = ContractExecutable.make(contractModule);
  console.log('Provable circuit ids:', contractExec.getProvableCircuitIds());

  const mockZkConfigProvider = {
    getVerifierKey: async () => new Uint8Array(10),
    getProverKey: async () => new Uint8Array(10),
    getZkConfig: async () => ({})
  };

  const runtime = makeContractExecutableRuntime(mockZkConfigProvider, {
    coinPublicKey: '0c0bd08e32900c38bdcbe6442463134852a862d430d267b26b72fd4c1ee64aec'
  });

  const effect = contractExec.circuit(ProvableCircuitId('openBidding'), {
    address: ContractAddress(contractAddr),
    contractState: initial.currentContractState,
    privateState: {},
    ledgerParameters: ledger.LedgerParameters.initialParameters()
  });

  try {
    const exitResult = await runtime.runPromiseExit(effect);
    console.log('Exit result:', exitResult);
  } catch (err) {
    console.error('Runtime threw:', err);
  }
}

test();
