import { AlertTriangleIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { WARNING_CTA } from '@/lib/constants'

interface WarningBlockProps {
  header?: string
  body?: string
  className?: string
}

/**
 * Red-flag / urgency block — used when markers require attention.
 * Wording is deliberately calm and non-alarmist per product rules.
 */
export function WarningBlock({
  header = 'На что стоит обратить внимание',
  body = WARNING_CTA,
  className,
}: WarningBlockProps) {
  return (
    <aside
      role="note"
      aria-label="Предупреждение"
      className={cn(
        'flex gap-3 rounded-lg border border-warning/40 bg-warning-bg p-4',
        className,
      )}
    >
      <AlertTriangleIcon
        className="mt-0.5 h-4 w-4 flex-shrink-0 text-warning"
        aria-hidden="true"
      />
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-warning-foreground">{header}</p>
        <p className="text-xs leading-relaxed text-warning-foreground/80">{body}</p>
      </div>
    </aside>
  )
}
