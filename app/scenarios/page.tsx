'use client'

// app/scenarios/page.tsx
// Workstream F — scenario generation and selection.
// Polls generateScenarios every 3s until status==='ready', then shows 3 ScenarioCards.
// Navigates to /scenarios/[id] on "Подробнее".
// Times out after 60s with an error state + retry.

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/shared/AppShell'
import { StageHeader } from '@/components/shared/StageHeader'
import { ProgressBar } from '@/components/shared/ProgressBar'
import { LoadingState } from '@/components/shared/LoadingState'
import { ErrorState } from '@/components/shared/ErrorState'
import { DisclaimerBlock } from '@/components/shared/DisclaimerBlock'
import { ScenarioCard } from '@/components/scenarios/ScenarioCard'
import { useSession } from '@/context/SessionContext'
import { generateScenarios } from '@/services/scenarioService'
import type { Scenario } from '@/types/scenario.types'

// ---------------------------------------------------------------------------
// Page-level state machine
//   generating  → polling in flight → LoadingState
//   ready       → 3 × ScenarioCard
//   timeout     → 60s exceeded → ErrorState
//   error       → API error → ErrorState
// ---------------------------------------------------------------------------
type PageState = 'generating' | 'ready' | 'timeout' | 'error'

const POLL_INTERVAL_MS = 3000
const TIMEOUT_MS = 60_000

export default function ScenariosPage() {
  const router = useRouter()
  const { session } = useSession()

  const [hydrated, setHydrated] = useState(false)
  const [pageState, setPageState] = useState<PageState>('generating')
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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
  // Stop polling helpers
  // ---------------------------------------------------------------------------
  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  // ---------------------------------------------------------------------------
  // Polling loop
  // ---------------------------------------------------------------------------
  const startPolling = useCallback(() => {
    if (!session.sessionId) return

    const sessionId = session.sessionId

    setPageState('generating')
    setErrorMessage(null)

    // Kick off 60s timeout
    timeoutRef.current = setTimeout(() => {
      stopPolling()
      setPageState('timeout')
    }, TIMEOUT_MS)

    // Immediate first poll, then every POLL_INTERVAL_MS
    async function poll() {
      const res = await generateScenarios(sessionId)

      if (res.error || !res.data) {
        stopPolling()
        setErrorMessage(res.error ?? 'Ошибка формирования сценариев')
        setPageState('error')
        return
      }

      if (res.data.status === 'failed') {
        stopPolling()
        setErrorMessage('Не удалось сформировать сценарии. Попробуйте ещё раз.')
        setPageState('error')
        return
      }

      if (res.data.status === 'ready') {
        stopPolling()
        setScenarios(res.data.scenarios)
        setPageState('ready')
      }
      // status === 'generating' → keep polling
    }

    poll()
    pollIntervalRef.current = setInterval(poll, POLL_INTERVAL_MS)
  }, [session.sessionId, stopPolling])

  // ---------------------------------------------------------------------------
  // Start polling on hydration, clean up on unmount
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (hydrated) {
      startPolling()
    }
    return () => {
      stopPolling()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated])

  // ---------------------------------------------------------------------------
  // Navigate to detail page on card "Подробнее" click
  // ---------------------------------------------------------------------------
  const handleSelectScenario = useCallback(
    (id: string) => {
      router.push(`/scenarios/${id}`)
    },
    [router],
  )

  // ---------------------------------------------------------------------------
  // Render guard
  // ---------------------------------------------------------------------------
  if (!hydrated) return null

  // ---------------------------------------------------------------------------
  // Generating state
  // ---------------------------------------------------------------------------
  if (pageState === 'generating') {
    return (
      <AppShell>
        <main className="flex flex-col flex-1 px-4 py-8 sm:px-6 max-w-2xl mx-auto w-full gap-6">
          <ProgressBar step={6} totalSteps={7} />
          <StageHeader
            title="Вероятные сценарии"
            subtitle="На основе ваших данных мы выделили три варианта"
          />
          <LoadingState message="Анализируем ваши данные…" />
          <DisclaimerBlock />
        </main>
      </AppShell>
    )
  }

  // ---------------------------------------------------------------------------
  // Timeout state
  // ---------------------------------------------------------------------------
  if (pageState === 'timeout') {
    return (
      <AppShell>
        <main className="flex flex-col flex-1 px-4 py-8 sm:px-6 max-w-2xl mx-auto w-full gap-6">
          <ProgressBar step={6} totalSteps={7} />
          <StageHeader
            title="Вероятные сценарии"
            subtitle="На основе ваших данных мы выделили три варианта"
          />
          <ErrorState
            message="Формирование заняло слишком долго. Пожалуйста, попробуйте ещё раз."
            onRetry={startPolling}
          />
          <DisclaimerBlock />
        </main>
      </AppShell>
    )
  }

  // ---------------------------------------------------------------------------
  // Error state
  // ---------------------------------------------------------------------------
  if (pageState === 'error') {
    return (
      <AppShell>
        <main className="flex flex-col flex-1 px-4 py-8 sm:px-6 max-w-2xl mx-auto w-full gap-6">
          <ProgressBar step={6} totalSteps={7} />
          <StageHeader
            title="Вероятные сценарии"
            subtitle="На основе ваших данных мы выделили три варианта"
          />
          <ErrorState
            message={errorMessage ?? 'Что-то пошло не так. Попробуйте ещё раз.'}
            onRetry={startPolling}
          />
          <DisclaimerBlock />
        </main>
      </AppShell>
    )
  }

  // ---------------------------------------------------------------------------
  // Ready state — show 3 scenario cards
  // ---------------------------------------------------------------------------
  return (
    <AppShell>
      <main className="flex flex-col gap-6 px-4 py-8 sm:px-6 max-w-2xl mx-auto w-full">
        <ProgressBar step={6} totalSteps={7} />

        <StageHeader
          title="Вероятные сценарии"
          subtitle="На основе ваших данных мы выделили три варианта. Это не диагноз — только информационная поддержка."
        />

        <section aria-label="Список сценариев" className="flex flex-col gap-4">
          {scenarios.map((scenario) => (
            <ScenarioCard
              key={scenario.id}
              scenario={scenario}
              onSelect={handleSelectScenario}
            />
          ))}
        </section>

        <DisclaimerBlock />
      </main>
    </AppShell>
  )
}
