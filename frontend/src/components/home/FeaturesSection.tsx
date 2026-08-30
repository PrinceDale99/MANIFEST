'use client'

import { motion } from 'framer-motion'
import {
  Lock,
  Cpu,
  Zap,
  Search,
  ShieldCheck,
  TrendingDown,
  Check,
  X,
  Sparkles
} from 'lucide-react'

const features = [
  {
    icon: Lock,
    title: 'Sealed-Bid Confidentiality',
    description: 'Carriers submit private bids via cryptographic commitments. Competitor carriers cannot see or snipe each other’s bids.',
    color: 'emerald',
    gradient: 'from-emerald-500/20 to-teal-500/20',
    border: 'border-emerald-500/30',
  },
  {
    icon: Cpu,
    title: 'Zero-Knowledge Circuit Math',
    description: 'Compact smart contract circuits verify that bids satisfy all load specifications without revealing private witnesses.',
    color: 'cyan',
    gradient: 'from-cyan-500/20 to-blue-500/20',
    border: 'border-cyan-500/30',
  },
  {
    icon: Zap,
    title: 'Automated Smart Settlement',
    description: 'The smart contract autonomously selects the lowest qualified bidder. Zero manual disputes, zero middlemen delays.',
    color: 'violet',
    gradient: 'from-violet-500/20 to-purple-500/20',
    border: 'border-violet-500/30',
  },
  {
    icon: Search,
    title: 'Public Mathematical Auditability',
    description: 'Anyone can verify auction fairness and winner selection directly on the Midnight Preview blockchain explorer.',
    color: 'amber',
    gradient: 'from-amber-500/20 to-yellow-500/20',
    border: 'border-amber-500/30',
  },
  {
    icon: TrendingDown,
    title: 'Zero Middleman Extortions',
    description: 'Say goodbye to 18-25% brokerage commissions. Direct peer-to-peer freight matching on decentralized infrastructure.',
    color: 'emerald',
    gradient: 'from-emerald-500/20 to-teal-500/20',
    border: 'border-emerald-500/30',
  },
  {
    icon: ShieldCheck,
    title: 'Sybil-Resistant Identity',
    description: 'Each carrier uses a unique shielded 1AM cryptographic identity, ensuring fair one-bid-per-carrier auction rules.',
    color: 'cyan',
    gradient: 'from-cyan-500/20 to-blue-500/20',
    border: 'border-cyan-500/30',
  },
]

const comparisons = [
  { feature: 'Carrier Bid Privacy', legacy: 'Exposed to brokers & insiders', manifest: '100% Cryptographically Sealed' },
  { feature: 'Middleman Broker Commission', legacy: '15% – 22% load fee', manifest: '0.0% (Zero Middlemen)' },
  { feature: 'Fairness Guarantee', legacy: 'Blind trust in opaque brokers', manifest: 'Mathematically Proved on Midnight' },
  { feature: 'Payment / Settlement Speed', legacy: '30 to 90 days factoring', manifest: 'Instant on-chain finality' },
  { feature: 'Audit Capability', legacy: 'Proprietary broker databases', manifest: 'Public Zero-Knowledge Verifier' },
]

export default function FeaturesSection() {
  return (
    <section className="relative py-20 overflow-hidden">
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-100 border border-white/10 text-xs font-semibold text-zinc-300">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            Competitive Advantages
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Why Manifest Replaces Traditional Brokerage
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto">
            Traditional freight bidding is opaque, slow, and expensive. Manifest solves it with cryptography.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="glass-card glass-card-hover rounded-2xl p-6 space-y-4 border border-white/10"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${f.gradient} border ${f.border} shadow-md`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white">{f.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{f.description}</p>
              </motion.div>
            )
          })}
        </div>

        {/* Comparison Matrix */}
        <div className="max-w-4xl mx-auto rounded-2xl glass-card border border-white/10 overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-white/10 text-center">
            <h3 className="text-xl font-bold text-white">Legacy Freight Brokers vs. Manifest Protocol</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-surface-100/80">
                  <th className="p-4 font-semibold text-zinc-400 uppercase tracking-wider">Dimension</th>
                  <th className="p-4 font-semibold text-zinc-400 uppercase tracking-wider">Traditional Broker</th>
                  <th className="p-4 font-semibold text-emerald-400 uppercase tracking-wider">Manifest (Midnight ZK)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {comparisons.map((row) => (
                  <tr key={row.feature} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-semibold text-white">{row.feature}</td>
                    <td className="p-4 text-zinc-400 flex items-center gap-1.5">
                      <X className="h-4 w-4 text-red-400 flex-shrink-0" />
                      <span>{row.legacy}</span>
                    </td>
                    <td className="p-4 font-semibold text-emerald-300">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/20 text-emerald-300">
                        <Check className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                        {row.manifest}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}
