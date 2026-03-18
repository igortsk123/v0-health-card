'use client'

// app/scenarios/[id]/page.tsx
// Workstream F — scenario detail and confirmation.
// Session guard: requires stage === 'scenarios'. Redirects to /scenarios otherwise.
// Looks up the scenario by id from the mock (later: from a real API get-by-id call).
// On confirm: writes selectedScenarioId + stage: 'scenario_selected' → navigates to /roadmap.
// TODO: replace mock lookup with real GET /api/scenarios/:id when backend is ready.

import { use, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeftIcon } from 'lucide-react'
import { AppShell } from '@/components/shared/AppShell'
import { StageHeader } from '@/components/shared/StageHeader'
import { ProgressBar } from '@/components/shared/ProgressBar'
import { DisclaimerBlock } from '@/components/shared/DisclaimerBlock'
import { CtaGroup } from '@/components/shared/CtaGroup'
import { ErrorState } from '@/components/shared/ErrorState'
import { Button } from '@/components/ui/button'
import { useSession } from '@/context/SessionContext'
import { getScenarios } from '@/services/scenarioService'
import type { Scenario } from '@/types/scenario.types'

const MOCK_GENERATION_ID = 'gen_mock_001'

interface PageParams {
  id: string
}

export default function ScenarioDetailPage({ params }: { params: Promise<PageParams> }) {
  const { id } = use(params)
  const router = useRouter()
  const { session, setSession } = useSession()

  const [hydrated, setHydrated] = useState(false)
  const [scenario, setScenario] = useState<Scenario | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)

  // ---------------------------------------------------------------------------
  // SSR guard + stage check
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (session.stage !== 'scenarios') {
      router.replace('/scenarios')
      return
    }
    setHydrated(true)
  }, [session.stage, router])

  // ---------------------------------------------------------------------------
  // Load scenario detail on mount (via mock generation id lookup)
  // TODO: replace with GET /api/scenarios/:id when backend is ready
  // ---------------------------------------------------------------------------
  const loadScenario = useCallback(async () => {
    // For now, we load the full list and find by id.
    // Real backend will expose GET /api/scenarios/:id directly.
    const res = await getScenarios({ generationId: MOCK_GENERATION_ID })
    if (res.error || !res.data) {
      setNotFound(true)
      return
    }
    const found = res.data.scenarios.find((s) => s.id === id) ?? null
    if (!found) {
      setNotFound(true)
      return
    }
    setScenario(found)
  }, [id])

  useEffect(() => {
    if (hydrated) {
      loadScenario()
    }
  }, [hydrated, loadScenario])

  // ---------------------------------------------------------------------------
  // Confirm selection → write session + navigate to roadmap
  // ---------------------------------------------------------------------------
  const handleConfirm = useCallback(() => {
    if (!scenario || isConfirming) return
    setIsConfirming(true)
    setSession({ selectedScenarioId: scenario.id, stage: 'scenario_selected' })
    router.push('/roadmap')
  }, [scenario, isConfirming, setSession, router])

  // ---------------------------------------------------------------------------
  // SSR guard
  // ---------------------------------------------------------------------------
  if (!hydrated) return null

  // ---------------------------------------------------------------------------
  // Not found
  // ---------------------------------------------------------------------------
  if (notFound) {
    return (
      <AppShell>
        <main className="flex flex-col gap-6 px-4 py-8 sm:px-6 max-w-2xl mx-auto w-full">
          <ProgressBar step={5} totalSteps={7} />
          <ErrorState
            message="Сценарий не найден. Вернитесь к списку сценариев."
            onRetry={() => router.push('/scenarios')}
          />
          <DisclaimerBlock />
        </main>
      </AppShell>
    )
  }

  // ---------------------------------------------------------------------------
  // Loading
  // ---------------------------------------------------------------------------
  if (!scenario) {
    return (
      <AppShell>
        <main className="flex flex-col gap-6 px-4 py-8 sm:px-6 max-w-2xl mx-auto w-full">
          <ProgressBar step={5} totalSteps={7} />
          <div className="flex flex-col gap-3 animate-pulse">
            <div className="h-4 w-1/3 rounded-full bg-muted" />
            <div className="h-6 w-3/4 rounded-full bg-muted" />
            <div className="h-24 rounded-2xl bg-muted" />
          </div>
        </main>
      </AppShell>
    )
  }

  // ---------------------------------------------------------------------------
  // Detail view
  // ---------------------------------------------------------------------------
  return (
    <AppShell>
      <main className="flex flex-col gap-6 px-4 py-8 sm:px-6 max-w-2xl mx-auto w-full">
        <ProgressBar step={5} totalSteps={7} />

        {/* Back navigation */}
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 self-start gap-1.5 text-muted-foreground"
          onClick={() => router.back()}
          aria-label="Вернуться к списку сценариев"
        >
          <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
          Назад к сценариям
        </Button>

        <StageHeader
          title={scenario.title}
          subtitle="Ознакомьтесь с описанием сценария перед тем, как продолжить. Это не диагноз — только информационная основа."
        />

        {/* Summary card */}
        <section
          aria-label="Описание сценария"
          className="rounded-2xl border border-border bg-card px-5 py-5"
        >
          <p className="text-sm leading-relaxed text-foreground text-pretty">
            {scenario.summary}
          </p>
        </section>

        {/* Related markers */}
        {scenario.relatedMarkers.length > 0 && (
          <section aria-label="Связанные показатели">
            <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-widest">
              Связанные показатели
            </p>
            <div className="flex flex-wrap gap-2">
              {scenario.relatedMarkers.map((marker) => (
                <span
                  key={marker}
                  className="rounded-lg bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
                >
                  {marker}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Confirmation note */}
        <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
          Выбрав этот сценарий, вы получите персональную маршрутную карту с рекомендуемыми
          информационными шагами, вопросами для врача и ориентирами по дополнительным
          обследованиям.
        </p>

        <CtaGroup
          primary={{
            label: isConfirming ? 'Подождите…' : 'Выбрать этот сценарий',
            onClick: handleConfirm,
            disabled: isConfirming,
          }}
          secondary={{
            label: 'Другие сценарии',
            href: '/scenarios',
          }}
        />

        <DisclaimerBlock />
      </main>
    </AppShell>
  )
}
