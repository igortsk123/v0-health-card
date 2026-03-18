'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircleIcon } from 'lucide-react'
import { AppShell } from '@/components/shared/AppShell'
import { StageHeader } from '@/components/shared/StageHeader'
import { ProgressBar } from '@/components/shared/ProgressBar'
import { DisclaimerBlock } from '@/components/shared/DisclaimerBlock'
import { CtaGroup } from '@/components/shared/CtaGroup'
import { useSession } from '@/context/SessionContext'

const NEXT_STEPS = [
  'Вы ответите на несколько вопросов об образе жизни',
  'Система сформирует три вероятных сценария',
  'Вы получите персональную маршрутную карту в PDF',
]

export default function PaymentSuccessPage() {
  const router = useRouter()
  const { session } = useSession()
  const [hydrated, setHydrated] = useState(false)

  // SSR-safe guard: check session only on client
  useEffect(() => {
    if (!session.paymentId || session.stage !== 'life_anamnesis') {
      router.replace('/offer')
      return
    }
    setHydrated(true)
  }, [session.paymentId, session.stage, router])

  if (!hydrated) return null

  return (
    <AppShell>
      <main className="flex flex-col gap-6 px-4 py-10 sm:px-6 max-w-2xl mx-auto w-full">
        <ProgressBar step={3} totalSteps={7} />

        <StageHeader
          title="Оплата прошла успешно"
          subtitle="Теперь мы подготовим ваш персональный анализ"
        />

        {/* Confirmation badge */}
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-4">
          <CheckCircleIcon
            className="h-5 w-5 flex-shrink-0 text-primary"
            aria-hidden="true"
          />
          <span className="text-sm font-medium text-foreground">
            Оплата подтверждена
          </span>
        </div>

        {/* Next steps */}
        <section aria-labelledby="next-steps-heading">
          <h2
            id="next-steps-heading"
            className="text-sm font-semibold text-foreground mb-4"
          >
            Что будет дальше
          </h2>
          <ol className="flex flex-col gap-3">
            {NEXT_STEPS.map((step, index) => (
              <li key={step} className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
                >
                  {index + 1}
                </span>
                <span className="text-sm leading-relaxed text-muted-foreground pt-0.5">
                  {step}
                </span>
              </li>
            ))}
          </ol>
        </section>

        <CtaGroup
          primary={{
            label: 'Начать опрос',
            href: '/anamnesis/life',
          }}
          secondary={{
            label: 'Вернуться к расшифровке',
            href: '/result/free',
          }}
        />

        <DisclaimerBlock />
      </main>
    </AppShell>
  )
}
