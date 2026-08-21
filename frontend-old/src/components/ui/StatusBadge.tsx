'use client'

import { TenderStatus, TENDER_STATUS_CONFIG } from '@/types/manifest'

interface StatusBadgeProps {
  status: TenderStatus
  size?: 'sm' | 'md'
}

export default function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const config = TENDER_STATUS_CONFIG[status]

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold uppercase tracking-wider ${
        size === 'sm' ? 'px-2.5 py-0.5 text-[10px]' : 'px-3 py-1 text-[11px]'
      } ${config.bgColor} ${config.color}`}
    >
      {config.label}
    </span>
  )
}
