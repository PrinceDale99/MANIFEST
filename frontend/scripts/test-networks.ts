import { WalletBuilder } from '@midnight-ntwrk/wallet';
import * as zswap from '@midnight-ntwrk/zswap';
import { firstValueFrom } from 'rxjs';

const HEX_SEED = "f1a7da0b5cf5241f6933f4aecb95d19f5c36c0eebe29b7b4f565aafcbb5644ca";

async function testNet(id: any) {
    const wallet = await WalletBuilder.buildFromSeed(
        'https://indexer.testnet.midnight.network/api/v1/graphql',
        'wss://indexer.testnet.midnight.network/api/v1/graphql',
        'https://proof-server-whkk.onrender.com',
        'wss://rpc.testnet.midnight.network',
        HEX_SEED,
        id,
        'info'
    );
    wallet.start();
    const state = await firstValueFrom(wallet.state());
    console.log(id, state.coinPublicKey);
}
testNet(zswap.NetworkId.Undeployed).then(() => testNet(zswap.NetworkId.DevNet)).catch(console.error);
