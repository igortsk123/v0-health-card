'use client'

// app/roadmap/ready/page.tsx
// Workstream G — persistent "roadmap ready" view.
// Fetches the roadmap by roadmapId stored in session.
// Session guard: requires stage === 'roadmap_ready' AND roadmapId to be set.
// If roadmapId is missing, redirects to /roadmap to avoid a crash.

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/shared/AppShell'
import { LoadingState } from '@/components/shared/LoadingState'
import { ErrorState } from '@/components/shared/ErrorState'
import { DisclaimerBlock } from '@/components/shared/DisclaimerBlock'
import { StageHeader } from '@/components/shared/StageHeader'
import { RoadmapPreview } from '@/components/roadmap/RoadmapPreview'
import { RoadmapActions } from '@/components/roadmap/RoadmapActions'
import { useSession } from '@/context/SessionContext'
import { getRoadmap } from '@/services/roadmapService'
import type { RoadmapResponse } from '@/types/roadmap.types'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

type PageState = 'loading' | 'ready' | 'error'

export default function RoadmapReadyPage() {
  const router = useRouter()
  const { session } = useSession()

  const [hydrated, setHydrated] = useState(false)
  const [pageState, setPageState] = useState<PageState>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [roadmap, setRoadmap] = useState<RoadmapResponse | null>(null)

  // ---------------------------------------------------------------------------
  // SSR guard + stage check
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (session.stage !== 'roadmap_ready') {
      // If stage is roadmap (still generating), redirect back there
      router.replace('/roadmap')
      return
    }
    if (!session.roadmapId) {
      // roadmapId missing — can't render; redirect to generate
      router.replace('/roadmap')
      return
    }
    setHydrated(true)
  }, [session.stage, session.roadmapId, router])

  // ---------------------------------------------------------------------------
  // Fetch roadmap once hydrated
  // ---------------------------------------------------------------------------
  const fetchRoadmap = useCallback(async (roadmapId: string) => {
    setPageState('loading')
    setErrorMessage(null)

    const res = await getRoadmap({ roadmapId })

    if (res.error || !res.data) {
      setErrorMessage(res.error ?? 'Ошибка при загрузке маршрутной карты.')
      setPageState('error')
      return
    }

    setRoadmap(res.data)
    setPageState('ready')
  }, [])

  useEffect(() => {
    if (!hydrated || !session.roadmapId) return
    fetchRoadmap(session.roadmapId)
    // eslint-disable-next-line react-hooks/exhaustive-deps — intentional: run once on hydration
  }, [hydrated])

  const handleRetry = useCallback(() => {
    if (session.roadmapId) fetchRoadmap(session.roadmapId)
  }, [session.roadmapId, fetchRoadmap])

  // ---------------------------------------------------------------------------
  // SSR guard
  // ---------------------------------------------------------------------------
  if (!hydrated) return null

  // ---------------------------------------------------------------------------
  // Loading
  // ---------------------------------------------------------------------------
  if (pageState === 'loading') {
    return (
      <AppShell>
        <main className="flex flex-col flex-1 items-center justify-center px-4 py-10 max-w-2xl mx-auto w-full">
          <LoadingState message="Загружаем маршрутную карту…" />
        </main>
      </AppShell>
    )
  }

  // ---------------------------------------------------------------------------
  // Error
  // ---------------------------------------------------------------------------
  if (pageState === 'error') {
    return (
      <AppShell>
        <main className="flex flex-col gap-6 px-4 py-8 sm:px-6 max-w-2xl mx-auto w-full">
          <ErrorState
            message={errorMessage ?? 'Что-то пошло не так. Попробуйте ещё раз.'}
            onRetry={handleRetry}
          />
          <DisclaimerBlock />
        </main>
      </AppShell>
    )
  }

  // ---------------------------------------------------------------------------
  // Ready
  // ---------------------------------------------------------------------------
  return (
    <AppShell>
      <main className="flex flex-col gap-6 px-4 py-8 sm:px-6 max-w-2xl mx-auto w-full">
        <StageHeader
          title="Ваша маршрутная карта"
          subtitle="Сохранённый план информационных шагов на основе выбранного сценария."
        />

        {roadmap && <RoadmapPreview roadmap={roadmap} />}

        {roadmap && (
          <div className="flex flex-col gap-3">
            <RoadmapActions roadmapId={roadmap.roadmapId} />
            <Button variant="ghost" size="lg" className="w-full sm:w-auto" asChild>
              <Link href="/scenarios">Вернуться к сценариям</Link>
            </Button>
          </div>
        )}

        <DisclaimerBlock />
      </main>
    </AppShell>
  )
}
