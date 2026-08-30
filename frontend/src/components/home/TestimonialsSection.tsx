'use client'

import { motion } from 'framer-motion'
import { Quote, Sparkles, Star } from 'lucide-react'

const testimonials = [
  {
    quote:
      'We saved 18% on our cross-country refrigerated lanes because carriers competed on real rates without predatory broker margins.',
    author: 'Sarah Chen',
    role: 'VP of Global Logistics',
    company: 'Pacific Fresh Supply',
    avatar: 'SC',
  },
  {
    quote:
      'As a carrier fleet owner, zero-knowledge bidding protects my margin. Competitors can never snipe my bid by $5 at the last second.',
    author: 'Marcus Johnson',
    role: 'Managing Director',
    company: 'Apex Midwest Haulers',
    avatar: 'MJ',
  },
  {
    quote:
      'The Midnight on-chain proof is undeniable. When partners ask for proof of fair rate settlement, we give them the cryptographic certificate.',
    author: 'Elena Rodriguez',
    role: 'Head of Procurement',
    company: 'Vanguard Freight Network',
    avatar: 'ER',
  },
]

export default function TestimonialsSection() {
  return (
    <section className="relative py-20 overflow-hidden">
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-100 border border-white/10 text-xs font-semibold text-zinc-300">
            <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
            Industry Trust & Adoption
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Built for Modern Shippers & Carrier Fleets
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto">
            See why logistics leaders are switching from legacy brokerages to zero-knowledge smart auctions.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.author}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-2xl glass-card glass-card-hover border border-white/10 p-6 sm:p-8 space-y-5 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <Quote className="h-6 w-6 text-emerald-400/40" />
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed italic">
                  "{t.quote}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 font-bold font-mono text-xs text-white shadow-md">
                  {t.avatar}
                </div>
                <div>
                  <div className="text-xs font-bold text-white">{t.author}</div>
                  <div className="text-[11px] text-zinc-400">
                    {t.role} • <span className="text-emerald-400">{t.company}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
