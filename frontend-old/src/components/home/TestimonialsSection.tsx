'use client'

const testimonials = [
  {
    quote: "We saved 18% on our last lane because carriers competed fairly. No one could undercut during the bidding — they had to put their best price forward.",
    author: "Sarah Chen",
    role: "VP of Procurement",
    company: "Pacific Freight Co.",
    avatar: "SC",
  },
  {
    quote: "As a carrier, I love that my competitors can't see my bids. It means I can offer my real best price without worrying about being undercut by a penny.",
    author: "Marcus Johnson",
    role: "Fleet Manager",
    company: "Midnight Express",
    avatar: "MJ",
  },
  {
    quote: "The audit trail is a game changer. When a shipper questioned our fairness, we just pointed them to the blockchain. The math doesn't lie.",
    author: "Elena Rodriguez",
    role: "Compliance Director",
    company: "ChainLink Logistics",
    avatar: "ER",
  },
]

const logos = [
  { name: 'Pacific Freight', width: 'w-24' },
  { name: 'Midnight Express', width: 'w-28' },
  { name: 'ChainLink', width: 'w-20' },
  { name: 'SwiftHaul', width: 'w-24' },
  { name: 'CargoNet', width: 'w-22' },
]

export default function TestimonialsSection() {
  return (
    <section className="relative py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-900/40 to-zinc-950" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
            Loved by shippers and carriers
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-zinc-400">
            Real feedback from companies using Manifest for their freight auctions.
          </p>
        </div>

        {/* Testimonial cards */}
        <div className="mb-16 grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.author}
              className="group relative rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all hover:border-zinc-700"
            >
              {/* Quote icon */}
              <div className="mb-4 text-3xl text-emerald-500/30">"</div>

              {/* Quote */}
              <p className="mb-6 text-sm leading-relaxed text-zinc-300">
                {testimonial.quote}
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 text-xs font-bold text-white">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{testimonial.author}</p>
                  <p className="text-xs text-zinc-500">
                    {testimonial.role} · {testimonial.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust logos */}
        <div className="border-t border-zinc-800 pt-12">
          <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-zinc-500">
            Trusted by leading freight companies
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {logos.map((logo) => (
              <div
                key={logo.name}
                className="flex items-center gap-2 text-zinc-600 transition-colors hover:text-zinc-400"
              >
                <div className="h-8 w-8 rounded-lg bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500">
                  {logo.name[0]}
                </div>
                <span className="font-mono text-sm">{logo.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
