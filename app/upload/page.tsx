// TODO (Workstream B): implement upload UI, file validation, parsing trigger
import { AppShell } from '@/components/shared/AppShell'
import { StageHeader } from '@/components/shared/StageHeader'
import { ProgressBar } from '@/components/shared/ProgressBar'
import { DisclaimerBlock } from '@/components/shared/DisclaimerBlock'

export default function UploadPage() {
  return (
    <AppShell>
      <main className="flex flex-col gap-8 px-4 py-10 sm:px-6 max-w-2xl mx-auto w-full">
        <ProgressBar step={1} totalSteps={4} />

        <StageHeader
          title="Загрузите результаты анализов"
          subtitle="Фотография или PDF с лабораторными данными. Поддерживаются форматы JPEG, PNG, PDF."
          step={1}
          totalSteps={4}
        />

        {/* TODO: replace with FileUploadZone component in Workstream B */}
        <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/40 p-12 text-center">
          <p className="text-sm text-muted-foreground">
            Зона загрузки файла — будет реализована в Workstream B
          </p>
        </div>

        <DisclaimerBlock />
      </main>
    </AppShell>
  )
}
