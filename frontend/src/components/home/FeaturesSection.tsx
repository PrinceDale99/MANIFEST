'use client'

const features = [
  {
    icon: '🔐',
    title: 'Sealed bids',
    description: 'Carriers submit bids that are mathematically sealed. No one — not even the platform — can see the bid amount until the reveal phase.',
    color: 'emerald',
  },
  {
    icon: '🧮',
    title: 'Zero-knowledge proofs',
    description: 'Carriers prove their bid is valid without revealing the actual amount. The math guarantees honesty without sacrificing privacy.',
    color: 'cyan',
  },
  {
    icon: '⛓️',
    title: 'On-chain settlement',
    description: 'The smart contract automatically picks the lowest valid bid. No human intervention, no disputes, no manipulation.',
    color: 'violet',
  },
  {
    icon: '🔍',
    title: 'Public audit trail',
    description: 'Every auction step is recorded on the public ledger. Anyone can verify the auction was fair — without seeing private data.',
    color: 'amber',
  },
  {
    icon: '⚡',
    title: 'Instant finality',
    description: 'Once settled, the result is final. No chargebacks, no renegotiation, no middlemen taking a cut.',
    color: 'emerald',
  },
  {
    icon: '🛡️',
    title: 'Sybil resistant',
    description: 'Each carrier is tied to a unique cryptographic identity. One wallet, one bid — no fake accounts or ballot stuffing.',
    color: 'cyan',
  },
]

const comparisons = [
  { feature: 'Bid privacy', traditional: '❌ Visible to everyone', manifest: '✅ Sealed until reveal' },
  { feature: 'Fairness guarantee', traditional: '❌ Trust the platform', manifest: '✅ Mathematical proof' },
  { feature: 'Middleman fees', traditional: '❌ 5-15% cut', manifest: '✅ Zero platform fees' },
  { feature: 'Dispute resolution', traditional: '❌ Manual, slow', manifest: '✅ Automatic, instant' },
  { feature: 'Audit capability', traditional: '❌ Platform controls data', manifest: '✅ Public blockchain' },
  { feature: 'Data ownership', traditional: '❌ Platform owns your data', manifest: '✅ You own everything' },
]

export default function FeaturesSection() {
  return (
    <section className="relative py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-900/20 to-zinc-950" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
            Why Manifest is different
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-zinc-400">
            Traditional freight bidding is broken. Manifest fixes it with math, not trust.
          </p>
        </div>

        {/* Feature cards */}
        <div className="mb-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all hover:border-zinc-700 hover-glow"
            >
              <div className="mb-4 text-3xl">{feature.icon}</div>
              <h3 className="mb-2 text-lg font-semibold text-white">{feature.title}</h3>
              <p className="text-sm text-zinc-400">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Comparison table */}
        <div className="mx-auto max-w-4xl">
          <h3 className="mb-8 text-center text-2xl font-bold text-white">
            Old way vs. Manifest
          </h3>

          <div className="overflow-hidden rounded-xl border border-zinc-800">
            {/* Header */}
            <div className="grid grid-cols-3 border-b border-zinc-800 bg-zinc-900/80">
              <div className="p-4 text-sm font-medium text-zinc-400">Feature</div>
              <div className="p-4 text-center text-sm font-medium text-zinc-400">Traditional</div>
              <div className="p-4 text-center text-sm font-medium text-emerald-400">Manifest</div>
            </div>

            {/* Rows */}
            {comparisons.map((row, index) => (
              <div
                key={row.feature}
                className={`grid grid-cols-3 ${
                  index < comparisons.length - 1 ? 'border-b border-zinc-800' : ''
                }`}
              >
                <div className="p-4 text-sm text-white font-medium">{row.feature}</div>
                <div className="p-4 text-center text-sm text-zinc-500">{row.traditional}</div>
                <div className="p-4 text-center text-sm text-emerald-400 font-medium">{row.manifest}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
