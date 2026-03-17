// TODO (Workstream B): implement free result markers list, summary, upsell teaser
import { AppShell } from '@/components/shared/AppShell'
import { StageHeader } from '@/components/shared/StageHeader'
import { ProgressBar } from '@/components/shared/ProgressBar'
import { DisclaimerBlock } from '@/components/shared/DisclaimerBlock'
import { CtaGroup } from '@/components/shared/CtaGroup'

export default function FreeResultPage() {
  return (
    <AppShell>
      <main className="flex flex-col gap-8 px-4 py-10 sm:px-6 max-w-2xl mx-auto w-full">
        <ProgressBar step={2} totalSteps={4} />

        <StageHeader
          title="Краткая расшифровка"
          subtitle="Вероятные отклонения — информационная поддержка, не диагноз."
          step={2}
          totalSteps={4}
        />

        {/* TODO: replace with ResultMarkerList component in Workstream B */}
        <div className="rounded-xl border border-border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Список показателей — будет реализован в Workstream B
          </p>
        </div>

        <CtaGroup
          primary={{ label: 'Получить полный разбор', href: '/offer' }}
          secondary={{ label: 'Вернуться к загрузке', href: '/upload' }}
        />

        <DisclaimerBlock />
      </main>
    </AppShell>
  )
}
