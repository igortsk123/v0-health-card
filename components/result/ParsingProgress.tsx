// components/result/ParsingProgress.tsx
// Animated waiting screen shown while /upload/parsing polls the backend.
// Pure presentational — no data fetching here.

import { Loader2Icon } from 'lucide-react'

interface ParsingProgressProps {
  fileName?: string
}

const STEPS = [
  'Распознаём текст документа…',
  'Извлекаем показатели…',
  'Формируем информационную сводку…',
]

export function ParsingProgress({ fileName }: ParsingProgressProps) {
  return (
    <div className="flex flex-col items-center gap-6 py-16 px-4 text-center">
      <Loader2Icon
        className="h-10 w-10 animate-spin text-primary"
        aria-hidden="true"
      />

      <div className="flex flex-col gap-2">
        <p className="text-base font-semibold text-foreground">
          Анализируем ваш документ
        </p>
        {fileName && (
          <p className="text-xs text-muted-foreground truncate max-w-xs">{fileName}</p>
        )}
      </div>

      <ul className="flex flex-col gap-2 text-left w-full max-w-xs" aria-label="Этапы обработки">
        {STEPS.map((step) => (
          <li key={step} className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary/40 flex-shrink-0" aria-hidden="true" />
            {step}
          </li>
        ))}
      </ul>

      <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
        Обычно это занимает не более 30 секунд. Пожалуйста, не закрывайте страницу.
      </p>
    </div>
  )
}
