'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  CheckCircleIcon,
  UserIcon,
  ListIcon,
  MessageSquareIcon,
  FileTextIcon,
  Loader2Icon,
} from 'lucide-react'
import { AppShell } from '@/components/shared/AppShell'
import { StageHeader } from '@/components/shared/StageHeader'
import { ProgressBar } from '@/components/shared/ProgressBar'
import { DisclaimerBlock } from '@/components/shared/DisclaimerBlock'
import { CtaGroup } from '@/components/shared/CtaGroup'
import { ErrorState } from '@/components/shared/ErrorState'
import { useSession } from '@/context/SessionContext'
import { createPaymentSession } from '@/services/paymentService'
import { PAYMENT_AMOUNT_RUB } from '@/lib/constants'

const VALUE_ITEMS = [
  { icon: CheckCircleIcon, text: 'Полная интерпретация всех маркеров' },
  { icon: UserIcon, text: 'Контекст на основе вашего анамнеза' },
  { icon: ListIcon, text: 'Три вероятных сценария с объяснением' },
  { icon: MessageSquareIcon, text: 'Что обсудить с врачом' },
  { icon: FileTextIcon, text: 'PDF-маршрутная карта пациента' },
]

export default function OfferPage() {
  const router = useRouter()
  const { session, setSession } = useSession()

  const [uploadId, setUploadId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)

  // SSR-safe: read session only on client
  useEffect(() => {
    setUploadId(session.uploadId)
    setHydrated(true)
  }, [session.uploadId])

  async function handlePay() {
    if (isLoading || !uploadId) return
    setIsLoading(true)
    setError(null)
    const result = await createPaymentSession(uploadId, PAYMENT_AMOUNT_RUB)
    if (result.error || !result.data) {
      setError(result.error ?? 'Не удалось создать сессию оплаты')
      setIsLoading(false)
      return
    }
    setSession({ paymentId: result.data.paymentId, stage: 'payment' })
    router.push('/payment/processing')
  }

  if (!hydrated) return null

  if (!uploadId) {
    return (
      <AppShell>
        <main className="flex flex-col gap-6 px-4 py-10 sm:px-6 max-w-2xl mx-auto w-full">
          <ErrorState
            message="Не удалось найти данные анализов. Пожалуйста, загрузите файл заново."
            onRetry={() => router.push('/upload')}
          />
        </main>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <main className="flex flex-col gap-6 px-4 py-10 sm:px-6 max-w-2xl mx-auto w-full">
        <ProgressBar step={3} totalSteps={7} />

        <StageHeader
          title="Полный анализ"
          subtitle="Персонализированная расшифровка"
        />

        {/* Value list */}
        <ul className="flex flex-col gap-3" aria-label="Что включено">
          {VALUE_ITEMS.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
              </span>
              <span className="text-sm leading-relaxed text-foreground">{text}</span>
            </li>
          ))}
        </ul>

        {/* Price block */}
        <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card px-6 py-6 text-center">
          <span className="text-4xl font-bold text-foreground tracking-tight">
            {PAYMENT_AMOUNT_RUB} ₽
          </span>
          <span className="text-sm text-muted-foreground">Единоразовый платёж</span>
        </div>

        {/* Inline error */}
        {error && (
          <p role="alert" className="text-sm text-destructive text-center leading-relaxed">
            {error}
          </p>
        )}

        <CtaGroup
          primary={{
            label: isLoading
              ? 'Подождите…'
              : `Оплатить ${PAYMENT_AMOUNT_RUB} ₽`,
            onClick: handlePay,
            disabled: isLoading,
          }}
          secondary={{
            label: 'Вернуться к расшифровке',
            href: '/result/free',
          }}
        />

        {isLoading && (
          <div className="flex items-center justify-center gap-2">
            <Loader2Icon className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden="true" />
            <span className="text-xs text-muted-foreground">Создаём сессию оплаты…</span>
          </div>
        )}

        <DisclaimerBlock />
      </main>
    </AppShell>
  )
}
