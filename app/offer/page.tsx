// TODO (Workstream C): implement offer details, payment initiation
import { AppShell } from '@/components/shared/AppShell'
import { StageHeader } from '@/components/shared/StageHeader'
import { ProgressBar } from '@/components/shared/ProgressBar'
import { DisclaimerBlock } from '@/components/shared/DisclaimerBlock'
import { CtaGroup } from '@/components/shared/CtaGroup'
import { PAYMENT_AMOUNT_RUB } from '@/lib/constants'

export default function OfferPage() {
  return (
    <AppShell>
      <main className="flex flex-col gap-8 px-4 py-10 sm:px-6 max-w-2xl mx-auto w-full">
        <ProgressBar step={3} totalSteps={4} />

        <StageHeader
          title={`Полный разбор за ${PAYMENT_AMOUNT_RUB} ₽`}
          subtitle="Вероятные сценарии, анамнез и персональная дорожная карта для разговора с врачом."
          step={3}
          totalSteps={4}
        />

        {/* TODO: replace with OfferValueList component in Workstream C */}
        <div className="rounded-xl border border-border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Список ценностного предложения — будет реализован в Workstream C
          </p>
        </div>

        <CtaGroup
          primary={{ label: `Оплатить ${PAYMENT_AMOUNT_RUB} ₽`, href: '/payment/processing' }}
          secondary={{ label: 'Посмотреть расшифровку', href: '/result/free' }}
        />

        <DisclaimerBlock />
      </main>
    </AppShell>
  )
}
