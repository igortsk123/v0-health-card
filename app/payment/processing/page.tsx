'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/shared/AppShell'
import { StageHeader } from '@/components/shared/StageHeader'
import { ProgressBar } from '@/components/shared/ProgressBar'
import { LoadingState } from '@/components/shared/LoadingState'
import { ErrorState } from '@/components/shared/ErrorState'
import { CtaGroup } from '@/components/shared/CtaGroup'
import { useSession } from '@/context/SessionContext'
import { getPaymentStatus, confirmPayment } from '@/services/paymentService'

type ScreenState = 'processing' | 'timeout' | 'failed'

const POLL_INTERVAL_MS = 3000
const TIMEOUT_MS = 30000

export default function PaymentProcessingPage() {
  const router = useRouter()
  const { session, setSession } = useSession()

  const [paymentId, setPaymentId] = useState<string | null>(null)
  const [screenState, setScreenState] = useState<ScreenState>('processing')
  const [hydrated, setHydrated] = useState(false)

  const isConfirming = useRef(false)

  // SSR-safe: read session only on client
  useEffect(() => {
    const id = session.paymentId
    if (!id) {
      router.replace('/offer')
      return
    }
    setPaymentId(id)
    setHydrated(true)
  }, [session.paymentId, router])

  // Polling + timeout
  useEffect(() => {
    if (!hydrated || !paymentId) return

    let stopped = false

    async function poll() {
      if (stopped || isConfirming.current) return
      const result = await getPaymentStatus(paymentId!)
      if (stopped) return

      if (result.error || !result.data) {
        setScreenState('failed')
        return
      }

      const { status } = result.data

      if (status === 'failed' || status === 'expired') {
        setScreenState('failed')
        return
      }

      if (status === 'success') {
        if (isConfirming.current) return
        isConfirming.current = true
        const confirm = await confirmPayment(paymentId!)
        if (stopped) return
        if (confirm.error || !confirm.data || confirm.data.status !== 'success') {
          setScreenState('failed')
          isConfirming.current = false
          return
        }
        setSession({ stage: 'life_anamnesis' })
        router.push('/payment/success')
        return
      }
      // 'processing' or 'pending' → continue polling
    }

    const interval = setInterval(poll, POLL_INTERVAL_MS)
    const timeout = setTimeout(() => {
      stopped = true
      clearInterval(interval)
      if (!isConfirming.current) {
        setScreenState('timeout')
      }
    }, TIMEOUT_MS)

    // Kick off first poll immediately
    poll()

    return () => {
      stopped = true
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [hydrated, paymentId, setSession, router])

  if (!hydrated) return null

  return (
    <AppShell>
      <main className="flex flex-col gap-6 px-4 py-10 sm:px-6 max-w-2xl mx-auto w-full">
        <ProgressBar step={3} totalSteps={7} />

        <StageHeader title="Обработка платежа" />

        {screenState === 'processing' && (
          <LoadingState message="Проверяем статус оплаты…" />
        )}

        {screenState === 'timeout' && (
          <div className="flex flex-col gap-6">
            <p className="text-sm text-center text-muted-foreground leading-relaxed px-4">
              Платёж занимает дольше обычного. Проверьте соединение.
            </p>
            <CtaGroup
              primary={{ label: 'Попробовать снова', href: '/offer' }}
            />
          </div>
        )}

        {screenState === 'failed' && (
          <div className="flex flex-col gap-6">
            <ErrorState message="Не удалось подтвердить оплату. Попробуйте ещё раз." />
            <CtaGroup
              primary={{ label: 'Вернуться к оплате', href: '/offer' }}
            />
          </div>
        )}
      </main>
    </AppShell>
  )
}
