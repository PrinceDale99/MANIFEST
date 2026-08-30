// Headless Manifest deploy — no browser extension needed
// Uses .wallet-seed.hex seed file directly
//
// Run: node --import tsx/esm scripts/deploy-node.mjs

import { WalletBuilder }            from "@midnight-ntwrk/wallet";
import { setNetworkId }             from "@midnight-ntwrk/midnight-js-network-id";
import { deployContract }           from "@midnight-ntwrk/midnight-js-contracts";
import { CompiledContract }         from "@midnight-ntwrk/compact-js";
import { httpClientProofProvider }  from "@midnight-ntwrk/midnight-js-http-client-proof-provider";
import { indexerPublicDataProvider } from "@midnight-ntwrk/midnight-js-indexer-public-data-provider";
import { ZKConfigProvider, createProverKey, createVerifierKey, createZKIR }
                                    from "@midnight-ntwrk/midnight-js-types";
import { Contract as ManifestContract } from "../src/managed/contract/index.js";
import { MidnightBech32m, ShieldedCoinPublicKey, ShieldedEncryptionPublicKey }
                                    from "@midnight-ntwrk/wallet-sdk-address-format";
import fs                           from "fs";
import { firstValueFrom, filter }   from "rxjs";
import nodeFetch                    from "node-fetch";
import crypto                       from "crypto";

// ─── Config ──────────────────────────────────────────────────────────────────
const NETWORK_ID    = "preprod";
const INDEXER       = "https://indexer.preprod.midnight.network/api/v1/graphql";
const INDEXER_WS    = "wss://indexer.preprod.midnight.network/api/v1/graphql/ws";
const NODE          = "https://rpc.preprod.midnight.network";
const PROOF_SERVER  = "https://proof-server-whkk.onrender.com";
const ZK_BASE_URL   = "https://frontend-one-pi-zkum5l95zz.vercel.app";
const SEED_FILE     = ".wallet-seed.hex";
// ─────────────────────────────────────────────────────────────────────────────

class DirectZkConfigProvider extends ZKConfigProvider {
  constructor(baseUrl) {
    super();
    this.baseUrl = baseUrl.endsWith("/") ? baseUrl : baseUrl + "/";
  }

  async fetchBytes(path) {
    const url = this.baseUrl + path;
    console.log("[ZK] Fetching:", url);
    const res = await nodeFetch(url);
    if (!res.ok) throw new Error("HTTP " + res.status + " fetching " + url);
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("text/html")) throw new Error("Got HTML fallback for " + url);
    const buf = await res.arrayBuffer();
    console.log("[ZK] " + buf.byteLength + " bytes");
    return new Uint8Array(buf);
  }

  async getProverKey(id)   { return createProverKey(await this.fetchBytes("keys/" + id + ".prover")); }
  async getVerifierKey(id) { return createVerifierKey(await this.fetchBytes("keys/" + id + ".verifier")); }
  async getZKIR(id)        { return createZKIR(await this.fetchBytes("zkir/" + id + ".bzkir")); }
}

