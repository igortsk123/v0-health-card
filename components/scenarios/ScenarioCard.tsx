// components/scenarios/ScenarioCard.tsx
// Scenario selection card for Workstream F.
// Shows title, short description, urgency badge, confidence note, and "Подробнее" button.

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { EyeIcon, AlertTriangleIcon, AlertCircleIcon } from 'lucide-react'
import type { Scenario, UrgencyLevel } from '@/types/scenario.types'

interface ScenarioCardProps {
  scenario: Scenario
  onSelect: (id: string) => void
  selected?: boolean
}

// ---------------------------------------------------------------------------
// Urgency badge
// ---------------------------------------------------------------------------

const URGENCY_CONFIG: Record<
  Exclude<UrgencyLevel, 'none'>,
  { label: string; icon: typeof EyeIcon; className: string }
> = {
  watch: {
    label: 'Стоит обратить внимание',
    icon: EyeIcon,
    className: 'bg-warning-bg text-warning-foreground border border-warning/40',
  },
  urgent: {
    label: 'Рекомендуется консультация',
    icon: AlertCircleIcon,
    className: 'bg-destructive/10 text-destructive border border-destructive/30',
  },
}

function UrgencyBadge({ level }: { level: UrgencyLevel }) {
  if (level === 'none') return null
  const config = URGENCY_CONFIG[level]
  const Icon = config.icon
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium leading-tight',
        config.className,
      )}
    >
      <Icon className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
      {config.label}
    </span>
  )
}

// ---------------------------------------------------------------------------
// ScenarioCard
// ---------------------------------------------------------------------------

export function ScenarioCard({ scenario, onSelect, selected = false }: ScenarioCardProps) {
  return (
    <article
      aria-label={`Сценарий: ${scenario.title}`}
      className={cn(
        'flex flex-col gap-4 rounded-2xl border bg-card px-5 py-5 shadow-sm transition-all duration-200',
        selected
          ? 'border-primary ring-2 ring-primary/20'
          : 'border-border hover:border-primary/40 hover:shadow-md',
      )}
    >
      {/* Header row: title + urgency badge */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h2 className="text-base font-semibold text-foreground leading-snug text-balance">
            {scenario.title}
          </h2>
          <UrgencyBadge level={scenario.urgencyLevel} />
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
          {scenario.shortDescription}
        </p>
      </div>

      {/* Confidence note */}
      <p className="text-xs leading-relaxed text-muted-foreground/80 italic">
        {scenario.confidenceNote}
      </p>

      {/* CTA */}
      <Button
        variant="outline"
        size="sm"
        className="w-full sm:w-auto self-start"
        onClick={() => onSelect(scenario.id)}
        aria-label={`Подробнее о сценарии: ${scenario.title}`}
      >
        Подробнее
      </Button>
    </article>
  )
}
