'use client'

// components/scenarios/ScenarioDetail.tsx
// Full scenario detail view for Workstream F.
// Renders all 7 sections with conditional rendering for optional fields.

import { CheckCircle2Icon, ArrowLeftIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DisclaimerBlock } from '@/components/shared/DisclaimerBlock'
import { cn } from '@/lib/utils'
import type { ScenarioDetailDTO } from '@/types/scenario.types'

interface ScenarioDetailProps {
  detail: ScenarioDetailDTO
  onBack: () => void
  onConfirm: () => void
  confirming?: boolean
}

// ---------------------------------------------------------------------------
// Section helpers
// ---------------------------------------------------------------------------

interface SectionProps {
  title: string
  items: string[]
  className?: string
}

function BulletSection({ title, items, className }: SectionProps) {
  if (items.length === 0) return null
  return (
    <section className={cn('flex flex-col gap-2', className)}>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <ul className="flex flex-col gap-1.5" role="list">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
            <CheckCircle2Icon
              className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary/60"
              aria-hidden="true"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

interface TextSectionProps {
  title: string
  text: string
  className?: string
}

function TextSection({ title, text, className }: TextSectionProps) {
  return (
    <section className={cn('flex flex-col gap-2', className)}>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground text-pretty">{text}</p>
    </section>
  )
}

// ---------------------------------------------------------------------------
// ScenarioDetail
// ---------------------------------------------------------------------------

export function ScenarioDetail({ detail, onBack, onConfirm, confirming = false }: ScenarioDetailProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Short description recap */}
      <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
        {detail.shortDescription}
      </p>

      {/* Confidence note */}
      <p className="text-xs leading-relaxed text-muted-foreground/80 italic border-l-2 border-primary/30 pl-3">
        {detail.confidenceNote}
      </p>

      {/* Card wrapper for all detail sections */}
      <div className="rounded-2xl border border-border bg-card px-5 py-6 flex flex-col gap-6 shadow-sm">

        {/* 1. Почему это может подходить */}
        <BulletSection
          title="Почему это может подходить"
          items={detail.whyItFits}
        />

        {/* 2. Что это подтверждает */}
        <BulletSection
          title="Что это подтверждает"
          items={detail.whatSupports}
        />

        {/* Divider */}
        <hr className="border-border" />

        {/* 3. Что обсудить с врачом */}
        <BulletSection
          title="Что обсудить с врачом"
          items={detail.whatToDiscussWithDoctor}
        />

        {/* 4. Что может быть полезно проверить */}
        <BulletSection
          title="Что может быть полезно проверить"
          items={detail.whatToCheckNext}
        />

        {/* 5. Самонаблюдение (optional) */}
        {detail.selfMonitoringNotes && (
          <TextSection
            title="Самонаблюдение"
            text={detail.selfMonitoringNotes}
          />
        )}

        {/* 6. Образ жизни (optional) */}
        {detail.lifestyleNotes && (
          <TextSection
            title="Образ жизни"
            text={detail.lifestyleNotes}
          />
        )}

        {/* 7. На что обратить внимание (optional) */}
        {detail.warningSignsToWatch && detail.warningSignsToWatch.length > 0 && (
          <BulletSection
            title="На что обратить внимание"
            items={detail.warningSignsToWatch}
          />
        )}
      </div>

      {/* CTAs */}
      <div className="flex flex-col gap-3">
        <Button
          size="lg"
          className="w-full"
          onClick={onConfirm}
          disabled={confirming}
          aria-label="Выбрать этот сценарий и перейти к маршрутной карте"
        >
          {confirming ? 'Сохраняем…' : 'Выбрать этот сценарий'}
        </Button>
        <Button
          variant="ghost"
          size="lg"
          className="w-full"
          onClick={onBack}
          disabled={confirming}
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" aria-hidden="true" />
          Назад к списку
        </Button>
      </div>

      <DisclaimerBlock />
    </div>
  )
}
