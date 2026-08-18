'use client'

import { ProofStage, PROOF_STAGE_CONFIG } from '@/types/manifest'

interface ProofProgressProps {
  currentStage: ProofStage
  error?: string | null
}

const STAGES = [
  ProofStage.WITNESS_EVALUATION,
  ProofStage.CIRCUIT_COMPILATION,
  ProofStage.PROOF_GENERATION,
  ProofStage.LEDGER_SUBMISSION,
]

export default function ProofProgress({
  currentStage,
  error,
}: ProofProgressProps) {
  const getStageStatus = (stage: ProofStage) => {
    if (currentStage === ProofStage.FAILED) return 'failed'
    if (currentStage === ProofStage.COMPLETE) return 'complete'
    if (stage < currentStage) return 'complete'
    if (stage === currentStage) return 'active'
    return 'pending'
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">
          Proof Generation
        </h3>
        <span
          className={`font-mono text-xs ${
            currentStage === ProofStage.FAILED
              ? 'text-red-400'
              : currentStage === ProofStage.COMPLETE
                ? 'text-emerald-400'
                : 'text-amber-400'
          }`}
        >
          {PROOF_STAGE_CONFIG[currentStage].label}
        </span>
      </div>

      {/* Stage Steps */}
      <div className="space-y-3">
        {STAGES.map((stage, index) => {
          const status = getStageStatus(stage)
          const config = PROOF_STAGE_CONFIG[stage]

          return (
            <div key={stage} className="flex items-center gap-3">
              {/* Step Number / Indicator */}
              <div
                className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  status === 'complete'
                    ? 'bg-emerald-900/50 text-emerald-400'
                    : status === 'active'
                      ? 'bg-amber-900/50 text-amber-400'
                      : status === 'failed'
                        ? 'bg-red-900/50 text-red-400'
                        : 'bg-zinc-800 text-zinc-500'
                }`}
              >
                {status === 'complete' ? (
                  <svg
                    className="h-3.5 w-3.5"
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
                ) : status === 'active' ? (
                  <div className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
                ) : (
                  index + 1
                )}
              </div>

              {/* Label & Description */}
              <div className="flex-1">
                <p
                  className={`text-sm font-medium ${
                    status === 'active'
                      ? 'text-white'
                      : status === 'complete'
                        ? 'text-zinc-300'
                        : 'text-zinc-500'
                  }`}
                >
                  {config.label}
                </p>
                {status === 'active' && (
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {config.description}
                  </p>
                )}
              </div>

              {/* Connector line */}
              {index < STAGES.length - 1 && (
                <div className="absolute ml-3.5 mt-10 h-4 w-px bg-zinc-800" />
              )}
            </div>
          )
        })}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-4 rounded-lg border border-red-900/50 bg-red-900/20 p-3">
          <p className="font-mono text-xs text-red-400">{error}</p>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mt-4 h-1 overflow-hidden rounded-full bg-zinc-800">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            currentStage === ProofStage.FAILED
              ? 'bg-red-500'
              : currentStage === ProofStage.COMPLETE
                ? 'bg-emerald-500'
                : 'bg-gradient-to-r from-amber-500 to-amber-400'
          }`}
          style={{
            width:
              currentStage === ProofStage.FAILED
                ? '100%'
                : `${(currentStage / ProofStage.COMPLETE) * 100}%`,
          }}
        />
      </div>
    </div>
  )
}
