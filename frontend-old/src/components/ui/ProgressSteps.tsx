'use client'

interface Step {
  label: string
  description?: string
}

interface ProgressStepsProps {
  steps: Step[]
  currentStep: number
  /** 0-indexed step number */
}

export default function ProgressSteps({ steps, currentStep }: ProgressStepsProps) {
  return (
    <nav aria-label="Progress" className="mb-8">
      <ol className="flex items-center">
        {steps.map((step, index) => {
          const isComplete = index < currentStep
          const isCurrent = index === currentStep
          const isUpcoming = index > currentStep

          return (
            <li
              key={step.label}
              className={`relative flex items-center ${
                index < steps.length - 1 ? 'flex-1' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Step circle */}
                <div
                  className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                    isComplete
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                        ? 'bg-white text-black'
                        : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  {isComplete ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>

                {/* Step label */}
                <div className="hidden sm:block">
                  <p
                    className={`text-sm font-medium ${
                      isCurrent ? 'text-white' : isComplete ? 'text-emerald-400' : 'text-zinc-500'
                    }`}
                  >
                    {step.label}
                  </p>
                  {step.description && isCurrent && (
                    <p className="text-xs text-zinc-400">{step.description}</p>
                  )}
                </div>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={`ml-3 h-px flex-1 ${
                    isComplete ? 'bg-emerald-600' : 'bg-zinc-800'
                  }`}
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
