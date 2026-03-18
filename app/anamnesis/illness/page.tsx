'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/shared/AppShell'
import { LoadingState } from '@/components/shared/LoadingState'
import { ErrorState } from '@/components/shared/ErrorState'
import { DisclaimerBlock } from '@/components/shared/DisclaimerBlock'
import { WarningBlock } from '@/components/shared/WarningBlock'
import { AnamnesisProgress } from '@/components/anamnesis/AnamnesisProgress'
import { QuestionCard } from '@/components/anamnesis/QuestionCard'
import { Button } from '@/components/ui/button'
import { useSession } from '@/context/SessionContext'
import { startIllnessAnamnesis, answerIllnessQuestion } from '@/services/anamnesisService'
import type {
  AnamnesisQuestion,
  AnamnesisProgressDTO,
  RedFlagDTO,
} from '@/types/anamnesis.types'

// ---------------------------------------------------------------------------
// Page-level state machine
//   starting  → startIllnessAnamnesis in flight → full-page LoadingState
//   active    → question visible, waiting for user
//   loading   → answer submitted, next question in flight
//   redflag   → completed, flagged warning shown, awaiting user confirmation
//   error     → last API call failed
//   complete  → navigating to /scenarios
// ---------------------------------------------------------------------------
type PageState = 'starting' | 'active' | 'loading' | 'redflag' | 'error' | 'complete'

