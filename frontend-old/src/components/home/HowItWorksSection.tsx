'use client'

import { useState } from 'react'

const steps = [
  {
    number: '01',
    title: 'Shipper posts a tender',
    description: 'Describe what you need shipped — origin, destination, equipment type. The load details are hashed and stored on-chain.',
    icon: '📋',
    color: 'emerald',
    detail: 'Your load specs are never fully exposed. Only a cryptographic hash goes on the public ledger, keeping your cargo details private.',
  },
  {
    number: '02',
    title: 'Carriers submit sealed bids',
    description: 'Each carrier enters their rate. A mathematical seal (commitment) is created — no one can see the bid amount, not even the shipper.',
    icon: '🔒',
    color: 'cyan',
    detail: 'The bid amount is a private witness. Only the commitment hash (a one-way mathematical fingerprint) is stored on the blockchain.',
  },
  {
    number: '03',
    title: 'Reveal phase opens',
    description: 'After bidding closes, carriers prove their sealed bid matches what they actually submitted — without revealing the salt.',
    icon: '🔓',
    color: 'violet',
    detail: 'Using zero-knowledge proofs, carriers demonstrate they know the secret behind their commitment without exposing it to anyone.',
  },
  {
    number: '04',
    title: 'Lowest bid wins',
    description: 'The smart contract automatically selects the lowest valid bid. The winner is declared and the tender is settled.',
    icon: '🏆',
    color: 'amber',
    detail: 'Settlement is automatic and provably fair. Every step is recorded on-chain for public audit — no disputes possible.',
  },
]

const colorMap = {
  emerald: {
    bg: 'bg-emerald-900/20',
    border: 'border-emerald-800',
    text: 'text-emerald-400',
    glow: 'shadow-emerald-500/20',
    activeBg: 'bg-emerald-900/30',
  },
  cyan: {
    bg: 'bg-cyan-900/20',
    border: 'border-cyan-800',
    text: 'text-cyan-400',
    glow: 'shadow-cyan-500/20',
    activeBg: 'bg-cyan-900/30',
  },
  violet: {
    bg: 'bg-violet-900/20',
    border: 'border-violet-800',
    text: 'text-violet-400',
    glow: 'shadow-violet-500/20',
    activeBg: 'bg-violet-900/30',
  },
  amber: {
    bg: 'bg-amber-900/20',
    border: 'border-amber-800',
    text: 'text-amber-400',
    glow: 'shadow-amber-500/20',
    activeBg: 'bg-amber-900/30',
  },
}

export default function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0)

  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-900/30 to-zinc-950" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
            How Manifest works
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-zinc-400">
            Four simple steps. Fully private. Mathematically fair.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left: Step cards */}
          <div className="space-y-4">
            {steps.map((step, index) => {
              const colors = colorMap[step.color as keyof typeof colorMap]
              const isActive = index === activeStep

              return (
                <button
                  key={step.number}
                  onClick={() => setActiveStep(index)}
                  className={`w-full text-left rounded-xl border p-5 transition-all ${
                    isActive
                      ? `${colors.activeBg} ${colors.border} shadow-lg ${colors.glow}`
                      : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 hover:bg-zinc-900/50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-lg ${
                        isActive ? colors.bg : 'bg-zinc-800'
                      }`}
                    >
                      {step.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-mono text-xs ${colors.text}`}>{step.number}</span>
                        <h3 className={`text-base font-semibold ${isActive ? 'text-white' : 'text-zinc-300'}`}>
                          {step.title}
                        </h3>
                      </div>
                      <p className="text-sm text-zinc-400">{step.description}</p>
                    </div>
                    <svg
                      className={`h-5 w-5 flex-shrink-0 transition-transform ${isActive ? 'rotate-90' : ''} ${colors.text}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Right: Detail panel */}
          <div className="relative">
            <div className="sticky top-24 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8">
              {/* Step visual */}
              <div className="mb-6 flex items-center gap-4">
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-2xl text-3xl ${
                    colorMap[steps[activeStep].color as keyof typeof colorMap].bg
                  }`}
                >
                  {steps[activeStep].icon}
                </div>
                <div>
                  <span className={`font-mono text-sm ${colorMap[steps[activeStep].color as keyof typeof colorMap].text}`}>
                    Step {steps[activeStep].number}
                  </span>
                  <h3 className="text-xl font-bold text-white">{steps[activeStep].title}</h3>
                </div>
              </div>

              {/* Description */}
              <p className="mb-6 text-zinc-400">{steps[activeStep].description}</p>

              {/* Technical detail */}
              <div className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-4">
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Under the hood
                </h4>
                <p className="text-sm text-zinc-300">{steps[activeStep].detail}</p>
              </div>

              {/* Progress indicator */}
              <div className="mt-6 flex gap-2">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      index <= activeStep
                        ? colorMap[steps[activeStep].color as keyof typeof colorMap].text.replace('text-', 'bg-')
                        : 'bg-zinc-800'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
