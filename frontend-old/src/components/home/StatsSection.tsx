'use client'

import AnimatedCounter from '@/components/ui/AnimatedCounter'

const stats = [
  {
    value: 2847,
    prefix: '',
    suffix: '',
    label: 'Tenders Completed',
    description: 'Freight auctions settled on-chain',
    icon: '📦',
  },
  {
    value: 12.4,
    prefix: '$',
    suffix: 'M',
    label: 'Freight Moved',
    description: 'Total value of sealed bids',
    icon: '💰',
  },
  {
    value: 99,
    prefix: '',
    suffix: '.9%',
    label: 'Fairness Score',
    description: 'Cryptographic proof of fair auctions',
    icon: '⚖️',
  },
  {
    value: 340,
    prefix: '',
    suffix: '+',
    label: 'Carriers',
    description: 'Active carriers on the network',
    icon: '🚛',
  },
]

export default function StatsSection() {
  return (
    <section className="relative py-24">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-900/50 to-zinc-950" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
            Trusted by the freight industry
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-zinc-400">
            Real numbers from the Midnight Network. Every auction is
            cryptographically verifiable.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all hover:border-zinc-700 hover-glow"
            >
              {/* Icon */}
              <div className="mb-4 text-3xl">{stat.icon}</div>

              {/* Value */}
              <div className="mb-1 text-3xl font-bold text-white sm:text-4xl">
                <AnimatedCounter
                  target={stat.value}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  decimals={stat.value % 1 !== 0 ? 1 : 0}
                />
              </div>

              {/* Label */}
              <p className="mb-1 text-sm font-medium text-zinc-300">{stat.label}</p>
              <p className="text-xs text-zinc-500">{stat.description}</p>

              {/* Hover glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
