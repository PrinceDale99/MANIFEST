import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider'
import { ZK_CONFIG_URL } from './sdk'

export async function testFetch() {
  console.log("TESTING FETCH TO", ZK_CONFIG_URL)
  try {
    const provider = new FetchZkConfigProvider(ZK_CONFIG_URL)
    const key = await provider.getVerifierKey('openBidding')
    console.log("FETCH SUCCESS, key length:", key.length)
  } catch (err: any) {
    console.error("TEST FETCH FAILED", err, err.cause, err.message)
    if (err.cause) console.error("CAUSE", err.cause)
  }
}
