'use client'

import { Link } from 'react-router-dom'
import { ArrowRight, PackageOpen } from 'lucide-react'

interface EmptyStateProps {
  icon?: string
  title: string
  description: string
  action?: {
    label: string
    href: string
  }
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-3xl glass-card border border-white/10 p-12 text-center space-y-4 shadow-xl">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-200 border border-white/10 text-emerald-400 mx-auto">
        <PackageOpen className="h-8 w-8 text-emerald-400" />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-white">{title}</h3>
        <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">{description}</p>
      </div>
      {action && (
        <div className="pt-2">
          <Link
            to={action.href}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs shadow-md transition-all hover:scale-105"
          >
            {action.label}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </div>
  )
}
