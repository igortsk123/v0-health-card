'use client'

import { AlertCircleIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
  className?: string
}

/**
 * Error state with optional retry action.
 * Services surface errors here — never raw try/catch in page components.
 */
export function ErrorState({
  message = 'Что-то пошло не так. Попробуйте ещё раз.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center gap-4 py-16 text-center px-4',
        className,
      )}
    >
      <AlertCircleIcon className="h-8 w-8 text-destructive" aria-hidden="true" />
      <p className="text-sm text-foreground max-w-xs leading-relaxed">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Попробовать снова
        </Button>
      )}
    </div>
  )
}