export default function IllnessAnamnesisPage() {
  const router = useRouter()
  const { session, setSession } = useSession()

  const [hydrated, setHydrated] = useState(false)
  const [pageState, setPageState] = useState<PageState>('starting')
  const [currentQuestion, setCurrentQuestion] = useState<AnamnesisQuestion | null>(null)
  const [progress, setProgress] = useState<AnamnesisProgressDTO>({
    currentStep: 0,
    estimatedTotal: 10,
  })
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [redFlag, setRedFlag] = useState<RedFlagDTO | null>(null)
  const [completionData, setCompletionData] = useState<{
    illnessAnamnesisId: string
  } | null>(null)

  // Stores the last submitted answer so it can be replayed on retry
  const pendingAnswerRef = useRef<{
    questionId: string
    value: string | string[] | boolean | number
  } | null>(null)

  // ---------------------------------------------------------------------------
  // SSR guard + stage check
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (session.stage !== 'illness_anamnesis') {
      router.replace('/anamnesis/life')
      return
    }
    setHydrated(true)
  }, [session.stage, router])

  // ---------------------------------------------------------------------------
  // Start anamnesis on mount (once hydrated)
  // ---------------------------------------------------------------------------
  const start = useCallback(async () => {
    if (!session.sessionId) return
    setPageState('starting')
    setErrorMessage(null)

    const res = await startIllnessAnamnesis(session.sessionId, session.lifeAnamnesisId)

    if (res.error || !res.data) {
      setErrorMessage(res.error ?? 'Ошибка начала анкеты о симптомах')
      setPageState('error')
      return
    }

    setCurrentQuestion(res.data.question)
    setProgress(res.data.progress)
    setPageState('active')
  }, [session.sessionId, session.lifeAnamnesisId])

  useEffect(() => {
    if (hydrated) {
      start()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated])

  // ---------------------------------------------------------------------------
  // Submit an answer
  // ---------------------------------------------------------------------------
  const submitAnswer = useCallback(
    async (questionId: string, value: string | string[] | boolean | number) => {
      if (!session.sessionId) return
      pendingAnswerRef.current = { questionId, value }
      setPageState('loading')
      setErrorMessage(null)

      const res = await answerIllnessQuestion(session.sessionId, questionId, value)

      if (res.error || !res.data) {
        setErrorMessage(res.error ?? 'Ошибка отправки ответа')
        setPageState('error')
        return
      }

      setProgress(res.data.progress)

      if (res.data.question === null) {
        // Anamnesis complete — store completion data and check red flag
        const id = res.data.illnessAnamnesisId ?? null
        const flag = res.data.redFlag ?? null

        setCompletionData(id ? { illnessAnamnesisId: id } : null)
        setRedFlag(flag)

        if (flag?.flagged) {
          // Show warning, let user decide when to continue
          setPageState('redflag')
        } else {
          // No red flag — advance directly
          navigateToScenarios(id)
        }
        return
      }

      setCurrentQuestion(res.data.question)
      pendingAnswerRef.current = null
      setPageState('active')
    },
    [session.sessionId], // navigateToScenarios defined below, captured via ref pattern
  )

  // ---------------------------------------------------------------------------
  // Navigate to /scenarios after updating session
  // ---------------------------------------------------------------------------
  const navigateToScenarios = useCallback(
    (illnessAnamnesisId: string | null) => {
      setPageState('complete')
      setSession({
        illnessAnamnesisId: illnessAnamnesisId ?? null,
        stage: 'scenarios',
      })
      router.push('/scenarios')
    },
    [setSession, router],
  )

  // ---------------------------------------------------------------------------
  // Called when user presses "Продолжить" on the red-flag screen
  // ---------------------------------------------------------------------------
  const handleProceedFromRedFlag = useCallback(() => {
    navigateToScenarios(completionData?.illnessAnamnesisId ?? null)
  }, [navigateToScenarios, completionData])

  // ---------------------------------------------------------------------------
  // Retry handler — replays the pending answer (or restarts if starting failed)
  // ---------------------------------------------------------------------------
  const handleRetry = useCallback(() => {
    if (pendingAnswerRef.current) {
      const { questionId, value } = pendingAnswerRef.current
      submitAnswer(questionId, value)
    } else {
      start()
    }
  }, [submitAnswer, start])

  // ---------------------------------------------------------------------------
  // Handler passed to QuestionCard
  // ---------------------------------------------------------------------------
  const handleAnswer = useCallback(
    (value: string | string[] | boolean | number) => {
      if (!currentQuestion) return
      submitAnswer(currentQuestion.id, value)
    },
    [currentQuestion, submitAnswer],
  )

  // ---------------------------------------------------------------------------
  // Render nothing until hydrated (SSR-safe)
  // ---------------------------------------------------------------------------
  if (!hydrated) return null

  // ---------------------------------------------------------------------------
  // Starting state — full-page loader
  // ---------------------------------------------------------------------------
  if (pageState === 'starting') {
    return (
      <AppShell>
        <main className="flex flex-col flex-1 items-center justify-center px-4 py-10 max-w-2xl mx-auto w-full">
          <LoadingState message="Подготавливаем вопросы о симптомах…" />
        </main>
      </AppShell>
    )
  }

  // ---------------------------------------------------------------------------
  // Error state — full-page error with retry
  // ---------------------------------------------------------------------------
  if (pageState === 'error') {
    return (
      <AppShell>
        <main className="flex flex-col flex-1 items-center justify-center px-4 py-10 max-w-2xl mx-auto w-full">
          <ErrorState
            message={errorMessage ?? 'Что-то пошло не так. Попробуйте ещё раз.'}
            onRetry={handleRetry}
          />
        </main>
      </AppShell>
    )
  }

  // ---------------------------------------------------------------------------
  // Complete — brief "navigating" state while router.push is in flight
  // ---------------------------------------------------------------------------
  if (pageState === 'complete') {
    return (
      <AppShell>
        <main className="flex flex-col flex-1 items-center justify-center px-4 py-10 max-w-2xl mx-auto w-full">
          <LoadingState message="Формируем сценарии…" />
        </main>
      </AppShell>
    )
  }

  // ---------------------------------------------------------------------------
  // Red-flag state — completion + warning, user decides when to continue
  // ---------------------------------------------------------------------------
  if (pageState === 'redflag') {
    return (
      <AppShell>
        <main className="flex flex-col gap-6 px-4 py-8 sm:px-6 max-w-2xl mx-auto w-full">
          <AnamnesisProgress progress={progress} />

          <header>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1">
              Симптомы
            </p>
            <h1 className="text-xl font-bold text-foreground text-balance leading-tight">
              Ваши симптомы
            </h1>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground text-pretty">
              Анкета завершена. Ниже — важная информация.
            </p>
          </header>

          <WarningBlock
            header="Обратите внимание"
            body={
              redFlag?.reason
                ? `${redFlag.reason}. Судя по вашим ответам, симптомы могут требовать консультации врача. Рекомендуем обратиться к специалисту в ближайшее время.`
                : 'Судя по вашим ответам, симптомы могут требовать консультации врача. Рекомендуем обратиться к специалисту.'
            }
          />

          <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
            Вы можете продолжить и ознакомиться с возможными сценариями — это поможет
            лучше подготовиться к разговору с врачом.
          </p>

          <Button
            size="lg"
            className="w-full"
            onClick={handleProceedFromRedFlag}
          >
            Продолжить
          </Button>

          <DisclaimerBlock />
        </main>
      </AppShell>
    )
  }

  // ---------------------------------------------------------------------------
  // Active / loading — show question card (disabled during loading)
  // ---------------------------------------------------------------------------
  const isLoading = pageState === 'loading'

  return (
    <AppShell>
      <main className="flex flex-col gap-6 px-4 py-8 sm:px-6 max-w-2xl mx-auto w-full">
        {/* Progress bar */}
        <AnamnesisProgress progress={progress} />

        {/* Section label */}
        <header>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1">
            Симптомы
          </p>
          <h1 className="text-xl font-bold text-foreground text-balance leading-tight">
            Ваши симптомы
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground text-pretty">
            Расскажите о том, что вас беспокоит. Ответы помогут сформировать
            персонализированный анализ.
          </p>
        </header>

        {/* Question card with loading overlay */}
        <div className="relative">
          {currentQuestion && (
            <section
              // Key forces React to reset local QuestionCard state when question changes
              key={currentQuestion.id}
              className="rounded-2xl border border-border bg-card px-5 py-6 shadow-sm"
            >
              <QuestionCard
                question={currentQuestion}
                disabled={isLoading}
                onAnswer={handleAnswer}
              />
            </section>
          )}

          {/* Loading overlay — sits on top of card during answer submission */}
          {isLoading && (
            <div
              aria-live="polite"
              aria-label="Загружаем следующий вопрос"
              className="absolute inset-0 flex items-center justify-center rounded-2xl bg-card/80 backdrop-blur-[2px]"
            >
              <LoadingState message="Загружаем следующий вопрос…" className="py-0" />
            </div>
          )}
        </div>

        <DisclaimerBlock />
      </main>
    </AppShell>
  )
}
