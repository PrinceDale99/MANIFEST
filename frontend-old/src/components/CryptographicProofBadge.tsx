'use client'

interface CryptographicProofBadgeProps {
  proofHash: string
  explorerUrl?: string
  verified?: boolean
}

export default function CryptographicProofBadge({
  proofHash,
  explorerUrl,
  verified = true,
}: CryptographicProofBadgeProps) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800/50 px-3 py-1.5">
      {/* Verification Icon */}
      <div
        className={`flex h-4 w-4 items-center justify-center rounded-full ${
          verified ? 'bg-emerald-900/50' : 'bg-zinc-700'
        }`}
      >
        {verified ? (
          <svg
            className="h-2.5 w-2.5 text-emerald-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        ) : (
          <svg
            className="h-2.5 w-2.5 text-zinc-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        )}
      </div>

      {/* Label */}
      <span className="text-[11px] font-medium text-zinc-400">
        {verified ? 'ZK Verified' : 'Pending'}
      </span>

      {/* Hash */}
      <span className="font-mono text-[10px] text-zinc-500">
        {proofHash.slice(0, 8)}...{proofHash.slice(-4)}
      </span>

      {/* Explorer Link */}
      {explorerUrl && verified && (
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-cyan-400 transition-colors hover:text-cyan-300"
        >
          Explorer →
        </a>
      )}
    </div>
  )
}
