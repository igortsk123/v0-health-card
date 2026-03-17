// components/result/ResultSummaryBanner.tsx
// Top-level summary card on /result/free.
// Shows total markers found, free count, and analysis date.
// Informational only — no diagnostic claims.

import { CalendarIcon, FlaskConicalIcon } from 'lucide-react'

interface ResultSummaryBannerProps {
  totalMarkers: number
  freeCount: number
  analyzedAt: string // ISO 8601
}

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

export function ResultSummaryBanner({
  totalMarkers,
  freeCount,
  analyzedAt,
}: ResultSummaryBannerProps) {
  return (
    <div className="rounded-2xl border border-border bg-muted/40 px-5 py-4 flex flex-col gap-3">
      <p className="text-sm font-semibold text-foreground">Информационная сводка готова</p>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <FlaskConicalIcon className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
          <span>
            Распознано показателей: <span className="font-medium text-foreground">{totalMarkers}</span>
            {' '}/ в бесплатном просмотре:{' '}
            <span className="font-medium text-foreground">{freeCount}</span>
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <CalendarIcon className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
          <span>Дата анализа: {formatDate(analyzedAt)}</span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        Ниже представлены вероятные сценарии по каждому показателю. Все данные носят
        информационный характер — обсудите их с лечащим врачом.
      </p>
    </div>
  )
}
