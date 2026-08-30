'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  DollarSign,
  TrendingDown,
  Calculator,
  ShieldCheck,
  CheckCircle,
  Truck,
  Sparkles,
  ArrowRight
} from 'lucide-react'
import { Link } from 'react-router-dom'
import AnimatedCounter from '@/components/ui/AnimatedCounter'

export default function StatsSection() {
  const [annualSpend, setAnnualSpend] = useState(500000)
  const legacyBrokerCut = Math.round(annualSpend * 0.18) // ~18% traditional broker commission
  const manifestNetworkFee = Math.round(annualSpend * 0.0005) // < 0.05%
  const annualSavings = legacyBrokerCut - manifestNetworkFee

  return (
    <section className="relative py-20 overflow-hidden">
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Metric Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="glass-card glass-card-hover rounded-2xl p-6 space-y-2 border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400 font-medium">Settled Freight</span>
              <DollarSign className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-white">
              $<AnimatedCounter target={18.4} decimals={1} suffix="M" />
            </div>
            <p className="text-[11px] text-zinc-400">Zero-leakage auction volume</p>
          </div>

          <div className="glass-card glass-card-hover rounded-2xl p-6 space-y-2 border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400 font-medium">Proofs Generated</span>
              <Sparkles className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-cyan-300">
              <AnimatedCounter target={8920} suffix="+" />
            </div>
            <p className="text-[11px] text-zinc-400">ZK circuits solved & verified</p>
          </div>

          <div className="glass-card glass-card-hover rounded-2xl p-6 space-y-2 border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400 font-medium">Broker Fee Cut</span>
              <TrendingDown className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-400">
              0.0%
            </div>
            <p className="text-[11px] text-zinc-400">100% value to shippers & carriers</p>
          </div>

          <div className="glass-card glass-card-hover rounded-2xl p-6 space-y-2 border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400 font-medium">Network Finality</span>
              <ShieldCheck className="h-4 w-4 text-violet-400" />
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-violet-300">
              &lt; 2.5s
            </div>
            <p className="text-[11px] text-zinc-400">Substrate block confirmation</p>
          </div>
        </div>

        {/* Interactive Savings Calculator */}
        <div className="rounded-3xl glass-card border border-white/10 p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left: Interactive Slider */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
                  <Calculator className="h-3.5 w-3.5" />
                  Interactive ROI Calculator
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Calculate Your Disintermediation Savings
                </h3>
                <p className="text-sm text-zinc-400">
                  Traditional logistics brokers extract 15% to 22% on every load. Manifest eliminates middlemen using automated smart contracts.
                </p>
              </div>

              <div className="space-y-3 p-5 rounded-2xl bg-surface-100/90 border border-white/5">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-300 font-medium">Your Annual Freight Spend:</span>
                  <span className="font-mono text-xl font-bold text-white">
                    ${annualSpend.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="50000"
                  max="5000000"
                  step="25000"
                  value={annualSpend}
                  onChange={(e) => setAnnualSpend(Number(e.target.value))}
                  className="w-full h-2.5 bg-surface-300 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-[11px] font-mono text-zinc-500">
                  <span>$50k / yr</span>
                  <span>$2.5M / yr</span>
                  <span>$5.0M / yr</span>
                </div>
              </div>
            </div>

            {/* Right: Calculated Savings Card */}
            <div className="lg:col-span-5 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-surface-100 to-surface-200 border border-emerald-500/30 space-y-6 shadow-xl relative">
              <div className="space-y-1">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Estimated Annual Savings
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold font-mono text-white">
                  +${annualSavings.toLocaleString()}
                </div>
                <div className="text-xs text-zinc-400">
                  Direct capital retained by shipper & carrier
                </div>
              </div>

              <div className="space-y-2.5 pt-4 border-t border-white/10 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Legacy Broker Margin (18% avg):</span>
                  <span className="font-mono text-red-400">-${legacyBrokerCut.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Manifest On-Chain Network Gas:</span>
                  <span className="font-mono text-emerald-400">&lt; ${manifestNetworkFee.toLocaleString()}</span>
                </div>
              </div>

              <Link
                to="/shipper/new"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-all shadow-lg shadow-emerald-500/20 hover:scale-[1.02]"
              >
                Start Saving on Your Next Load
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
