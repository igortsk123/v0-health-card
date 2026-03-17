import { cn } from '@/lib/utils'

interface ProgressBarProps {
  step: number
  totalSteps: number
  className?: string
}

/**
 * Linear step progress indicator.
 * Displays as a segmented bar: completed steps are filled, remaining are muted.
 */
export function ProgressBar({ step, totalSteps, className }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (step / totalSteps) * 100))

  return (
    <div
      role="progressbar"
      aria-valuenow={step}
      aria-valuemin={0}
      aria-valuemax={totalSteps}
      aria-label={`Шаг ${step} из ${totalSteps}`}
      className={cn('w-full', className)}
    >
      <div className="flex gap-1">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors duration-300',
              i < step ? 'bg-primary' : 'bg-muted',
            )}
          />
        ))}
      </div>
      <span className="sr-only">
        Прогресс: шаг {step} из {totalSteps} ({Math.round(pct)}%)
      </span>
    </div>
  )
}
