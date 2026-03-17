import { InfoIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DisclaimerBlockProps {
  text?: string
  className?: string
}

const DEFAULT_TEXT =
  'Это информационная поддержка, а не медицинское заключение. ' +
  'Результаты не заменяют консультацию лечащего врача.'

/**
 * Standard medical disclaimer block.
 * Must be shown on every screen containing medical content.
 */
export function DisclaimerBlock({ text = DEFAULT_TEXT, className }: DisclaimerBlockProps) {
  return (
    <aside
      role="note"
      aria-label="Информационный дисклеймер"
      className={cn(
        'flex gap-3 rounded-lg border border-border bg-muted/60 p-4',
        className,
      )}
    >
      <InfoIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" aria-hidden="true" />
      <p className="text-xs leading-relaxed text-muted-foreground">{text}</p>
    </aside>
  )
}
