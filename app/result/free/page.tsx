'use client'
// app/result/free/page.tsx
// Step 2 result: shows free markers, summary, warning if red flags, and locked teaser.
// Session guard: if uploadId is missing, redirects to /upload immediately.

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/shared/AppShell'
import { StageHeader } from '@/components/shared/StageHeader'
import { ProgressBar } from '@/components/shared/ProgressBar'
import { DisclaimerBlock } from '@/components/shared/DisclaimerBlock'
import { WarningBlock } from '@/components/shared/WarningBlock'
import { ErrorState } from '@/components/shared/ErrorState'
import { LoadingState } from '@/components/shared/LoadingState'
import { ResultSummaryBanner } from '@/components/result/ResultSummaryBanner'
import { ResultMarkerList } from '@/components/result/ResultMarkerList'
import { LockedMarkersTeaser } from '@/components/result/LockedMarkersTeaser'
import { useSession } from '@/context/SessionContext'
import { getFreeResult } from '@/services/resultService'
import type { FreeResultResponse } from '@/types/result.types'

type PageState = 'loading' | 'success' | 'error'

export default function FreeResultPage() {
  const router = useRouter()
  const { session, setSession } = useSession()

  const [pageState, setPageState] = useState<PageState>('loading')
  const [result, setResult] = useState<FreeResultResponse | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const loadResult = useCallback(async (uploadId: string) => {
    setPageState('loading')
    setErrorMessage(null)

    const res = await getFreeResult({ uploadId })

    if (res.error || !res.data) {
      setErrorMessage(res.error ?? 'Не удалось загрузить результат.')
      setPageState('error')
      return
    }

    setResult(res.data)
    setSession({ stage: 'free_result' })
    setPageState('success')
  }, [])

  useEffect(() => {
    if (!session.uploadId) {
      router.replace('/upload')
      return
    }
    loadResult(session.uploadId)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps — intentional: run once on mount

  if (pageState === 'loading') {
    return (
      <AppShell>
        <main className="flex flex-col gap-6 px-4 py-8 sm:px-6 max-w-2xl mx-auto w-full">
          <ProgressBar step={2} totalSteps={4} />
          <LoadingState message="Загружаем расшифровку…" />
          <DisclaimerBlock />
        </main>
      </AppShell>
    )
  }

  if (pageState === 'error') {
    return (
      <AppShell>
        <main className="flex flex-col gap-6 px-4 py-8 sm:px-6 max-w-2xl mx-auto w-full">
          <ProgressBar step={2} totalSteps={4} />
          <ErrorState
            message={errorMessage ?? undefined}
            onRetry={() => session.uploadId && loadResult(session.uploadId)}
          />
          <DisclaimerBlock />
        </main>
      </AppShell>
    )
  }

  // success — result is guaranteed non-null here
  const data = result!

  return (
    <AppShell>
      <main className="flex flex-col gap-6 px-4 py-8 sm:px-6 max-w-2xl mx-auto w-full">
        <ProgressBar step={2} totalSteps={4} />

        <StageHeader
          title="Краткая расшифровка"
          subtitle="Вероятные сценарии по показателям — информационная поддержка, не диагноз."
          step={2}
          totalSteps={4}
        />

        <ResultSummaryBanner
          totalMarkers={data.totalMarkers}
          freeCount={data.freeMarkers.length}
          analyzedAt={data.analyzedAt}
        />

        {data.hasRedFlags && <WarningBlock />}

        <ResultMarkerList markers={data.freeMarkers} />

        <LockedMarkersTeaser lockedCount={data.lockedCount} />

        <DisclaimerBlock />
      </main>
    </AppShell>
  )
}
