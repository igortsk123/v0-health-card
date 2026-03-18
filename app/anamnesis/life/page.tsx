'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/shared/AppShell'
import { LoadingState } from '@/components/shared/LoadingState'
import { ErrorState } from '@/components/shared/ErrorState'
import { DisclaimerBlock } from '@/components/shared/DisclaimerBlock'
import { AnamnesisProgress } from '@/components/anamnesis/AnamnesisProgress'
import { QuestionCard } from '@/components/anamnesis/QuestionCard'
import { useSession } from '@/context/SessionContext'
import { startLifeAnamnesis, answerLifeQuestion } from '@/services/anamnesisService'
import type { AnamnesisQuestion, AnamnesisProgressDTO } from '@/types/anamnesis.types'

// ---------------------------------------------------------------------------
// Page-level state machine
//   starting  → first API call in flight
//   active    → question visible, waiting for user
//   loading   → answer submitted, next question in flight
//   error     → last API call failed
//   complete  → question === null, navigating away
// ---------------------------------------------------------------------------
type PageState = 'starting' | 'active' | 'loading' | 'error' | 'complete'

export default function LifeAnamnesisPage() {
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

  // Stores the last submitted answer so it can be replayed on retry
  const pendingAnswerRef = useRef<{
    questionId: string
    value: string | string[] | boolean | number
  } | null>(null)

  // ---------------------------------------------------------------------------
  // SSR guard + stage check
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (session.stage !== 'life_anamnesis') {
      router.replace('/offer')
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

    const res = await startLifeAnamnesis(session.sessionId)

    if (res.error || !res.data) {
      setErrorMessage(res.error ?? 'Ошибка начала анкеты')
      setPageState('error')
      return
    }

    setCurrentQuestion(res.data.question)
    setProgress(res.data.progress)
    setPageState('active')
  }, [session.sessionId])

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

      const res = await answerLifeQuestion(session.sessionId, questionId, value)

      if (res.error || !res.data) {
        setErrorMessage(res.error ?? 'Ошибка отправки ответа')
        setPageState('error')
        return
      }

      setProgress(res.data.progress)

      if (res.data.question === null) {
        // Anamnesis complete
        setPageState('complete')
        setSession({
          lifeAnamnesisId: res.data.anamnesisId ?? null,
          stage: 'illness_anamnesis',
        })
        router.push('/anamnesis/illness')
        return
      }

      setCurrentQuestion(res.data.question)
      pendingAnswerRef.current = null
      setPageState('active')
    },
    [session.sessionId, setSession, router],
  )

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
          <LoadingState message="Подготавливаем вопросы…" />
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
          <LoadingState message="Переходим к следующему разделу…" />
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
            Образ жизни
          </p>
          <h1 className="text-xl font-bold text-foreground text-balance leading-tight">
            Расскажите о себе
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground text-pretty">
            Ваши ответы помогут персонализировать анализ. Данные не передаются третьим лицам.
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
