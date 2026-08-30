import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, ExternalLink, ShieldCheck, KeyRound, Cpu, Droplets } from 'lucide-react';
import type { WalletState, ProofServerStatus } from '@/types/manifest';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: WalletState;
  proofServer: ProofServerStatus;
}

export default function WalletModal({ isOpen, onClose, wallet, proofServer }: WalletModalProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const truncate = (str?: string) => {
    if (!str) return '—';
    return `${str.slice(0, 10)}...${str.slice(-10)}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-lg rounded-2xl glass-card border border-white/10 p-6 shadow-2xl text-white overflow-hidden"
          >
            {/* Ambient background glow */}
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/20">
                  <ShieldCheck className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-white">Midnight Shielded Wallet</h3>
                  <p className="text-xs text-zinc-400">1AM Cryptographic Security Active</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Connection Status Box */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-3 rounded-xl bg-surface-100/80 border border-white/5 flex items-center gap-3">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <div>
                  <div className="text-[11px] text-zinc-400 font-medium uppercase tracking-wider">Network</div>
                  <div className="text-xs font-semibold text-white">Midnight Preview</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface-100/80 border border-white/5 flex items-center gap-3">
                <Cpu className="h-4 w-4 text-cyan-400" />
                <div>
                  <div className="text-[11px] text-zinc-400 font-medium uppercase tracking-wider">Proof Engine</div>
                  <div className="text-xs font-semibold text-emerald-400">
                    {proofServer.connected ? `Online (${proofServer.latencyMs}ms)` : 'Active'}
                  </div>
                </div>
              </div>
            </div>

            {/* Address & Keys */}
            <div className="space-y-3 mb-6">
              {/* Shielded Address */}
              <div className="p-3.5 rounded-xl bg-surface-100/80 border border-white/5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400 font-medium">Shielded Address</span>
                  <button
                    onClick={() => copyToClipboard(wallet.address || '', 'address')}
                    className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-mono transition-colors"
                  >
                    {copiedKey === 'address' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedKey === 'address' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <p className="font-mono text-xs text-zinc-200 break-all select-all">
                  {wallet.address || 'Connecting to 1AM Wallet...'}
                </p>
              </div>

              {/* Shielded Coin Public Key */}
              {wallet.coinPublicKey && (
                <div className="p-3.5 rounded-xl bg-surface-100/80 border border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-400 font-medium">Coin Public Key</span>
                    <button
                      onClick={() => copyToClipboard(wallet.coinPublicKey || '', 'cpk')}
                      className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-mono transition-colors"
                    >
                      {copiedKey === 'cpk' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      {copiedKey === 'cpk' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <p className="font-mono text-xs text-zinc-300 break-all">
                    {truncate(wallet.coinPublicKey)}
                  </p>
                </div>
              )}
            </div>

            {/* Quick Links / Actions */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://preview.midnight.network"
                target="_blank"
                rel="noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-surface-200 hover:bg-surface-300 text-xs font-medium text-white transition-colors border border-white/5"
              >
                <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
                Preview Explorer
              </a>

              <a
                href="https://faucet.preview.midnight.network"
                target="_blank"
                rel="noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 text-xs font-medium transition-colors"
              >
                <Droplets className="h-3.5 w-3.5 text-emerald-400" />
                Get Testnet NIGHT
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
