// components/scenarios/ScenarioCard.tsx
// Single scenario card: title, probability badge, summary, related markers.
// Used on /scenarios — clicking navigates to /scenarios/[id] for detail + confirmation.

import Link from 'next/link'
import { ChevronRightIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Scenario, ScenarioProbability } from '@/types/scenario.types'

interface ScenarioCardProps {
  scenario: Scenario
}

const PROBABILITY_LABEL: Record<ScenarioProbability, string> = {
  high: 'Более вероятно',
  medium: 'Возможно',
  low: 'Менее вероятно',
}

const PROBABILITY_CLASS: Record<ScenarioProbability, string> = {
  high: 'bg-primary/10 text-primary border-primary/20',
  medium: 'bg-warning/10 text-warning border-warning/30',
  low: 'bg-muted text-muted-foreground border-border',
}

export function ScenarioCard({ scenario }: ScenarioCardProps) {
  return (
    <Link
      href={`/scenarios/${scenario.id}`}
      className="group flex flex-col gap-3 rounded-2xl border border-border bg-card px-5 py-5 shadow-sm transition-colors hover:border-primary/40 hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={`Сценарий: ${scenario.title}`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-sm font-semibold text-foreground leading-snug flex-1 text-balance">
          {scenario.title}
        </h2>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className={cn(
              'rounded-full border px-2.5 py-0.5 text-xs font-medium',
              PROBABILITY_CLASS[scenario.probability],
            )}
          >
            {PROBABILITY_LABEL[scenario.probability]}
          </span>
          <ChevronRightIcon
            className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Summary */}
      <p className="text-xs leading-relaxed text-muted-foreground text-pretty">
        {scenario.summary}
      </p>

      {/* Related markers */}
      {scenario.relatedMarkers.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {scenario.relatedMarkers.map((marker) => (
            <span
              key={marker}
              className="rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
            >
              {marker}
            </span>
          ))}
        </div>
      )}
    </Link>
  )
}
