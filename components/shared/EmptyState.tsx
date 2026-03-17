import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  title?: string
  description?: string
  action?: ReactNode
  className?: string
}

/**
 * Empty result state — shown when a data list or section has no content.
 */
export function EmptyState({
  title = 'Ничего не найдено',
  description = 'Попробуйте повторить запрос или загрузить другой документ.',
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-16 text-center px-4',
        className,
      )}
    >
      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
        <span className="text-xl text-muted-foreground" aria-hidden="true">—</span>
      </div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">{description}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
