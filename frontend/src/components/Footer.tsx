'use client'

import { Link } from 'react-router-dom'
import { ShieldCheck, Cpu, ExternalLink, Code2, Sparkles } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-background/90 backdrop-blur-xl relative z-10">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
        <div className="grid gap-8 grid-cols-1 md:grid-cols-5">
          {/* Brand */}
          <div className="md:col-span-2 space-y-3">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 via-cyan-500 to-violet-600 shadow-md shadow-emerald-500/20">
                <span className="font-mono text-base font-bold text-white tracking-tighter">M</span>
              </div>
              <span className="font-mono text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                MANIFEST
                <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  ZK-v1
                </span>
              </span>
            </Link>
            <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
              The world’s first decentralized, zero-knowledge freight auction protocol. Cryptographically private bidding on the Midnight Network.
            </p>
          </div>

          {/* Nav Links */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Freight Portals</h4>
            <ul className="space-y-2 text-zinc-400">
              <li>
                <Link to="/shipper" className="hover:text-emerald-400 transition-colors">
                  Shipper Dashboard
                </Link>
              </li>
              <li>
                <Link to="/shipper/new" className="hover:text-emerald-400 transition-colors">
                  Post Freight Auction
                </Link>
              </li>
              <li>
                <Link to="/carrier" className="hover:text-cyan-400 transition-colors">
                  Browse Freight Board
                </Link>
              </li>
              <li>
                <Link to="/carrier/bids" className="hover:text-cyan-400 transition-colors">
                  Carrier Bids Portfolio
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Transparency</h4>
            <ul className="space-y-2 text-zinc-400">
              <li>
                <Link to="/audit" className="hover:text-violet-400 transition-colors">
                  Public ZK Verifier
                </Link>
              </li>
              <li>
                <a
                  href="https://explorer.1am.xyz"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-violet-400 transition-colors inline-flex items-center gap-1"
                >
                  <span>1AM Midnight Explorer</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://faucet.preview.midnight.network"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-violet-400 transition-colors inline-flex items-center gap-1"
                >
                  <span>Testnet NIGHT Faucet</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Ecosystem</h4>
            <ul className="space-y-2 text-zinc-400">
              <li>
                <a
                  href="https://github.com/PrinceDale99/MANIFEST"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  <Code2 className="h-3.5 w-3.5" />
                  <span>GitHub Repository</span>
                </a>
              </li>
              <li>
                <a
                  href="https://proof-server-whkk.onrender.com/health"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-emerald-400 transition-colors inline-flex items-center gap-1"
                >
                  <Cpu className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Render Proof Engine</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[11px] text-zinc-500 font-mono">
          <p>© 2026 MANIFEST Protocol. Fully open-source & decentralized.</p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
              <span>Midnight Preview Live</span>
            </div>
            <span className="text-zinc-600">•</span>
            <span>Compact ZK-v2.5</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
