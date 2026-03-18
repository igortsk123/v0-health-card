'use client'

// app/scenarios/[id]/page.tsx
// Workstream F — scenario detail view.
// Loads detail for params.id, lets user confirm selection, then routes to /roadmap.

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { AppShell } from '@/components/shared/AppShell'
import { StageHeader } from '@/components/shared/StageHeader'
import { ProgressBar } from '@/components/shared/ProgressBar'
import { LoadingState } from '@/components/shared/LoadingState'
import { ErrorState } from '@/components/shared/ErrorState'
import { DisclaimerBlock } from '@/components/shared/DisclaimerBlock'
import { ScenarioDetail } from '@/components/scenarios/ScenarioDetail'
import { useSession } from '@/context/SessionContext'
import { getScenarioDetail } from '@/services/scenarioService'
import type { ScenarioDetailDTO } from '@/types/scenario.types'

// ---------------------------------------------------------------------------
// Page-level state machine
//   loading     → detail fetch in flight → LoadingState
//   ready       → ScenarioDetail component shown
//   confirming  → user clicked "Выбрать" → brief loading, then navigate
//   error       → fetch failed or id not found → ErrorState
// ---------------------------------------------------------------------------
type PageState = 'loading' | 'ready' | 'confirming' | 'error'

export default function ScenarioDetailPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const scenarioId = params?.id ?? ''

  const { session, setSession } = useSession()

  const [hydrated, setHydrated] = useState(false)
  const [pageState, setPageState] = useState<PageState>('loading')
  const [detail, setDetail] = useState<ScenarioDetailDTO | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // ---------------------------------------------------------------------------
  // SSR guard + stage check
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (session.stage !== 'scenarios' && session.stage !== 'scenario_selected') {
      router.replace('/scenarios')
      return
    }
    setHydrated(true)
  }, [session.stage, router])

  // ---------------------------------------------------------------------------
  // Load scenario detail
  // ---------------------------------------------------------------------------
  const loadDetail = useCallback(async () => {
    if (!scenarioId) return
    setPageState('loading')
    setErrorMessage(null)

    const res = await getScenarioDetail(scenarioId)

    if (res.error || !res.data) {
      setErrorMessage(
        res.error ?? 'Сценарий не найден. Пожалуйста, вернитесь к списку.',
      )
      setPageState('error')
      return
    }

    setDetail(res.data)
    setPageState('ready')
  }, [scenarioId])

  useEffect(() => {
    if (hydrated) {
      loadDetail()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated])

  // ---------------------------------------------------------------------------
  // Confirm scenario selection → update session → navigate to /roadmap
  // ---------------------------------------------------------------------------
  const handleConfirm = useCallback(() => {
    setPageState('confirming')
    setSession({
      selectedScenarioId: scenarioId,
      stage: 'scenario_selected',
    })
    router.push('/roadmap')
  }, [scenarioId, setSession, router])

  // ---------------------------------------------------------------------------
  // Back to list
  // ---------------------------------------------------------------------------
  const handleBack = useCallback(() => {
    router.push('/scenarios')
  }, [router])

  // ---------------------------------------------------------------------------
  // Render guard
  // ---------------------------------------------------------------------------
  if (!hydrated) return null

  // ---------------------------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------------------------
  if (pageState === 'loading') {
    return (
      <AppShell>
        <main className="flex flex-col flex-1 items-center justify-center px-4 py-10 max-w-2xl mx-auto w-full">
          <LoadingState message="Загружаем сценарий…" />
        </main>
      </AppShell>
    )
  }

  // ---------------------------------------------------------------------------
  // Error state
  // ---------------------------------------------------------------------------
  if (pageState === 'error' || !detail) {
    return (
      <AppShell>
        <main className="flex flex-col flex-1 px-4 py-8 sm:px-6 max-w-2xl mx-auto w-full gap-6">
          <ProgressBar step={6} totalSteps={7} />
          <ErrorState
            message={errorMessage ?? 'Не удалось загрузить сценарий.'}
            onRetry={loadDetail}
          />
          <DisclaimerBlock />
        </main>
      </AppShell>
    )
  }

  // ---------------------------------------------------------------------------
  // Ready / confirming state
  // ---------------------------------------------------------------------------
  return (
    <AppShell>
      <main className="flex flex-col gap-6 px-4 py-8 sm:px-6 max-w-2xl mx-auto w-full">
        <ProgressBar step={6} totalSteps={7} />

        <StageHeader
          title={detail.title}
          subtitle="Подробная информация о вероятном сценарии"
        />

        <ScenarioDetail
          detail={detail}
          onBack={handleBack}
          onConfirm={handleConfirm}
          confirming={pageState === 'confirming'}
        />
      </main>
    </AppShell>
  )
}
