import { Check, Sparkles } from 'lucide-react'
import { motion } from 'motion/react'
import type { UploadStage } from '#/hooks/use-cv-upload'
import { cn } from '#/lib/utils'

const STEPS = [
  { id: 'uploading', label: 'Uploading', ai: false },
  { id: 'parsing', label: 'Parsing', ai: false },
  { id: 'structuring', label: 'Structuring', ai: true },
] as const

type BusyStage = Exclude<UploadStage, 'idle' | 'review'>

type UploadProgressProps = {
  stage: BusyStage
}

function stepIndex(stage: BusyStage) {
  return STEPS.findIndex(function findStep(step) {
    return step.id === stage
  })
}

export function UploadProgress({ stage }: UploadProgressProps) {
  const activeIndex = stepIndex(stage)

  function renderStep(step: (typeof STEPS)[number], index: number) {
    const done = index < activeIndex
    const active = index === activeIndex

    return (
      <motion.li
        key={step.id}
        layout
        className={cn(
          'flex items-center gap-3 rounded-xl border px-4 py-3',
          active && 'border-secondary/50 shadow-[var(--glow-ai)]',
          done && 'border-success/40',
          !active && !done && 'border-border opacity-60',
        )}
        animate={active ? { scale: 1.02 } : { scale: 1 }}
      >
        <span
          className={cn(
            'flex size-8 items-center justify-center rounded-full border',
            done && 'border-success text-success',
            active && 'border-secondary text-secondary',
          )}
        >
          {done ? <Check className="size-4" /> : null}
          {!done && step.ai ? <Sparkles className="size-4" /> : null}
          {!done && !step.ai ? (
            <span className="text-xs font-semibold">{index + 1}</span>
          ) : null}
        </span>
        <span className="text-sm font-medium">{step.label}</span>
        {active && step.ai ? (
          <span className="ai-shimmer ml-auto h-2 w-16 rounded-full" />
        ) : null}
      </motion.li>
    )
  }

  return (
    <ol className="space-y-3" aria-live="polite" aria-busy="true">
      {STEPS.map(renderStep)}
    </ol>
  )
}
