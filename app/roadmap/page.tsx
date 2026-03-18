'use client'

// app/roadmap/page.tsx
// Workstream G — roadmap generation and polling.
// Session guard: requires stage === 'scenario_selected'.
// Triggers generateRoadmap on mount, then polls until 'ready' or timeout (60s).
// TODO: Workstream G — replace mock service with real /api/roadmap/* endpoints.

import { useEffect, useRef, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/shared/AppShell'
import { ProgressBar } from '@/components/shared/ProgressBar'
import { LoadingState } from '@/components/shared/LoadingState'
import { ErrorState } from '@/components/shared/ErrorState'
import { DisclaimerBlock } from '@/components/shared/DisclaimerBlock'
import { RoadmapPreview } from '@/components/roadmap/RoadmapPreview'
import { RoadmapActions } from '@/components/roadmap/RoadmapActions'
import { StageHeader } from '@/components/shared/StageHeader'
import { useSession } from '@/context/SessionContext'
import { generateRoadmap, pollRoadmap, getRoadmap } from '@/services/roadmapService'
import type { RoadmapResponse } from '@/types/roadmap.types'

const POLL_INTERVAL_MS = 4000
const TIMEOUT_MS = 60_000

export default function RoadmapPage() {
  const router = useRouter()
  const { session, setSession } = useSession()

  const [hydrated, setHydrated] = useState(false)
  const [pageState, setPageState] = useState<'generating' | 'ready' | 'error'>('generating')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [roadmap, setRoadmap] = useState<RoadmapResponse | null>(null)

  const roadmapIdRef = useRef<string | null>(null)
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const timeoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortedRef = useRef(false)

  // ---------------------------------------------------------------------------
  // Cleanup helpers
  // ---------------------------------------------------------------------------
  const clearTimers = useCallback(() => {
    if (pollTimerRef.current) clearTimeout(pollTimerRef.current)
    if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current)
  }, [])

  const handleError = useCallback(
    (msg: string) => {
      clearTimers()
      setErrorMessage(msg)
      setPageState('error')
    },
    [clearTimers],
  )

  // ---------------------------------------------------------------------------
  // Fetch the completed roadmap and transition to 'ready'
  // ---------------------------------------------------------------------------
  const fetchReady = useCallback(async (roadmapId: string) => {
    const res = await getRoadmap({ roadmapId })
    if (res.error || !res.data) {
      handleError(res.error ?? 'Ошибка при загрузке маршрутной карты.')
      return
    }
    clearTimers()
    setRoadmap(res.data)
    setSession({ roadmapId, stage: 'roadmap_ready' })
    setPageState('ready')
  }, [handleError, clearTimers, setSession])

  // ---------------------------------------------------------------------------
  // Poll loop
  // ---------------------------------------------------------------------------
  const runPoll = useCallback(
    async (roadmapId: string) => {
      if (abortedRef.current) return

      const sessionId = session.sessionId ?? ''
      const scenarioId = session.selectedScenarioId ?? ''
      const res = await pollRoadmap({ roadmapId }, sessionId, scenarioId)

      if (abortedRef.current) return

      if (res.error || !res.data) {
        handleError(res.error ?? 'Ошибка при проверке статуса.')
        return
      }

      if (res.data.status === 'failed') {
        handleError('Не удалось сформировать маршрутную карту. Попробуйте ещё раз.')
        return
      }

      if (res.data.status === 'ready') {
        await fetchReady(roadmapId)
        return
      }

      // Still generating — schedule next poll
      pollTimerRef.current = setTimeout(() => runPoll(roadmapId), POLL_INTERVAL_MS)
    },
    [session.sessionId, session.selectedScenarioId, handleError, fetchReady],
  )

  // ---------------------------------------------------------------------------
  // Kick off generate + poll
  // ---------------------------------------------------------------------------
  const startGeneration = useCallback(async () => {
    abortedRef.current = false
    setPageState('generating')
    setErrorMessage(null)
    roadmapIdRef.current = null

    const sessionId = session.sessionId ?? ''
    const scenarioId = session.selectedScenarioId ?? ''

    if (!sessionId || !scenarioId) {
      handleError('Не найдены данные сессии. Вернитесь к выбору сценария.')
      return
    }

    // 60-second global timeout
    timeoutTimerRef.current = setTimeout(() => {
      abortedRef.current = true
      handleError('Формирование заняло слишком долго. Попробуйте ещё раз.')
    }, TIMEOUT_MS)

    const genRes = await generateRoadmap({ sessionId, scenarioId })

    if (abortedRef.current) return

    if (genRes.error || !genRes.data) {
      handleError(genRes.error ?? 'Не удалось запустить генерацию маршрутной карты.')
      return
    }

    roadmapIdRef.current = genRes.data.roadmapId

    if (genRes.data.status === 'ready') {
      await fetchReady(genRes.data.roadmapId)
      return
    }

    // status === 'generating' — start polling
    pollTimerRef.current = setTimeout(
      () => runPoll(genRes.data!.roadmapId),
      POLL_INTERVAL_MS,
    )
  }, [session.sessionId, session.selectedScenarioId, handleError, fetchReady, runPoll])

  // ---------------------------------------------------------------------------
  // SSR guard + stage check
  // ---------------------------------------------------------------------------
  useEffect(() => {
    // Wait for session to hydrate (SessionContext reads localStorage on mount)
    if (session.stage !== 'scenario_selected') {
      router.replace('/scenarios')
      return
    }
    setHydrated(true)
  }, [session.stage, router])

  // ---------------------------------------------------------------------------
  // Start on mount (once hydrated)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!hydrated) return
    startGeneration()
    return () => {
      abortedRef.current = true
      clearTimers()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps — intentional: run once on hydration
  }, [hydrated])

  // ---------------------------------------------------------------------------
  // Retry
  // ---------------------------------------------------------------------------
  const handleRetry = useCallback(() => {
    startGeneration()
  }, [startGeneration])

  // ---------------------------------------------------------------------------
  // SSR guard — render nothing until session is read from localStorage
  // ---------------------------------------------------------------------------
  if (!hydrated) return null

  // ---------------------------------------------------------------------------
  // Error
  // ---------------------------------------------------------------------------
  if (pageState === 'error') {
    return (
      <AppShell>
        <main className="flex flex-col gap-6 px-4 py-8 sm:px-6 max-w-2xl mx-auto w-full">
          <ProgressBar step={4} totalSteps={4} />
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
  // Generating — spinner
  // ---------------------------------------------------------------------------
  if (pageState === 'generating') {
    return (
      <AppShell>
        <main className="flex flex-col gap-6 px-4 py-8 sm:px-6 max-w-2xl mx-auto w-full">
          <ProgressBar step={4} totalSteps={4} />
          <LoadingState message="Формируем маршрутную карту…" />
          <DisclaimerBlock />
        </main>
      </AppShell>
    )
  }

  // ---------------------------------------------------------------------------
  // Ready — roadmap preview + actions
  // ---------------------------------------------------------------------------
  return (
    <AppShell>
      <main className="flex flex-col gap-6 px-4 py-8 sm:px-6 max-w-2xl mx-auto w-full">
        <ProgressBar step={4} totalSteps={4} />

        <StageHeader
          title="Ваша маршрутная карта"
          subtitle="Персональный план информационных шагов на основе выбранного сценария."
        />

        {roadmap && <RoadmapPreview roadmap={roadmap} />}

        {roadmap && (
          <RoadmapActions roadmapId={roadmap.roadmapId} />
        )}

        <DisclaimerBlock />
      </main>
    </AppShell>
  )
}
