import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
const p = new NodeZkConfigProvider('./public', { verify: 'off' });
const original = p.getVerifierKey;
p.getVerifierKey = async function(c) {
    console.log("Called getVerifierKey:", c);
    try {
        const res = await original.call(this, c);
        console.log("Success getVerifierKey:", c, res.length);
        return res;
    } catch (e) {
        console.error("Failed getVerifierKey:", c, e);
        throw e;
    }
};
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
// Let's just run deploy-local with this patched provider!
