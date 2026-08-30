'use client'

import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Package, Truck, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react'

export default function CTASection() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Dynamic ambient gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/20 via-background to-cyan-950/20 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
          <Sparkles className="h-3.5 w-3.5" />
          Deploying Next-Gen Logistics Infrastructure
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Ready for Fair, Private Freight Bidding?
        </h2>

        <p className="max-w-2xl mx-auto text-sm sm:text-base text-zinc-400 leading-relaxed">
          Join shippers and carriers eliminating middlemen margins with zero-knowledge cryptography on the Midnight Network.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            to="/shipper/new"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-400 hover:from-emerald-400 hover:to-cyan-300 text-black font-bold text-sm shadow-xl shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95"
          >
            <Package className="h-4 w-4 text-black" />
            Post Your First Tender
            <ArrowRight className="h-4 w-4 text-black" />
          </Link>

          <Link
            to="/carrier"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl glass-card hover:bg-surface-200 border border-white/10 hover:border-cyan-500/30 text-white font-semibold text-sm transition-all hover:scale-105 active:scale-95"
          >
            <Truck className="h-4 w-4 text-cyan-400" />
            Browse Freight Board
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-zinc-500 font-mono">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Zero Sign-up Fees</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Non-Custodial Escrow</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>100% Cryptographic Secrecy</span>
          </div>
        </div>
      </div>
    </section>
  )
}
