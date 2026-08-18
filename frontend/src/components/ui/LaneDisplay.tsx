'use client'

interface LaneDisplayProps {
  origin: string
  destination: string
  size?: 'sm' | 'md' | 'lg'
}

export default function LaneDisplay({ origin, destination, size = 'md' }: LaneDisplayProps) {
  const textSize = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  }[size]

  return (
    <div className="flex items-center gap-3">
      <span className={`font-semibold text-white ${textSize}`}>{origin || '—'}</span>
      <div className="flex items-center gap-1 text-zinc-600">
        <div className="h-px w-4 bg-zinc-700" />
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
        <div className="h-px w-4 bg-zinc-700" />
      </div>
      <span className={`font-semibold text-white ${textSize}`}>{destination || '—'}</span>
    </div>
  )
}