async function main() {
  console.log("=== MANIFEST Headless Deploy ===");
  console.log("Network:", NETWORK_ID);

  setNetworkId(NETWORK_ID);

  const seedHex = fs.readFileSync(SEED_FILE, "utf-8").trim();
  console.log("Seed:", seedHex.substring(0, 8) + "...");

  console.log("\nBuilding wallet (connecting to preprod indexer)...");
  const wallet = await WalletBuilder.buildFromSeed(
    INDEXER, INDEXER_WS, PROOF_SERVER, NODE, seedHex, 0
  );
  wallet.start();

  console.log("Syncing wallet... (may take 30-120s)");
  const state = await Promise.race([
    firstValueFrom(wallet.state().pipe(filter(s => !!s.address))),
    new Promise((_, rej) =>
      setTimeout(() => rej(new Error("Wallet sync timeout after 120s")), 120000)
    )
  ]);

  // Extract coin public key from the shielded address
  const addrStr = state.address;
  const coinPublicKeyHex = (() => {
    try {
      const parsed = MidnightBech32m.parse(addrStr);
      // The address encodes coinPublicKey + encryptionPublicKey (each 32 bytes)
      const data = parsed.data;
      return Buffer.from(data.subarray(0, 32)).toString("hex");
    } catch {
      return null;
    }
  })();

  console.log("\n--- Wallet ---");
  console.log("Address:", addrStr);
  console.log("CoinPublicKey:", coinPublicKeyHex);
  console.log("Balances:", JSON.stringify(state.balances || {}, (_, v) =>
    typeof v === "bigint" ? v.toString() : v));
  console.log("---\n");

  // ─── Build the WalletProvider bridge ──────────────────────────────────────
  // The midnight-js contracts SDK expects walletProvider with:
  //   getCoinPublicKey()
  //   getEncryptionPublicKey()
  //   balanceTx(unprovenTx) -> balancedTx hex
  // and midnightProvider with:
  //   submitTx(balancedTx) -> txId
  //
  // The wallet-api Wallet has:
  //   balanceTransaction(tx, newCoins) -> recipe
  //   proveTransaction(recipe) -> provenTx
  //   submitTransaction(tx) -> txId
  // ─────────────────────────────────────────────────────────────────────────

  const walletProvider = {
    getCoinPublicKey: () => coinPublicKeyHex,
    getEncryptionPublicKey: () => {
      try {
        const parsed = MidnightBech32m.parse(addrStr);
        const data = parsed.data;
        return Buffer.from(data.subarray(32, 64)).toString("hex");
      } catch { return null; }
    },
    balanceTx: async (unprovenTx) => {
      console.log("[wallet] balanceTx called, tx type:", typeof unprovenTx);
      // wallet.balanceTransaction returns {tx, ..} or a recipe
      const recipe = await wallet.balanceTransaction(unprovenTx, []);
      console.log("[wallet] balanceTransaction returned, proving...");
      const provenTx = await wallet.proveTransaction(recipe);
      console.log("[wallet] proveTransaction done");
      return provenTx;
    }
  };

  const midnightProvider = {
    submitTx: async (tx) => {
      console.log("[wallet] submitTx called");
      const txId = await wallet.submitTransaction(tx);
      console.log("[wallet] submitted, txId:", txId);
      return txId;
    }
  };

  const zkConfigProvider   = new DirectZkConfigProvider(ZK_BASE_URL);
  const proofProvider      = httpClientProofProvider({ url: PROOF_SERVER, zkConfigProvider });
  const publicDataProvider = indexerPublicDataProvider(INDEXER, INDEXER_WS);

  const privateStateStore = {};
  const privateStateProvider = {
    get:              async (id)        => privateStateStore[id] || null,
    set:              async (id, s)     => { privateStateStore[id] = s; },
    remove:           async (id)        => { delete privateStateStore[id]; },
    setContractAddress: (addr)          => {},
    setSigningKey:    async (addr, key) => { privateStateStore["__key_" + addr] = key; },
    getSigningKey:    async (addr)      => privateStateStore["__key_" + addr] || null,
  };

  const providers = {
    walletProvider,
    midnightProvider,
    proofProvider,
    publicDataProvider,
    zkConfigProvider,
    privateStateProvider,
  };

  // ─── Deploy ───────────────────────────────────────────────────────────────
  const witnesses = {
    local_secret_key: () => [{}, new Uint8Array(32)],
    store_bid_amount: () => [{}, []],
    store_salt:       () => [{}, []],
  };

  const tenderId               = crypto.randomBytes(32);
  const loadHash               = crypto.randomBytes(32);
  const reservePriceCommitment = crypto.randomBytes(32);

  const _compiled      = CompiledContract.make("manifest", ManifestContract);
  const _withWitnesses = CompiledContract.withWitnesses(_compiled, witnesses);

  console.log("Deploying contract (this will take ~60s for proof generation)...");

  try {
    const contract = await deployContract(providers, {
      compiledContract:    _withWitnesses,
      initialPrivateState: {},
      privateStateId:      "manifest-private-state",
      args: [tenderId, loadHash, reservePriceCommitment, 1000n, 2000n]
    });

    const addr = contract.deployTxData.public.contractAddress.toString();
    console.log("\n SUCCESS! Contract deployed.");
    console.log("Contract Address:", addr);
    console.log("\nAdd to your .env.local:");
    console.log("VITE_CONTRACT_ADDRESS=" + addr);
    fs.writeFileSync("deployed-address.txt", addr);
    console.log("Saved to: deployed-address.txt");

  } catch (err) {
    console.error("\n Deploy failed:", err.message);
    if (err.cause) console.error("  Cause:", err.cause?.message || err.cause);
    if (err.stack) console.error(err.stack);
  } finally {
    try { wallet.close(); } catch {}
    process.exit(0);
  }
}

main().catch(err => { console.error("Fatal:", err); process.exit(1); });
