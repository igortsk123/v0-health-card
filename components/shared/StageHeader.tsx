interface StageHeaderProps {
  title: string
  subtitle?: string
  step?: number
  totalSteps?: number
}

/**
 * Reusable heading block for each funnel stage.
 * Shows step indicator when step + totalSteps are provided.
 */
export function StageHeader({ title, subtitle, step, totalSteps }: StageHeaderProps) {
  const showStep = step !== undefined && totalSteps !== undefined

  return (
    <div className="flex flex-col gap-2 pb-2">
      {showStep && (
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
          Шаг {step} из {totalSteps}
        </span>
      )}
      <h1 className="text-2xl font-bold text-balance text-foreground leading-tight">
        {title}
      </h1>
      {subtitle && (
        <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
          {subtitle}
        </p>
      )}
    </div>
  )
}
