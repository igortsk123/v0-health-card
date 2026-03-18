'use client'

// app/scenarios/page.tsx
// Workstream F — scenario generation and selection list.
// Session guard: requires stage === 'scenarios'. Redirects to /anamnesis/illness otherwise.
// Triggers generateScenarios on mount, polls until ready, then shows scenario cards.
// Each card links to /scenarios/[id] for detail + confirmation before going to /roadmap.
// TODO: replace mock service with real /api/scenarios/* endpoints when backend is ready.

import { useEffect, useRef, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/shared/AppShell'
import { StageHeader } from '@/components/shared/StageHeader'
import { ProgressBar } from '@/components/shared/ProgressBar'
import { LoadingState } from '@/components/shared/LoadingState'
import { ErrorState } from '@/components/shared/ErrorState'
import { DisclaimerBlock } from '@/components/shared/DisclaimerBlock'
import { ScenarioCard } from '@/components/scenarios/ScenarioCard'
import { useSession } from '@/context/SessionContext'
import { generateScenarios, pollScenarios, getScenarios } from '@/services/scenarioService'
import type { Scenario } from '@/types/scenario.types'

const POLL_INTERVAL_MS = 3000
const TIMEOUT_MS = 60_000

export default function ScenariosPage() {
  const router = useRouter()
  const { session } = useSession()

  const [hydrated, setHydrated] = useState(false)
  const [pageState, setPageState] = useState<'generating' | 'ready' | 'error'>('generating')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [scenarios, setScenarios] = useState<Scenario[]>([])

  const generationIdRef = useRef<string | null>(null)
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
  // Fetch completed scenario list and transition to 'ready'
  // ---------------------------------------------------------------------------
  const fetchReady = useCallback(
    async (generationId: string) => {
      const res = await getScenarios({ generationId })
      if (res.error || !res.data) {
        handleError(res.error ?? 'Ошибка при загрузке сценариев.')
        return
      }
      clearTimers()
      setScenarios(res.data.scenarios)
      setPageState('ready')
    },
    [handleError, clearTimers],
  )

  // ---------------------------------------------------------------------------
  // Poll loop
  // ---------------------------------------------------------------------------
  const runPoll = useCallback(
    async (generationId: string) => {
      if (abortedRef.current) return

      const res = await pollScenarios({ generationId })

      if (abortedRef.current) return

      if (res.error || !res.data) {
        handleError(res.error ?? 'Ошибка при проверке статуса.')
        return
      }

      if (res.data.status === 'failed') {
        handleError('Не удалось сформировать сценарии. Попробуйте ещё раз.')
        return
      }

      if (res.data.status === 'ready') {
        await fetchReady(generationId)
        return
      }

      // Still generating — schedule next poll
      pollTimerRef.current = setTimeout(() => runPoll(generationId), POLL_INTERVAL_MS)
    },
    [handleError, fetchReady],
  )

  // ---------------------------------------------------------------------------
  // Kick off generate + poll
  // ---------------------------------------------------------------------------
  const startGeneration = useCallback(async () => {
    abortedRef.current = false
    setPageState('generating')
    setErrorMessage(null)
    generationIdRef.current = null

    const sessionId = session.sessionId ?? ''
    if (!sessionId) {
      handleError('Не найдены данные сессии. Вернитесь к анкете симптомов.')
      return
    }

    // 60-second global timeout
    timeoutTimerRef.current = setTimeout(() => {
      abortedRef.current = true
      handleError('Формирование заняло слишком долго. Попробуйте ещё раз.')
    }, TIMEOUT_MS)

    const genRes = await generateScenarios({
      sessionId,
      illnessAnamnesisId: session.illnessAnamnesisId,
    })

    if (abortedRef.current) return

    if (genRes.error || !genRes.data) {
      handleError(genRes.error ?? 'Не удалось запустить генерацию сценариев.')
      return
    }

    generationIdRef.current = genRes.data.generationId

    if (genRes.data.status === 'ready') {
      await fetchReady(genRes.data.generationId)
      return
    }

    // status === 'generating' — start polling
    pollTimerRef.current = setTimeout(
      () => runPoll(genRes.data!.generationId),
      POLL_INTERVAL_MS,
    )
  }, [session.sessionId, session.illnessAnamnesisId, handleError, fetchReady, runPoll])

  // ---------------------------------------------------------------------------
  // SSR guard + stage check
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (session.stage !== 'scenarios') {
      router.replace('/anamnesis/illness')
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
          <ProgressBar step={5} totalSteps={7} />
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
          <ProgressBar step={5} totalSteps={7} />
          <LoadingState message="Формируем вероятные сценарии…" />
          <DisclaimerBlock />
        </main>
      </AppShell>
    )
  }

  // ---------------------------------------------------------------------------
  // Ready — scenario card list
  // ---------------------------------------------------------------------------
  return (
    <AppShell>
      <main className="flex flex-col gap-6 px-4 py-8 sm:px-6 max-w-2xl mx-auto w-full">
        <ProgressBar step={5} totalSteps={7} />

        <StageHeader
          title="Вероятные сценарии"
          subtitle="Выберите сценарий, который кажется вам наиболее близким — это не диагноз, а информационная основа для разговора с врачом."
        />

        <ul className="flex flex-col gap-3" aria-label="Список сценариев">
          {scenarios.map((scenario) => (
            <li key={scenario.id}>
              <ScenarioCard scenario={scenario} />
            </li>
          ))}
        </ul>

        <DisclaimerBlock />
      </main>
    </AppShell>
  )
}
