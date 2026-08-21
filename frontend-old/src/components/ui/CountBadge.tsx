'use client'

interface CountBadgeProps {
  value: number | string
  label: string
  color?: 'emerald' | 'amber' | 'zinc' | 'indigo'
}

export default function CountBadge({ value, label, color = 'zinc' }: CountBadgeProps) {
  const colors = {
    emerald: 'border-emerald-800 bg-emerald-900/30 text-emerald-300',
    amber: 'border-amber-800 bg-amber-900/30 text-amber-300',
    zinc: 'border-zinc-700 bg-zinc-800/50 text-zinc-300',
    indigo: 'border-indigo-800 bg-indigo-900/30 text-indigo-300',
  }

  return (
    <div className={`rounded-lg border px-3 py-2 ${colors[color]}`}>
      <p className="font-mono text-lg font-bold">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-zinc-400">{label}</p>
    </div>
  )
}
