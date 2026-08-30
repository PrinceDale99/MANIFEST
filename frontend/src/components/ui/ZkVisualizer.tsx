import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, EyeOff, ShieldCheck, Cpu, ArrowRight, Sparkles, RefreshCw } from 'lucide-react';

export default function ZkVisualizer() {
  const [bidAmount, setBidAmount] = useState(2850);
  const [salt, setSalt] = useState('7a9f82d1c04e5b38');
  const [isHovered, setIsHovered] = useState(false);

  // Generate a mock pedagogical commitment hash based on inputs
  const computeCommitment = (amount: number, s: string) => {
    let hash = 0x811c9dc5;
    const str = `${amount}:${s}:manifest_zk_protocol`;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = (hash * 0x01000193) >>> 0;
    }
    return `0x${hash.toString(16).padStart(8, '0')}${((hash * 31) >>> 0).toString(16).padStart(8, '0')}...9c4f`;
  };

  const regenerateSalt = () => {
    const randomHex = Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    setSalt(randomHex);
  };

  const commitment = computeCommitment(bidAmount, salt);

  return (
    <div className="relative rounded-2xl glass-card border border-white/10 p-6 md:p-8 overflow-hidden shadow-2xl">
      {/* Decorative gradient badges */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-emerald-500/10 via-cyan-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            Live Zero-Knowledge Simulator
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-white">How Zero-Knowledge Bidding Works</h3>
          <p className="text-sm text-zinc-400">
            Slide to adjust your carrier bid. Notice how only the mathematical commitment is broadcast to the network.
          </p>
        </div>

        <button
          onClick={regenerateSalt}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-200 hover:bg-surface-300 border border-white/10 text-xs font-medium text-zinc-300 transition-colors self-start md:self-auto"
        >
          <RefreshCw className="h-3.5 w-3.5 text-cyan-400" />
          Generate New Salt
        </button>
      </div>

      {/* Interactive Inputs & Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Private Client State */}
        <div className="lg:col-span-5 p-5 rounded-xl bg-surface-100/90 border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <EyeOff className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">Carrier Secret Input</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300">
              Private (Never Leaves Browser)
            </span>
          </div>

          {/* Bid Amount Slider */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-zinc-400">Carrier Target Bid</span>
              <span className="font-mono font-bold text-emerald-400 text-lg">
                ${bidAmount.toLocaleString()} <span className="text-xs text-zinc-500 font-normal">($2.85/mi)</span>
              </span>
            </div>
            <input
              type="range"
              min="1500"
              max="6000"
              step="50"
              value={bidAmount}
              onChange={(e) => setBidAmount(Number(e.target.value))}
              className="w-full h-2 bg-surface-300 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          {/* Secret Salt */}
          <div>
            <div className="flex justify-between text-xs text-zinc-400 mb-1">
              <span>Random 256-bit Salt ($\sigma$)</span>
              <span className="font-mono text-zinc-300">{salt}</span>
            </div>
            <div className="text-[11px] text-zinc-500">
              Combines with your bid to prevent rainbow-table reverse lookups.
            </div>
          </div>
        </div>

        {/* Middle: Circuit Operator */}
        <div className="lg:col-span-2 flex flex-col items-center justify-center py-2">
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/10"
          >
            <Cpu className="h-6 w-6" />
          </motion.div>
          <span className="text-[11px] font-mono text-zinc-400 mt-2">ZK Circuit Hash</span>
          <span className="text-[10px] text-zinc-500">$H(bid, \sigma)$</span>
        </div>

        {/* Right: Public Ledger Output */}
        <div className="lg:col-span-5 p-5 rounded-xl bg-surface-100/90 border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">Public Midnight Ledger</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300">
              On-Chain Record
            </span>
          </div>

          {/* Commitment Display */}
          <div className="p-3.5 rounded-lg bg-surface-50 border border-cyan-500/20">
            <div className="text-[11px] text-zinc-400 mb-1">Public Bid Commitment</div>
            <div className="font-mono text-xs text-cyan-300 break-all select-all font-semibold">
              {commitment}
            </div>
          </div>

          <div className="text-[11px] text-zinc-400 leading-relaxed">
            🛡️ <strong className="text-zinc-200">Zero Leakage:</strong> Competitor carriers and brokers see only this hash. Your real price is only revealed when you provide the secret salt during settlement.
          </div>
        </div>
      </div>
    </div>
  );
}
