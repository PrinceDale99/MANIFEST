'use client'

import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  ShieldCheck,
  Truck,
  Package,
  Lock,
  ArrowRight,
  Sparkles,
  Zap,
  CheckCircle2,
  TrendingDown
} from 'lucide-react'
import RouteMapVisualizer from '@/components/ui/RouteMapVisualizer'
import ZkVisualizer from '@/components/ui/ZkVisualizer'

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-8 pb-20 md:py-24">
      {/* Dynamic Ambient Background Light Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-emerald-500/10 via-cyan-500/10 to-violet-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Top Hero Grid: Headline + Route Map Visualizer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left: Copy & Actions */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Live Midnight Badge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card border border-emerald-500/30 text-emerald-300 text-xs font-semibold shadow-lg shadow-emerald-500/10"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>Zero-Knowledge Proofs on Midnight Network</span>
              <span className="text-zinc-500">|</span>
              <span className="text-zinc-400 font-mono">v1.0 Preview</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]"
            >
              The future of <br />
              <span className="animate-gradient-text">freight bidding</span> <br />
              is completely private.
            </motion.h1>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-zinc-300 max-w-xl leading-relaxed"
            >
              Fair, tamper-proof freight auctions secured by zero-knowledge cryptography. Carriers bid privately without bid leaks. Shippers get competitive market rates with zero broker margin.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2"
            >
              <Link
                to="/shipper/new"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-400 hover:from-emerald-400 hover:to-cyan-300 text-black font-bold text-sm shadow-xl shadow-emerald-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Package className="h-4 w-4 text-black" />
                Post a Freight Tender
                <ArrowRight className="h-4 w-4 text-black" />
              </Link>

              <Link
                to="/carrier"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl glass-card hover:bg-surface-200 border border-white/10 hover:border-emerald-500/30 text-white font-semibold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Truck className="h-4 w-4 text-cyan-400" />
                Browse Open Auctions
              </Link>
            </motion.div>

            {/* Value Props Pills */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="grid grid-cols-3 gap-3 pt-4 border-t border-white/10"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <TrendingDown className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Broker Margins</span>
                </div>
                <div className="text-lg font-bold font-mono text-white">0.0%</div>
                <div className="text-[10px] text-zinc-500">vs 15-22% legacy</div>
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <Lock className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Bid Secrecy</span>
                </div>
                <div className="text-lg font-bold font-mono text-cyan-400">100% ZK</div>
                <div className="text-[10px] text-zinc-500">Proof on Midnight</div>
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <Zap className="h-3.5 w-3.5 text-violet-400" />
                  <span>Settlement</span>
                </div>
                <div className="text-lg font-bold font-mono text-emerald-400">&lt; 3s</div>
                <div className="text-[10px] text-zinc-500">Instant on-chain</div>
              </div>
            </motion.div>
          </div>

          {/* Right: Live Encrypted Freight Route Map */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-5"
          >
            <RouteMapVisualizer />
          </motion.div>
        </div>

        {/* Live Zero-Knowledge Commitment Interactive Simulator */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <ZkVisualizer />
        </motion.div>
      </div>
    </section>
  )
}
