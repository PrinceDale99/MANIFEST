'use client'

const footerLinks = {
  Product: [
    { label: 'Post a Tender', href: '/shipper' },
    { label: 'Find Auctions', href: '/carrier' },
    { label: 'Verify Auctions', href: '/audit' },
    { label: 'Documentation', href: '#' },
  ],
  Resources: [
    { label: 'How It Works', href: '#' },
    { label: 'API Docs', href: '#' },
    { label: 'Smart Contract', href: '#' },
    { label: 'Whitepaper', href: '#' },
  ],
  Community: [
    { label: 'GitHub', href: 'https://github.com/PrinceDale99/MANIFEST' },
    { label: 'Discord', href: '#' },
    { label: 'Twitter', href: '#' },
    { label: 'Blog', href: '#' },
  ],
  Legal: [
    { label: 'Privacy', href: '#' },
    { label: 'Terms', href: '#' },
    { label: 'License', href: '#' },
  ],
}

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-5">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500">
                <span className="text-sm font-bold text-white">M</span>
              </div>
              <span className="font-mono text-lg font-semibold text-white">Manifest</span>
            </div>
            <p className="text-sm text-zinc-500">
              Private freight auctions. Fair results. No middlemen.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="mb-4 text-sm font-semibold text-white">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-zinc-500 transition-colors hover:text-zinc-300"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-zinc-800 pt-8 sm:flex-row">
          <p className="text-xs text-zinc-500">
            © 2026 Manifest. Built on Midnight.
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 text-xs text-zinc-500">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Network Online
            </span>
            <span className="font-mono text-xs text-zinc-600">v0.1.0</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
