'use client'

import { AppShell } from '@/components/shared/AppShell'
import { ErrorState } from '@/components/shared/ErrorState'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: ErrorPageProps) {
  return (
    <AppShell>
      <main className="flex flex-col items-center justify-center px-4 py-24 max-w-md mx-auto w-full">
        <ErrorState
          message={
            error.message
              ? `Произошла ошибка: ${error.message}`
              : 'Произошла непредвиденная ошибка. Попробуйте обновить страницу.'
          }
          onRetry={reset}
        />
      </main>
    </AppShell>
  )
}
