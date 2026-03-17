'use client'
// app/upload/parsing/page.tsx
// Step 2: polls /api/result/status until done or failed.
// Session guard: if uploadId is missing, redirects to /upload immediately.

import { useEffect, useRef, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/shared/AppShell'
import { ProgressBar } from '@/components/shared/ProgressBar'
import { DisclaimerBlock } from '@/components/shared/DisclaimerBlock'
import { ErrorState } from '@/components/shared/ErrorState'
import { ParsingProgress } from '@/components/result/ParsingProgress'
import { useSession } from '@/context/SessionContext'
import { pollParsing } from '@/services/resultService'

const POLL_INTERVAL_MS = 3000
const MAX_ATTEMPTS = 20

export default function ParsingPage() {
  const router = useRouter()
  const { session, setSession } = useSession()

  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const attemptRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const runPoll = useCallback(async (uploadId: string) => {
    attemptRef.current += 1

    if (attemptRef.current > MAX_ATTEMPTS) {
      setErrorMessage('Анализ занимает дольше обычного. Попробуйте загрузить файл снова.')
      return
    }

    const result = await pollParsing({ uploadId })

    if (result.error || !result.data) {
      setErrorMessage(result.error ?? 'Ошибка при обработке документа.')
      return
    }

    const { status, sessionId } = result.data

    if (status === 'done') {
      setSession({ sessionId, stage: 'free_result' })
      router.replace('/result/free')
      return
    }

    if (status === 'failed') {
      setErrorMessage('Не удалось распознать документ. Проверьте формат файла и попробуйте снова.')
      return
    }

    // status === 'processing' — schedule next poll
    timerRef.current = setTimeout(() => runPoll(uploadId), POLL_INTERVAL_MS)
  }, [setSession, router])

  useEffect(() => {
    if (!session.uploadId) {
      router.replace('/upload')
      return
    }

    runPoll(session.uploadId)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps — intentional: run once on mount

  const handleRetry = useCallback(() => {
    router.replace('/upload')
  }, [router])

  if (errorMessage) {
    return (
      <AppShell>
        <main className="flex flex-col gap-6 px-4 py-8 sm:px-6 max-w-2xl mx-auto w-full">
          <ProgressBar step={1} totalSteps={4} />
          <ErrorState message={errorMessage} onRetry={handleRetry} />
          <DisclaimerBlock />
        </main>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <main className="flex flex-col gap-6 px-4 py-8 sm:px-6 max-w-2xl mx-auto w-full">
        <ProgressBar step={1} totalSteps={4} />
        <ParsingProgress fileName={undefined} />
        <DisclaimerBlock />
      </main>
    </AppShell>
  )
}
