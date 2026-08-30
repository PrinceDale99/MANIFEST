'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Lock,
  Eye,
  Trophy,
  ArrowRight,
  ShieldCheck,
  Cpu,
  CheckCircle2,
  Sparkles
} from 'lucide-react'

const steps = [
  {
    number: '01',
    title: 'Shipper Posts a Tender',
    description: 'Enter origin, destination, cargo specifications, and auction window. The load details are hashed into a 32-byte load commitment.',
    icon: FileText,
    color: 'emerald',
    gradient: 'from-emerald-500 to-teal-600',
    detail: 'Your load specifications are never publicly leaked. Only a cryptographic hash goes onto the public ledger, protecting shipper confidentiality.',
    circuitName: 'openBidding()',
  },
  {
    number: '02',
    title: 'Carriers Submit Sealed Bids',
    description: 'Each carrier generates a private bid along with a random 256-bit salt. A cryptographic commitment H(bid, salt) is recorded on-chain.',
    icon: Lock,
    color: 'cyan',
    gradient: 'from-cyan-500 to-blue-600',
    detail: 'The bid amount is a private zero-knowledge witness. Neither competitor carriers nor the shipper can view the rate during the bidding window.',
    circuitName: 'submitBidCommitment()',
  },
  {
    number: '03',
    title: 'Reveal Phase Opens',
    description: 'When bidding concludes, carriers execute a ZK proof to disclose their rate and prove it matches the initial sealed commitment.',
    icon: Eye,
    color: 'violet',
    gradient: 'from-violet-500 to-purple-600',
    detail: 'Zero-knowledge proofs mathematically verify that the revealed bid is genuine and hasn’t been altered after seeing other submissions.',
    circuitName: 'revealBid()',
  },
  {
    number: '04',
    title: 'Instant Fair Settlement',
    description: 'The smart contract verifies all revealed bids, automatically selects the lowest qualified carrier, and declares the winner.',
    icon: Trophy,
    color: 'amber',
    gradient: 'from-amber-500 to-yellow-600',
    detail: 'Winner selection is deterministic and verifiable by anyone on the public Midnight Preview blockchain with 0% broker fee cuts.',
    circuitName: 'settleTender()',
  },
]

export default function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0)
  const current = steps[activeStep]
  const CurrentIcon = current.icon

  return (
    <section className="relative py-20 overflow-hidden">
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-100 border border-white/10 text-xs font-semibold text-zinc-300">
            <Cpu className="h-3.5 w-3.5 text-cyan-400" />
            Decentralized Protocol Architecture
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            How Zero-Knowledge Freight Works
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto">
            Four simple phases. Zero data leaks. 100% mathematical integrity on Midnight.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-12 items-start">
          {/* Left: Step selectors (7 cols) */}
          <div className="lg:col-span-7 space-y-3.5">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = index === activeStep

              return (
                <motion.button
                  key={step.number}
                  onClick={() => setActiveStep(index)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`w-full text-left rounded-2xl p-5 transition-all border ${
                    isActive
                      ? 'glass-card border-emerald-500/40 shadow-xl shadow-emerald-500/10 bg-surface-100/90'
                      : 'border-white/5 bg-surface-100/40 hover:bg-surface-100/80 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${
                        step.gradient
                      } text-white shadow-md`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-emerald-400">PHASE {step.number}</span>
                          <span className="text-zinc-600">•</span>
                          <span className="font-mono text-[11px] text-zinc-400">{step.circuitName}</span>
                        </div>
                        {isActive && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Active
                          </span>
                        )}
                      </div>
                      <h3 className={`text-base font-bold ${isActive ? 'text-white' : 'text-zinc-300'}`}>
                        {step.title}
                      </h3>
                      <p className="text-xs text-zinc-400 leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </motion.button>
              )
            })}
          </div>

          {/* Right: Technical Inspector (5 cols) */}
          <div className="lg:col-span-5 sticky top-24">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="rounded-2xl glass-card border border-white/10 p-6 md:p-8 space-y-6 shadow-2xl"
              >
                {/* Header with Circuit Icon */}
                <div className="flex items-center gap-4 border-b border-white/10 pb-5">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${current.gradient} text-white shadow-lg`}>
                    <CurrentIcon className="h-7 w-7" />
                  </div>
                  <div>
                    <div className="font-mono text-xs font-bold text-emerald-400">PHASE {current.number} SPECIFICATION</div>
                    <h3 className="text-lg font-bold text-white">{current.title}</h3>
                  </div>
                </div>

                {/* Circuit Details */}
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-surface-100 border border-white/5 space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
                      <span>On-Chain Compact Circuit</span>
                      <span className="font-mono text-emerald-400 font-semibold">{current.circuitName}</span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">{current.detail}</p>
                  </div>
                </div>

                {/* Cryptographic Guarantees */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Cryptographic Guarantees
                  </div>
                  <div className="grid grid-cols-1 gap-2 text-xs text-zinc-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                      <span>Zero front-running & snipe-proof</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                      <span>Automated lowest-bid contract verification</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-violet-400 flex-shrink-0" />
                      <span>Publicly audit-ready on Midnight Ledger</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
