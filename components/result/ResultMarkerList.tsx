// components/result/ResultMarkerList.tsx
// Renders the list of free ResultMarkerCards.
// Shows EmptyState when markers array is unexpectedly empty.

import { ResultMarkerCard } from './ResultMarkerCard'
import type { ResultMarker } from '@/types/result.types'
import { EmptyState } from '@/components/shared/EmptyState'

interface ResultMarkerListProps {
  markers: ResultMarker[]
}

export function ResultMarkerList({ markers }: ResultMarkerListProps) {
  if (markers.length === 0) {
    return (
      <EmptyState
        title="Показатели не найдены"
        description="Не удалось извлечь показатели из документа. Попробуйте загрузить файл повторно."
      />
    )
  }

  return (
    <section aria-label="Показатели анализа" className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-foreground">
        Показатели ({markers.length})
      </h2>
      <ul className="flex flex-col gap-3 list-none p-0">
        {markers.map((marker) => (
          <li key={marker.id}>
            <ResultMarkerCard marker={marker} />
          </li>
        ))}
      </ul>
    </section>
  )
}
