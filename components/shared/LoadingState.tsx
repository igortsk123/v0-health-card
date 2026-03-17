import { Loader2Icon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingStateProps {
  message?: string
  className?: string
}

/**
 * Centered loading spinner with an optional contextual message.
 * Use for all async transitions between funnel stages.
 */
export function LoadingState({
  message = 'Загружаем данные...',
  className,
}: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-label={message}
      className={cn(
        'flex flex-col items-center justify-center gap-4 py-16 text-center',
        className,
      )}
    >
      <Loader2Icon className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}
