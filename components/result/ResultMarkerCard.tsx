// components/result/ResultMarkerCard.tsx
// Single marker card: name, value, reference range, status badge, informational note.
// Status coloring uses semantic tokens only — no raw colours.

import { cn } from '@/lib/utils'
import type { ResultMarker, MarkerStatus } from '@/types/result.types'

interface ResultMarkerCardProps {
  marker: ResultMarker
}

const STATUS_LABEL: Record<MarkerStatus, string> = {
  normal: 'В норме',
  elevated: 'Выше нормы',
  low: 'Ниже нормы',
  critical: 'Требует внимания',
}

const STATUS_CLASS: Record<MarkerStatus, string> = {
  normal:   'bg-success/10 text-success border-success/20',
  elevated: 'bg-warning/10 text-warning border-warning/30',
  low:      'bg-info/10 text-info border-info/20',
  critical: 'bg-destructive/10 text-destructive border-destructive/20',
}

export function ResultMarkerCard({ marker }: ResultMarkerCardProps) {
  return (
    <article
      aria-label={`Показатель: ${marker.name}`}
      className="flex flex-col gap-3 rounded-2xl border border-border bg-card px-4 py-4"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-foreground leading-snug flex-1">
          {marker.name}
        </p>
        <span
          className={cn(
            'flex-shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium',
            STATUS_CLASS[marker.status],
          )}
        >
          {STATUS_LABEL[marker.status]}
        </span>
      </div>

      {/* Value row */}
      <div className="flex items-baseline gap-2">
        <span className="text-xl font-bold text-foreground">{marker.value}</span>
        <span className="text-xs text-muted-foreground">
          референс: {marker.referenceRange}
        </span>
      </div>

      {/* Informational note */}
      <p className="text-xs leading-relaxed text-muted-foreground border-t border-border pt-3">
        {marker.note}
      </p>
    </article>
  )
}
