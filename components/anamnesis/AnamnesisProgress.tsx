import { cn } from '@/lib/utils'
import type { AnamnesisProgressDTO } from '@/types/anamnesis.types'

interface AnamnesisProgressProps {
  progress: AnamnesisProgressDTO
  className?: string
}

/**
 * Thin continuous progress bar for the anamnesis flow.
 * Width = currentStep / estimatedTotal, capped at 95% until navigation.
 * Renders on top of the question area, inside the page's sticky header zone.
 */
export function AnamnesisProgress({ progress, className }: AnamnesisProgressProps) {
  const { currentStep, estimatedTotal } = progress
  // Cap at 95% to keep the bar visually "in progress" while the final answer
  // is submitted — the page navigates away before the bar could reach 100%.
  const pct = Math.min(95, Math.max(2, (currentStep / estimatedTotal) * 100))

  return (
    <div
      role="progressbar"
      aria-valuenow={currentStep}
      aria-valuemin={0}
      aria-valuemax={estimatedTotal}
      aria-label={`Вопрос ${currentStep} из примерно ${estimatedTotal}`}
      className={cn('w-full', className)}
    >
      <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Вопрос {currentStep} из ~{estimatedTotal}
      </p>
    </div>
  )
}
